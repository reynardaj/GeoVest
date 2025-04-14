// src/hooks/map/useMapLayers.ts
import { useEffect, useCallback, useRef } from 'react';
import type { Map, ExpressionSpecification, GetResourceResponse } from 'maplibre-gl';
import type { InfrastructureLayer, MapLayerControls } from '@/types/map';
import {
  GEOJSON_SOURCES,
  INFRASTRUCTURE_LAYERS,
  JAKARTA_FILL_LAYER_ID,
  JAKARTA_BORDER_LAYER_ID,
  PROPERTIES_LAYER_ID,
  FLOOD_HEATMAP_LAYER_ID,
  RAIL_LINE_LAYER_ID,
  BUS_LINE_LAYER_ID
} from '@/config/mapConstants';

// Helper to load images asynchronously
const loadMapImage = async (map: Map, id: string, url: string): Promise<void> => {
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
        GEOJSON_SOURCES.forEach((fileName) => {
            if (!map.getSource(fileName)) {
                map.addSource(fileName, {
                    type: "geojson",
                    data: `/${fileName}.geojson`, // Ensure these files are in /public
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
                        ["boolean", ["feature-state", "hover"], false], "#FF0000", // Hover color
                        ["boolean", ["feature-state", "clicked"], false], "#ADD8E6", // Clicked color
                        "#627BC1" // Default color
                    ],
                    "fill-opacity": [
                        "case",
                        ["boolean", ["feature-state", "clicked"], false], 0.2, // Clicked opacity
                        ["boolean", ["feature-state", "hover"], false], 0.8, // Hover opacity
                        0.6 // Default opacity
                    ],
                },
            });
        }
        if (!map.getLayer(JAKARTA_BORDER_LAYER_ID)) {
            map.addLayer({
                id: JAKARTA_BORDER_LAYER_ID,
                type: "line",
                source: "jakarta",
                paint: { "line-color": "#627BC1", "line-width": 2 },
            });
        }

        // --- Load Icons & Add Infrastructure Layers ---
        try {
            const loadImagePromises = INFRASTRUCTURE_LAYERS.map(layer =>
                loadMapImage(map, layer.iconId, layer.iconUrl)
            );
            await Promise.all(loadImagePromises);

            if (!isMounted) return; // Check if component unmounted during async load

            INFRASTRUCTURE_LAYERS.forEach((layer) => {
                const isVisible = layerControlsRef.current.infrastructureVisibility?.[layer.id] ?? false;
                const visibilityValue = isVisible ? "visible" : "none";

                if (layer.layerType === 'line') {
                    const lineLayerId = layer.id === 'rel-kereta' ? RAIL_LINE_LAYER_ID : BUS_LINE_LAYER_ID;
                     if (!map.getLayer(lineLayerId)) {
                        map.addLayer({
                            id: lineLayerId,
                            type: "line",
                            source: layer.id, // source ID still matches infrastructure ID
                            layout: { visibility: visibilityValue },
                            paint: layer.id === 'rel-kereta'
                                ? { "line-color": "#72A324", "line-width": 2, "line-opacity": 0.7 } // Rail style
                                : { "line-color": "#0000ff", "line-width": 1, "line-opacity": 0.7 }, // Bus style
                        });
                    }
                } else { // Default to symbol
                    if (!map.getLayer(layer.id)) { // Layer ID == Source ID for symbols
                        map.addLayer({
                            id: layer.id,
                            type: "symbol",
                            source: layer.id,
                            layout: {
                                "icon-image": layer.iconId,
                                "icon-size": 0.4,
                                "icon-allow-overlap": true,
                                visibility: visibilityValue,
                            },
                            paint: {},
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
                layout: { visibility: "visible" }, // Filter will handle visibility based on data
                paint: {
                    "circle-radius": ["case", ["boolean", ["feature-state", "hover"], false], 10, 6],
                    "circle-color": ["case", ["boolean", ["feature-state", "hover"], false], "#FF8C00", "#007bff"],
                    "circle-stroke-width": ["case", ["boolean", ["feature-state", "hover"], false], 2, 1],
                    "circle-stroke-color": "#ffffff",
                },
            });
            // Apply initial filter after layer is added
            applyPropertiesFilter(map, layerControlsRef.current);
        }

        // --- Add Flood Heatmap Layer ---
        if (!map.getLayer(FLOOD_HEATMAP_LAYER_ID)) {
            const heatmapVisible = layerControlsRef.current.heatmapVisible ?? true; // Default to true if undefined
             map.addLayer({
                id: FLOOD_HEATMAP_LAYER_ID,
                type: "heatmap",
                source: "flood",
                maxzoom: 15,
                layout: { visibility: heatmapVisible ? "visible" : "none" },
                paint: {
                    "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 10, 1, 15, 3],
                    "heatmap-color": [
                        "interpolate", ["linear"], ["heatmap-density"],
                        0, "rgba(0, 0, 255, 0)", 0.2, "royalblue", 0.4, "cyan",
                        0.6, "limegreen", 0.8, "yellow", 1, "red",
                    ],
                    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 15, 15, 30],
                    "heatmap-opacity": 0.8,
                },
            });
        }

    };

    setupLayers();

    return () => {
        isMounted = false; // Cleanup flag for async operations
        // Layer removal logic could go here if needed when the component unmounts,
        // but often map.remove() in useMapInitialization handles full cleanup.
    };

  }, [map, isLoaded]); // Runs only when map instance is created and loaded

   // --- Effect for Toggling Heatmap Visibility ---
  useEffect(() => {
    if (!map || !isLoaded || !map.getLayer(FLOOD_HEATMAP_LAYER_ID)) return;

    const targetVisibility = layerControls.heatmapVisible ? "visible" : "none";
    // Only update if the desired state is different from the current state
    if (map.getLayoutProperty(FLOOD_HEATMAP_LAYER_ID, 'visibility') !== targetVisibility) {
        map.setLayoutProperty(FLOOD_HEATMAP_LAYER_ID, "visibility", targetVisibility);
    }
  }, [map, isLoaded, layerControls.heatmapVisible]);

  // --- Effect for Toggling Infrastructure Visibility ---
  useEffect(() => {
    if (!map || !isLoaded || !layerControls.infrastructureVisibility) return;
    const visibilityState = layerControls.infrastructureVisibility;

    INFRASTRUCTURE_LAYERS.forEach((layer) => {
      let mapLayerId: string;
      if (layer.layerType === 'line') {
        mapLayerId = layer.id === 'rel-kereta' ? RAIL_LINE_LAYER_ID : BUS_LINE_LAYER_ID;
      } else {
        mapLayerId = layer.id;
      }

      if (map.getLayer(mapLayerId)) {
          const targetVisibility = visibilityState[layer.id] ? "visible" : "none";
          if (map.getLayoutProperty(mapLayerId, 'visibility') !== targetVisibility) {
                map.setLayoutProperty(mapLayerId, "visibility", targetVisibility);
          }
      }
    });
  }, [map, isLoaded, layerControls.infrastructureVisibility]);

  // --- Effect for Applying Property Filters ---
  useEffect(() => {
      if (!map || !isLoaded || !map.getLayer(PROPERTIES_LAYER_ID)) return;
      applyPropertiesFilter(map, layerControls);
  }, [map, isLoaded, layerControls.priceRange, layerControls.selectedCategories, layerControls.selectedInvestmentTypes]); // React to filter changes
}

// --- Helper Function: Apply Properties Filter ---
// (Moved outside the main hook, but could be inside or imported)
const applyPropertiesFilter = (map: Map, controls: MapLayerControls) => {
    const priceRange = controls.priceRange ?? [0, 100];
    const categories = controls.selectedCategories ?? [];
    const investmentTypes = controls.selectedInvestmentTypes ?? [];

    let filterConditions: ExpressionSpecification[] = [
        [">=", ["get", "property_price"], priceRange[0]],
        ["<=", ["get", "property_price"], priceRange[1]],
    ];

    if (categories.length > 0) {
        filterConditions.push(["in", ["get", "property_category"], ["literal", categories]]);
    }

    if (investmentTypes.length > 0) {
        filterConditions.push(["in", ["get", "property_status"], ["literal", investmentTypes]]);
    }

    map.setFilter(PROPERTIES_LAYER_ID, ["all", ...filterConditions]);
    // Visibility is implicitly handled by the filter now. No need to toggle layout visibility here.
};