/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import type {
  Map,
  MapGeoJSONFeature,
  ExpressionSpecification,
  LngLatBoundsLike,
  MapMouseEvent,
} from "maplibre-gl"; // Added MapMouseEvent
import "maplibre-gl/dist/maplibre-gl.css";
import { Range } from "react-range";
import DemographicMap2 from "@/components/DemographicMap2";

// Define the structure for popup data for clarity
interface PopupData {
  regionName: string | number;
  jumlahKecamatan: number;
  jumlahDesa: number;
  jumlahPenduduk: number;
  kepadatanPerKm2: number;
  jumlahLakiLaki: number;
  jumlahPerempuan: number;
  luasWilayahKm2: number;
}

// Define structure for infrastructure layers for clarity
interface InfrastructureLayer {
  id: string; // Corresponds to GeoJSON source/layer ID
  name: string; // Display name for checkbox
  iconUrl: string; // Placeholder image URL
  iconId: string; // ID used in MapLibre style
}
interface SelectedPropertyData {
  propertyName: string;
  category: string;
  status: string;
  buildingArea: number | string; // Allow string for "N/A" or similar
  landArea: number | string; // Allow string for "N/A" or similar
  certificateType: string;
  price: number | string; // Allow string for "N/A" or similar
  url?: string; // Optional: If you want to use the URL for "See More"
}

const Page = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const hoveredRegionIdRef = useRef<string | number | null>(null);
  const hoveredPropertyIdRef = useRef<string | number | null>(null);

  // State
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // Heatmap
  const [popupData, setPopupData] = useState<PopupData | null>(null);
  const [priceRange, setPriceRange] = useState([0, 5000000000]); // Reduced max to 5 billion
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedInvestmentTypes, setSelectedInvestmentTypes] = useState<
    string[]
  >([]); // New state for investment types
  const [clickedRegionId, setClickedRegionId] = useState<
    string | number | null
  >(null); // State for clicked region
  const [selectedPropertyData, setSelectedPropertyData] =
    useState<SelectedPropertyData | null>(null);
  // NEW: State for infrastructure layer visibility
  const [infrastructureVisibility, setInfrastructureVisibility] = useState<{
    [key: string]: boolean;
  }>({
    "rumah-sakit": false,
    bandara: false,
    "pusat-perbelanjaan": false,
    pendidikan: false,
    // NEW: Add other infrastructure layers here if needed
    "rel-kereta": false,
    transjakarta: false,
  });

  // Refs to hold latest state for use in listeners
  const priceRangeRef = useRef(priceRange);
  const selectedCategoriesRef = useRef(selectedCategories);
  const selectedInvestmentTypesRef = useRef(selectedInvestmentTypes);
  const clickedRegionIdRef = useRef(clickedRegionId); // Ref for clicked region ID

  // Keep refs updated
  useEffect(() => {
    priceRangeRef.current = priceRange;
  }, [priceRange]);
  useEffect(() => {
    selectedCategoriesRef.current = selectedCategories;
  }, [selectedCategories]);
  useEffect(() => {
    selectedInvestmentTypesRef.current = selectedInvestmentTypes;
  }, [selectedInvestmentTypes]);
  useEffect(() => {
    clickedRegionIdRef.current = clickedRegionId;
  }, [clickedRegionId]); // Keep clickedRegionIdRef updated

  const propertyCategories = ["Apartemen", "Ruko", "Rumah", "Gudang", "Kos"];
  const investmentTypes = ["Jual", "Beli"]; // New investment types

  // NEW: Define infrastructure layers configuration
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
    // NEW: Add other infrastructure layers here
    {
      id: "rel-kereta",
      name: "Rel Kereta",
      iconUrl: "/icons/icon-rs.png",
      iconId: "rail-icon",
    }, // Note: Rel Kereta is usually a line, might need different layer type
    {
      id: "transjakarta",
      name: "TransJakarta",
      iconUrl: "/icons/icon-rs.png",
      iconId: "bus-icon",
    },
  ];

  // Create a memoized filter function
  const applyPropertiesFilter = useCallback(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const propertiesLayerId = "properties";

    // Check if style is loaded
    if (!map.isStyleLoaded()) {
      console.log("Style is not loaded yet");
      return;
    }

    // Check if properties layer exists
    if (!map.getLayer(propertiesLayerId)) {
      console.log("Properties layer not found");
      return;
    }

    // Build filter conditions
    let filterConditions: ExpressionSpecification[] = [
      [">=", ["get", "property_price"], priceRangeRef.current[0]],
      ["<=", ["get", "property_price"], priceRangeRef.current[1]],
    ];

    // Add category filter if selected
    if (selectedCategoriesRef.current.length > 0) {
      filterConditions.push([
        "in",
        ["get", "property_category"],
        ["literal", selectedCategoriesRef.current],
      ]);
    }

    // Add investment type filter if selected
    const currentInvestmentTypes = selectedInvestmentTypesRef.current;
    if (currentInvestmentTypes.length === 0) {
      // No investment types selected, show all
      filterConditions.push(["has", "property_status"]);
    } else if (currentInvestmentTypes.length === 1) {
      // Single investment type selected
      filterConditions.push([
        "==",
        ["get", "property_status"],
        currentInvestmentTypes[0],
      ]);
    } else {
      // Multiple investment types selected (Jual and Beli)
      filterConditions.push([
        "any",
        ["==", ["get", "property_status"], "Jual"],
        ["==", ["get", "property_status"], "Beli"],
      ]);
    }

    // Apply filter
    map.setFilter(propertiesLayerId, ["all", ...filterConditions]);
    map.setLayoutProperty(propertiesLayerId, "visibility", "visible");
  }, [mapRef, selectedCategoriesRef]);
  useEffect(() => {
    // Apply filter immediately when categories change
    applyPropertiesFilter();
    // Make sure applyPropertiesFilter is memoized with useCallback if it causes issues,
    // but given its dependencies, it should be stable enough.
  }, [selectedCategories, applyPropertiesFilter]);
  // Update the price change handler
  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    // Apply filter immediately when price changes
    applyPropertiesFilter();
  };

  // Effect to apply filters when investment types change
  useEffect(() => {
    applyPropertiesFilter();
  }, [selectedInvestmentTypes, applyPropertiesFilter]);

  // --- Map Initialization and Static Listener Setup ---
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = new maplibregl.Map({
        /* ... map options ... */ container: mapContainerRef.current,
        style:
          "https://api.maptiler.com/maps/streets/style.json?key=Xyghbo5YEVnVdA3iTYjo", // Replace with your key
        center: [106.8456, -6.2088],
        zoom: 10,
      });
      mapRef.current = map;

      map.on("load", async () => {
        // Make load handler async
        if (!mapRef.current) return;
        const map = mapRef.current; // Use map instance directly

        // Add Sources (Existing)
        const geoJsonFiles = [
          "jakarta",
          "flood",
          "properties",
          // Include infrastructure sources here
          "bandara",
          //   "demografi", // Note: Demografi source seems unused for layers?
          "pusat-perbelanjaan",
          "rel-kereta",
          "transjakarta",
          "rumah-sakit",
          "pendidikan",
        ];

        geoJsonFiles.forEach((fileName) => {
          // Check if source already exists (optional safety)
          if (!map.getSource(fileName)) {
            map.addSource(fileName, {
              type: "geojson",
              data: `/${fileName}.geojson`,
              generateId: true, // Important for potential interactions later
            });
          }
        });

        // --- Add Base Layers (Jakarta Fill/Border) ---
        map.addLayer({
          id: "jakarta_fill",
          type: "fill",
          source: "jakarta",
          layout: {},
          paint: {
            "fill-color": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              "#FF0000", // Hover color red
              ["boolean", ["feature-state", "clicked"], false],
              "#ADD8E6", // Light Blue when clicked (adjust as needed)
              "#627BC1", // Default color blue
            ],
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "clicked"], false],
              0.2, // <<< Slightly visible when clicked
              ["boolean", ["feature-state", "hover"], false],
              0.8, // Hover opacity
              0.6, // Default opacity
            ],
          },
        });
        map.addLayer({
          id: "jakarta_border",
          type: "line",
          source: "jakarta",
          layout: {},
          paint: { "line-color": "#627BC1", "line-width": 2 },
        });

        // --- Load Icons for Infrastructure Layers ---
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

        try {
          await Promise.all(loadImagePromises);

          // --- Add Infrastructure Layers (AFTER icons are loaded) ---
          infrastructureLayers.forEach((layer) => {
            // Special case for 'rel-kereta' - typically a line
            if (layer.id === "rel-kereta") {
              if (!map.getLayer("rel-kereta-layer")) {
                // Check if layer exists
                map.addLayer({
                  id: "rel-kereta-layer", // Give specific ID
                  type: "line",
                  source: layer.id, // Source ID is 'rel-kereta'
                  layout: {
                    visibility: infrastructureVisibility[layer.id]
                      ? "visible"
                      : "none", // Initial visibility based on state
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
                // Check if layer exists
                map.addLayer({
                  id: layer.id, // Layer ID same as source ID
                  type: "symbol",
                  source: layer.id, // Source ID matches
                  layout: {
                    "icon-image": layer.iconId, // Use the loaded icon ID
                    "icon-size": 0.4, // Adjust size as needed
                    "icon-allow-overlap": true, // Prevent icons hiding each other
                    visibility: infrastructureVisibility[layer.id]
                      ? "visible"
                      : "none", // Initial visibility based on state
                  },
                  paint: {}, // No paint properties needed for basic icons
                });
              }
            }
          });
        } catch (error) {
          console.error(
            "Error loading one or more infrastructure icons:",
            error
          );
        }

        // --- Add Properties Layer ---
        map.addLayer({
          id: "properties",
          type: "circle",
          source: "properties",
          layout: { visibility: "visible" }, // Initially visible
          paint: {
            /* ... properties paint ... */ "circle-radius": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              10,
              6,
            ],
            "circle-color": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              "#FF8C00",
              "#007bff",
            ],
            "circle-stroke-width": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              2,
              1,
            ],
            "circle-stroke-color": "#ffffff",
          },
        });

        // --- Add Flood Heatmap Layer ---
        map.addLayer({
          id: "flood_heatmap",
          type: "heatmap",
          source: "flood",
          maxzoom: 15,
          layout: { visibility: isVisible ? "visible" : "none" }, // Initial visibility
          paint: {
            /* ... heatmap paint ... */ "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              1,
              15,
              3,
            ],
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(0, 0, 255, 0)",
              0.2,
              "royalblue",
              0.4,
              "cyan",
              0.6,
              "limegreen",
              0.8,
              "yellow",
              1,
              "red",
            ],
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              15,
              15,
              30,
            ],
            "heatmap-opacity": 0.8,
          },
        });

        setIsMapLoaded(true); // Set map loaded state here

        // --- Event Listeners (Existing) ---
        // --- Region Click Listener ---
        map.on(
          "click",
          "jakarta_fill",
          (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
            const feature = e.features?.[0];
            if (!feature || !feature.id || !map) return;

            const clickedId = feature.id;
            const propertiesLayerId = "properties";
            e.originalEvent.preventDefault(); // Prevent background click

            // Reset previous clicked state if different
            if (
              clickedRegionIdRef.current !== null &&
              clickedRegionIdRef.current !== clickedId
            ) {
              map.setFeatureState(
                { source: "jakarta", id: clickedRegionIdRef.current },
                { clicked: false }
              );
            }

            // Set new clicked state and update React state
            map.setFeatureState(
              { source: "jakarta", id: clickedId },
              { clicked: true }
            );
            setClickedRegionId(clickedId);

            // Update sidebar popup data
            const props = feature.properties;
            if (props) {
              setPopupData({
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
              setPopupData(null);
            }

            // Zoom to the region
            zoomToRegion(map, feature);
          }
        );

        // --- Properties Click Listener ---
        map.on("click", "properties", (e) => {
          if (!map || !e.features || e.features.length === 0) return;
          e.originalEvent.preventDefault(); // Prevent background click

          const feature = e.features[0];
          const props = feature.properties;

          if (props) {
            // Extract and format data for the new container
            const propertyData: SelectedPropertyData = {
              propertyName: props.property_name || "Nama Tidak Tersedia",
              category: props.property_category || "N/A",
              status: props.property_status || "N/A",
              buildingArea:
                props.building_area?.toLocaleString("id-ID") ?? "N/A", // Format with locale
              landArea: props.land_area?.toLocaleString("id-ID") ?? "N/A", // Format with locale
              certificateType: props.certificate_type || "N/A",
              price: props.property_price?.toLocaleString("id-ID") ?? "N/A", // Format with locale
              url: props.property_url, // Include URL if needed for "See More"
            };
            setSelectedPropertyData(propertyData);
          } else {
            setSelectedPropertyData(null); // Hide container if no properties
          }
        });

        // --- Background Click Listener ---
        map.on("click", (e) => {
          if (e.originalEvent.defaultPrevented) return; // Ignore if handled by other layers
          if (!map) return;
          const propertiesLayerId = "properties";

          // Reset clicked region state
          if (clickedRegionIdRef.current !== null) {
            map.setFeatureState(
              { source: "jakarta", id: clickedRegionIdRef.current },
              { clicked: false }
            );
            setClickedRegionId(null);
          }

          setPopupData(null); // Close sidebar info
        });

        // --- Mousemove/Mouseleave Listeners (Existing) ---
        map.on("mousemove", "jakarta_fill", (e) => {
          if (!map || !e.features || e.features.length === 0) return;
          const featureId = e.features[0].id;
          if (
            featureId !== undefined &&
            featureId !== hoveredRegionIdRef.current
          ) {
            if (hoveredRegionIdRef.current !== null)
              map.setFeatureState(
                { source: "jakarta", id: hoveredRegionIdRef.current },
                { hover: false }
              );
            hoveredRegionIdRef.current = featureId;
            map.setFeatureState(
              { source: "jakarta", id: featureId },
              { hover: true }
            );
          }
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "jakarta_fill", () => {
          if (!map) return;
          if (hoveredRegionIdRef.current !== null)
            map.setFeatureState(
              { source: "jakarta", id: hoveredRegionIdRef.current },
              { hover: false }
            );
          hoveredRegionIdRef.current = null;
          if (!hoveredPropertyIdRef.current) map.getCanvas().style.cursor = "";
        });
        map.on("mousemove", "properties", (e) => {
          if (!map || !e.features || e.features.length === 0) return;
          const featureId = e.features[0].id; // Use generated ID if available, or property ID
          if (
            featureId !== undefined &&
            featureId !== hoveredPropertyIdRef.current
          ) {
            if (hoveredPropertyIdRef.current !== null)
              map.setFeatureState(
                { source: "properties", id: hoveredPropertyIdRef.current },
                { hover: false }
              );
            hoveredPropertyIdRef.current = featureId;
            map.setFeatureState(
              { source: "properties", id: featureId },
              { hover: true }
            );
          }
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "properties", () => {
          if (!map) return;
          if (hoveredPropertyIdRef.current !== null)
            map.setFeatureState(
              { source: "properties", id: hoveredPropertyIdRef.current },
              { hover: false }
            );
          hoveredPropertyIdRef.current = null;
          if (!hoveredRegionIdRef.current) map.getCanvas().style.cursor = "";
        });

        // Trigger initial zoom logic once map is fully ready
        map.fire("zoomend");
      }); // End map.on("load")

      map.on("error", (e) => {
        console.error("MapLibre Error:", e.error);
      });
    } // End if map needs creation

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setIsMapLoaded(false);
      }
    };
  }, []); // Runs once on mount

  // Effect for Applying Property Filters When State Changes (re-triggers zoomend)
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    // Re-trigger zoomend logic to re-evaluate filters when price/category changes
    // This ensures properties shown/hidden reflect current filters immediately
    mapRef.current.fire("zoomend");
  }, [priceRange, selectedCategories, isMapLoaded]); // Keep isMapLoaded dependency

  // Effect for Toggling Heatmap Layer
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    const layerId = "flood_heatmap";
    const map = mapRef.current;
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(
        layerId,
        "visibility",
        isVisible ? "visible" : "none"
      );
    }
  }, [isVisible, isMapLoaded]);

  // NEW: Effect for Toggling Infrastructure Layers
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    infrastructureLayers.forEach((layer) => {
      // Determine the correct MapLibre layer ID based on the infrastructure type
      let mapLayerId: string;
      if (layer.id === "rel-kereta") {
        mapLayerId = "rel-kereta-layer"; // Specific ID for rail line layer
      } else if (layer.id === "transjakarta") {
        mapLayerId = "transjakarta-layer"; // Specific ID for transjakarta line layer
      } else {
        mapLayerId = layer.id; // Default: use the infrastructure ID for point/symbol layers
      }

      const layerExists = map.getLayer(mapLayerId); // Check if layer exists *before* trying to set property

      if (layerExists) {
        const targetVisibility = infrastructureVisibility[layer.id]
          ? "visible"
          : "none";
        map.setLayoutProperty(mapLayerId, "visibility", targetVisibility);
      } else {
        if (layer.id === "transjakarta") {
          // Log only for transjakarta
          console.warn(
            `  Layer ${mapLayerId} not found on map during visibility toggle!`
          ); // DEBUG WARNING
        }
      }
    });
  }, [infrastructureVisibility, isMapLoaded]); // Depend on visibility state and map load status

  // --- Event Handlers for Controls ---
  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };
  const toggleLayer = () => {
    setIsVisible((v) => !v);
  };

  // NEW: Handler for infrastructure checkbox changes
  const handleInfrastructureToggle = (layerId: string) => {
    setInfrastructureVisibility((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  };

  // NEW: Handler for investment type checkbox changes
  const handleInvestmentTypeChange = (type: string) => {
    setSelectedInvestmentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // --- Helper Function: Zoom to Region --- (No changes needed)
  const zoomToRegion = (map: Map, feature: MapGeoJSONFeature) => {
    /* ... same as before ... */ const geometry = feature.geometry;
    let bounds: LngLatBoundsLike = [-180, -90, 180, 90]; // Default world bounds

    const calculateBounds = (coords: number[][][]): LngLatBoundsLike | null => {
      if (!coords || coords.length === 0) return null;
      const flatCoords = coords.flat();
      if (flatCoords.length === 0) return null;
      const lons = flatCoords.map((c) => c[0]);
      const lats = flatCoords.map((c) => c[1]);
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
    ): LngLatBoundsLike | null => {
      if (!coords || coords.length === 0) return null;
      const allCoords = coords.flat(2); // Flatten MultiPolygon coordinates
      if (allCoords.length === 0) return null;
      const lons = allCoords.map((c) => c[0]);
      const lats = allCoords.map((c) => c[1]);
      if (lons.length === 0 || lats.length === 0) return null;
      return [
        Math.min(...lons),
        Math.min(...lats),
        Math.max(...lons),
        Math.max(...lats),
      ];
    };

    if (geometry.type === "Polygon") {
      const calculated = calculateBounds(geometry.coordinates);
      if (calculated) bounds = calculated;
    } else if (geometry.type === "MultiPolygon") {
      const calculated = calculateMultiBounds(geometry.coordinates);
      if (calculated) bounds = calculated;
    } else {
      console.warn("Unsupported geometry for bbox:", geometry.type);
      // Optional: Zoom to center point if it's a point geometry?
      return; // Don't zoom if geometry is not supported
    }

    // Validate bounds before fitting
    const validBounds =
      Array.isArray(bounds) &&
      bounds.length === 4 &&
      bounds.every((b) => isFinite(b)) &&
      bounds[0] <= bounds[2] &&
      bounds[1] <= bounds[3];

    if (validBounds) {
      map.fitBounds(bounds, { padding: 40, maxZoom: 15, essential: true });
    } else {
      console.warn(
        "Invalid or infinite bounds calculated for feature:",
        feature.id,
        bounds
      );
      // Fallback: maybe zoom to the map's current center or a default zoom?
      // map.flyTo({ center: map.getCenter(), zoom: 12 }); // Example fallback
    }
  };

  // --- JSX Structure ---
  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Map Container */}
      <div className="flex-1 relative">
        <div
          ref={mapContainerRef}
          className="absolute top-0 left-0 w-full h-full"
        />
        {/* Loading Indicator (Optional) */}
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-400 bg-opacity-50 z-10">
            <p className="text-white text-xl">Loading Map...</p>
          </div>
        )}
      </div>
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
              <strong className="font-semibold">Status Properti:</strong>{" "}
              {selectedPropertyData.status}
            </p>
            <p>
              <strong className="font-semibold">Harga Jual:</strong> Rp{" "}
              {selectedPropertyData.price}
            </p>
            <p>
              <strong className="font-semibold">Luas Bangunan:</strong>{" "}
              {selectedPropertyData.buildingArea}{" "}
              {selectedPropertyData.buildingArea !== "N/A" && "m²"}
            </p>
            <p>
              <strong className="font-semibold">Luas Tanah:</strong>{" "}
              {selectedPropertyData.landArea}{" "}
              {selectedPropertyData.landArea !== "N/A" && "m²"}
            </p>
            <p>
              <strong className="font-semibold">Jenis Sertifikat:</strong>{" "}
              {selectedPropertyData.certificateType}
            </p>
          </div>
          <div className="mt-3 flex justify-between items-center">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPropertyData(null)}
              className="text-xs text-red-600 hover:text-red-800 hover:underline focus:outline-none"
            >
              Tutup
            </button>
            {/* See More Link/Text */}
            {/* If you have a URL in your data: */}
            {selectedPropertyData.url ? (
              <a
                href={selectedPropertyData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                See More
              </a>
            ) : (
              <span className="text-xs text-blue-600 hover:underline cursor-pointer">
                {" "}
                {/* Or make this a button if it triggers an action */}
                See More
              </span>
            )}
          </div>
        </div>
      )}
      {/* Sidebar */}
      <div className="w-80 bg-white p-4 border-l overflow-y-auto">
        {/* Filter Section */}
        <div className="mb-6 pb-4 border-b">
          {" "}
          {/* Added margin and border */}
          <h2 className="text-lg font-bold mb-3 text-gray-800">
            {" "}
            {/* Adjusted margin */}
            Filter Properti
          </h2>
          {/* Inside the Sidebar div */}
          {/* ... other filter/layer sections ... */}
          {/* ... rest of sidebar ... */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2 text-gray-700">Jenis Properti</h3>
            <div className="space-y-1">
              {propertyCategories.map((category) => (
                <label
                  key={category}
                  className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer" // Added cursor
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2 text-gray-700">
              Jenis Investasi
            </h3>
            <div className="space-y-1">
              {investmentTypes.map((type) => (
                <label
                  key={type}
                  className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedInvestmentTypes.includes(type)}
                    onChange={() => handleInvestmentTypeChange(type)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-2">
            {" "}
            {/* Reduced margin bottom */}
            <h3 className="font-semibold mb-2 text-gray-700">Harga</h3>
            {/* --- Price Range Slider --- */}
            <Range
              values={priceRange}
              step={10000000} // 10 million step
              min={0}
              max={5000000000} // 5 billion max
              onChange={(values) => {
                setPriceRange(values);
              }}
              onFinalChange={(values) => {
                setPriceRange(values);
                applyPropertiesFilter();
              }}
              renderTrack={({ props, children }) => (
                <div
                  onMouseDown={props.onMouseDown}
                  onTouchStart={props.onTouchStart}
                  style={{
                    ...props.style,
                    height: "6px",
                    width: "100%",
                    display: "flex",
                    borderRadius: "3px",
                    backgroundColor: "#ccc",
                    cursor: "pointer",
                  }}
                  className="bg-gray-200 rounded-full"
                >
                  <div
                    ref={props.ref}
                    style={{
                      height: "6px",
                      width: "100%",
                      borderRadius: "3px",
                      background: `linear-gradient(to right, #ccc 0%, #3b82f6 0%, #3b82f6 ${
                        (priceRange[0] / 5000000000) * 100
                      }%, #3b82f6 ${
                        (priceRange[1] / 5000000000) * 100
                      }%, #ccc ${(priceRange[1] / 5000000000) * 100}%)`,
                      alignSelf: "center",
                    }}
                  >
                    {children}
                  </div>
                </div>
              )}
              renderThumb={({ props, isDragged, index }) => {
                const { key, ...restProps } = props;
                return (
                  <div
                    key={key}
                    {...restProps}
                    style={{
                      ...restProps.style,
                      height: "16px",
                      width: "16px",
                      borderRadius: "50%",
                      backgroundColor: isDragged ? "#2563eb" : "#3b82f6",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                    className="cursor-grab focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    <div
                      className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs bg-gray-700 text-white px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ pointerEvents: "none" }}
                    >
                      {priceRange[index].toLocaleString("id-ID")}
                    </div>
                  </div>
                );
              }}
            />
            {/* --- End Price Range Slider --- */}
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
              <span>Rp {priceRange[0].toLocaleString("id-ID")}</span>
              <span>Rp {priceRange[1].toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* Layer Toggle Section */}
        <div className="mb-6 pb-4 border-b">
          {" "}
          {/* Added margin and border */}
          <h3 className="text-lg font-bold mb-3 text-gray-800">
            Layer Data
          </h3>{" "}
          {/* Adjusted size/margin */}
          <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
            {" "}
            {/* Added cursor */}
            <input
              type="checkbox"
              checked={isVisible}
              onChange={toggleLayer}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span>Tampilkan Peta Banjir</span>
          </label>
        </div>

        {/* NEW: Demography & Infrastructure Section */}
        <div className="mb-6 pb-4 border-b">
          {" "}
          {/* Added margin and border */}
          <h3 className="text-lg font-bold mb-3 text-gray-800">
            Demografi & Fasilitas
          </h3>{" "}
          {/* Adjusted size/margin */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-gray-700">
              Infrastruktur & Fasilitas
            </h4>{" "}
            {/* Subheading */}
            <div className="space-y-1">
              {infrastructureLayers.map((layer) => (
                <label
                  key={layer.id}
                  className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={infrastructureVisibility[layer.id] || false} // Ensure checked is boolean
                    onChange={() => handleInfrastructureToggle(layer.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  {/* Optional: Display tiny icon next to label */}
                  {/* <img src={layer.iconUrl} alt="" className="w-4 h-4 inline-block ml-1" /> */}
                  <span>{layer.name}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Add more Demography subsections here if needed */}
        </div>

        {/* Region Info Display */}
        {popupData && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md shadow text-black">
            <h3 className="text-base font-semibold mb-2 text-blue-800">
              {popupData.regionName}
            </h3>
            <div className="text-xs space-y-1 text-gray-700">
              {/* Display data conditionally */}
              {popupData.jumlahKecamatan > 0 && (
                <p>
                  Kecamatan: {popupData.jumlahKecamatan.toLocaleString("id-ID")}
                </p>
              )}
              {popupData.jumlahDesa > 0 && (
                <p>Desa/Kel: {popupData.jumlahDesa.toLocaleString("id-ID")}</p>
              )}
              {popupData.jumlahPenduduk > 0 && (
                <p>
                  Penduduk: {popupData.jumlahPenduduk.toLocaleString("id-ID")}
                </p>
              )}
              {popupData.kepadatanPerKm2 > 0 && (
                <p>
                  Kepadatan: {popupData.kepadatanPerKm2.toLocaleString("id-ID")}{" "}
                  /km²
                </p>
              )}
              {popupData.luasWilayahKm2 > 0 && (
                <p>
                  Luas: {popupData.luasWilayahKm2.toLocaleString("id-ID")} km²
                </p>
              )}
            </div>
            <button
              onClick={() => setPopupData(null)}
              className="mt-3 text-xs text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
            >
              Tutup Info
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
