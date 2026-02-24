import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getProperties, getShutoffsForEmergencyMode } from '../services/storage';
import { setAppMode, NORMAL_MODE, EMERGENCY_MODE } from '../services/modeService';

export default function EmergencyModeScreen({ navigation }) {
  const [step, setStep] = useState(0); // 0: choose shutoff, 1: instructions, 2: confirmation, 3: call 911
  const [selectedShutoffType, setSelectedShutoffType] = useState(null);
  const [selectedShutoff, setSelectedShutoff] = useState(null);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [properties, setProperties] = useState([]);
  const [shutoffs, setShutoffs] = useState([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
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

  const loadData = async () => {
    const props = await getProperties();
    // Use getShutoffsForEmergencyMode - avoids mode timing, always returns filtered (1 per type)
    const shuts = await getShutoffsForEmergencyMode();
    setProperties(props);
    setShutoffs(shuts);
  };

  // Shared logic: same as dashed/solid line - used for both button style AND click behavior
  const getShutoffForType = (type) => {
    return shutoffs.find(s => {
      const normalizedType = s.type === 'fire' ? 'gas' : s.type === 'power' ? 'electric' : s.type;
      return normalizedType === type;
    });
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

  const getInstructions = () => {
    // No record: default instruction is Call 911 (same logic as hasRecord/style)
    if (!selectedShutoff) {
      return [`No shutoff information found for ${getShutoffTypeLabel(selectedShutoffType || 'utility').toLowerCase()}. Please call 911 immediately for assistance.`];
    }
    // Has record: use description if exists, else default instructions
    if (selectedShutoff.description) {
      return selectedShutoff.description.split(/[.\n]/).filter(s => s.trim().length > 0);
    }
    return getDefaultInstructions(selectedShutoffType);
  };

  const handleClose = async () => {
    // SYSTEM BEHAVIOR: Reset to Normal Mode when exiting Emergency Mode
    await setAppMode(NORMAL_MODE);
    setStep(0);
    setSelectedShutoffType(null);
    setSelectedShutoff(null);
    setCurrentInstructionIndex(0);
    setIsConfirmed(false);
    navigation.goBack();
  };

  const handleSelectShutoff = (type) => {
    // Same logic as dashed/solid line: hasRecord -> instructions, no record -> Call 911
    const shutoff = getShutoffForType(type);
    const hasRecord = !!shutoff;
    setSelectedShutoffType(type);
    setSelectedShutoff(shutoff || null);
    setCurrentInstructionIndex(0);
    if (hasRecord) {
      setStep(1); // instructions
    } else {
      setStep(3); // Call 911 - no record
    }
  };

  const handleNextInstruction = () => {
    const instructions = getInstructions();
    if (currentInstructionIndex < instructions.length - 1) {
      setCurrentInstructionIndex(currentInstructionIndex + 1);
      // Scroll to next instruction
      setTimeout(() => {
        if (scrollViewRef.current) {
          const itemHeight = 140;
          const scrollPosition = (currentInstructionIndex + 1) * itemHeight;
          scrollViewRef.current.scrollTo({
            y: scrollPosition,
            animated: true,
          });
        }
      }, 100);
    } else {
      // All instructions complete, go to confirmation
      setStep(2);
    }
  };

  const handlePreviousInstruction = () => {
    if (currentInstructionIndex > 0) {
      setCurrentInstructionIndex(currentInstructionIndex - 1);
      // Scroll to previous instruction
      setTimeout(() => {
        if (scrollViewRef.current) {
          const itemHeight = 140;
          const scrollPosition = (currentInstructionIndex - 1) * itemHeight;
          scrollViewRef.current.scrollTo({
            y: scrollPosition,
            animated: true,
          });
        }
      }, 100);
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
  };

  const handleSuccessDone = async () => {
    // Exit Emergency Mode
    await handleClose();
  };

  const handleNotConfirmed = () => {
    setStep(3); // Go to call 911
  };

  const handleCall911 = () => {
    const phoneNumber = '911';
    const url = Platform.OS === 'ios' ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
    Linking.openURL(url).catch(err => console.error('Error calling 911:', err));
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
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

  // Screen 0: Choose shutoff type
  const renderChooseShutoff = () => {
    // SYSTEM BEHAVIOR: Always show all 3 utility types, even if no records exist
    const allTypes = [
      { type: 'gas', label: 'Gas', icon: 'flame-outline' },
      { type: 'electric', label: 'Electric', icon: 'flash-outline' },
      { type: 'water', label: 'Water', icon: 'water-outline' },
    ];

    return (
      <View style={styles.content}>
        <Text style={styles.questionText}>Choose the utility you need help with</Text>
        {shutoffs.length === 0 && (
          <Text style={styles.hintText}>No shutoff records yet. Tapping any will show Call 911.</Text>
        )}
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

  // Screen 1: Instructions with scrolling and highlighting
  const renderInstructions = () => {
    const instructions = getInstructions();
    const title = `To locate your ${getShutoffTypeLabel(selectedShutoffType).toLowerCase()} shutoff:`;

    return (
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>{title}</Text>
        <ScrollView
          ref={scrollViewRef}
          style={styles.instructionsScroll}
          contentContainerStyle={styles.instructionsContent}
          showsVerticalScrollIndicator={false}
        >
          {instructions.map((instruction, index) => {
            const isActive = index === currentInstructionIndex;
            return (
              <View key={index} style={styles.instructionStepContainer}>
                {index > 0 && (
                  <View style={[styles.instructionConnector, isActive && styles.connectorActive]} />
                )}
                <View
                  style={[
                    styles.instructionStep,
                    isActive && styles.instructionStepActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.instructionText,
                      isActive && styles.instructionTextActive,
                    ]}
                  >
                    {instruction}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
        <View style={styles.instructionButtons}>
          <TouchableOpacity
            style={[styles.navButton, currentInstructionIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePreviousInstruction}
            disabled={currentInstructionIndex === 0}
          >
            <Ionicons name="chevron-back" size={24} color={currentInstructionIndex === 0 ? "#999" : "#333"} />
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>
            {currentInstructionIndex + 1} / {instructions.length}
          </Text>
          <TouchableOpacity
            style={[styles.navButton, currentInstructionIndex === instructions.length - 1 && styles.navButtonComplete]}
            onPress={handleNextInstruction}
          >
            {currentInstructionIndex === instructions.length - 1 ? (
              <Ionicons name="checkmark" size={24} color="#333" />
            ) : (
              <Ionicons name="chevron-forward" size={24} color="#333" />
            )}
          </TouchableOpacity>
        </View>
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

  // Screen 3: Call 911 (shown when no record OR when user couldn't complete shutoff)
  const renderCall911 = () => {
    const hasNoRecord = !selectedShutoff;
    const label = getShutoffTypeLabel(selectedShutoffType || 'utility').toLowerCase();
    return (
      <View style={styles.content}>
        <View style={styles.call911Container}>
          {hasNoRecord && (
            <View style={styles.noRecordBanner}>
              <Ionicons name="warning" size={24} color="#fff" />
              <Text style={styles.noRecordBannerText}>No shutoff record</Text>
            </View>
          )}
          <View style={styles.emergencyIconContainer}>
            <Ionicons name="call" size={80} color="#fff" />
          </View>
          <Text style={styles.call911Title}>Call Emergency Services</Text>
          <Text style={styles.call911Text}>
            {hasNoRecord
              ? `No shutoff information found for ${label}. Please call 911 immediately for assistance.`
              : `If you were unable to shut off the ${label}, please call 911 immediately.`}
          </Text>
          {hasNoRecord && (
            <TouchableOpacity
              style={styles.backToSelectionButton}
              onPress={() => {
                setStep(0);
                setSelectedShutoffType(null);
                setSelectedShutoff(null);
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
              <Text style={styles.backToSelectionText}>Choose another utility</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderContent = () => {
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
    backgroundColor: '#d32f2f',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    backgroundColor: '#d32f2f',
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
  hintText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  utilitiesContainer: {
    gap: 15,
    width: '100%',
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
    paddingBottom: 70, // Space for fixed call 911 button
  },
  instructionsTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  instructionsScroll: {
    flex: 1,
  },
  instructionsContent: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  instructionStepContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  instructionConnector: {
    position: 'absolute',
    left: 30,
    top: -20,
    width: 3,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  connectorActive: {
    backgroundColor: '#FFFFFF',
  },
  instructionStep: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 20,
    minHeight: 100,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  instructionStepActive: {
    backgroundColor: '#8B0000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  instructionText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingLeft: 60,
  },
  instructionTextActive: {
    color: '#FFFFFF',
  },
  instructionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonComplete: {
    backgroundColor: '#fff',
  },
  stepIndicator: {
    fontSize: 16,
    color: '#fff',
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
  noRecordBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  noRecordBannerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  backToSelectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
  },
  backToSelectionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
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
    backgroundColor: '#d32f2f',
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
    color: '#d32f2f',
  },
});
