// Plain client-side calls to public geocoding services — deliberately not
// routed through the FastAPI backend, which only forward-geocodes (and only
// as part of resolving a weather forecast, not as a standalone lookup) and
// explicitly does not reverse-geocode at all (see backend/docs/PRD.md).

export interface GeocodeCandidate {
  latitude: number;
  longitude: number;
  label: string;
}

// Same public API the backend uses for forward search (see
// backend/app/clients/openmeteo.py) — called directly here so the location
// search screen can list multiple candidates for the user to disambiguate,
// which the backend's all-in-one /weather/forecast endpoint doesn't expose.
export async function searchLocations(query: string): Promise<GeocodeCandidate[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=8&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Location search failed.");
  const body = await response.json();
  const results: Array<{ name: string; admin1?: string; country?: string; latitude: number; longitude: number }> =
    body?.results ?? [];
  return results.map((r) => ({
    latitude: r.latitude,
    longitude: r.longitude,
    label: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
  }));
}

// Free, no-key, CORS-enabled reverse-geocoding endpoint made for client-side
// use — there's no equivalent in Open-Meteo's API (forward search only).
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const body = await response.json();
    const place = body?.city || body?.locality;
    const region = body?.principalSubdivision;
    const country = body?.countryName;
    return [place, region ?? country].filter(Boolean).join(", ") || null;
  } catch {
    return null;
  }
}
