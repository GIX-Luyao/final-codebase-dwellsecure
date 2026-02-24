import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@dwellsecure:auth_token';
const USER_KEY = '@dwellsecure:user';

/**
 * Persist auth token (for future API integration).
 */
export const setAuthToken = async (token) => {
  try {
    if (token) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch (e) {
    console.warn('[AuthStorage] setAuthToken failed:', e);
  }
};

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (e) {
    console.warn('[AuthStorage] getAuthToken failed:', e);
    return null;
  }
};

/**
 * Persist user object { id, email, name }.
 */
export const setUser = async (user) => {
  try {
    if (user && typeof user === 'object') {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(USER_KEY);
    }
  } catch (e) {
    console.warn('[AuthStorage] setUser failed:', e);
  }
};

export const getUser = async () => {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('[AuthStorage] getUser failed:', e);
    return null;
  }
};

/**
 * Clear all auth data (sign out).
 */
export const clearAuth = async () => {
  try {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_KEY]);
  } catch (e) {
    console.warn('[AuthStorage] clearAuth failed:', e);
  }
};
