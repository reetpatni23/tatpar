export async function fetchLocations() {
  const res = await fetch("http://localhost:8000/api/locations");
  if (!res.ok) throw new Error("Failed to fetch locations");
  return res.json();
}
