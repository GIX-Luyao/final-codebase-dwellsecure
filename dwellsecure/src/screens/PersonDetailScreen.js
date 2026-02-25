import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getPerson, savePerson, deletePerson, saveReminder, deleteReminder } from '../services/data';

export default function PersonDetailScreen({ route }) {
  const navigation = useNavigation();
  const { personId } = route.params || {};

  const [person, setPerson] = useState(null);
  const [maintenanceDate, setMaintenanceDate] = useState(new Date());
  const [maintenanceTime, setMaintenanceTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderId, setReminderId] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      loadPersonData();
    }, [personId])
  );

  const loadPersonData = async () => {
    const data = await getPerson(personId);
    if (data) {
      setPerson(data);
      if (data.maintenanceDate) {
        setMaintenanceDate(new Date(data.maintenanceDate));
      }
      if (data.maintenanceTime) {
        setMaintenanceTime(new Date(data.maintenanceTime));
      }
      setReminderId(data.reminderId || null);
    }
  };

  const handleEdit = () => {
    navigation.navigate('AddPerson', { person });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Person',
      'Are you sure you want to delete this person? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (reminderId) {
                await deleteReminder(reminderId);
              }
              await deletePerson(personId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete person');
            }
          },
        },
      ]
    );
  };

  const handleSaveReminder = async () => {
    if (!person) return;

    if (maintenanceDate && maintenanceTime) {
      const reminderIdToUse = reminderId || `reminder-${Date.now()}`;
      const reminderDate = new Date(maintenanceDate);
      reminderDate.setHours(maintenanceTime.getHours());
      reminderDate.setMinutes(maintenanceTime.getMinutes());
      reminderDate.setSeconds(0);
      reminderDate.setMilliseconds(0);

      const reminder = {
        id: reminderIdToUse,
        personId: person.id,
        title: `Contact ${person.name}`,
        description: `Reminder to contact ${person.name}${person.role ? ` (${person.role})` : ''}`,
        date: reminderDate.toISOString(),
        icon: 'person-outline',
        completed: false,
        type: 'person',
      };

      await saveReminder(reminder);
      const updatedPerson = { ...person, reminderId: reminderIdToUse };
      await savePerson(updatedPerson);
      setReminderId(reminderIdToUse);
      Alert.alert('Success', 'Reminder saved successfully');
    } else if (reminderId) {
      await deleteReminder(reminderId);
      const updatedPerson = { ...person, reminderId: null };
      await savePerson(updatedPerson);
      setReminderId(null);
      Alert.alert('Success', 'Reminder removed');
    }
  };

  if (!person) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} style={styles.headerActionButton}>
            <Ionicons name="pencil" size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerActionButton}>
            <Ionicons name="trash-outline" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.profileSection}>
          {person.profilePhoto ? (
            <Image source={{ uri: person.profilePhoto }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Ionicons name="person" size={80} color="#999" />
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{person.name}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{person.role || 'Not specified'}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Contact Info</Text>
          {person.phone && (
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <Text style={styles.contactText}>{person.phone}</Text>
            </View>
          )}
          {person.email && (
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <Text style={styles.contactText}>{person.email}</Text>
            </View>
          )}
          {!person.phone && !person.email && (
            <Text style={styles.noContact}>No contact information</Text>
          )}
        </View>

        <View style={styles.reminderSection}>
          <Text style={styles.sectionLabel}>Reminder</Text>
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeInput}>
              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {maintenanceDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={maintenanceDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setMaintenanceDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>
            <View style={styles.dateTimeInput}>
              <Text style={styles.inputLabel}>Time</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {maintenanceTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Ionicons name="time-outline" size={20} color="#666" />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={maintenanceTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(Platform.OS === 'ios');
                    if (selectedTime) {
                      setMaintenanceTime(selectedTime);
                    }
                  }}
                />
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.saveReminderButton} onPress={handleSaveReminder}>
            <Text style={styles.saveReminderText}>Save Reminder</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    marginLeft: 15,
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100, // Space for bottom nav
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  noContact: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  reminderSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 20,
  },
  dateTimeInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  saveReminderButton: {
    backgroundColor: '#A8A8A8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveReminderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

