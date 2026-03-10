import React, { useState, useEffect, useRef } from 'react';
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
  FlatList,
  Modal,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { saveUtility, getUtility, saveReminder, deleteReminder, getAllUtilitiesRaw, getProperties, getProperty } from '../services/storage';
import { isEmergencyMode } from '../services/modeService';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';
import { BOTTOM_NAV_HEIGHT } from '../constants/theme';

import { getMapThumbnailUrl } from '../utils/mapStatic';
import { geocodeAddress } from '../utils/geocode';
import { startVoiceRecording, stopRecordingWithBase64 } from '../utils/voiceRecording';
import { submitVoiceNoteForSteps } from '../services/openai';

export default function AddEditUtilityScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { utility, propertyId, presetDescription } = route.params || {};
  const isEditing = !!utility;
  const bottomPadding = (insets.bottom || 0) + BOTTOM_NAV_HEIGHT;

  const [step, setStep] = useState(2); // Start from step 2
  const [title, setTitle] = useState('');
  const [utilityIcon, setUtilityIcon] = useState(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [description, setDescription] = useState(''); // kept for backward compat
  const [steps, setSteps] = useState(['', '']);
  const [location, setLocation] = useState('');
  const [locationCoords, setLocationCoords] = useState(null);
  const [floor, setFloor] = useState('');
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [maintenanceDate, setMaintenanceDate] = useState(null);
  const [maintenanceTime, setMaintenanceTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const yearPickerScrollRef = useRef(null);
  const hourPickerScrollRef = useRef(null);
  const minutePickerScrollRef = useRef(null);
  const [notes, setNotes] = useState('');
  const [contacts, setContacts] = useState([]);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [showFloorDropdown, setShowFloorDropdown] = useState(false);
  const [showFloorInput, setShowFloorInput] = useState(false);
  const [reminderId, setReminderId] = useState(null);
  const [isInEmergencyMode, setIsInEmergencyMode] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const recordingRef = useRef(null);

  // Step-by-step helpers
  const addStep = () => setSteps(prev => [...prev, '']);
  const removeStep = (index) => setSteps(prev => {
    if (index === 0) return prev; // Step 1 is permanent
    return prev.filter((_, i) => i !== index);
  });
  const updateStep = (index, value) => setSteps(prev => { const s = [...prev]; s[index] = value; return s; });

  const handleVoiceNotePress = async () => {
    if (isProcessingVoice) return;
    if (isRecordingVoice) {
      try {
        setIsProcessingVoice(true);
        const base64 = await stopRecordingWithBase64(recordingRef.current);
        recordingRef.current = null;
        setIsRecordingVoice(false);
        const result = await submitVoiceNoteForSteps(base64);
        if (result.message) {
          Alert.alert('', result.message);
          return;
        }
        if (result.steps && result.steps.length > 0) {
          setSteps(result.steps);
        }
      } catch (e) {
        setIsRecordingVoice(false);
        recordingRef.current = null;
        Alert.alert('Error', e.message || 'Voice note failed.');
      } finally {
        setIsProcessingVoice(false);
      }
      return;
    }
    try {
      const recording = await startVoiceRecording();
      recordingRef.current = recording;
      setIsRecordingVoice(true);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not start recording.');
    }
  };

  useEffect(() => {
    checkMode();
    if (isEditing && utility) {
      loadUtilityData();
    }
  }, []);

  // Default location to property position when creating new utility
  useEffect(() => {
    if (isEditing || locationCoords) return;
    let cancelled = false;
    const loadDefaultLocation = async () => {
      let finalPropertyId = propertyId || utility?.propertyId;
      if (!finalPropertyId) {
        const properties = await getProperties();
        if (Array.isArray(properties) && properties.length > 0) {
          finalPropertyId = properties[0].id;
        }
      }
      if (!finalPropertyId) return;
      const property = await getProperty(finalPropertyId);
      if (!property || cancelled) return;
      if (property.latitude != null && property.longitude != null) {
        setLocationCoords({ latitude: property.latitude, longitude: property.longitude });
        setLocation(`${property.latitude.toFixed(6)}, ${property.longitude.toFixed(6)}`);
      } else if (property.address) {
        const coords = await geocodeAddress(property.address);
        if (!cancelled && coords) {
          setLocationCoords(coords);
          setLocation(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
        }
      }
    };
    loadDefaultLocation();
    return () => { cancelled = true; };
  }, [isEditing, propertyId]);

  const checkMode = async () => {
    const inEmergency = await isEmergencyMode();
    setIsInEmergencyMode(inEmergency);
    if (inEmergency) {
      Alert.alert('Emergency Mode', 'Utility records cannot be created or edited in Emergency Mode.');
      navigation.goBack();
    }
  };

  useEffect(() => {
    // Auto-scroll to current year when year picker is shown
    if (showYearPicker && yearPickerScrollRef.current) {
      const currentDate = new Date(calendarMonth);
      const currentYear = currentDate.getFullYear();
      const todayYear = new Date().getFullYear();
      const currentYearIndex = currentYear - (todayYear - 1);
      const itemHeight = 50;
      
      setTimeout(() => {
        if (yearPickerScrollRef.current) {
          yearPickerScrollRef.current.scrollTo({
            y: Math.max(0, currentYearIndex * itemHeight - 100),
            animated: true,
          });
        }
      }, 100);
    }
  }, [showYearPicker, calendarMonth]);

  useEffect(() => {
    // Auto-scroll to current hour and minute when time picker is shown
    if (showTimePicker) {
      const timeToUse = maintenanceTime || new Date();
      const currentHour = timeToUse.getHours();
      const currentMinute = timeToUse.getMinutes();
      const itemHeight = 36;
      
      const roundedMinute = Math.round(currentMinute / 5) * 5;
      const minuteIndex = roundedMinute / 5;
      
      setTimeout(() => {
        if (hourPickerScrollRef.current) {
          hourPickerScrollRef.current.scrollToOffset({
            offset: currentHour * itemHeight,
            animated: false,
          });
        }
        if (minutePickerScrollRef.current) {
          minutePickerScrollRef.current.scrollToOffset({
            offset: minuteIndex * itemHeight,
            animated: false,
          });
          if (!maintenanceTime || roundedMinute !== currentMinute) {
            const newTime = maintenanceTime ? new Date(maintenanceTime) : new Date();
            newTime.setMinutes(roundedMinute);
            setMaintenanceTime(newTime);
          }
        }
      }, 200);
    }
  }, [showTimePicker]);

  const loadUtilityData = async () => {
    const allUtilities = await getAllUtilitiesRaw();
    const data = allUtilities.find(u => u.id === utility.id);
    if (data) {
      setTitle(data.title || '');
      setUtilityIcon(data.utilityIcon || null);
      setDescription(data.description || '');
      const loadedSteps = (data.description || '').split('\n').map(s => s.trim()).filter(s => s.length > 0);
      setSteps(loadedSteps.length > 0 ? loadedSteps : ['', '']);
      setLocation(data.location || '');
      if (data.latitude && data.longitude) {
        setLocationCoords({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      } else if (data.location) {
        const coordsMatch = data.location.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
        if (coordsMatch) {
          setLocationCoords({
            latitude: parseFloat(coordsMatch[1]),
            longitude: parseFloat(coordsMatch[2]),
          });
        }
      }
      setFloor(data.floor || '');
      setPhotos(data.photos || []);
      const videosData = data.videos || [];
      setVideos(videosData.map(v => typeof v === 'string' ? { uri: v, thumbnailUri: v } : v));
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

  const pickImage = async () => {
    try {
      let ImagePicker = null;
      try {
        ImagePicker = require('expo-image-picker');
      } catch (e) {
        console.log('expo-image-picker not available');
      }

      Alert.alert(
        'Select Photo',
        'Choose how you want to add a photo',
        [
          {
            text: 'Camera',
            onPress: async () => {
              if (!ImagePicker) {
                Alert.alert('Error', 'Camera functionality is not available.');
                return;
              }
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Camera permission is required to take photos');
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                copyToCacheDirectory: true,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                setPhotos([...photos, result.assets[0].uri]);
              }
            },
          },
          {
            text: 'Photo Library',
            onPress: async () => {
              if (!ImagePicker) {
                Alert.alert('Error', 'Photo library functionality is not available.');
                return;
              }
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Photo library permission is required');
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                copyToCacheDirectory: true,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                setPhotos([...photos, result.assets[0].uri]);
              }
            },
          },
          {
            text: 'File Picker',
            onPress: async () => {
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
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickVideo = async () => {
    try {
      let ImagePicker = null;
      try {
        ImagePicker = require('expo-image-picker');
      } catch (e) {
        console.log('expo-image-picker not available');
      }

      Alert.alert(
        'Select Video',
        'Choose how you want to add a video',
        [
          {
            text: 'Camera',
            onPress: async () => {
              if (!ImagePicker) {
                Alert.alert('Error', 'Camera functionality is not available.');
                return;
              }
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Camera permission is required to record videos');
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                quality: 0.8,
                videoMaxDuration: 60,
                copyToCacheDirectory: true,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setVideos([...videos, {
                  uri: asset.uri,
                  thumbnailUri: asset.thumbnailUri || asset.uri,
                }]);
              }
            },
          },
          {
            text: 'Video Library',
            onPress: async () => {
              if (!ImagePicker) {
                Alert.alert('Error', 'Video library functionality is not available.');
                return;
              }
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Video library permission is required');
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                quality: 0.8,
                videoMaxDuration: 60,
                copyToCacheDirectory: true,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setVideos([...videos, {
                  uri: asset.uri,
                  thumbnailUri: asset.thumbnailUri || asset.uri,
                }]);
              }
            },
          },
          {
            text: 'File Picker',
            onPress: async () => {
              try {
                const result = await DocumentPicker.getDocumentAsync({
                  type: 'video/*',
                  copyToCacheDirectory: true,
                });
                if (!result.canceled && result.assets && result.assets.length > 0) {
                  const asset = result.assets[0];
                  setVideos([...videos, {
                    uri: asset.uri,
                    thumbnailUri: asset.uri,
                  }]);
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to pick video');
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
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
    if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      navigation.goBack();
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleAddContact = () => {
    setNewContactName('');
    setNewContactPhone('');
    setShowAddContactModal(true);
  };

  const handleConfirmAddContact = () => {
    const name = newContactName.trim();
    const phone = newContactPhone.trim();
    if (name || phone) {
      setContacts(prev => [...prev, { name: name || 'Unknown', phone: phone || '' }]);
    }
    setShowAddContactModal(false);
    setNewContactName('');
    setNewContactPhone('');
  };

  const handleSave = async () => {
    if (isInEmergencyMode) {
      Alert.alert('Emergency Mode', 'Cannot save utility records in Emergency Mode.');
      return;
    }

    let finalPropertyId = propertyId || (isEditing && utility?.propertyId) || null;
    if (!isEditing && !finalPropertyId) {
      const properties = await getProperties();
      if (Array.isArray(properties) && properties.length > 0) {
        finalPropertyId = properties[0].id;
      }
    }
    if (!isEditing && !finalPropertyId) {
      Alert.alert('Error', 'Property is required. Please add a property first (Properties tab), or add this utility from a property\'s detail screen.');
      return;
    }

    const utilityId = isEditing ? utility.id : Date.now().toString();
    
    const utilityData = {
      id: utilityId,
      // Step 2 information
      title: title.trim(),
      utilityIcon: utilityIcon || null,
      description: steps.map(s => s.trim()).filter(s => s.length > 0).join('\n'),
      location: location.trim(),
      latitude: locationCoords?.latitude || null,
      longitude: locationCoords?.longitude || null,
      floor: floor.trim(),
      photos: photos || [],
      videos: videos.map(v => typeof v === 'object' && v.uri ? v : { uri: v, thumbnailUri: v }),
      // Step 3 information
      maintenanceDate: maintenanceDate ? maintenanceDate.toISOString() : null,
      maintenanceTime: maintenanceTime ? maintenanceTime.toISOString() : null,
      notes: notes.trim(),
      contacts: contacts || [],
      propertyId: finalPropertyId,
      createdAt: isEditing ? utility.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('[AddEditUtility] Saving utility with propertyId:', finalPropertyId);
    
    try {
      await saveUtility(utilityData);
      console.log('[AddEditUtility] ✅ Utility saved successfully');

      // Create or update reminder if maintenance date/time is set (Step 3)
      if (maintenanceDate && maintenanceTime) {
        const reminderIdToUse = reminderId || `reminder-${Date.now()}`;
        const reminderDate = new Date(maintenanceDate);
        reminderDate.setHours(maintenanceTime.getHours());
        reminderDate.setMinutes(maintenanceTime.getMinutes());
        reminderDate.setSeconds(0);
        reminderDate.setMilliseconds(0);
        
        const reminder = {
          id: reminderIdToUse,
          utilityId: utilityId,
          title: `Utility Maintenance`,
          description: `Maintenance reminder for utility${location ? ` at ${location}` : ''}`,
          date: reminderDate.toISOString(),
          notes: notes.trim(),
          contacts: contacts || [],
          icon: 'build-outline',
          completed: false,
          type: 'utility',
        };

        await saveReminder(reminder);
        console.log('[AddEditUtility] ✅ Reminder saved successfully');
        
        utilityData.reminderId = reminderIdToUse;
        await saveUtility(utilityData);
      } else if (reminderId) {
        await deleteReminder(reminderId);
        utilityData.reminderId = null;
        await saveUtility(utilityData);
      }

      Alert.alert('Success', 'Utility saved successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('[AddEditUtility] Error saving utility:', error);
      let errorMsg = 'Failed to save utility.';
      if (error.message && error.message.includes('Network')) {
        errorMsg = 'Network error: Unable to save. Check your connection.';
      } else if (error.message && error.message.includes('API_UNAVAILABLE')) {
        errorMsg = 'Server unavailable: Saved locally only.';
      }
      Alert.alert('Error', errorMsg);
    }
  };

  // Calendar and Time Picker functions (same as shutoff)
  const renderCustomCalendar = () => {
    const currentDate = new Date(calendarMonth);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const dateToUse = maintenanceDate || new Date();
    const selectedYear = dateToUse.getFullYear();
    const selectedMonth = dateToUse.getMonth();
    const selectedDay = dateToUse.getDate();
    
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    while (days.length >= 7) {
      const last7Days = days.slice(-7);
      if (last7Days.every(day => day === null)) {
        days.splice(-7, 7);
      } else {
        break;
      }
    }
    
    const completeRows = Math.floor(days.length / 7);
    const cellsInLastRow = days.length % 7;
    
    if (cellsInLastRow > 0) {
      const lastRowStart = completeRows * 7;
      const lastRow = days.slice(lastRowStart);
      while (lastRow.length > 0 && lastRow[lastRow.length - 1] === null) {
        lastRow.pop();
        days.pop();
      }
    }
    
    const handleDateSelect = (day) => {
      if (day) {
        const newDate = new Date(year, month, day);
        // Set time to 9am when date is selected
        newDate.setHours(9, 0, 0, 0);
        setMaintenanceDate(newDate);
        // Also set maintenanceTime to 9am
        setMaintenanceTime(new Date(newDate));
        setShowCustomCalendar(false);
      }
    };
    
    const handleMonthSelect = (selectedMonthIndex) => {
      setCalendarMonth(new Date(year, selectedMonthIndex, 1));
      setShowMonthPicker(false);
    };
    
    const handleYearSelect = (selectedYearValue) => {
      setCalendarMonth(new Date(selectedYearValue, month, 1));
      setShowYearPicker(false);
    };
    
    const goToPreviousMonth = () => {
      setCalendarMonth(new Date(year, month - 1, 1));
    };
    
    const goToNextMonth = () => {
      setCalendarMonth(new Date(year, month + 1, 1));
    };
    
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 1; i <= currentYear + 3; i++) {
      years.push(i);
    }
    
    if (showMonthPicker) {
      return (
        <View style={styles.customCalendar}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => setShowMonthPicker(false)} style={styles.calendarNavButton}>
              <Ionicons name="chevron-back" size={20} color="#333" />
            </TouchableOpacity>
            <Text style={styles.calendarMonthText} numberOfLines={1}>
              Select Month
            </Text>
            <View style={styles.calendarNavButton} />
          </View>
          
          <FlatList
            data={monthNames.map((name, index) => ({ name, index }))}
            numColumns={3}
            scrollEnabled={false}
            keyExtractor={(item) => `month-${item.index}`}
            renderItem={({ item: { name: monthName, index } }) => {
              const isLastRow = index >= 9;
              return (
                <TouchableOpacity
                  style={[
                    styles.monthPickerItem,
                    month === index && styles.monthPickerItemSelected,
                    isLastRow && styles.monthPickerItemLastRow,
                  ]}
                  onPress={() => handleMonthSelect(index)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.monthPickerItemText,
                    month === index && styles.monthPickerItemTextSelected,
                  ]}>
                    {monthName.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.monthPickerGrid}
          />
        </View>
      );
    }
    
    if (showYearPicker) {
      return (
        <View style={styles.customCalendar}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => setShowYearPicker(false)} style={styles.calendarNavButton}>
              <Ionicons name="chevron-back" size={20} color="#333" />
            </TouchableOpacity>
            <Text style={styles.calendarMonthText} numberOfLines={1}>
              Select Year
            </Text>
            <View style={styles.calendarNavButton} />
          </View>
          
          <ScrollView 
            ref={yearPickerScrollRef}
            style={styles.yearPickerScroll}
            contentContainerStyle={styles.yearPickerContent}
            showsVerticalScrollIndicator={true}
          >
            {years.map((yearValue) => (
              <TouchableOpacity
                key={yearValue}
                style={[
                  styles.yearPickerItem,
                  year === yearValue && styles.yearPickerItemSelected,
                ]}
                onPress={() => handleYearSelect(yearValue)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.yearPickerItemText,
                  year === yearValue && styles.yearPickerItemTextSelected,
                ]}>
                  {yearValue}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      );
    }
    
    return (
      <View style={styles.customCalendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.calendarNavButton}>
            <Ionicons name="chevron-back" size={20} color="#333" />
          </TouchableOpacity>
          <View style={styles.calendarHeaderCenter}>
            <TouchableOpacity onPress={() => setShowMonthPicker(true)} activeOpacity={0.7}>
              <Text style={styles.calendarMonthText} numberOfLines={1}>
                {currentDate.toLocaleDateString('en-US', { month: 'long' })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowYearPicker(true)} activeOpacity={0.7}>
              <Text style={styles.calendarYearText} numberOfLines={1}>
                {year}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={goToNextMonth} style={styles.calendarNavButton}>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.calendarWeekDays}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.calendarWeekDay}>
              <Text style={styles.calendarWeekDayText} numberOfLines={1}>{day}</Text>
            </View>
          ))}
        </View>
        
        <FlatList
          data={days}
          numColumns={7}
          scrollEnabled={false}
          keyExtractor={(item, index) => `day-${index}`}
          renderItem={({ item: day, index }) => {
            const isSelected = day && year === selectedYear && month === selectedMonth && day === selectedDay;
            const isToday = day && new Date().toDateString() === new Date(year, month, day).toDateString();
            const isLastRow = index >= Math.floor((days.length - 1) / 7) * 7;
            
            return (
              <TouchableOpacity
                style={[
                  styles.calendarDay,
                  !day && styles.calendarDayEmpty,
                  isSelected && styles.calendarDaySelected,
                  isToday && !isSelected && styles.calendarDayToday,
                  !day && { aspectRatio: undefined },
                  isLastRow && styles.calendarDayLastRow,
                ]}
                onPress={() => handleDateSelect(day)}
                disabled={!day}
                activeOpacity={0.7}
              >
                {day && (
                  <Text style={[
                    styles.calendarDayText,
                    isSelected && styles.calendarDayTextSelected,
                    isToday && !isSelected && styles.calendarDayTextToday,
                  ]}>
                    {day}
                  </Text>
                )}
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.calendarGrid}
        />
      </View>
    );
  };

  const renderCustomTimePicker = () => {
    const timeToUse = maintenanceTime || new Date();
    const currentHour = timeToUse.getHours();
    const currentMinute = timeToUse.getMinutes();
    
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i);
    }
    
    const minutes = [];
    for (let i = 0; i < 60; i += 5) {
      minutes.push(i);
    }
    
    const handleHourSelect = (hour) => {
      const newTime = maintenanceTime ? new Date(maintenanceTime) : new Date();
      newTime.setHours(hour);
      setMaintenanceTime(newTime);
    };
    
    const handleMinuteSelect = (minute) => {
      const newTime = maintenanceTime ? new Date(maintenanceTime) : new Date();
      newTime.setMinutes(minute);
      setMaintenanceTime(newTime);
    };
    
    return (
      <View style={styles.customTimePicker}>
        <View style={styles.timePickerHeader}>
          <View style={styles.timePickerCloseButton} />
          <Text style={styles.timePickerTitle}>Select Time</Text>
          <TouchableOpacity
            style={styles.timePickerCloseButton}
            onPress={() => setShowTimePicker(false)}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.timePickerContent}>
          <View style={styles.timePickerColumn}>
            <Text style={styles.timePickerLabel}>Hour</Text>
            <View style={styles.timePickerWheelContainer}>
              <View style={styles.timePickerWheelMaskTop} />
              <FlatList
                ref={hourPickerScrollRef}
                data={hours}
                keyExtractor={(item) => `hour-${item}`}
                renderItem={({ item: hour }) => (
                  <View style={styles.timePickerWheelItem}>
                    <Text style={[
                      styles.timePickerWheelItemText,
                      currentHour === hour && styles.timePickerWheelItemTextSelected,
                    ]}>
                      {hour.toString().padStart(2, '0')}
                    </Text>
                  </View>
                )}
                style={styles.timePickerWheel}
                contentContainerStyle={styles.timePickerWheelContent}
                showsVerticalScrollIndicator={false}
                snapToInterval={36}
                decelerationRate="fast"
                onMomentumScrollEnd={(event) => {
                  const y = event.nativeEvent.contentOffset.y;
                  const selectedIndex = Math.round(y / 36);
                  if (selectedIndex >= 0 && selectedIndex < hours.length) {
                    handleHourSelect(hours[selectedIndex]);
                  }
                }}
                getItemLayout={(data, index) => ({
                  length: 36,
                  offset: 36 * index,
                  index,
                })}
              />
              <View style={styles.timePickerWheelMaskBottom} />
            </View>
          </View>
          
          <View style={styles.timePickerColumn}>
            <Text style={styles.timePickerLabel}>Minute</Text>
            <View style={styles.timePickerWheelContainer}>
              <View style={styles.timePickerWheelMaskTop} />
              <FlatList
                ref={minutePickerScrollRef}
                data={minutes}
                keyExtractor={(item) => `minute-${item}`}
                renderItem={({ item: minute }) => (
                  <View style={styles.timePickerWheelItem}>
                    <Text style={[
                      styles.timePickerWheelItemText,
                      currentMinute === minute && styles.timePickerWheelItemTextSelected,
                    ]}>
                      {minute.toString().padStart(2, '0')}
                    </Text>
                  </View>
                )}
                style={styles.timePickerWheel}
                contentContainerStyle={styles.timePickerWheelContent}
                showsVerticalScrollIndicator={false}
                snapToInterval={36}
                decelerationRate="fast"
                onMomentumScrollEnd={(event) => {
                  const y = event.nativeEvent.contentOffset.y;
                  const selectedIndex = Math.round(y / 36);
                  if (selectedIndex >= 0 && selectedIndex < minutes.length) {
                    handleMinuteSelect(minutes[selectedIndex]);
                  }
                }}
                getItemLayout={(data, index) => ({
                  length: 36,
                  offset: 36 * index,
                  index,
                })}
              />
              <View style={styles.timePickerWheelMaskBottom} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderStep2 = () => {
    return (
      <View style={styles.stepContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.stepContent}
          contentContainerStyle={styles.step2ContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Progress Indicator with Title */}
          <View style={styles.progressIndicatorContainer}>
            <Text style={styles.progressTitle}>Utility</Text>
            <Text style={styles.progressSubtitle}>Enter details for this utility</Text>
          </View>

          {/* Title + Icon Row */}
          <View style={styles.titleRow}>
            <TouchableOpacity
              style={styles.iconPickerButton}
              onPress={() => setShowIconPicker(!showIconPicker)}
              activeOpacity={0.7}
            >
              {utilityIcon ? (
                <Ionicons name={utilityIcon} size={26} color="#1095EE" />
              ) : (
                <Ionicons name="add" size={26} color="#AEAEB2" />
              )}
            </TouchableOpacity>
            <View style={[styles.inputRect, styles.titleInput]}>
              <TextInput
                style={[styles.textInput, { textAlignVertical: 'center' }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Title"
                placeholderTextColor="#999"
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            </View>
          </View>

          {/* Icon Picker */}
          {showIconPicker && (
            <View style={styles.iconPickerPanel}>
              {[
                { name: 'flame', label: 'Gas' },
                { name: 'water', label: 'Water' },
                { name: 'flash', label: 'Electric' },
                { name: 'thermometer', label: 'Heating' },
                { name: 'snow', label: 'Cooling' },
                { name: 'wifi', label: 'Internet' },
                { name: 'bulb', label: 'Lighting' },
                { name: 'leaf', label: 'Garden' },
                { name: 'construct', label: 'Plumbing' },
                { name: 'shield-checkmark', label: 'Security' },
                { name: 'tv', label: 'Cable' },
                { name: 'hammer', label: 'Tools' },
              ].map((icon) => (
                <TouchableOpacity
                  key={icon.name}
                  style={[
                    styles.iconPickerItem,
                    utilityIcon === icon.name && styles.iconPickerItemSelected,
                  ]}
                  onPress={() => {
                    setUtilityIcon(utilityIcon === icon.name ? null : icon.name);
                    setShowIconPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={icon.name}
                    size={24}
                    color={utilityIcon === icon.name ? '#1095EE' : '#555'}
                  />
                  <Text style={[
                    styles.iconPickerLabel,
                    utilityIcon === icon.name && styles.iconPickerLabelSelected,
                  ]}>
                    {icon.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Step-by-step instructions */}
          <Text style={styles.sectionTitle}>How to locate it</Text>
          <View style={styles.stepsSection}>
            {steps.map((stepText, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={[styles.inputRect, styles.stepInput]}>
                  <TextInput
                    style={[styles.textInput, { textAlignVertical: 'center' }]}
                    value={stepText}
                    onChangeText={(val) => updateStep(index, val)}
                    placeholder={`Step ${index + 1}`}
                    placeholderTextColor="#999"
                    returnKeyType="done"
                    blurOnSubmit={true}
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                </View>
                {index > 0 && (
                  <TouchableOpacity onPress={() => removeStep(index)} style={styles.stepDeleteButton}>
                    <Ionicons name="close-circle" size={22} color="#ccc" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addStepButton} onPress={addStep}>
              <Ionicons name="add-circle-outline" size={20} color="#1095EE" />
              <Text style={styles.addStepText}>Add step</Text>
            </TouchableOpacity>
          </View>

          {/* Voice Note Button */}
          <View style={styles.voiceNoteContainer}>
            <TouchableOpacity
              style={styles.voiceNoteButton}
              onPress={handleVoiceNotePress}
              disabled={isProcessingVoice}
              activeOpacity={0.7}
            >
              {isProcessingVoice ? (
                <ActivityIndicator size="small" color="#1095EE" />
              ) : (
                <Ionicons name={isRecordingVoice ? 'stop-circle' : 'mic'} size={28} color="#1095EE" />
              )}
            </TouchableOpacity>
            <Text style={styles.voiceNoteHint}>
              {isProcessingVoice
                ? 'Processing…'
                : isRecordingVoice
                  ? 'Tap to stop recording'
                  : "Record a voice note about the location & usage — we'll fill the steps for you."}
            </Text>
          </View>

          {/* Location and Floor Row */}
          <View style={styles.formSection}>
            <View style={styles.sectionRow}>
              {/* Location */}
              <View style={styles.sectionHalf}>
                <Text style={styles.sectionTitle}>Location</Text>
                <TouchableOpacity 
                  style={styles.locationButton}
                  onPress={() => {
                    navigation.navigate('MapPicker', {
                      initialLocation: locationCoords,
                      onConfirm: (selectedLocation) => {
                        if (selectedLocation && selectedLocation.latitude && selectedLocation.longitude) {
                          setLocationCoords({
                            latitude: selectedLocation.latitude,
                            longitude: selectedLocation.longitude,
                          });
                          setLocation(`${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`);
                        }
                      },
                    });
                  }}
                  activeOpacity={0.7}
                >
                  {locationCoords ? (
                    <Image
                      source={{ uri: getMapThumbnailUrl(locationCoords.latitude, locationCoords.longitude) }}
                      style={styles.locationThumbnail}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.locationMapPlaceholder}>
                      <Ionicons name="location" size={40} color="#1095EE" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Floor */}
              <View style={styles.sectionHalf}>
                <Text style={styles.sectionTitle}>Floor</Text>
                <View style={styles.floorSelect}>
                  {showFloorInput ? (
                    <View style={styles.floorInputContainer}>
                      <TextInput
                        style={styles.floorInput}
                        value={floor}
                        onChangeText={setFloor}
                        placeholder="Enter floor..."
                        placeholderTextColor="#999"
                        autoFocus
                        textTransform="uppercase"
                        returnKeyType="done"
                        blurOnSubmit={true}
                        onSubmitEditing={() => Keyboard.dismiss()}
                      />
                      <TouchableOpacity
                        style={styles.floorInputClose}
                        onPress={() => {
                          setShowFloorInput(false);
                          if (!floor) {
                            setFloor('');
                          }
                        }}
                      >
                        <Ionicons name="checkmark" size={20} color="#1095EE" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.floorSelectButton}
                        onPress={() => setShowFloorDropdown(!showFloorDropdown)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.floorSelectText, !floor && styles.floorSelectTextPlaceholder]}>
                          {floor ? floor.toUpperCase() : 'Select floor...'}
                        </Text>
                        <Ionicons 
                          name={showFloorDropdown ? "chevron-up" : "chevron-down"} 
                          size={20} 
                          color="#000" 
                        />
                      </TouchableOpacity>
                      {showFloorDropdown && (
                        <View style={styles.floorDropdownList}>
                          {['B', '1', '2'].map((floorOption) => (
                            <TouchableOpacity
                              key={floorOption}
                              style={[
                                styles.floorDropdownItem,
                                floor === floorOption && styles.floorDropdownItemSelected,
                              ]}
                              onPress={() => {
                                setFloor(floorOption);
                                setShowFloorDropdown(false);
                              }}
                            >
                              <Text style={[
                                styles.floorDropdownItemText,
                                floor === floorOption && styles.floorDropdownItemTextSelected,
                              ]}>
                                {floorOption}
                              </Text>
                            </TouchableOpacity>
                          ))}
                          <TouchableOpacity
                            style={styles.floorDropdownItem}
                            onPress={() => {
                              setShowFloorDropdown(false);
                              setShowFloorInput(true);
                            }}
                          >
                            <Text style={styles.floorDropdownItemText}>...</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Photo/Video Section */}
          <View style={styles.photoSection}>
            <Text style={styles.sectionTitle}>Photo/Video</Text>
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
              {videos.map((video, index) => {
                const videoUri = typeof video === 'string' ? video : video.uri;
                const thumbnailUri = typeof video === 'object' && video.thumbnailUri ? video.thumbnailUri : videoUri;
                return (
                  <View key={`video-${index}`} style={styles.mediaItem}>
                    {thumbnailUri ? (
                      <Image 
                        source={{ uri: thumbnailUri }} 
                        style={styles.mediaImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.videoPlaceholder}>
                        <Ionicons name="videocam" size={30} color="#999" />
                      </View>
                    )}
                    <View style={styles.videoPlayOverlay}>
                      <Ionicons name="play-circle" size={30} color="#fff" />
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeVideo(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                );
              })}
              {photos.length + videos.length < 4 && (
                <>
                  <TouchableOpacity style={styles.addMediaButton} onPress={pickImage}>
                    <Ionicons name="image-outline" size={30} color="#AEAEB2" />
                    <Text style={styles.addMediaText}>Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addMediaButton} onPress={pickVideo}>
                    <Ionicons name="videocam-outline" size={30} color="#AEAEB2" />
                    <Text style={styles.addMediaText}>Video</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Continue button at end of page */}
          <View style={styles.continueButtonContainer}>
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderStep3 = () => {
    return (
      <View style={styles.stepContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.stepContent}
          contentContainerStyle={styles.step2ContentContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Progress Indicator with Title */}
          <View style={styles.progressIndicatorContainer}>
            <Text style={styles.progressTitle}>Utility</Text>
            <Text style={styles.progressSubtitle}>Enter details for this utility</Text>
          </View>

          <View style={styles.maintenanceSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Maintenance Reminder</Text>
            <TouchableOpacity
              style={[styles.resetButton, !maintenanceDate && styles.resetButtonHidden]}
              onPress={() => {
                if (maintenanceDate) {
                  setMaintenanceDate(null);
                  setMaintenanceTime(null);
                  setNotes('');
                }
              }}
              activeOpacity={0.7}
              disabled={!maintenanceDate}
            >
              <Text style={styles.resetButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.optionalLabel}>Optional</Text>
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeInput}>
              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => {
                  // If date is null, set to current date with 9am
                  if (!maintenanceDate) {
                    const newDate = new Date();
                    newDate.setHours(9, 0, 0, 0);
                    setMaintenanceDate(newDate);
                    setMaintenanceTime(new Date(newDate));
                  }
                  setShowCustomCalendar(!showCustomCalendar);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.pickerButtonContent}>
                  <Ionicons name="calendar-outline" size={20} color="#1095EE" />
                  <Text style={styles.pickerButtonText}>
                    {maintenanceDate 
                      ? maintenanceDate.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Select date...'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.dateTimeInput}>
              <Text style={styles.inputLabel}>Time</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => {
                  if (!maintenanceTime) {
                    setMaintenanceTime(new Date());
                  }
                  setShowTimePicker(true);
                }}
                activeOpacity={0.7}
                disabled={!maintenanceDate}
              >
                <View style={styles.pickerButtonContent}>
                  <Ionicons name="time-outline" size={20} color={maintenanceDate ? "#1095EE" : "#999"} />
                  <Text style={[styles.pickerButtonText, !maintenanceDate && styles.pickerButtonTextDisabled]}>
                    {maintenanceTime 
                      ? maintenanceTime.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Select time...'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.notesSquare}>
          <TextInput
            style={[styles.textInput, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Enter maintenance notes..."
            placeholderTextColor="#999"
            multiline
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Technician / Professional</Text>
          <Text style={styles.optionalLabel}>Optional</Text>
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
              {contacts.length > 0 ? (
                contacts.map((c, i) => (
                  <Text key={i} style={styles.dropdownItem}>
                    {c.name}{c.phone ? ` - ${c.phone}` : ''}
                  </Text>
                ))
              ) : (
                <Text style={styles.dropdownItem}>No contacts available</Text>
              )}
            </View>
          )}
          <TouchableOpacity style={styles.addContactButton} onPress={handleAddContact} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={24} color="#666" />
            <Text style={styles.addContactText}>Add Contact</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
        {/* Fixed Action Buttons */}
        <View style={[styles.fixedActionButtons, { paddingBottom: bottomPadding }]}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Save</Text>
            <Ionicons name="checkmark" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

      {/* Floating Calendar Overlay */}
      {showCustomCalendar && (
        <>
          <TouchableOpacity
            style={styles.calendarOverlay}
            activeOpacity={1}
            onPress={() => setShowCustomCalendar(false)}
          />
          <View style={styles.calendarFloatingContainer}>
            {renderCustomCalendar()}
          </View>
        </>
      )}

      {/* Floating Time Picker Overlay */}
      {showTimePicker && (
        <>
          <TouchableOpacity
            style={styles.calendarOverlay}
            activeOpacity={1}
            onPress={() => setShowTimePicker(false)}
          />
          <View style={styles.timePickerFloatingContainer}>
            {renderCustomTimePicker()}
          </View>
        </>
      )}

      {/* Add Contact Modal */}
      <Modal
        visible={showAddContactModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowAddContactModal(false)}
          />
          <View style={styles.addContactModalContent}>
            <Text style={styles.addContactModalTitle}>Add Contact</Text>
            <TextInput
              style={styles.addContactInput}
              placeholder="Name"
              placeholderTextColor="#999"
              value={newContactName}
              onChangeText={setNewContactName}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <TextInput
              style={styles.addContactInput}
              placeholder="Phone number"
              placeholderTextColor="#999"
              value={newContactPhone}
              onChangeText={setNewContactPhone}
              keyboardType="phone-pad"
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <View style={styles.addContactModalButtons}>
              <TouchableOpacity
                style={styles.addContactCancelButton}
                onPress={() => setShowAddContactModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.addContactCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addContactConfirmButton}
                onPress={handleConfirmAddContact}
                activeOpacity={0.7}
              >
                <Text style={styles.addContactConfirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  stepContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
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
  stepContent: {
    flex: 1,
  },
  stepContentContainer: {
    padding: 20,
  },
  step2ContentContainer: {
    padding: 30,
    paddingTop: 20,
    paddingBottom: 120,
    flexGrow: 1,
  },
  continueButtonContainer: {
    alignItems: 'center',
    marginTop: 32,
    paddingBottom: 24,
  },
  progressIndicatorContainer: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 30,
  },
  stepsSection: {
    marginTop: 10,
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  stepInput: {
    flex: 1,
    marginBottom: 0,
    height: 48,
    paddingVertical: 0,
    justifyContent: 'center',
  },
  stepDeleteButton: {
    padding: 4,
    flexShrink: 0,
  },
  addStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    marginTop: 2,
    marginLeft: 36,
  },
  addStepText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  progressTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  progressSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: -4,
  },
  progressIndicator: {
    width: 289,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
  },
  inputRect: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  iconPickerButton: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  titleInput: {
    flex: 1,
    height: 52,
    marginBottom: 0,
    paddingVertical: 0,
    justifyContent: 'center',
  },
  iconPickerPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 16,
    gap: 6,
    ...shadows.card,
  },
  iconPickerItem: {
    width: '22%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  iconPickerItemSelected: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  iconPickerLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
  iconPickerLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  voiceNoteContainer: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
  },
  voiceNoteButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  voiceNoteHint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 17,
  },
  textInput: {
    fontSize: 16,
    color: colors.text,
    minHeight: 40,
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formSection: {
    width: '100%',
    marginBottom: 35,
  },
  sectionRow: {
    flexDirection: 'row',
    gap: 26,
  },
  sectionHalf: {
    flex: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  locationButton: {
    aspectRatio: 220 / 152,
    borderRadius: 15,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  locationMapPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  floorSelect: {
    position: 'relative',
  },
  floorSelectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 40,
  },
  floorSelectText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  floorSelectTextPlaceholder: {
    color: colors.textMuted,
    fontWeight: '400',
    textTransform: 'none',
  },
  floorDropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    ...shadows.card,
  },
  floorDropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  floorDropdownItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  floorDropdownItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  floorDropdownItemTextSelected: {
    color: colors.primary,
  },
  floorInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    minHeight: 40,
  },
  floorInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  floorInputClose: {
    padding: 5,
  },
  photoSection: {
    gap: 12,
    marginBottom: 30,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: 14,
    backgroundColor: colors.background,
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
    backgroundColor: colors.borderLight,
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  addMediaButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  addMediaText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  fixedActionButtons: {
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 30,
    paddingBottom: 60,
    paddingTop: 16,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    height: 50,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
    borderRadius: 25,
    backgroundColor: '#30ACFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  maintenanceSection: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  optionalLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  dateTimeInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  pickerButton: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 50,
  },
  pickerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickerButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  pickerButtonTextDisabled: {
    color: colors.textMuted,
  },
  resetButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 12,
  },
  resetButtonHidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
  resetButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  notesSquare: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  contactSection: {
    marginBottom: 20,
  },
  contactDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactDropdownText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownList: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownItem: {
    padding: 10,
    fontSize: 15,
    color: colors.text,
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primary + '33',
  },
  addContactText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  addContactModalContent: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  addContactModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  addContactInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 14,
  },
  addContactModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  addContactCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  addContactCancelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  addContactConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  addContactConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  calendarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  calendarFloatingContainer: {
    position: 'absolute',
    top: '30%',
    left: 20,
    right: 20,
    zIndex: 1000,
    alignItems: 'center',
  },
  customCalendar: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingTop: 15,
    paddingHorizontal: 15,
    paddingBottom: 0,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.cardHover,
    width: '100%',
    maxWidth: 350,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  calendarHeaderCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  calendarNavButton: {
    padding: 5,
    minWidth: 30,
  },
  calendarMonthText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  calendarYearText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  calendarWeekDays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  calendarWeekDay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    minWidth: 0,
  },
  calendarWeekDayText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
  calendarGrid: {
    paddingBottom: 10,
  },
  calendarDay: {
    flex: 1,
    maxWidth: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 5,
  },
  calendarDayEmpty: {
    opacity: 0,
    marginBottom: 0,
    height: 0,
  },
  calendarDayLastRow: {
    marginBottom: 0,
  },
  calendarDaySelected: {
    backgroundColor: colors.primary,
  },
  calendarDayToday: {
    backgroundColor: colors.primaryLight,
  },
  calendarDayText: {
    fontSize: 14,
    color: colors.text,
  },
  calendarDayTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  calendarDayTextToday: {
    color: colors.primary,
    fontWeight: '600',
  },
  monthPickerGrid: {
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 10,
  },
  monthPickerItem: {
    flex: 1,
    maxWidth: '33.33%',
    aspectRatio: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    marginBottom: 8,
    marginHorizontal: '1%',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthPickerItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  monthPickerItemLastRow: {
    marginBottom: 0,
  },
  monthPickerItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  monthPickerItemTextSelected: {
    color: colors.white,
  },
  yearPickerScroll: {
    maxHeight: 300,
  },
  yearPickerContent: {
    paddingTop: 10,
    paddingBottom: 0,
  },
  yearPickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  yearPickerItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  yearPickerItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  yearPickerItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  timePickerFloatingContainer: {
    position: 'absolute',
    top: '30%',
    left: 20,
    right: 20,
    zIndex: 1000,
    alignItems: 'center',
  },
  customTimePicker: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingTop: 15,
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.cardHover,
    width: '100%',
    maxWidth: 350,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  timePickerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  timePickerCloseButton: {
    padding: 5,
  },
  timePickerContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 20,
  },
  timePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  timePickerWheelContainer: {
    height: 72,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  timePickerWheel: {
    flex: 1,
  },
  timePickerWheelContent: {
    paddingVertical: 18,
  },
  timePickerWheelItem: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerWheelItemText: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '400',
  },
  timePickerWheelItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 20,
  },
  timePickerWheelMaskTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1,
    pointerEvents: 'none',
  },
  timePickerWheelMaskBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1,
    pointerEvents: 'none',
  },
});
