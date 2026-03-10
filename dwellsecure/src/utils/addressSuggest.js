import { API_BASE_URL } from '../config/api';

const MAPBOX_GEOCODE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const SUGGEST_LIMIT = 5;

/**
 * Fetch Mapbox access token from backend (no backend change; existing /api/mapbox-token).
 * @returns {Promise<string>}
 */
export async function getMapboxToken() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/mapbox-token`);
    const data = await res.json();
    return data.token || '';
  } catch (e) {
    console.warn('[addressSuggest] getMapboxToken failed:', e.message);
    return '';
  }
}

/**
 * Parse Mapbox feature context into city, state, zipCode, country.
 * @param {Array<{ id: string, text: string }>} context
 * @returns {{ city: string, state: string, zipCode: string, country: string }}
 */
function parseContext(context) {
  const out = { city: '', state: '', zipCode: '', country: '' };
  if (!Array.isArray(context)) return out;
  for (const c of context) {
    const id = (c.id || '').toLowerCase();
    const text = (c.text || '').trim();
    if (id.startsWith('place.')) out.city = text;
    else if (id.startsWith('region.')) out.state = text;
    else if (id.startsWith('postcode.')) out.zipCode = text;
    else if (id.startsWith('country.')) out.country = text;
  }
  return out;
}

/**
 * Build address line 1 from feature (street number + text or first part of place_name).
 * @param {object} feature - Mapbox feature
 * @returns {string}
 */
function getAddressLine1(feature) {
  const num = feature.address;
  const text = (feature.text || '').trim();
  if (num != null && text) return `${num} ${text}`.trim();
  if (text) return text;
  const placeName = (feature.place_name || '').trim();
  const firstComma = placeName.indexOf(',');
  return firstComma > 0 ? placeName.slice(0, firstComma).trim() : placeName;
}

/**
 * Get address suggestions from Mapbox Geocoding API (client-side; token from backend).
 * Does not change backend; uses existing mapbox token endpoint.
 * @param {string} query - Partial address
 * @param {string} accessToken - Mapbox token from getMapboxToken()
 * @returns {Promise<Array<{ place_name: string, latitude: number, longitude: number, addressLine1: string, city: string, state: string, zipCode: string, country: string }>>}
 */
export async function suggestAddresses(query, accessToken) {
  if (!query || typeof query !== 'string' || !query.trim() || !accessToken) {
    return [];
  }
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const url = `${MAPBOX_GEOCODE_URL}/${encodeURIComponent(q)}.json?access_token=${accessToken}&limit=${SUGGEST_LIMIT}&types=address,place`;
    const res = await fetch(url);
    const data = await res.json();
    const features = data.features || [];
    return features.map((f) => {
      const [lng, lat] = f.center || [0, 0];
      const { city, state, zipCode, country } = parseContext(f.context || []);
      return {
        place_name: f.place_name || '',
        latitude: lat,
        longitude: lng,
        addressLine1: getAddressLine1(f),
        city,
        state,
        zipCode,
        country: country || 'USA',
      };
    });
  } catch (e) {
    console.warn('[addressSuggest] suggestAddresses failed:', e.message);
    return [];
  }
}
