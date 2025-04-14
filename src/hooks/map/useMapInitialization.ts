// src/hooks/map/useMapInitialization.ts
import { useState, useEffect, RefObject } from 'react';
import maplibregl, { Map, MapOptions } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAPTILER_STYLE_URL, INITIAL_CENTER, INITIAL_ZOOM } from '@/config/mapConstants'; // Import constants

export function useMapInitialization(
  mapContainerRef: RefObject<HTMLDivElement>,
  options?: Partial<Omit<MapOptions, 'container'>> // Allow partial overrides
) {
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstance) return; // Already initialized or container not ready

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: options?.style ?? MAPTILER_STYLE_URL,
      center: options?.center ?? INITIAL_CENTER,
      zoom: options?.zoom ?? INITIAL_ZOOM,
      ...options, // Apply other overrides
    });

    map.on('load', () => {
      console.log("Map Loaded Event Fired"); // Debug log
      setMapInstance(map);
      setIsLoaded(true);
      // Add controls if needed, e.g., map.addControl(new maplibregl.NavigationControl());
    });

    map.on('error', (e) => {
      console.error("MapLibre Error:", e);
    });

    // Cleanup function
    return () => {
      console.log("Cleaning up map instance"); // Debug log
      setIsLoaded(false);
      setMapInstance(null); // Set state to null BEFORE removing map
      map?.remove();
    };
    // Keep dependency array minimal for initialization logic
  }, [mapContainerRef]); // Only depends on the container ref

  return { mapInstance, isLoaded };
}