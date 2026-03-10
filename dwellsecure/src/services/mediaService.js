import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { getAuthToken } from './authStorage';

/**
 * Upload a local media file (image/video) via the backend to Firebase Storage; returns the download URL.
 * @param {Object} params
 * @param {string} params.uri - Local file URI (file:// or content://)
 * @param {string} params.path - Storage path, e.g. 'shutoffs/<id>/photos/<ts>.jpg'
 * @param {string} [params.contentType] - MIME type, e.g. 'image/jpeg'
 * @returns {Promise<string>} download URL
 */
export async function uploadMedia({ uri, path, contentType = 'image/jpeg' }) {
  const formData = new FormData();
  formData.append('path', path);
  const name = path.split('/').pop() || 'file';
  formData.append('file', { uri, name, type: contentType });
  const token = await getAuthToken().catch(() => null);
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.uploadMedia}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || `Upload failed: ${response.status}`);
  }
  const data = await response.json();
  if (!data.url) throw new Error('Server did not return a URL');
  return data.url;
}
