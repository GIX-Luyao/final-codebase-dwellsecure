import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Linking,
  Platform,
  SafeAreaView,
  ImageBackground,
} from 'react-native';

const ITEM_HEIGHT = 120;
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getProperties, getShutoffs } from '../services/storage';
import { setAppMode, NORMAL_MODE, EMERGENCY_MODE } from '../services/modeService';

export default function EmergencyModeScreen({ navigation }) {
  const [step, setStep] = useState(0); // -1: select property, 0: choose shutoff, 1: instructions, 2: confirmation, 3: call 911, 4: success
  const [selectedShutoffType, setSelectedShutoffType] = useState(null);
  const [selectedShutoff, setSelectedShutoff] = useState(null);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [properties, setProperties] = useState([]);
  const [shutoffs, setShutoffs] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isMissingShutoff, setIsMissingShutoff] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // SYSTEM BEHAVIOR: Set app to Emergency Mode when entering this screen
    const enterEmergencyMode = async () => {
      await setAppMode(EMERGENCY_MODE);
      await loadData();
    };
    enterEmergencyMode();

    // SYSTEM BEHAVIOR: Reset to Normal Mode when leaving this screen
    return () => {
      setAppMode(NORMAL_MODE).catch(err => {
        console.error('Error resetting to normal mode:', err);
      });
    };
  }, []);

  // Reload shutoffs/properties when screen is focused so any edits (pin, description, etc.) are reflected
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const props = await getProperties();
    const shuts = await getShutoffs();
    setProperties(Array.isArray(props) ? props : []);
    setShutoffs(Array.isArray(shuts) ? shuts : []);

    // Auto-select property if only one exists, otherwise show property selection
    if (Array.isArray(props) && props.length === 1) {
      setSelectedPropertyId(props[0].id);
      setStep(0);
    } else if (Array.isArray(props) && props.length > 1) {
      setStep(-1);
    }
  };

  const getShutoffTypeLabel = (type) => {
    switch (type) {
      case 'gas':
      case 'fire': // Backward compatibility
        return 'Gas';
      case 'electric':
      case 'power': // Backward compatibility
        return 'Electric';
      case 'water':
        return 'Water';
      default:
        return 'Utility';
    }
  };

  const getShutoffIcon = (type) => {
    switch (type) {
      case 'gas':
      case 'fire': // Backward compatibility
        return 'flame-outline';
      case 'electric':
      case 'power': // Backward compatibility
        return 'flash-outline';
      case 'water':
        return 'water-outline';
      default:
        return 'construct-outline';
    }
  };

  // Default instructions if shutoff doesn't have description
  const getDefaultInstructions = (type) => {
    // Normalize type for backward compatibility
    const normalizedType = type === 'fire' ? 'gas' : type === 'power' ? 'electric' : type;
    
    switch (normalizedType) {
      case 'gas':
        return [
          'Go out from front entrance',
          'Go to the right side exterior wall',
          'Find the rectangular meter with metal pipes',
          'Locate a small metal lever',
          'Turn the valve 90° to stop the gas',
          'Move away',
        ];
      case 'electric':
        return [
          'Locate your electrical panel',
          'Find the main circuit breaker',
          'Switch off the main breaker',
          'Verify power is off',
          'Move to a safe location',
        ];
      case 'water':
        return [
          'Locate the main water valve',
          'Turn the valve clockwise to shut off',
          'Check all faucets to confirm water is off',
          'Drain remaining water from pipes',
          'Contact a plumber if needed',
        ];
      default:
        return ['Follow emergency procedures', 'Contact emergency services if needed'];
    }
  };

  // Build instructions from the selected shutoff's current saved data (pin/location, floor, description)
  // so any edit in the app (pin change, location, floor, custom steps) is reflected in emergency mode
  const getInstructions = () => {
    const steps = [];
    const record = selectedShutoff;
    const type = selectedShutoffType;

    // Location step: use saved location (pin coordinates or text) so pin/location edits are reflected
    if (record && (record.location || (record.latitude != null && record.longitude != null))) {
      const locationText = record.location && record.location.trim()
        ? record.location.trim()
        : (record.latitude != null && record.longitude != null)
          ? `See the marked pin on the property (${Number(record.latitude).toFixed(5)}, ${Number(record.longitude).toFixed(5)})`
          : null;
      if (locationText) {
        steps.push(`Location: ${locationText}`);
      }
    }

    // Floor step if saved
    if (record && record.floor && String(record.floor).trim()) {
      steps.push(`Floor/Level: ${String(record.floor).trim()}`);
    }

    // Custom description steps (from editing the shutoff/utility) or default by type
    if (record && record.description && String(record.description).trim()) {
      const descriptionSteps = record.description
        .split(/[.\n]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
      if (descriptionSteps.length > 0) {
        steps.push(...descriptionSteps);
      } else {
        steps.push(...getDefaultInstructions(type));
      }
    } else {
      steps.push(...getDefaultInstructions(type));
    }

    return steps.length > 0 ? steps : getDefaultInstructions(type);
  };

  const handleClose = async () => {
    await setAppMode(NORMAL_MODE);
    setStep(0);
    setSelectedShutoffType(null);
    setSelectedShutoff(null);
    setIsMissingShutoff(false);
    setSelectedPropertyId(null);
    setCurrentInstructionIndex(0);
    setIsConfirmed(false);
    // Navigate to MainStack > Property so the Property tab is clearly active and highlighted
    navigation.navigate('MainStack', { screen: 'Property', params: { screen: 'PropertyList' } });
  };

  const handleSelectShutoff = (type) => {
    const shutoff = shutoffs.find(s => {
      const normalizedType = s.type === 'fire' ? 'gas' : s.type === 'power' ? 'electric' : s.type;
      const matchesType = normalizedType === type;
      const matchesProperty = selectedPropertyId ? s.propertyId === selectedPropertyId : true;
      return matchesType && matchesProperty;
    });
    setSelectedShutoffType(type);
    setSelectedShutoff(shutoff || null);
    if (!shutoff) {
      setIsMissingShutoff(true);
      setStep(3);
      setCurrentInstructionIndex(0);
      return;
    }
    setIsMissingShutoff(false);
    setStep(1);
    setCurrentInstructionIndex(0);
  };

  const handleNextInstruction = () => {
    const instructions = getInstructions();
    if (currentInstructionIndex < instructions.length - 1) {
      const newIndex = currentInstructionIndex + 1;
      setCurrentInstructionIndex(newIndex);
      scrollViewRef.current?.scrollToOffset({ offset: newIndex * ITEM_HEIGHT, animated: true });
    } else {
      setStep(2);
    }
  };

  const handlePreviousInstruction = () => {
    if (currentInstructionIndex > 0) {
      const newIndex = currentInstructionIndex - 1;
      setCurrentInstructionIndex(newIndex);
      scrollViewRef.current?.scrollToOffset({ offset: newIndex * ITEM_HEIGHT, animated: true });
    }
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
    setStep(4); // Go to success screen
  };

  const handleSuccessBack = () => {
    // Go back to utility selection
    setStep(0);
    setIsConfirmed(false);
    setSelectedShutoffType(null);
    setSelectedShutoff(null);
    setIsMissingShutoff(false);
  };

  const handleSuccessDone = async () => {
    // Exit Emergency Mode
    await handleClose();
  };

  const handleNotConfirmed = () => {
    setIsMissingShutoff(false);
    setStep(3); // Go to call 911
  };

  const handleCall911 = () => {
    const phoneNumber = '911';
    const url = Platform.OS === 'ios' ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
    Linking.openURL(url).catch(err => console.error('Error calling 911:', err));
  };

  const handleBack = () => {
    // On instructions (step 1), go back to shutoff selection
    if (step === 1) {
      setStep(0);
      setSelectedShutoffType(null);
      setSelectedShutoff(null);
      setIsMissingShutoff(false);
      setCurrentInstructionIndex(0);
      return;
    }
    // On shutoff selection (step 0), go back to property selection if multiple properties exist
    if (step === 0 && properties.length > 1) {
      setStep(-1);
      return;
    }
    handleClose();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Emergency mode</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderCall911Button = () => (
    <View style={styles.fixedCall911Container}>
      <TouchableOpacity
        style={styles.fixedCall911Button}
        onPress={handleCall911}
      >
        <Ionicons name="call" size={24} color="#fff" />
        <Text style={styles.fixedCall911ButtonText}>Call 911</Text>
      </TouchableOpacity>
    </View>
  );

  // Screen -1: Select property
  const renderPropertySelection = () => {
    return (
      <View style={styles.content}>
        <Text style={styles.questionText}>Which property do you need help with?</Text>
        <View style={styles.utilitiesContainer}>
          {properties.map((property) => {
            const streetAddress = property.addressLine1
              ? property.addressLine1.trim()
              : property.address
                ? property.address.split(',')[0].trim()
                : 'Unknown Property';
            const isSelected = selectedPropertyId === property.id;
            return (
              <TouchableOpacity
                key={property.id}
                style={[styles.propertyCard, isSelected && styles.selectedCard]}
                onPress={() => {
                  setSelectedPropertyId(property.id);
                  setStep(0);
                }}
                activeOpacity={0.8}
              >
                <ImageBackground
                  source={property.imageUri ? { uri: property.imageUri } : null}
                  style={styles.propertyCardBg}
                  imageStyle={styles.propertyCardBgImage}
                >
                  <View style={styles.propertyCardOverlay}>
                    {!property.imageUri && (
                      <Ionicons name="home" size={36} color="#fff" style={{ marginBottom: 8 }} />
                    )}
                    <Text style={styles.propertyCardLabel}>{streetAddress}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // Screen 0: Choose shutoff type
  const renderChooseShutoff = () => {
    // SYSTEM BEHAVIOR: Always show all 3 utility types, even if no records exist
    const allTypes = [
      { type: 'gas', label: 'Gas', icon: 'flame-outline' },
      { type: 'electric', label: 'Electric', icon: 'flash-outline' },
      { type: 'water', label: 'Water', icon: 'water-outline' },
    ];

    const getShutoffForType = (type) => {
      return shutoffs.find(s => {
        const normalizedType = s.type === 'fire' ? 'gas' : s.type === 'power' ? 'electric' : s.type;
        const matchesType = normalizedType === type;
        const matchesProperty = selectedPropertyId ? s.propertyId === selectedPropertyId : true;
        return matchesType && matchesProperty;
      });
    };

    return (
      <View style={styles.content}>
        <Text style={styles.questionText}>Choose the utility you need help with</Text>
        <View style={styles.utilitiesContainer}>
          {allTypes.map((item) => {
            const isSelected = selectedShutoffType === item.type;
            const hasRecord = !!getShutoffForType(item.type);

            return (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.utilityCard,
                  isSelected ? styles.selectedCard : hasRecord ? styles.utilityCardWithRecord : styles.utilityCardNoRecord,
                ]}
                onPress={() => handleSelectShutoff(item.type)}
              >
                <Ionicons name={item.icon} size={60} color="#fff" />
                <Text style={styles.utilityLabel}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // Screen 1: Instructions — snap-scroll drum-roll window
  const renderInstructions = () => {
    const instructions = getInstructions();
    const title = `To locate your ${getShutoffTypeLabel(selectedShutoffType).toLowerCase()} shutoff:`;
    const isLast = currentInstructionIndex === instructions.length - 1;

    return (
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>{title}</Text>

        {/* Fixed highlight window with scrolling drum-roll list */}
        <View style={styles.instructionWindowWrap}>
          {/* Dark highlight frame — sits behind the list at the center slot */}
          <View style={styles.instructionWindowFrame} pointerEvents="none" />

          <FlatList
            ref={scrollViewRef}
            data={instructions}
            keyExtractor={(_, i) => `step-${i}`}
            renderItem={({ item, index }) => {
              const isActive = index === currentInstructionIndex;
              return (
                <View style={styles.instructionSnapItem}>
                  <Text
                    style={[
                      styles.instructionSnapText,
                      isActive ? styles.instructionSnapTextActive : styles.instructionSnapTextDim,
                    ]}
                    numberOfLines={3}
                  >
                    {item}
                  </Text>
                </View>
              );
            }}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
              setCurrentInstructionIndex(Math.max(0, Math.min(idx, instructions.length - 1)));
            }}
            onScrollEndDrag={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
              setCurrentInstructionIndex(Math.max(0, Math.min(idx, instructions.length - 1)));
            }}
            getItemLayout={(_, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
          />

        </View>

        {/* Step counter — bottom-right of window, 10px below */}
        <Text style={styles.snapStepIndicator}>
          {currentInstructionIndex + 1} / {instructions.length}
        </Text>

        {/* Tap zone — from below window to top of Call 911 bar */}
        <TouchableOpacity
          style={styles.tapNextZone}
          onPress={handleNextInstruction}
          activeOpacity={0.6}
        >
          {isLast && (
            <View style={styles.foundItWrap}>
              <Text style={styles.tapNextText}>I've found it</Text>
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color="rgba(255,255,255,0.75)"
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // Screen 2: Confirmation
  const renderConfirmation = () => {
    return (
      <View style={styles.content}>
        <View style={styles.confirmationContainer}>
          <View style={styles.checkmarkContainer}>
            <Ionicons name="help-circle" size={80} color="#fff" />
          </View>
          <Text style={styles.confirmationTitle}>Shutoff Complete?</Text>
          <Text style={styles.confirmationText}>
            Have you successfully shut off the {getShutoffTypeLabel(selectedShutoffType).toLowerCase()}?
          </Text>
          <View style={styles.confirmationButtons}>
            <TouchableOpacity
              style={[styles.confirmButton, styles.confirmButtonYes]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, styles.confirmButtonNo]}
              onPress={handleNotConfirmed}
            >
              <Text style={styles.confirmButtonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Screen 4: Success (after confirming shutoff)
  const renderSuccess = () => {
    return (
      <View style={styles.content}>
        <View style={styles.successContainer}>
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark-circle" size={100} color="#fff" />
          </View>
          <Text style={styles.successTitle}>Great Job!</Text>
          <Text style={styles.successText}>
            You have successfully shut off the {getShutoffTypeLabel(selectedShutoffType).toLowerCase()}.
          </Text>
          <Text style={styles.successSubtext}>
            The {getShutoffTypeLabel(selectedShutoffType).toLowerCase()} has been safely shut off.
          </Text>
          <View style={styles.successButtons}>
            <TouchableOpacity
              style={[styles.successButton, styles.successButtonDone]}
              onPress={handleSuccessDone}
            >
              <Text style={styles.successButtonText}>Done</Text>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Screen 3: Call 911
  const renderCall911 = () => {
    return (
      <View style={styles.content}>
        <View style={styles.call911Container}>
          <View style={styles.emergencyIconContainer}>
            <Ionicons name="call" size={80} color="#fff" />
          </View>
          <Text style={styles.call911Title}>Call Emergency Services</Text>
          <Text style={styles.call911Text}>
            {isMissingShutoff
              ? `No corresponding ${getShutoffTypeLabel(selectedShutoffType).toLowerCase()} shutoff was found. Please call 911 immediately.`
              : `If you were unable to shut off the ${getShutoffTypeLabel(selectedShutoffType).toLowerCase()}, please call 911 immediately.`}
          </Text>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (step === -1) return renderPropertySelection();
    if (step === 0) return renderChooseShutoff();
    if (step === 1) return renderInstructions();
    if (step === 2) return renderConfirmation();
    if (step === 3) return renderCall911();
    if (step === 4) return renderSuccess();
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        {renderHeader()}
        {renderContent()}
      </View>
      {renderCall911Button()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CA4B4B',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    backgroundColor: '#CA4B4B',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 30,
    paddingBottom: 100, // Space for fixed call 911 button
  },
  questionText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  utilitiesContainer: {
    gap: 15,
    width: '100%',
  },
  propertyCard: {
    width: '100%',
    height: 150,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  propertyCardBg: {
    flex: 1,
    backgroundColor: 'rgba(180,60,60,0.6)',
  },
  propertyCardBgImage: {
    borderRadius: 18,
  },
  propertyCardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  propertyCardLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  utilityCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    width: '100%',
    minHeight: 120,
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
  },
  utilityCardWithRecord: {
    borderColor: '#fff',
  },
  utilityCardNoRecord: {
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  utilityLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  instructionsContainer: {
    flex: 1,
    paddingBottom: 70,
  },
  instructionsTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  // Snap window
  instructionWindowWrap: {
    height: ITEM_HEIGHT * 3,
    marginHorizontal: 20,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 20,
  },
  instructionWindowFrame: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM_HEIGHT,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(90, 10, 10, 0.45)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  instructionSnapItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  instructionSnapText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 32,
  },
  instructionSnapTextActive: {},
  instructionSnapTextDim: {
    opacity: 0.85,
  },
  instructionFadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: '#CA4B4B',
    opacity: 0.55,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  instructionFadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: '#CA4B4B',
    opacity: 0.55,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  snapStepIndicator: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
    letterSpacing: 1,
    alignSelf: 'flex-end',
    marginRight: 30,
    marginTop: -110,
  },
  tapNextZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 0,
    paddingTop: 24,
  },
  foundItWrap: {
    alignItems: 'center',
    marginTop: 150,
    gap: 6,
  },
  tapNextText: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  confirmationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100, // Space for fixed call 911 button
  },
  checkmarkContainer: {
    marginBottom: 30,
  },
  confirmationTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    // Shadow for Android
    elevation: 8,
  },
  confirmButtonYes: {
    backgroundColor: 'transparent',
  },
  confirmButtonNo: {
    backgroundColor: 'transparent',
  },
  confirmButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  call911Container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emergencyIconContainer: {
    marginBottom: 30,
  },
  call911Title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  call911Text: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 28,
  },
  call911Button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 50,
    gap: 12,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  call911ButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyMessage: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyMessageText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 26,
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  verificationBannerVerified: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
  },
  verificationBannerUnverified: {
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
  },
  verificationBannerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  noRecordBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(158, 158, 158, 0.9)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  noRecordBannerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for fixed call 911 button
  },
  successTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  successText: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  successSubtext: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  successButtons: {
    width: '100%',
    gap: 15,
    paddingHorizontal: 20,
  },
  successButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 50,
    gap: 10,
  },
  successButtonDone: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    // Shadow for Android
    elevation: 8,
  },
  successButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  fixedCall911Container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#CA4B4B',
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 2,
    borderTopColor: '#fff',
  },
  fixedCall911Button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 50,
    gap: 12,
  },
  fixedCall911ButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#CA4B4B',
  },
});
