import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { getShutoff, saveShutoff, getPeople, savePerson } from '../services/storage';

export default function ShutoffDetailScreen({ route }) {
  const navigation = useNavigation();
  const { shutoffId } = route.params || {};
  const isEditing = !!shutoffId;

  const [activeTab, setActiveTab] = useState('shutoff');
  const [name, setName] = useState('Gas shutoff');
  const [location, setLocation] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [videoUri, setVideoUri] = useState(null);
  const [profile, setProfile] = useState('');
  const [role, setRole] = useState('');
  const [maintenanceDate, setMaintenanceDate] = useState('2025-11-19');
  const [markComplete, setMarkComplete] = useState(false);
  const [contactName, setContactName] = useState('Mark Plumber');
  const [contactPhone, setContactPhone] = useState('123-456-7890');

  useEffect(() => {
    if (isEditing) {
      loadShutoffData();
    }
  }, [shutoffId]);

  const loadShutoffData = async () => {
    const data = await getShutoff(shutoffId);
    if (data) {
      setName(data.name || '');
      setLocation(data.location || '');
      setPhotoUri(data.photoUri || null);
      setVideoUri(data.videoUri || null);
    }
  };

  const pickMedia = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: type === 'photo' ? 'image/*' : 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (type === 'photo') {
          setPhotoUri(result.assets[0].uri);
        } else {
          setVideoUri(result.assets[0].uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for the shutoff');
      return;
    }

    const shutoffData = {
      id: isEditing ? shutoffId : Date.now().toString(),
      name: name.trim(),
      location: location.trim(),
      photoUri,
      videoUri,
      profile: profile.trim(),
      role: role.trim(),
      maintenanceDate,
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      createdAt: isEditing ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveShutoff(shutoffData);
    Alert.alert('Success', 'Shutoff saved successfully', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const renderShutoffTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>Location</Text>
        <View style={styles.locationRow}>
          <View style={styles.locationIcon}>
            <Ionicons name="location" size={40} color="#999" />
          </View>
          <TextInput
            style={styles.locationInput}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter location"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>Photo/Video</Text>
        <View style={styles.mediaGrid}>
          {photoUri ? (
            <TouchableOpacity onPress={() => pickMedia('photo')} style={styles.mediaItem}>
              <Image source={{ uri: photoUri }} style={styles.mediaImage} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => pickMedia('photo')} style={styles.mediaPlaceholder}>
              <Ionicons name="image-outline" size={30} color="#999" />
            </TouchableOpacity>
          )}
          
          {videoUri ? (
            <TouchableOpacity onPress={() => pickMedia('video')} style={styles.mediaItem}>
              <View style={styles.videoPlaceholder}>
                <Ionicons name="videocam" size={30} color="#999" />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => pickMedia('video')} style={styles.mediaPlaceholder}>
              <Ionicons name="videocam-outline" size={30} color="#999" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity onPress={() => pickMedia('photo')} style={styles.mediaPlaceholder}>
            <Ionicons name="image-outline" size={30} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => pickMedia('video')} style={styles.mediaPlaceholder}>
            <Ionicons name="videocam-outline" size={30} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>Maintenance reminder</Text>
        <View style={styles.reminderCard}>
          <Ionicons name="calendar-outline" size={20} color="#666" />
          <View style={styles.reminderContent}>
            <TextInput
              style={styles.reminderDate}
              value={maintenanceDate}
              onChangeText={setMaintenanceDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
            <View style={styles.reminderRow}>
              <Text style={styles.reminderLabel}>Mark complete</Text>
              <TouchableOpacity
                onPress={() => setMarkComplete(!markComplete)}
                style={styles.checkbox}
              >
                {markComplete && <Ionicons name="checkmark" size={16} color="#0066cc" />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>Contact</Text>
        <View style={styles.contactCard}>
          <Ionicons name="person-circle-outline" size={24} color="#666" />
          <View style={styles.contactInfo}>
            <TextInput
              style={styles.contactName}
              value={contactName}
              onChangeText={setContactName}
              placeholder="Contact name"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.contactPhone}
              value={contactPhone}
              onChangeText={setContactPhone}
              placeholder="Phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="pencil-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderAddPeopleTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>Profile</Text>
        <View style={styles.profileRow}>
          <View style={styles.profileIcon}>
            <Ionicons name="person" size={40} color="#999" />
          </View>
          <TextInput
            style={styles.profileInput}
            value={profile}
            onChangeText={setProfile}
            placeholder="Enter name"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>Role</Text>
        <View style={styles.roleInputContainer}>
          <TextInput
            style={styles.roleInput}
            value={role}
            onChangeText={setRole}
            placeholder="Enter role"
            placeholderTextColor="#999"
            multiline
          />
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>Contact info</Text>
        <View style={styles.contactInfoContainer}>
          <View style={styles.contactInfoPlaceholder} />
          <View style={styles.contactInfoPlaceholder} />
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraSection}>
        <View style={styles.cameraPlaceholder}>
          <Ionicons name="camera-outline" size={60} color="#ccc" />
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shutoff' && styles.activeTab]}
          onPress={() => setActiveTab('shutoff')}
        >
          <Text style={[styles.tabText, activeTab === 'shutoff' && styles.activeTabText]}>
            {name}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'people' && styles.activeTab]}
          onPress={() => setActiveTab('people')}
        >
          <Text style={[styles.tabText, activeTab === 'people' && styles.activeTabText]}>
            Add people
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'shutoff' ? renderShutoffTab() : renderAddPeopleTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  cameraSection: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  cameraPlaceholder: {
    width: '100%',
    aspectRatio: 1.2,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 20,
  },
  tab: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#333',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formSection: {
    marginTop: 15,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mediaItem: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  mediaPlaceholder: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  reminderContent: {
    flex: 1,
    marginLeft: 12,
  },
  reminderDate: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderLabel: {
    fontSize: 14,
    color: '#666',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '0%',
    backgroundColor: '#0066cc',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    alignSelf: 'center',
    marginTop: 10,
    padding: 10,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  roleInputContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
  },
  roleInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  contactInfoContainer: {
    gap: 10,
  },
  contactInfoPlaceholder: {
    height: 60,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#ccc',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 30,
    marginHorizontal: 40,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
