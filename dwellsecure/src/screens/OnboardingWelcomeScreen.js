import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

/**
 * New onboarding: single Welcome screen. User taps "Add your property" to go to AddPropertyScreen.
 */
export default function OnboardingWelcomeScreen({ onAddProperty }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcomeTitle}>Welcome to</Text>
        <Text style={styles.appTitle}>Dwell Secure</Text>
        <Text style={styles.subtitle}>Manage critical property info in one place</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onAddProperty}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={colors.white} />
          <Text style={styles.primaryButtonText}>Add your property</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.screenPadding,
  },
  content: {
    alignItems: 'center',
    maxWidth: 360,
  },
  welcomeTitle: {
    ...typography.titleSmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl * 2,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    minWidth: 240,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
});
