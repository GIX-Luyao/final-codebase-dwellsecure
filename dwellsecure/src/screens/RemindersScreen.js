import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getReminders, saveReminder } from '../services/storage';
import SwipeableReminderItem from '../components/SwipeableReminderItem';
import { colors, spacing, typography } from '../constants/theme';

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
    
    console.log('[RemindersScreen] Total reminders loaded:', allReminders.length);
    
    // Group reminders by date (only show incomplete reminders)
    // Filter out reminders where completed === true
    const grouped = {};
    let incompleteCount = 0;
    allReminders.forEach((reminder) => {
      // Only show reminders that are not completed (completed === false or undefined)
      if (reminder.completed !== true && reminder.date) {
        incompleteCount++;
        const date = new Date(reminder.date);
        const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(reminder);
      }
    });

    console.log('[RemindersScreen] Incomplete reminders:', incompleteCount);
    console.log('[RemindersScreen] Completed reminders filtered out:', allReminders.length - incompleteCount);

    // Convert to array format and sort by date
    const groupedArray = Object.keys(grouped)
      .sort((a, b) => {
        const dateA = new Date(grouped[a][0].date);
        const dateB = new Date(grouped[b][0].date);
        return dateA - dateB;
      })
      .map((dateKey) => ({
        date: dateKey,
        items: grouped[dateKey],
      }));

    setReminders(groupedArray);
  };

  const handleReminderPress = (reminder) => {
    if (reminder.type === 'shutoff' && reminder.shutoffId) {
      // ShutoffDetail lives inside Property tab (PropertyStack); use nested navigate
      navigation.navigate('Property', {
        screen: 'ShutoffDetail',
        params: { shutoffId: reminder.shutoffId },
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
      console.log('[RemindersScreen] Marking reminder as completed:', reminder.id);
      console.log('[RemindersScreen] Updated reminder data:', updatedReminder);
      await saveReminder(updatedReminder);
      console.log('[RemindersScreen] ✅ Reminder marked as completed and synced to database');
      // Reload reminders to reflect the change (will filter out completed ones)
      await loadReminders();
    } catch (error) {
      console.error('[RemindersScreen] Error completing reminder:', error);
      Alert.alert('Error', 'Failed to update reminder. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reminders</Text>
        <Text style={styles.subtitle}>Check all your upcoming alerts</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {reminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={56} color={colors.textMuted} />
            <Text style={styles.emptyText}>No reminders scheduled</Text>
            <Text style={styles.emptySubtext}>Add maintenance reminders from shutoffs or utilities</Text>
          </View>
        ) : (
          reminders.map((section, index) => (
            <View key={`section-${index}`} style={styles.reminderGroup}>
              <Text style={styles.dateHeading}>{section.date}</Text>
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
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  scrollView: { flex: 1 },
  contentContainer: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 140,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  reminderGroup: { marginBottom: 28 },
  dateHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  reminderList: {},
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
  },
});
