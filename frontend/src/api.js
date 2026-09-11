export async function fetchLocations(rainfallMultiplier = 1.0) {
  const res = await fetch(
    `https://tatpar.onrender.com/api/locations?rainfall_multiplier=${rainfallMultiplier}`
  );
  if (!res.ok) throw new Error("Failed to fetch locations");
  return res.json();
}

export async function fetchResponse(siteId, rainfallMultiplier = 1.0) {
  const res = await fetch(
    `https://tatpar.onrender.com/api/response/${siteId}?rainfall_multiplier=${rainfallMultiplier}`
  );
  if (!res.ok) throw new Error("Failed to fetch response");
  return res.json();
}
