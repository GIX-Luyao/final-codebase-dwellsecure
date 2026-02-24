/**
 * Geocoding utility - converts address to coordinates using Mapbox Geocoding API
 */

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ2Fha3Vtb3JhIiwiYSI6ImNtbDY0M2NvZTBiOGYzY29jNGRmdGFzdXkifQ.wg1qiR8XJsRxOKVIVKMYmQ';

/**
 * Geocode an address string to coordinates
 * @param {string} address - Full address (e.g. "123 Main St, City, State 12345, USA")
 * @returns {Promise<{latitude: number, longitude: number} | null>} Coordinates or null if failed
 */
export const geocodeAddress = async (address) => {
  if (!address || typeof address !== 'string') return null;
  const trimmed = address.trim();
  if (!trimmed) return null;

  try {
    const encoded = encodeURIComponent(trimmed);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn('[Geocoding] API error:', response.status);
      return null;
    }
    const data = await response.json();
    const features = data?.features;
    if (!features || features.length === 0) {
      console.warn('[Geocoding] No results for:', trimmed);
      return null;
    }
    const [lng, lat] = features[0].geometry?.coordinates || [];
    if (lat == null || lng == null) return null;
    return { latitude: lat, longitude: lng };
  } catch (error) {
    console.error('[Geocoding] Error:', error);
    return null;
  }
};
