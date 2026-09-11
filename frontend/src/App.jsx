import { useState, useEffect } from "react";
import LandslideMap from "./components/LandslideMap";
import SitePanel from "./components/SitePanel";
import { fetchLocations } from "./api";
import "./App.css";

function rainfallLabel(value) {
  if (value < 1.3) return "Normal";
  if (value < 1.7) return "Elevated";
  return "Heavy";
}

function App() {
  const [features, setFeatures] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [rainfall, setRainfall] = useState(1.0);

  useEffect(() => {
    fetchLocations(rainfall).then((data) => setFeatures(data.features));
  }, [rainfall]);

  const [baselineRainfall, setBaselineRainfall] = useState(1.0);
  const [baselineFeatures, setBaselineFeatures] = useState([]);

  const selectedSite =
    features.find((f) => f.properties.id === selectedId)?.properties || null;

  const baselineSite =
    baselineFeatures.find((f) => f.properties.id === selectedId)?.properties || null;

  const handleSelect = (id) => {
    setBaselineRainfall(rainfall);
    setBaselineFeatures(features);
    setSelectedId(id);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">TATPAR</span>
        <span className="app-subtitle">Landslide Risk Monitoring — Aizawl District (Demo)</span>
        <div className="rainfall-control">
          <label htmlFor="rainfall">Simulated Rainfall Intensity</label>
          <div className="rainfall-slider-row">
            <span className="rainfall-scale-label">Normal</span>
            <input
              id="rainfall"
              type="range"
              min="1"
              max="2"
              step="0.1"
              value={rainfall}
              onChange={(e) => setRainfall(parseFloat(e.target.value))}
            />
            <span className="rainfall-scale-label">Heavy</span>
          </div>
          <span className="rainfall-value">
            {rainfall.toFixed(1)}x — {rainfallLabel(rainfall)} (Demo Input)
          </span>
        </div>
      </header>
      <div className="body-wrap">
        <div className="map-wrap">
          <LandslideMap
            features={features}
            onSelect={handleSelect}
            selectedId={selectedId}
          />
          <div className="map-legend">
            <div className="map-legend-item">
              <span className="map-legend-dot rank-1"></span> Priority #1
            </div>
            <div className="map-legend-item">
              <span className="map-legend-dot rank-2"></span> Priority #2
            </div>
            <div className="map-legend-item">
              <span className="map-legend-dot rank-3"></span> Priority #3
            </div>
          </div>
        </div>
        <SitePanel
          key={selectedId}
          site={selectedSite}
          rainfallMultiplier={rainfall}
          baselineSite={baselineSite}
          baselineRainfall={baselineRainfall}
        />
      </div>
    </div>
  );
}

export default App;
