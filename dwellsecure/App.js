import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { initApi } from './src/services/apiClient';

export default function App() {
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

  return (
    <>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <StatusBar style="auto" />
    </>
  );
}

