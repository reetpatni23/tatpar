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


def compute_priority(props: dict) -> float:
    hazard = props["hazard_probability"]
    exposure = min(props["population_exposure"] / 3500, 1.0)
    criticality = 1.0 if props["critical_road"] else 0.3
    isolation_map = {"Low": 0.2, "Medium": 0.5, "High": 1.0}
    isolation = isolation_map.get(props["isolation_risk"], 0.3)

    # Weighted: hazard matters, but consequence (exposure/criticality/isolation) matters more
    score = (0.30 * hazard) + (0.30 * exposure) + (0.20 * criticality) + (0.20 * isolation)
    return round(score, 3)


@app.get("/api/locations")
def get_locations():
    data = json.loads(DATA_PATH.read_text())
    for feature in data["features"]:
        feature["properties"]["priority_score"] = compute_priority(feature["properties"])

    ranked = sorted(data["features"], key=lambda f: f["properties"]["priority_score"], reverse=True)
    for i, feature in enumerate(ranked, start=1):
        feature["properties"]["priority_rank"] = i

    return data
