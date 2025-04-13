import { useEffect, useState, useRef, useCallback } from "react";
import maplibregl, {
  Map,
  Popup,
  MapLayerMouseEvent,
  GeoJSONSource,
} from "maplibre-gl"; // Added GeoJSONSource type
import "maplibre-gl/dist/maplibre-gl.css";

// --- Interfaces and Constants (largely unchanged) ---
interface AgeGroup {
  name: string;
  color: string;
}
const ageGroups: AgeGroup[] = [
  { name: "Balita (0-5 tahun)", color: "#FF6B6B" },
  { name: "Anak-anak (6-15 tahun)", color: "#4ECDC4" },
  { name: "Remaja (16-20 tahun)", color: "#45B7D1" },
  { name: "Dewasa Muda (21-30 tahun)", color: "#96CEB4" },
  { name: "Dewasa (31-40 tahun)", color: "#88B04B" },
  { name: "Dewasa Akhir (41-60 tahun)", color: "#E8D657" },
  { name: "Lansia (>60 tahun)", color: "#FFAE42" },
];
const populationColorScale = [
  0,
  "rgba(255, 247, 236, 0)",
  1,
  "rgba(254, 232, 200, 0.6)",
  1000,
  "rgba(253, 187, 132, 0.7)",
  2000,
  "rgba(252, 141, 89, 0.8)",
  3000,
  "rgba(227, 74, 51, 0.9)",
  4000,
  "rgba(179, 0, 0, 1.0)",
];
const getLayerId = (groupName: string) => `age-group-${groupName}`;
const OUTLINE_LAYER_ID = "outline";
const SOURCE_ID = "demographics_combined"; // Renamed source ID slightly

// --- List of GeoJSON files to load ---
const GEOJSON_FILES = [
  "/demografi-jakpus-processed.geojson",
  "/demografi-jakbar-processed.geojson",
  "/demografi-jaksel-processed.geojson",
  "/demografi-jaktim-processed.geojson",
  "/demografi-jakut-processed.geojson",
];

// --- GeoJSON Feature Collection Type (basic structure) ---
interface FeatureCollection {
  type: "FeatureCollection";
  features: Array<any>; // Adjust 'any' to a more specific GeoJSON Feature type if needed
}

export default function DemographicMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>(
    ageGroups[0]?.name || ""
  );
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true); // Loading state for data fetching
  const [errorLoadingData, setErrorLoadingData] = useState<string | null>(null); // Error state

  // --- Map Initialization Effect ---
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    // Adjust center and zoom for wider Jakarta view
    const initialCenter: [number, number] = [106.82, -6.17]; // Approx center of Jakarta
    const initialZoom = 10.5; // Zoom out slightly

    const map = new Map({
      container: mapContainerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: initialCenter,
      zoom: initialZoom,
    });
    mapRef.current = map;

    map.on("load", async () => {
      // Make the callback async
      console.log("Map loaded. Starting data fetch...");
      setIsLoadingData(true); // Start loading indicator
      setErrorLoadingData(null);

      try {
        // --- Fetch and Combine GeoJSON Data ---
        const fetchPromises = GEOJSON_FILES.map((url) =>
          fetch(url).then((response) => {
            if (!response.ok) {
              throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
            }
            return response.json();
          })
        );

        const allGeoJsonData = await Promise.all(fetchPromises);
        console.log(`Workspaceed ${allGeoJsonData.length} GeoJSON files.`);

        // Combine features into a single FeatureCollection
        const combinedGeoJson: FeatureCollection = {
          type: "FeatureCollection",
          features: [],
        };

        allGeoJsonData.forEach((geoJson: FeatureCollection) => {
          // Basic validation
          if (
            geoJson &&
            geoJson.type === "FeatureCollection" &&
            Array.isArray(geoJson.features)
          ) {
            combinedGeoJson.features.push(...geoJson.features);
          } else {
            console.warn("Received invalid GeoJSON structure:", geoJson);
          }
        });
        console.log(`Combined ${combinedGeoJson.features.length} features.`);

        // --- Add Combined Source ---
        if (!map.getSource(SOURCE_ID)) {
          map.addSource(SOURCE_ID, {
            type: "geojson",
            data: combinedGeoJson, // Use the combined object here
          });
          console.log("Combined source added:", SOURCE_ID);
        }

        // --- Add Layers (using the combined source) ---
        if (!map.getLayer(OUTLINE_LAYER_ID)) {
          map.addLayer({
            id: OUTLINE_LAYER_ID,
            type: "line",
            source: SOURCE_ID, // Use combined source
            paint: { "line-color": "#333333", "line-width": 0.75 },
          });
          console.log("Layer added:", OUTLINE_LAYER_ID);
        }

        ageGroups.forEach((group) => {
          const layerId = getLayerId(group.name);
          if (!map.getLayer(layerId)) {
            map.addLayer({
              id: layerId,
              type: "fill",
              source: SOURCE_ID, // Use combined source
              paint: {
                "fill-color": [
                  "interpolate",
                  ["linear"],
                  ["get", group.name],
                  ...populationColorScale,
                ],
                "fill-opacity": 0.75,
              },
              layout: { visibility: "none" }, // Start hidden
            });
            console.log("Layer added:", layerId);
          }
        });

        setMapLoaded(true); // Map layers are ready
        console.log("Map setup complete after data processing.");

        // --- Tooltip Setup (remains the same, attached after layers) ---
        popupRef.current = new Popup({
          closeButton: false,
          closeOnClick: false,
          maxWidth: "300px",
        });
        // ... (Tooltip handler functions handleMouseMove, handleMouseLeave are unchanged) ...
        const handleMouseMove = (e: MapLayerMouseEvent) => {
          if (!map || !e.features || e.features.length === 0) {
            popupRef.current?.remove();
            return;
          }
          map.getCanvas().style.cursor = "pointer";
          const feature = e.features[0];
          if (!feature.properties) {
            popupRef.current?.remove();
            return;
          }
          const popupContent = ageGroups
            .map(
              (group) =>
                `<strong>${group.name}:</strong> ${
                  feature.properties?.[group.name] ?? "N/A"
                }`
            )
            .join("<br>");
          const areaName =
            feature.properties?.["WADMKD"] ||
            feature.properties?.["NAMOBJ"] ||
            "Area"; // Check property names in your combined GeoJSON
          popupRef.current
            ?.setLngLat(e.lngLat)
            .setHTML(`<h3>${areaName}</h3>${popupContent}`)
            .addTo(map);
        };
        const handleMouseLeave = () => {
          if (!map) return;
          map.getCanvas().style.cursor = "";
          popupRef.current?.remove();
        };

        ageGroups.forEach((group) => {
          const layerId = getLayerId(group.name);
          if (map.getLayer(layerId)) {
            map.on("mousemove", layerId, handleMouseMove);
            map.on("mouseleave", layerId, handleMouseLeave);
          }
        });
      } catch (error) {
        console.error("Error loading or processing GeoJSON data:", error);
        setErrorLoadingData(
          error instanceof Error
            ? error.message
            : "An unknown error occurred while loading map data."
        );
      } finally {
        setIsLoadingData(false); // Stop loading indicator regardless of success/failure
      }
    }); // End map.on('load')

    // Cleanup
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, []); // Run only once on mount

  // --- Layer Filtering Effect (Unchanged) ---
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !activeGroup) return;
    const map = mapRef.current;
    console.log(
      "Filter effect: Updating layer visibility for active group:",
      activeGroup
    );
    ageGroups.forEach((group) => {
      const layerId = getLayerId(group.name);
      const layer = map.getLayer(layerId);
      if (layer) {
        const shouldBeVisible = group.name === activeGroup;
        const currentVisibility = map.getLayoutProperty(layerId, "visibility");
        if (shouldBeVisible && currentVisibility !== "visible") {
          map.setLayoutProperty(layerId, "visibility", "visible");
        } else if (!shouldBeVisible && currentVisibility !== "none") {
          map.setLayoutProperty(layerId, "visibility", "none");
        }
      }
    });
  }, [activeGroup, mapLoaded]);

  // --- Checkbox Handler (Unchanged) ---
  const handleGroupChange = useCallback((groupName: string) => {
    setActiveGroup(groupName);
  }, []);

  return (
    <div className="relative w-full h-[600px] border border-gray-300">
      {/* Loading Indicator */}
      {isLoadingData && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
          <p className="text-lg font-semibold animate-pulse">
            Loading map data...
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorLoadingData && !isLoadingData && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100/90 z-20 p-4">
          <p className="text-red-700 font-semibold text-center">
            Error loading map data: <br /> {errorLoadingData} <br /> Please
            check the console and ensure GeoJSON files are accessible.
          </p>
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="absolute top-0 left-0 w-full h-full"
      />

      {/* Filter Controls Overlay */}
      {!isLoadingData &&
        !errorLoadingData && ( // Only show controls when data is loaded successfully
          <div className="absolute top-4 right-4 bg-white/90 p-4 rounded-lg shadow-lg z-10 max-h-[calc(100%-40px)] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">
              Pilih Kelompok Usia
            </h3>
            {ageGroups.map((group) => (
              <label
                key={group.name}
                className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={activeGroup === group.name}
                  onChange={() => handleGroupChange(group.name)}
                  className="mr-2 h-4 w-4 accent-blue-600"
                />
                <span className="text-sm select-none" style={{ color: "#333" }}>
                  {group.name}
                </span>
              </label>
            ))}
          </div>
        )}

      {/* Legend (Unchanged, only show if data loaded) */}
      {!isLoadingData && !errorLoadingData && (
        <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-lg z-10 text-black">
          {/* ... legend content ... */}
          <h4 className="text-sm font-semibold mb-1">Jumlah Penduduk</h4>
          {populationColorScale.map((stop, index) => {
            if (index >= 2 && index % 2 === 0) {
              const value = populationColorScale[index - 2];
              const color = stop;
              return (
                <div key={index} className="flex items-center mb-1 ">
                  <span
                    className="w-4 h-4 inline-block mr-2 border border-gray-400"
                    style={{ backgroundColor: String(color) }}
                  ></span>
                  <span className="text-xs">{`> ${value.toLocaleString()}`}</span>
                </div>
              );
            }
            return null;
          })}
          <div className="flex items-center">
            <span
              className="w-4 h-4 inline-block mr-2 border border-gray-400"
              style={{ backgroundColor: String(populationColorScale[1]) }}
            ></span>
            <span className="text-xs">
              1 - {populationColorScale[2].toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
