import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingWelcomeScreen({ onAddProperty }) {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeTitle}>Welcome to</Text>
      <Text style={styles.appTitle}>Dwell Secure</Text>
      <Text style={styles.subtitle}>Manage critical property info in one place</Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => onAddProperty && onAddProperty()}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
        <Text style={styles.primaryButtonText}>Add your first property</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  welcomeTitle: {
    fontSize: 20,
    color: '#666',
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 48,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#30ACFF',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
