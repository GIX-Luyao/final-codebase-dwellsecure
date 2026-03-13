import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../contexts/OnboardingContext';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';

export default function SuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const onboarding = useOnboarding();
  const { address, addressLine1, onboardingMode } = route.params || {};
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate checkmark icon
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoHome = () => {
    if (onboardingMode && onboarding?.completeOnboarding) {
      onboarding.completeOnboarding();
      return;
    }
    // Navigate to PropertyList (home page - first tab in bottom nav)
    navigation.reset({
      index: 0,
      routes: [{ name: 'PropertyList' }],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.heroBadge}>
          <Ionicons name="sparkles" size={14} color={colors.primary} />
          <Text style={styles.heroBadgeText}>Property saved</Text>
        </View>
        <Text style={styles.title}>All set!</Text>

        <View style={styles.card}>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            <View style={styles.checkmarkCircle}>
              <Ionicons name="checkmark" size={52} color={colors.white} />
            </View>
          </Animated.View>

          <View style={styles.propertyInfo}>
            <Text style={styles.address}>
              {addressLine1 || address || '604 7th Ave'}
            </Text>
            <Text style={styles.subtitle}>Added as your property</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleGoHome}
          activeOpacity={0.85}
        >
          <Ionicons name="home-outline" size={20} color={colors.white} />
          <Text style={styles.primaryButtonText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  content: {
    alignItems: 'center',
    gap: spacing.xl,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary + '33',
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  title: {
    ...typography.titleLarge,
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    ...shadows.cardHover,
  },
  propertyInfo: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  address: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  checkmarkCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  primaryButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    ...shadows.button,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});
