import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { saveUtility, getUtility } from '../services/storage';

export default function AddEditUtilityScreen({ route, navigation }) {
  const { utility } = route.params || {};
  const isEditing = !!utility;

  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [photoName, setPhotoName] = useState('');

  useEffect(() => {
    if (isEditing && utility) {
      loadUtilityData();
    }
  }, []);

  const loadUtilityData = async () => {
    const data = await getUtility(utility.id);
    if (data) {
      setDescription(data.description || '');
      setLocation(data.location || '');
      setContact(data.contact || '');
      setPhotoUri(data.photoUri || null);
      setPhotoName(data.photoName || '');
    }
  };

  const pickPhoto = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
        setPhotoName(result.assets[0].name);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick photo');
    }
  };

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description for the utility');
      return;
    }

    const utilityData = {
      id: isEditing ? utility.id : Date.now().toString(),
      description: description.trim(),
      location: location.trim(),
      contact: contact.trim(),
      photoUri,
      photoName,
      createdAt: isEditing ? utility.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveUtility(utilityData);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g., Water, Gas, Electric"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., Main panel location"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact</Text>
          <TextInput
            style={styles.input}
            value={contact}
            onChangeText={setContact}
            placeholder="e.g., Provider name or phone number"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Photo/Video</Text>
          <TouchableOpacity style={styles.photoButton} onPress={pickPhoto}>
            <Ionicons name="camera" size={24} color="#666" />
            <Text style={styles.photoButtonText}>
              {photoName || 'Add Photo'}
            </Text>
          </TouchableOpacity>
          {photoUri && (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photoUri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => {
                  setPhotoUri(null);
                  setPhotoName('');
                }}
              >
                <Text style={styles.removePhotoText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Update' : 'Save'} Utility
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  photoButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  photoPreview: {
    marginTop: 15,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removePhotoButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  removePhotoText: {
    color: '#ff4444',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#A8A8A8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
