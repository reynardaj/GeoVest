// src/hooks/map/useMapLayers.ts
import { useEffect, useCallback, useRef } from "react";
import type {
  Map,
  ExpressionSpecification,
  GetResourceResponse,
} from "maplibre-gl";
import type { InfrastructureLayer, MapLayerControls } from "@/types/map";
import {
  GEOJSON_SOURCES,
  INFRASTRUCTURE_LAYERS,
  JAKARTA_FILL_LAYER_ID,
  JAKARTA_BORDER_LAYER_ID,
  PROPERTIES_LAYER_ID,
  FLOOD_HEATMAP_LAYER_ID,
  RAIL_LINE_LAYER_ID,
  BUS_LINE_LAYER_ID,
  AGE_FILL_LAYER_ID,
  CLUSTER_MAX_ZOOM,
  CLUSTER_RADIUS,
} from "@/config/mapConstants";
const RELIGION_FILL_LAYER_ID = "religion-fill";
// Helper to load images asynchronously
const loadMapImage = async (
  map: Map,
  id: string,
  url: string
): Promise<void> => {
  try {
    const response = await map.loadImage(url);
    const image = response.data;
    if (image && !map.hasImage(id)) {
      map.addImage(id, image);
    }
  } catch (error) {
    console.error(`Failed to load image ${url}:`, error);
    throw error;
  }
};

export function useMapLayers(
  map: Map | null,
  isLoaded: boolean, // Pass map load status from useMapInitialization
  layerControls: MapLayerControls // Pass state for filters/visibility
) {
  const layerControlsRef = useRef(layerControls);

  // Keep ref updated with the latest controls without causing effect re-runs needlessly
  useEffect(() => {
    layerControlsRef.current = layerControls;
  }, [layerControls]);

  // Effect for adding initial sources and layers ONCE after map loads
  useEffect(() => {
    if (!map || !isLoaded) return; // Ensure map is valid and loaded

    let isMounted = true; // Flag to prevent updates after unmount in async operations

    const setupLayers = async () => {
      // --- Add Sources ---
      const sources = [...GEOJSON_SOURCES, "demografi-jakarta"];
      GEOJSON_SOURCES.forEach((fileName) => {
        if (!map.getSource(fileName)) {
          // Check if this source corresponds to a point-based infrastructure layer
          const infraLayerConfig = INFRASTRUCTURE_LAYERS.find(
            (l) => l.id === fileName && l.layerType !== "line" // Ensure it's a point layer
          );
          // ---- START DEBUG LOGGING ----
          console.log(`Processing source: ${fileName}`);
          if (infraLayerConfig) {
            console.log(
              `  Applying clustering for ${fileName}. Layer type: ${infraLayerConfig.layerType}`
            );
          } else {
            // Check if it's a line layer that should NOT have clustering
            const isLineLayer = INFRASTRUCTURE_LAYERS.find(
              (l) => l.id === fileName && l.layerType === "line"
            );
            if (isLineLayer) {
              console.log(
                `  Skipping clustering for ${fileName} (Line Layer).`
              );
            } else if (
              fileName.includes("demografi") ||
              fileName.includes("jakarta")
            ) {
              console.log(
                `  Skipping clustering for ${fileName} (Likely Polygon/Base Layer).`
              );
            } else {
              // This case is important: a GEOJSON_SOURCE that ISN'T in INFRASTRUCTURE_LAYERS
              // or doesn't have a layerType. Could it be one of these?
              console.warn(
                `  Skipping clustering for ${fileName} (Not found as point infra layer or type mismatch).`
              );
            }
          }
          // ---- END DEBUG LOGGING ----
          const sourceOptions: maplibregl.GeoJSONSourceSpecification = {
            type: "geojson",
            data: `/${
              fileName === "demografi-jakarta"
                ? "demografi-jakarta-with-bins"
                : fileName
            }.geojson`,
            generateId: true,
          };

          if (infraLayerConfig) {
            sourceOptions.cluster = true;
            sourceOptions.clusterMaxZoom = CLUSTER_MAX_ZOOM;
            sourceOptions.clusterRadius = CLUSTER_RADIUS;
          }

          map.addSource(fileName, sourceOptions);
        }
      });
      // --- Add Jakarta Flood Hazard Source ---
      if (!map.getSource("jakarta-flood-hazard")) {
        map.addSource("jakarta-flood-hazard", {
          type: "geojson",
          data: "/jakarta_flood_hazard_zones.geojson",
          generateId: true,
        });
      }

      // --- Add Base Layers (Jakarta Fill/Border) ---
      if (!map.getLayer(JAKARTA_FILL_LAYER_ID)) {
        map.addLayer({
          id: JAKARTA_FILL_LAYER_ID,
          type: "fill",
          source: "jakarta",
          paint: {
            "fill-color": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              "#9cdfb4", // Hover color
              ["boolean", ["feature-state", "clicked"], false],
              "#959f8d", // Clicked color
              "#959f8d", // Default color
            ],
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "clicked"], false],
              0.2, // Clicked opacity
              ["boolean", ["feature-state", "hover"], false],
              0.1, // Hover opacity
              0.1, // Default opacity
            ],
          },
        });
      }
      if (!map.getLayer(JAKARTA_BORDER_LAYER_ID)) {
        map.addLayer({
          id: JAKARTA_BORDER_LAYER_ID,
          type: "line",
          source: "jakarta",
          paint: { "line-color": "#917776", "line-width": 2 },
        });
      }

      // --- Load Icons & Add Infrastructure Layers ---
      try {
        const loadImagePromises = INFRASTRUCTURE_LAYERS.map(
          (layer) =>
            // Only load icons for symbol layers that will use them
            layer.layerType !== "line"
              ? loadMapImage(map, layer.iconId, layer.iconUrl)
              : Promise.resolve() // No icon needed for line layers in this context
        );
        await Promise.all(loadImagePromises);

        if (!isMounted) return;

        INFRASTRUCTURE_LAYERS.forEach((layer) => {
          const isVisible =
            layerControlsRef.current.infrastructureVisibility?.[layer.id] ??
            false;
          const visibilityValue = isVisible ? "visible" : "none";

          if (layer.layerType === "line") {
            // --- LINE LAYERS (No change here for clustering) ---
            const lineLayerId =
              layer.id === "rel-kereta"
                ? RAIL_LINE_LAYER_ID
                : BUS_LINE_LAYER_ID;
            if (!map.getLayer(lineLayerId)) {
              map.addLayer({
                id: lineLayerId,
                type: "line",
                source: layer.id,
                layout: { visibility: visibilityValue },
                paint:
                  layer.id === "rel-kereta"
                    ? {
                        "line-color": "#72A324",
                        "line-width": 2,
                        "line-opacity": 0.7,
                      }
                    : {
                        "line-color": "#0000ff",
                        "line-width": 1,
                        "line-opacity": 0.7,
                      },
              });
            }
          } else {
            // --- POINT LAYERS (Symbols) - Apply Clustering ---
            const sourceId = layer.id; // Source ID is the layer.id

            // 1. Layer for CLUSTER CIRCLES
            const clusterLayerId = `${layer.id}-clusters`;
            if (!map.getLayer(clusterLayerId)) {
              map.addLayer({
                id: clusterLayerId,
                type: "circle",
                source: sourceId,
                filter: ["has", "point_count"], // Only apply to features that are clusters
                layout: {
                  visibility: visibilityValue,
                },
                paint: {
                  // Use step expressions to style clusters based on point_count
                  // Example: make larger clusters for more points
                  "circle-color": [
                    "step",
                    ["get", "point_count"],
                    "#51bbd6", // Default color for < 100 points
                    100,
                    "#f1f075", // Color for 100-750 points
                    750,
                    "#f28cb1", // Color for >= 750 points
                  ],
                  "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    20, // Default radius for < 100 points
                    100,
                    30, // Radius for 100-750 points
                    750,
                    40, // Radius for >= 750 points
                  ],
                  "circle-opacity": 0.8,
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#fff",
                },
              });
            }

            // 2. Layer for CLUSTER COUNT TEXT
            const clusterCountLayerId = `${layer.id}-cluster-count`;
            if (!map.getLayer(clusterCountLayerId)) {
              map.addLayer({
                id: clusterCountLayerId,
                type: "symbol",
                source: sourceId,
                filter: ["has", "point_count"], // Only apply to features that are clusters
                layout: {
                  "text-field": "{point_count_abbreviated}", // Shows abbreviated count (e.g., 1.2k)
                  // Or use "{point_count}" for the full number
                  "text-font": ["Noto Sans Bold"],
                  "text-size": 12,
                  visibility: visibilityValue,
                },
                paint: {
                  "text-color": "#ffffff", // White text for good contrast on colored circles
                },
              });
            }

            // 3. Layer for UNCLUSTERED POINTS (Individual Icons)
            const unclusteredPointLayerId = layer.id; // Keep original ID for unclustered
            if (!map.getLayer(unclusteredPointLayerId)) {
              map.addLayer({
                id: unclusteredPointLayerId, // Original layer ID
                type: "symbol",
                source: sourceId,
                filter: ["!", ["has", "point_count"]], // Only apply to individual points
                layout: {
                  "icon-image": layer.iconId,
                  "icon-size": 0.4,
                  "icon-allow-overlap": true, // Consider setting to false if too cluttered when zoomed in
                  "text-field": ["get", "NAMOBJ"], // Or your property for the name
                  "text-font": ["Noto Sans Regular"],
                  "text-size": 12,
                  "text-offset": [1, 0],
                  "text-anchor": "left",
                  "text-allow-overlap": false, // Usually false for individual points
                  visibility: visibilityValue,
                },
                paint: {
                  "text-color": "#000000",
                  "text-opacity": [
                    "step",
                    ["zoom"],
                    0,
                    CLUSTER_MAX_ZOOM + 0.5,
                    1,
                  ], // Show text when zoomed beyond clusterMaxZoom
                },
              });
            }
          }
        });
      } catch (error) {
        console.error("Error loading infrastructure icons/layers:", error);
      }

      // --- Add Properties Layer ---
      if (!map.getLayer(PROPERTIES_LAYER_ID)) {
        map.addLayer({
          id: PROPERTIES_LAYER_ID,
          type: "circle",
          source: "properties",
          layout: { visibility: "visible" },
          minzoom: 11,
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
              "#959f8d",
              "#959f8d",
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
        // Apply initial filter after layer is added
        applyPropertiesFilter(map, layerControlsRef.current);
      }

      // --- Add or Remove Jakarta Flood Hazard Fill Layer ---
      const floodLayerId = "jakarta-flood-hazard-fill";
      const floodLayerExists = map.getLayer(floodLayerId);
      const propertiesLayerId = "properties";
      // Ensure the source always exists before adding the layer
      if (!map.getSource("jakarta-flood-hazard")) {
        map.addSource("jakarta-flood-hazard", {
          type: "geojson",
          data: "/jakarta_flood_hazard_zones.geojson",
          generateId: true,
        });
      }

      if (layerControls.floodVisible) {
        if (!floodLayerExists) {
          try {
            map.addLayer(
              {
                id: floodLayerId,
                type: "fill",
                source: "jakarta-flood-hazard",
                paint: {
                  "fill-color": [
                    "interpolate",
                    ["linear"],
                    ["get", "hazard_score"],
                    1,
                    "#00FF00", // Green (Lowest Hazard)
                    2,
                    "#ADFF2F", // Yellow-Green (Low-Medium Hazard)
                    3,
                    "#FFFF00", // Yellow (Medium Hazard)
                    4,
                    "#FFA500", // Orange (Medium-High Hazard)
                    5,
                    "#FF0000", // Red (Highest Hazard)
                  ],
                  "fill-opacity": 0.15,
                },
                layout: { visibility: "visible" },
              },
              propertiesLayerId
            ); // Insert below property points for correct stacking
            console.log("Flood hazard layer added");
          } catch (e) {
            console.error("Failed to add flood hazard layer:", e);
          }
        } else {
          try {
            map.setLayoutProperty(floodLayerId, "visibility", "visible");
            console.log("Flood hazard layer set to visible");
          } catch (e) {
            console.error("Failed to set flood hazard layer visible:", e);
          }
        }
      } else {
        if (floodLayerExists) {
          try {
            map.removeLayer(floodLayerId);
            console.log("Flood hazard layer removed");
          } catch (e) {
            console.error("Failed to remove flood hazard layer:", e);
          }
        }
      }

      // --- End of Jakarta Flood Hazard Implementation ---
    };

    setupLayers();

    return () => {
      isMounted = false;
    };
  }, [map, isLoaded, layerControls]);

  // --- Effect for region popup close (on seemore click) ---
  useEffect(() => {
    if (!map || !isLoaded || layerControls.regionPopupVisibility) return;
    for (let i = 0; i < [0, 1, 2, 3, 4].length; i++) {
      map.setFeatureState({ source: "jakarta", id: i }, { clicked: false });
    }
  }, [map, isLoaded, layerControls.regionPopupVisibility]);

  // --- Effect for Income filter on jakarta-fill layer ---
  useEffect(() => {
    console.log(
      "income:",
      layerControls.income[0] * 1000000,
      layerControls.income[1] * 1000000
    );

    if (!map || !map.getLayer(JAKARTA_FILL_LAYER_ID)) return;
    map.setFilter(JAKARTA_FILL_LAYER_ID, [
      "all",
      [
        ">=",
        ["get", "Penghasilan rata-rata"],
        layerControls.income[0] * 1000000,
      ],
      [
        "<=",
        ["get", "Penghasilan rata-rata"],
        layerControls.income[1] * 1000000,
      ],
    ]);
  }, [isLoaded, layerControls.income, map]);
  // --- Effect for Toggling Heatmap Visibility ---
  useEffect(() => {
    if (!map || !isLoaded || !map.getLayer(FLOOD_HEATMAP_LAYER_ID)) return;

    const targetVisibility = layerControls.floodVisible ? "visible" : "none";
    // Only update if the desired state is different from the current state
    if (
      map.getLayoutProperty(FLOOD_HEATMAP_LAYER_ID, "visibility") !==
      targetVisibility
    ) {
      map.setLayoutProperty(
        FLOOD_HEATMAP_LAYER_ID,
        "visibility",
        targetVisibility
      );
    }
  }, [map, isLoaded, layerControls.floodVisible]);

  // --- Effect for Toggling Infrastructure Visibility ---
  // --- Effect for Toggling Infrastructure Visibility ---
  useEffect(() => {
    if (!map || !isLoaded || !layerControls.infrastructureVisibility) return;
    const visibilityState = layerControls.infrastructureVisibility;

    INFRASTRUCTURE_LAYERS.forEach((layer) => {
      const targetVisibility = visibilityState[layer.id] ? "visible" : "none";

      if (layer.layerType === "line") {
        const mapLayerId =
          layer.id === "rel-kereta" ? RAIL_LINE_LAYER_ID : BUS_LINE_LAYER_ID;
        if (map.getLayer(mapLayerId)) {
          if (
            map.getLayoutProperty(mapLayerId, "visibility") !== targetVisibility
          ) {
            map.setLayoutProperty(mapLayerId, "visibility", targetVisibility);
          }
        }
      } else {
        // Point-based layers now have three associated layers
        const clusterLayerId = `${layer.id}-clusters`;
        const clusterCountLayerId = `${layer.id}-cluster-count`;
        const unclusteredPointLayerId = layer.id; // Original ID for unclustered points

        [clusterLayerId, clusterCountLayerId, unclusteredPointLayerId].forEach(
          (id) => {
            if (map.getLayer(id)) {
              if (
                map.getLayoutProperty(id, "visibility") !== targetVisibility
              ) {
                map.setLayoutProperty(id, "visibility", targetVisibility);
              }
            }
          }
        );
      }
    });
  }, [map, isLoaded, layerControls.infrastructureVisibility]);

  // --- Effect for Applying Property Filters ---
  useEffect(() => {
    if (!map || !isLoaded || !map.getLayer(PROPERTIES_LAYER_ID)) return;
    applyPropertiesFilter(map, layerControls);
  }, [
    map,
    isLoaded,
    layerControls.priceRange,
    layerControls.selectedCategories,
    layerControls.selectedInvestmentTypes,
  ]);
  // Effect for religion layer
  useEffect(() => {
    if (!map || !isLoaded) return;

    if (layerControls.selectedReligionBin) {
      // Ensure source exists
      if (!map.getSource("demografi-jakarta")) {
        map.addSource("demografi-jakarta", {
          type: "geojson",
          data: "/demografi-jakarta-with-bins.geojson",
          generateId: true,
        });
      }

      // Add or update religion layer
      const colorScale = [
        "#f7fbff",
        "#c6dbef",
        "#9ecae1",
        "#6baed6",
        "#08306b",
      ];
      if (!map.getLayer(RELIGION_FILL_LAYER_ID)) {
        map.addLayer(
          {
            id: RELIGION_FILL_LAYER_ID,
            type: "fill",
            source: "demografi-jakarta",
            paint: {
              "fill-color": [
                "step",
                ["get", layerControls.selectedReligionBin],
                colorScale[0],
                1,
                colorScale[1],
                2,
                colorScale[2],
                3,
                colorScale[3],
                4,
                colorScale[4],
              ],
              "fill-opacity": 0.2,
            },
          },
          JAKARTA_BORDER_LAYER_ID // Place below border for visibility
        );
      } else {
        map.setPaintProperty(RELIGION_FILL_LAYER_ID, "fill-color", [
          "step",
          ["get", layerControls.selectedReligionBin],
          colorScale[0],
          1,
          colorScale[1],
          2,
          colorScale[2],
          3,
          colorScale[3],
          4,
          colorScale[4],
        ]);
      }
    } else {
      // Remove layer if no religion selected
      if (map.getLayer(RELIGION_FILL_LAYER_ID)) {
        map.removeLayer(RELIGION_FILL_LAYER_ID);
      }
    }
  }, [map, isLoaded, layerControls.selectedReligionBin]);

  useEffect(() => {
    if (!map || !isLoaded) return;

    console.log("Age effect triggered:", {
      selectedAgeBin: layerControls.selectedAgeBin,
      hasSource: !!map.getSource("demografi-jakarta"),
      hasLayer: !!map.getLayer(AGE_FILL_LAYER_ID),
    });

    if (layerControls.selectedAgeBin) {
      if (!map.getSource("demografi-jakarta")) {
        try {
          map.addSource("demografi-jakarta", {
            type: "geojson",
            data: "/demografi-jakarta-with-bins.geojson",
            generateId: true,
          });
          console.log("Added demografi-jakarta source for age");
        } catch (error) {
          console.error(
            "Failed to add demografi-jakarta source for age:",
            error
          );
          return;
        }
      }

      const colorScale = [
        "#f7fbff",
        "#c6dbef",
        "#9ecae1",
        "#6baed6",
        "#08306b",
      ];
      if (!map.getLayer(AGE_FILL_LAYER_ID)) {
        try {
          map.addLayer(
            {
              id: AGE_FILL_LAYER_ID,
              type: "fill",
              source: "demografi-jakarta",
              layout: { visibility: "visible" },
              paint: {
                "fill-color": [
                  "step",
                  ["get", layerControls.selectedAgeBin],
                  colorScale[0],
                  1,
                  colorScale[1],
                  2,
                  colorScale[2],
                  3,
                  colorScale[3],
                  4,
                  colorScale[4],
                ],
                "fill-opacity": 0.2,
              },
            },
            JAKARTA_BORDER_LAYER_ID
          );
          console.log("Added age-fill layer");
        } catch (error) {
          console.error("Failed to add age-fill layer:", error);
        }
      } else {
        try {
          map.setPaintProperty(AGE_FILL_LAYER_ID, "fill-color", [
            "step",
            ["get", layerControls.selectedAgeBin],
            colorScale[0],
            1,
            colorScale[1],
            2,
            colorScale[2],
            3,
            colorScale[3],
            4,
            colorScale[4],
          ]);
          map.setLayoutProperty(AGE_FILL_LAYER_ID, "visibility", "visible");
          console.log("Updated age-fill layer");
        } catch (error) {
          console.error("Failed to update age-fill layer:", error);
        }
      }
    } else {
      if (map.getLayer(AGE_FILL_LAYER_ID)) {
        try {
          map.removeLayer(AGE_FILL_LAYER_ID);
          console.log("Removed age-fill layer");
        } catch (error) {
          console.error("Failed to remove age-fill layer:", error);
        }
      }
    }
  }, [map, isLoaded, layerControls.selectedAgeBin]);
}

// --- Helper Function: Apply Properties Filter ---
const applyPropertiesFilter = (map: Map, controls: MapLayerControls) => {
  const priceRange = controls.priceRange ?? [0, 100];
  const categories = controls.selectedCategories ?? [];
  const investmentTypes = controls.selectedInvestmentTypes ?? [];

  let filterConditions: ExpressionSpecification[] = [
    [">=", ["get", "property_price"], priceRange[0]],
    ["<=", ["get", "property_price"], priceRange[1]],
  ];

  if (categories.length > 0) {
    filterConditions.push([
      "in",
      ["get", "property_category"],
      ["literal", categories],
    ]);
  }

  if (investmentTypes.length > 0) {
    filterConditions.push([
      "in",
      ["get", "property_status"],
      ["literal", investmentTypes],
    ]);
  }

  map.setFilter(PROPERTIES_LAYER_ID, ["all", ...filterConditions]);
  // Visibility is implicitly handled by the filter now. No need to toggle layout visibility here.
};
