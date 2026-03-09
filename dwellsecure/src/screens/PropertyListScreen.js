import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PropertyCard from '../components/PropertyCard';
import { getProperties, deleteProperty, resetOnboarding, resetAllData, resetFeatureTour } from '../services/storage';
import { useAuth } from '../contexts/AuthContext';
import { useSync } from '../contexts/SyncContext';
import { useFeatureTour } from '../contexts/FeatureTourContext';
import { colors, spacing, borderRadius } from '../constants/theme';

export default function PropertyListScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { signOut, user } = useAuth();
  const { lastSyncAt } = useSync();
  const { requestShowFeatureTour } = useFeatureTour();
  const [properties, setProperties] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      loadProperties();
    }, [])
  );

  React.useEffect(() => { loadProperties(); }, [user?.id]);
  React.useEffect(() => { loadProperties(); }, [lastSyncAt]);

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
          text: 'Show guide again',
          onPress: async () => {
            try {
              await resetFeatureTour();
              requestShowFeatureTour();
            } catch (e) {
              Alert.alert('Error', 'Could not reset guide');
            }
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
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.xl) }]}>
        <View style={styles.headerTextContainer} pointerEvents="box-none">
          <Text style={styles.headerTitle}>Dwell Secure</Text>
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

      <View style={styles.contentWrap}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
    minHeight: 72,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    position: 'relative',
  },
  contentWrap: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  headerTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 56,
    paddingTop: spacing.xxl + spacing.lg,
  },
  settingsButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
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
