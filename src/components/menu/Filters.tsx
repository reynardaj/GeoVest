"use client";

import {
  INFRASTRUCTURE_LAYERS,
  INVESTMENT_TYPES,
  PROPERTY_CATEGORIES,
} from "@/config/mapConstants";
import { InfrastructureVisibilityState } from "@/types/map";
import { useState, useEffect } from "react";
import { Range, getTrackBackground } from "react-range";

interface FiltersProps {
  priceRange: [number, number];
  onPriceChange: (values: number[]) => void;
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  selectedInvestmentTypes: string[];
  onInvestmentTypeChange: (type: string) => void;
  heatmapVisible: boolean;
  onToggleHeatmap: () => void;
  infrastructureVisibility: InfrastructureVisibilityState;
  onToggleInfrastructure: (layerId: string) => void;
  selectedReligionBin: string | null;
  onReligionBinChange: (bin: string) => void;
  binRanges: { [key: string]: number[] };
  selectedAgeBin: string | null;
  onAgeBinChange: (bin: string) => void;
  income: number[];
  setIncome: (values: number[]) => void;
}

const Filters = ({
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
  selectedReligionBin,
  onReligionBinChange,
  binRanges,
  selectedAgeBin,
  onAgeBinChange,
  income,
  setIncome,
}: FiltersProps) => {
  const [selectedReligions, setSelectedReligions] = useState<string | null>(
    null
  );
  const [showDemografi, setShowDemografi] = useState(false);
  const [showDisaster, setShowDisaster] = useState(false);
  const [showInfrastructure, setShowInfrastructure] = useState(false);
  const [showPublicTransport, setShowPublicTransport] = useState(false);

  const religions = [
    { label: "Islam", value: "ISLAM_bin" },
    { label: "Kristen", value: "KRISTEN_bin" },
    { label: "Katolik", value: "KATHOLIK_bin" },
    { label: "Hindu", value: "HINDU_bin" },
    { label: "Buddha", value: "BUDHA_bin" },
    { label: "Khonghucu", value: "KONGHUCU_bin" },
  ];
  const ageGroups = [
    { label: "Balita (0-5 tahun)", value: "Balita_0_5_tahun_bin" },
    { label: "Anak-anak (6-15 tahun)", value: "Anak_anak_6_15_tahun_bin" },
    { label: "Remaja (16-20 tahun)", value: "Remaja_16_20_tahun_bin" },
    {
      label: "Dewasa Muda (21-30 tahun)",
      value: "Dewasa_Muda_21_30_tahun_bin",
    },
    { label: "Dewasa (31-40 tahun)", value: "Dewasa_31_40_tahun_bin" },
    {
      label: "Dewasa Akhir (41-60 tahun)",
      value: "Dewasa_Akhir_41_60_tahun_bin",
    },
    { label: "Lansia (>60 tahun)", value: "Lansia_>60_tahun_bin" },
  ];
  const minPrice = 100_000_000;
  const maxPrice = 5_000_000_000;

  const formattedPrice = (value: number) => {
    if (value >= 1_000_000_000) {
      return `Rp ${(value / 1_000_000_000).toFixed(0)} M`;
    } else {
      return `Rp ${(value / 1_000_000).toFixed(0)} Juta`;
    }
  };
  const getRangeLabels = (binField: string) => {
    if (!binRanges[binField])
      return ["Bin 1", "Bin 2", "Bin 3", "Bin 4", "Bin 5"];
    const breaks = binRanges[binField];
    return breaks.slice(0, -1).map((start, i) => {
      const end = breaks[i + 1];
      return i === breaks.length - 2
        ? `${Math.round(start)}+`
        : `${Math.round(start)}–${Math.round(end)}`;
    });
  };
  const toggleSelection = (
    item: string,
    selectedList: string[],
    setSelectedList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelectedList(
      selectedList.includes(item)
        ? selectedList.filter((i) => i !== item)
        : [...selectedList, item]
    );
  };

  return (
    <div className="px-3 text-[#17488D]">
      <h2 className="text-xl font-bold">Filters</h2>

      {/* Harga Properti (Slider) */}
      <h3 className="mt-4 mb-1 text-lg font-bold">Harga Properti</h3>
      <Range
        step={0.1}
        min={0}
        max={10000000000}
        values={priceRange}
        onChange={onPriceChange}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            className="h-2 w-full rounded bg-gray-200"
            style={{
              ...props.style,
              background: getTrackBackground({
                values: priceRange,
                colors: ["#ccc", "#17488D", "#ccc"],
                min: 0,
                max: 10000000000,
              }),
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props }) => {
          const { key, ...rest } = props;
          return (
            <div
              key={key}
              {...rest}
              className="h-5 w-5 bg-[#17488D] rounded-full shadow border-2 border-white"
            />
          );
        }}
      />
      <div className="flex justify-between text-sm text-gray-600">
        <span>&gt;= {formattedPrice(priceRange[0])}</span>
        <span>&lt;= {formattedPrice(priceRange[1])}</span>
      </div>

      {/* Jenis Properti */}
      <div className="mb-4">
        <h3 className="mt-2 mb-1 text-md font-bold">Jenis Properti</h3>
        <div className="space-y-1">
          {PROPERTY_CATEGORIES.map((category) => (
            <label
              key={category}
              className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer w-fit"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => onCategoryChange(category)}
                className="hidden"
              />
              <div
                className={`w-4 h-4 border-2 rounded ${
                  selectedCategories.includes(category)
                    ? "bg-[#17488D] border-[#17488D]"
                    : "border-gray-400"
                }`}
              ></div>
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Jenis Investasi */}
      <div className="mb-4">
        <h3 className="mt-2 mb-1 text-md font-bold">Jenis Investasi</h3>
        <div className="space-y-1">
          {INVESTMENT_TYPES.map((type) => (
            <label
              key={type}
              className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer w-fit"
            >
              <input
                type="checkbox"
                checked={
                  selectedInvestmentTypes &&
                  selectedInvestmentTypes.includes(type)
                }
                onChange={() => onInvestmentTypeChange(type)}
                className="hidden"
              />
              <div
                className={`w-4 h-4 border-2 rounded ${
                  selectedInvestmentTypes &&
                  selectedInvestmentTypes.includes(type)
                    ? "bg-[#17488D] border-[#17488D]"
                    : "border-gray-400"
                }`}
              ></div>
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Demografi Dropdown */}

      <h3
        className="mt-4 text-lg font-bold cursor-pointer w-fit"
        onClick={() => setShowDemografi(!showDemografi)}
      >
        <span className="inline-block w-4 text-center mr-2">
          {showDemografi ? "▼" : "▶"}
        </span>
        Demografi
      </h3>

      {showDemografi && (
        <div>
          <h3 className="mt-2 mb-1 text-md font-bold">Umur</h3>
          {ageGroups.map((ageGroup) => (
            <label
              key={ageGroup.value}
              className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer w-fit"
            >
              <input
                type="checkbox"
                name="age"
                value={ageGroup.value}
                checked={selectedAgeBin === ageGroup.value}
                onChange={(e) => {
                  if (selectedAgeBin === ageGroup.value) {
                    onAgeBinChange(""); // Deselect if already selected
                  } else {
                    onAgeBinChange(ageGroup.value); // Select the new value
                  }
                }}
                className="hidden"
              />
              <div
                className={`w-4 h-4 border-2 rounded ${
                  selectedAgeBin === ageGroup.value
                    ? "bg-[#17488D] border-[#17488D]"
                    : "border-gray-400"
                }`}
              ></div>
              <span>{ageGroup.label}</span>
            </label>
          ))}

          <h3 className="mt-4 mb-1 text-md font-bold">
            Penghasilan (per bulan)
          </h3>
          <Range
            step={0.1}
            min={4}
            max={7}
            values={income}
            onChange={setIncome}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                className="h-2 w-full rounded bg-gray"
                style={{
                  ...props.style,
                  background: getTrackBackground({
                    values: income,
                    colors: ["#ccc", "#17488D", "#ccc"],
                    min: 4,
                    max: 7,
                  }),
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => {
              const { key, ...rest } = props;
              return (
                <div
                  key={key}
                  {...rest}
                  className="h-5 w-5 bg-[#17488D] rounded-full shadow border-2 border-white"
                />
              );
            }}
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>&gt;= {income[0]} Juta</span>
            <span>&lt;= {income[1]} Juta</span>
          </div>

          <h3 className="mt-2 mb-1 text-md font-bold">Agama</h3>
          {religions.map((religion) => (
            <label
              key={religion.value}
              className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer w-fit"
            >
              <input
                type="checkbox"
                name="religion"
                value={religion.value}
                checked={selectedReligionBin === religion.value}
                onChange={() => {
                  if (selectedReligionBin === religion.value) {
                    onReligionBinChange(""); // Deselect if already selected
                  } else {
                    onReligionBinChange(religion.value); // Select the new value
                  }
                }}
                className="hidden"
              />
              <div
                className={`w-4 h-4 border-2 rounded ${
                  selectedReligionBin === religion.value
                    ? "bg-[#17488D] border-[#17488D]"
                    : "border-gray-400"
                }`}
              ></div>
              <span>{religion.label}</span>
            </label>
          ))}
        </div>
      )}
      {/* Infrastruktur Dropdown */}
      <h3
        className="mt-4 text-lg font-bold cursor-pointer w-fit"
        onClick={() => setShowInfrastructure(!showInfrastructure)}
      >
        <span className="inline-block w-4 text-center mr-2">
          {showInfrastructure ? "▼" : "▶"}
        </span>
        Infrastruktur
      </h3>
      {showInfrastructure && (
        <div className="space-y-1">
          {INFRASTRUCTURE_LAYERS.filter(
            (layer) => !["Rel Kereta", "TransJakarta"].includes(layer.name)
          ).map((layer) => (
            <label
              key={layer.id}
              className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer"
            >
              <input
                type="checkbox"
                className="hidden"
                checked={infrastructureVisibility[layer.id] ?? false}
                onChange={() => onToggleInfrastructure(layer.id)}
              />
              <div
                className={`w-4 h-4 border-2 rounded ${
                  infrastructureVisibility[layer.id]
                    ? "bg-[#17488D] border-[#17488D]"
                    : "border-gray-400"
                }`}
              ></div>
              <span>{layer.name}</span>
            </label>
          ))}
        </div>
      )}

      {/* Transportasi Umum Dropdown */}
      <h3
        className="mt-4 text-lg font-bold cursor-pointer w-fit"
        onClick={() => setShowPublicTransport(!showPublicTransport)}
      >
        <span className="inline-block w-4 text-center mr-2">
          {showPublicTransport ? "▼" : "▶"}
        </span>
        Transportasi Umum
      </h3>
      {showPublicTransport && (
        <div className="space-y-1">
          {INFRASTRUCTURE_LAYERS.filter((layer) =>
            ["Rel Kereta", "TransJakarta"].includes(layer.name)
          ).map((layer) => (
            <label
              key={layer.id}
              className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer"
            >
              <input
                type="checkbox"
                className="hidden"
                checked={infrastructureVisibility[layer.id] ?? false}
                onChange={() => onToggleInfrastructure(layer.id)}
              />
              <div
                className={`w-4 h-4 border-2 rounded ${
                  infrastructureVisibility[layer.id]
                    ? "bg-[#17488D] border-[#17488D]"
                    : "border-gray-400"
                }`}
              ></div>
              <span>{layer.name}</span>
            </label>
          ))}
        </div>
      )}
      {/* Risiko Bencana Dropdown */}
      <h3
        className="mt-4 text-lg font-bold cursor-pointer w-fit"
        onClick={() => setShowDisaster(!showDisaster)}
      >
        <span className="inline-block w-4 text-center mr-2">
          {showDisaster ? "▼" : "▶"}
        </span>
        Risiko Bencana
      </h3>
      {showDisaster && (
        <div>
          <label className="flex items-center space-x-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={heatmapVisible}
              onChange={onToggleHeatmap}
              className="hidden"
            />
            <div
              className={`w-4 h-4 border-2 rounded ${
                heatmapVisible
                  ? "bg-[#17488D] border-[#17488D]"
                  : "border-gray-400"
              }`}
            ></div>
            <span>Banjir</span>
          </label>
        </div>
      )}
    </div>
  );
};

export default Filters;
