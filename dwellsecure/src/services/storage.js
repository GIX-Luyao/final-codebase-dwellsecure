import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { getAppMode, EMERGENCY_MODE } from './modeService';
import { apiGet, apiPost, apiPostForce, apiPut, apiDelete, getApiAvailability, setApiAvailability } from './apiClient';
import { addPending } from './syncService';

const SHUTOFFS_KEY = '@dwellsecure:shutoffs';
const REMINDERS_KEY = '@dwellsecure:reminders';
const UTILITIES_KEY = '@dwellsecure:utilities';
const ONBOARDING_KEY = '@dwellsecure:onboarding_complete';
const FEATURE_TOUR_KEY = '@dwellsecure:feature_tour_complete';
const PROPERTY_KEY = '@dwellsecure:property';
const PEOPLE_KEY = '@dwellsecure:people';

/**
 * Normalize shutoff type for backward compatibility
 * Maps old types (fire, power) to new types (gas, electric)
 */
const normalizeShutoffType = (type) => {
  const typeMap = {
    'fire': 'gas',
    'power': 'electric',
    'water': 'water',
    'gas': 'gas',
    'electric': 'electric',
  };
  return typeMap[type] || type;
};

/**
 * Get all shutoffs - returns mode-appropriate results
 * SYSTEM BEHAVIOR: 
 * - Normal Mode: Returns all shutoff records
 * - Emergency Mode: Returns only the most relevant record per utility type (prioritizes verified)
 */
export const getShutoffs = async () => {
  try {
    const mode = await getAppMode();
    const allShutoffs = await getAllShutoffsRaw();
    
    // Ensure allShutoffs is an array
    const safeShutoffs = Array.isArray(allShutoffs) ? allShutoffs : [];
    
    if (mode === EMERGENCY_MODE) {
      return getEmergencyModeShutoffs(safeShutoffs);
    }
    
    // Normal Mode: Return all shutoffs
    return safeShutoffs;
  } catch (error) {
    console.error('Error getting shutoffs:', error);
    return [];
  }
};

/**
 * Get all shutoffs from storage without mode filtering
 * Used internally and by screens that need raw access
 * Tries API first, falls back to AsyncStorage
 */
export const getAllShutoffsRaw = async () => {
  try {
    // Try API first
    if (getApiAvailability()) {
      try {
        const shutoffs = await apiGet('/api/shutoffs');
        // Ensure result is an array before mapping
        const safeShutoffs = Array.isArray(shutoffs) ? shutoffs : [];
        // Normalize types for backward compatibility
        return safeShutoffs.map(shutoff => ({
          ...shutoff,
          type: normalizeShutoffType(shutoff.type || 'gas'),
          verification_status: shutoff.verification_status || 'unverified',
        }));
      } catch (error) {
        if (error.message !== 'API_UNAVAILABLE') {
          console.warn('[Storage] API fetch failed, falling back to AsyncStorage:', error.message);
        }
        // Fall through to AsyncStorage
      }
    }

    // Fallback to AsyncStorage
    const data = await AsyncStorage.getItem(SHUTOFFS_KEY);
    const shutoffs = data ? JSON.parse(data) : [];
    // Ensure result is an array before mapping
    const safeShutoffs = Array.isArray(shutoffs) ? shutoffs : [];
    // Normalize types for backward compatibility
    return safeShutoffs.map(shutoff => ({
      ...shutoff,
      type: normalizeShutoffType(shutoff.type || 'gas'),
      verification_status: shutoff.verification_status || 'unverified',
    }));
  } catch (error) {
    console.error('Error getting shutoffs:', error);
    return [];
  }
};

/**
 * Get shutoffs by type (e.g., 'water', 'gas', 'electric')
 * Tries API first, falls back to AsyncStorage
 */
export const getShutoffsByType = async (type) => {
  try {
    const normalizedType = normalizeShutoffType(type);
    console.log(`[Storage] Getting shutoffs by type: ${normalizedType}`);
    
    // Try API first
    if (getApiAvailability()) {
      try {
        const shutoffs = await apiGet(`/api/shutoffs?type=${encodeURIComponent(normalizedType)}`);
        console.log(`[Storage] ✅ Retrieved ${shutoffs.length} shutoffs of type ${normalizedType} from API`);
        // Normalize types for backward compatibility
        return shutoffs.map(shutoff => ({
          ...shutoff,
          type: normalizeShutoffType(shutoff.type || 'gas'),
          verification_status: shutoff.verification_status || 'unverified',
        }));
      } catch (error) {
        if (error.message !== 'API_UNAVAILABLE') {
          console.warn('[Storage] API fetch by type failed, falling back to AsyncStorage:', error.message);
        }
        // Fall through to AsyncStorage
      }
    }

    // Fallback to AsyncStorage
    const data = await AsyncStorage.getItem(SHUTOFFS_KEY);
    const shutoffs = data ? JSON.parse(data) : [];
    const filtered = shutoffs.filter(shutoff => normalizeShutoffType(shutoff.type) === normalizedType);
    console.log(`[Storage] Retrieved ${filtered.length} shutoffs of type ${normalizedType} from AsyncStorage`);
    // Normalize types for backward compatibility
    return filtered.map(shutoff => ({
      ...shutoff,
      type: normalizeShutoffType(shutoff.type || 'gas'),
      verification_status: shutoff.verification_status || 'unverified',
    }));
  } catch (error) {
    console.error('Error getting shutoffs by type:', error);
    return [];
  }
};

/**
 * Emergency Mode retrieval logic
 * SYSTEM BEHAVIOR: Returns only the most relevant record per utility type
 * Priority: verified > unverified, then by most recently updated
 */
const getEmergencyModeShutoffs = (allShutoffs) => {
  const utilityTypes = ['gas', 'water', 'electric'];
  const result = [];
  
  for (const utilityType of utilityTypes) {
    // Filter shutoffs of this type
    const typeShutoffs = allShutoffs.filter(s => {
      const normalizedType = normalizeShutoffType(s.type || 'gas');
      return normalizedType === utilityType;
    });
    
    if (typeShutoffs.length === 0) continue;
    
    // Prioritize: verified records first, then by most recently updated
    const sorted = typeShutoffs.sort((a, b) => {
      // First sort by verification status (verified comes first)
      const aVerified = (a.verification_status || 'unverified') === 'verified' ? 1 : 0;
      const bVerified = (b.verification_status || 'unverified') === 'verified' ? 1 : 0;
      if (aVerified !== bVerified) {
        return bVerified - aVerified;
      }
      
      // Then by most recently updated
      const aUpdated = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bUpdated = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bUpdated - aUpdated;
    });
    
    // Return only the most relevant (first after sorting)
    result.push(sorted[0]);
  }
  
  return result;
};

export const getShutoff = async (id) => {
  try {
    // Try API first
    if (getApiAvailability()) {
      try {
        return await apiGet(`/api/shutoffs/${id}`);
      } catch (error) {
        if (error.message !== 'API_UNAVAILABLE') {
          console.warn('[Storage] API fetch failed, falling back to AsyncStorage:', error.message);
        }
        // Fall through to AsyncStorage
      }
    }

    // Fallback to AsyncStorage
    const shutoffs = await getAllShutoffsRaw();
    return shutoffs.find((s) => s.id === id);
  } catch (error) {
    console.error('Error getting shutoff:', error);
    return null;
  }
};

export const saveShutoff = async (shutoff) => {
  try {
    // Strip MongoDB _id so we never try to update the immutable _id field on the server
    const { _id, ...shutoffWithoutMongoId } = shutoff || {};

    // Ensure type is normalized and verification_status exists
    const normalizedShutoff = {
      ...shutoffWithoutMongoId,
      type: normalizeShutoffType(shutoffWithoutMongoId.type || 'gas'),
      verification_status: shutoffWithoutMongoId.verification_status || 'unverified',
    };
    
    console.log('[Storage] Saving shutoff:', normalizedShutoff.id);
    
    // Re-check API availability before saving
    const apiAvailable = getApiAvailability();
    console.log('[Storage] API available flag:', apiAvailable);
    
    // Try API first
    if (apiAvailable) {
      try {
        console.log('[Storage] Attempting to save to MongoDB via API...');
        await apiPost('/api/shutoffs', normalizedShutoff);
        console.log('[Storage] ✅ Successfully saved to MongoDB');
        
        // Also save to AsyncStorage as backup (read from AsyncStorage, not API, to avoid loop)
        try {
          const data = await AsyncStorage.getItem(SHUTOFFS_KEY);
          const shutoffs = data ? JSON.parse(data) : [];
          const index = shutoffs.findIndex((s) => s.id === normalizedShutoff.id);
          if (index >= 0) {
            shutoffs[index] = normalizedShutoff;
          } else {
            shutoffs.push(normalizedShutoff);
          }
          await AsyncStorage.setItem(SHUTOFFS_KEY, JSON.stringify(shutoffs));
          console.log('[Storage] Also saved to AsyncStorage as backup');
        } catch (error) {
          console.warn('[Storage] Failed to save to AsyncStorage backup:', error);
        }
        return;
      } catch (error) {
        console.error('[Storage] API save failed:', error.message);
        if (error.message !== 'API_UNAVAILABLE') {
          console.warn('[Storage] Falling back to AsyncStorage due to API error');
        } else {
          console.warn('[Storage] API unavailable, using AsyncStorage');
        }
        // Fall through to AsyncStorage
      }
    } else {
      console.warn('[Storage] API not available, using AsyncStorage only');
    }
    
    // Fallback to AsyncStorage
    console.log('[Storage] Saving to AsyncStorage...');
    const shutoffs = await getAllShutoffsRaw();
    const index = shutoffs.findIndex((s) => s.id === normalizedShutoff.id);
    
    if (index >= 0) {
      shutoffs[index] = normalizedShutoff;
    } else {
      shutoffs.push(normalizedShutoff);
    }
    
    await AsyncStorage.setItem(SHUTOFFS_KEY, JSON.stringify(shutoffs));
    await addPending({ op: 'upsert', entityType: 'shutoffs', payload: normalizedShutoff });
    console.log('[Storage] Saved to AsyncStorage and queued for sync');
  } catch (error) {
    console.error('[Storage] Error saving shutoff:', error);
    throw error;
  }
};

export const deleteShutoff = async (id) => {
  try {
    // First, get all associated reminders and delete them explicitly
    const allReminders = await getReminders();
    const associatedReminders = allReminders.filter((r) => r.shutoffId === id);
    
    console.log(`[Storage] Found ${associatedReminders.length} reminders associated with shutoff ${id}`);
    
    // Delete each associated reminder
    for (const reminder of associatedReminders) {
      try {
        await deleteReminder(reminder.id);
        console.log(`[Storage] Deleted reminder: ${reminder.id}`);
      } catch (error) {
        console.warn(`[Storage] Failed to delete reminder ${reminder.id}:`, error);
      }
    }
    
    // Try API first
    if (getApiAvailability()) {
      try {
        await apiDelete(`/api/shutoffs/${id}`);
        console.log('[Storage] ✅ Successfully deleted shutoff from MongoDB');
        
        // Also delete from AsyncStorage
        const shutoffs = await getAllShutoffsRaw();
        const filtered = shutoffs.filter((s) => s.id !== id);
        await AsyncStorage.setItem(SHUTOFFS_KEY, JSON.stringify(filtered));
        
        return;
      } catch (error) {
        if (error.message !== 'API_UNAVAILABLE') {
          console.warn('[Storage] API delete failed, falling back to AsyncStorage:', error.message);
        }
        // Fall through to AsyncStorage
      }
    }
    
    // Fallback to AsyncStorage
    const shutoffs = await getAllShutoffsRaw();
    const filtered = shutoffs.filter((s) => s.id !== id);
    await AsyncStorage.setItem(SHUTOFFS_KEY, JSON.stringify(filtered));
    await addPending({ op: 'delete', entityType: 'shutoffs', id });
    console.log('[Storage] ✅ Deleted shutoff from AsyncStorage and queued for sync');
  } catch (error) {
    console.error('Error deleting shutoff:', error);
    throw error;
  }
};

export const getReminders = async () => {
  try {
    // Try API first
    if (getApiAvailability()) {
      try {
        const reminders = await apiGet('/api/reminders');
        // Ensure result is always an array
        return Array.isArray(reminders) ? reminders : [];
      } catch (error) {
        if (error.message !== 'API_UNAVAILABLE') {
          console.warn('[Storage] API fetch failed, falling back to AsyncStorage:', error.message);
        }
        // Fall through to AsyncStorage
      }
    }
    
    // Fallback to AsyncStorage
    const data = await AsyncStorage.getItem(REMINDERS_KEY);
    const reminders = data ? JSON.parse(data) : [];
    // Ensure result is always an array
    return Array.isArray(reminders) ? reminders : [];
  } catch (error) {
    console.error('Error getting reminders:', error);
    return [];
  }
};

/**
 * Get reminders for a specific shutoff by shutoffId
 * Tries API first, falls back to AsyncStorage
 */
export const getRemindersByShutoffId = async (shutoffId) => {
  try {
    console.log(`[Storage] Getting reminders for shutoff: ${shutoffId}`);
    
    // Try API first
    if (getApiAvailability()) {
      try {
        const reminders = await apiGet(`/api/reminders?shutoffId=${encodeURIComponent(shutoffId)}`);
        console.log(`[Storage] ✅ Retrieved ${reminders.length} reminders for shutoff ${shutoffId} from API`);
        // Ensure result is always an array
        return Array.isArray(reminders) ? reminders : [];
      } catch (error) {
        if (error.message !== 'API_UNAVAILABLE') {
          console.warn('[Storage] API fetch by shutoffId failed, falling back to AsyncStorage:', error.message);
        }
        // Fall through to AsyncStorage
      }
    }

    // Fallback to AsyncStorage
    const data = await AsyncStorage.getItem(REMINDERS_KEY);
    const reminders = data ? JSON.parse(data) : [];
    const filtered = Array.isArray(reminders) 
      ? reminders.filter(r => r.shutoffId === shutoffId)
      : [];
    console.log(`[Storage] Retrieved ${filtered.length} reminders for shutoff ${shutoffId} from AsyncStorage`);
    return filtered;
  } catch (error) {
    console.error('Error getting reminders by shutoffId:', error);
    return [];
  }
};

export const saveReminder = async (reminder) => {
  try {
    console.log('[Storage] Saving reminder:', reminder.id);
    console.log('[Storage] Reminder completed status:', reminder.completed);
    console.log('[Storage] API available:', getApiAvailability());
    
    // Try API first
    if (getApiAvailability()) {
      try {
        // Check if reminder already exists in MongoDB by checking for _id
        // If reminder has _id, it means it exists in MongoDB and needs to be updated
        const hasMongoId = reminder._id;
        
        // Prepare data for API - always remove _id as MongoDB doesn't allow modifying it
        // Also remove any MongoDB-specific fields that shouldn't be sent back
        const { _id, __v, createdAt, updatedAt, ...reminderData } = reminder;
        const reminderToSave = reminderData;
        
        if (hasMongoId) {
          // Update existing reminder - try PUT first, fallback to POST if PUT not supported
          console.log('[Storage] Updating existing reminder (has _id)...');
          console.log('[Storage] Reminder ID:', reminder.id);
          
          try {
            // Try PUT method first
            await apiPut(`/api/reminders/${reminder.id}`, reminderToSave);
            console.log('[Storage] ✅ Successfully updated reminder in MongoDB via PUT with completed:', reminder.completed);
          } catch (putError) {
            // If PUT fails with 404 (not supported), silently fallback to POST
            // For other errors, log them but still try POST
            if (putError.message && putError.message.includes('404')) {
              console.log('[Storage] PUT not supported (404), using POST instead...');
            } else {
              console.warn('[Storage] PUT failed, trying POST instead:', putError.message);
            }
            await apiPost('/api/reminders', reminderToSave);
            console.log('[Storage] ✅ Successfully updated reminder in MongoDB via POST with completed:', reminder.completed);
          }
        } else {
          // Create new reminder
          console.log('[Storage] Creating new reminder via POST...');
          await apiPost('/api/reminders', reminderToSave);
          console.log('[Storage] ✅ Successfully created reminder in MongoDB');
        }
        
        // Also save to AsyncStorage as backup (read from AsyncStorage, not API, to avoid loop)
        try {
          const data = await AsyncStorage.getItem(REMINDERS_KEY);
          const reminders = data ? JSON.parse(data) : [];
          const index = reminders.findIndex((r) => r.id === reminder.id);
          if (index >= 0) {
            reminders[index] = reminder;
          } else {
            reminders.push(reminder);
          }
          await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
          console.log('[Storage] Also saved to AsyncStorage as backup');
        } catch (error) {
          console.warn('[Storage] Failed to save to AsyncStorage backup:', error);
        }
        return;
      } catch (error) {
        console.error('[Storage] API save failed:', error.message);
        if (error.message !== 'API_UNAVAILABLE') {
          console.warn('[Storage] Falling back to AsyncStorage due to API error');
        } else {
          console.warn('[Storage] API unavailable, using AsyncStorage');
        }
        // Fall through to AsyncStorage
      }
    } else {
      console.warn('[Storage] API not available, using AsyncStorage only');
    }
    
    // Fallback to AsyncStorage
    console.log('[Storage] Saving to AsyncStorage...');
    const reminders = await getReminders();
    const index = reminders.findIndex((r) => r.id === reminder.id);
    
    if (index >= 0) {
      reminders[index] = reminder;
    } else {
      reminders.push(reminder);
    }
    
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    const { _id: _r, __v, ...reminderPayload } = reminder;
    await addPending({ op: 'upsert', entityType: 'reminders', payload: reminderPayload });
    console.log('[Storage] Saved to AsyncStorage and queued for sync');
  } catch (error) {
    console.error('[Storage] Error saving reminder:', error);
    throw error;
  }
};

export const deleteReminder = async (id) => {
  try {
    // Try API first
    if (getApiAvailability()) {
      try {
        await apiDelete(`/api/reminders/${id}`);
        console.log('[Storage] ✅ Successfully deleted from MongoDB');
        
        // Also delete from AsyncStorage
        try {
          const reminders = await getReminders();
          const filtered = reminders.filter((r) => r.id !== id);
          await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(filtered));
        } catch (error) {
          console.warn('[Storage] Failed to delete from AsyncStorage backup:', error);
        }
        return;
      } catch (error) {
        if (error.message !== 'API_UNAVAILABLE') {
          console.warn('[Storage] API delete failed, falling back to AsyncStorage:', error.message);
        }
        // Fall through to AsyncStorage
      }
    }
    
    // Fallback to AsyncStorage
    const reminders = await getReminders();
    const filtered = reminders.filter((r) => r.id !== id);
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(filtered));
    await addPending({ op: 'delete', entityType: 'reminders', id });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
};

/**
 * Get all utilities from storage without mode filtering
 * Used internally and by screens that need raw access
 * Tries API first, falls back to AsyncStorage
 */
export const getAllUtilitiesRaw = async () => {
  try {
    // Try API first
    if (getApiAvailability()) {
      try {
        const utilities = await apiGet('/api/utilities');
        return Array.isArray(utilities) ? utilities : [];
      } catch (error) {
        if (error.message !== 'API_UNAVAILABLE') {
          console.warn('[Storage] API fetch failed, falling back to AsyncStorage:', error.message);
        }
        // Fall through to AsyncStorage
      }
    }

    // Fallback to AsyncStorage
    const data = await AsyncStorage.getItem(UTILITIES_KEY);
    const utilities = data ? JSON.parse(data) : [];
    return Array.isArray(utilities) ? utilities : [];
  } catch (error) {
    console.error('Error getting utilities:', error);
    return [];
  }
};

export const getUtilities = async () => {
  try {
    // Try API first
    if (getApiAvailability()) {
      try {
        const utilities = await apiGet('/api/utilities');
        // Ensure result is always an array
        return Array.isArray(utilities) ? utilities : [];
      } catch (error) {
        if (error.message !== 'API_UNAVAILABLE') {
          console.warn('[Storage] API fetch failed, falling back to AsyncStorage:', error.message);
        }
        // Fall through to AsyncStorage
      }
    }
    
    // Fallback to AsyncStorage
    const data = await AsyncStorage.getItem(UTILITIES_KEY);
    const utilities = data ? JSON.parse(data) : [];
    // Ensure result is always an array
    return Array.isArray(utilities) ? utilities : [];
  } catch (error) {
    console.error('Error getting utilities:', error);
    return [];
  }
};

export const getUtility = async (id) => {
  try {
    // Try API first
    if (getApiAvailability()) {
      try {
        return await apiGet(`/api/utilities/${id}`);
      } catch (error) {
        if (error.message !== 'API_UNAVAILABLE') {
          console.warn('[Storage] API fetch failed, falling back to AsyncStorage:', error.message);
        }
        // Fall through to AsyncStorage
      }
    }
    
    // Fallback to AsyncStorage
    const utilities = await getUtilities();
    return utilities.find((u) => u.id === id);
  } catch (error) {
    console.error('Error getting utility:', error);
    return null;
  }
};

export const saveUtility = async (utility) => {
  try {
    // Strip MongoDB _id so we never try to update the immutable _id field on the server
    const { _id, ...utilityWithoutMongoId } = utility || {};

    console.log('[Storage] Saving utility:', utilityWithoutMongoId.id);
    
    // Try API first
    if (getApiAvailability()) {
      try {
        console.log('[Storage] Attempting to save to MongoDB via API...');
        await apiPost('/api/utilities', utilityWithoutMongoId);
        console.log('[Storage] ✅ Successfully saved to MongoDB');
        
        // Also save to AsyncStorage as backup (read from AsyncStorage, not API, to avoid loop)
        try {
          const data = await AsyncStorage.getItem(UTILITIES_KEY);
          const utilities = data ? JSON.parse(data) : [];
          const index = utilities.findIndex((u) => u.id === utilityWithoutMongoId.id);
          if (index >= 0) {
            utilities[index] = utilityWithoutMongoId;
          } else {
            utilities.push(utilityWithoutMongoId);
          }
          await AsyncStorage.setItem(UTILITIES_KEY, JSON.stringify(utilities));
          console.log('[Storage] Also saved to AsyncStorage as backup');
        } catch (error) {
          console.warn('[Storage] Failed to save to AsyncStorage backup:', error);
        }
        return;
      } catch (error) {
        console.error('[Storage] API save failed:', error.message);
        if (error.message !== 'API_UNAVAILABLE') {
          console.warn('[Storage] Falling back to AsyncStorage due to API error');
        }
        // Fall through to AsyncStorage
      }
    }
    
    // Fallback to AsyncStorage
    const utilities = await getUtilities();
    const index = utilities.findIndex((u) => u.id === utilityWithoutMongoId.id);

    if (index >= 0) {
      utilities[index] = utilityWithoutMongoId;
    } else {
      utilities.push(utilityWithoutMongoId);
    }

    await AsyncStorage.setItem(UTILITIES_KEY, JSON.stringify(utilities));
    await addPending({ op: 'upsert', entityType: 'utilities', payload: utilityWithoutMongoId });
    console.log('[Storage] Saved to AsyncStorage and queued for sync');
  } catch (error) {
    console.error('Error saving utility:', error);
    throw error;
  }
};

export const deleteUtility = async (id) => {
  try {
    // First, get all associated reminders and delete them explicitly
    const allReminders = await getReminders();
    const associatedReminders = allReminders.filter((r) => r.utilityId === id);
    
    console.log(`[Storage] Found ${associatedReminders.length} reminders associated with utility ${id}`);
    
    // Delete each associated reminder
    for (const reminder of associatedReminders) {
      try {
        await deleteReminder(reminder.id);
        console.log(`[Storage] Deleted reminder: ${reminder.id}`);
      } catch (error) {
        console.warn(`[Storage] Failed to delete reminder ${reminder.id}:`, error);
      }
    }
    
    // Try API first
    if (getApiAvailability()) {
      try {
        await apiDelete(`/api/utilities/${id}`);
        console.log('[Storage] ✅ Successfully deleted utility from MongoDB');
        
        // Also delete from AsyncStorage
        const utilities = await getUtilities();
        const filtered = utilities.filter((u) => u.id !== id);
        await AsyncStorage.setItem(UTILITIES_KEY, JSON.stringify(filtered));
        
        return;
      } catch (error) {
        if (error.message !== 'API_UNAVAILABLE') {
          console.warn('[Storage] API delete failed, falling back to AsyncStorage:', error.message);
        }
        // Fall through to AsyncStorage
      }
    }
    
    // Fallback to AsyncStorage
    const utilities = await getUtilities();
    const filtered = utilities.filter((u) => u.id !== id);
    await AsyncStorage.setItem(UTILITIES_KEY, JSON.stringify(filtered));
    await addPending({ op: 'delete', entityType: 'utilities', id });
    console.log('[Storage] ✅ Deleted utility from AsyncStorage and queued for sync');
  } catch (error) {
    console.error('Error deleting utility:', error);
    throw error;
  }
};
export const exportData = async (shutoffs) => {
  const data = {
    exportDate: new Date().toISOString(),
    shutoffs,
  };

  const fileName = `dwellsecure-export-${Date.now()}.json`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));

  return fileUri;
};

export const isOnboardingComplete = async () => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

export const setOnboardingComplete = async () => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (error) {
    console.error('Error setting onboarding complete:', error);
    throw error;
  }
};

export const resetOnboarding = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
    throw error;
  }
};

export const isFeatureTourComplete = async () => {
  try {
    const value = await AsyncStorage.getItem(FEATURE_TOUR_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking feature tour status:', error);
    return false;
  }
};

export const setFeatureTourComplete = async () => {
  try {
    await AsyncStorage.setItem(FEATURE_TOUR_KEY, 'true');
  } catch (error) {
    console.error('Error setting feature tour complete:', error);
    throw error;
  }
};

export const resetFeatureTour = async () => {
  try {
    await AsyncStorage.removeItem(FEATURE_TOUR_KEY);
  } catch (error) {
    console.error('Error resetting feature tour:', error);
    throw error;
  }
};

/**
 * Fetch property list from local cache (offline-first; sync job fills cache when online).
 */
export const getProperties = async () => {
  try {
    const data = await AsyncStorage.getItem(PROPERTY_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    console.error('Error getting properties:', error);
    return [];
  }
};

export const getProperty = async (id) => {
  try {
    // Try API first
    if (getApiAvailability()) {
      try {
        return await apiGet(`/api/properties/${id}`);
      } catch (error) {
        if (error.message !== 'API_UNAVAILABLE') {
          console.warn('[Storage] API fetch failed, falling back to AsyncStorage:', error.message);
        }
        // Fall through to AsyncStorage
      }
    }
    
    // Fallback to AsyncStorage
    const properties = await getProperties();
    if (id) {
      return properties.find((p) => p.id === id) || null;
    }
    // Backward compatibility: return first property if no id specified
    return properties.length > 0 ? properties[0] : null;
  } catch (error) {
    console.error('Error getting property:', error);
    return null;
  }
};

export const saveProperty = async (property) => {
  try {
    // Strip MongoDB _id so we never try to update the immutable _id field on the server
    const { _id, ...propertyWithoutMongoId } = property || {};

    console.log('[Storage] Saving property:', propertyWithoutMongoId.id);

    // Always try API first (even if startup health check failed, e.g. Render was sleeping)
    try {
      console.log('[Storage] Attempting to save to MongoDB via API...');
      await apiPostForce('/api/properties', propertyWithoutMongoId);
      console.log('[Storage] ✅ Successfully saved to MongoDB');
      setApiAvailability(true);

      // Also save to AsyncStorage as backup
      try {
        const data = await AsyncStorage.getItem(PROPERTY_KEY);
        const properties = data ? JSON.parse(data) : [];
        const index = properties.findIndex((p) => p.id === propertyWithoutMongoId.id);
        if (index >= 0) {
          properties[index] = propertyWithoutMongoId;
        } else {
          properties.push(propertyWithoutMongoId);
        }
        await AsyncStorage.setItem(PROPERTY_KEY, JSON.stringify(properties));
      } catch (error) {
        console.warn('[Storage] Failed to save to AsyncStorage backup:', error);
      }
      return;
    } catch (error) {
      console.error('[Storage] API save failed:', error.message);
      if (error.message !== 'API_UNAVAILABLE') {
        console.warn('[Storage] Falling back to AsyncStorage due to API error');
      }
      // Fall through to AsyncStorage
    }

    // Fallback to AsyncStorage when API failed or was skipped
    console.log('[Storage] Saving to AsyncStorage...');
    const properties = await getProperties();
    const index = properties.findIndex((p) => p.id === propertyWithoutMongoId.id);
    
    if (index >= 0) {
      properties[index] = propertyWithoutMongoId;
    } else {
      properties.push(propertyWithoutMongoId);
    }
    
    await AsyncStorage.setItem(PROPERTY_KEY, JSON.stringify(properties));
    await addPending({ op: 'upsert', entityType: 'properties', payload: propertyWithoutMongoId });
    console.log('[Storage] Saved to AsyncStorage and queued for sync');
  } catch (error) {
    console.error('[Storage] Error saving property:', error);
    throw error;
  }
};

export const deleteProperty = async (id) => {
  try {
    console.log('[Storage] Deleting property:', id);
    
    // First, delete all related shutoffs and their reminders
    const allShutoffs = await getAllShutoffsRaw();
    const propertyShutoffs = allShutoffs.filter(s => s.propertyId === id);
    
    console.log(`[Storage] Found ${propertyShutoffs.length} shutoffs to delete for property ${id}`);
    
    // Delete each shutoff (this will also delete associated reminders via deleteShutoff)
    for (const shutoff of propertyShutoffs) {
      try {
        await deleteShutoff(shutoff.id);
        console.log(`[Storage] Deleted shutoff: ${shutoff.id}`);
      } catch (error) {
        console.warn(`[Storage] Failed to delete shutoff ${shutoff.id}:`, error);
      }
    }
    
    // Also delete any utilities associated with this property
    const allUtilities = await getUtilities();
    const propertyUtilities = allUtilities.filter(u => u.propertyId === id);
    
    console.log(`[Storage] Found ${propertyUtilities.length} utilities to delete for property ${id}`);
    
    for (const utility of propertyUtilities) {
      try {
        await deleteUtility(utility.id);
        console.log(`[Storage] Deleted utility: ${utility.id}`);
      } catch (error) {
        console.warn(`[Storage] Failed to delete utility ${utility.id}:`, error);
      }
    }
    
    // Also delete any people associated with this property
    const allPeople = await getPeople();
    const propertyPeople = allPeople.filter(p => p.propertyId === id);
    
    console.log(`[Storage] Found ${propertyPeople.length} people to delete for property ${id}`);
    
    for (const person of propertyPeople) {
      try {
        await deletePerson(person.id);
        console.log(`[Storage] Deleted person: ${person.id}`);
      } catch (error) {
        console.warn(`[Storage] Failed to delete person ${person.id}:`, error);
      }
    }
    
    // Now delete the property itself
    // Try API first
    if (getApiAvailability()) {
      try {
        await apiDelete(`/api/properties/${id}`);
        console.log('[Storage] ✅ Successfully deleted property from MongoDB');
        
        // Also delete from AsyncStorage
        try {
          const properties = await getProperties();
          const filtered = properties.filter((p) => p.id !== id);
          await AsyncStorage.setItem(PROPERTY_KEY, JSON.stringify(filtered));
        } catch (error) {
          console.warn('[Storage] Failed to delete from AsyncStorage backup:', error);
        }
        return;
      } catch (error) {
        if (error.message !== 'API_UNAVAILABLE') {
          console.warn('[Storage] API delete failed, falling back to AsyncStorage:', error.message);
        }
        // Fall through to AsyncStorage
      }
    }
    
    // Fallback to AsyncStorage
    if (id) {
      const properties = await getProperties();
      const filtered = properties.filter((p) => p.id !== id);
      await AsyncStorage.setItem(PROPERTY_KEY, JSON.stringify(filtered));
      await addPending({ op: 'delete', entityType: 'properties', id });
      console.log('[Storage] ✅ Deleted property from AsyncStorage and queued for sync');
    } else {
      // Backward compatibility: if no id, clear all
      await AsyncStorage.removeItem(PROPERTY_KEY);
    }
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
};

export const getPeople = async () => {
  try {
    const data = await AsyncStorage.getItem(PEOPLE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting people:', error);
    return [];
  }
};

export const getPerson = async (id) => {
  const people = await getPeople();
  return people.find((p) => p.id === id);
};

export const savePerson = async (person) => {
  try {
    const people = await getPeople();
    const index = people.findIndex((p) => p.id === person.id);

    if (index >= 0) {
      people[index] = person;
    } else {
      people.push(person);
    }

    await AsyncStorage.setItem(PEOPLE_KEY, JSON.stringify(people));
  } catch (error) {
    console.error('Error saving person:', error);
    throw error;
  }
};

export const deletePerson = async (id) => {
  try {
    const people = await getPeople();
    const filtered = people.filter((p) => p.id !== id);
    await AsyncStorage.setItem(PEOPLE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting person:', error);
    throw error;
  }
};

export const resetAllData = async () => {
  try {
    // Clear all app data
    await AsyncStorage.removeItem(SHUTOFFS_KEY);
    await AsyncStorage.removeItem(REMINDERS_KEY);
    await AsyncStorage.removeItem(UTILITIES_KEY);
    await AsyncStorage.removeItem(PROPERTY_KEY);
    await AsyncStorage.removeItem(PEOPLE_KEY);
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    console.error('Error resetting all data:', error);
    throw error;
  }
};
