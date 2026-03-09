import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  useWindowDimensions,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';
import { SyncProvider } from '../contexts/SyncContext';
import FeatureTourContext from '../contexts/FeatureTourContext';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ShutoffsListScreen from '../screens/ShutoffsListScreen';
import AddEditShutoffScreen from '../screens/AddEditShutoffScreen';
import UtilitiesListScreen from '../screens/UtilitiesListScreen';
import AddEditUtilityScreen from '../screens/AddEditUtilityScreen';
import RemindersScreen from '../screens/RemindersScreen';
import OnboardingWelcomeScreen from '../screens/OnboardingWelcomeScreen';
import { OnboardingProvider } from '../contexts/OnboardingContext';
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
import ProfileScreen from '../screens/ProfileScreen';
import PropertyPhotoScreen from '../screens/PropertyPhotoScreen';
import BottomNav from '../components/BottomNav';
import FeatureTour from '../components/FeatureTour';
import { isOnboardingComplete, setOnboardingComplete, isFeatureTourComplete, setFeatureTourComplete } from '../services/storage';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

const Stack = createStackNavigator();
const RootStack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

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
        name="PropertyPhoto"
        component={PropertyPhotoScreen}
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

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Share" component={ShareScreen} />
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
      <Stack.Screen name="PropertyPhoto" component={PropertyPhotoScreen} />
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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const buttonSize = 64;
  const edgeMargin = 16;
  const topGutter = 96;    // keep below header region
  const bottomGutter = 96; // keep above bottom nav

  const [show911Modal, setShow911Modal] = useState(false);
  const [showFeatureTour, setShowFeatureTour] = useState(false);

  useEffect(() => {
    let mounted = true;
    isFeatureTourComplete()
      .then((complete) => {
        if (mounted && !complete) setShowFeatureTour(true);
      })
      .catch(() => {})
      .finally(() => {});
    return () => { mounted = false; };
  }, []);

  const handleFeatureTourComplete = async () => {
    try {
      await setFeatureTourComplete();
    } catch (e) {
      console.warn('Failed to persist feature tour complete:', e);
    }
    setShowFeatureTour(false);
  };

  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const lastPosition = useRef({ x: 0, y: 0, initialized: false });
  const hasMoved = useRef(false);

  const getBounds = () => {
    const minX = edgeMargin;
    const maxX = Math.max(edgeMargin, screenWidth - buttonSize - edgeMargin);

    const minY = topGutter;
    const bottomSafe = Math.max(insets.bottom, 12);
    const maxY = Math.max(
      minY,
      screenHeight - buttonSize - edgeMargin - bottomSafe - bottomGutter
    );

    return { minX, maxX, minY, maxY };
  };

  const clampToBounds = (x, y) => {
    const { minX, maxX, minY, maxY } = getBounds();
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  };

  useEffect(() => {
    const { maxX, maxY } = getBounds();
    const next = lastPosition.current.initialized
      ? clampToBounds(lastPosition.current.x, lastPosition.current.y)
      : { x: maxX, y: maxY };

    lastPosition.current = { ...next, initialized: true };
    position.setValue(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenWidth, screenHeight, insets.bottom]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        hasMoved.current = false;
        position.stopAnimation((value) => {
          lastPosition.current = {
            x: value.x,
            y: value.y,
            initialized: lastPosition.current.initialized,
          };
          position.setOffset({ x: value.x, y: value.y });
          position.setValue({ x: 0, y: 0 });
        });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        {
          useNativeDriver: false,
          listener: (_, gestureState) => {
            if (!hasMoved.current && (Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4)) {
              hasMoved.current = true;
            }
          },
        }
      ),
      onPanResponderRelease: () => {
        const wasDrag = hasMoved.current;
        hasMoved.current = false;
        position.flattenOffset();

        position.stopAnimation((value) => {
          const clamped = clampToBounds(value.x, value.y);
          const { minX, maxX } = getBounds();

          // Snap horizontally to the nearest edge so it never “gets stuck” mid-screen.
          const centerX = clamped.x + buttonSize / 2;
          const snapX = centerX < screenWidth / 2 ? minX : maxX;

          const target = { x: snapX, y: clamped.y };
          Animated.spring(position, {
            toValue: target,
            useNativeDriver: false,
            tension: 140,
            friction: 18,
          }).start(() => {
            lastPosition.current = { ...target, initialized: true };
          });
        });

        if (!wasDrag) {
          setTimeout(() => setShow911Modal(true), 50);
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

  const featureTourValue = React.useMemo(
    () => ({ requestShowFeatureTour: () => setShowFeatureTour(true) }),
    []
  );

  return (
    <FeatureTourContext.Provider value={featureTourValue}>
      <View style={{ flex: 1 }}>
        <Stack.Navigator 
          screenOptions={{ headerShown: false }}
          initialRouteName="Property"
        >
          <Stack.Screen name="Property" component={PropertyStack} />
          <Stack.Screen name="Reminders" component={RemindersScreen} />
          <Stack.Screen name="AIAssistance" component={AIAssistanceScreen} />
          <Stack.Screen name="Profile" component={ProfileStack} />
        </Stack.Navigator>

        <View style={styles.bottomNavContainer}>
        <BottomNav />
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.emergencyFab,
          { transform: [{ translateX: position.x }, { translateY: position.y }] },
        ]}
      >
        <View
          style={styles.emergencyFabButton}
          accessibilityLabel="Open emergency mode"
          accessible={true}
        >
          <Image
            source={require('../../assets/emergency icon.png')}
            style={styles.emergencyFabIcon}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      <FeatureTour
        visible={showFeatureTour}
        onComplete={handleFeatureTourComplete}
        onSkip={handleFeatureTourComplete}
      />

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
              <Ionicons name="call" size={24} color={colors.primary} />
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
    </FeatureTourContext.Provider>
  );
}

// Minimum time to show loading screen (e.g. for logo animation). To use Loading.gif, add assets/Loading.gif and use <Image source={require('../../assets/Loading.gif')} /> in loadingContainer.
const LOADING_ANIMATION_DURATION_MS = 4000;

export default function AppNavigator() {
  const { isSignedIn, isLoading: authLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingPhase, setOnboardingPhase] = useState('welcome'); // 'welcome' | 'add-property'
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMinTimeReached, setLoadingMinTimeReached] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoadingMinTimeReached(true), LOADING_ANIMATION_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showOnboarding) setOnboardingPhase('welcome');
  }, [showOnboarding]);

  useEffect(() => {
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }
    checkOnboarding();
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;
    const interval = setInterval(async () => {
      if (!showOnboarding && !isLoading) {
        try {
          const completed = await isOnboardingComplete();
          if (!completed) {
            setShowOnboarding(true);
          }
        } catch (_) {}
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isSignedIn, showOnboarding, isLoading]);

  const checkOnboarding = async () => {
    try {
      const completed = await isOnboardingComplete();
      setShowOnboarding(!completed);
    } catch (error) {
      console.error('Error checking onboarding:', error);
      setShowOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await setOnboardingComplete();
    } catch (e) {
      console.warn('Failed to persist onboarding complete:', e);
    }
    setShowOnboarding(false);
  };

  const showLoadingScreen = authLoading || isLoading || !loadingMinTimeReached;

  if (showLoadingScreen) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../../assets/Loading.gif')}
          style={styles.loadingAnimation}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (!isSignedIn) {
    return <AuthStack />;
  }

  if (showOnboarding) {
    if (onboardingPhase === 'welcome') {
      return (
        <OnboardingProvider
          completeOnboarding={handleOnboardingComplete}
          goBackToWelcome={() => setOnboardingPhase('welcome')}
        >
          <OnboardingWelcomeScreen onAddProperty={() => setOnboardingPhase('add-property')} />
        </OnboardingProvider>
      );
    }
    return (
      <OnboardingProvider
        completeOnboarding={handleOnboardingComplete}
        goBackToWelcome={() => setOnboardingPhase('welcome')}
      >
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="AddPropertyOnboarding"
        >
          <Stack.Screen
            name="AddPropertyOnboarding"
            component={AddPropertyScreen}
            initialParams={{ onboardingMode: true }}
          />
          <Stack.Screen name="MapPicker" component={MapPickerScreen} />
          <Stack.Screen name="Success" component={SuccessScreen} />
        </Stack.Navigator>
      </OnboardingProvider>
    );
  }

  return (
    <SyncProvider>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainStack" component={MainStack} />
        <RootStack.Screen name="ProfileStandalone" component={ProfileScreen} />
        <RootStack.Screen name="EmergencyMode" component={EmergencyModeScreen} />
      </RootStack.Navigator>
    </SyncProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  loadingAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  emergencyFab: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 64,
    height: 64,
    zIndex: 1000,
  },
  emergencyFabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.emergency,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.fab,
  },
  emergencyFabIcon: {
    width: 42,
    height: 42,
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: 28,
    width: '84%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  call911Row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  call911Text: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalContinueButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    backgroundColor: colors.emergency,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContinueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
