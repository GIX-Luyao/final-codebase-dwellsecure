import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import ShutoffsListScreen from '../screens/ShutoffsListScreen';
import AddEditShutoffScreen from '../screens/AddEditShutoffScreen';
import UtilitiesListScreen from '../screens/UtilitiesListScreen';
import AddEditUtilityScreen from '../screens/AddEditUtilityScreen';
import RemindersScreen from '../screens/RemindersScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import PropertyListScreen from '../screens/PropertyListScreen';
import ShutoffDetailScreen from '../screens/ShutoffDetailScreen';
import UtilityDetailScreen from '../screens/UtilityDetailScreen';
import AddPropertyScreen from '../screens/AddPropertyScreen';
import AddPersonScreen from '../screens/AddPersonScreen';
import PersonDetailScreen from '../screens/PersonDetailScreen';
import AIAssistanceScreen from '../screens/AIAssistanceScreen';
import EmergencyModeScreen from '../screens/EmergencyModeScreen';
import ShareScreen from '../screens/ShareScreen';
import MapPickerScreen from '../screens/MapPickerScreen';
import BottomNav from '../components/BottomNav';
import { isOnboardingComplete } from '../services/storage';

const Stack = createStackNavigator();
const RootStack = createStackNavigator();

function ShutoffsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ShutoffsList"
        component={ShutoffsListScreen}
        options={{ title: 'Shutoffs' }}
      />
      <Stack.Screen
        name="AddEditShutoff"
        component={AddEditShutoffScreen}
        options={{ title: 'Shutoff Details' }}
      />
      <Stack.Screen
        name="PropertyList"
        component={PropertyListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PropertyDetail"
        component={PropertyDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShutoffDetail"
        component={ShutoffDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddProperty"
        component={AddPropertyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddPerson"
        component={AddPersonScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProperty"
        component={AddPropertyScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function UtilitiesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="UtilitiesList"
        component={UtilitiesListScreen}
        options={{ title: 'Utilities' }}
      />
      <Stack.Screen
        name="AddEditUtility"
        component={AddEditUtilityScreen}
        options={{ title: 'Utility Details' }}
      />
    </Stack.Navigator>
  );
}

function PropertyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PropertyList" component={PropertyListScreen} />
      <Stack.Screen name="Shutoffs" component={ShutoffsStack} />
      <Stack.Screen name="Utilities" component={UtilitiesStack} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
      <Stack.Screen name="ShutoffDetail" component={ShutoffDetailScreen} />
      <Stack.Screen name="UtilityDetail" component={UtilityDetailScreen} />
      <Stack.Screen name="AddProperty" component={AddPropertyScreen} />
      <Stack.Screen name="AddPerson" component={AddPersonScreen} />
      <Stack.Screen name="PersonDetail" component={PersonDetailScreen} />
      <Stack.Screen name="EditProperty" component={AddPropertyScreen} />
      <Stack.Screen name="AddEditShutoff" component={AddEditShutoffScreen} />
      <Stack.Screen name="AddEditUtility" component={AddEditUtilityScreen} />
      <Stack.Screen name="MapPicker" component={MapPickerScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName="Property"
      >
        <Stack.Screen name="Property" component={PropertyStack} />
        <Stack.Screen name="Reminders" component={RemindersScreen} />
        <Stack.Screen name="AIAssistance" component={AIAssistanceScreen} />
        <Stack.Screen name="Share" component={ShareScreen} />
      </Stack.Navigator>

      <View style={styles.bottomNavContainer}>
        <BottomNav />
      </View>

      <TouchableOpacity
        style={styles.emergencyFab}
        onPress={() => navigation.navigate('EmergencyMode')}
        accessibilityLabel="Open emergency mode"
      >
        <Ionicons name="alert" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

export default function AppNavigator() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboarding();
    
    // Check onboarding status periodically when not showing onboarding
    // This allows the settings button to reset onboarding and have it detected
    const interval = setInterval(async () => {
      if (!showOnboarding && !isLoading) {
        try {
          const completed = await isOnboardingComplete();
          if (!completed) {
            setShowOnboarding(true);
          }
        } catch (error) {
          // Ignore errors in periodic check
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [showOnboarding, isLoading]);

  const checkOnboarding = async () => {
    try {
      const completed = await isOnboardingComplete();
      setShowOnboarding(!completed);
    } catch (error) {
      console.error('Error checking onboarding:', error);
      // If there's an error, skip onboarding and go to main app
      setShowOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#999" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainStack" component={MainStack} />
      <RootStack.Screen name="EmergencyMode" component={EmergencyModeScreen} />
    </RootStack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  emergencyFab: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#d32f2f',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 1000,
  },
});
