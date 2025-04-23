"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Create a custom icon using SVG
const customIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor">
      <path fill="#1E3A8A" stroke="#ffffff" strokeWidth="2" d="M16 2 C10.477 2 6 6.477 6 12 C6 17.523 16 30 16 30 S26 17.523 26 12 C26 6.477 21.523 2 16 2 Z M16 16 C13.791 16 12 14.209 12 12 S13.791 8 16 8 S20 9.791 20 12 S18.209 16 16 16 Z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

export default function Map() {
  const position: [number, number] = [-6.1754, 106.8272] // Jakarta coordinates

  useEffect(() => {
    // This is needed to re-render the map when the component mounts
    window.dispatchEvent(new Event("resize"))
  }, [])

  return (
    <MapContainer center={position} zoom={13} style={{ height: "400px", width: "100%" }} scrollWheelZoom={false}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position} icon={customIcon}>
        <Popup>Jakarta, Indonesia</Popup>
      </Marker>
    </MapContainer>
  )
}

