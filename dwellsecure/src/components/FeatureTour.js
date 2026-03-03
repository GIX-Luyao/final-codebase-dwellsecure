import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

const TOUR_STEPS = [
  {
    id: 'welcome',
    icon: 'sparkles',
    title: 'Welcome to Dwell Secure',
    description: 'A quick guide to help you get the most out of the app. You can skip anytime.',
  },
  {
    id: 'dashboard',
    icon: 'grid',
    title: 'Dashboard overview',
    description: 'The home screen shows your counts for Shutoffs (gas, water, electric), Utilities, and Reminders. Tap any card to open that section.',
  },
  {
    id: 'quick-actions',
    icon: 'flash',
    title: 'Quick actions',
    description: 'Use these buttons to manage property data, add new shutoffs, add utilities, or set reminders—all from the home screen.',
  },
  {
    id: 'bottom-nav',
    icon: 'navigate',
    title: 'Bottom navigation',
    description: 'Property (home), Reminders, Finder (AI assistance), and Share. Switch between main sections using the bottom bar.',
  },
  {
    id: 'emergency',
    icon: 'alert-circle',
    title: 'Emergency button',
    description: 'The red floating button opens Emergency Mode. You can drag it to move it. Tap it to call 911 or view critical info in an emergency.',
  },
  {
    id: 'settings',
    icon: 'person-circle',
    title: 'Profile & settings',
    description: 'Tap the person icon (top-left) for your profile. Tap the gear (top-right) for settings, sign out, or reset onboarding.',
  },
];

export default function FeatureTour({ visible, onComplete, onSkip }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (visible) setStepIndex(0);
  }, [visible]);

  const step = TOUR_STEPS[stepIndex];
  const isLastStep = stepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!step) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name={step.icon} size={40} color={colors.primary} />
          </View>
          <Text style={styles.title}>{step.title}</Text>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.description}>{step.description}</Text>
          </ScrollView>
          <View style={styles.dots}>
            {TOUR_STEPS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === stepIndex && styles.dotActive]}
              />
            ))}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextText}>
                {isLastStep ? 'Got it' : 'Next'}
              </Text>
              {!isLastStep && (
                <Ionicons name="arrow-forward" size={18} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.screenPadding,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.titleSmall,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  scroll: {
    maxHeight: 120,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderLight,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: spacing.md,
  },
  skipButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
