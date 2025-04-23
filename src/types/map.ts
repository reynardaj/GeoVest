// src/types/map.ts
import type {
  Map,
  MapGeoJSONFeature,
  ExpressionSpecification,
  LngLatBoundsLike,
  MapMouseEvent,
  MapOptions,
  LayerSpecification,
  SourceSpecification,
} from "maplibre-gl";

// Re-export for convenience
export type {
  Map,
  MapGeoJSONFeature,
  ExpressionSpecification,
  LngLatBoundsLike,
  MapMouseEvent,
  MapOptions,
  LayerSpecification,
  SourceSpecification,
};

// Your specific application types
export interface PopupData {
  regionName: string | number;
  jumlahKecamatan: number;
  jumlahDesa: number;
  jumlahPenduduk: number;
  kepadatanPerKm2: number;
  jumlahLakiLaki: number;
  jumlahPerempuan: number;
  luasWilayahKm2: number;
}

export interface InfrastructureLayer {
  id: string; // Corresponds to GeoJSON source ID
  name: string; // Display name for checkbox
  iconUrl: string; // Placeholder image URL
  iconId: string; // ID used in MapLibre style for image/icon
  layerType?: "symbol" | "line"; // Optional hint for layer type
}

export interface SelectedPropertyData {
  propertyName: string;
  category: string;
  status: string;
  buildingArea: number | string;
  landArea: number | string;
  certificateType: string;
  price: number | string;
  propertyUrl?: string;
}

// Type for infrastructure visibility state
export type InfrastructureVisibilityState = {
  [key: string]: boolean;
};

// Type for event handler callbacks passed to useMapEvents
export interface MapEventHandlers {
  onRegionClick?: (feature: MapGeoJSONFeature, map: Map) => void;
  onPropertyClick?: (feature: MapGeoJSONFeature, map: Map) => void;
  onBackgroundClick?: (map: Map) => void;
  onRegionHover?: (featureId: string | number | null, map: Map) => void; // Pass ID or null
  onPropertyHover?: (featureId: string | number | null, map: Map) => void; // Pass ID or null
}

export interface MapLayerControls {
  heatmapVisible: boolean;
  infrastructureVisibility: InfrastructureVisibilityState;
  priceRange: [number, number];
  selectedCategories: string[];
  selectedInvestmentTypes: string[];
  selectedReligionBin: string | null;
  selectedAgeBin: string | null;
  binRanges: { [key: string]: number[] };
  income: number[];
  regionPopupVisibility: boolean;
}
