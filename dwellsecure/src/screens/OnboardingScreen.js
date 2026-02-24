import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { setOnboardingComplete, saveProperty } from '../services/storage';

const PROPERTY_TYPES = [
  { id: 'house', label: 'House', icon: 'home' },
  { id: 'townhouse', label: 'Townhouse', icon: 'business' },
  { id: 'apartment', label: 'Apartment', icon: 'layers' },
  { id: 'mobile', label: 'Mobile Home', icon: 'car' },
];

const MORE_PROPERTY_TYPES = [
  { id: 'duplex-triplex-fourplex', label: 'Duplex/Triplex/Fourplex', icon: 'business' },
  { id: 'low-rise-apartment', label: 'Low-rise Apartment', icon: 'layers' },
  { id: 'high-rise-apartment', label: 'High-rise Apartment', icon: 'layers' },
  { id: 'villa', label: 'Villa', icon: 'home' },
  { id: 'condo', label: 'Condo', icon: 'business' },
];

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(1);
  const [propertyType, setPropertyType] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [people, setPeople] = useState([]);

  const handlePropertyTypeSelect = (type) => {
    setPropertyType(type);
    setStep(3);
  };

  const handleAddressSubmit = () => {
    if (address && city && state && zip) {
      setStep(4);
    }
  };

  const handleSkipPropertyType = () => {
    setStep(3);
  };

  const handleMoreOptions = () => {
    setStep(2.5);
  };

  const handleMorePropertyTypeSelect = (type) => {
    setPropertyType(type);
    setStep(3);
  };

  const handleComplete = async () => {
    try {
      const propertyData = {
        id: Date.now().toString(),
        address,
        city,
        state,
        zip,
        propertyType,
        people,
        createdAt: new Date().toISOString(),
      };
      
      await saveProperty(propertyData);
      await setOnboardingComplete();
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const getFullAddress = () => {
    return `${address}\n${city}, ${state} ${zip}`;
  };

  const renderStep1 = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.welcomeTitle}>Welcome to</Text>
      <Text style={styles.appTitle}>Dwell Secure</Text>
      <Text style={styles.subtitle}>Manage critical property info in one place</Text>
      
      <TouchableOpacity 
        style={styles.largeCircleButton}
        onPress={() => setStep(2)}
      >
        <Ionicons name="add" size={48} color="#999" />
      </TouchableOpacity>
      
      <Text style={styles.helperText}>Click to add a property</Text>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Add your property</Text>
      <View style={styles.divider} />
      
      <View style={styles.propertyTypesContainer}>
        {PROPERTY_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={styles.propertyTypeCard}
            onPress={() => handlePropertyTypeSelect(type.id)}
          >
            <View style={styles.propertyIconContainer}>
              <Ionicons name={type.icon} size={40} color="#999" />
            </View>
            <Text style={styles.propertyTypeLabel}>{type.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.moreOptionsButton}
        onPress={handleMoreOptions}
      >
        <Text style={styles.moreOptionsButtonText}>More options</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.skipButton}
        onPress={handleSkipPropertyType}
      >
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2MoreOptions = () => (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setStep(2)}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.stepTitle}>More property types</Text>
      <View style={styles.divider} />
      
      <ScrollView 
        style={styles.moreOptionsScroll}
        contentContainerStyle={styles.moreOptionsContent}
        showsVerticalScrollIndicator={false}
      >
        {MORE_PROPERTY_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={styles.propertyTypeCard}
            onPress={() => handleMorePropertyTypeSelect(type.id)}
          >
            <View style={styles.propertyIconContainer}>
              <Ionicons name={type.icon} size={40} color="#999" />
            </View>
            <Text style={styles.propertyTypeLabel}>{type.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Enter your address</Text>
      
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <View style={styles.inputBar} />
        </View>
        <View style={styles.inputGroup}>
          <View style={styles.inputBar} />
        </View>
        <View style={styles.inputGroup}>
          <View style={styles.inputBar} />
        </View>
        <View style={styles.inputGroup}>
          <View style={styles.inputBar} />
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Street Address"
          value={address}
          onChangeText={setAddress}
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="City"
          value={city}
          onChangeText={setCity}
          placeholderTextColor="#999"
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.inputHalf]}
            placeholder="State"
            value={state}
            onChangeText={setState}
            placeholderTextColor="#999"
          />
          <TextInput
            style={[styles.input, styles.inputHalf]}
            placeholder="ZIP"
            value={zip}
            onChangeText={setZip}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.arrowButton}
        onPress={handleAddressSubmit}
      >
        <Ionicons name="arrow-forward" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>{address || '604 7th Ave'}</Text>
      <View style={styles.divider} />
      
      <View style={styles.locationIconContainer}>
        <Ionicons name="location" size={80} color="#ccc" />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Add photo</Text>
        <TouchableOpacity style={styles.photoUploadBox}>
          <Ionicons name="add" size={32} color="#999" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Add people</Text>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => setStep(5)}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.container}>
      <View style={styles.photoUploadSection}>
        <Text style={styles.photoLabel}>Add photo</Text>
        <TouchableOpacity style={styles.photoUploadBox}>
          <Ionicons name="add" size={32} color="#999" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Add people</Text>
        <TouchableOpacity style={styles.dropdownButton}>
          <Text style={styles.dropdownText}>Select...</Text>
          <Ionicons name="chevron-down" size={20} color="#999" />
        </TouchableOpacity>
        
        <View style={styles.addPersonRow}>
          <View style={styles.personInputPlaceholder} />
          <TouchableOpacity style={styles.addIconButton}>
            <Ionicons name="add-circle-outline" size={28} color="#999" />
          </TouchableOpacity>
        </View>
        <View style={styles.personInputPlaceholder} />
      </View>
      
      <TouchableOpacity 
        style={styles.completeButton}
        onPress={() => setStep(6)}
      >
        <Text style={styles.completeButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.allSetTitle}>All set!</Text>
      
      <View style={styles.confirmationBox}>
        <Text style={styles.confirmationAddress}>{address || '604 7th Ave'}</Text>
        <Text style={styles.confirmationSubtext}>Added as your property</Text>
      </View>
      
      <View style={styles.checkmarkCircle}>
        <Ionicons name="checkmark" size={60} color="#ccc" />
      </View>
      
      <TouchableOpacity 
        style={styles.getStartedButton}
        onPress={handleComplete}
      >
        <Text style={styles.getStartedButtonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 2.5 && renderStep2MoreOptions()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
      {step === 6 && renderStep6()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  welcomeTitle: {
    fontSize: 20,
    color: '#666',
    marginBottom: 5,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 60,
  },
  largeCircleButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  helperText: {
    fontSize: 14,
    color: '#999',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    height: 2,
    backgroundColor: '#E8E8E8',
    marginBottom: 30,
  },
  propertyTypesContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  propertyTypeCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  propertyIconContainer: {
    padding: 10,
  },
  propertyTypeLabel: {
    fontSize: 16,
    color: '#333',
    marginTop: 8,
  },
  moreOptionsButton: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginBottom: 15,
  },
  moreOptionsButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  moreOptionsScroll: {
    flex: 1,
  },
  moreOptionsContent: {
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  skipButton: {
    backgroundColor: '#E8E8E8',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignSelf: 'center',
    marginBottom: 20,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    flex: 1,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputBar: {
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputHalf: {
    width: '48%',
  },
  arrowButton: {
    backgroundColor: '#A8A8A8',
    borderRadius: 25,
    width: 80,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  locationIconContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
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
  },
  continueButton: {
    backgroundColor: '#A8A8A8',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  photoUploadSection: {
    marginBottom: 30,
  },
  photoLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  dropdownText: {
    fontSize: 16,
    color: '#999',
  },
  addPersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
  completeButton: {
    backgroundColor: '#A8A8A8',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignSelf: 'center',
    marginTop: 20,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  allSetTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  confirmationBox: {
    alignItems: 'center',
    marginBottom: 60,
  },
  confirmationAddress: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  confirmationSubtext: {
    fontSize: 14,
    color: '#999',
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  getStartedButton: {
    backgroundColor: '#A8A8A8',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 50,
  },
  getStartedButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
