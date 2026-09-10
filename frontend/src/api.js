export async function fetchLocations(rainfallMultiplier = 1.0) {
  const res = await fetch(
    `http://localhost:8000/api/locations?rainfall_multiplier=${rainfallMultiplier}`
  );
  if (!res.ok) throw new Error("Failed to fetch locations");
  return res.json();
}
