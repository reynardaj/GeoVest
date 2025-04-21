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
          map.addSource(fileName, {
            type: "geojson",
            data: `/${
              fileName === "demografi-jakarta"
                ? "demografi-jakarta-with-bins"
                : fileName
            }.geojson`,
            generateId: true, // Important for feature state
          });
        }
      });

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
              0.6, // Clicked opacity
              ["boolean", ["feature-state", "hover"], false],
              0.8, // Hover opacity
              0.6, // Default opacity
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
        const loadImagePromises = INFRASTRUCTURE_LAYERS.map((layer) =>
          loadMapImage(map, layer.iconId, layer.iconUrl)
        );
        await Promise.all(loadImagePromises);

        if (!isMounted) return; // Check if component unmounted during async load

        INFRASTRUCTURE_LAYERS.forEach((layer) => {
          const isVisible =
            layerControlsRef.current.infrastructureVisibility?.[layer.id] ??
            false;
          const visibilityValue = isVisible ? "visible" : "none";

          if (layer.layerType === "line") {
            const lineLayerId =
              layer.id === "rel-kereta"
                ? RAIL_LINE_LAYER_ID
                : BUS_LINE_LAYER_ID;
            if (!map.getLayer(lineLayerId)) {
              map.addLayer({
                id: lineLayerId,
                type: "line",
                source: layer.id, // source ID still matches infrastructure ID
                layout: { visibility: visibilityValue },
                paint:
                  layer.id === "rel-kereta"
                    ? {
                        "line-color": "#72A324",
                        "line-width": 2,
                        "line-opacity": 0.7,
                      } // Rail style
                    : {
                        "line-color": "#0000ff",
                        "line-width": 1,
                        "line-opacity": 0.7,
                      }, // Bus style
              });
            }
          } else {
            // Default to symbol
            if (!map.getLayer(layer.id)) {
              // Layer ID == Source ID for symbols
              map.addLayer({
                id: layer.id,
                type: "symbol",
                source: layer.id,
                layout: {
                  "icon-image": layer.iconId,
                  "icon-size": 0.4,
                  "icon-allow-overlap": true,
                  "text-field": ["get", "NAMOBJ"],
                  "text-font": [
                    "Open Sans Regular",
                    "Arial Unicode MS Regular",
                  ],
                  "text-size": 12,
                  "text-offset": [1, 0],
                  "text-anchor": "left",
                  "text-allow-overlap": true,
                  visibility: visibilityValue,
                },
                paint: {
                  "text-color": "#000000",
                  "text-opacity": ["step", ["zoom"], 0, 13, 1],
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

      // --- Add Flood Heatmap Layer ---
      if (!map.getLayer(FLOOD_HEATMAP_LAYER_ID)) {
        const heatmapVisible = layerControlsRef.current.heatmapVisible ?? false; // Default to false if undefined
        map.addLayer({
          id: FLOOD_HEATMAP_LAYER_ID,
          type: "heatmap",
          source: "flood",
          maxzoom: 15,
          layout: { visibility: heatmapVisible ? "visible" : "none" },
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
      }
    };

    setupLayers();

    return () => {
      isMounted = false; // Cleanup flag for async operations
    };
  }, [map, isLoaded]); // Runs only when map instance is created and loaded

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

    const targetVisibility = layerControls.heatmapVisible ? "visible" : "none";
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
  }, [map, isLoaded, layerControls.heatmapVisible]);

  // --- Effect for Toggling Infrastructure Visibility ---
  useEffect(() => {
    if (!map || !isLoaded || !layerControls.infrastructureVisibility) return;
    const visibilityState = layerControls.infrastructureVisibility;

    INFRASTRUCTURE_LAYERS.forEach((layer) => {
      let mapLayerId: string;
      if (layer.layerType === "line") {
        mapLayerId =
          layer.id === "rel-kereta" ? RAIL_LINE_LAYER_ID : BUS_LINE_LAYER_ID;
      } else {
        mapLayerId = layer.id;
      }

      if (map.getLayer(mapLayerId)) {
        const targetVisibility = visibilityState[layer.id] ? "visible" : "none";
        if (
          map.getLayoutProperty(mapLayerId, "visibility") !== targetVisibility
        ) {
          map.setLayoutProperty(mapLayerId, "visibility", targetVisibility);
        }
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
              "fill-opacity": 0.8,
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
                "fill-opacity": 0.9,
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
