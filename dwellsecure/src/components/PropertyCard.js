import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

export default function PropertyCard({ property, onPress, onLongPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {property.imageUri ? (
          <Image source={{ uri: property.imageUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={56} color={colors.textMuted} />
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.address}>{property.address}</Text>
        <View style={styles.indicators}>
          <View style={styles.indicator} />
          <View style={[styles.indicator, styles.inactiveIndicator]} />
          <View style={[styles.indicator, styles.inactiveIndicator]} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.5,
    marginBottom: spacing.lg,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    marginBottom: spacing.sm,
  },
  address: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  indicators: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  indicator: {
    width: 28,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  inactiveIndicator: {
    backgroundColor: colors.borderLight,
  },
});
