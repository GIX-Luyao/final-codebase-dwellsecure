import { API_BASE_URL } from '../config/api';

/**
 * Geocode an address via backend (Mapbox key stays on server).
 * @param {string} address - Full address
 * @param {string} _accessToken - Ignored; token is on server
 * @returns {Promise<{ latitude: number, longitude: number } | null>}
 */
export async function geocodeAddress(address, _accessToken) {
  if (!address || typeof address !== 'string' || !address.trim()) {
    return null;
  }
  try {
    const url = `${API_BASE_URL}/api/geocode?address=${encodeURIComponent(address.trim())}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.latitude != null && data.longitude != null) {
      return { latitude: data.latitude, longitude: data.longitude };
    }
    return null;
  } catch (e) {
    console.warn('[geocode] Failed:', e.message);
    return null;
  }
}
