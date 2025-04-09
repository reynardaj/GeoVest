/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import type {
  Map,
  MapGeoJSONFeature,
  FilterSpecification,
  ExpressionSpecification,
  LngLatBoundsLike,
  MapMouseEvent,
} from "maplibre-gl"; // Added MapMouseEvent
import "maplibre-gl/dist/maplibre-gl.css";
import { Range } from "react-range";

// Define the structure for popup data for clarity
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

const Page = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const hoveredRegionIdRef = useRef<string | number | null>(null);
  const hoveredPropertyIdRef = useRef<string | number | null>(null);

  // State
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // Heatmap
  const [popupData, setPopupData] = useState<PopupData | null>(null);
  const [priceRange, setPriceRange] = useState([0, 10000000000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [clickedRegionId, setClickedRegionId] = useState<
    string | number | null
  >(null); // State for clicked region

  // Refs to hold latest state for use in listeners
  const priceRangeRef = useRef(priceRange);
  const selectedCategoriesRef = useRef(selectedCategories);
  const clickedRegionIdRef = useRef(clickedRegionId); // Ref for clicked region ID

  // Keep refs updated
  useEffect(() => {
    priceRangeRef.current = priceRange;
  }, [priceRange]);
  useEffect(() => {
    selectedCategoriesRef.current = selectedCategories;
  }, [selectedCategories]);
  useEffect(() => {
    clickedRegionIdRef.current = clickedRegionId;
  }, [clickedRegionId]); // Keep clickedRegionIdRef updated

  const propertyCategories = [
    "Apartemen",
    "Ruko",
    "Rumah",
    "Gedung",
    "Gudang",
    "Kos",
  ];

  // --- Map Initialization and Static Listener Setup ---
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = new maplibregl.Map({
        /* ... map options ... */ container: mapContainerRef.current,
        style:
          "https://api.maptiler.com/maps/streets/style.json?key=Xyghbo5YEVnVdA3iTYjo",
        center: [106.8456, -6.2088],
        zoom: 10,
      });
      mapRef.current = map;

      map.on("load", () => {
        if (!mapRef.current) return;

        // Add Sources (same as before)
        mapRef.current.addSource("jakarta", {
          type: "geojson",
          data: "/jakarta.geojson",
          generateId: true,
        });
        mapRef.current.addSource("flood", {
          type: "geojson",
          data: "/flood.geojson",
        });
        mapRef.current.addSource("properties", {
          type: "geojson",
          data: "/data-properti.geojson",
          generateId: true,
        });

        // --- Add Layers ---
        mapRef.current.addLayer({
          id: "jakarta_fill",
          type: "fill",
          source: "jakarta",
          layout: {},
          paint: {
            "fill-color": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              "#FF0000", // Hover color red
              "#627BC1", // Default color blue
            ],
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "clicked"], false],
              0.05, // <<< NEARLY TRANSPARENT IF CLICKED
              ["boolean", ["feature-state", "hover"], false],
              0.8, // Hover opacity
              0.6, // Default opacity
            ],
          },
        });
        mapRef.current.addLayer({
          id: "jakarta_border",
          type: "line",
          source: "jakarta",
          layout: {},
          paint: { "line-color": "#627BC1", "line-width": 2 },
        });
        mapRef.current.addLayer({
          id: "properties",
          type: "circle",
          source: "properties",
          layout: { visibility: "none" },
          paint: {
            /* ... properties paint ... */ "circle-radius": [
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
        mapRef.current.addLayer({
          id: "flood_heatmap",
          type: "heatmap",
          source: "flood",
          maxzoom: 15,
          layout: { visibility: isVisible ? "visible" : "none" },
          paint: {
            /* ... heatmap paint ... */ "heatmap-intensity": [
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

        // --- Event Listeners ---

        // --- ZoomEnd Listener ---
        // Handles hiding/showing properties based on zoom and resetting clicked state
        mapRef.current.on("zoomend", () => {
          if (!mapRef.current) return;
          const currentZoom = mapRef.current.getZoom();
          const propertiesLayerId = "properties";

          if (currentZoom < 12) {
            // --- Zoomed OUT ---
            // Hide properties
            mapRef.current.setLayoutProperty(
              propertiesLayerId,
              "visibility",
              "none"
            );
            mapRef.current.setFilter(propertiesLayerId, null); // Clear filter

            // Reset clicked region state if one was clicked
            if (clickedRegionIdRef.current !== null) {
              mapRef.current.setFeatureState(
                { source: "jakarta", id: clickedRegionIdRef.current },
                { clicked: false }
              );
              setClickedRegionId(null); // Update state (will also update ref)
            }
          } else {
            // --- Zoomed IN or Panning ---
            // Only filter based on center IF NO region is currently clicked
            if (clickedRegionIdRef.current === null) {
              const centerPoint = mapRef.current.project(
                mapRef.current.getCenter()
              );
              const features = mapRef.current.queryRenderedFeatures(
                centerPoint,
                { layers: ["jakarta_fill"] }
              );

              let filterConditions: ExpressionSpecification[] = [
                [">=", ["get", "property_price"], priceRangeRef.current[0]],
                ["<=", ["get", "property_price"], priceRangeRef.current[1]],
              ];
              if (selectedCategoriesRef.current.length > 0) {
                filterConditions.push([
                  "in",
                  ["get", "property_category"],
                  ...selectedCategoriesRef.current.map((c) => ["literal", c]),
                ]);
              }

              if (features.length > 0 && features[0].id !== undefined) {
                filterConditions.push([
                  "==",
                  ["get", "region_id"],
                  features[0].id,
                ]);
              } else {
                filterConditions.push([
                  "==",
                  ["get", "region_id"],
                  "__NO_REGION_FOUND__",
                ]);
              }

              mapRef.current.setFilter(propertiesLayerId, [
                "all",
                ...filterConditions,
              ]);
              mapRef.current.setLayoutProperty(
                propertiesLayerId,
                "visibility",
                "visible"
              );
            }
            // Else: A region IS clicked, so we DON'T modify the properties filter/visibility here.
            // The click handler already set it, and it should persist.
          }
        });

        // --- Region Click Listener ---
        mapRef.current.on(
          "click",
          "jakarta_fill",
          (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
            const feature = e.features?.[0];
            if (!feature || !feature.id || !mapRef.current) return;

            const clickedId = feature.id;
            const propertiesLayerId = "properties";

            // Prevent background click from immediately resetting
            e.originalEvent.preventDefault(); // Mark event as handled

            // Reset previous clicked state if different region
            if (
              clickedRegionIdRef.current !== null &&
              clickedRegionIdRef.current !== clickedId
            ) {
              mapRef.current.setFeatureState(
                { source: "jakarta", id: clickedRegionIdRef.current },
                { clicked: false }
              );
            }

            // Set new clicked state
            mapRef.current.setFeatureState(
              { source: "jakarta", id: clickedId },
              { clicked: true }
            );
            setClickedRegionId(clickedId); // Update state

            // --- Immediately filter and show properties for the CLICKED region ---
            let filterConditions: ExpressionSpecification[] = [
              [">=", ["get", "property_price"], priceRangeRef.current[0]],
              ["<=", ["get", "property_price"], priceRangeRef.current[1]],
            ];
            if (selectedCategoriesRef.current.length > 0) {
              filterConditions.push([
                "in",
                ["get", "property_category"],
                ...selectedCategoriesRef.current.map((c) => ["literal", c]),
              ]);
            }
            // IMPORTANT: Filter by the specifically clicked region ID
            filterConditions.push(["==", ["get", "region_id"], clickedId]);

            mapRef.current.setFilter(propertiesLayerId, [
              "all",
              ...filterConditions,
            ]);
            mapRef.current.setLayoutProperty(
              propertiesLayerId,
              "visibility",
              "visible"
            );
            // --- End Immediate Filter ---

            // Update sidebar popup (optional, maybe keep this delayed)
            // setPopupData(null); // Maybe clear immediately?
            // setTimeout(() => { setPopupData({ /* ... extract properties ... */ regionName: feature.properties!.name ?? "N/A", /* ... */ }); }, 300);
            // For this example, let's remove the popup update on simple click to focus on transparency/visibility
            setPopupData(null);

            // Zoom to the region
            zoomToRegion(mapRef.current, feature);
          }
        );

        // --- Properties Click Listener --- (Add stop propagation)
        mapRef.current.on("click", "properties", (e) => {
          if (!mapRef.current || !e.features || e.features.length === 0) return;
          // Prevent the background click handler from firing
          e.originalEvent.preventDefault(); // Mark event as handled

          const feature = e.features[0];
          const coordinates = (
            feature.geometry as GeoJSON.Point
          ).coordinates.slice();
          const description = `<strong>${
            feature.properties?.property_name || "Property"
          }</strong><br>Category: ${
            feature.properties?.property_category || "N/A"
          }<br>Price: Rp ${
            feature.properties?.property_price?.toLocaleString("id-ID") || "N/A"
          }<br><a href="${
            feature.properties?.property_url || "#"
          }" target="_blank" rel="noopener noreferrer">Details</a>`;
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }
          new maplibregl.Popup()
            .setLngLat(coordinates as [number, number])
            .setHTML(description)
            .addTo(mapRef.current);
        });

        // --- Background Click Listener ---
        // Resets clicked state if user clicks outside regions/properties
        mapRef.current.on("click", (e) => {
          // If the click event was already handled (by region or property click), do nothing
          if (e.originalEvent.defaultPrevented) {
            return;
          }

          if (!mapRef.current) return;
          const propertiesLayerId = "properties";

          // Reset clicked region state if one was clicked
          if (clickedRegionIdRef.current !== null) {
            mapRef.current.setFeatureState(
              { source: "jakarta", id: clickedRegionIdRef.current },
              { clicked: false }
            );
            setClickedRegionId(null); // Update state
          }

          // Hide properties and clear filter on background click
          // (Only if zoom is >= 12, otherwise zoomend handles it)
          if (mapRef.current.getZoom() >= 12) {
            mapRef.current.setLayoutProperty(
              propertiesLayerId,
              "visibility",
              "none"
            );
            mapRef.current.setFilter(propertiesLayerId, null); // Clear filter
          }
          setPopupData(null); // Close sidebar info too
        });

        // Other listeners (mousemove, mouseleave) remain the same...
        // ... (mousemove/mouseleave listeners from previous version) ...
        mapRef.current.on("mousemove", "jakarta_fill", (e) => {
          /* ... */ if (
            !mapRef.current ||
            !e.features ||
            e.features.length === 0
          )
            return;
          const featureId = e.features[0].id;
          if (
            featureId !== undefined &&
            featureId !== hoveredRegionIdRef.current
          ) {
            if (hoveredRegionIdRef.current !== null)
              mapRef.current.setFeatureState(
                { source: "jakarta", id: hoveredRegionIdRef.current },
                { hover: false }
              );
            hoveredRegionIdRef.current = featureId;
            mapRef.current.setFeatureState(
              { source: "jakarta", id: featureId },
              { hover: true }
            );
          }
          mapRef.current.getCanvas().style.cursor = "pointer";
        });
        mapRef.current.on("mouseleave", "jakarta_fill", () => {
          /* ... */ if (!mapRef.current) return;
          if (hoveredRegionIdRef.current !== null)
            mapRef.current.setFeatureState(
              { source: "jakarta", id: hoveredRegionIdRef.current },
              { hover: false }
            );
          hoveredRegionIdRef.current = null;
          if (!hoveredPropertyIdRef.current)
            mapRef.current.getCanvas().style.cursor = "";
        });
        mapRef.current.on("mousemove", "properties", (e) => {
          /* ... */ if (
            !mapRef.current ||
            !e.features ||
            e.features.length === 0
          )
            return;
          const featureId = e.features[0].id;
          if (
            featureId !== undefined &&
            featureId !== hoveredPropertyIdRef.current
          ) {
            if (hoveredPropertyIdRef.current !== null)
              mapRef.current.setFeatureState(
                { source: "properties", id: hoveredPropertyIdRef.current },
                { hover: false }
              );
            hoveredPropertyIdRef.current = featureId;
            mapRef.current.setFeatureState(
              { source: "properties", id: featureId },
              { hover: true }
            );
          }
          mapRef.current.getCanvas().style.cursor = "pointer";
        });
        mapRef.current.on("mouseleave", "properties", () => {
          /* ... */ if (!mapRef.current) return;
          if (hoveredPropertyIdRef.current !== null)
            mapRef.current.setFeatureState(
              { source: "properties", id: hoveredPropertyIdRef.current },
              { hover: false }
            );
          hoveredPropertyIdRef.current = null;
          if (!hoveredRegionIdRef.current)
            mapRef.current.getCanvas().style.cursor = "";
        });

        // Trigger initial zoom logic once map is ready
        mapRef.current.fire("zoomend");
      }); // End map.on("load")

      map.on("error", (e) => {
        console.error("MapLibre Error:", e.error);
      });
    } // End if map needs creation

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setIsMapLoaded(false);
      }
    };
  }, []); // Runs once on mount

  // Effect for Applying Filters When State Changes (re-triggers zoomend)
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    mapRef.current.fire("zoomend");
  }, [priceRange, selectedCategories, isMapLoaded]);

  // Effect for Toggling Heatmap Layer
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    const layerId = "flood_heatmap";
    if (mapRef.current.getLayer(layerId)) {
      mapRef.current.setLayoutProperty(
        layerId,
        "visibility",
        isVisible ? "visible" : "none"
      );
    }
  }, [isVisible, isMapLoaded]);

  // --- Event Handlers for Controls ---
  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
  };
  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };
  const toggleLayer = () => {
    setIsVisible((v) => !v);
  };

  // --- Helper Function: Zoom to Region --- (No changes needed)
  const zoomToRegion = (map: Map, feature: MapGeoJSONFeature) => {
    /* ... same as before ... */ const geometry = feature.geometry;
    let bounds: LngLatBoundsLike = [-180, -90, 180, 90];
    if (geometry.type === "Polygon") {
      const coords = geometry.coordinates[0];
      if (coords?.length) {
        const lons = coords.map((c) => c[0]);
        const lats = coords.map((c) => c[1]);
        bounds = [
          Math.min(...lons),
          Math.min(...lats),
          Math.max(...lons),
          Math.max(...lats),
        ];
      }
    } else if (geometry.type === "MultiPolygon") {
      const allCoords = geometry.coordinates.flat(2);
      if (allCoords?.length) {
        const lons = allCoords.map((c) => c[0]);
        const lats = allCoords.map((c) => c[1]);
        bounds = [
          Math.min(...lons),
          Math.min(...lats),
          Math.max(...lons),
          Math.max(...lats),
        ];
      }
    } else {
      console.warn("Unsupported geometry for bbox:", geometry.type);
    }
    const validBounds =
      Array.isArray(bounds) &&
      bounds.length === 4 &&
      bounds.every((b) => isFinite(b)) &&
      bounds[0] <= bounds[2] &&
      bounds[1] <= bounds[3];
    if (validBounds) {
      map.fitBounds(bounds, { padding: 40, maxZoom: 15, essential: true });
    } else {
      console.warn("Invalid bounds for feature");
    }
  };

  // --- JSX Structure --- (No changes needed)
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Map Container */}
      <div className="flex-1 relative">
        <div
          ref={mapContainerRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
      {/* Sidebar */}
      <div className="w-80 bg-white p-4 border-l overflow-y-auto">
        {/* Filter Section ... */}
        <div className="mb-4">
          {" "}
          <h2 className="text-lg font-bold mb-2 text-gray-800">
            Filter Properti
          </h2>{" "}
          <div className="mb-4">
            {" "}
            <h3 className="font-semibold mb-2 text-gray-700">
              Jenis Properti
            </h3>{" "}
            <div className="space-y-1">
              {" "}
              {propertyCategories.map((category) => (
                <label
                  key={category}
                  className="flex items-center space-x-2 text-sm text-gray-600"
                >
                  {" "}
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />{" "}
                  <span>{category}</span>{" "}
                </label>
              ))}{" "}
            </div>{" "}
          </div>{" "}
          <div className="mb-4">
            {" "}
            <h3 className="font-semibold mb-2 text-gray-700">Harga</h3>{" "}
            <Range
              values={priceRange}
              step={10000000}
              min={0}
              max={10000000000}
              onChange={handlePriceChange}
              renderTrack={({ props, children }) => (
                <div
                  onMouseDown={props.onMouseDown}
                  onTouchStart={props.onTouchStart}
                  style={{
                    ...props.style,
                    height: "6px",
                    width: "100%",
                    display: "flex",
                  }}
                  className="bg-gray-200 rounded-full"
                >
                  {" "}
                  <div
                    ref={props.ref}
                    style={{
                      height: "6px",
                      width: "100%",
                      borderRadius: "3px",
                      background: `linear-gradient(to right, #ccc ${
                        (priceRange[0] / 10000000000) * 100
                      }%, #3b82f6 ${
                        (priceRange[0] / 10000000000) * 100
                      }%, #3b82f6 ${
                        (priceRange[1] / 10000000000) * 100
                      }%, #ccc ${(priceRange[1] / 10000000000) * 100}%)`,
                      alignSelf: "center",
                    }}
                  >
                    {" "}
                    {children}{" "}
                  </div>{" "}
                </div>
              )}
              renderThumb={({ props, isDragged }) => (
                <div
                  {...props}
                  style={{ ...props.style }}
                  className={`w-4 h-4 bg-blue-500 rounded-full shadow-md cursor-grab ${
                    isDragged ? "bg-blue-600" : ""
                  } focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2`}
                />
              )}
            />{" "}
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
              {" "}
              <span>Rp {priceRange[0].toLocaleString("id-ID")}</span>{" "}
              <span>Rp {priceRange[1].toLocaleString("id-ID")}</span>{" "}
            </div>{" "}
          </div>{" "}
        </div>
        {/* Layer Toggle ... */}
        <div className="mb-4">
          {" "}
          <h3 className="font-semibold mb-2 text-gray-700">Layer Data</h3>{" "}
          <label className="flex items-center space-x-2 text-sm text-gray-600">
            {" "}
            <input
              type="checkbox"
              checked={isVisible}
              onChange={toggleLayer}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />{" "}
            <span>Tampilkan Peta Banjir</span>{" "}
          </label>{" "}
        </div>
        {/* Region Info Display ... */}
        {popupData && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md shadow">
            {" "}
            <h3 className="text-base font-semibold mb-2 text-blue-800">
              {popupData.regionName}
            </h3>{" "}
            <div className="text-xs space-y-1 text-gray-700">
              {" "}
              <p>
                Kecamatan: {popupData.jumlahKecamatan.toLocaleString("id-ID")}
              </p>{" "}
              <p>Desa/Kel: {popupData.jumlahDesa.toLocaleString("id-ID")}</p>{" "}
              <p>
                Penduduk: {popupData.jumlahPenduduk.toLocaleString("id-ID")}
              </p>{" "}
              <p>
                Kepadatan: {popupData.kepadatanPerKm2.toLocaleString("id-ID")}{" "}
                /km²
              </p>{" "}
              <p>
                Luas: {popupData.luasWilayahKm2.toLocaleString("id-ID")} km²
              </p>{" "}
            </div>{" "}
            <button
              onClick={() => setPopupData(null)}
              className="mt-3 text-xs text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
            >
              {" "}
              Tutup Info{" "}
            </button>{" "}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
