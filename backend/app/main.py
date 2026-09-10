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
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))

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


def generate_response_text(props: dict) -> dict:
    rank = props["priority_rank"]
    urgency = "IMMEDIATE" if rank == 1 else ("ELEVATED" if rank == 2 else "MONITOR")

    actions = []
    if props["critical_road"]:
        actions.append("Deploy road inspection team to assess structural stability before next rainfall window.")
    if props["isolation_risk"] == "High":
        actions.append(f"Pre-position emergency supplies for {', '.join(props['affected_villages'])} in case of access loss.")
    if "Hospital" in props.get("essential_facility_access", ""):
        actions.append("Coordinate alternate medical evacuation route with district health authority.")
    if props["population_exposure"] > 1000:
        actions.append(f"Issue advisory to {props['population_exposure']:,} residents in the exposure zone.")
    if not actions:
        if urgency == "ELEVATED":
            actions.append("Increase monitoring frequency and prepare resources in case conditions worsen.")
        else:
            actions.append("Continue routine monitoring; no immediate field action required.")

    return {
        "urgency": urgency,
        "site_name": props["name"],
        "priority_rank": rank,
        "actions": actions,
        "confidence_note": f"Based on {int(props['confidence'] * 100)}% model confidence — recommend field verification before dispatch.",
    }


@app.get("/api/response/{site_id}")
def get_response(site_id: str, rainfall_multiplier: float = 1.0):
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))

    for feature in data["features"]:
        props = feature["properties"]
        adjusted_hazard, score = compute_priority(props, rainfall_multiplier)
        props["hazard_probability"] = adjusted_hazard
        props["priority_score"] = score

    ranked = sorted(data["features"], key=lambda f: f["properties"]["priority_score"], reverse=True)
    for i, feature in enumerate(ranked, start=1):
        feature["properties"]["priority_rank"] = i

    target = next((f for f in data["features"] if f["properties"]["id"] == site_id), None)
    if not target:
        return {"error": "site not found"}

    return generate_response_text(target["properties"])
