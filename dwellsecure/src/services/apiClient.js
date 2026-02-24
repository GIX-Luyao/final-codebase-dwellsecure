/**
 * API Client for backend communication
 * Falls back to AsyncStorage if API is unavailable
 */

import { Platform } from 'react-native';

// Determine the correct API URL based on platform
const getApiBaseUrl = () => {
  if (!__DEV__) {
    // Production: use environment variable or default
    return process.env.EXPO_PUBLIC_API_URL || 'https://your-api-domain.com';
  }

  // Development: platform-specific URLs
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  } else if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    // For physical device, you'll need to set EXPO_PUBLIC_API_URL to your computer's IP
    return process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
  } else if (Platform.OS === 'ios') {
    // iOS simulator: use computer's IP address (localhost/127.0.0.1 often doesn't work)
    // For physical device, you'll need to set EXPO_PUBLIC_API_URL to your computer's IP
    // Default to 192.168.1.166 (your main network IP) - change if needed
    return process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.166:3000';
  }

  // Fallback
  return 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();

// Export for diagnostic purposes
export { API_BASE_URL };

// Log the API URL being used (helpful for debugging)
console.log(`[API] Platform: ${Platform.OS}, API URL: ${API_BASE_URL}`);

let isApiAvailable = true;

/**
 * Check if API is available
 */
export const checkApiHealth = async () => {
  try {
    console.log(`[API] Checking health at ${API_BASE_URL}/health`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      isApiAvailable = data.db === 'connected';
      console.log(`[API] Health check result: ${isApiAvailable ? 'CONNECTED ✅' : 'DISCONNECTED ❌'}`, data);
      if (!isApiAvailable) {
        console.warn(`[API] MongoDB not connected. DB status: ${data.db}`);
      }
      return isApiAvailable;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout: Server did not respond within 5 seconds');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('[API] Health check failed:', error.message);
    console.error('[API] Full error:', error);
    console.warn('[API] Will use AsyncStorage fallback');
    isApiAvailable = false;
    return false;
  }
};

/**
 * Generic API request handler with error handling
 */
const apiRequest = async (endpoint, options = {}) => {
  const method = options.method || 'GET';
  const url = `${API_BASE_URL}${endpoint}`;
  const startTime = Date.now();
  
  try {
    // Log outgoing request
    console.log(`[API] → ${method} ${endpoint}`);
    if (method === 'POST' && options.body) {
      try {
        const bodyData = JSON.parse(options.body);
        console.log(`[API] → POST body:`, { 
          id: bodyData.id, 
          type: bodyData.type,
          description: bodyData.description?.substring(0, 30) + '...' 
        });
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      // For PUT 404, log as info instead of error (expected fallback scenario)
      if (method === 'PUT' && response.status === 404) {
        console.log(`[API] → ${method} ${endpoint} → ${response.status} (not supported, will fallback)`);
      } else {
        console.error(`[API] ✗ ${method} ${endpoint} → ${response.status} ${response.statusText} (${duration}ms)`);
        console.error(`[API] Error details:`, errorText);
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[API] ✓ ${method} ${endpoint} → ${response.status} OK (${duration}ms)`);
    return data;
  } catch (error) {
    const duration = Date.now() - startTime;
    if (error.message === 'API_UNAVAILABLE') {
      console.warn(`[API] ✗ ${method} ${endpoint} → API_UNAVAILABLE (${duration}ms)`);
    } else if (error.message.includes('Network request failed') || error.message.includes('fetch failed')) {
      console.error(`[API] ✗ ${method} ${endpoint} → Network Error (${duration}ms)`);
      console.error(`[API] Network error details:`, error.message);
    } else if (method === 'PUT' && error.message.includes('404')) {
      // PUT 404 is expected (method not supported), already logged above, don't log again as error
      // Just silently re-throw
    } else {
      console.error(`[API] ✗ ${method} ${endpoint} → Error (${duration}ms):`, error.message);
    }
    throw error;
  }
};

/**
 * GET request
 */
export const apiGet = async (endpoint) => {
  if (!isApiAvailable) {
    throw new Error('API_UNAVAILABLE');
  }
  return apiRequest(endpoint, { method: 'GET' });
};

/**
 * POST request
 */
export const apiPost = async (endpoint, data) => {
  if (!isApiAvailable) {
    console.warn(`[API] POST ${endpoint} skipped - API marked as unavailable`);
    throw new Error('API_UNAVAILABLE');
  }
  console.log(`[API] POST ${endpoint}`, data);
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUT request (for updates)
 */
export const apiPut = async (endpoint, data) => {
  if (!isApiAvailable) {
    console.warn(`[API] PUT ${endpoint} skipped - API marked as unavailable`);
    throw new Error('API_UNAVAILABLE');
  }
  console.log(`[API] PUT ${endpoint}`, data);
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request
 */
export const apiDelete = async (endpoint) => {
  if (!isApiAvailable) {
    throw new Error('API_UNAVAILABLE');
  }
  return apiRequest(endpoint, { method: 'DELETE' });
};

/**
 * Initialize API connection
 */
export const initApi = async () => {
  console.log('[API] Initializing API connection...');
  console.log(`[API] Target URL: ${API_BASE_URL}`);
  const available = await checkApiHealth();
  console.log(`[API] Initialization complete. Available: ${available}`);
  return available !== undefined ? available : false;
};

// Export API availability status
export const getApiAvailability = () => isApiAvailable;
export const setApiAvailability = (available) => {
  isApiAvailable = available;
};
