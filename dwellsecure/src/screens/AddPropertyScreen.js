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
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows, BOTTOM_NAV_HEIGHT } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { saveProperty, getPeople } from '../services/storage';
import { useOnboarding } from '../contexts/OnboardingContext';
import { geocodeAddress } from '../utils/geocode';
import { uploadMedia } from '../services/mediaService';
import { getMapThumbnailUrl } from '../utils/mapStatic';
import { getMapboxToken, suggestAddresses } from '../utils/addressSuggest';

const PROPERTY_TYPES = [
  { id: 'single-family', label: 'Single family house', icon: 'home', description: 'Standalone home' },
  { id: 'townhouse', label: 'Townhouse', icon: 'business', description: 'Attached multi-floor home' },
  { id: 'condo', label: 'Condo', icon: 'layers', description: 'Privately owned unit' },
  { id: 'apartment', label: 'Apartment', icon: 'storefront', description: 'Rental unit in a building' },
  { id: 'duplex-triplex-fourplex', label: 'Duplex / Triplex', icon: 'albums', description: 'Multi-unit residential' },
  { id: 'mobile', label: 'Mobile Home', icon: 'bus', description: 'Manufactured or RV-style home' },
];

export default function AddPropertyScreen({ route }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const onboarding = useOnboarding();
  const { property, initialStep, onboardingMode } = route?.params || {};
  const bottomPadding = (insets.bottom || 0) + BOTTOM_NAV_HEIGHT;
  const isEditing = !!property;
  
  const [step, setStep] = useState(initialStep || 1);
  const [propertyId] = useState(property?.id || Date.now().toString());
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
  const [isCompletePressed, setIsCompletePressed] = useState(false);
  const [pressedPropertyType, setPressedPropertyType] = useState(null);
  const [location, setLocation] = useState(
    property?.latitude && property?.longitude
      ? { latitude: property.latitude, longitude: property.longitude }
      : null
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const geocodeTimeoutRef = useRef(null);
  const [isPropertyTypeDropdownOpen, setIsPropertyTypeDropdownOpen] = useState(false);
  const [mapboxToken, setMapboxToken] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressSuggestLoading, setAddressSuggestLoading] = useState(false);
  const addressSuggestTimeoutRef = useRef(null);
  const addressInputFocusedRef = useRef(false);

  // Fetch Mapbox token for address suggestions (existing backend /api/mapbox-token)
  useEffect(() => {
    let cancelled = false;
    getMapboxToken().then((t) => { if (!cancelled) setMapboxToken(t || ''); });
    return () => { cancelled = true; };
  }, []);

  // Address suggestions: debounced fetch when user types in address line 1
  useEffect(() => {
    const q = (addressLine1 || '').trim();
    if (addressSuggestTimeoutRef.current) clearTimeout(addressSuggestTimeoutRef.current);
    if (q.length < 2 || !mapboxToken) {
      setAddressSuggestions([]);
      return;
    }
    addressSuggestTimeoutRef.current = setTimeout(async () => {
      addressSuggestTimeoutRef.current = null;
      setAddressSuggestLoading(true);
      const list = await suggestAddresses(q, mapboxToken);
      setAddressSuggestions(list);
      setAddressSuggestLoading(false);
    }, 350);
    return () => {
      if (addressSuggestTimeoutRef.current) clearTimeout(addressSuggestTimeoutRef.current);
    };
  }, [addressLine1, mapboxToken]);

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
      const coords = await geocodeAddress(fullAddress);
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
        // Only sync step from params when it wouldn't move backward (e.g. user clicked Continue to step 4)
        if (stepParam != null && stepParam >= 1 && stepParam <= 4 && stepParam >= step) {
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
                const asset = result.assets[0];
                const uri = asset.uri;
                console.log('[AddProperty] Camera image URI:', uri);
                try {
                  const url = await uploadMedia({
                    uri,
                    path: `properties/${propertyId}/photos/${Date.now()}.jpg`,
                    contentType: asset.mimeType || 'image/jpeg',
                  });
                  setImageUri(url);
                } catch (e) {
                  Alert.alert('Upload failed', e.message || 'Could not upload photo.');
                  setImageUri(uri);
                }
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
                const asset = result.assets[0];
                const uri = asset.uri;
                console.log('[AddProperty] Image picker URI:', uri);
                try {
                  const url = await uploadMedia({
                    uri,
                    path: `properties/${propertyId}/photos/${Date.now()}.jpg`,
                    contentType: asset.mimeType || 'image/jpeg',
                  });
                  setImageUri(url);
                } catch (e) {
                  Alert.alert('Upload failed', e.message || 'Could not upload photo.');
                  setImageUri(uri);
                }
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
                const asset = result.assets[0];
                const uri = asset.uri;
                console.log('[AddProperty] Document picker URI:', uri);
                try {
                  const url = await uploadMedia({
                    uri,
                    path: `properties/${propertyId}/photos/${Date.now()}.jpg`,
                    contentType: asset.mimeType || 'image/jpeg',
                  });
                  setImageUri(url);
                } catch (e) {
                  Alert.alert('Upload failed', e.message || 'Could not upload photo.');
                  setImageUri(uri);
                }
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
    // Show visual feedback
    setPressedPropertyType(type);
    // Add a short delay to let user see the blue selection state change
    setTimeout(() => {
      setStep(3);
      setPressedPropertyType(null);
    }, 300); // 300ms delay - very short but enough to see the visual feedback
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

    const propertyIdToUse = isEditing ? property.id : propertyId;
    const propertyData = {
      id: propertyIdToUse,
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
      // Store image URI (Firebase Storage URL when available)
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
      <Text style={styles.stepTitle}>Select Your Property Type</Text>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.propertyTypesScrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.propertyTypeIntroCard}>
          <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
          <Text style={styles.propertyTypeIntroText}>Choose the option that best matches your home</Text>
        </View>
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
              <View style={[
                styles.propertyIconContainer,
                propertyType === type.id && styles.propertyIconContainerSelected,
              ]}>
                <Ionicons 
                  name={type.icon} 
                  size={34} 
                  color={pressedPropertyType === type.id ? colors.white : colors.primary} 
                />
              </View>
              <View style={styles.propertyLabelBlock}>
                <Text style={[
                  styles.propertyLabel,
                  propertyType === type.id && styles.propertyLabelSelected,
                  pressedPropertyType === type.id && styles.propertyLabelPressed
                ]}>
                  {type.label}
                </Text>
                <Text style={[
                  styles.propertyDescription,
                  pressedPropertyType === type.id && styles.propertyDescriptionPressed,
                ]}>
                  {type.description}
                </Text>
              </View>
              {propertyType === type.id ? (
                <View style={styles.propertySelectedBadge}>
                  <Ionicons name="checkmark" size={14} color={colors.primary} />
                </View>
              ) : null}
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
        contentContainerStyle={[styles.step2Content, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.stepTitle}>Enter address</Text>

        <View style={styles.addressForm}>
          <View style={styles.formSectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="home-outline" size={16} color={colors.primary} />
            </View>
            <Text style={styles.formSectionTitle}>Property type</Text>
          </View>
          <View style={styles.inputGroup}>
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
                color={colors.textMuted}
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
          <View style={styles.formSectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="map-outline" size={16} color={colors.primary} />
            </View>
            <Text style={styles.formSectionTitle}>Address</Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Address line 1<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.addressInput}
              value={addressLine1}
              onChangeText={setAddressLine1}
              onFocus={() => { addressInputFocusedRef.current = true; }}
              onBlur={() => {
                addressInputFocusedRef.current = false;
                setTimeout(() => setAddressSuggestions([]), 220);
              }}
              placeholder="Type address for suggestions"
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {addressSuggestLoading && addressSuggestions.length === 0 && (
              <View style={styles.suggestLoadingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.suggestLoadingText}>Searching…</Text>
              </View>
            )}
            {addressSuggestions.length > 0 && (
              <View style={styles.suggestDropdown}>
                {addressSuggestions.map((sug, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.suggestItem, idx === addressSuggestions.length - 1 && styles.suggestItemLast]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setAddressLine1(sug.addressLine1 || sug.place_name);
                      setCity(sug.city || '');
                      setState(sug.state || '');
                      setZipCode(sug.zipCode || '');
                      setCountry(sug.country || 'USA');
                      setLocation({ latitude: sug.latitude, longitude: sug.longitude });
                      setAddressSuggestions([]);
                      Keyboard.dismiss();
                    }}
                  >
                    <Ionicons name="location-outline" size={18} color={colors.textMuted} />
                    <Text style={styles.suggestItemText} numberOfLines={2}>{sug.place_name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address line 2 (optional)</Text>
            <TextInput
              style={styles.addressInput}
              value={addressLine2}
              onChangeText={setAddressLine2}
              placeholder="Apartment, suite, etc."
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={() => Keyboard.dismiss()}
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
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={() => Keyboard.dismiss()}
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
                placeholderTextColor={colors.textMuted}
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={() => Keyboard.dismiss()}
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
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={() => Keyboard.dismiss()}
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
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity 
              style={[styles.continueButton, styles.continueButtonFull, !isFormValid && styles.continueButtonDisabled]}
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
      <ScrollView style={styles.stepContainer} contentContainerStyle={[styles.step3Content, { paddingBottom: bottomPadding }]}>
        <View style={styles.reviewHeroCard}>
          <View style={styles.reviewHeroTopRow}>
            <View style={styles.reviewHeroIconWrap}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            </View>
            <Text style={styles.reviewHeroTitle}>Review your property</Text>
          </View>
          <View style={styles.addressHeader}>
            <Text style={styles.addressTitle}>{addressLine1.trim() || 'Address'}</Text>
            {secondaryAddress ? (
              <Text style={styles.addressSubtitle}>{secondaryAddress}</Text>
            ) : null}
          </View>
        </View>
        
        <View style={styles.mapSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="map-outline" size={16} color={colors.primary} />
            </View>
            <Text style={styles.sectionLabel}>Map Location</Text>
          </View>
          <TouchableOpacity 
            style={styles.mapPlaceholder}
            onPress={handleMapPress}
            activeOpacity={0.7}
            disabled={isGeocoding}
          >
            {isGeocoding ? (
              <View style={styles.mapGeocodingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.mapPlaceholderText}>Locating address…</Text>
              </View>
            ) : location ? (
              <View style={styles.mapThumbnailContainer}>
                <Image
                  source={{ uri: getMapThumbnailUrl(location.latitude, location.longitude, 400, 200) }}
                  style={styles.mapThumbnail}
                  resizeMode="cover"
                />
                <View style={styles.mapOverlay}>
                  <View style={styles.mapOverlayContent}>
                    <Ionicons name="location" size={20} color={colors.primary} />
                    <Text style={styles.mapOverlayText}>
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </Text>
                  </View>
                  <Text style={styles.mapOverlayHint}>Tap to change location</Text>
                </View>
              </View>
            ) : (
              <>
                <Ionicons name="location-outline" size={72} color={colors.textMuted} />
                <Text style={styles.mapPlaceholderText}>Enter address above or tap to select location</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryActionButton} onPress={handleMapPress} activeOpacity={0.85}>
            <Ionicons name="navigate-outline" size={18} color={colors.primary} />
            <Text style={styles.secondaryActionButtonText}>Adjust map pin</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.photoSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="image-outline" size={16} color={colors.primary} />
            </View>
            <Text style={styles.sectionLabel}>Property Photo</Text>
          </View>
          <TouchableOpacity style={styles.photoUploadBox} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
            ) : (
              <Ionicons name="add" size={32} color={colors.textMuted} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryActionButton} onPress={pickImage} activeOpacity={0.85}>
            <Ionicons name={imageUri ? 'refresh-outline' : 'camera-outline'} size={18} color={colors.primary} />
            <Text style={styles.secondaryActionButtonText}>{imageUri ? 'Change photo' : 'Add photo'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.peopleSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="people-outline" size={16} color={colors.primary} />
            </View>
            <Text style={styles.sectionLabel}>People</Text>
          </View>
          {people.map((person, index) => (
            <View key={index} style={styles.personItem}>
              <View style={styles.personAvatar}>
                <Ionicons name="person" size={24} color={colors.textMuted} />
              </View>
              <Text style={styles.personName}>{person.name || 'Person'}</Text>
            </View>
          ))}
          <TouchableOpacity 
            style={styles.addPersonButton}
            onPress={() => navigation.navigate('AddPerson')}
            activeOpacity={0.85}
          >
            <Ionicons name="person-add-outline" size={18} color={colors.white} />
            <Text style={styles.addPersonButtonText}>Add person</Text>
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
          <Ionicons name="checkmark" size={24} color={colors.white} />
          <Text style={styles.completeButtonText}>Save Property</Text>
        </TouchableOpacity>
    </ScrollView>
    );
  };

  const handleBack = () => {
    // When editing (from Property Detail), one back tap returns to the property page
    if (isEditing && !onboardingMode) {
      navigation.goBack();
      return;
    }
    if (onboardingMode && step === 1) {
      if (onboarding?.goBackToWelcome) {
        onboarding.goBackToWelcome();
      } else {
        navigation.goBack();
      }
      return;
    }
    if (step > 1) {
      if (step === 3) {
        setStep(1);
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
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.xl) + spacing.sm }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Property' : 'Add Property'}</Text>
        <View style={styles.backButtonSpacer} />
      </View>

      {step === 1 && renderStep1()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  backButtonSpacer: {
    width: 36,
    height: 36,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
  },
  addressFormScroll: {
    flex: 1,
  },
  addressFormContent: {
    paddingBottom: 20,
  },
  stepTitle: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  stepSubtitle: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  addressHeader: {
    marginBottom: 16,
  },
  addressTitle: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: 4,
  },
  addressSubtitle: {
    ...typography.bodySmall,
    textAlign: 'center',
  },
  divider: {
    height: 2,
    backgroundColor: '#E8E8E8',
    marginBottom: 30,
  },
  propertyTypesContainer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  propertyTypeIntroCard: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary + '2e',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  propertyTypeIntroText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.primaryDark,
  },
  propertyTypeOption: {
    width: '100%',
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  propertyTypeOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary + '55',
  },
  propertyTypeOptionPressed: {
    transform: [{ scale: 0.97 }],
  },
  propertyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary + '2e',
  },
  propertyIconContainerSelected: {
    backgroundColor: colors.background,
    borderColor: colors.primary + '66',
  },
  propertyLabelBlock: {
    flex: 1,
    gap: 2,
  },
  propertyLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  propertyLabelSelected: {
    color: colors.primaryDark,
  },
  propertyLabelPressed: {
    color: colors.primaryDark,
  },
  propertyDescription: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  propertyDescriptionPressed: {
    color: colors.textSecondary,
  },
  propertySelectedBadge: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary + '44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSection: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  propertyTypesScrollContent: {
    flexGrow: 1,
  },
  moreOptionsButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    ...shadows.button,
  },
  moreOptionsButtonPressed: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
    borderWidth: 1,
  },
  moreOptionsButtonText: {
    fontSize: 15,
    color: colors.white,
    fontWeight: '600',
  },
  moreOptionsButtonTextPressed: {
    color: colors.white,
  },
  step2Content: {
    paddingBottom: 40,
  },
  addressHeroCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary + '2e',
    backgroundColor: colors.primaryLight,
  },
  formSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  formSectionHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  addressForm: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  inputGroup: {
    width: '100%',
    gap: spacing.sm,
  },
  inputLabel: {
    ...typography.label,
    fontSize: 15,
    color: colors.text,
  },
  required: {
    color: colors.error,
    marginLeft: 4,
  },
  addressInput: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
    fontSize: 16,
    color: colors.text,
  },
  addressInputFocused: {
    borderColor: colors.primary,
  },
  suggestLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 6,
    paddingVertical: 4,
  },
  suggestLoadingText: {
    ...typography.caption,
  },
  suggestDropdown: {
    marginTop: 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    overflow: 'hidden',
    maxHeight: 220,
  },
  suggestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  suggestItemText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  suggestItemLast: {
    borderBottomWidth: 0,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  formRowItem: {
    flex: 1,
  },
  formActions: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  continueButtonFull: {
    width: '100%',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  dropdownOptionsContainer: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  dropdownOptionSelected: {
    backgroundColor: colors.primaryLight,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minWidth: 180,
    minHeight: 52,
    ...shadows.button,
  },
  continueButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.55,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  arrow: {
    fontSize: 22,
    color: colors.white,
    marginLeft: 6,
  },
  step3Content: {
    paddingBottom: 100,
  },
  reviewHeroCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  reviewHeroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 6,
  },
  reviewHeroIconWrap: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewHeroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  reviewHeroSubtitle: {
    ...typography.bodySmall,
    marginBottom: spacing.md,
  },
  mapSection: {
    marginBottom: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    ...shadows.card,
  },
  mapPlaceholder: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginTop: spacing.sm,
    height: 200,
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    color: colors.textMuted,
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
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    padding: 12,
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
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
    color: colors.white,
    fontWeight: '600',
  },
  mapOverlayHint: {
    fontSize: 10,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.85,
  },
  photoSection: {
    marginBottom: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    ...shadows.card,
  },
  photoUploadBox: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    marginTop: spacing.sm,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  peopleSection: {
    marginBottom: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    ...shadows.card,
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  personName: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  addPersonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    ...shadows.button,
  },
  addPersonButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  secondaryActionButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary + '33',
    backgroundColor: colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  secondaryActionButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionLabel: {
    ...typography.label,
    fontSize: 16,
    color: colors.text,
    marginBottom: 0,
  },
  completeButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    alignSelf: 'center',
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: '100%',
    justifyContent: 'center',
    ...shadows.button,
  },
  completeButtonActive: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.985 }],
  },
  completeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
