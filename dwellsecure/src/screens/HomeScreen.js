import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getShutoffs, getReminders, getUtilities, resetOnboarding } from '../services/storage';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [shutoffsCount, setShutoffsCount] = useState(0);
  const [remindersCount, setRemindersCount] = useState(0);
  const [utilitiesCount, setUtilitiesCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const shutoffs = await getShutoffs();
    const reminders = await getReminders();
    const utilities = await getUtilities();
    setShutoffsCount(shutoffs.length);
    setRemindersCount(reminders.length);
    setUtilitiesCount(utilities.length);
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'Do you want to see the onboarding screen again?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetOnboarding();
              Alert.alert('Success', 'Onboarding has been reset. Please restart the app to see it again.', [
                { text: 'OK' }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to reset onboarding');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>DwellSecure</Text>
            <Text style={styles.subtitle}>Emergency Preparedness</Text>
          </View>
          <TouchableOpacity 
            onPress={handleResetOnboarding}
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Shutoffs')}
        >
          <Ionicons name="list" size={32} color="#0066cc" />
          <Text style={styles.statNumber}>{shutoffsCount}</Text>
          <Text style={styles.statLabel}>Shutoffs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Utilities')}
        >
          <Ionicons name="flash" size={32} color="#0066cc" />
          <Text style={styles.statNumber}>{utilitiesCount}</Text>
          <Text style={styles.statLabel}>Utilities</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Reminders')}
        >
          <Ionicons name="alarm" size={32} color="#0066cc" />
          <Text style={styles.statNumber}>{remindersCount}</Text>
          <Text style={styles.statLabel}>Reminders</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={[styles.actionButton, styles.primaryActionButton]}
          onPress={() => navigation.navigate('Shutoffs', { screen: 'PropertyList' })}
        >
          <Ionicons name="home" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Manage Property Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Shutoffs', { screen: 'AddEditShutoff', params: { shutoff: null } })}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Add New Shutoff</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Utilities', { screen: 'AddEditUtility', params: { utility: null } })}
        >
          <Ionicons name="flash" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Add New Utility</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Reminders')}
        >
          <Ionicons name="notifications" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Set Reminder</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0066cc',
    padding: 30,
    paddingTop: 60,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  settingsButton: {
    padding: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    padding: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '30%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#0066cc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  primaryActionButton: {
    backgroundColor: '#004d99',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});
