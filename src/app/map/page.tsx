"use client";
import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const Page = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const hoveredStateRef = useRef<string | number | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [popupData, setPopupData] = useState<{
    regionName: string | number;
    jumlahKecamatan: number;
    jumlahDesa: number;
    jumlahPenduduk: number;
    kepadatanPerKm2: number;
    jumlahLakiLaki: number;
    jumlahPerempuan: number;
    luasWilayahKm2: number;
  } | null>(null);
  const [populationFilter, setPopulationFilter] = useState(0);
  const [incomeFilter, setIncomeFilter] = useState<number>(4500000);

  const applyFilters = () => {
    if (!mapRef.current) return;

    const filters: maplibregl.FilterSpecification = [
      "all",
      [">=", ["get", "JUMLAH PENDUDUK 2020"], populationFilter],
      [">=", ["get", "Penghasilan rata-rata"], incomeFilter],
    ];

    mapRef.current.setFilter("jakarta_fill", filters);
    mapRef.current.setFilter("jakarta_border", filters);
  };

  const handlePopulationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPopulationFilter(Number(e.target.value));
    applyFilters();
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncomeFilter(Number(e.target.value));
    applyFilters();
  };

  const toggleLayer = () => {
    if (!mapRef.current) return;
    // Check if the layer exists before toggling
    if (!mapRef.current.getLayer("flood_heatmap")) return;
    const visibility = isVisible ? "none" : "visible";
    mapRef.current.setLayoutProperty("flood_heatmap", "visibility", visibility);
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    if (mapContainerRef.current) {
      const mapInstance = new maplibregl.Map({
        container: mapContainerRef.current,
        style:
          "https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL",
        center: [106.8456, -6.2088], // Jakarta coordinates
        zoom: 10,
      });

      mapInstance.on("load", () => {
        mapInstance.addSource("jakarta", {
          type: "geojson",
          data: "/jakarta.geojson",
          generateId: true,
        });
        mapInstance.addSource("flood", {
          type: "geojson",
          data: "/flood.geojson",
        });
        mapInstance.addSource("properties", {
          type: "geojson",
          data: "/data-properti.geojson",
        });

        mapInstance.addLayer({
          id: "jakarta_fill",
          type: "fill",
          source: "jakarta",
          layout: {},
          paint: {
            "fill-color": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              "#FF0000", // Color when hovered
              "#627BC1", // Default color
            ],
            "fill-opacity": 0.6,
          },
        });

        mapInstance.addLayer({
          id: "jakarta_border",
          type: "line",
          source: "jakarta",
          layout: {},
          paint: {
            "line-color": "#627BC1",
            "line-width": 2,
          },
        });
        mapInstance.addLayer({
          id: "flood_heatmap",
          type: "heatmap",
          source: "flood",
          maxzoom: 15,
          paint: {
            // Adjust intensity based on zoom level
            "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              1,
              15,
              3,
            ],
            // Heatmap color gradient
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(0, 0, 255, 0)", // Blue for low density
              0.2,
              "royalblue",
              0.4,
              "cyan",
              0.6,
              "limegreen",
              0.8,
              "yellow",
              1,
              "red", // Red for high density
            ],
            // Set heatmap radius based on zoom level
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              15,
              15,
              30,
            ],
            // Set heatmap opacity
            "heatmap-opacity": 0.8,
          },
        });

        // Add property points layer
        mapInstance.addLayer({
          id: "property-points",
          type: "circle",
          source: "properties",
          paint: {
            "circle-radius": 8,
            "circle-color": "#FF0000",
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff",
          },
          minzoom: 12, // Only show when zoom level is 12 or higher
          maxzoom: 20, // Maximum zoom level
        });

        // Add hover effect for property points
        mapInstance.addLayer({
          id: "property-points-hover",
          type: "circle",
          source: "properties",
          paint: {
            "circle-radius": 10,
            "circle-color": "#FF0000",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
            "circle-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              1,
              0,
            ],
          },
          minzoom: 12, // Only show when zoom level is 12 or higher
          maxzoom: 20, // Maximum zoom level
        });

        let pointsVisible = false;
        mapInstance.on("zoomend", () => {
          const currentZoom = mapInstance.getZoom();

          // Handle visibility based on zoom level
          if (currentZoom >= 12) {
            if (!pointsVisible) {
              mapInstance.setLayoutProperty(
                "property-points",
                "visibility",
                "visible"
              );
              mapInstance.setLayoutProperty(
                "property-points-hover",
                "visibility",
                "visible"
              );
              pointsVisible = true;
            }

            // Filter properties based on Jakarta region
            const coordinates = mapInstance.getCenter();
            const features = mapInstance.queryRenderedFeatures(
              [coordinates.lng, coordinates.lat],
              { layers: ["jakarta_fill"] }
            );

            if (features.length > 0) {
              const regionId = features[0].id;
              mapInstance.setFilter("property-points", [
                "==",
                ["get", "region_id"],
                regionId as string | number,
              ]);
              mapInstance.setFilter("property-points-hover", [
                "==",
                ["get", "region_id"],
                regionId as string | number,
              ]);
            } else {
              // Hide properties if not in Jakarta region
              mapInstance.setFilter("property-points", [
                "!",
                ["has", "region_id"],
              ]);
              mapInstance.setFilter("property-points-hover", [
                "!",
                ["has", "region_id"],
              ]);
            }
          } else {
            // Hide properties when zoom level is less than 12
            mapInstance.setLayoutProperty(
              "property-points",
              "visibility",
              "none"
            );
            mapInstance.setLayoutProperty(
              "property-points-hover",
              "visibility",
              "none"
            );
            mapInstance.setFilter("property-points", [
              "!",
              ["has", "region_id"],
            ]);
            mapInstance.setFilter("property-points-hover", [
              "!",
              ["has", "region_id"],
            ]);
            pointsVisible = false;
          }
        });

        mapInstance.on(
          "mousemove",
          "jakarta_fill",
          (e: maplibregl.MapMouseEvent & { features?: any[] }) => {
            if (e.features && e.features.length > 0) {
              const feature = e.features[0];
              // Check if the feature has an ID (including numeric IDs)
              const newHoveredId = feature.id;
              if (newHoveredId === undefined || newHoveredId === null) {
                console.warn("Feature does not have a valid ID:", feature);
                return;
              }

              // If a different feature is hovered, reset the previous one
              if (
                hoveredStateRef.current !== null &&
                hoveredStateRef.current !== newHoveredId
              ) {
                try {
                  mapInstance.setFeatureState(
                    { source: "jakarta", id: hoveredStateRef.current },
                    { hover: false }
                  );
                } catch (error) {
                  console.error("Error resetting feature state:", error);
                }
              }
              hoveredStateRef.current = newHoveredId;
              try {
                mapInstance.setFeatureState(
                  { source: "jakarta", id: newHoveredId },
                  { hover: true }
                );
              } catch (error) {
                console.error("Error setting feature state:", error);
              }
              mapInstance.getCanvas().style.cursor = "pointer";
            }
          }
        );

        mapInstance.on(
          "mouseleave",
          "jakarta_fill",
          (e: maplibregl.MapMouseEvent) => {
            if (hoveredStateRef.current) {
              mapInstance.setFeatureState(
                { source: "jakarta", id: hoveredStateRef.current },
                { hover: false }
              );
            }
            hoveredStateRef.current = null;
            mapInstance.getCanvas().style.cursor = "";
          }
        );

        // Add mouse interaction for property points
        mapInstance.on(
          "mousemove",
          "property-points",
          (e: maplibregl.MapMouseEvent & { features?: any[] }) => {
            if (e.features && e.features.length > 0) {
              const feature = e.features[0];
              const featureId = feature.id;
              if (featureId === undefined || featureId === null) {
                console.warn(
                  "Property feature does not have a valid ID:",
                  feature
                );
                return;
              }
              try {
                mapInstance.setFeatureState(
                  { source: "properties", id: featureId },
                  { hover: true }
                );
              } catch (error) {
                console.error("Error setting property feature state:", error);
              }
            }
          }
        );

        mapInstance.on(
          "mouseleave",
          "property-points",
          (e: maplibregl.MapMouseEvent) => {
            if (hoveredStateRef.current) {
              try {
                mapInstance.setFeatureState(
                  { source: "properties", id: hoveredStateRef.current },
                  { hover: false }
                );
              } catch (error) {
                console.error("Error resetting property feature state:", error);
              }
            }
            hoveredStateRef.current = null;
          }
        );

        // Add click event listener for Jakarta fill layer
        mapInstance.on(
          "click",
          "jakarta_fill",
          (e: maplibregl.MapMouseEvent & maplibregl.MapLayerMouseEvent) => {
            const feature = e.features![0];
            zoomToRegion(mapInstance, feature);
          }
        );

        // Add zoomend event listener to reset view
        mapInstance.on("zoomend", () => {
          const currentZoom = mapInstance.getZoom();

          // Reset to initial state when zoom level is below 12
          if (currentZoom < 12) {
            mapInstance.setLayoutProperty(
              "property-points",
              "visibility",
              "none"
            );
            mapInstance.setPaintProperty("jakarta_fill", "fill-opacity", 0.6);
            mapInstance.setPaintProperty("jakarta_fill", "fill-color", [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              "#FF0000", // Color when hovered
              "#627BC1", // Default color
            ]);
          }
        });

        mapInstance.on(
          "click",
          "jakarta_fill",
          (e: maplibregl.MapMouseEvent & { features?: any[] }) => {
            const feature = e.features?.[0];
            if (!feature) return;
            const { lng, lat } = e.lngLat;
            setPopupData({
              regionName: feature.properties.name,
              jumlahKecamatan: feature.properties["JUMLAH KECAMATAN"],
              jumlahDesa: feature.properties["JUMLAH DESA"],
              jumlahPenduduk: feature.properties["JUMLAH PENDUDUK 2020"],
              kepadatanPerKm2: feature.properties["KEPADATAN PER KM2 (2020)"],
              jumlahLakiLaki: feature.properties["JUMLAH LAKI-LAKI (2020)"],
              jumlahPerempuan: feature.properties["JUMLAH PEREMPUAN (2020)"],
              luasWilayahKm2: feature.properties["LUAS WILAYAH (KM2)"],
            });
            mapInstance.flyTo({
              center: [lng, lat],
              zoom: 15,
              essential: true,
            });
          }
        );

        mapRef.current = mapInstance;

        return () => {
          mapInstance.remove();
        };
      });
    }
  }, []);

  const zoomToRegion = (
    map: maplibregl.Map,
    feature: maplibregl.MapGeoJSONFeature
  ) => {
    // Get the bounding box of the clicked feature
    const geometry = feature.geometry;
    const coordinates = geometry as { coordinates: number[][][] };
    const bbox: [number, number, number, number] = [
      Math.min(
        ...coordinates.coordinates[0].map((coord: number[]) => coord[0])
      ),
      Math.min(
        ...coordinates.coordinates[0].map((coord: number[]) => coord[1])
      ),
      Math.max(
        ...coordinates.coordinates[0].map((coord: number[]) => coord[0])
      ),
      Math.max(
        ...coordinates.coordinates[0].map((coord: number[]) => coord[1])
      ),
    ];

    // Fit the map to the feature's bounds
    map.fitBounds(bbox, {
      padding: 20,
      maxZoom: 14,
    });

    // Update layer styles
    map.setLayoutProperty("property-points", "visibility", "visible");
    map.setPaintProperty("jakarta_fill", "fill-opacity", 0.1);
    map.setPaintProperty("jakarta_fill", "fill-color", "#627BC1");
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center p-4 bg-white">
        <button
          onClick={toggleLayer}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Toggle Flood Layer
        </button>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col">
            <label className="text-black mb-1">Population Filter</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="2000000"
                step="10000"
                value={populationFilter}
                onChange={handlePopulationChange}
                className="w-64"
              />
              <span>{populationFilter.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-black mb-1">Average Income Filter</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="4500000"
                max="6500000"
                step="100000"
                value={incomeFilter}
                onChange={handleIncomeChange}
                className="w-64"
              />
              <span>{(incomeFilter / 1000000).toLocaleString()}M</span>
            </div>
          </div>
        </div>
      </div>
      <div ref={mapContainerRef} className="flex-1" />
      {popupData && (
        <div className="absolute top-4 left-4 bg-white shadow-md p-4 rounded-md border border-gray-300 w-64 z-[3] text-gray-900">
          {Object.entries(popupData).map(([key, value]) => (
            <p key={key}>
              {key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
              :{" "}
              {typeof value === "number"
                ? value.toLocaleString("id-ID")
                : value}
            </p>
          ))}
          <button
            onClick={() => setPopupData(null)}
            className="mt-2 py-1  text-gray-900 rounded-md "
          >
            <u>
              <i>See more...</i>
            </u>
          </button>
        </div>
      )}
    </div>
  );
};

export default Page;
