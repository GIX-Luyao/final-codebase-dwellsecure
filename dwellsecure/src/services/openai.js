import * as FileSystem from 'expo-file-system/legacy';
import { API_BASE_URL } from '../config/api';

/**
 * Send recorded audio (base64) to server for transcription and step extraction.
 * Returns { steps: string[] } to fill step fields, or { message: 'please provide more information' } to show alert.
 */
export const submitVoiceNoteForSteps = async (audioBase64) => {
  const response = await fetch(`${API_BASE_URL}/api/ai/voice-note`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64 }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${response.status}`);
  }
  const data = await response.json();
  if (data.message) return { message: data.message };
  if (data.steps && Array.isArray(data.steps)) return { steps: data.steps };
  return { message: 'please provide more information' };
};

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
      throw new Error(data.error || `Request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.text || 'Unable to answer your question. Please try again.';
  } catch (error) {
    console.error('Error asking about shutoffs:', error);
    throw error;
  }
};
