import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const REMINDERS_CHANNEL_ID = 'dwellsecure-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Ensure Android notification channel exists (required for sound on Android 8+).
 * Call early (e.g. on app load) so scheduling can use channelId.
 */
export const ensureRemindersChannel = async () => {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(REMINDERS_CHANNEL_ID, {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
    });
  } catch (error) {
    console.warn('Failed to create reminders notification channel:', error);
  }
};

/**
 * Schedule a local notification and alarm at the reminder's date.
 * Uses reminder.id as identifier so we can cancel it later.
 */
export const scheduleNotification = async (reminder) => {
  if (!reminder?.date || !reminder?.id) return;
  const date = typeof reminder.date === 'string' ? new Date(reminder.date) : reminder.date;
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
    return;
  }
  try {
    await ensureRemindersChannel();
    const trigger = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: Platform.OS === 'android' ? REMINDERS_CHANNEL_ID : undefined,
    };
    await Notifications.scheduleNotificationAsync({
      identifier: reminder.id,
      content: {
        title: reminder.title || 'Reminder',
        body: reminder.description || 'Maintenance reminder',
        sound: 'default',
        data: { reminderId: reminder.id },
      },
      trigger,
    });
    console.log('[Notifications] Scheduled reminder:', reminder.id, 'at', date.toISOString());
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

/**
 * Cancel a scheduled notification by reminder id (same as the identifier we use when scheduling).
 */
export const cancelNotification = async (notificationId) => {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('[Notifications] Cancelled reminder notification:', notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

export const requestPermissions = async () => {
  await ensureRemindersChannel();
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};
