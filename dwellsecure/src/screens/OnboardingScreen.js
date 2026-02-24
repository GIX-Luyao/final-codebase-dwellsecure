import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { setOnboardingComplete, saveProperty } from '../services/storage';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

const PROPERTY_TYPES = [
  { id: 'house', label: 'House', icon: 'home' },
  { id: 'townhouse', label: 'Townhouse', icon: 'business' },
  { id: 'apartment', label: 'Apartment', icon: 'layers' },
  { id: 'mobile', label: 'Mobile Home', icon: 'car' },
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
      // #region agent log
      fetch('http://127.0.0.1:7878/ingest/45053c11-4f19-48f6-87d3-ad5b93d68f97', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': '6eea19',
        },
        body: JSON.stringify({
          sessionId: '6eea19',
          runId: 'pre-fix',
          hypothesisId: 'H1',
          location: 'src/screens/OnboardingScreen.js:38',
          message: 'Onboarding handleComplete executed',
          data: {
            hasAddress: !!address,
            hasCity: !!city,
            hasState: !!state,
            hasZip: !!zip,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
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
        <Ionicons name="add" size={48} color={colors.textMuted} />
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
              <Ionicons name={type.icon} size={40} color={colors.primary} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={handleSkipPropertyType}
      >
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>
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
          placeholderTextColor={colors.textMuted}
        />
        <TextInput
          style={styles.input}
          placeholder="City"
          value={city}
          onChangeText={setCity}
          placeholderTextColor={colors.textMuted}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.inputHalf]}
            placeholder="State"
            value={state}
            onChangeText={setState}
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={[styles.input, styles.inputHalf]}
            placeholder="ZIP"
            value={zip}
            onChangeText={setZip}
            keyboardType="numeric"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.arrowButton}
        onPress={handleAddressSubmit}
      >
        <Ionicons name="arrow-forward" size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>{address || '604 7th Ave'}</Text>
      <View style={styles.divider} />
      
      <View style={styles.locationIconContainer}>
        <Ionicons name="location" size={80} color={colors.textMuted} />
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
          <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
        </TouchableOpacity>
        
        <View style={styles.addPersonRow}>
          <View style={styles.personInputPlaceholder} />
          <TouchableOpacity style={styles.addIconButton}>
            <Ionicons name="add-circle-outline" size={28} color={colors.textMuted} />
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
        <Ionicons name="checkmark" size={60} color={colors.success} />
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
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.screenPadding,
  },
  container: {
    flex: 1,
    padding: spacing.screenPadding,
    paddingTop: 56,
  },
  welcomeTitle: {
    fontSize: 20,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 48,
  },
  largeCircleButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  helperText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  divider: {
    height: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.xxl,
  },
  propertyTypesContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  propertyTypeCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  propertyIconContainer: {
    padding: spacing.sm,
  },
  skipButton: {
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  skipButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  formContainer: {
    flex: 1,
    paddingTop: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputBar: {
    height: 40,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
  },
  input: {
    height: 50,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    marginBottom: spacing.lg,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputHalf: {
    width: '48%',
  },
  arrowButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    width: 80,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  locationIconContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  photoUploadBox: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  photoUploadSection: {
    marginBottom: spacing.xxl,
  },
  photoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  addPersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  personInputPlaceholder: {
    flex: 1,
    height: 50,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  addIconButton: {
    padding: spacing.sm,
  },
  completeButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    alignSelf: 'center',
    marginTop: spacing.xl,
  },
  completeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  allSetTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xxl,
  },
  confirmationBox: {
    alignItems: 'center',
    marginBottom: 48,
  },
  confirmationAddress: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  confirmationSubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.lg,
    paddingHorizontal: 48,
  },
  getStartedButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
