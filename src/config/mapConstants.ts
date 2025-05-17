// src/config/mapConstants.ts
import type { InfrastructureLayer } from "@/types/map"; // Assuming type is defined in types/map.ts

const MAP_SERVICE_KEY = process.env.NEXT_PUBLIC_MAPID_MAP_SERVICE_KEY;
export const MAPTILER_STYLE_URL = `https://basemap.mapid.io/styles/street-new-generation/style.json?key=${MAP_SERVICE_KEY}`;
export const INITIAL_CENTER: [number, number] = [106.8456, -6.2088];
export const INITIAL_ZOOM = 10;

export const GEOJSON_SOURCES = [
  "jakarta",
  "flood",
  "properties",
  "bandara",
  "pusat-perbelanjaan",
  "rel-kereta",
  "transjakarta",
  "rumah-sakit",
  "pendidikan",
];

export const PROPERTY_CATEGORIES = [
  "Apartemen",
  "Ruko",
  "Rumah",
  "Gudang",
  "Kos",
];
export const INVESTMENT_TYPES = ["Jual", "Sewa"];

export const INFRASTRUCTURE_LAYERS: InfrastructureLayer[] = [
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
    layerType: "line",
  }, // Add layerType hint
  {
    id: "transjakarta",
    name: "TransJakarta",
    iconUrl: "/icons/icon-rs.png",
    iconId: "bus-icon",
    layerType: "line",
  }, // Add layerType hint
];

// Layer IDs used in MapLibre style
export const JAKARTA_FILL_LAYER_ID = "jakarta_fill";
export const JAKARTA_BORDER_LAYER_ID = "jakarta_border";
export const PROPERTIES_LAYER_ID = "properties";
export const FLOOD_HEATMAP_LAYER_ID = "flood_heatmap";
export const RAIL_LINE_LAYER_ID = "rel-kereta-layer";
export const BUS_LINE_LAYER_ID = "transjakarta-layer";
export const AGE_FILL_LAYER_ID = "age-fill";

export const CLUSTER_MAX_ZOOM = 14; // Zoom level where clustering stops
export const CLUSTER_RADIUS = 100; // Radius of each cluster in pixels
