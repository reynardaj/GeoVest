import React, { useState, useCallback, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import type {
  Map,
} from 'maplibre-gl';

interface InfrastructureLayer {
  id: string;
  name: string;
  iconUrl: string;
  iconId: string;
}

interface UseMapInfrastructureProps {
  mapRef: React.RefObject<maplibregl.Map | null>;
  isMapLoaded: boolean;
}

export function useMapInfrastructure({ mapRef, isMapLoaded }: UseMapInfrastructureProps) {
  const [infrastructureVisibility, setInfrastructureVisibility] = useState<{
    [key: string]: boolean;
  }>({
    "rumah-sakit": false,
    bandara: false,
    "pusat-perbelanjaan": false,
    pendidikan: false,
    "rel-kereta": false,
    transjakarta: false,
  });

  const infrastructureLayers: InfrastructureLayer[] = [
    {
      id: "rumah-sakit",
      name: "Rumah Sakit",
      iconUrl: "/icons/icon-rumah-sakit.png",
      iconId: "hospital-icon",
    },
    {
      id: "bandara",
      name: "Bandara",
      iconUrl: "/icons/icon-bandara.png",
      iconId: "airport-icon",
    },
    {
      id: "pusat-perbelanjaan",
      name: "Pusat Perbelanjaan",
      iconUrl: "/icons/icon-pusat-perbelanjaan.png",
      iconId: "mall-icon",
    },
    {
      id: "pendidikan",
      name: "Pendidikan",
      iconUrl: "/icons/icon-pendidikan.png",
      iconId: "school-icon",
    },
    {
      id: "rel-kereta",
      name: "Rel Kereta",
      iconUrl: "/icons/icon-rs.png",
      iconId: "rail-icon",
    },
    {
      id: "transjakarta",
      name: "TransJakarta",
      iconUrl: "/icons/icon-rs.png",
      iconId: "bus-icon",
    },
  ];

  const toggleInfrastructureLayer = useCallback((layerId: string) => {
    setInfrastructureVisibility((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  }, []);

  const applyInfrastructureFilters = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    infrastructureLayers.forEach((layer) => {
      // Special case for 'rel-kereta' - typically a line
      if (layer.id === "rel-kereta") {
        if (!map.getLayer("rel-kereta-layer")) {
          map.addLayer({
            id: "rel-kereta-layer",
            type: "line",
            source: layer.id,
            layout: {
              visibility: infrastructureVisibility[layer.id]
                ? "visible"
                : "none",
            },
            paint: {
              "line-color": "#72A324", // Grey color for rail
              "line-width": 2,
              "line-opacity": 0.7,
            },
          });
        }
      } else if (layer.id === "transjakarta") {
        if (!map.getLayer("transjakarta-layer")) {
          map.addLayer({
            id: "transjakarta-layer",
            type: "line",
            source: layer.id,
            layout: {
              visibility: infrastructureVisibility[layer.id]
                ? "visible"
                : "none",
            },
            paint: {
              "line-color": "#0000ff", // Red color for Transjakarta
              "line-width": 1,
              "line-opacity": 0.7,
            },
          });
        }
      } else {
        // Add as symbol (point) layer for others
        if (!map.getLayer(layer.id)) {
          map.addLayer({
            id: layer.id,
            type: "symbol",
            source: layer.id,
            layout: {
              "icon-image": layer.iconId,
              "icon-size": 0.4,
              "icon-allow-overlap": true,
              visibility: infrastructureVisibility[layer.id]
                ? "visible"
                : "none",
            },
            paint: {},
          });
        }
      }
    });
  }, [mapRef, infrastructureVisibility]);

  // Effect to apply infrastructure filters when visibility changes
  useEffect(() => {
    if (isMapLoaded) {
      applyInfrastructureFilters();
    }
  }, [infrastructureVisibility, isMapLoaded, applyInfrastructureFilters]);

  // Load icons when map is loaded
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    const map = mapRef.current;
    const loadImagePromises = infrastructureLayers.map(
      (layer) =>
        new Promise<void>((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            if (!map.hasImage(layer.iconId)) {
              map.addImage(layer.iconId, image);
            }
            resolve();
          };
          image.onerror = (error) => {
            console.error(`Failed to load image ${layer.iconUrl}:`, error);
            resolve();
          };
          image.src = layer.iconUrl;
        })
    );

    Promise.all(loadImagePromises).catch((error) => {
      console.error("Error loading one or more infrastructure icons:", error);
    });
  }, [mapRef, isMapLoaded]);

  return {
    infrastructureLayers,
    infrastructureVisibility,
    toggleInfrastructureLayer,
  };
}