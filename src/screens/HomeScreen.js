import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getShutoffs, getReminders, getUtilities, resetOnboarding } from '../services/storage';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Dwell Secure</Text>
            <Text style={styles.subtitle}>Emergency preparedness</Text>
          </View>
          <TouchableOpacity
            onPress={handleResetOnboarding}
            style={styles.settingsButton}
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Shutoffs')}
          activeOpacity={0.85}
        >
          <View style={styles.statIconWrap}>
            <Ionicons name="list" size={28} color={colors.primary} />
          </View>
          <Text style={styles.statNumber}>{shutoffsCount}</Text>
          <Text style={styles.statLabel}>Shutoffs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Utilities')}
          activeOpacity={0.85}
        >
          <View style={styles.statIconWrap}>
            <Ionicons name="flash" size={28} color={colors.primary} />
          </View>
          <Text style={styles.statNumber}>{utilitiesCount}</Text>
          <Text style={styles.statLabel}>Utilities</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Reminders')}
          activeOpacity={0.85}
        >
          <View style={styles.statIconWrap}>
            <Ionicons name="alarm" size={28} color={colors.primary} />
          </View>
          <Text style={styles.statNumber}>{remindersCount}</Text>
          <Text style={styles.statLabel}>Reminders</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick actions</Text>

        <TouchableOpacity
          style={[styles.actionButton, styles.primaryActionButton]}
          onPress={() => navigation.navigate('Shutoffs', { screen: 'PropertyList' })}
          activeOpacity={0.85}
        >
          <Ionicons name="home" size={22} color={colors.white} />
          <Text style={styles.actionButtonText}>Manage property data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Shutoffs', { screen: 'AddEditShutoff', params: { shutoff: null } })}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={22} color={colors.white} />
          <Text style={styles.actionButtonText}>Add new shutoff</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Utilities', { screen: 'AddEditUtility', params: { utility: null } })}
          activeOpacity={0.85}
        >
          <Ionicons name="flash" size={22} color={colors.white} />
          <Text style={styles.actionButtonText}>Add new utility</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Reminders')}
          activeOpacity={0.85}
        >
          <Ionicons name="notifications" size={22} color={colors.white} />
          <Text style={styles.actionButtonText}>Set reminder</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xxl,
    paddingTop: 56,
    paddingHorizontal: spacing.screenPadding,
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
    padding: spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    padding: spacing.screenPadding,
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: '28%',
    flex: 1,
    ...shadows.card,
  },
  statIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  quickActions: {
    padding: spacing.screenPadding,
    paddingTop: 0,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  actionButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.button,
  },
  primaryActionButton: {
    backgroundColor: colors.primaryDark,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});
