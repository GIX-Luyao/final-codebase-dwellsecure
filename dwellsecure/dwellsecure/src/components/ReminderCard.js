import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { formatDate, formatTime } from '../utils/dateUtils';

export default function ReminderCard({ reminder, onToggle }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{reminder.title}</Text>
          <Switch
            value={reminder.enabled}
            onValueChange={onToggle}
            trackColor={{ false: '#ccc', true: '#0066cc' }}
          />
        </View>

        <Text style={styles.description}>{reminder.description}</Text>

        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Next reminder:</Text>
          <Text style={styles.dateText}>
            {formatDate(reminder.date)} at {formatTime(reminder.date)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: '#999',
    marginRight: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

