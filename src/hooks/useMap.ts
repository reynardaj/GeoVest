import React, { useRef, useState, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import type {
  Map,
  MapGeoJSONFeature,
  ExpressionSpecification,
  LngLatBoundsLike,
  MapMouseEvent,
} from 'maplibre-gl';

interface InfrastructureLayer {
  id: string;
  name: string;
  iconUrl: string;
  iconId: string;
}

interface PopupData {
  regionName: string | number;
  jumlahKecamatan: number;
  jumlahDesa: number;
  jumlahPenduduk: number;
  kepadatanPerKm2: number;
  jumlahLakiLaki: number;
  jumlahPerempuan: number;
  luasWilayahKm2: number;
}

interface FeatureState {
  clicked?: boolean;
  hover?: boolean;
}

// Extracted function to handle map initialization
const initializeMap = (
  mapContainerRef: React.RefObject<HTMLDivElement | null>,
  mapRef: React.RefObject<Map | null>,
  setIsMapLoaded: (isMapLoaded: boolean) => void,
  clickedRegionIdRef: React.RefObject<string | number | undefined>,
  hoveredRegionIdRef: React.RefObject<string | number | undefined>,
  hoveredPropertyIdRef: React.RefObject<string | number | undefined>,
  setClickedRegionId: (id: string | number | undefined) => void,
  setPopupData: (data: PopupData | null) => void
) => {
  if (mapContainerRef.current && !mapRef.current) {
    const map = new maplibregl.Map({
      container: mapContainerRef.current!,
      style: 'https://api.maptiler.com/maps/streets/style.json?key=Xyghbo5YEVnVdA3iTYjo',
      center: [106.8456, -6.2088],
      zoom: 10,
    });

    mapRef.current = map;

    map.on('load', async () => {
      if (!mapRef.current) return;
      const map = mapRef.current;

      // Add Sources
      const geoJsonFiles = [
        "jakarta",
        "flood",
        "properties",
        "bandara",
        "pusat-perbelanjaan",
        "rel-kereta",
        "transjakarta",
        "rumah-sakit",
        "pendidikan",
      ];

      geoJsonFiles.forEach((fileName) => {
        if (!map.getSource(fileName)) {
          map.addSource(fileName, {
            type: "geojson",
            data: `/${fileName}.geojson`,
            generateId: true,
          });
        }
      });

      // Add Base Layers
      map.addLayer({
        id: "jakarta_fill",
        type: "fill",
        source: "jakarta",
        layout: {},
        paint: {
          "fill-color": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#FF0000",
            ["boolean", ["feature-state", "clicked"], false],
            "#ADD8E6",
            "#627BC1",
          ],
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "clicked"], false],
            0.2,
            ["boolean", ["feature-state", "hover"], false],
            0.8,
            0.6,
          ],
        },
      });

      map.addLayer({
        id: "jakarta_border",
        type: "line",
        source: "jakarta",
        layout: {},
        paint: { "line-color": "#627BC1", "line-width": 2 },
      });

      // Add Properties Layer
      map.addLayer({
        id: "properties",
        type: "circle",
        source: "properties",
        layout: { visibility: "visible" },
        paint: {
          "circle-radius": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            10,
            6,
          ],
          "circle-color": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#FF8C00",
            "#007bff",
          ],
          "circle-stroke-width": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            2,
            1,
          ],
          "circle-stroke-color": "#ffffff",
        },
      });

      // Add Flood Heatmap Layer
      map.addLayer({
        id: "flood_heatmap",
        type: "heatmap",
        source: "flood",
        maxzoom: 15,
        layout: { visibility: "visible" },
        paint: {
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            1,
            15,
            3,
          ],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0, 0, 255, 0)",
            0.2,
            "royalblue",
            0.4,
            "cyan",
            0.6,
            "limegreen",
            0.8,
            "yellow",
            1,
            "red",
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            15,
            15,
            30,
          ],
          "heatmap-opacity": 0.8,
        },
      });

      setIsMapLoaded(true);

      // Event Listeners
      map.on("click", "jakarta_fill", (e) => {
        const feature = e.features?.[0];
        if (!feature || !feature.id || !map) return;

        const clickedId = feature.id;
        const propertiesLayerId = "properties";
        e.originalEvent.preventDefault();

        if (
          map.getFeatureState({ source: "jakarta", id: clickedId })?.clicked
        ) {
          map.setFeatureState(
            { source: "jakarta", id: clickedId },
            { clicked: false }
          );
        } else {
          map.setFeatureState(
            { source: "jakarta", id: clickedId },
            { clicked: true }
          );
        }

        const props = feature.properties;
        if (props) {
          // Update popup data
        }

        zoomToRegion(map, feature);
      });

      map.on("click", "properties", (e) => {
        if (!map || !e.features || e.features.length === 0) return;
        e.originalEvent.preventDefault();

        const feature = e.features[0];
        const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice();
        const description = `<strong>${feature.properties?.property_name || "Property"}</strong><br>Category: ${feature.properties?.property_category || "N/A"}<br>Price: Rp ${feature.properties?.property_price?.toLocaleString("id-ID") || "N/A"}<br><a href="${feature.properties?.property_url || "#"}" target="_blank" rel="noopener noreferrer">Details</a>`;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new maplibregl.Popup()
          .setLngLat(coordinates as [number, number])
          .setHTML(description)
          .addTo(map);
      });

      map.on("click", (e) => {
        if (e.originalEvent.defaultPrevented) return;
        if (!map) return;

        if (map.getFeatureState({ source: "jakarta", id: clickedRegionIdRef.current })?.clicked) {
          map.setFeatureState(
            { source: "jakarta", id: clickedRegionIdRef.current },
            { clicked: false }
          );
          setClickedRegionId(undefined);
        }

        if (map.getZoom() >= 12) {
          map.setLayoutProperty("properties", "visibility", "none");
          map.setFilter("properties", null);
        }

        setPopupData(null);
      });

      map.on("mousemove", "jakarta_fill", (e) => {
        if (!map || !e.features || e.features.length === 0) return;
        const featureId = e.features[0].id;
        if (
          featureId !== undefined &&
          featureId !== hoveredRegionIdRef.current
        ) {
          if (hoveredRegionIdRef.current !== undefined)
            map.setFeatureState(
              { source: "jakarta", id: hoveredRegionIdRef.current },
              { hover: false }
            );
          hoveredRegionIdRef.current = featureId;
          map.setFeatureState(
            { source: "jakarta", id: featureId },
            { hover: true }
          );
        }
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "jakarta_fill", () => {
        if (!map) return;
        if (hoveredRegionIdRef.current !== undefined)
          map.setFeatureState(
            { source: "jakarta", id: hoveredRegionIdRef.current },
            { hover: false }
          );
        hoveredRegionIdRef.current = undefined;
        if (!hoveredPropertyIdRef.current) map.getCanvas().style.cursor = "";
      });

      map.on("mousemove", "properties", (e) => {
        if (!map || !e.features || e.features.length === 0) return;
        const featureId = e.features[0].id;
        if (
          featureId !== undefined &&
          featureId !== hoveredPropertyIdRef.current
        ) {
          if (hoveredPropertyIdRef.current !== undefined)
            map.setFeatureState(
              { source: "properties", id: hoveredPropertyIdRef.current },
              { hover: false }
            );
          hoveredPropertyIdRef.current = featureId;
          map.setFeatureState(
            { source: "properties", id: featureId },
            { hover: true }
          );
        }
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "properties", () => {
        if (!map) return;
        if (hoveredPropertyIdRef.current !== undefined)
          map.setFeatureState(
            { source: "properties", id: hoveredPropertyIdRef.current },
            { hover: false }
          );
        hoveredPropertyIdRef.current = undefined;
        if (!hoveredRegionIdRef.current) map.getCanvas().style.cursor = "";
      });

      map.on("zoomend", () => {
        if (!map) return;
        if (map.getZoom() >= 12) {
          map.setLayoutProperty("properties", "visibility", "visible");
        } else {
          map.setLayoutProperty("properties", "visibility", "none");
        }
      });

      map.on("error", (e) => {
        console.error("MapLibre Error:", e.error);
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setIsMapLoaded(false);
      }
    };
  }
};

export function useMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [popupData, setPopupData] = useState<PopupData | null>(null);
  const [clickedRegionId, setClickedRegionId] = useState<string | number | undefined>(undefined);
  const [hoveredRegionId, setHoveredRegionId] = useState<string | number | undefined>(undefined);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | number | undefined>(undefined);

  // Initialize refs
  const clickedRegionIdRef = useRef<string | number | undefined>(undefined);
  const hoveredRegionIdRef = useRef<string | number | undefined>(undefined);
  const hoveredPropertyIdRef = useRef<string | number | undefined>(undefined);

  useEffect(() => {
    initializeMap(
      mapContainerRef,
      mapRef,
      setIsMapLoaded,
      clickedRegionIdRef,
      hoveredRegionIdRef,
      hoveredPropertyIdRef,
      setClickedRegionId,
      setPopupData
    );
  }, []);

  return {
    mapContainerRef,
    mapRef,
    isMapLoaded,
    isVisible,
    popupData,
    clickedRegionId,
    hoveredRegionId,
    hoveredPropertyId,
    setIsVisible,
    setPopupData,
    setClickedRegionId,
    setHoveredRegionId,
    setHoveredPropertyId,
  };
}

// Helper function - keep as is
const zoomToRegion = (map: Map, feature: MapGeoJSONFeature) => {
  const geometry = feature.geometry;
  let bounds: LngLatBoundsLike = [-180, -90, 180, 90];

  const calculateBounds = (coords: number[][][]): LngLatBoundsLike | null => {
    if (!coords || coords.length === 0) return null;
    const flatCoords = coords.flat();
    if (flatCoords.length === 0) return null;
    const lons = flatCoords.map((c) => c[0]);
    const lats = flatCoords.map((c) => c[1]);
    if (lons.length === 0 || lats.length === 0) return null;
    return [
      Math.min(...lons),
      Math.min(...lats),
      Math.max(...lons),
      Math.max(...lats),
    ];
  };

  const calculateMultiBounds = (coords: number[][][][]): LngLatBoundsLike | null => {
    if (!coords || coords.length === 0) return null;
    const allCoords = coords.flat(2);
    if (allCoords.length === 0) return null;
    const lons = allCoords.map((c) => c[0]);
    const lats = allCoords.map((c) => c[1]);
    if (lons.length === 0 || lats.length === 0) return null;
    return [
      Math.min(...lons),
      Math.min(...lats),
      Math.max(...lons),
      Math.max(...lats),
    ];
  };

  if (geometry.type === "Polygon") {
    const calculated = calculateBounds(geometry.coordinates);
    if (calculated) bounds = calculated;
  } else if (geometry.type === "MultiPolygon") {
    const calculated = calculateMultiBounds(geometry.coordinates);
    if (calculated) bounds = calculated;
  }

  const validBounds =
    Array.isArray(bounds) &&
    bounds.length === 4 &&
    bounds.every((b) => isFinite(b)) &&
    bounds[0] <= bounds[2] &&
    bounds[1] <= bounds[3];

  if (validBounds) {
    map.fitBounds(bounds, { padding: 40, maxZoom: 15, essential: true });
  }
};