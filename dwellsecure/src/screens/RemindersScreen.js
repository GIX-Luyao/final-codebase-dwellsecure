import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getReminders, saveReminder } from '../services/storage';
import SwipeableReminderItem from '../components/SwipeableReminderItem';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';

export default function RemindersScreen() {
  const navigation = useNavigation();
  const [reminders, setReminders] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [])
  );

  const loadReminders = async () => {
    const allReminders = await getReminders();
    const grouped = {};
    let incompleteCount = 0;
    allReminders.forEach((reminder) => {
      if (reminder.completed !== true && reminder.date) {
        incompleteCount++;
        const date = new Date(reminder.date);
        const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(reminder);
      }
    });

    const groupedArray = Object.keys(grouped)
      .sort((a, b) => {
        const dateA = new Date(grouped[a][0].date);
        const dateB = new Date(grouped[b][0].date);
        return dateA - dateB;
      })
      .map((dateKey) => ({ date: dateKey, items: grouped[dateKey] }));

    setReminders(groupedArray);
  };

  const handleReminderPress = (reminder) => {
    if (reminder.type === 'shutoff' && reminder.shutoffId) {
      navigation.navigate('Property', {
        screen: 'ShutoffDetail',
        params: { shutoffId: reminder.shutoffId },
      });
    } else if (reminder.type === 'utility' && reminder.utilityId) {
      navigation.navigate('Property', {
        screen: 'UtilityDetail',
        params: { utilityId: reminder.utilityId },
      });
    }
  };

  const handleCompleteReminder = async (reminder) => {
    try {
      const updatedReminder = {
        ...reminder,
        completed: true,
        updatedAt: new Date().toISOString(),
      };
      await saveReminder(updatedReminder);
      await loadReminders();
    } catch (error) {
      Alert.alert('Error', 'Failed to update reminder. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="calendar" size={22} color={colors.primary} />
          </View>
          <View style={styles.titleTextBlock}>
            <Text style={styles.headerTitle}>Reminders</Text>
            <Text style={styles.subtitle}>Swipe left on a card to mark complete</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        disableScrollViewPanResponder
      >
        {reminders.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="calendar-outline" size={40} color={colors.primary} />
            </View>
            <Text style={styles.emptyText}>No reminders scheduled</Text>
            <Text style={styles.emptySubtext}>
              Add maintenance reminders from shutoff or utility detail pages
            </Text>
          </View>
        ) : (
          reminders.map((section, index) => (
            <View key={`section-${index}`} style={styles.reminderGroup}>
              <View style={styles.dateHeadingRow}>
                <View style={styles.dateDot} />
                <Text style={styles.dateHeading}>{section.date}</Text>
                <View style={styles.dateLine} />
              </View>
              <View style={styles.reminderList}>
                {section.items.map((item) => (
                  <SwipeableReminderItem
                    key={item.id}
                    reminder={item}
                    onPress={() => handleReminderPress(item)}
                    onComplete={handleCompleteReminder}
                    completed={false}
                  />
                ))}
              </View>
            </View>
          ))
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

  /* Header */
  header: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary + '33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleTextBlock: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },

  /* Scroll */
  scrollView: { flex: 1 },
  contentContainer: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xl,
    paddingBottom: 140,
  },

  /* Groups */
  reminderGroup: { marginBottom: 28 },
  dateHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 12,
  },
  dateDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  dateHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  reminderList: {},

  /* Empty state */
  emptyCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.xxl,
    alignItems: 'center',
    marginTop: spacing.xxl,
    ...shadows.card,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary + '33',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
