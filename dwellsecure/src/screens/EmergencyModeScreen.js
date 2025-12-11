import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getProperty, getShutoffs } from '../services/storage';

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
    loadData();
  }, []);

  const loadData = async () => {
    const prop = await getProperty();
    const shuts = await getShutoffs();
    setProperties(prop ? [prop] : []);
    setShutoffs(shuts);
  };

  const getShutoffTypeLabel = (type) => {
    switch (type) {
      case 'fire':
        return 'Fire';
      case 'power':
        return 'Power';
      case 'water':
        return 'Water';
      default:
        return 'Utility';
    }
  };

  const getShutoffIcon = (type) => {
    switch (type) {
      case 'fire':
        return 'flame-outline';
      case 'power':
        return 'flash-outline';
      case 'water':
        return 'water-outline';
      default:
        return 'construct-outline';
    }
  };

  // Default instructions if shutoff doesn't have description
  const getDefaultInstructions = (type) => {
    switch (type) {
      case 'fire':
        return [
          'Go out from front entrance',
          'Go to the right side exterior wall',
          'Find the rectangular meter with metal pipes',
          'Locate a small metal lever',
          'Turn the valve 90° to stop the gas',
          'Move away',
        ];
      case 'power':
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
    if (selectedShutoff && selectedShutoff.description) {
      // Split description into steps (assuming steps are separated by newlines or periods)
      return selectedShutoff.description.split(/[.\n]/).filter(s => s.trim().length > 0);
    }
    return getDefaultInstructions(selectedShutoffType);
  };

  const handleClose = () => {
    setStep(0);
    setSelectedShutoffType(null);
    setSelectedShutoff(null);
    setCurrentInstructionIndex(0);
    setIsConfirmed(false);
    navigation.goBack();
  };

  const handleSelectShutoff = (type) => {
    // Find shutoff of this type
    const shutoff = shutoffs.find(s => s.type === type);
    setSelectedShutoffType(type);
    setSelectedShutoff(shutoff || null);
    setStep(1); // Go to instructions
    setCurrentInstructionIndex(0);
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
    setStep(2);
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

  // Screen 0: Choose shutoff type
  const renderChooseShutoff = () => {
    const shutoffTypes = [
      { type: 'fire', label: 'Fire', icon: 'flame-outline' },
      { type: 'power', label: 'Power', icon: 'flash-outline' },
      { type: 'water', label: 'Water', icon: 'water-outline' },
    ];

    return (
      <View style={styles.content}>
        <Text style={styles.questionText}>Choose the utility you need help with</Text>
        <View style={styles.utilitiesContainer}>
          {shutoffTypes.map((item) => (
            <TouchableOpacity
              key={item.type}
              style={[
                styles.utilityCard,
                selectedShutoffType === item.type && styles.selectedCard,
              ]}
              onPress={() => handleSelectShutoff(item.type)}
            >
              <Ionicons name={item.icon} size={60} color="#fff" />
              <Text style={styles.utilityLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
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
            <Ionicons name="chevron-back" size={24} color={currentInstructionIndex === 0 ? "#999" : "#fff"} />
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>
            {currentInstructionIndex + 1} / {instructions.length}
          </Text>
          <TouchableOpacity
            style={[styles.navButton, currentInstructionIndex === instructions.length - 1 && styles.navButtonComplete]}
            onPress={handleNextInstruction}
          >
            {currentInstructionIndex === instructions.length - 1 ? (
              <Ionicons name="checkmark" size={24} color="#fff" />
            ) : (
              <Ionicons name="chevron-forward" size={24} color="#fff" />
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
            <Ionicons name="checkmark-circle" size={80} color="#fff" />
          </View>
          <Text style={styles.confirmationTitle}>Shutoff Complete</Text>
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
            If you were unable to shut off the {getShutoffTypeLabel(selectedShutoffType).toLowerCase()}, 
            please call 911 immediately.
          </Text>
          <TouchableOpacity
            style={styles.call911Button}
            onPress={handleCall911}
          >
            <Ionicons name="call" size={32} color="#8E8E93" />
            <Text style={styles.call911ButtonText}>Call 911</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (step === 0) return renderChooseShutoff();
    if (step === 1) return renderInstructions();
    if (step === 2) return renderConfirmation();
    if (step === 3) return renderCall911();
    return null;
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8E8E93',
  },
  header: {
    backgroundColor: '#8E8E93',
    paddingTop: 60,
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
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },
  utilitiesContainer: {
    gap: 20,
    width: '100%',
  },
  utilityCard: {
    backgroundColor: '#D1D1D6',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    minHeight: 200,
    justifyContent: 'center',
  },
  selectedCard: {
    backgroundColor: '#AEAEB2',
    borderWidth: 3,
    borderColor: '#fff',
  },
  utilityLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  instructionsContainer: {
    flex: 1,
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
    paddingBottom: 20,
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  connectorActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  instructionStep: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 20,
    minHeight: 100,
    justifyContent: 'center',
  },
  instructionStepActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  instructionText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.7)',
    paddingLeft: 60,
  },
  instructionTextActive: {
    color: '#fff',
  },
  instructionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  navButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#AEAEB2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonComplete: {
    backgroundColor: '#AEAEB2',
  },
  stepIndicator: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  navButtonComplete: {
    backgroundColor: '#AEAEB2',
  },
  stepIndicator: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  confirmationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  confirmButtonYes: {
    backgroundColor: '#AEAEB2',
  },
  confirmButtonNo: {
    backgroundColor: '#D1D1D6',
  },
  confirmButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
  },
  call911ButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8E8E93',
  },
});
