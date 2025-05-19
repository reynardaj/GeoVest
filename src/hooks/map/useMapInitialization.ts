// src/hooks/map/useMapInitialization.ts
import { useState, useEffect, RefObject } from "react";
import maplibregl, { Map, MapOptions } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { INITIAL_CENTER, INITIAL_ZOOM } from "@/config/mapConstants"; // Import constants

export function useMapInitialization(
  mapContainerRef: RefObject<HTMLDivElement>,
  options?: Partial<Omit<MapOptions, "container">>,
  styleUrl?: string // Allow partial overrides
) {
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstance) return;
    console.log(
      "useMapInitialization: Initializing new map with style:",
      styleUrl
    );

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: options?.center ?? INITIAL_CENTER,
      zoom: options?.zoom ?? INITIAL_ZOOM,
      ...options, // Apply other overrides
    });

    map.on("load", () => {
      console.log("useMapInitialization: Map Loaded for style:", styleUrl);
      setMapInstance(map);
      setIsLoaded(true);
    });

    map.on("error", (e) => {
      console.error(
        "useMapInitialization: MapLibre Error:",
        e,
        "for style:",
        styleUrl
      );
    });

    // Cleanup function
    return () => {
      console.log(
        "useMapInitialization: Cleaning up map instance for style:",
        styleUrl,
        map
      );
      map?.remove();
      setIsLoaded(false);
      setMapInstance(null); // Set state to null BEFORE removing map
    };
  }, [mapContainerRef, styleUrl, options]); // Only depends on the container ref

  return { mapInstance, isLoaded };
}
