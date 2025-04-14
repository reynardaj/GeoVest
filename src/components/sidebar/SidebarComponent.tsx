// src/components/sidebar/SidebarComponent.tsx
import React from "react";
import { Range } from "react-range";
import type {
  PopupData,
  SelectedPropertyData,
  InfrastructureLayer,
  InfrastructureVisibilityState,
} from "@/types/map";
import {
  PROPERTY_CATEGORIES,
  INVESTMENT_TYPES,
  INFRASTRUCTURE_LAYERS,
} from "@/config/mapConstants";

interface SidebarComponentProps {
  // Filter State & Handlers
  priceRange: [number, number];
  onPriceChange: (values: number[]) => void;
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  selectedInvestmentTypes: string[];
  onInvestmentTypeChange: (type: string) => void;

  // Layer Visibility State & Handlers
  heatmapVisible: boolean;
  onToggleHeatmap: () => void;
  infrastructureVisibility: InfrastructureVisibilityState;
  onToggleInfrastructure: (layerId: string) => void;

  // Data Display
  regionData: PopupData | null; // Renamed from popupData for clarity
  propertyData: SelectedPropertyData | null;
  onClosePropertyInfo: () => void; // Handler to close the property info box
}

// Helper to format currency
const formatCurrency = (value: number | string | undefined | null): string => {
  if (typeof value === "number") {
    return value.toLocaleString("id-ID");
  }
  if (typeof value === "string") {
    // Try parsing if it looks like a number string, otherwise return as is
    const num = parseFloat(value.replace(/[^0-9]/g, ""));
    return isNaN(num) ? value : num.toLocaleString("id-ID");
  }
  return "N/A";
};

export default function SidebarComponent({
  priceRange,
  onPriceChange,
  selectedCategories,
  onCategoryChange,
  selectedInvestmentTypes,
  onInvestmentTypeChange,
  heatmapVisible,
  onToggleHeatmap,
  infrastructureVisibility,
  onToggleInfrastructure,
  regionData,
  propertyData,
  onClosePropertyInfo,
}: SidebarComponentProps) {
  return (
    <div className="w-80 bg-white p-4 border-l overflow-y-auto h-full">
      {" "}
      {/* Ensure full height */}
      {/* --- Filter Section --- */}
      <div className="mb-6 pb-4 border-b">
        <h2 className="text-lg font-bold mb-3 text-gray-800">
          Filter Properti
        </h2>

        {/* Price Range */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2 text-gray-700 text-sm">
            Rentang Harga (Rp)
          </h3>
          <Range
            // *** FIX IS HERE: Ensure these props are present ***
            values={priceRange} // Pass the priceRange state
            onChange={onPriceChange} // Pass the handler function
            // *** END FIX ***

            step={100000000}
            min={0}
            max={5000000000}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{ ...props.style }}
                className="h-1 w-full bg-gray-300 rounded-full my-4"
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => {
              const { key, ...restProps } = props;
              return (
                <div
                  key={key}
                  {...restProps}
                  style={{ ...restProps.style }}
                  className="h-4 w-4 bg-blue-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              );
            }}
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Rp {formatCurrency(priceRange[0])}</span>
            <span>Rp {formatCurrency(priceRange[1])}</span>
          </div>
        </div>

        {/* Property Categories */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2 text-gray-700 text-sm">
            Jenis Properti
          </h3>
          <div className="space-y-1">
            {PROPERTY_CATEGORIES.map((category) => (
              <label
                key={category}
                className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={selectedCategories.includes(category)}
                  onChange={() => onCategoryChange(category)}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Investment Types */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2 text-gray-700 text-sm">
            Jenis Investasi
          </h3>
          <div className="space-y-1">
            {INVESTMENT_TYPES.map((type) => (
              <label
                key={type}
                className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={selectedInvestmentTypes.includes(type)}
                  onChange={() => onInvestmentTypeChange(type)}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      {/* --- Layer Toggles Section --- */}
      <div className="mb-6 pb-4 border-b">
        <h2 className="text-lg font-bold mb-3 text-gray-800">Layer Peta</h2>

        {/* Heatmap Toggle */}
        <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer mb-2">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            checked={heatmapVisible}
            onChange={onToggleHeatmap}
          />
          <span>Heatmap Banjir</span>
        </label>

        {/* Infrastructure Toggles */}
        <h3 className="font-semibold mb-2 text-gray-700 text-sm mt-3">
          Infrastruktur
        </h3>
        <div className="space-y-1">
          {INFRASTRUCTURE_LAYERS.map((layer) => (
            <label
              key={layer.id}
              className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer"
            >
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                checked={infrastructureVisibility[layer.id] ?? false}
                onChange={() => onToggleInfrastructure(layer.id)}
              />
              {/* Optional: Show icon */}
              {/* <img src={layer.iconUrl} alt={layer.name} className="h-4 w-4 inline-block mr-1" /> */}
              <span>{layer.name}</span>
            </label>
          ))}
        </div>
      </div>
      {/* --- Information Display Section --- */}
      <div>
        <h2 className="text-lg font-bold mb-3 text-gray-800">
          Informasi Wilayah
        </h2>
        {regionData ? (
          <div className="text-sm text-gray-700 space-y-1 bg-gray-50 p-3 rounded border">
            <p>
              <strong className="font-semibold text-gray-800">Wilayah:</strong>{" "}
              {regionData.regionName}
            </p>
            <p>
              <strong className="font-semibold text-gray-800">
                Luas (km²):
              </strong>{" "}
              {regionData.luasWilayahKm2.toLocaleString("id-ID")}
            </p>
            <p>
              <strong className="font-semibold text-gray-800">Penduduk:</strong>{" "}
              {regionData.jumlahPenduduk.toLocaleString("id-ID")}
            </p>
            <p>
              <strong className="font-semibold text-gray-800">
                Kepadatan (/km²):
              </strong>{" "}
              {regionData.kepadatanPerKm2.toLocaleString("id-ID")}
            </p>
            <p>
              <strong className="font-semibold text-gray-800">
                Kecamatan:
              </strong>{" "}
              {regionData.jumlahKecamatan}
            </p>
            <p>
              <strong className="font-semibold text-gray-800">Desa/Kel:</strong>{" "}
              {regionData.jumlahDesa}
            </p>
            <p>
              <strong className="font-semibold text-gray-800">
                Laki-laki:
              </strong>{" "}
              {regionData.jumlahLakiLaki.toLocaleString("id-ID")}
            </p>
            <p>
              <strong className="font-semibold text-gray-800">
                Perempuan:
              </strong>{" "}
              {regionData.jumlahPerempuan.toLocaleString("id-ID")}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            Klik wilayah pada peta untuk melihat detail.
          </p>
        )}

        {/* Display Selected Property Info (if not using the floating box) */}
        {/* You might choose to display property details here instead of the floating box */}
        {/*
        {propertyData && (
           <div className="mt-4 pt-4 border-t">
                <h3 className="text-base font-bold mb-2 text-gray-800">{propertyData.propertyName}</h3>
                // ... display property details ...
                <button onClick={onClosePropertyInfo}>Close</button>
           </div>
        )}
        */}
      </div>
    </div>
  );
}
