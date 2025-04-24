// src/config/mapConstants.ts
import type { InfrastructureLayer } from "@/types/map"; // Assuming type is defined in types/map.ts

export const MAPTILER_STYLE_URL =
  "https://api.maptiler.com/maps/streets/style.json?key=Xyghbo5YEVnVdA3iTYjo"; // Replace key if needed
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
