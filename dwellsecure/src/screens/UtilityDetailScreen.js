import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getUtility, saveUtility, deleteUtility, getReminders, saveReminder, deleteReminder } from '../services/storage';

import { getMapThumbnailUrl } from '../utils/mapStatic';

export default function UtilityDetailScreen({ route }) {
  const navigation = useNavigation();
  const { utilityId } = route.params || {};
  const isEditing = !!utilityId;

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]); // Array of { uri, thumbnailUri }
  const [maintenanceDate, setMaintenanceDate] = useState(null);
  const [maintenanceTime, setMaintenanceTime] = useState(null);
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const yearPickerScrollRef = useRef(null);
  const hourPickerScrollRef = useRef(null);
  const minutePickerScrollRef = useRef(null);
  const [markComplete, setMarkComplete] = useState(false);
  const [utility, setUtility] = useState(null);
  const [reminder, setReminder] = useState(null);
  const [locationCoords, setLocationCoords] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const [fullScreenImageUri, setFullScreenImageUri] = useState(null);

  useEffect(() => {
    if (isEditing) {
      loadUtilityData();
    }
  }, [utilityId]);

  // Refresh data when screen comes into focus (e.g., returning from AddEdit or Reminders page)
  useFocusEffect(
    React.useCallback(() => {
      if (isEditing && utilityId) {
        loadUtilityData(); // Reload full data including photos/videos
      }
    }, [utilityId, isEditing])
  );

  const loadUtilityData = async () => {
    const data = await getUtility(utilityId);
    if (data) {
      setUtility(data);
      setName(data.name || data.description || '');
      setLocation(data.location || '');
      
      // Load photos and videos
      setPhotos(data.photos || []);
      // Handle videos - convert old format (array of strings) to new format (array of objects)
      const videosData = data.videos || [];
      setVideos(videosData.map(v => typeof v === 'string' ? { uri: v, thumbnailUri: v } : v));
      
      // Load location coordinates
      if (data.locationCoords) {
        setLocationCoords(data.locationCoords);
      } else if (data.latitude && data.longitude) {
        setLocationCoords({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
      
      // Load reminder data
      await loadReminderData();
    }
  };

  // Separate function to load reminder data (can be called independently)
  const loadReminderData = async () => {
    if (!utilityId) return;
    
    // Load reminder - find the latest reminder linked to this utility
    let reminderData = null;
    const allReminders = await getReminders();
    
    // Get current utility data to check reminderId
    const currentUtility = utility || await getUtility(utilityId);
    
    // First, try to find by reminderId if exists
    if (currentUtility?.reminderId) {
      reminderData = allReminders.find(r => r.id === currentUtility.reminderId);
    }
    
    // Find all reminders for this utility
    const utilityReminders = allReminders.filter(r => r.utilityId === utilityId);
    
    if (utilityReminders && utilityReminders.length > 0) {
      // Sort by updatedAt (or createdAt if updatedAt doesn't exist) to get the latest
      utilityReminders.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA; // Descending order (newest first)
      });
      
      // Use the latest reminder (first in sorted array)
      const latestReminder = utilityReminders[0];
      if (!reminderData || (latestReminder.updatedAt || latestReminder.createdAt) > (reminderData.updatedAt || reminderData.createdAt)) {
        reminderData = latestReminder;
      }
    }
    
    // Display the reminder regardless of completed status
    if (reminderData) {
      setReminder(reminderData);
      // Set markComplete based on reminder's completed status
      setMarkComplete(reminderData.completed === true);
      if (reminderData.date) {
        // Always show the reminder's date/time, even if completed
        const reminderDate = new Date(reminderData.date);
        setMaintenanceDate(reminderDate);
        setMaintenanceTime(reminderDate);
      }
      // If reminder exists but no date, keep current date/time if user is editing
    } else {
      // No reminder found - only clear if user hasn't set date/time locally
      setReminder(null);
      setMarkComplete(false);
      // Don't clear date/time if user has set them locally (they might be editing)
      // Only clear if there's truly no reminder and no local values
    }
  };

  const pickImage = async () => {
    try {
      // Try to import ImagePicker
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
      // Try to import ImagePicker
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
                const videoUri = result.assets[0].uri;
                setVideos([...videos, { uri: videoUri, thumbnailUri: videoUri }]);
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
                const videoUri = result.assets[0].uri;
                setVideos([...videos, { uri: videoUri, thumbnailUri: videoUri }]);
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
                  const videoUri = result.assets[0].uri;
                  setVideos([...videos, { uri: videoUri, thumbnailUri: videoUri }]);
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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for the utility');
      return;
    }

    const utilityData = {
      id: isEditing ? utilityId : Date.now().toString(),
      name: name.trim(),
      description: name.trim(),
      location: location.trim(),
      photos: photos,
      videos: videos,
      latitude: locationCoords?.latitude || null,
      longitude: locationCoords?.longitude || null,
      locationCoords: locationCoords,
      contact: utility?.contact || null,
      createdAt: isEditing ? utility?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      propertyId: utility?.propertyId || null,
    };

    await saveUtility(utilityData);
    
    // Handle reminder: create, update, or delete based on current state
    if (maintenanceDate && maintenanceTime) {
      // Create or update reminder with current date, time, and completed status
      try {
        const reminderDate = new Date(maintenanceDate);
        reminderDate.setHours(maintenanceTime.getHours());
        reminderDate.setMinutes(maintenanceTime.getMinutes());
        reminderDate.setSeconds(0);
        reminderDate.setMilliseconds(0);
        
        const reminderToSave = {
          ...(reminder || {}),
          id: reminder?.id || `reminder-${Date.now()}`,
          utilityId: utilityData.id,
          type: 'utility',
          date: reminderDate.toISOString(),
          completed: markComplete || false, // Use current markComplete state
          title: `Maintenance reminder for ${utilityData.name || 'utility'}`,
          description: `Maintenance reminder for ${utilityData.description || utilityData.name || 'utility'}`,
          contacts: reminder?.contacts || [],
          notes: reminder?.notes || '',
          createdAt: reminder?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await saveReminder(reminderToSave);
        setReminder(reminderToSave);
        utilityData.reminderId = reminderToSave.id;
        console.log('[UtilityDetail] Reminder saved/updated with completed:', markComplete);
      } catch (error) {
        console.error('[UtilityDetail] Error saving reminder:', error);
        Alert.alert('Error', 'Failed to save reminder');
      }
    } else if (reminder && reminder.id) {
      // If date/time cleared (reset), delete the reminder
      try {
        await deleteReminder(reminder.id);
        setReminder(null);
        setMarkComplete(false);
        console.log('[UtilityDetail] Reminder deleted (reset)');
      } catch (error) {
        console.error('[UtilityDetail] Error deleting reminder:', error);
        Alert.alert('Error', 'Failed to delete reminder');
      }
    } else if (reminder && reminder.id && !maintenanceDate && !maintenanceTime) {
      // If reminder exists but no date/time, delete it
      try {
        await deleteReminder(reminder.id);
        setReminder(null);
        setMarkComplete(false);
        console.log('[UtilityDetail] Reminder deleted (no date/time)');
      } catch (error) {
        console.error('[UtilityDetail] Error deleting reminder:', error);
      }
    }
    
    // Update local state
    setUtility(utilityData);
    Alert.alert('Success', 'Utility saved successfully', [
      { text: 'OK' }
    ]);
  };

  // Copy renderCustomCalendar and renderCustomTimePicker from ShutoffDetailScreen
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
        newDate.setHours(9, 0, 0, 0);
        setMaintenanceDate(newDate);
        setMaintenanceTime(new Date(newDate));
        setMarkComplete(false); // Reset to incomplete when date is selected
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
            <Text style={styles.calendarMonthText} numberOfLines={1}>Select Month</Text>
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
            <Text style={styles.calendarMonthText} numberOfLines={1}>Select Year</Text>
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
              <Text style={styles.calendarYearText} numberOfLines={1}>{year}</Text>
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
            onPress={() => {
              // When closing time picker, ensure markComplete is false if this is a new selection
              if (maintenanceDate && maintenanceTime) {
                setMarkComplete(false);
              }
              setShowTimePicker(false);
            }}
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

  // Get title: utility name
  const getTitle = () => utility?.name || 'Utility';

  const handleDelete = () => {
    Alert.alert(
      'Delete Utility',
      'Are you sure you want to delete this utility?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUtility(utilityId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete utility');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header with back button and delete */}
        <View style={styles.overviewHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerDeleteButton}>
            <Ionicons name="trash-outline" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.addressSection}>
          <Text style={styles.addressTitle}>{getTitle()}</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText} numberOfLines={3} ellipsizeMode="tail">
              {utility?.description || ''}
            </Text>
          </View>
        </View>

        {/* Utility Details */}
        <View style={styles.tabContent}>
          {/* Location and Photo/Video side by side */}
          <View style={styles.locationPhotoBlock}>
            <View style={styles.locationPhotoLabelsRow}>
              <View style={styles.locationLabelCell}><Text style={styles.sectionLabel}>Location</Text></View>
              <View style={styles.photoLabelCell}><Text style={styles.sectionLabel}>Photo/Video</Text></View>
            </View>
            <View style={styles.locationPhotoRow}>
              <View style={styles.locationSection}>
              <TouchableOpacity 
                style={styles.locationButton}
                onPress={() => {
                  // Navigate to map picker to edit pin location
                  navigation.navigate('MapPicker', {
                    initialLocation: locationCoords,
                    onConfirm: async (selectedLocation) => {
                      if (selectedLocation && selectedLocation.latitude && selectedLocation.longitude) {
                        const newLocationStr = `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`;
                        setLocationCoords({
                          latitude: selectedLocation.latitude,
                          longitude: selectedLocation.longitude,
                        });
                        setLocation(newLocationStr);
                        // Persist the updated pin location
                        try {
                          const utilityData = {
                            id: utilityId,
                            name: name.trim(),
                            description: (name || utility?.description || '').trim(),
                            location: newLocationStr,
                            photos: photos,
                            videos: videos,
                            latitude: selectedLocation.latitude,
                            longitude: selectedLocation.longitude,
                            locationCoords: { latitude: selectedLocation.latitude, longitude: selectedLocation.longitude },
                            contact: utility?.contact || null,
                            createdAt: utility?.createdAt || new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            propertyId: utility?.propertyId || null,
                          };
                          await saveUtility(utilityData);
                          setUtility(utilityData);
                        } catch (error) {
                          console.error('[UtilityDetail] Error saving pin location:', error);
                          Alert.alert('Error', 'Failed to save pin location. Please try again.');
                        }
                      }
                    },
                  });
                }}
                activeOpacity={0.7}
              >
                {locationCoords && locationCoords.latitude && locationCoords.longitude ? (
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

            <View style={styles.photoVideoSection}>
              <TouchableOpacity 
                style={styles.mediaContainer}
                onPress={() => { if (photos.length + videos.length > 0) setShowMediaModal(true); }}
                activeOpacity={0.7}
              >
                <View style={styles.mediaThumbnailGrid}>
                  {(() => {
                    const items = [
                      ...photos.map(uri => ({ uri, isVideo: false })),
                      ...videos.map(v => ({
                        uri: typeof v === 'string' ? v : v.uri,
                        thumbnailUri: typeof v === 'object' && v.thumbnailUri ? v.thumbnailUri : (typeof v === 'string' ? v : v.uri),
                        isVideo: true,
                      })),
                    ];
                    return [0, 1, 2, 3].map((i) => {
                      const item = items[i];
                      return (
                        <View key={i} style={styles.mediaThumbnailCell}>
                          {item ? (
                            <>
                              <Image
                                source={{ uri: item.isVideo ? item.thumbnailUri : item.uri }}
                                style={styles.mediaThumbnailImage}
                                resizeMode="cover"
                              />
                              {item.isVideo && (
                                <View style={styles.mediaThumbnailPlayOverlay}>
                                  <Ionicons name="play-circle" size={16} color="#fff" />
                                </View>
                              )}
                            </>
                          ) : (
                            <View style={styles.mediaThumbnailPlaceholder}>
                              <Ionicons name="image-outline" size={16} color="#ccc" />
                            </View>
                          )}
                        </View>
                      );
                    });
                  })()}
                </View>
              </TouchableOpacity>
            </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.maintenanceSection}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Maintenance Reminder</Text>
              </View>
              <View style={styles.reminderSingleLine}>
                <Ionicons name="calendar-outline" size={20} color={maintenanceDate ? "#1095EE" : "#999"} />
                <Text style={[styles.reminderDateText, !maintenanceDate && styles.reminderDateTextDisabled]}>
                  {maintenanceDate && maintenanceTime
                    ? `${maintenanceDate.getFullYear()} - ${String(maintenanceDate.getMonth() + 1).padStart(2, '0')} - ${String(maintenanceDate.getDate()).padStart(2, '0')}  ${maintenanceTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                    : maintenanceDate
                      ? `${maintenanceDate.getFullYear()} - ${String(maintenanceDate.getMonth() + 1).padStart(2, '0')} - ${String(maintenanceDate.getDate()).padStart(2, '0')}`
                      : 'No date set'}
                </Text>
                {(maintenanceDate && maintenanceTime && reminder) && (
                  <TouchableOpacity
                    style={[styles.markCompleteInline, markComplete && styles.markCompleteButtonActive]}
                    onPress={async () => {
                      const newCompleteStatus = !markComplete;
                      setMarkComplete(newCompleteStatus);
                      try {
                        const reminderDate = new Date(maintenanceDate);
                        reminderDate.setHours(maintenanceTime.getHours(), maintenanceTime.getMinutes(), 0, 0);
                        const reminderToSave = {
                          ...reminder,
                          date: reminderDate.toISOString(),
                          completed: newCompleteStatus,
                          updatedAt: new Date().toISOString(),
                        };
                        await saveReminder(reminderToSave);
                        setReminder(reminderToSave);
                      } catch (error) {
                        console.error('[UtilityDetail] Error saving mark complete:', error);
                        setMarkComplete(!newCompleteStatus);
                        Alert.alert('Error', 'Failed to update reminder');
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    {markComplete && <Ionicons name="checkmark" size={16} color="#fff" />}
                    <Text style={[styles.markCompleteButtonText, markComplete && styles.markCompleteButtonTextActive]}>
                      Mark complete
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {reminder?.notes ? (
                <View style={styles.reminderNotesBox}>
                  <Text style={styles.reminderNotesText}>{reminder.notes}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Technician / Professional</Text>
            <View style={styles.contactCard}>
              <Ionicons name="person-circle-outline" size={24} color="#666" />
              <View style={styles.contactInfo}>
                {utility?.contact && (utility.contact.name || utility.contact.phone) ? (
                  <>
                    {utility.contact.name ? (
                      <Text style={styles.contactName}>{utility.contact.name}</Text>
                    ) : null}
                    {utility.contact.phone ? (
                      <Text style={styles.contactPhone}>{utility.contact.phone}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.contactNoContact}>No contact</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Edit Button */}
      <View style={styles.editButtonFixed}>
        <TouchableOpacity 
          style={styles.saveButtonIcon} 
          onPress={() => utility && navigation.navigate('AddEditUtility', { utility })}
        >
          <Ionicons name="pencil" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Media Modal */}
      <Modal
        visible={showMediaModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMediaModal(false)}
      >
        <View style={styles.mediaModalOverlay}>
          <View style={styles.mediaModalContent}>
            {/* Header */}
            <View style={styles.mediaModalHeader}>
              <Text style={styles.mediaModalTitle}>Photo/Video</Text>
              <TouchableOpacity onPress={() => setShowMediaModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.mediaModalScrollContainer} showsVerticalScrollIndicator={false}>
              {/* Photos Section */}
              {photos.length > 0 && (
                <View style={styles.mediaModalSection}>
                  <Text style={styles.mediaModalSectionTitle}>Photos</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaModalScroll}>
                    {photos.map((uri, index) => (
                      <View key={`modal-photo-${index}`} style={styles.mediaModalItem}>
                        <TouchableOpacity 
                          onPress={() => {
                            setFullScreenImageUri(uri);
                            setShowFullScreenImage(true);
                          }}
                          activeOpacity={0.9}
                        >
                          <Image source={{ uri }} style={styles.mediaModalImage} resizeMode="cover" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Videos Section */}
              {videos.length > 0 && (
                <View style={styles.mediaModalSection}>
                  <Text style={styles.mediaModalSectionTitle}>Videos</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaModalScroll}>
                    {videos.map((video, index) => {
                      const videoUri = typeof video === 'string' ? video : video.uri;
                      const thumbnailUri = typeof video === 'object' && video.thumbnailUri ? video.thumbnailUri : videoUri;
                      return (
                        <View key={`modal-video-${index}`} style={styles.mediaModalItem}>
                          <TouchableOpacity 
                            onPress={() => {
                              // TODO: Play video
                              Alert.alert('Video', `Playing video ${index + 1}`);
                            }}
                            activeOpacity={0.9}
                          >
                            {thumbnailUri ? (
                              <Image source={{ uri: thumbnailUri }} style={styles.mediaModalImage} resizeMode="cover" />
                            ) : (
                              <View style={styles.mediaModalVideoPlaceholder}>
                                <Ionicons name="videocam" size={40} color="#999" />
                              </View>
                            )}
                            <View style={styles.mediaModalVideoPlayOverlay}>
                              <Ionicons name="play-circle" size={40} color="#fff" />
                            </View>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Full Screen Image Modal */}
      <Modal
        visible={showFullScreenImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullScreenImage(false)}
      >
        <View style={styles.fullScreenImageOverlay}>
          <TouchableOpacity 
            style={styles.fullScreenImageCloseButton}
            onPress={() => setShowFullScreenImage(false)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          {fullScreenImageUri && (
            <Image 
              source={{ uri: fullScreenImageUri }} 
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

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
            onPress={() => {
              // When closing time picker, ensure markComplete is false if this is a new selection
              if (maintenanceDate && maintenanceTime) {
                setMarkComplete(false);
              }
              setShowTimePicker(false);
            }}
          />
          <View style={styles.timePickerFloatingContainer}>
            {renderCustomTimePicker()}
          </View>
        </>
      )}
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
  scrollContent: {
    paddingBottom: 215, // Space for fixed edit button (135 + 50) and bottom nav
  },
  // Header styles matching AddProperty/AddEditShutoff
  overviewHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerDeleteButton: {
    padding: 4,
  },
  // Address section
  addressSection: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  addressTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E1E1E',
    textAlign: 'center',
  },
  descriptionBox: {
    marginTop: 12,
    width: '100%',
    height: 80,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    paddingLeft: 20,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  descriptionText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'left',
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContentContainer: {
    paddingBottom: 100,
  },
  formSection: {
    marginTop: 15,
  },
  locationPhotoBlock: {
    marginTop: 15,
  },
  locationPhotoLabelsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  locationLabelCell: {
    flex: 1,
  },
  photoLabelCell: {
    flex: 1,
  },
  locationPhotoRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  locationSection: {
    flex: 1,
  },
  photoVideoSection: {
    flex: 1,
    marginTop: -8,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 12,
  },
  locationButton: {
    aspectRatio: 220 / 152,
    borderRadius: 15,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  locationHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
  },
  locationThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  locationMapPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaContainer: {
    borderRadius: 15,
    padding: 8,
    aspectRatio: 4 / 3,
    overflow: 'hidden',
  },
  mediaThumbnailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 4,
  },
  mediaThumbnailCell: {
    width: '48%',
    aspectRatio: 4 / 3,
    position: 'relative',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  mediaThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  mediaThumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaThumbnailPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 6,
  },
  maintenanceSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  optionalLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#999',
    marginTop: 4,
    marginBottom: 15,
  },
  resetButtonSquare: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  reminderActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  markCompleteButtonSquare: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
    minWidth: 120,
  },
  markCompleteButtonActive: {
    backgroundColor: '#1095EE',
    borderColor: '#1095EE',
  },
  markCompleteButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  markCompleteButtonTextActive: {
    color: '#fff',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 12,
  },
  dateTimeInput: {
    flex: 1,
  },
  pickerButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 50,
  },
  reminderSingleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  reminderDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E1E',
    flex: 1,
  },
  reminderDateTextDisabled: {
    color: '#999',
    fontWeight: '400',
  },
  markCompleteInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  reminderNotesBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  reminderNotesText: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
  },
  pickerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  pickerButtonTextDisabled: {
    color: '#999',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  contactNoContact: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  editButtonFixed: {
    position: 'absolute',
    bottom: 135,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonIcon: {
    width: 120,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#30ACFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignSelf: 'center',
    marginTop: 10,
  },
  // Media Modal styles
  mediaModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaModalContent: {
    width: '90%',
    height: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'column',
  },
  mediaModalScrollContainer: {
    flex: 1,
  },
  mediaModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  mediaModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  mediaModalSection: {
    marginBottom: 24,
  },
  mediaModalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 12,
  },
  mediaModalScroll: {
    flexDirection: 'row',
  },
  mediaModalItem: {
    width: 200,
    height: 200,
    marginRight: 12,
    position: 'relative',
  },
  mediaModalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  mediaModalVideoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaModalVideoPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },
  mediaModalRemoveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  mediaModalAddButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  mediaModalAddButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  mediaModalAddButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1095EE',
  },
  mediaModalAddButtonTextDisabled: {
    color: '#ccc',
  },
  // Full Screen Image
  fullScreenImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImageCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1001,
    padding: 10,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  // Calendar and Time Picker styles (from ShutoffDetailScreen)
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
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingTop: 15,
    paddingHorizontal: 15,
    paddingBottom: 0,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
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
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  calendarYearText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
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
    color: '#666',
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
  calendarDaySelected: {
    backgroundColor: '#1095EE',
  },
  calendarDayToday: {
    backgroundColor: '#E1F3FF',
  },
  calendarDayLastRow: {
    marginBottom: 0,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
  },
  calendarDayTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  calendarDayTextToday: {
    color: '#1095EE',
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
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: '1%',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  monthPickerItemSelected: {
    backgroundColor: '#1095EE',
    borderColor: '#1095EE',
  },
  monthPickerItemLastRow: {
    marginBottom: 0,
  },
  monthPickerItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  monthPickerItemTextSelected: {
    color: '#fff',
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
    borderBottomColor: '#F0F0F0',
  },
  yearPickerItemSelected: {
    backgroundColor: '#E1F3FF',
  },
  yearPickerItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  yearPickerItemTextSelected: {
    color: '#1095EE',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingTop: 15,
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
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
    color: '#333',
    textAlign: 'center',
  },
  timePickerCloseButton: {
    padding: 5,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#666',
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
    color: '#666',
    fontWeight: '400',
  },
  timePickerWheelItemTextSelected: {
    color: '#1095EE',
    fontWeight: '600',
    fontSize: 20,
  },
  timePickerWheelMaskTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  timePickerWheelMaskBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: '#fff',
    zIndex: 1,
  },
});
