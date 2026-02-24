/**
 * Main screen (first tab). Shown as the default when user opens the app after onboarding.
 * Has the top-right gear → Settings → Reset Onboarding / Reset All Data.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PropertyCard from '../components/PropertyCard';
import ApiStatusIndicator from '../components/ApiStatusIndicator';
import { getProperties, deleteProperty, resetOnboarding, resetAllData } from '../services/storage';
import { requestShowOnboarding } from '../services/onboardingTrigger';

export default function PropertyListScreen() {
  const navigation = useNavigation();
  const [properties, setProperties] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      loadProperties();
    }, [])
  );

  const loadProperties = async () => {
    const data = await getProperties();
    setProperties(data);
  };

  const handleLongPress = (property) => {
    Alert.alert(
      'Property Options',
      'What would you like to do?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Property',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Property',
              'Are you sure you want to delete this property? This action cannot be undone.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteProperty(property.id);
                      loadProperties();
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete property');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleSettingsPress = async () => {
    Alert.alert(
      'Settings',
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Onboarding',
          onPress: async () => {
            Alert.alert(
              'Reset Onboarding',
              'Do you want to go back to add your first property?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset',
                  onPress: async () => {
                    try {
                      await resetOnboarding();
                      setTimeout(() => {
                        requestShowOnboarding();
                        setTimeout(() => Alert.alert('Success', 'You will see the Welcome screen.', [{ text: 'OK' }]), 400);
                      }, 150);
                    } catch (error) {
                      Alert.alert('Error', 'Failed to reset onboarding');
                    }
                  },
                },
              ]
            );
          },
        },
        {
          text: 'Reset All Data',
          style: 'destructive',
          onPress: async () => {
            Alert.alert(
              'Reset All Data',
              'This will delete all your properties, shutoffs, utilities, people, and reminders. This action cannot be undone. Are you sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset All',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await resetAllData();
                      setTimeout(() => {
                        requestShowOnboarding();
                        setTimeout(() => Alert.alert('Success', 'All data has been reset. You will see the Welcome screen.', [{ text: 'OK' }]), 400);
                      }, 150);
                    } catch (error) {
                      Alert.alert('Error', 'Failed to reset data');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerSpacer} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.welcomeTitle}>Welcome to</Text>
            <Text style={styles.appTitle}>Dwell Secure</Text>
            <Text style={styles.headerSubtitle}>All your critical property data in one place</Text>
          </View>
          <TouchableOpacity 
            onPress={handleSettingsPress}
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <ApiStatusIndicator />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {properties.length > 0 ? (
          <View style={styles.propertyContainer}>
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onPress={() => navigation.navigate('PropertyDetail', { propertyId: property.id })}
                onLongPress={() => handleLongPress(property)}
              />
            ))}
            
            <TouchableOpacity 
              style={styles.addPropertyBox}
              onPress={() => navigation.navigate('AddProperty')}
            >
              <Ionicons name="add-circle-outline" size={40} color="#999" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <TouchableOpacity 
              style={styles.circleButton}
              onPress={() => navigation.navigate('AddProperty')}
            >
              <Ionicons name="add" size={60} color="#999" />
            </TouchableOpacity>
            <Text style={styles.helperText}>Click to add a property</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerSpacer: {
    width: 40,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  settingsButton: {
    width: 40,
    padding: 8,
    marginTop: 5,
  },
  welcomeTitle: {
    fontSize: 20,
    color: '#666',
    marginBottom: 5,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100, // Space for bottom nav
  },
  propertyContainer: {
    width: '100%',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  circleButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  helperText: {
    fontSize: 14,
    color: '#999',
  },
  addPropertyBox: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    borderStyle: 'dashed',
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
});
