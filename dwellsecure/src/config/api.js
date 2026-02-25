/**
 * API configuration – single place for all DwellSecure backend API settings.
 * (Builder.io and other third-party APIs are not included here.)
 */
import { Platform } from 'react-native';

// --- Base URL ---
const PRODUCTION_DEFAULT = 'https://dwellsecuregix.onrender.com';
const DEV_WEB = 'https://dwellsecuregix.onrender.com';
const DEV_ANDROID = 'https://dwellsecuregix.onrender.com';
const DEV_IOS = 'https://dwellsecuregix.onrender.com';
const DEV_FALLBACK = 'http://localhost:3000';

export function getApiBaseUrl() {
  if (!__DEV__) {
    return process.env.EXPO_PUBLIC_API_URL || PRODUCTION_DEFAULT;
  }
  if (Platform.OS === 'web') return DEV_WEB;
  if (Platform.OS === 'android') return process.env.EXPO_PUBLIC_API_URL || DEV_ANDROID;
  if (Platform.OS === 'ios') return process.env.EXPO_PUBLIC_API_URL || DEV_IOS;
  return DEV_FALLBACK;
}

export const API_BASE_URL = getApiBaseUrl();

// --- Health check ---
export const HEALTH_PATH = '/health';
export const HEALTH_TIMEOUT_MS = 5000;

// --- API path constants (backend routes) ---
export const API_ENDPOINTS = {
  health: '/health',
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
  },
  shutoffs: '/api/shutoffs',
  utilities: '/api/utilities',
  reminders: '/api/reminders',
  properties: '/api/properties',
};
