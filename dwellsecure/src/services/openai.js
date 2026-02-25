import * as FileSystem from 'expo-file-system/legacy';
import { API_BASE_URL } from '../config/api';

export const identifyShutoffFromImage = async (imageUri, question = 'What type of shutoff is this? Help me identify this utility shutoff and provide key information about it.') => {
  try {
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    const response = await fetch(`${API_BASE_URL}/api/ai/identify-shutoff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64Image, question }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.text || 'Unable to identify the shutoff. Please try again.';
  } catch (error) {
    console.error('Error identifying shutoff:', error);
    throw error;
  }
};

export const askAboutShutoffs = async (question) => {
  const url = `${API_BASE_URL}/api/ai/ask`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      // #region agent log
      console.warn('[DEBUG] ask API failed', { url, status: response.status, apiBase: API_BASE_URL });
      fetch('http://127.0.0.1:7242/ingest/14f14bef-012d-49c5-bc8a-a091927f7e62', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'openai.js:askAboutShutoffs', message: 'ask API non-OK', data: { url, status: response.status, statusText: response.statusText, apiBase: API_BASE_URL }, timestamp: Date.now(), hypothesisId: '404-cause' }) }).catch(() => {});
      // #endregion
      throw new Error(data.error || `Request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.text || 'Unable to answer your question. Please try again.';
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/14f14bef-012d-49c5-bc8a-a091927f7e62', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'openai.js:askAboutShutoffs:catch', message: 'ask failed', data: { url, apiBase: API_BASE_URL, errorMessage: error.message }, timestamp: Date.now(), hypothesisId: '404-cause' }) }).catch(() => {});
    // #endregion
    console.error('Error asking about shutoffs:', error);
    throw error;
  }
};
