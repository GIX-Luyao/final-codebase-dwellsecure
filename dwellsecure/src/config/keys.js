/**
 * API keys and third-party URLs (except Builder.io).
 * Use env: EXPO_PUBLIC_OPENAI_API_KEY, EXPO_PUBLIC_MAPBOX_TOKEN.
 */
export const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
export const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

/** Mapbox: public token for maps/geocoding. Set EXPO_PUBLIC_MAPBOX_TOKEN to override. */
const MAPBOX_DEFAULT = 'pk.eyJ1IjoiZ2Fha3Vtb3JhIiwiYSI6ImNtbDY0M2NvZTBiOGYzY29jNGRmdGFzdXkifQ.wg1qiR8XJsRxOKVIVKMYmQ';
export const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || MAPBOX_DEFAULT;
