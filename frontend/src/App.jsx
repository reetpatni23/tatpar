import { useState } from "react";
import LandslideMap from "./components/LandslideMap";
import SitePanel from "./components/SitePanel";
import "./App.css";

function App() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">TATPAR</span>
        <span className="app-subtitle">Landslide Risk Monitoring — Aizawl District (Demo)</span>
      </header>
      <div className="body-wrap">
        <div className="map-wrap">
          <LandslideMap onSelect={setSelected} />
        </div>
        <SitePanel site={selected} />
      </div>
    </div>
  );
}

export default App;
