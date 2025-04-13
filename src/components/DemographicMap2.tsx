"use client";

import React, { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const DemographicMap2: React.FC = () => {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(
    "Balita_0_5_tahun_bin"
  );
  const [binRanges, setBinRanges] = useState<{ [key: string]: number[] }>({});

  // Define age groups and their corresponding GeoJSON bin fields
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

  // Color scale for bins 1–5 (Blues palette)
  const colorScale = [
    "#f7fbff", // Bin 1
    "#c6dbef", // Bin 2
    "#9ecae1", // Bin 3
    "#6baed6", // Bin 4
    "#08306b", // Bin 5
  ];

  // Fetch breakpoints
  useEffect(() => {
    fetch("/umur_jenks_breakpoints.json")
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
    let popup: maplibregl.Popup | null = null;

    const initializeMap = () => {
      const mapInstance = new maplibregl.Map({
        container: "map",
        style:
          "https://api.maptiler.com/maps/streets/style.json?key=Xyghbo5YEVnVdA3iTYjo", // Free MapLibre style
        center: [106.8456, -6.2088], // Jakarta coordinates
        zoom: 10,
      });

      // Add error handling
      mapInstance.on("error", (error) => {
        console.error("Map error:", error);
      });

      // Wait for style to load
      mapInstance.on("load", () => {
        console.log("Map style loaded successfully");

        // Only proceed with map operations after style is loaded
        mapInstance.addSource("jakarta", {
          type: "geojson",
          data: "/demografi-jakarta-with-bins.geojson",
        });

        // Add layer after source is added
        mapInstance.addLayer({
          id: "jakarta-fill",
          type: "fill",
          source: "jakarta",
          paint: {
            "fill-color": [
              "step",
              ["get", selectedAgeGroup],
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

        // Initialize popup
        popup = new maplibregl.Popup({
          closeButton: true,
          closeOnClick: true,
        });

        // Add mouse events
        mapInstance.on("mousemove", "jakarta-fill", (e) => {
          mapInstance.getCanvas().style.cursor = "pointer";
          const features = mapInstance.queryRenderedFeatures(e.point, {
            layers: ["jakarta-fill"],
          });

          if (features.length > 0) {
            const feature = features[0];
            const props = feature.properties;
            const ageGroupLabel =
              ageGroups.find((group) => group.value === selectedAgeGroup)
                ?.label || "Population";
            const population = props[selectedAgeGroup.replace("_bin", "")];
            const bin = props[selectedAgeGroup];
            const range = binRanges[selectedAgeGroup]
              ? getRangeLabels(selectedAgeGroup)[bin - 1] || "N/A"
              : `Bin ${bin}`;
            popup
              ?.setLngLat(e.lngLat)
              .setHTML(
                `<strong style="color: black">${
                  props.kecamatan || "Area"
                }</strong><br>
                <span style="color: black">${ageGroupLabel}: ${population}</span><br>
                <span style="color: black">Bin: ${bin}</span>
                <span style="color: black">Range: ${range}</span>`
              )
              .addTo(mapInstance);
          }
        });

        mapInstance.on("mouseleave", "jakarta-fill", () => {
          mapInstance.getCanvas().style.cursor = "";
          if (popup) {
            popup.remove();
          }
        });

        // Set map state after everything is initialized
        setMap(mapInstance);
      });
    };

    // Only initialize if map is not already initialized
    if (!map) {
      initializeMap();
    }

    // Cleanup on unmount
    return () => {
      if (map && popup) {
        popup.remove();
        map.remove();
      }
    };
  }, [map, selectedAgeGroup]);

  // Update fill color when age group changes
  useEffect(() => {
    if (map) {
      map.setPaintProperty("jakarta-fill", "fill-color", [
        "step",
        ["get", selectedAgeGroup],
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
    }
  }, [map, selectedAgeGroup]);

  return (
    <div className="relative">
      {/* Map container */}
      <div id="map" className="w-full h-[600px]"></div>

      {/* Age group selector */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded shadow text-black">
        <h3 className="font-bold mb-2">Select Age Group</h3>
        {ageGroups.map((group) => (
          <label key={group.value} className="block">
            <input
              type="radio"
              name="ageGroup"
              value={group.value}
              checked={selectedAgeGroup === group.value}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="mr-2"
            />
            {group.label}
          </label>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-4 rounded shadow text-black">
        <h3 className="font-bold mb-2">Legend</h3>
        {/* {colorScale.map((color, index) => (
          <div key={index} className="flex items-center mb-1">
            <span
              className="w-4 h-4 mr-2 inline-block"
              style={{ backgroundColor: color }}
            ></span>
            <span>Bin {index + 1}</span>
          </div>
        ))} */}
        {getRangeLabels(selectedAgeGroup).map((range, index) => (
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

export default DemographicMap2;
