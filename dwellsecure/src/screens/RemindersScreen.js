import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getReminders } from '../services/storage';

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
    
    // Group reminders by date
    const grouped = {};
    allReminders.forEach((reminder) => {
      if (!reminder.completed && reminder.date) {
        const date = new Date(reminder.date);
        const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(reminder);
      }
    });

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
      navigation.navigate('ShutoffDetail', { shutoffId: reminder.shutoffId });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Reminders</Text>
        <Text style={styles.subtitle}>Check all your upcoming alerts</Text>

        {reminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No reminders scheduled</Text>
          </View>
        ) : (
          reminders.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.dateLabel}>{section.date}</Text>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.reminderCard}
                  onPress={() => handleReminderPress(item)}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name={item.icon || 'alert-circle-outline'} size={24} color="#999" />
                  </View>
                  <View style={styles.reminderContent}>
                    <Text style={styles.reminderText}>{item.title}</Text>
                    {item.description && (
                      <Text style={styles.reminderDescription}>{item.description}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100, // Space for bottom nav
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderContent: {
    flex: 1,
  },
  reminderText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
