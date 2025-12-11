import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { saveProperty, getPeople } from '../services/storage';

const PROPERTY_TYPES = [
  { id: 'house', label: 'House', icon: 'home' },
  { id: 'townhouse', label: 'Townhouse', icon: 'business' },
  { id: 'apartment', label: 'Apartment', icon: 'layers' },
  { id: 'mobile', label: 'Mobile Home', icon: 'car' },
];

export default function AddPropertyScreen({ route }) {
  const navigation = useNavigation();
  const { property } = route?.params || {};
  const isEditing = !!property;
  
  const [step, setStep] = useState(1);
  const [propertyType, setPropertyType] = useState(property?.propertyType || '');
  const [address, setAddress] = useState(property?.address || '');
  const [imageUri, setImageUri] = useState(property?.imageUri || null);
  const [people, setPeople] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      if (property?.id) {
        loadPeople();
      }
    }, [property?.id])
  );

  const loadPeople = async () => {
    if (property?.id) {
      const allPeople = await getPeople();
      const propertyPeople = allPeople.filter(p => p.propertyId === property.id);
      setPeople(propertyPeople);
    }
  };

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handlePropertyTypeSelect = (type) => {
    setPropertyType(type);
    setStep(2);
  };

  const handleAddressSubmit = () => {
    if (address.trim()) {
      setStep(3);
    }
  };


  const handleSave = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter a property address');
      return;
    }

    const propertyData = {
      id: isEditing ? property.id : Date.now().toString(),
      address: address.trim(),
      propertyType,
      imageUri,
      createdAt: isEditing ? property.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveProperty(propertyData);
    
    Alert.alert('Success', isEditing ? 'Property updated successfully' : 'Property added successfully', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Add your property</Text>
      <View style={styles.divider} />
      
      <View style={styles.propertyTypesContainer}>
        {PROPERTY_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.propertyTypeCard,
              propertyType === type.id && styles.propertyTypeCardSelected
            ]}
            onPress={() => handlePropertyTypeSelect(type.id)}
          >
            <View style={styles.propertyIconContainer}>
              <Ionicons name={type.icon} size={40} color="#999" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={() => setStep(2)}
      >
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Enter your address</Text>
      
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Street Address"
          placeholderTextColor="#999"
        />
      </View>
      
      <TouchableOpacity 
        style={styles.arrowButton}
        onPress={handleAddressSubmit}
        disabled={!address.trim()}
      >
        <Ionicons name="arrow-forward" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContainer} contentContainerStyle={styles.step3Content}>
      <Text style={styles.stepTitle}>{address || '604 7th Ave'}</Text>
      <View style={styles.divider} />
      
      <View style={styles.mapSection}>
        <Text style={styles.sectionLabel}>Map</Text>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="location" size={80} color="#ccc" />
        </View>
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

      <TouchableOpacity style={styles.completeButton} onPress={handleSave}>
        <Ionicons name="checkmark" size={24} color="#fff" />
        <Text style={styles.completeButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          {step > 1 ? (
            <Ionicons name="chevron-back" size={28} color="#333" />
          ) : (
            <Ionicons name="close" size={28} color="#333" />
          )}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dwell Secure</Text>
        <View style={{ width: 28 }} />
      </View>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
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
  propertyTypeCardSelected: {
    backgroundColor: '#E8E8E8',
    borderWidth: 2,
    borderColor: '#999',
  },
  propertyIconContainer: {
    padding: 10,
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
  step3Content: {
    paddingBottom: 100,
  },
  mapSection: {
    marginBottom: 30,
  },
  mapPlaceholder: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    height: 200,
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
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
