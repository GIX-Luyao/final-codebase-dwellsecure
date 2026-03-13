import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getPerson, deletePerson } from '../services/storage';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';

export default function PersonDetailScreen({ route }) {
  const navigation = useNavigation();
  const { personId } = route.params || {};
  const [person, setPerson] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      loadPersonData();
    }, [personId])
  );

  const loadPersonData = async () => {
    const data = await getPerson(personId);
    if (data) setPerson(data);
  };

  const handleEdit = () => {
    navigation.navigate('AddPerson', { person });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Person',
      'Are you sure you want to delete this person? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePerson(personId);
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Failed to delete person.');
            }
          },
        },
      ]
    );
  };

  const getInitials = (name = '') =>
    name
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');

  if (!person) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const initials = getInitials(person.name);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Person Details</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleEdit}
            style={styles.editButton}
            accessibilityLabel="Edit person"
          >
            <Ionicons name="pencil-outline" size={17} color={colors.primary} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteHeaderButton}
            accessibilityLabel="Delete person"
          >
            <Ionicons name="trash-outline" size={17} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero / Avatar */}
        <View style={styles.heroSection}>
          <View style={styles.avatarWrapper}>
            {person.profilePhoto ? (
              <Image source={{ uri: person.profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{initials || '?'}</Text>
              </View>
            )}
          </View>
          <Text style={styles.heroName}>{person.name}</Text>
          {person.role ? (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{person.role}</Text>
            </View>
          ) : null}
        </View>

        {/* Contact Info Card */}
        {(person.phone || person.email) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contact</Text>
            {person.phone && (
              <TouchableOpacity style={styles.contactRow} activeOpacity={0.7}>
                <View style={[styles.contactIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="call-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Phone</Text>
                  <Text style={styles.contactValue}>{person.phone}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
            {person.phone && person.email && <View style={styles.divider} />}
            {person.email && (
              <TouchableOpacity style={styles.contactRow} activeOpacity={0.7}>
                <View style={[styles.contactIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="mail-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>{person.email}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Notes Card */}
        {person.notes ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{person.notes}</Text>
          </View>
        ) : null}

        {/* No contact fallback */}
        {!person.phone && !person.email && (
          <View style={styles.emptyCard}>
            <Ionicons name="information-circle-outline" size={24} color={colors.textMuted} />
            <Text style={styles.emptyText}>No contact information added</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    ...typography.titleSmall,
    fontSize: 17,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.card,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary + '33',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  deleteHeaderButton: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    backgroundColor: colors.errorBackground,
    borderWidth: 1,
    borderColor: colors.error + '22',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Scroll */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: 48,
  },

  /* Hero */
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatarWrapper: {
    marginBottom: spacing.lg,
    ...shadows.cardHover,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  heroName: {
    ...typography.title,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
  },

  /* Cards */
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.lg,
  },

  /* Contact rows */
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
    marginLeft: 48,
  },

  /* Notes */
  notesText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  /* Empty state */
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
