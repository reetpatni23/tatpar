import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchLocations } from "../api";

const AIZAWL_CENTER = [23.7307, 92.7173];

function rankColor(rank) {
  if (rank === 1) return "#d32f2f";
  if (rank === 2) return "#f57c00";
  return "#2e7d32";
}

export default function LandslideMap({ onSelect, rainfallMultiplier }) {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    fetchLocations(rainfallMultiplier).then((data) => setFeatures(data.features));
  }, [rainfallMultiplier]);

  return (
    <MapContainer
      center={AIZAWL_CENTER}
      zoom={11}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {features.map((f) => {
        const p = f.properties;
        const [lng, lat] = f.geometry.coordinates;
        return (
          <CircleMarker
            key={p.id}
            center={[lat, lng]}
            radius={p.priority_rank === 1 ? 16 : 11}
            pathOptions={{
              color: rankColor(p.priority_rank),
              fillColor: rankColor(p.priority_rank),
              fillOpacity: 0.7,
              weight: 2,
            }}
            eventHandlers={{ click: () => onSelect && onSelect(p) }}
          >
            <Popup>
              <strong>{p.name}</strong>
              <br />
              Priority Rank: #{p.priority_rank}
              <br />
              Hazard Probability: {p.hazard_probability}
              <br />
              Priority Score: {p.priority_score}
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
