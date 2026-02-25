import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { saveProperty, getPeople } from '../services/storage';
import { useOnboarding } from '../contexts/OnboardingContext';
import { geocodeAddress } from '../utils/geocode';

import { MAPBOX_ACCESS_TOKEN } from '../config/keys';

// Generate Mapbox Static Images API URL for map thumbnail
const getMapThumbnailUrl = (latitude, longitude, width = 400, height = 200, zoom = 15) => {
  if (!latitude || !longitude) return null;
  const styleId = 'mapbox/streets-v12';
  const markerColor = '30ACFF';
  return `https://api.mapbox.com/styles/v1/${styleId}/static/pin-s+${markerColor}(${longitude},${latitude})/${longitude},${latitude},${zoom}/${width}x${height}?access_token=${MAPBOX_ACCESS_TOKEN}`;
};

const PROPERTY_TYPES = [
  { id: 'single-family', label: 'Single family house', icon: 'home' },
  { id: 'townhouse', label: 'Townhouse', icon: 'business' },
  { id: 'condo', label: 'Condo', icon: 'layers' },
  { id: 'apartment', label: 'Apartment', icon: 'storefront' },
];

const MORE_PROPERTY_TYPES = [
  { id: 'duplex-triplex-fourplex', label: 'Duplex/Triplex/Fourplex', icon: 'albums' },
  { id: 'low-rise-apartment', label: 'Low-rise Apartment', icon: 'storefront' },
  { id: 'high-rise-apartment', label: 'High-rise Apartment', icon: 'business' },
  { id: 'villa', label: 'Villa', icon: 'home' },
  { id: 'condo', label: 'Condo', icon: 'layers' },
];

export default function AddPropertyScreen({ route }) {
  const navigation = useNavigation();
  const onboarding = useOnboarding();
  const { property, initialStep, onboardingMode } = route?.params || {};
  const isEditing = !!property;
  
  const [step, setStep] = useState(initialStep || 1);
  const [propertyType, setPropertyType] = useState(property?.propertyType || '');
  const [address, setAddress] = useState(property?.address || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('USA');
  const [imageUri, setImageUri] = useState(property?.imageUri || null);
  const [people, setPeople] = useState([]);
  const [moreOptionsPressed, setMoreOptionsPressed] = useState(false);
  const [isCompletePressed, setIsCompletePressed] = useState(false);
  const [pressedPropertyType, setPressedPropertyType] = useState(null);
  const [cameFromMoreOptions, setCameFromMoreOptions] = useState(false);
  const [location, setLocation] = useState(
    property?.latitude && property?.longitude
      ? { latitude: property.latitude, longitude: property.longitude }
      : null
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const geocodeTimeoutRef = useRef(null);
  const [isPropertyTypeDropdownOpen, setIsPropertyTypeDropdownOpen] = useState(false);

  // When the user enters a complete address, geocode and autolocate the pin on the map
  useEffect(() => {
    const line1 = (addressLine1 || '').trim();
    const cityVal = (city || '').trim();
    const stateVal = (state || '').trim();
    const zipVal = (zipCode || '').trim();
    if (!line1 || !cityVal || !stateVal || !zipVal) return;

    if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
    geocodeTimeoutRef.current = setTimeout(async () => {
      const fullAddress = [line1, addressLine2.trim(), cityVal, `${stateVal} ${zipVal}`, (country || '').trim()].filter(Boolean).join(', ');
      setIsGeocoding(true);
      const coords = await geocodeAddress(fullAddress, MAPBOX_ACCESS_TOKEN);
      setIsGeocoding(false);
      if (coords) setLocation(coords);
      geocodeTimeoutRef.current = null;
    }, 600);

    return () => {
      if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
    };
  }, [addressLine1, addressLine2, city, state, zipCode, country]);

  // Sync step when entering edit mode with initialStep (e.g. from Property Detail)
  useEffect(() => {
    const stepFromParams = route?.params?.initialStep;
    if (route?.params?.property && stepFromParams != null && stepFromParams >= 1 && stepFromParams <= 4) {
      setStep(stepFromParams);
    }
  }, [route?.params?.property?.id, route?.params?.initialStep]);

  useFocusEffect(
    React.useCallback(() => {
      const params = route?.params || {};
      const prop = params.property;
      const stepParam = params.initialStep;

      if (prop?.id) {
        loadPeople();
      }
      // Initialize address fields if editing (use latest params so we don't rely on stale closure)
      if (prop) {
        if (stepParam != null && stepParam >= 1 && stepParam <= 4) {
          setStep(stepParam);
        }
        // Prefer structured address fields if available
        if (prop.addressLine1) {
          setAddressLine1(prop.addressLine1 || '');
          setAddressLine2(prop.addressLine2 || '');
          setCity(prop.city || '');
          setState(prop.state || '');
          setZipCode(prop.zipCode || '');
          setCountry(prop.country || 'USA');
        } else if (prop.address && (step === 3 || prop.city || prop.state || prop.zipCode || prop.zip)) {
          setAddressLine1(prop.address || '');
          setAddressLine2(prop.addressLine2 || '');
          setCity(prop.city || '');
          setState(prop.state || '');
          setZipCode(prop.zipCode || prop.zip || '');
          setCountry(prop.country || 'USA');
        } else if (prop.address) {
          const addressParts = prop.address.split(', ');
          if (addressParts.length >= 3) {
            setAddressLine1(addressParts[0] || '');
            setAddressLine2(addressParts[1] || '');
            setCity(addressParts[2] || '');
            if (addressParts.length >= 4) {
              const stateZip = addressParts[3].split(' ');
              setState(stateZip[0] || '');
              setZipCode(stateZip[1] || '');
            }
            if (addressParts.length >= 5) {
              setCountry(addressParts[4] || 'USA');
            }
          }
        }
        if (prop.propertyType) {
          let normalizedType = prop.propertyType;
          if (normalizedType === 'house') normalizedType = 'single-family';
          if (normalizedType === 'mobile') normalizedType = 'single-family';
          setPropertyType(normalizedType);
        }
        if (prop?.latitude != null && prop?.longitude != null) {
          setLocation({ latitude: prop.latitude, longitude: prop.longitude });
        }
        if (prop.imageUri != null) {
          setImageUri(prop.imageUri);
        }
      }

      const selectedLocation = params.selectedLocation;
      if (selectedLocation) {
        setLocation(selectedLocation);
        navigation.setParams({ selectedLocation: undefined });
      }
    }, [route?.params?.property?.id, route?.params?.property?.address, route?.params?.property?.latitude, route?.params?.property?.longitude, route?.params?.initialStep, route?.params?.selectedLocation, step, navigation])
  );

  const loadPeople = async () => {
    if (property?.id) {
      const allPeople = await getPeople();
      const propertyPeople = allPeople.filter(p => p.propertyId === property.id);
      setPeople(propertyPeople);
    }
  };

  const pickImage = async () => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo',
      [
        {
          text: 'Camera',
          onPress: async () => {
            try {
              // Request camera permissions
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Camera permission is required to take photos');
                return;
              }

              // Launch camera
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });

              if (!result.canceled && result.assets && result.assets.length > 0) {
                // Get the local URI (file:// or content://)
                const uri = result.assets[0].uri;
                console.log('[AddProperty] Camera image URI:', uri);
                setImageUri(uri);
              }
            } catch (error) {
              console.error('[AddProperty] Camera error:', error);
              Alert.alert('Error', 'Failed to take photo');
            }
          },
        },
        {
          text: 'Photo Library',
          onPress: async () => {
            try {
              // Request media library permissions
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Photo library permission is required');
                return;
              }

              // Launch image picker
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });

              if (!result.canceled && result.assets && result.assets.length > 0) {
                // Get the local URI (file:// or content://)
                const uri = result.assets[0].uri;
                console.log('[AddProperty] Image picker URI:', uri);
                setImageUri(uri);
              }
            } catch (error) {
              console.error('[AddProperty] Image picker error:', error);
              Alert.alert('Error', 'Failed to pick image');
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
                // Get the local URI (file:// or content://)
                const uri = result.assets[0].uri;
                console.log('[AddProperty] Document picker URI:', uri);
                setImageUri(uri);
              }
            } catch (error) {
              console.error('[AddProperty] Document picker error:', error);
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
  };

  const handlePropertyTypePressIn = (type) => {
    setPressedPropertyType(type);
  };

  const handlePropertyTypePressOut = () => {
    setPressedPropertyType(null);
  };

  const handlePropertyTypeSelect = (type) => {
    setPropertyType(type);
    setCameFromMoreOptions(false);
    // Show visual feedback
    setPressedPropertyType(type);
    // Add a short delay to let user see the blue selection state change
    setTimeout(() => {
      setStep(3);
      setPressedPropertyType(null);
    }, 300); // 300ms delay - very short but enough to see the visual feedback
  };

  const handleMorePropertyTypeSelect = (type) => {
    setPropertyType(type);
    setCameFromMoreOptions(true);
    setPressedPropertyType(type);
    setTimeout(() => {
      setStep(3);
      setPressedPropertyType(null);
    }, 300);
  };

  const handleAddressSubmit = () => {
    // Validate required fields
    if (addressLine1.trim() && city.trim() && state.trim() && zipCode.trim()) {
      // Combine address fields into a single address string
      const fullAddress = [
        addressLine1.trim(),
        addressLine2.trim(),
        city.trim(),
        `${state.trim()} ${zipCode.trim()}`,
        country.trim()
      ].filter(Boolean).join(', ');
      setAddress(fullAddress);
      setStep(4);
    }
  };

  const handleLocationConfirm = (selectedLocation) => {
    setLocation(selectedLocation);
  };

  const handleMapPress = () => {
    navigation.navigate('MapPicker', {
      initialLocation: location,
      address: address || `${addressLine1}, ${city}, ${state} ${zipCode}`,
      onConfirm: handleLocationConfirm,
    });
  };


  const handleCompletePressIn = () => {
    setIsCompletePressed(true);
  };

  const handleCompletePressOut = () => {
    setIsCompletePressed(false);
  };

  const handleSave = async () => {
    // Validate required address fields
    if (!addressLine1.trim() || !city.trim() || !state.trim() || !zipCode.trim()) {
      Alert.alert('Error', 'Please complete all required address fields');
      return;
    }

    // Show visual feedback
    setIsCompletePressed(true);

    // Combine address for display purposes
    const fullAddress = [
      addressLine1.trim(),
      addressLine2.trim(),
      city.trim(),
      `${state.trim()} ${zipCode.trim()}`,
      country.trim()
    ].filter(Boolean).join(', ');

    const propertyData = {
      id: isEditing ? property.id : Date.now().toString(),
      // Store combined address for backward compatibility
      address: fullAddress,
      // Store individual address fields for structured data
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || null,
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      country: country.trim() || 'USA',
      propertyType,
      // Store image URI (local file:// or content:// URI)
      imageUri: imageUri || null,
      // Store location coordinates
      latitude: location?.latitude || null,
      longitude: location?.longitude || null,
      createdAt: isEditing ? property.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('[AddProperty] Saving property with imageUri:', imageUri ? 'Yes' : 'No');
    if (imageUri) {
      console.log('[AddProperty] Image URI format:', imageUri.substring(0, Math.min(50, imageUri.length)) + (imageUri.length > 50 ? '...' : ''));
    }

    // Short delay to show blue feedback
    setTimeout(async () => {
      try {
        await saveProperty(propertyData);

        if (onboardingMode && onboarding?.completeOnboarding) {
          // Stay in onboarding stack and show Success; Success will call completeOnboarding on "Go home"
          navigation.navigate('Success', {
            address: fullAddress,
            addressLine1: addressLine1.trim(),
            onboardingMode: true,
          });
          return;
        }

        // Navigate to Success screen instead of showing alert
        navigation.navigate('Success', {
          address: fullAddress,
          addressLine1: addressLine1.trim(),
        });
      } catch (error) {
        console.error('[AddProperty] Error saving property:', error);
        Alert.alert('Error', 'Failed to save property');
        setIsCompletePressed(false);
      }
    }, 200); // Very short delay (200ms)
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Add your property</Text>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.propertyTypesScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.propertyTypesContainer}>
          {PROPERTY_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.propertyTypeOption,
                propertyType === type.id && styles.propertyTypeOptionSelected,
                pressedPropertyType === type.id && styles.propertyTypeOptionPressed
              ]}
              onPress={() => handlePropertyTypeSelect(type.id)}
              onPressIn={() => handlePropertyTypePressIn(type.id)}
              onPressOut={handlePropertyTypePressOut}
              activeOpacity={0.8}
            >
              <View style={styles.propertyIconContainer}>
                <Ionicons 
                  name={type.icon} 
                  size={60} 
                  color={pressedPropertyType === type.id ? "#fff" : (propertyType === type.id ? "#1095EE" : "#999")} 
                />
              </View>
              <Text style={[
                styles.propertyLabel,
                propertyType === type.id && styles.propertyLabelSelected,
                pressedPropertyType === type.id && styles.propertyLabelPressed
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={[
            styles.moreOptionsButton,
            moreOptionsPressed && styles.moreOptionsButtonPressed
          ]}
          onPress={() => {
            setMoreOptionsPressed(true);
            // Add a short delay to let user see the blue selection state change
            setTimeout(() => {
              setStep(2); // More options page
              setMoreOptionsPressed(false);
            }, 300); // 300ms delay - same as property type selection
          }}
        >
          <Text style={[
            styles.moreOptionsButtonText,
            moreOptionsPressed && styles.moreOptionsButtonTextPressed
          ]}>
            More options
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Add your property</Text>
      <Text style={styles.stepSubtitle}>More property types</Text>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.propertyTypesScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.propertyTypesContainer}>
          {MORE_PROPERTY_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.propertyTypeOption,
                propertyType === type.id && styles.propertyTypeOptionSelected,
                pressedPropertyType === type.id && styles.propertyTypeOptionPressed
              ]}
              onPress={() => handleMorePropertyTypeSelect(type.id)}
              onPressIn={() => handlePropertyTypePressIn(type.id)}
              onPressOut={handlePropertyTypePressOut}
              activeOpacity={0.8}
            >
              <View style={styles.propertyIconContainer}>
                <Ionicons 
                  name={type.icon} 
                  size={60} 
                  color={pressedPropertyType === type.id ? "#fff" : (propertyType === type.id ? "#1095EE" : "#999")} 
                />
              </View>
              <Text style={[
                styles.propertyLabel,
                propertyType === type.id && styles.propertyLabelSelected,
                pressedPropertyType === type.id && styles.propertyLabelPressed
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderStep3 = () => {
    const isFormValid = addressLine1.trim() && city.trim() && state.trim() && zipCode.trim();
    const selectedType = PROPERTY_TYPES.find((t) => t.id === propertyType);
    
    return (
      <ScrollView 
        style={styles.stepContainer}
        contentContainerStyle={styles.step2Content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepTitle}>Add your property</Text>
        
        <View style={styles.addressForm}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Property type</Text>
            <TouchableOpacity
              style={styles.dropdown}
              activeOpacity={0.8}
              onPress={() => setIsPropertyTypeDropdownOpen((open) => !open)}
            >
              <Text style={styles.dropdownText}>
                {selectedType ? selectedType.label : 'Select property type'}
              </Text>
              <Ionicons
                name={isPropertyTypeDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#8E8E93"
              />
            </TouchableOpacity>
            {isPropertyTypeDropdownOpen && (
              <View style={styles.dropdownOptionsContainer}>
                {PROPERTY_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.dropdownOption,
                      propertyType === type.id && styles.dropdownOptionSelected,
                    ]}
                    onPress={() => {
                      setPropertyType(type.id);
                      setIsPropertyTypeDropdownOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        propertyType === type.id && styles.dropdownOptionTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.addressForm}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Address line 1<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.addressInput}
              value={addressLine1}
              onChangeText={setAddressLine1}
              placeholder="Enter street address"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address line 2 (optional)</Text>
            <TextInput
              style={styles.addressInput}
              value={addressLine2}
              onChangeText={setAddressLine2}
              placeholder="Apartment, suite, etc."
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              City<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.addressInput}
              value={city}
              onChangeText={setCity}
              placeholder="Enter city"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.inputGroup, styles.formRowItem]}>
              <Text style={styles.inputLabel}>
                State<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.addressInput}
                value={state}
                onChangeText={setState}
                placeholder="State"
                placeholderTextColor="#8E8E93"
              />
            </View>
            <View style={[styles.inputGroup, styles.formRowItem]}>
              <Text style={styles.inputLabel}>
                Zip Code<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.addressInput}
                value={zipCode}
                onChangeText={setZipCode}
                placeholder="12345"
                placeholderTextColor="#8E8E93"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Country<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.addressInput}
              value={country}
              onChangeText={setCountry}
              placeholder="Country"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity 
              style={[styles.continueButton, !isFormValid && styles.continueButtonDisabled]}
              onPress={handleAddressSubmit}
              disabled={!isFormValid}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderStep4 = () => {
    // Build the secondary address line (addressLine2, city, state, zipCode - no country)
    const secondaryAddressParts = [
      addressLine2.trim(),
      city.trim(),
      state.trim(),
      zipCode.trim()
    ].filter(Boolean);
    const secondaryAddress = secondaryAddressParts.join(', ');

    return (
      <ScrollView style={styles.stepContainer} contentContainerStyle={styles.step3Content}>
        <View style={styles.addressHeader}>
          <Text style={styles.addressTitle}>{addressLine1.trim() || 'Address'}</Text>
          {secondaryAddress ? (
            <Text style={styles.addressSubtitle}>{secondaryAddress}</Text>
          ) : null}
        </View>
        
        <View style={styles.mapSection}>
          <Text style={styles.sectionLabel}>Map</Text>
          <TouchableOpacity 
            style={styles.mapPlaceholder}
            onPress={handleMapPress}
            activeOpacity={0.7}
            disabled={isGeocoding}
          >
            {isGeocoding ? (
              <View style={styles.mapGeocodingContainer}>
                <ActivityIndicator size="large" color="#30ACFF" />
                <Text style={styles.mapPlaceholderText}>Locating address…</Text>
              </View>
            ) : location ? (
              <View style={styles.mapThumbnailContainer}>
                <Image
                  source={{ uri: getMapThumbnailUrl(location.latitude, location.longitude) }}
                  style={styles.mapThumbnail}
                  resizeMode="cover"
                />
                <View style={styles.mapOverlay}>
                  <View style={styles.mapOverlayContent}>
                    <Ionicons name="location" size={20} color="#30ACFF" />
                    <Text style={styles.mapOverlayText}>
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </Text>
                  </View>
                  <Text style={styles.mapOverlayHint}>Tap to change location</Text>
                </View>
              </View>
            ) : (
              <>
                <Ionicons name="location-outline" size={80} color="#ccc" />
                <Text style={styles.mapPlaceholderText}>Enter address above or tap to select location</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.photoSection}>
          <Text style={styles.sectionLabel}>Photo</Text>
          <TouchableOpacity style={styles.photoUploadBox} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
            ) : (
              <Ionicons name="add" size={32} color="#999" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.peopleSection}>
          <Text style={styles.sectionLabel}>People</Text>
          {people.map((person, index) => (
            <View key={index} style={styles.personItem}>
              <View style={styles.personAvatar}>
                <Ionicons name="person" size={24} color="#999" />
              </View>
              <Text style={styles.personName}>{person.name || 'Person'}</Text>
            </View>
          ))}
          <TouchableOpacity 
            style={styles.addPersonButton}
            onPress={() => navigation.navigate('AddPerson')}
          >
            <View style={styles.personInputPlaceholder} />
            <TouchableOpacity style={styles.addIconButton}>
              <Ionicons name="add-circle-outline" size={28} color="#999" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[
            styles.completeButton,
            isCompletePressed && styles.completeButtonActive
          ]} 
          onPress={handleSave}
          onPressIn={handleCompletePressIn}
          onPressOut={handleCompletePressOut}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={24} color="#fff" />
          <Text style={styles.completeButtonText}>Done</Text>
        </TouchableOpacity>
    </ScrollView>
    );
  };

  const handleBack = () => {
    if (step > 1) {
      if (step === 3) {
        setStep(cameFromMoreOptions ? 2 : 1);
      } else if (step === 4) {
        setStep(3);
      } else {
        setStep(step - 1);
      }
    } else {
      if (onboardingMode && onboarding?.goBackToWelcome) {
        onboarding.goBackToWelcome();
      } else {
        navigation.goBack();
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dwell Secure</Text>
        <View style={{ width: 28 }} />
      </View>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
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
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  stepContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 20,
  },
  addressFormScroll: {
    flex: 1,
  },
  addressFormContent: {
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  addressHeader: {
    marginBottom: 16,
  },
  addressTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  addressSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  divider: {
    height: 2,
    backgroundColor: '#E8E8E8',
    marginBottom: 30,
  },
  propertyTypesContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    gap: 27,
  },
  propertyTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
    padding: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  propertyTypeOptionSelected: {
    backgroundColor: '#E1F3FF',
    borderColor: '#92C3E4',
  },
  propertyTypeOptionPressed: {
    backgroundColor: '#30ACFF',
    borderColor: '#30ACFF',
    transform: [{ scale: 0.98 }],
  },
  propertyIconContainer: {
    // Icon container styling handled inline
  },
  propertyLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6B6B6B',
    flex: 1,
  },
  propertyLabelSelected: {
    color: '#1095EE',
  },
  propertyLabelPressed: {
    color: '#fff',
  },
  actionSection: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  propertyTypesScrollContent: {
    flexGrow: 1,
  },
  moreOptionsButton: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  moreOptionsButtonPressed: {
    backgroundColor: '#E1F3FF',
    borderColor: '#92C3E4',
    borderWidth: 1,
  },
  moreOptionsButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  moreOptionsButtonTextPressed: {
    color: '#1095EE',
  },
  step2Content: {
    paddingBottom: 40,
  },
  addressForm: {
    paddingTop: 10,
    gap: 20,
  },
  inputGroup: {
    width: '100%',
    gap: 8,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1E1E',
  },
  required: {
    color: '#D75757',
    marginLeft: 4,
  },
  addressInput: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    backgroundColor: '#F2F2F7',
    fontSize: 16,
    color: '#1E1E1E',
  },
  addressInputFocused: {
    borderColor: '#30ACFF',
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  formRowItem: {
    flex: 1,
  },
  formActions: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    marginTop: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    backgroundColor: '#F2F2F7',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1E1E1E',
    flex: 1,
    marginRight: 8,
  },
  dropdownOptionsContainer: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7C7CC',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  dropdownOptionSelected: {
    backgroundColor: '#E1F3FF',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#1E1E1E',
  },
  dropdownOptionTextSelected: {
    color: '#1095EE',
    fontWeight: '600',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#30ACFF',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: 180,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  continueButtonDisabled: {
    backgroundColor: '#C7C7CC',
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  arrow: {
    fontSize: 24,
    color: '#fff',
    marginLeft: 6,
  },
  step3Content: {
    paddingBottom: 100,
  },
  mapSection: {
    marginBottom: 30,
  },
  mapPlaceholder: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 15,
    height: 200,
    position: 'relative',
  },
  mapGeocodingContainer: {
    flex: 1,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  mapThumbnailContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  mapThumbnail: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  mapOverlayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    gap: 6,
  },
  mapOverlayText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  mapOverlayHint: {
    fontSize: 10,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
  },
  photoSection: {
    marginBottom: 30,
  },
  photoUploadBox: {
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    marginTop: 15,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  peopleSection: {
    marginBottom: 30,
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  personName: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  addPersonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  personInputPlaceholder: {
    flex: 1,
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginRight: 10,
  },
  addIconButton: {
    padding: 5,
  },
  sectionLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  completeButton: {
    backgroundColor: '#A8A8A8',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignSelf: 'center',
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completeButtonActive: {
    backgroundColor: '#30ACFF',
    transform: [{ scale: 0.98 }],
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
