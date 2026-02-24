import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

export default function ShutoffCard({ shutoff, onEdit, onDelete }) {
  const isVerified = shutoff.verification_status === 'verified';
  const shutoffType = shutoff.type || 'gas';
  
  // Get type label and icon
  const getTypeInfo = () => {
    switch (shutoffType) {
      case 'gas':
      case 'fire':
        return { label: 'Gas', icon: 'flame-outline', color: colors.accentGas };
      case 'electric':
      case 'power':
        return { label: 'Electric', icon: 'flash-outline', color: colors.accentElectric };
      case 'water':
        return { label: 'Water', icon: 'water-outline', color: colors.accentWater };
      default:
        return { label: 'Utility', icon: 'construct-outline', color: colors.textSecondary };
    }
  };
  
  const typeInfo = getTypeInfo();
  const displayName = shutoff.name || shutoff.description || `${typeInfo.label} Shutoff`;

  return (
    <View style={[styles.card, isVerified && styles.cardVerified]}>
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <View style={styles.typeBadge}>
              <Ionicons name={typeInfo.icon} size={16} color={typeInfo.color} />
              <Text style={styles.typeLabel}>{typeInfo.label}</Text>
            </View>
            <Text style={styles.name}>{displayName}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Ionicons name="pencil" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Ionicons name="trash" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.verificationRow}>
          {isVerified ? (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          ) : (
            <View style={styles.unverifiedBadge}>
              <Ionicons name="close-circle-outline" size={18} color={colors.warning} />
              <Text style={styles.unverifiedText}>Unverified</Text>
            </View>
          )}
        </View>

        {shutoff.location && (
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{shutoff.location}</Text>
          </View>
        )}

        {shutoff.contacts && shutoff.contacts.length > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {shutoff.contacts.map(c => c.name || c.role || 'Technician').join(', ')}
            </Text>
          </View>
        )}

        {shutoff.documentName && (
          <View style={styles.infoRow}>
            <Ionicons name="document-attach" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{shutoff.documentName}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardVerified: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  cardContent: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleSection: {
    flex: 1,
    marginRight: spacing.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    alignSelf: 'flex-start',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: spacing.sm,
    padding: spacing.sm,
  },
  verificationRow: {
    marginBottom: spacing.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  unverifiedText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: colors.warning,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  infoText: {
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
});

