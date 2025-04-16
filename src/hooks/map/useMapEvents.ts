// src/hooks/map/useMapEvents.ts
import { useEffect, useRef } from "react";
import type { Map, MapMouseEvent, MapGeoJSONFeature } from "maplibre-gl";
import type { MapEventHandlers } from "@/types/map";
import {
  JAKARTA_FILL_LAYER_ID,
  PROPERTIES_LAYER_ID,
} from "@/config/mapConstants";

export function useMapEvents(
  map: Map | null,
  isLoaded: boolean,
  handlers: MapEventHandlers // Callbacks defined in the parent component
) {
  const hoveredRegionIdRef = useRef<string | number | null>(null);
  const hoveredPropertyIdRef = useRef<string | number | null>(null);
  const handlersRef = useRef(handlers); // Ref to hold latest handlers

  // Update handlers ref whenever handlers prop changes
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!map || !isLoaded) return;

    // --- Region Click ---
    const handleRegionClick = (
      e: MapMouseEvent & { features?: MapGeoJSONFeature[] }
    ) => {
      const feature = e.features?.[0];
      if (!feature || feature.id == null) return;
      e.originalEvent.preventDefault(); // Prevent background click
      // Reset previous clicked visual state if needed (managed in parent via feature state or specific prop)
      const handler = handlersRef.current.onRegionClick;
      if (handler !== undefined && handler !== null) {
        handler(feature, map);
      }
    };
    map.on("click", JAKARTA_FILL_LAYER_ID, handleRegionClick);

    // --- Properties Click ---
    const handlePropertyClick = (
      e: MapMouseEvent & { features?: MapGeoJSONFeature[] }
    ) => {
      const feature = e.features?.[0];
      if (!feature) return;
      e.originalEvent.preventDefault(); // Prevent background click
      handlersRef.current.onPropertyClick?.(feature, map); // Call parent handler
    };
    map.on("click", PROPERTIES_LAYER_ID, handlePropertyClick);

    // --- Background Click ---
    const handleBackgroundClick = (e: MapMouseEvent) => {
      // Ignore if the event originated from clicking on an interactive layer feature
      if (e.originalEvent.defaultPrevented) return;
      handlersRef.current.onBackgroundClick?.(map); // Call parent handler
    };
    map.on("click", handleBackgroundClick);

    // --- Region Mousemove ---
    const handleRegionMouseMove = (
      e: MapMouseEvent & { features?: MapGeoJSONFeature[] }
    ) => {
      if (e.features?.length) {
        const featureId = e.features[0].id;
        if (
          featureId !== undefined &&
          featureId !== hoveredRegionIdRef.current
        ) {
          // Reset previous hover state
          if (hoveredRegionIdRef.current !== null) {
            map.setFeatureState(
              { source: "jakarta", id: hoveredRegionIdRef.current },
              { hover: false }
            );
            handlersRef.current.onRegionHover?.(null, map); // Notify parent: hover ended
          }
          // Set new hover state
          hoveredRegionIdRef.current = featureId;
          map.setFeatureState(
            { source: "jakarta", id: featureId },
            { hover: true }
          );
          handlersRef.current.onRegionHover?.(featureId, map); // Notify parent: hover started
        }
        map.getCanvas().style.cursor = "pointer";
      }
    };
    map.on("mousemove", JAKARTA_FILL_LAYER_ID, handleRegionMouseMove);

    // --- Region Mouseleave ---
    const handleRegionMouseLeave = () => {
      if (hoveredRegionIdRef.current !== null) {
        map.setFeatureState(
          { source: "jakarta", id: hoveredRegionIdRef.current },
          { hover: false }
        );
        handlersRef.current.onRegionHover?.(null, map); // Notify parent: hover ended
      }
      hoveredRegionIdRef.current = null;
      // Only reset cursor if property isn't also hovered
      if (!hoveredPropertyIdRef.current) {
        map.getCanvas().style.cursor = "";
      }
    };
    map.on("mouseleave", JAKARTA_FILL_LAYER_ID, handleRegionMouseLeave);

    // --- Properties Mousemove ---
    const handlePropertyMouseMove = (
      e: MapMouseEvent & { features?: MapGeoJSONFeature[] }
    ) => {
      if (e.features?.length) {
        const featureId = e.features[0].id ?? e.features[0].properties?.id; // Use generated ID first
        if (
          featureId !== undefined &&
          featureId !== hoveredPropertyIdRef.current
        ) {
          if (hoveredPropertyIdRef.current !== null) {
            map.setFeatureState(
              { source: "properties", id: hoveredPropertyIdRef.current },
              { hover: false }
            );
            handlersRef.current.onPropertyHover?.(null, map);
          }
          hoveredPropertyIdRef.current = featureId;
          map.setFeatureState(
            { source: "properties", id: featureId },
            { hover: true }
          );
          handlersRef.current.onPropertyHover?.(featureId, map);
        }
        map.getCanvas().style.cursor = "pointer";
      }
    };
    map.on("mousemove", PROPERTIES_LAYER_ID, handlePropertyMouseMove);

    // --- Properties Mouseleave ---
    const handlePropertyMouseLeave = () => {
      if (hoveredPropertyIdRef.current !== null) {
        map.setFeatureState(
          { source: "properties", id: hoveredPropertyIdRef.current },
          { hover: false }
        );
        handlersRef.current.onPropertyHover?.(null, map);
      }
      hoveredPropertyIdRef.current = null;
      if (!hoveredRegionIdRef.current) {
        map.getCanvas().style.cursor = "";
      }
    };
    map.on("mouseleave", PROPERTIES_LAYER_ID, handlePropertyMouseLeave);

    // --- Cleanup ---
    return () => {
      // Remove all listeners attached in this hook
      map.off("click", JAKARTA_FILL_LAYER_ID, handleRegionClick);
      map.off("click", PROPERTIES_LAYER_ID, handlePropertyClick);
      map.off("click", handleBackgroundClick);
      map.off("mousemove", JAKARTA_FILL_LAYER_ID, handleRegionMouseMove);
      map.off("mouseleave", JAKARTA_FILL_LAYER_ID, handleRegionMouseLeave);
      map.off("mousemove", PROPERTIES_LAYER_ID, handlePropertyMouseMove);
      map.off("mouseleave", PROPERTIES_LAYER_ID, handlePropertyMouseLeave);

      // Reset cursor on unmount just in case
      try {
        if (map.getCanvas()) map.getCanvas().style.cursor = "";
      } catch (e) {
        /* Ignore errors during cleanup */
      }

      // Clear refs
      hoveredRegionIdRef.current = null;
      hoveredPropertyIdRef.current = null;
    };
    // Dependency array includes map and isLoaded. Handlers are accessed via ref.
  }, [map, isLoaded]);
}
