/**
 * Mode Service - Manages app mode state (Normal vs Emergency)
 * 
 * SYSTEM BEHAVIOR: This service controls the operational mode of the app,
 * which affects data retrieval logic and permission checks throughout the app.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const MODE_KEY = '@dwellsecure:app_mode';
const NORMAL_MODE = 'normal';
const EMERGENCY_MODE = 'emergency';

/**
 * Get current app mode
 * @returns {Promise<'normal'|'emergency'>}
 */
export const getAppMode = async () => {
  try {
    const mode = await AsyncStorage.getItem(MODE_KEY);
    return mode === EMERGENCY_MODE ? EMERGENCY_MODE : NORMAL_MODE;
  } catch (error) {
    console.error('Error getting app mode:', error);
    return NORMAL_MODE; // Default to normal mode
  }
};

/**
 * Set app mode
 * @param {'normal'|'emergency'} mode
 */
export const setAppMode = async (mode) => {
  try {
    if (mode === EMERGENCY_MODE || mode === NORMAL_MODE) {
      await AsyncStorage.setItem(MODE_KEY, mode);
    } else {
      throw new Error(`Invalid mode: ${mode}`);
    }
  } catch (error) {
    console.error('Error setting app mode:', error);
    throw error;
  }
};

/**
 * Check if app is in Emergency Mode
 * @returns {Promise<boolean>}
 */
export const isEmergencyMode = async () => {
  const mode = await getAppMode();
  return mode === EMERGENCY_MODE;
};

/**
 * Check if app is in Normal Mode
 * @returns {Promise<boolean>}
 */
export const isNormalMode = async () => {
  const mode = await getAppMode();
  return mode === NORMAL_MODE;
};

export { NORMAL_MODE, EMERGENCY_MODE };
