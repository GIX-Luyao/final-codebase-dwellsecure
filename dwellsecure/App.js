import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initApi } from './src/services/apiClient';
import { requestPermissions } from './src/services/notifications';

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

  useEffect(() => {
    requestPermissions()
      .then((granted) => {
        if (granted) console.log('[App] Notification permissions granted');
        else console.warn('[App] Notification permissions not granted');
      })
      .catch((err) => console.warn('[App] Notification permission request failed:', err));
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

