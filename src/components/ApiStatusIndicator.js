import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getApiAvailability, checkApiHealth } from '../services/apiClient';

/**
 * API Status Indicator Component
 * Shows whether the app is connected to MongoDB or using AsyncStorage
 */
export default function ApiStatusIndicator() {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkStatus();
    // Check every 10 seconds
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    setIsChecking(true);
    const available = await checkApiHealth();
    setIsConnected(available);
    setIsChecking(false);
  };

  if (isChecking) {
    return (
      <View style={[styles.container, styles.checking]}>
        <Text style={styles.text}>检查连接中...</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.container, isConnected ? styles.connected : styles.disconnected]}
      onPress={checkStatus}
    >
      <Text style={styles.text}>
        {isConnected ? '✅ MongoDB 已连接' : '⚠️ 仅本地存储 (MongoDB 未连接)'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  connected: {
    backgroundColor: '#4caf50',
  },
  disconnected: {
    backgroundColor: '#ff9800',
  },
  checking: {
    backgroundColor: '#9e9e9e',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
