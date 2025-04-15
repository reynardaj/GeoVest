// src/app/your-map-route/page.tsx
/* eslint-disable react-hooks/exhaustive-deps */ // Keep if needed for useCallback dependencies
"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import type { MapGeoJSONFeature, Map, LngLatBoundsLike } from "maplibre-gl"; // Import necessary types

// Import Components
import SidebarComponent from "@/components/sidebar/SidebarComponent"; // Adjust path
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

// Initialize infrastructure visibility state dynamically
const initialInfraVisibility: InfrastructureVisibilityState =
  INFRASTRUCTURE_LAYERS.reduce((acc, layer) => {
    acc[layer.id] = false; // Start with all false
    return acc;
  }, {} as InfrastructureVisibilityState);

export default function MapPage() {
  // Renamed from Page for clarity

  // --- State Management ---
  // Filter State
  const [priceRange, setPriceRange] = useState<[number, number]>([
    0, 5000000000,
  ]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedInvestmentTypes, setSelectedInvestmentTypes] = useState<
    string[]
  >([]);

  // Layer Visibility State
  const [heatmapVisible, setHeatmapVisible] = useState<boolean>(false); // Heatmap visibility state
  const [infrastructureVisibility, setInfrastructureVisibility] =
    useState<InfrastructureVisibilityState>(initialInfraVisibility);

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

  // Fetch bin ranges
  useEffect(() => {
    fetch("/jenks_breakpoints.json")
      .then((res) => res.json())
      .then((data) => setBinRanges(data))
      .catch((err) => console.error("Failed to load breakpoints:", err));
  }, []);

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
    [clickedRegionId]
  ); // Depends on clickedRegionId to reset previous state

  const handlePropertyClick = useCallback(
    (feature: MapGeoJSONFeature, map: Map) => {
      const props = feature.properties;
      if (props) {
        const propertyData: SelectedPropertyData = {
          propertyName: props.property_name || "Nama Tidak Tersedia",
          category: props.property_category || "N/A",
          status: props.property_status || "N/A",
          buildingArea: props.building_area ?? "N/A", // Keep raw, format in display
          landArea: props.land_area ?? "N/A", // Keep raw, format in display
          certificateType: props.certificate_type || "N/A",
          price: props.property_price ?? "N/A", // Keep raw, format in display
          url: props.property_url,
        };
        setSelectedPropertyData(propertyData); // Update state for the floating box
      } else {
        setSelectedPropertyData(null);
      }
    },
    []
  ); // No dependencies needed here

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
      // Clear sidebar info
      setRegionData(null);
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
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Map Component takes up remaining space */}
      <MapComponent
        initialOptions={initialMapOptions}
        layerControls={mapLayerControls}
        eventHandlers={mapEventHandlers}
      />

      {/* Property Info Floating Box */}
      {selectedPropertyData && (
        <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-md text-black max-w-xs text-sm">
          <h3 className="text-base font-bold mb-2">
            {selectedPropertyData.propertyName}
          </h3>
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
            {selectedPropertyData.url ? (
              <a
                href={selectedPropertyData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                Lihat Detail
              </a>
            ) : (
              <span className="text-xs text-gray-500">Detail Tdk Tersedia</span>
            )}
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
      />
    </div>
  );
}
