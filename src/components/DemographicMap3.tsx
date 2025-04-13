"use client";

import React, { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const DemographicMap3: React.FC = () => {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [selectedField, setSelectedField] = useState("Balita_0_5_tahun_bin");
  const [binRanges, setBinRanges] = useState<{ [key: string]: number[] }>({});

  // Define fields for toggling (age groups and religions)
  const fields = [
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
    { label: "Islam", value: "ISLAM_bin" },
    { label: "Kristen", value: "KRISTEN_bin" },
    { label: "Katholik", value: "KATHOLIK_bin" },
    { label: "Hindu", value: "HINDU_bin" },
    { label: "Budha", value: "BUDHA_bin" },
    { label: "Konghucu", value: "KONGHUCU_bin" },
  ];

  // Color scale for bins
  const colorScale = ["#f7fbff", "#c6dbef", "#9ecae1", "#6baed6", "#08306b"];

  // Fetch breakpoints
  useEffect(() => {
    fetch("/jenks_breakpoints.json")
      .then((res) => res.json())
      .then((data) => setBinRanges(data))
      .catch((err) => console.error("Failed to load breakpoints:", err));
  }, []);

  // Generate range labels from breakpoints
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

  // Initialize the map
  useEffect(() => {
    const initializeMap = () => {
      const mapInstance = new maplibregl.Map({
        container: "map",
        style:
          "https://api.maptiler.com/maps/streets/style.json?key=Xyghbo5YEVnVdA3iTYjo", // Free MapLibre style
        center: [106.8456, -6.2088], // Jakarta coordinates
        zoom: 10,
      });

      mapInstance.on("load", () => {
        // Load GeoJSON from public folder
        mapInstance.addSource("jakarta", {
          type: "geojson",
          data: "/demografi-jakarta-with-bins.geojson",
        });

        // Add choropleth fill layer
        mapInstance.addLayer({
          id: "jakarta-fill",
          type: "fill",
          source: "jakarta",
          paint: {
            "fill-color": [
              "step",
              ["get", selectedField],
              colorScale[0],
              1,
              colorScale[1],
              2,
              colorScale[2],
              3,
              colorScale[3],
              4,
              colorScale[4],
            ],
            "fill-opacity": 0.8,
          },
        });

        // Add popup on hover
        const popup = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
        });

        mapInstance.on("mousemove", "jakarta-fill", (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const props = feature.properties;
            const fieldLabel = fields.find(
              (f) => f.value === selectedField
            )?.label;
            const rawField = selectedField.replace("_bin", "");
            const value = props[rawField] || "N/A";
            const bin = props[selectedField] || "N/A";
            const range = binRanges[selectedField]
              ? getRangeLabels(selectedField)[bin - 1] || "N/A"
              : `Bin ${bin}`;

            popup
              .setLngLat(e.lngLat)
              .setHTML(
                `<strong>${props.kecamatan || "Area"}</strong><br>
                ${fieldLabel}: ${value}<br>
                Range: ${range}`
              )
              .addTo(mapInstance);
          }
        });

        mapInstance.on("mouseleave", "jakarta-fill", () => {
          popup.remove();
        });
      });

      setMap(mapInstance);
    };

    if (!map) initializeMap();

    // Cleanup on unmount
    return () => {
      if (map) map.remove();
    };
  }, [map]);

  // Update fill color when selectedField changes
  useEffect(() => {
    if (map && map.isStyleLoaded()) {
      // Check if layer exists before updating
      const layerExists = map.getLayer("jakarta-fill");
      if (layerExists) {
        map.setPaintProperty("jakarta-fill", "fill-color", [
          "step",
          ["get", selectedField],
          colorScale[0],
          1,
          colorScale[1],
          2,
          colorScale[2],
          3,
          colorScale[3],
          4,
          colorScale[4],
        ]);
      } else {
        console.warn("Layer 'jakarta-fill' not found. Style update skipped.");
      }
    } else if (map) {
      // Style isn’t loaded yet, wait for it
      const onStyleLoad = () => {
        // Check if layer exists before updating
        const layerExists = map.getLayer("jakarta-fill");
        if (layerExists) {
          map.setPaintProperty("jakarta-fill", "fill-color", [
            "step",
            ["get", selectedField],
            colorScale[0],
            1,
            colorScale[1],
            2,
            colorScale[2],
            3,
            colorScale[3],
            4,
            colorScale[4],
          ]);
        } else {
          console.warn(
            "Layer 'jakarta-fill' not found after style load. Style update skipped."
          );
        }
        map.off("style.load", onStyleLoad); // Clean up listener
      };
      map.on("style.load", onStyleLoad);
    }
  }, [selectedField, map]);

  return (
    <div className="relative text-black">
      {/* Map container */}
      <div id="map" className="w-full h-[600px]"></div>

      {/* Field selector */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded shadow max-h-[80vh] overflow-y-auto">
        <h3 className="font-bold mb-2">Select Demographic</h3>
        {fields.map((field) => (
          <label key={field.value} className="block">
            <input
              type="radio"
              name="field"
              value={field.value}
              checked={selectedField === field.value}
              onChange={(e) => setSelectedField(e.target.value)}
              className="mr-2"
            />
            {field.label}
          </label>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Legend</h3>
        {getRangeLabels(selectedField).map((range, index) => (
          <div key={index} className="flex items-center mb-1">
            <span
              className="w-4 h-4 mr-2 inline-block"
              style={{ backgroundColor: colorScale[index] }}
            ></span>
            <span>{range}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DemographicMap3;
