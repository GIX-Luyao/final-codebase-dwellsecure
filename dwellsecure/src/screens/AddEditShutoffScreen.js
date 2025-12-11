import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { saveShutoff, getShutoff, saveReminder, deleteReminder } from '../services/storage';

export default function AddEditShutoffScreen({ route, navigation }) {
  const { shutoff, type } = route.params || {};
  const isEditing = !!shutoff;
  const shutoffType = type || shutoff?.type || 'fire';

  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [maintenanceDate, setMaintenanceDate] = useState(new Date());
  const [maintenanceTime, setMaintenanceTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [contacts, setContacts] = useState([]);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [reminderId, setReminderId] = useState(null);

  useEffect(() => {
    if (isEditing && shutoff) {
      loadShutoffData();
    }
  }, []);

  const loadShutoffData = async () => {
    const data = await getShutoff(shutoff.id);
    if (data) {
      setDescription(data.description || '');
      setLocation(data.location || '');
      setPhotos(data.photos || []);
      setVideos(data.videos || []);
      if (data.maintenanceDate) {
        setMaintenanceDate(new Date(data.maintenanceDate));
      }
      if (data.maintenanceTime) {
        setMaintenanceTime(new Date(data.maintenanceTime));
      }
      setNotes(data.notes || '');
      setContacts(data.contacts || []);
      setReminderId(data.reminderId || null);
    }
  };

  const getShutoffTypeLabel = () => {
    const labels = {
      fire: 'Fire',
      power: 'Power',
      water: 'Water',
    };
    return labels[shutoffType] || 'Fire';
  };

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVideos([...videos, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSave = async () => {
    const shutoffId = isEditing ? shutoff.id : Date.now().toString();
    
    const shutoffData = {
      id: shutoffId,
      type: shutoffType,
      description: description.trim(),
      location: location.trim(),
      photos,
      videos,
      maintenanceDate: maintenanceDate.toISOString(),
      maintenanceTime: maintenanceTime.toISOString(),
      notes: notes.trim(),
      contacts,
      createdAt: isEditing ? shutoff.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create or update reminder if maintenance date/time is set
    if (maintenanceDate && maintenanceTime) {
      const reminderIdToUse = reminderId || `reminder-${Date.now()}`;
      // Combine date and time
      const reminderDate = new Date(maintenanceDate);
      reminderDate.setHours(maintenanceTime.getHours());
      reminderDate.setMinutes(maintenanceTime.getMinutes());
      reminderDate.setSeconds(0);
      reminderDate.setMilliseconds(0);
      
      const reminder = {
        id: reminderIdToUse,
        shutoffId: shutoffId,
        title: `${getShutoffTypeLabel()} Shutoff Maintenance`,
        description: `Maintenance reminder for ${getShutoffTypeLabel().toLowerCase()} shutoff${location ? ` at ${location}` : ''}`,
        date: reminderDate.toISOString(),
        icon: shutoffType === 'fire' ? 'flame-outline' : shutoffType === 'power' ? 'flash-outline' : 'water',
        completed: false,
        type: 'shutoff',
      };

      await saveReminder(reminder);
      shutoffData.reminderId = reminderIdToUse;
    } else if (reminderId) {
      // Remove reminder if date/time is cleared
      await deleteReminder(reminderId);
      shutoffData.reminderId = null;
    }

    await saveShutoff(shutoffData);

    navigation.goBack();
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dwell Secure</Text>
        <View style={{ width: 28 }} />
      </View>
      
      <View style={styles.stepContent}>
        <Text style={styles.instructionTitle}>
          Find your {getShutoffTypeLabel()} shutoff
        </Text>
        <View style={styles.instructionPlaceholder}>
          {/* Square placeholder for main content */}
        </View>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dwell Secure</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.stepContent} contentContainerStyle={styles.stepContentContainer}>
        <View style={styles.inputRect}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description..."
            placeholderTextColor="#999"
            multiline
          />
        </View>

        <View style={styles.inputRect}>
          <Text style={styles.inputLabel}>Location</Text>
          <TextInput
            style={styles.textInput}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter location..."
            placeholderTextColor="#999"
            multiline
          />
        </View>

        <View style={styles.photoVideoSection}>
          <Text style={styles.sectionLabel}>Photo/Video</Text>
          <View style={styles.mediaGrid}>
            {photos.map((uri, index) => (
              <View key={`photo-${index}`} style={styles.mediaItem}>
                <Image source={{ uri }} style={styles.mediaImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePhoto(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))}
            {videos.map((uri, index) => (
              <View key={`video-${index}`} style={styles.mediaItem}>
                <View style={styles.videoPlaceholder}>
                  <Ionicons name="videocam" size={30} color="#999" />
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeVideo(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addMediaButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={30} color="#999" />
              <Text style={styles.addMediaText}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addMediaButton} onPress={pickVideo}>
              <Ionicons name="videocam-outline" size={30} color="#999" />
              <Text style={styles.addMediaText}>Video</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dwell Secure</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.stepContent} contentContainerStyle={styles.stepContentContainer}>
        <View style={styles.maintenanceSection}>
          <Text style={styles.sectionLabel}>Maintenance Reminder</Text>
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
        </View>

        <View style={styles.notesSquare}>
          <Text style={styles.inputLabel}>Notes</Text>
          <TextInput
            style={[styles.textInput, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Enter notes..."
            placeholderTextColor="#999"
            multiline
          />
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.sectionLabel}>Contact (Optional)</Text>
          <TouchableOpacity
            style={styles.contactDropdown}
            onPress={() => setShowContactDropdown(!showContactDropdown)}
          >
            <Text style={styles.contactDropdownText}>
              {contacts.length > 0 ? `${contacts.length} contact(s)` : 'Select contact'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          {showContactDropdown && (
            <View style={styles.dropdownList}>
              {/* Contact list would go here */}
              <Text style={styles.dropdownItem}>No contacts available</Text>
            </View>
          )}
          <TouchableOpacity style={styles.addContactButton}>
            <Ionicons name="add-circle-outline" size={24} color="#666" />
            <Text style={styles.addContactText}>Add Contact</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Ionicons name="checkmark-circle" size={40} color="#333" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  stepContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  stepContent: {
    flex: 1,
  },
  stepContentContainer: {
    padding: 20,
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  instructionPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginTop: 20,
  },
  inputRect: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 40,
  },
  photoVideoSection: {
    marginTop: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 2,
    borderColor: '#C7C7CC',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#FAFAFA',
  },
  mediaItem: {
    width: 80,
    height: 80,
    marginRight: 10,
    marginBottom: 10,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addMediaButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  addMediaText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  maintenanceSection: {
    marginBottom: 20,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  dateTimeInput: {
    flex: 1,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  notesSquare: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  contactSection: {
    marginBottom: 20,
  },
  contactDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  contactDropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownItem: {
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addContactText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  nextButton: {
    backgroundColor: '#A8A8A8',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    alignItems: 'center',
    padding: 20,
  },
});
