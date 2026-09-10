import { useState } from "react";
import LandslideMap from "./components/LandslideMap";
import SitePanel from "./components/SitePanel";
import "./App.css";

function App() {
  const [selected, setSelected] = useState(null);
  const [rainfall, setRainfall] = useState(1.0);

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
            onSelect={setSelected}
            rainfallMultiplier={rainfall}
            selectedId={selected?.id}
          />
        </div>
        <SitePanel site={selected} rainfallMultiplier={rainfall} />
      </div>
    </div>
  );
}

export default App;
