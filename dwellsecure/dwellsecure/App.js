import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { initApi } from './src/services/apiClient';
import { RequestOnboardingProvider } from './src/contexts/OnboardingContext';

import { ONBOARDING_TRIGGER_GLOBAL_KEY } from './src/services/onboardingTrigger';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(undefined);

  // Register trigger on every render so any screen can call it and we switch to Welcome.
  if (typeof global !== 'undefined') {
    global[ONBOARDING_TRIGGER_GLOBAL_KEY] = () => setShowOnboarding(true);
  }

  useEffect(() => {
    // Initialize API connection on app start
    console.log('[App] Initializing API connection...');
    initApi()
      .then((available) => {
        console.log(`[App] API initialization complete. Available: ${available}`);
      })
      .catch(error => {
        console.warn('[App] API initialization failed, using AsyncStorage fallback:', error);
      });
  }, []);

  const requestShowOnboarding = () => setShowOnboarding(true);

  return (
    <>
      <RequestOnboardingProvider requestShowOnboarding={requestShowOnboarding}>
        <NavigationContainer>
          <AppNavigator
            showOnboarding={showOnboarding}
            setShowOnboarding={setShowOnboarding}
          />
        </NavigationContainer>
      </RequestOnboardingProvider>
      <StatusBar style="auto" />
    </>
  );
}

