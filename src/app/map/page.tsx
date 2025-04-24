// src/app/map/page.tsx
/* eslint-disable react-hooks/exhaustive-deps */ // Keep if needed for useCallback dependencies
"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import type { MapGeoJSONFeature, Map, LngLatBoundsLike } from "maplibre-gl"; // Import necessary types

// Import Components
import MapComponent from "@/components/map/MapComponent"; // Adjust path

// Import Types
import type {
  PopupData,
  SelectedPropertyData,
  MapEventHandlers,
  MapLayerControls,
  InfrastructureVisibilityState,
} from "@/types/map"; // Adjust path

// Import Constants
import { INFRASTRUCTURE_LAYERS } from "@/config/mapConstants"; // Adjust path
import Menu from "@/components/Menu";
import Image from "next/image";
import NavbarMap from "@/components/NavbarMap";

const colorScale = ["#f7fbff", "#c6dbef", "#9ecae1", "#6baed6", "#08306b"];

// Initialize infrastructure visibility state dynamically
const initialInfraVisibility: InfrastructureVisibilityState =
  INFRASTRUCTURE_LAYERS.reduce((acc, layer) => {
    acc[layer.id] = false; // Start with all false
    return acc;
  }, {} as InfrastructureVisibilityState);

export default function MapPage() {
  const [selectedPropertyToFocus, setSelectedPropertyToFocus] = useState<[number, number, number] | null>(null);
  // Renamed from Page for clarity
  useEffect(() => {
    // Check if there's a selected property from dashboard
    const storedCoordinates = localStorage.getItem('selectedPropertyCoordinates');
    const storedPropertyData = localStorage.getItem('selectedPropertyData');
    
    if (storedCoordinates) {
      const coords = JSON.parse(storedCoordinates) as [number, number, number];
      // Clear the storage after reading it
      localStorage.removeItem('selectedPropertyCoordinates');
      setSelectedPropertyToFocus(coords);
    }
    if (storedPropertyData) {
      const parsedPropertyData = JSON.parse(storedPropertyData) as SelectedPropertyData;
      setSelectedPropertyData(parsedPropertyData);
      localStorage.removeItem('selectedPropertyData');
    }
  }, []);

  // --- State Management ---
  // Filter State
  const [priceRange, setPriceRange] = useState<[number, number]>([
    0, 10000000000,
  ]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedInvestmentTypes, setSelectedInvestmentTypes] = useState<
    string[]
  >([]);
  const [activeTab, setActiveTab] = useState<string>("Analytics");

  // Layer Visibility State
  const [heatmapVisible, setHeatmapVisible] = useState<boolean>(false); // Heatmap visibility state
  const [infrastructureVisibility, setInfrastructureVisibility] =
    useState<InfrastructureVisibilityState>(initialInfraVisibility);
  const [regionPopupVisibility, setRegionPopupVisibility] =
    useState<boolean>(false);
  // Data Display State
  const [clickedRegionId, setClickedRegionId] = useState<
    string | number | null
  >(null); // Keep track of clicked region for visual state
  const [regionData, setRegionData] = useState<PopupData | null>(null);
  const [selectedPropertyData, setSelectedPropertyData] =
    useState<SelectedPropertyData | null>(null);

  const [selectedAgeBin, setSelectedAgeBin] = useState<string | null>(null);
  const [selectedReligionBin, setSelectedReligionBin] = useState<string | null>(
    null
  );
  const [binRanges, setBinRanges] = useState<{ [key: string]: number[] }>({});
  const [income, setIncome] = useState<number[]>([4, 7]);

  // Fetch bin ranges
  useEffect(() => {
    fetch("/jenks_breakpoints.json")
      .then((res) => res.json())
      .then((data) => setBinRanges(data))
      .catch((err) => console.error("Failed to load breakpoints:", err));
  }, []);

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

  const handleRegionClick = useCallback(
    (feature: MapGeoJSONFeature, map: Map) => {
      // feature.id can be string, number, or undefined.
      // We need string | number | null for the state.
      const clickedId = feature.id;
      // Check if clickedId is valid (not undefined) before proceeding with state updates that rely p it.
      if (clickedId === undefined || !map) return;

      // Reset previous clicked state if different
      if (clickedRegionId !== null && clickedRegionId !== clickedId) {
        try {
          map.setFeatureState(
            { source: "jakarta", id: clickedRegionId },
            { clicked: false }
          );
        } catch (e) {
          console.error("Error setting feature state:", e);
        }
      }

      // Set new clicked state visually and update React state
      try {
        map.setFeatureState(
          { source: "jakarta", id: clickedId },
          { clicked: true }
        );
      } catch (e) {
        console.error("Error setting feature state:", e);
      }
      setRegionPopupVisibility(true);
      // Ensure we set state with a valid type (string | number | null)
      setClickedRegionId(clickedId ?? null); // Use nullish coalescing to default undefined to null

      // Update sidebar data
      const props = feature.properties;
      if (props) {
        setRegionData({
          regionName: props.name || props.NAMOBJ || "N/A",
          jumlahKecamatan: props.jumlah_kecamatan || 0,
          jumlahDesa: props.jumlah_desa || 0,
          jumlahPenduduk: props.jumlah_penduduk || 0,
          kepadatanPerKm2: props.kepadatan_km2 || 0,
          jumlahLakiLaki: props.jumlah_laki_laki || 0,
          jumlahPerempuan: props.jumlah_perempuan || 0,
          luasWilayahKm2: props.luas_wilayah_km2 || 0,
        });
      } else {
        setRegionData(null);
      }

      // Zoom to region
      zoomToRegion(map, feature);
    },
    [clickedRegionId, regionPopupVisibility]
  ); // Depends on clickedRegionId to reset previous state

  const handleIncomeChange = useCallback((values: number[]) => {
    console.log("handleIncomeChange", values);
    setIncome(values as [number, number]);
  }, []);
  const handleSeeMore = () => {
    setActiveTab("Analytics");
    setRegionPopupVisibility(false);
    setSelectedPropertyData(null);
  };

  const handlePropertyClick = useCallback(
    (feature: MapGeoJSONFeature, map: Map) => {
      const props = feature.properties;
      if (props) {
        const propertyData: SelectedPropertyData = {
          propertyName: props.property_name || "Nama Tidak Tersedia",
          category: props.property_category || "N/A",
          status: props.property_status || "N/A",
          buildingArea: props.building_area ?? "N/A",
          landArea: props.land_area ?? "N/A",
          certificateType: props.certificate_type || "N/A",
          price: props.property_price ?? "N/A",
          propertyUrl: props.property_url,
        };
        setSelectedPropertyData(propertyData);
        
      } else {
        setSelectedPropertyData(null);
      }
    },
    [setActiveTab] // Add setActiveTab to dependency array
  );

  const handleBackgroundClick = useCallback(
    (map: Map) => {
      // Reset clicked region visual state and React state
      if (clickedRegionId !== null) {
        try {
          map.setFeatureState(
            { source: "jakarta", id: clickedRegionId },
            { clicked: false }
          );
        } catch (e) {
          console.error("Error setting feature state:", e);
        }
        setClickedRegionId(null);
      }
      setSelectedPropertyData(null);
      setRegionData(null);
      setRegionPopupVisibility(false);
      // Optionally close property popup if desired on background click
      // setSelectedPropertyData(null);
    },
    [clickedRegionId]
  ); // Depends on clickedRegionId

  // Memoize the handlers passed to the map component
  const mapEventHandlers: MapEventHandlers = useMemo(
    () => ({
      onRegionClick: handleRegionClick,
      onPropertyClick: handlePropertyClick,
      onBackgroundClick: handleBackgroundClick,
      // onRegionHover: handleRegionHover, // Add if needed
      // onPropertyHover: handlePropertyHover, // Add if needed
    }),
    [
      handleRegionClick,
      handlePropertyClick,
      handleBackgroundClick /*, handleRegionHover, handlePropertyHover */,
    ]
  );

  // --- UI Control Handlers ---
  const handlePriceChange = useCallback((values: number[]) => {
    setPriceRange(values as [number, number]);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  const handleInvestmentTypeChange = useCallback((type: string) => {
    setSelectedInvestmentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const handleToggleHeatmap = useCallback(() => {
    setHeatmapVisible((v) => !v);
  }, []);

  const handleInfrastructureToggle = useCallback((layerId: string) => {
    setInfrastructureVisibility((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  }, []);

  const handleClosePropertyInfo = useCallback(() => {
    setSelectedPropertyData(null);
    setRegionPopupVisibility(false);
  }, []);
  // New handler for religion bin
  const handleReligionBinChange = useCallback((bin: string) => {
    setSelectedReligionBin(bin);
  }, []);
  const handleAgeBinChange = useCallback((bin: string) => {
    setSelectedAgeBin(bin);
  }, []);

  // Memoize layer controls passed to map component
  const mapLayerControls: MapLayerControls = useMemo(
    () => ({
      heatmapVisible,
      infrastructureVisibility,
      priceRange,
      selectedCategories,
      selectedInvestmentTypes,
      selectedReligionBin,
      selectedAgeBin,
      binRanges,
      income,
      regionPopupVisibility,
    }),
    [
      heatmapVisible,
      infrastructureVisibility,
      priceRange,
      selectedCategories,
      selectedInvestmentTypes,
      selectedReligionBin,
      selectedAgeBin,
      binRanges,
      income,
      regionPopupVisibility,
    ]
  );

  // Initial Map Options (Optional Overrides)
  const initialMapOptions = useMemo(
    () => ({
      // Example: Override center or zoom if needed dynamically
      // center: [107, -7],
      // zoom: 11
    }),
    []
  );

  // --- Helper Function: Zoom to Region ---
  const zoomToRegion = (map: Map, feature: MapGeoJSONFeature) => {
    const geometry = feature.geometry;
    let calculatedBounds: [number, number, number, number] | null = null; // More specific type

    // Calculation functions - ensure they strictly return the tuple or null
    const calculateBounds = (
      coords: number[][][]
    ): [number, number, number, number] | null => {
      if (!coords || coords.length === 0 || coords[0].length < 3) return null;
      const flatCoords = coords.flat();
      if (flatCoords.length === 0) return null;
      const lons = flatCoords.map((c) => c[0]).filter(isFinite);
      const lats = flatCoords.map((c) => c[1]).filter(isFinite);
      if (lons.length === 0 || lats.length === 0) return null;
      // Return as a specific tuple type
      return [
        Math.min(...lons),
        Math.min(...lats),
        Math.max(...lons),
        Math.max(...lats),
      ];
    };

    const calculateMultiBounds = (
      coords: number[][][][]
    ): [number, number, number, number] | null => {
      if (!coords || coords.length === 0) return null;
      const allCoords = coords.flat(2);
      if (allCoords.length === 0) return null;
      const lons = allCoords.map((c) => c[0]).filter(isFinite);
      const lats = allCoords.map((c) => c[1]).filter(isFinite);
      if (lons.length === 0 || lats.length === 0) return null;
      // Return as a specific tuple type
      return [
        Math.min(...lons),
        Math.min(...lats),
        Math.max(...lons),
        Math.max(...lats),
      ];
    };

    if (geometry.type === "Polygon") {
      calculatedBounds = calculateBounds(geometry.coordinates);
    } else if (geometry.type === "MultiPolygon") {
      calculatedBounds = calculateMultiBounds(geometry.coordinates);
    } else {
      console.warn("Unsupported geometry for zoomToRegion:", geometry.type);
      return;
    }

    if (calculatedBounds) {
      // We know calculatedBounds is [number, number, number, number] here
      const boundsAreFinite = calculatedBounds.every(isFinite); // No need for explicit type 'b' now

      if (
        boundsAreFinite &&
        calculatedBounds[0] <= calculatedBounds[2] && // Access elements directly
        calculatedBounds[1] <= calculatedBounds[3]
      ) {
        // Access elements directly
        // Bounds are valid numbers and logically correct (sw <= ne)
        // Use the confirmed tuple type for fitBounds
        map.fitBounds(calculatedBounds, {
          padding: 40,
          maxZoom: 15,
          essential: true,
        });
      } else {
        console.warn(
          "Invalid or non-finite bounds calculated:",
          calculatedBounds
        );
      }
    } else {
      console.warn("Failed to calculate bounds array for feature:", feature.id);
    }
  };

  // --- JSX Structure ---
  return (
    // Use h-screen and w-screen on the outer div to ensure full viewport height
    <div className="flex relative h-screen w-screen overflow-hidden">
      <NavbarMap />
      {/* Map Component takes up remaining space */}
      <MapComponent
        initialOptions={initialMapOptions}
        layerControls={mapLayerControls}
        eventHandlers={mapEventHandlers}
      />
      {/* Region Info Floating Box */}
      {regionPopupVisibility && !selectedPropertyData && (
        <div className="absolute top-[76px] left-4 z-10 bg-popup p-4 rounded-lg shadow-md bg-white text-black max-w-xs text-sm">
          <h3 className="text-base text-black font-bold mb-2">
            {regionData?.regionName}
          </h3>
          <div className="text-black space-y-1">
            <p>
              <strong className="font-semibold">Jumlah Kecamatan:</strong>{" "}
              {regionData?.jumlahKecamatan}
            </p>
            <p>
              <strong className="font-semibold">Jumlah Desa:</strong>{" "}
              {regionData?.jumlahDesa}
            </p>
            <p>
              <strong className="font-semibold">Jumlah Penduduk:</strong> Rp{" "}
              {regionData?.jumlahPenduduk}
            </p>
            <p>
              <strong className="font-semibold">Kepadatan per km2:</strong>{" "}
              {regionData?.kepadatanPerKm2}
            </p>
            <p>
              <strong className="font-semibold">Jumlah laki-laki:</strong>{" "}
              {regionData?.jumlahLakiLaki}
            </p>
            <p>
              <strong className="font-semibold">Jumlah perempuan:</strong>{" "}
              {regionData?.jumlahPerempuan}
            </p>
            <p>
              <strong className="font-semibold">luas wilayah (km2):</strong>{" "}
              {regionData?.luasWilayahKm2}
            </p>
          </div>
          <div className="mt-3 flex justify-between items-center">
            <button
              onClick={() => setRegionPopupVisibility(false)} // Use the handler
              className="text-xs text-red-500 hover:underline  focus:outline-none"
            >
              Tutup
            </button>
            {/* <button
              className="text-black text-xs hover:underline focus:outline-none"
              onClick={handleSeeMore}
            >
              See More
            </button> */}
          </div>
        </div>
      )}

      {/* Property Info Floating Box */}
      {selectedPropertyData && (
        <div className="absolute top-[76px] left-4 z-10 bg-white p-4 rounded-lg shadow-md text-black max-w-xs text-sm">
          <h3 className="text-base font-bold mb-2">
            {selectedPropertyData.propertyName}
          </h3>
          {selectedPropertyData.propertyUrl && (
            <Image
              src={selectedPropertyData.propertyUrl}
              alt={selectedPropertyData.propertyName}
              width={300}
              height={300}
              className="w-full mb-2 max-h-48 object-cover"
            />
          )}
          <div className="space-y-1">
            <p>
              <strong className="font-semibold">Kategori:</strong>{" "}
              {selectedPropertyData.category}
            </p>
            <p>
              <strong className="font-semibold">Status:</strong>{" "}
              {selectedPropertyData.status}
            </p>
            <p>
              <strong className="font-semibold">Harga:</strong> Rp{" "}
              {selectedPropertyData.price?.toLocaleString("id-ID") ?? "N/A"}
            </p>
            <p>
              <strong className="font-semibold">Luas Bangunan:</strong>{" "}
              {selectedPropertyData.buildingArea?.toLocaleString("id-ID") ??
                "N/A"}{" "}
              {selectedPropertyData.buildingArea !== "N/A" && "m²"}
            </p>
            <p>
              <strong className="font-semibold">Luas Tanah:</strong>{" "}
              {selectedPropertyData.landArea?.toLocaleString("id-ID") ?? "N/A"}{" "}
              {selectedPropertyData.landArea !== "N/A" && "m²"}
            </p>
            <p>
              <strong className="font-semibold">Sertifikat:</strong>{" "}
              {selectedPropertyData.certificateType}
            </p>
          </div>
          <div className="mt-3 flex justify-between items-center">
            <button
              onClick={handleClosePropertyInfo} // Use the handler
              className="text-xs text-red-600 hover:text-red-800 hover:underline focus:outline-none"
            >
              Tutup
            </button>

            {/* <button
              onClick={handleSeeMore}
              className="text-xs text-black hover:underline focus:outline-none"
            >
              See More
            </button> */}
          </div>
        </div>
      )}
      <Menu
        priceRange={priceRange}
        onPriceChange={handlePriceChange}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
        selectedInvestmentTypes={selectedInvestmentTypes}
        onInvestmentTypeChange={handleInvestmentTypeChange}
        heatmapVisible={heatmapVisible}
        onToggleHeatmap={handleToggleHeatmap}
        infrastructureVisibility={infrastructureVisibility}
        onToggleInfrastructure={handleInfrastructureToggle}
        selectedReligionBin={selectedReligionBin}
        onReligionBinChange={handleReligionBinChange}
        selectedAgeBin={selectedAgeBin}
        onAgeBinChange={handleAgeBinChange}
        binRanges={binRanges}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        income={income}
        setIncome={handleIncomeChange}
        selectedPropertyData={selectedPropertyData}
        regionData={regionData}
      />
      {selectedAgeBin && (
        <div className="absolute z-20 bottom-4 left-4 max-w-40 w-[80vw] md:w-64 p-3 rounded-lg bg-white text-black shadow-md">
          <h4 className="font-bold mb-2 text-sm">Legend</h4>
          {getRangeLabels(selectedAgeBin).map((range, index) => (
            <div key={index} className="flex items-center mb-1 text-sm">
              <span
                className="w-4 h-4 mr-2 inline-block"
                style={{ backgroundColor: colorScale[index] }}
              ></span>
              <span>{range}</span>
            </div>
          ))}
        </div>
      )}
      {selectedReligionBin && (
        <div className="absolute z-20 bottom-4 left-4 max-w-40 w-[80vw] md:w-64 p-3 rounded-lg bg-white text-black shadow-md mt-2">
          <h4 className="font-bold mb-2 text-sm">Legend</h4>
          {getRangeLabels(selectedReligionBin).map((range, index) => (
            <div key={index} className="flex items-center mb-1 text-sm">
              <span
                className="w-4 h-4 mr-2 inline-block"
                style={{ backgroundColor: colorScale[index] }}
              ></span>
              <span>{range}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
