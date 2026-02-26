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
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { saveUtility, getUtility, saveReminder, deleteReminder, getAllUtilitiesRaw, getProperties, getProperty } from '../services/storage';
import { isEmergencyMode } from '../services/modeService';
import { geocodeAddress } from '../utils/geocode';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ2Fha3Vtb3JhIiwiYSI6ImNtbDY0M2NvZTBiOGYzY29jNGRmdGFzdXkifQ.wg1qiR8XJsRxOKVIVKMYmQ';

// Generate Mapbox Static Images API URL for map thumbnail (satellite style)
const getMapThumbnailUrl = (latitude, longitude, width = 220, height = 152, zoom = 17) => {
  if (!latitude || !longitude) return null;
  // Use satellite-streets style to match MapPicker; pin-l for larger marker
  const styleId = 'mapbox/satellite-streets-v12';
  const markerColor = '1095EE'; // Blue color matching location button
  return `https://api.mapbox.com/styles/v1/${styleId}/static/pin-l+${markerColor}(${longitude},${latitude})/${longitude},${latitude},${zoom}/${width}x${height}?access_token=${MAPBOX_TOKEN}`;
};

export default function AddEditUtilityScreen({ route, navigation }) {
  const { utility, propertyId, presetDescription } = route.params || {};
  const isEditing = !!utility;

  const [step, setStep] = useState(2); // Start from step 2
  const [description, setDescription] = useState('');
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
        const coords = await geocodeAddress(property.address, MAPBOX_TOKEN);
        if (!cancelled && coords) {
          setLocationCoords(coords);
          setLocation(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
        }
      }
    };
    loadDefaultLocation();
    return () => { cancelled = true; };
  }, [isEditing, propertyId]);

  useEffect(() => {
    if (!isEditing && presetDescription && !description) {
      setDescription(String(presetDescription));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetDescription, isEditing]);

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
      setDescription(data.description || '');
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
      description: description.trim(),
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
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <View style={{ width: 28 }} />
        </View>

        <ScrollView 
          style={styles.stepContent} 
          contentContainerStyle={styles.step2ContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Indicator with Title */}
          <View style={styles.progressIndicatorContainer}>
            <Text style={styles.progressTitle}>Enter utility</Text>
          </View>

          {/* Description Input */}
          <View style={styles.inputRect}>
            <TextInput
              style={[styles.textInput, styles.textInputMultiline]}
              value={description}
              onChangeText={setDescription}
              placeholder="Please describe how to find it..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
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

        </ScrollView>
        {/* Fixed Action Buttons */}
        <View style={styles.fixedActionButtons}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStep3 = () => {
    return (
      <View style={styles.stepContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.stepContent} contentContainerStyle={styles.step2ContentContainer}>
          {/* Progress Indicator with Title */}
          <View style={styles.progressIndicatorContainer}>
            <Text style={styles.progressTitle}>Enter utility</Text>
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
                }
              }}
              activeOpacity={0.7}
              disabled={!maintenanceDate}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
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
          />
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact</Text>
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
        <View style={styles.fixedActionButtons}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
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
            />
            <TextInput
              style={styles.addContactInput}
              placeholder="Phone number"
              placeholderTextColor="#999"
              value={newContactPhone}
              onChangeText={setNewContactPhone}
              keyboardType="phone-pad"
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
    <View style={styles.container}>
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </View>
  );
}

// Copy all styles from AddEditShutoffScreen
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
  progressIndicatorContainer: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 30,
  },
  progressTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E1E1E',
    textAlign: 'center',
  },
  inputRect: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 35,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  locationButton: {
    aspectRatio: 220 / 152,
    borderRadius: 15,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1095EE',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 40,
  },
  floorSelectText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  floorSelectTextPlaceholder: {
    color: '#999',
    fontWeight: '400',
    textTransform: 'none',
  },
  floorDropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  floorDropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  floorDropdownItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  floorDropdownItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  floorDropdownItemTextSelected: {
    color: '#1095EE',
  },
  floorInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 15,
    minHeight: 40,
  },
  floorInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
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
  actionButtons: {
    flexDirection: 'column',
    gap: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    marginTop: 40,
    marginBottom: 20,
  },
  fixedActionButtons: {
    flexDirection: 'column',
    gap: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 30,
    paddingBottom: 80,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  continueButton: {
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
    elevation: 4,
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
    color: '#999',
    marginTop: 4,
    marginBottom: 15,
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
    color: '#333',
    marginBottom: 8,
  },
  pickerButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 50,
  },
  pickerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  pickerButtonTextDisabled: {
    color: '#999',
  },
  resetButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
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
    color: '#666',
    fontWeight: '500',
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  addContactModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 20,
  },
  addContactInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  addContactModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  addContactCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  addContactCancelText: {
    fontSize: 16,
    color: '#666',
  },
  addContactConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1095EE',
    alignItems: 'center',
  },
  addContactConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
  calendarDayLastRow: {
    marginBottom: 0,
  },
  calendarDaySelected: {
    backgroundColor: '#1095EE',
  },
  calendarDayToday: {
    backgroundColor: '#E1F3FF',
  },
  calendarDayText: {
    fontSize: 14,
    color: '#333',
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
