import { useState } from "react";
import { fetchResponse } from "../api";

export default function SitePanel({ site, rainfallMultiplier }) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!site) {
    return (
      <aside className="site-panel site-panel-empty">
        <div className="empty-state-content">
          <h3>Hazard alone isn't the full picture.</h3>
          <p className="empty-state-sub">
            TATPAR ranks sites by consequence — population exposure, critical
            roads, and isolation risk — not hazard probability alone.
          </p>
          <p className="empty-state-cta">Click a site on the map to see details.</p>
        </div>
      </aside>
    );
  }

  const isTopPriority = site.priority_rank === 1;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await fetchResponse(site.id, rainfallMultiplier);
      setResponse(result);
    } catch (e) {
      setResponse({ error: "Could not generate response." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="site-panel">
      <div className="site-panel-header">
        <span className={`rank-badge rank-${site.priority_rank}`}>
          Priority #{site.priority_rank}
        </span>
        <h2>{site.name}</h2>
      </div>

      <div className="site-panel-grid">
        <div>
          <span className="label">Hazard Probability</span>
          <span className="value">{Math.round(site.hazard_probability * 100)}%</span>
        </div>
        <div>
          <span className="label">Confidence</span>
          <span className="value">{Math.round(site.confidence * 100)}%</span>
        </div>
        <div>
          <span className="label">Population Exposure</span>
          <span className="value">{site.population_exposure.toLocaleString()}</span>
        </div>
        <div>
          <span className="label">Critical Road</span>
          <span className="value">{site.critical_road ? "Yes" : "No"}</span>
        </div>
        <div>
          <span className="label">Isolation Risk</span>
          <span className="value">{site.isolation_risk}</span>
        </div>
        <div>
          <span className="label">Facility Access</span>
          <span className="value">{site.essential_facility_access}</span>
        </div>
      </div>

      <div className="section">
        <span className="label">Affected Villages</span>
        <p>{site.affected_villages.join(", ")}</p>
      </div>

      {site.evidence_basis && (
        <div className="section">
          <span className="label">Confidence Basis (Demo Evidence)</span>
          <ul className="evidence-list">
            {site.evidence_basis.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {isTopPriority && (
        <div className="why-box">
          <strong>Why Priority #1?</strong>
          <p>
            Even though this site does not have the highest hazard probability,
            it threatens a critical road, cuts off {site.affected_villages.length}{" "}
            villages, and risks hospital access for {site.population_exposure.toLocaleString()}{" "}
            people — making its consequence far greater than higher-hazard sites nearby.
          </p>
        </div>
      )}

      <button className="generate-btn" onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Response"}
      </button>

      {response && !response.error && (
        <div className={`response-box urgency-${response.urgency.toLowerCase()}`}>
          <span className="urgency-tag">{response.urgency}</span>
          <ul>
            {response.actions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
          <p className="confidence-note">{response.confidence_note}</p>
        </div>
      )}

      <p className="data-tag">Source: {site.data_source}</p>
    </aside>
  );
}
