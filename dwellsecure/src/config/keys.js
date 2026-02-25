/**
 * Legacy/optional: OpenAI and Mapbox are now provided by the backend.
 * The app uses API_BASE_URL for AI and maps; no keys needed in the Expo app for release.
 * These exports remain only if something still imports them (e.g. fallback or dev).
 */
export const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
export const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
export const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';
