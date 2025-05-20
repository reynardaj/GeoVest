"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import type { MapGeoJSONFeature, Map, LngLatBoundsLike } from "maplibre-gl";
import { Resizable } from "re-resizable";

import MapComponent from "@/components/map/MapComponent";

import type {
  PopupData,
  SelectedPropertyData,
  MapEventHandlers,
  MapLayerControls,
  InfrastructureVisibilityState,
} from "@/types/map";

// Import Constants
import {
  INFRASTRUCTURE_LAYERS,
  BASE_MAP_STYLES,
  DEFAULT_BASE_MAP_ID,
} from "@/config/mapConstants"; // Adjust path
import Menu from "@/components/Menu";
import Image from "next/image";
import NavbarMap from "@/components/NavbarMap";
import { AlignCenter } from "lucide-react";
import BaseMapSwitcher from "@/components/map/BaseMapSwitcher";

const colorScale = ["#f7fbff", "#c6dbef", "#9ecae1", "#6baed6", "#08306b"];

const initialInfraVisibility: InfrastructureVisibilityState =
  INFRASTRUCTURE_LAYERS.reduce((acc, layer) => {
    acc[layer.id] = false;
    return acc;
  }, {} as InfrastructureVisibilityState);

export default function MapPage() {
  const [selectedPropertyToFocus, setSelectedPropertyToFocus] = useState<
    [number, number, number] | null
  >(null);

  const [religionOpacity, setReligionOpacity] = useState<number>(15);
  const [ageOpacity, setAgeOpacity] = useState<number>(15);
  // Renamed from Page for clarity
  useEffect(() => {
    const storedCoordinates = localStorage.getItem(
      "selectedPropertyCoordinates"
    );
    const storedPropertyData = localStorage.getItem("selectedPropertyData");

    if (storedCoordinates) {
      const coords = JSON.parse(storedCoordinates) as [number, number, number];
      localStorage.removeItem("selectedPropertyCoordinates");
      setSelectedPropertyToFocus(coords);
    }
    if (storedPropertyData) {
      const parsedPropertyData = JSON.parse(
        storedPropertyData
      ) as SelectedPropertyData;
      setSelectedPropertyData(parsedPropertyData);
      localStorage.removeItem("selectedPropertyData");
    }
  }, []);

  const [priceRange, setPriceRange] = useState<[number, number]>([
    0, 10000000000,
  ]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedInvestmentTypes, setSelectedInvestmentTypes] = useState<
    string[]
  >([]);
  const [activeTab, setActiveTab] = useState<string>("Analytics");

  // Layer Visibility State

  const [floodVisible, setFloodVisible] = useState<boolean>(false);

  const [infrastructureVisibility, setInfrastructureVisibility] =
    useState<InfrastructureVisibilityState>(initialInfraVisibility);
  const [regionPopupVisibility, setRegionPopupVisibility] =
    useState<boolean>(false);
  const [clickedRegionId, setClickedRegionId] = useState<
    string | number | null
  >(null);
  const [regionData, setRegionData] = useState<PopupData | null>(null);
  const [selectedPropertyData, setSelectedPropertyData] =
    useState<SelectedPropertyData | null>(null);

  const [selectedAgeBin, setSelectedAgeBin] = useState<string | null>(null);
  const [selectedReligionBin, setSelectedReligionBin] = useState<string | null>(
    null
  );
  const [binRanges, setBinRanges] = useState<{ [key: string]: number[] }>({});
  const [income, setIncome] = useState<number[]>([4, 7]);
  const [targetMapCenter, setTargetMapCenter] = useState<
    [number, number] | null
  >(null);
  const [selectedBaseMapId, setSelectedBaseMapId] =
    useState<string>(DEFAULT_BASE_MAP_ID);

  const [isMobile, setIsMobile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();

    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

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
      const clickedId = feature.id;
      if (clickedId === undefined || !map) return;

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

      try {
        map.setFeatureState(
          { source: "jakarta", id: clickedId },
          { clicked: true }
        );
      } catch (e) {
        console.error("Error setting feature state:", e);
      }
      setRegionPopupVisibility(true);
      setClickedRegionId(clickedId ?? null);

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

      zoomToRegion(map, feature);
    },
    [clickedRegionId, regionPopupVisibility]
  );

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
    [setActiveTab, isMobile]
  );

  const handleBackgroundClick = useCallback(
    (map: Map) => {
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
    },
    [clickedRegionId]
  ); // Depends on clickedRegionId

  const handleRegionBarZoom = useCallback((center: [number, number]) => {
    console.log("MapPage: handleRegionBarZoom triggered with center:", center);
    setTargetMapCenter(center);
  }, []);

  // Memoize the handlers passed to the map component
  const mapEventHandlers: MapEventHandlers = useMemo(
    () => ({
      onRegionClick: handleRegionClick,
      onPropertyClick: handlePropertyClick,
      onBackgroundClick: handleBackgroundClick,
    }),
    [handleRegionClick, handlePropertyClick, handleBackgroundClick]
  );

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

  const handleToggleFlood = useCallback(() => {
    setFloodVisible((v) => !v);
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
  const handleReligionBinChange = useCallback((bin: string) => {
    setSelectedReligionBin(bin);
  }, []);
  const handleAgeBinChange = useCallback((bin: string) => {
    setSelectedAgeBin(bin);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);
  const handleBaseMapChange = useCallback((baseMapId: string) => {
    setSelectedBaseMapId(baseMapId);
  }, []);
  const selectedBaseMapStyleUrl = useMemo(() => {
    return (
      BASE_MAP_STYLES.find((style) => style.id === selectedBaseMapId)?.url ||
      BASE_MAP_STYLES[0].url
    );
  }, [selectedBaseMapId]);

  const mapLayerControls: MapLayerControls = useMemo(
    () => ({
      floodVisible,
      infrastructureVisibility,
      priceRange,
      selectedCategories,
      selectedInvestmentTypes,
      selectedReligionBin,
      selectedAgeBin,
      binRanges,
      income,
      regionPopupVisibility,
      targetMapCenter,
      religionOpacity,
      ageOpacity,
    }),
    [
      floodVisible,
      infrastructureVisibility,
      priceRange,
      selectedCategories,
      selectedInvestmentTypes,
      selectedReligionBin,
      selectedAgeBin,
      binRanges,
      income,
      regionPopupVisibility,
      targetMapCenter,
      religionOpacity,
      ageOpacity,
    ]
  );

  const initialMapOptions = useMemo(() => ({}), []);

  const zoomToRegion = (map: Map, feature: MapGeoJSONFeature) => {
    const geometry = feature.geometry;
    let calculatedBounds: [number, number, number, number] | null = null;
    const calculateBounds = (
      coords: number[][][]
    ): [number, number, number, number] | null => {
      if (!coords || coords.length === 0 || coords[0].length < 3) return null;
      const flatCoords = coords.flat();
      if (flatCoords.length === 0) return null;
      const lons = flatCoords.map((c) => c[0]).filter(isFinite);
      const lats = flatCoords.map((c) => c[1]).filter(isFinite);
      if (lons.length === 0 || lats.length === 0) return null;
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
      const boundsAreFinite = calculatedBounds.every(isFinite);

      if (
        boundsAreFinite &&
        calculatedBounds[0] <= calculatedBounds[2] &&
        calculatedBounds[1] <= calculatedBounds[3]
      ) {
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
    <div className="flex flex-col h-screen w-screen overflow-hidden relative">
      <NavbarMap />

      {/* Main content with resizable sidebar and map */}
      <div className="flex flex-row flex-grow w-full h-full">
        {/* Map and overlays */}
        <div
          className="absolute top-0 left-0 bottom-0 right-0"
          style={{ right: isMobile ? 0 : undefined }}
        >
          <MapComponent
            initialOptions={initialMapOptions}
            layerControls={mapLayerControls}
            eventHandlers={mapEventHandlers}
            baseMapStyleUrl={selectedBaseMapStyleUrl}
            key={selectedBaseMapId}
          />

          {/* Mobile Burger Menu Button */}
          {isMobile && (
            <button
              onClick={toggleDrawer}
              className="fixed top-2 right-3 z-20 flex items-center justify-center w-14 h-14 bg-white rounded-xl shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#17488D]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isDrawerOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          )}

          {/* Region Info Floating Box */}
          {regionPopupVisibility && !selectedPropertyData && (
            <div className="absolute top-[76px] left-4 z-10 bg-popup p-4 rounded-xl shadow-md bg-white text-black max-w-xs text-sm">
              <h3 className="text-base text-black font-bold mb-2">
                {regionData?.regionName}
              </h3>
              <div className="text-black space-y-1">
                <p>
                  <strong className="font-semibold">Jumlah Kecamatan:</strong>{" "}
                  {regionData?.jumlahKecamatan?.toLocaleString("id-ID")}
                </p>
                <p>
                  <strong className="font-semibold">Jumlah Desa:</strong>{" "}
                  {regionData?.jumlahDesa?.toLocaleString("id-ID")}
                </p>
                <p>
                  <strong className="font-semibold">Jumlah Penduduk:</strong> Rp{" "}
                  {regionData?.jumlahPenduduk?.toLocaleString("id-ID")}
                </p>
                <p>
                  <strong className="font-semibold">
                    Kepadatan per km<sup>2</sup> :
                  </strong>{" "}
                  {regionData?.kepadatanPerKm2?.toLocaleString("id-ID")}
                </p>
                <p>
                  <strong className="font-semibold">Jumlah laki-laki:</strong>{" "}
                  {regionData?.jumlahLakiLaki?.toLocaleString("id-ID")}
                </p>
                <p>
                  <strong className="font-semibold">Jumlah perempuan:</strong>{" "}
                  {regionData?.jumlahPerempuan?.toLocaleString("id-ID")}
                </p>
                <p>
                  <strong className="font-semibold">
                    Luas wilayah (km<sup>2</sup>):
                  </strong>{" "}
                  {regionData?.luasWilayahKm2?.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <button
                  onClick={() => setRegionPopupVisibility(false)} // Use the handler
                  className="text-xs text-red-500 hover:underline  focus:outline-none"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}

          {/* Property Info Floating Box */}
          {selectedPropertyData && (
            <div className="absolute top-[76px] left-4 z-10 bg-white p-4 rounded-xl shadow-md text-black max-w-xs text-sm">
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
                  unoptimized
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
                    "N/A"}
                  {selectedPropertyData.buildingArea !== "N/A" && " m²"}
                </p>
                <p>
                  <strong className="font-semibold">Luas Tanah:</strong>{" "}
                  {selectedPropertyData.landArea?.toLocaleString("id-ID") ??
                    "N/A"}
                  {selectedPropertyData.landArea !== "N/A" && " m²"}
                </p>
                <p>
                  <strong className="font-semibold">Sertifikat:</strong>{" "}
                  {selectedPropertyData.certificateType}
                </p>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <button
                  onClick={handleClosePropertyInfo}
                  className="text-xs text-red-600 hover:text-red-800 hover:underline focus:outline-none"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Drawer Menu */}
        {isMobile && (
          <div
            className={`fixed inset-y-0 right-0 z-30 bg-white shadow-xl transition-transform duration-300 ease-in-out w-[85%] max-w-sm transform ${
              isDrawerOpen ? "translate-x-0" : "translate-x-full"
            } overflow-hidden`}
          >
            <Menu
              priceRange={priceRange}
              onPriceChange={handlePriceChange}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
              selectedInvestmentTypes={selectedInvestmentTypes}
              onInvestmentTypeChange={handleInvestmentTypeChange}
              floodVisible={floodVisible}
              onToggleFlood={handleToggleFlood}
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
              onRegionBarZoom={handleRegionBarZoom}
              religionOpacity={religionOpacity}
              onReligionOpacityChange={setReligionOpacity}
              ageOpacity={ageOpacity}
              onAgeOpacityChange={setAgeOpacity}
            />
          </div>
        )}

        {/* Overlay when drawer is open on mobile */}
        {isMobile && isDrawerOpen && (
          <div
            className="fixed h-full inset-0 bg-black bg-opacity-50 z-20"
            onClick={toggleDrawer}
          />
        )}

        {/* Desktop Resizable Sidebar */}
        {!isMobile && (
          <Resizable
            defaultSize={{ width: 400, height: "100%" }}
            minWidth={400}
            maxWidth="50vw"
            enable={{ left: true }}
            handleComponent={{
              left: (
                <div
                  style={{
                    width: 8,
                    height: "100%",
                    cursor: "col-resize",
                    backgroundColor: "#b8b8b8",
                  }}
                />
              ),
            }}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              backgroundColor: "white",
              boxShadow: "-2px 0 5px rgba(0,0,0,0.1)",
              overflowY: "auto",
              zIndex: 10,
            }}
          >
            <Menu
              priceRange={priceRange}
              onPriceChange={handlePriceChange}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
              selectedInvestmentTypes={selectedInvestmentTypes}
              onInvestmentTypeChange={handleInvestmentTypeChange}
              floodVisible={floodVisible}
              onToggleFlood={handleToggleFlood}
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
              onRegionBarZoom={handleRegionBarZoom}
              religionOpacity={religionOpacity}
              onReligionOpacityChange={setReligionOpacity}
              ageOpacity={ageOpacity}
              onAgeOpacityChange={setAgeOpacity}
            />
          </Resizable>
        )}
        <div className="absolute z-20 bottom-4 left-4 flex gap-3 items-end">
          <BaseMapSwitcher
            selectedBaseMapId={selectedBaseMapId}
            onBaseMapChange={handleBaseMapChange}
          />
          {(selectedAgeBin || selectedReligionBin) && (
            <div className="flex align-bottom gap-3">
              {selectedAgeBin && (
                <div className="max-w-40 w-[80vw] md:w-64 p-3 rounded-xl bg-white text-black shadow-md mt-auto">
                  <h4 className="font-bold mb-2 text-sm">
                    {selectedAgeBin.replace(/_[0-9]+.*|_>.*|_/g, " ").trim()}
                  </h4>
                  {getRangeLabels(selectedAgeBin).map((range, index) => (
                    <div
                      key={`age-${index}`}
                      className="flex items-center mb-1 text-sm"
                    >
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
                <div className="max-w-40 w-[80vw] md:w-64 p-3 rounded-xl bg-white text-black shadow-md ">
                  <h4 className="font-bold mb-2 text-sm">
                    {selectedReligionBin
                      .replace(/_bin$/, "")
                      .replace(/(^|_)(\w)/g, (_, __, letter) =>
                        letter.toUpperCase()
                      )
                      .replace(
                        /\w\S*/g,
                        (txt) =>
                          txt.charAt(0).toUpperCase() +
                          txt.substr(1).toLowerCase()
                      )}
                  </h4>
                  {getRangeLabels(selectedReligionBin).map((range, index) => (
                    <div
                      key={`religion-${index}`}
                      className="flex items-center mb-1 text-sm"
                    >
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
          )}
        </div>
      </div>
    </div>
  );
}
