// components/map/MapDrawingTool.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import type { Map, LngLatLike, GeoJSONSource } from "maplibre-gl";
import type { Feature, Polygon } from "geojson";
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { v4 as uuidv4 } from 'uuid'; // For unique IDs
import { area } from '@turf/turf'; // For area calculation
import * as turf from '@turf/turf';


interface CustomPolygon {
  id: string;
  name: string;
  color: string;
  area: number;
  geometry: GeoJSON.Polygon;
}

interface MapDrawingToolProps {
  map: Map | null;
}

const MapDrawingTool: React.FC<MapDrawingToolProps> = ({ map }) => {
  const [drawingMode, setDrawingMode] = useState<boolean>(false);
  const [polygons, setPolygons] = useState<CustomPolygon[]>([]);
  const [activePolygonId, setActivePolygonId] = useState<string | null>(null);
  const [polygonName, setPolygonName] = useState<string>("");
  const [polygonColor, setPolygonColor] = useState<string>("#FF0000");
  const drawRef = useRef<MapboxDraw | null>(null);

  const DRAW_SOURCE_ID = "custom-draw-source";
  const DRAW_LAYER_ID = "custom-draw-layer";

  useEffect(() => {
    if (!map) return;
    
    if (drawRef.current && map.hasControl(drawRef.current as any)) {
      map.removeControl(drawRef.current as any);
    }

    // Initialize MapboxDraw
    drawRef.current = new MapboxDraw({
      displayControlsDefault: false, // We'll use our own buttons
      controls: {
        polygon: true,
        trash: true
      },
      styles: [
        // ACTIVE (i.e. being drawn)
        // line stroke
        {
          "id": "gl-draw-line",
          "type": "line",
          "filter": ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
          "layout": {
            "line-cap": "round",
            "line-join": "round"
          },
          "paint": {
            "line-color": "#3f3f3f",
            "line-dasharray": [0.2, 2],
            "line-width": 2
          }
        },
        // polygon fill
        {
          "id": "gl-draw-polygon-fill",
          "type": "fill",
          "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          "paint": {
            "fill-color": "#3f3f3f",
            "fill-outline-color": "#3f3f3f",
            "fill-opacity": 0.1
          }
        },
        // polygon outline stroke
        // This doesn't style the first edge of the polygon after the second point has been clicked.
        {
          "id": "gl-draw-polygon-stroke-active",
          "type": "line",
          "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          "layout": {
            "line-cap": "round",
            "line-join": "round"
          },
          "paint": {
            "line-color": "#3f3f3f",
            "line-dasharray": [0.2, 2],
            "line-width": 2
          }
        },
        // vertex point circles
        {
          "id": "gl-draw-polygon-and-line-vertex-active",
          "type": "circle",
          "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
          "paint": {
            "circle-radius": 5,
            "circle-color": "#3f3f3f"
          }
        },

        // INACTIVE (i.e. not being drawn)
        // point well
        {
          "id": "gl-draw-point-static",
          "type": "circle",
          "filter": ["all", ["==", "$type", "Point"], ["==", "mode", "static"]],
          "paint": {
            "circle-radius": 5,
            "circle-color": "#000"
          }
        },
        // polygon fill
        {
          "id": "gl-draw-polygon-fill-static",
          "type": "fill",
          "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
          "paint": {
            "fill-color": "#000",
            "fill-outline-color": "#000",
            "fill-opacity": 0.1
          }
        },
        // polygon outline
        {
          "id": "gl-draw-polygon-stroke-static",
          "type": "line",
          "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
          "layout": {
            "line-cap": "round",
            "line-join": "round"
          },
          "paint": {
            "line-color": "#000",
            "line-width": 2
          }
        },
        // line stroke
        {
          "id": "gl-draw-line-static",
          "type": "line",
          "filter": ["all", ["==", "$type", "LineString"], ["==", "mode", "static"]],
          "layout": {
            "line-cap": "round",
            "line-join": "round"
          },
          "paint": {
            "line-color": "#000",
            "line-width": 2
          }
        }
      ]
    });

    map.addControl(drawRef.current as any, 'top-left');
        const featuresToAdd: Feature<Polygon>[] = polygons.map(p => ({
        type: 'Feature',
        properties: { customId: p.id, name: p.name, color: p.color, area: p.area },
        geometry: p.geometry,
        id: p.id // Use our custom ID as the MapboxDraw ID for easier lookup
    }));
    const featureCollection = {
      type: 'FeatureCollection',
      features: featuresToAdd,
    };
    drawRef.current.set(featureCollection as any);

    map.on('draw.create', handleDrawCreate);
    map.on('draw.delete', handleDrawDelete);
    map.on('draw.update', handleDrawUpdate);
    map.on('click', handleClick); // For selecting existing polygons

    return () => {
      if (map && drawRef.current) {
        map.off('draw.create', handleDrawCreate);
        map.off('draw.delete', handleDrawDelete);
        map.off('draw.update', handleDrawUpdate);
        map.off('click', handleClick);
        // Clean up draw control (careful not to remove if other controls use it)
        if (map.hasControl(drawRef.current as any)) {
          map.removeControl(drawRef.current as any);
        }
      }
    };
  }, [map, polygons]);


  const handleDrawCreate = useCallback((e: any) => {
    const newFeatures = e.features;
    if (newFeatures.length > 0) {
      newFeatures.forEach((feature: Feature) => {
        if (feature.geometry.type === 'Polygon') {
          const id = uuidv4();
          const calculatedArea = turf.area(feature.geometry); // Calculate area in square meters
          const newPolygon: CustomPolygon = {
            id: id,
            name: `Polygon ${polygons.length + 1}`,
            color: '#FF0000', // Default color
            area: calculatedArea,
            geometry: feature.geometry as GeoJSON.Polygon,
          };
          setPolygons((prev) => [...prev, newPolygon]);
          // Update the MapboxDraw feature with our custom ID and properties
          drawRef.current?.setFeatureProperty(String(feature.id), 'customId', id);
          drawRef.current?.setFeatureProperty(String(feature.id), 'name', newPolygon.name);
          drawRef.current?.setFeatureProperty(String(feature.id), 'color', newPolygon.color);
          drawRef.current?.setFeatureProperty(String(feature.id), 'area', newPolygon.area);
          setActivePolygonId(id); // Select the newly created polygon for editing
          setPolygonName(newPolygon.name);
          setPolygonColor(newPolygon.color);
          setDrawingMode(false); // Exit drawing mode after creating a polygon
        }
      });
    }
  }, [polygons]);

  const handleDrawDelete = useCallback((e: any) => {
    const deletedFeatureIds = e.features.map((f: Feature) => f.properties?.customId || f.id);
    setPolygons((prev) => prev.filter((p) => !deletedFeatureIds.includes(p.id)));
    setActivePolygonId(null);
  }, []);

  const handleDrawUpdate = useCallback((e: any) => {
    const updatedFeatures = e.features;
    if (updatedFeatures.length > 0) {
      setPolygons((prev) =>
        prev.map((p) => {
          const updatedFeature = updatedFeatures.find(
            (f: Feature) => (f.properties?.customId || f.id) === p.id
          );
          if (updatedFeature && updatedFeature.geometry.type === 'Polygon') {
            const calculatedArea = turf.area(updatedFeature.geometry);
            return {
              ...p,
              geometry: updatedFeature.geometry as GeoJSON.Polygon,
              area: calculatedArea,
            };
          }
          return p;
        })
      );
    }
  }, []);

  const handleClick = useCallback((e: any) => {
    if (!map || drawingMode) return;

    const features = map.queryRenderedFeatures(e.point, {
      layers: ['gl-draw-polygon-fill-static'], // Check only static polygon fills
    });

    if (features.length > 0) {
      const clickedFeature = features[0];
      const customId = clickedFeature.properties?.customId;
      if (customId) {
        const selected = polygons.find(p => p.id === customId);
        if (selected) {
          setActivePolygonId(customId);
          setPolygonName(selected.name);
          setPolygonColor(selected.color);
          return;
        }
      }
    }
    setActivePolygonId(null); // Deselect if no custom polygon is clicked
  }, [map, drawingMode, polygons]);


  const handleSavePolygonDetails = useCallback(() => {
    setPolygons((prev) =>
      prev.map((p) =>
        p.id === activePolygonId
          ? { ...p, name: polygonName, color: polygonColor }
          : p
      )
    );
    // Update the MapboxDraw feature's properties
    const drawFeatureId = drawRef.current?.getAll().features.find(f => f.properties?.customId === activePolygonId)?.id;
    if (drawFeatureId) {
      drawRef.current?.setFeatureProperty(String(drawFeatureId), 'name', polygonName);
      drawRef.current?.setFeatureProperty(String(drawFeatureId), 'color', polygonColor);
    }

    setActivePolygonId(null);
  }, [activePolygonId, polygonName, polygonColor]);

  const handleDeletePolygon = useCallback(() => {
    if (activePolygonId) {
      // Find the MapboxDraw feature ID corresponding to our custom polygon ID
      const featureToDelete = drawRef.current?.getAll().features.find(f => f.properties?.customId === activePolygonId);
      if (featureToDelete) {
        drawRef.current?.delete(String(featureToDelete.id));
      }
      setPolygons((prev) => prev.filter((p) => p.id !== activePolygonId));
      setActivePolygonId(null);
    }
  }, [activePolygonId]);

  const toggleDrawingMode = useCallback(() => {
    if (!map || !drawRef.current) return;

    if (drawingMode) {
      drawRef.current.changeMode('simple_select'); // Exit drawing mode
      // map.getCanvas().style.cursor = 'grab'; // Set to map's default cursor for dragging/panning
    } else {
      drawRef.current.changeMode('draw_polygon'); // Enter drawing mode
      // map.getCanvas().style.cursor = 'crosshair'; // Change cursor to '+' for drawing
      setActivePolygonId(null); // Deselect any active polygon
    }
    setDrawingMode((prev) => !prev);
  }, [map, drawingMode]);

  const convertAreaToReadable = (areaInMeters: number): string => {
    if (areaInMeters >= 1_000_000) {
      return `${(areaInMeters / 1_000_000).toFixed(2)} km²`;
    } else if (areaInMeters >= 10_000) {
      return `${(areaInMeters / 10_000).toFixed(2)} hektar`;
    } else {
      return `${areaInMeters.toFixed(2)} m²`;
    }
  };

  useEffect(() => {
  if (!map) return;

  const mapCanvas = map.getCanvas();

  if (drawingMode) {
    // Function to constantly enforce crosshair
    const enforceCrosshair = () => {
      mapCanvas.style.cursor = 'crosshair';
    };

    // Add mousemove listener when drawing mode is active
    map.on('mousemove', enforceCrosshair);
    // Also set it immediately in case mouse is already over the map
    mapCanvas.style.cursor = 'crosshair';

    // Cleanup function for this effect
    return () => {
      map.off('mousemove', enforceCrosshair); // Remove the listener
      // When exiting drawing mode (or component unmounts),
      // reset cursor to 'grab' for panning, or '' to let Mapbox GL JS fully manage
      mapCanvas.style.cursor = 'grab';
    };
  } else {
    // If not in drawing mode, ensure the cursor is 'grab' (or your desired default)
    mapCanvas.style.cursor = 'grab';
  }
}, [map, drawingMode]); // This effect re-runs when 'map' or 'drawingMode' changes

  return (
    <>
      <div className="fixed bottom-[15px] left-[125px] z-50 flex flex-col items-end space-y-2">
        <button
          onClick={toggleDrawingMode}
          className={`fixed bottom-[125px] left-[15px] p-3 rounded-full shadow-lg transition-all duration-300
            ${drawingMode ? "bg-red-500 text-white" : "bg-blue-600 text-white"}
            hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${drawingMode ? "focus:ring-red-700" : "focus:ring-blue-800"}`}
          title={drawingMode ? "Stop Drawing" : "Start Drawing Area"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="white"
            className="w-6 h-6"
          >
            {drawingMode ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14.25v4.5m-7.5-6.75h6"
              />
            )}
          </svg>
        </button>

        {polygons.length > 0 && (
          <div className="bg-white p-3 rounded-lg shadow-md text-sm text-gray-800 max-w-xs">
            <h4 className="font-bold mb-1">Drawn Areas:</h4>
            <ul className="list-disc pl-4">
              {polygons.map((poly) => (
                <li key={poly.id} className="mb-1">
                  <span
                    className={`cursor-pointer ${activePolygonId === poly.id ? "font-semibold text-blue-700" : ""}`}
                    onClick={() => {
                      setActivePolygonId(poly.id);
                      setPolygonName(poly.name);
                      setPolygonColor(poly.color);
                      // Zoom to the selected polygon
                      if (map) {
                        const bbox = turf.bbox(poly.geometry);
                        map.fitBounds(bbox as [number, number, number, number], { padding: 50, maxZoom: 15 });
                      }
                    }}
                  >
                    {poly.name} ({convertAreaToReadable(poly.area)})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {activePolygonId && (
        <div className="absolute top-[76px] left-4 z-10 bg-white p-4 rounded-xl shadow-md text-black max-w-xs text-sm">
          <h3 className="text-base font-bold mb-2">Edit Polygon</h3>
          <div className="space-y-2">
            <div>
              <label htmlFor="polygonName" className="block text-xs font-medium text-gray-700">
                Name:
              </label>
              <input
                type="text"
                id="polygonName"
                value={polygonName}
                onChange={(e) => setPolygonName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDeletePolygon}
                className="inline-flex justify-center py-2 px-3 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
              <button
                onClick={handleSavePolygonDetails}
                className="inline-flex justify-center py-2 px-3 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MapDrawingTool;