export default function SitePanel({ site }) {
  if (!site) {
    return (
      <aside className="site-panel site-panel-empty">
        <p>Click a site on the map to see details.</p>
      </aside>
    );
  }

  const isTopPriority = site.priority_rank === 1;

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

      <button className="generate-btn">Generate Response</button>

      <p className="data-tag">Source: {site.data_source}</p>
    </aside>
  );
}
