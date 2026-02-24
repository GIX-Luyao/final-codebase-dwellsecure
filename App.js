import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initApi } from './src/services/apiClient';

export default function App() {
  useEffect(() => {
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
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
      <StatusBar style="auto" />
    </>
  );
}

