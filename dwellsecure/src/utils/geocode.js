/**
 * Geocode an address string to coordinates using Mapbox Geocoding API.
 * @param {string} address - Full address (e.g. "123 Main St, City, ST 12345")
 * @param {string} accessToken - Mapbox access token
 * @returns {Promise<{ latitude: number, longitude: number } | null>} Coordinates or null on failure
 */
export async function geocodeAddress(address, accessToken) {
  if (!address || typeof address !== 'string' || !address.trim()) {
    return null;
  }
  const token = accessToken || 'pk.eyJ1IjoiZ2Fha3Vtb3JhIiwiYSI6ImNtbDY0M2NvZTBiOGYzY29jNGRmdGFzdXkifQ.wg1qiR8XJsRxOKVIVKMYmQ';
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address.trim())}.json?access_token=${token}&limit=1`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const feature = data.features && data.features[0];
    if (!feature || !feature.geometry || !feature.geometry.coordinates) {
      return null;
    }
    const [lng, lat] = feature.geometry.coordinates;
    return { latitude: lat, longitude: lng };
  } catch (e) {
    console.warn('[geocode] Failed:', e.message);
    return null;
  }
}
