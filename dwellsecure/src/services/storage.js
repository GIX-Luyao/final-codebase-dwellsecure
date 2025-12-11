import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const SHUTOFFS_KEY = '@dwellsecure:shutoffs';
const REMINDERS_KEY = '@dwellsecure:reminders';
const UTILITIES_KEY = '@dwellsecure:utilities';
const ONBOARDING_KEY = '@dwellsecure:onboarding_complete';
const PROPERTY_KEY = '@dwellsecure:property';
const PEOPLE_KEY = '@dwellsecure:people';

export const getShutoffs = async () => {
  try {
    const data = await AsyncStorage.getItem(SHUTOFFS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting shutoffs:', error);
    return [];
  }
};

export const getShutoff = async (id) => {
  const shutoffs = await getShutoffs();
  return shutoffs.find((s) => s.id === id);
};

export const saveShutoff = async (shutoff) => {
  try {
    const shutoffs = await getShutoffs();
    const index = shutoffs.findIndex((s) => s.id === shutoff.id);
    
    if (index >= 0) {
      shutoffs[index] = shutoff;
    } else {
      shutoffs.push(shutoff);
    }
    
    await AsyncStorage.setItem(SHUTOFFS_KEY, JSON.stringify(shutoffs));
  } catch (error) {
    console.error('Error saving shutoff:', error);
    throw error;
  }
};

export const deleteShutoff = async (id) => {
  try {
    const shutoffs = await getShutoffs();
    const filtered = shutoffs.filter((s) => s.id !== id);
    await AsyncStorage.setItem(SHUTOFFS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting shutoff:', error);
    throw error;
  }
};

export const getReminders = async () => {
  try {
    const data = await AsyncStorage.getItem(REMINDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting reminders:', error);
    return [];
  }
};

export const saveReminder = async (reminder) => {
  try {
    const reminders = await getReminders();
    const index = reminders.findIndex((r) => r.id === reminder.id);
    
    if (index >= 0) {
      reminders[index] = reminder;
    } else {
      reminders.push(reminder);
    }
    
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.error('Error saving reminder:', error);
    throw error;
  }
};

export const deleteReminder = async (id) => {
  try {
    const reminders = await getReminders();
    const filtered = reminders.filter((r) => r.id !== id);
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
};

export const getUtilities = async () => {
  try {
    const data = await AsyncStorage.getItem(UTILITIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting utilities:', error);
    return [];
  }
};

export const getUtility = async (id) => {
  const utilities = await getUtilities();
  return utilities.find((u) => u.id === id);
};

export const saveUtility = async (utility) => {
  try {
    const utilities = await getUtilities();
    const index = utilities.findIndex((u) => u.id === utility.id);

    if (index >= 0) {
      utilities[index] = utility;
    } else {
      utilities.push(utility);
    }

    await AsyncStorage.setItem(UTILITIES_KEY, JSON.stringify(utilities));
  } catch (error) {
    console.error('Error saving utility:', error);
    throw error;
  }
};

export const deleteUtility = async (id) => {
  try {
    const utilities = await getUtilities();
    const filtered = utilities.filter((u) => u.id !== id);
    await AsyncStorage.setItem(UTILITIES_KEY, JSON.stringify(filtered));
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

export const getProperty = async () => {
  try {
    const data = await AsyncStorage.getItem(PROPERTY_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting property:', error);
    return null;
  }
};

export const saveProperty = async (property) => {
  try {
    await AsyncStorage.setItem(PROPERTY_KEY, JSON.stringify(property));
  } catch (error) {
    console.error('Error saving property:', error);
    throw error;
  }
};

export const deleteProperty = async () => {
  try {
    await AsyncStorage.removeItem(PROPERTY_KEY);
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
