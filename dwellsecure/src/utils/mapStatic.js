import { API_BASE_URL } from '../config/api';

/** Map thumbnail URL via backend (token stays on server). */
export function getMapThumbnailUrl(latitude, longitude, width = 120, height = 120, zoom = 15) {
  if (latitude == null || longitude == null) return null;
  const params = new URLSearchParams({ lat: latitude, lng: longitude, width, height, zoom });
  return `${API_BASE_URL}/api/map-static?${params.toString()}`;
}
