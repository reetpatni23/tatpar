import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="TATPAR API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "demo" / "locations.geojson"

# Demo village coordinates near Aizawl, used only for sites with affected_villages
VILLAGE_COORDS = {
    "Sialsuk": [92.8350, 23.6700],
    "Ratu": [92.8500, 23.6550],
    "Zote": [92.8250, 23.6450],
    "Zemabawk": [92.7600, 23.7500],
    "Durtlang": [92.7200, 23.7850],
}


def compute_priority(props: dict, rainfall_multiplier: float) -> tuple:
    base_hazard = props["hazard_probability"]
    adjusted_hazard = min(base_hazard * rainfall_multiplier, 0.97)

    exposure = min(props["population_exposure"] / 3500, 1.0)
    criticality = 1.0 if props["critical_road"] else 0.3
    isolation_map = {"Low": 0.2, "Medium": 0.5, "High": 1.0}
    isolation = isolation_map.get(props["isolation_risk"], 0.3)

    score = (0.30 * adjusted_hazard) + (0.30 * exposure) + (0.20 * criticality) + (0.20 * isolation)
    return round(adjusted_hazard, 3), round(score, 3)


@app.get("/api/locations")
def get_locations(rainfall_multiplier: float = 1.0):
    data = json.loads(DATA_PATH.read_text())

    for feature in data["features"]:
        props = feature["properties"]
        adjusted_hazard, score = compute_priority(props, rainfall_multiplier)
        props["hazard_probability"] = adjusted_hazard
        props["priority_score"] = score
        props["rainfall_multiplier_applied"] = rainfall_multiplier

        # Attach village coordinates for isolation visualization
        props["village_points"] = [
            {"name": v, "lng": VILLAGE_COORDS[v][0], "lat": VILLAGE_COORDS[v][1]}
            for v in props["affected_villages"]
            if v in VILLAGE_COORDS
        ]

    ranked = sorted(data["features"], key=lambda f: f["properties"]["priority_score"], reverse=True)
    for i, feature in enumerate(ranked, start=1):
        feature["properties"]["priority_rank"] = i

    return data
