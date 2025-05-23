// src/hooks/map/useMapInitialization.ts
import { useState, useEffect, RefObject } from "react";
import maplibregl, { Map, MapOptions } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { INITIAL_CENTER, INITIAL_ZOOM } from "@/config/mapConstants"; // Import constants

export function useMapInitialization(
  mapContainerRef: RefObject<HTMLDivElement>,
  options?: Partial<Omit<MapOptions, "container">>,
  styleUrl?: string, // Allow partial overrides
  onLoadCallback?: (map: Map) => void
) {
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

useEffect(() => {
    // Log before any early exit
    console.log(
      "useMapInitialization: useEffect triggered. Current mapInstance:",
      mapInstance,
      "isLoaded:",
      isLoaded,
      "styleUrl:",
      styleUrl
    );

    if (!mapContainerRef.current) {
      console.log("useMapInitialization: No map container ref. Returning.");
      return; // Exit if container is not ready
    }

    // If mapInstance exists AND its style matches the current styleUrl,
    // and it's already loaded, then we don't need to re-initialize.
    // This prevents unnecessary map re-creations.
    // Since mapInstance.getStyle() does not provide the style URL, we need to track it separately.
    if (mapInstance && isLoaded && (mapInstance.getStyle() as any).sprite === styleUrl) {
      // This is a workaround: you may want to track the styleUrl in a ref or state for a more robust solution.
      console.log("useMapInitialization: Map is already correctly loaded for this style. Skipping re-initialization.");
      return;
    }

    // --- If we reach here, we need to (re)initialize the map ---

    console.log("useMapInitialization: (Re)initializing map with style:", styleUrl);

    // Clean up existing map if it's there before creating a new one
    if (mapInstance) {
      console.log("useMapInitialization: Removing existing map instance for re-initialization.");
      mapInstance.remove();
      setMapInstance(null); // Clear previous state to signal loading
      setIsLoaded(false);   // Reset loaded state
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl, // Use the prop for the style
      center: options?.center ?? INITIAL_CENTER,
      zoom: options?.zoom ?? INITIAL_ZOOM,
      ...options, // Apply other overrides
    });

    // Set map instance immediately after creation, before load,
    // so other hooks (like useMapLayers, useMapEvents) can receive it
    // but they should check `isLoaded` before interacting with layers/sources.
    setMapInstance(map);
    setIsLoaded(false); // Ensure it's false until 'load' event fires

    map.on("load", () => {
      console.log("useMapInitialization: Map 'load' event fired! Setting isLoaded to true for style:", styleUrl);
      setIsLoaded(true); // Now the map is fully loaded
      // mapInstance is already set, no need to set again here
      if (onLoadCallback) {
        onLoadCallback(map);
      }
    });

    map.on("error", (e) => {
      console.error(
        "useMapInitialization: MapLibre Error:",
        e,
        "for style:",
        styleUrl
      );
      // On error, revert to null/false state to signal failure
      // setMapInstance(null);
      // setIsLoaded(false);
    });

    // Cleanup function - this runs when the component unmounts OR
    // when the dependencies change, causing the effect to re-run.
    return () => {
      console.log(
        "useMapInitialization: Cleanup function triggered for style:",
        styleUrl,
        "map instance:", map
      );
      if (map) { // Check if map was successfully created before removing
        map.remove();
      }
      // Ensure states are reset when the map is removed
      setMapInstance(null);
      setIsLoaded(false);
    };
  }, [mapContainerRef, styleUrl, options, onLoadCallback]); // Dependencies

  return { mapInstance, isLoaded };
}