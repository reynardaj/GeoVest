// src/components/map/MapComponent.tsx
"use client";

import React, { useRef, useState } from "react";
import type { MapOptions, MapGeoJSONFeature, Map } from "maplibre-gl";
import { useMapInitialization } from "@/hooks/map/useMapInitialization";
import { useMapLayers } from "@/hooks/map/useMapLayers";
import { useMapEvents } from "@/hooks/map/useMapEvents";
import type { MapEventHandlers, MapLayerControls } from "@/types/map";

interface MapComponentProps {
  initialOptions?: Partial<Omit<MapOptions, "container">>;
  layerControls: MapLayerControls;
  eventHandlers: MapEventHandlers;
  baseMapStyleUrl: string;
  onLoad?: (map: Map) => void;
}

export default function MapComponent({
  initialOptions,
  layerControls,
  eventHandlers,
  baseMapStyleUrl,
  onLoad,
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { mapInstance, isLoaded } = useMapInitialization(
    mapContainerRef as React.RefObject<HTMLDivElement>,
    initialOptions,
    baseMapStyleUrl,
    onLoad
  );

  // Pass map instance, load status, and controls to the layers hook
  useMapLayers(mapInstance, isLoaded, layerControls);

  // Pass map instance, load status, and event handler callbacks to the events hook
  useMapEvents(mapInstance, isLoaded, eventHandlers);

  return (
    <div className="flex-1 relative h-full w-auto">
      {" "}
      {/* Ensure map fills container */}
      <div
        ref={mapContainerRef}
        key={baseMapStyleUrl}
        className="absolute top-0 left-0 w-auto h-full"
      />
      {/* Optional: Add overlays or controls as children, using mapInstance if needed */}
      {(isTransitioning || !isLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-400 bg-opacity-50 z-10 pointer-events-none">
          <p className="text-white text-xl">
            {isTransitioning ? "Switching Map Style..." : "Loading Map..."}
          </p>
        </div>
      )}
    </div>
  );
}
