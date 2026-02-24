import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PropertyCard from '../components/PropertyCard';
import { getProperties, deleteProperty, resetOnboarding, resetAllData } from '../services/storage';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, typography } from '../constants/theme';

export default function PropertyListScreen() {
  const navigation = useNavigation();
  const { signOut } = useAuth();
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
          text: 'Sign out',
          onPress: async () => {
            Alert.alert(
              'Sign out',
              'Are you sure you want to sign out?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign out', onPress: () => signOut() },
              ]
            );
          },
        },
        {
          text: 'Reset Onboarding',
          onPress: async () => {
            Alert.alert(
              'Reset Onboarding',
              'Do you want to go back to the onboarding screen?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset',
                  onPress: async () => {
                    try {
                      await resetOnboarding();
                      Alert.alert('Success', 'Onboarding has been reset. You will be taken to the onboarding screen.', [
                        { text: 'OK' }
                      ]);
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
                      Alert.alert('Success', 'All data has been reset. You will be taken to the onboarding screen.', [
                        { text: 'OK' }
                      ]);
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
    <SafeAreaView style={styles.container} edges={['top']}>
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
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
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
              accessibilityLabel="Add property"
            >
              <Ionicons name="add-circle-outline" size={40} color={colors.textMuted} />
              <Text style={styles.addPropertyLabel}>Add another property</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => navigation.navigate('AddProperty')}
              accessibilityLabel="Add your first property"
            >
              <Ionicons name="add" size={60} color={colors.textMuted} />
            </TouchableOpacity>
            <Text style={styles.helperText}>Click to add a property</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    backgroundColor: colors.background,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
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
    padding: spacing.sm,
    marginTop: 4,
  },
  welcomeTitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  content: { flex: 1 },
  contentContainer: {
    padding: spacing.screenPadding,
    paddingBottom: 120,
  },
  propertyContainer: { width: '100%' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  circleButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  helperText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  addPropertyBox: {
    width: '100%',
    minHeight: 140,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  addPropertyLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
  },
});
