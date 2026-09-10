import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const AIZAWL_CENTER = [23.7307, 92.7173];

function rankColor(rank) {
  if (rank === 1) return "#d32f2f";
  if (rank === 2) return "#f57c00";
  return "#2e7d32";
}

export default function LandslideMap({ features, onSelect, selectedId }) {
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
        const isSelected = p.id === selectedId;
        const showVillages = isSelected && p.village_points?.length > 0;

        return (
          <div key={p.id}>
            {showVillages &&
              p.village_points.map((v) => (
                <div key={v.name}>
                  <Polyline
                    positions={[[lat, lng], [v.lat, v.lng]]}
                    pathOptions={{
                      color: "#d32f2f",
                      weight: 2,
                      dashArray: "6 6",
                      opacity: 0.8,
                    }}
                  />
                  <CircleMarker
                    center={[v.lat, v.lng]}
                    radius={6}
                    pathOptions={{
                      color: "#fff",
                      fillColor: "#d32f2f",
                      fillOpacity: 1,
                      weight: 2,
                    }}
                  >
                    <Tooltip permanent direction="top" offset={[0, -6]}>
                      {v.name}
                    </Tooltip>
                  </CircleMarker>
                </div>
              ))}

            <CircleMarker
              center={[lat, lng]}
              radius={p.priority_rank === 1 ? 16 : 11}
              pathOptions={{
                color: rankColor(p.priority_rank),
                fillColor: rankColor(p.priority_rank),
                fillOpacity: 0.7,
                weight: 2,
              }}
              eventHandlers={{ click: () => onSelect && onSelect(p.id) }}
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
          </div>
        );
      })}
    </MapContainer>
  );
}
