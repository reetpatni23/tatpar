import { useState, useEffect } from "react";
import LandslideMap from "./components/LandslideMap";
import SitePanel from "./components/SitePanel";
import { fetchLocations } from "./api";
import "./App.css";

function App() {
  const [features, setFeatures] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [rainfall, setRainfall] = useState(1.0);

  useEffect(() => {
    fetchLocations(rainfall).then((data) => setFeatures(data.features));
  }, [rainfall]);

  const selectedSite =
    features.find((f) => f.properties.id === selectedId)?.properties || null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">TATPAR</span>
        <span className="app-subtitle">Landslide Risk Monitoring — Aizawl District (Demo)</span>
        <div className="rainfall-control">
          <label htmlFor="rainfall">Simulated Rainfall Intensity</label>
          <input
            id="rainfall"
            type="range"
            min="1"
            max="2"
            step="0.1"
            value={rainfall}
            onChange={(e) => setRainfall(parseFloat(e.target.value))}
          />
          <span className="rainfall-value">{rainfall.toFixed(1)}x — Demo Input</span>
        </div>
      </header>
      <div className="body-wrap">
        <div className="map-wrap">
          <LandslideMap
            features={features}
            onSelect={setSelectedId}
            selectedId={selectedId}
          />
        </div>
        <SitePanel key={selectedId} site={selectedSite} rainfallMultiplier={rainfall} />
      </div>
    </div>
  );
}

export default App;
