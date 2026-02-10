import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  Modal,
  Linking,
  Platform,
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
import SuccessScreen from '../screens/SuccessScreen';
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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="UtilitiesList"
        component={UtilitiesListScreen}
      />
      <Stack.Screen
        name="AddEditUtility"
        component={AddEditUtilityScreen}
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
      <Stack.Screen name="Success" component={SuccessScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  const navigation = useNavigation();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const buttonSize = 64;
  const bottomNavHeight = 100; // Approximate bottom nav height
  
  const [buttonPosition, setButtonPosition] = useState({
    x: screenWidth - buttonSize - 16,
    y: screenHeight - bottomNavHeight - buttonSize - 16,
  });
  
  const [show911Modal, setShow911Modal] = useState(false);
  
  const initialPosition = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const touchStartTime = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        hasMoved.current = false;
        touchStartTime.current = Date.now();
        initialPosition.current = { ...buttonPosition };
      },
      onPanResponderMove: (_, gestureState) => {
        // Only start dragging if movement is significant
        if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
          hasMoved.current = true;
          const newX = initialPosition.current.x + gestureState.dx;
          const newY = initialPosition.current.y + gestureState.dy;
          
          // Constrain to screen bounds
          const constrainedX = Math.max(0, Math.min(screenWidth - buttonSize, newX));
          const constrainedY = Math.max(0, Math.min(screenHeight - bottomNavHeight - buttonSize, newY));
          
          setButtonPosition({ x: constrainedX, y: constrainedY });
        }
      },
      onPanResponderRelease: () => {
        const wasDrag = hasMoved.current;
        hasMoved.current = false;
        
        // If it was a tap (not a drag), show modal
        if (!wasDrag) {
          setTimeout(() => {
            setShow911Modal(true);
          }, 50);
        }
      },
    })
  ).current;

  const handleCall911 = () => {
    const phoneNumber = '911';
    const url = Platform.OS === 'ios' ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
    Linking.openURL(url).catch(err => console.error('Error calling 911:', err));
  };

  const handleContinueToEmergency = () => {
    setShow911Modal(false);
    navigation.navigate('EmergencyMode');
  };

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

      <View
        {...panResponder.panHandlers}
        style={[
          styles.emergencyFab,
          {
            left: buttonPosition.x,
            top: buttonPosition.y,
          },
        ]}
      >
        <View
          style={styles.emergencyFabButton}
          accessibilityLabel="Open emergency mode"
          accessible={true}
        >
          <Ionicons name="alert" size={28} color="#fff" />
        </View>
      </View>

      {/* 911 Confirmation Modal */}
      <Modal
        visible={show911Modal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShow911Modal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Did you call 911 first?</Text>
            <TouchableOpacity
              style={styles.call911Row}
              onPress={handleCall911}
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={24} color="#007AFF" />
              <Text style={styles.call911Text}>911</Text>
            </TouchableOpacity>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShow911Modal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalContinueButton}
                onPress={handleContinueToEmergency}
              >
                <Text style={styles.modalContinueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    width: 64,
    height: 64,
    zIndex: 1000,
  },
  emergencyFabButton: {
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
    textAlign: 'center',
  },
  call911Row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 8,
  },
  call911Text: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalContinueButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#d32f2f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContinueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
