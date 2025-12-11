import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getUtility, deleteUtility } from '../services/storage';

export default function UtilityDetailScreen({ route }) {
  const navigation = useNavigation();
  const { utilityId } = route.params || {};

  const [utility, setUtility] = useState(null);

  useEffect(() => {
    if (utilityId) {
      loadUtility();
    }
  }, [utilityId]);

  const loadUtility = async () => {
    const data = await getUtility(utilityId);
    if (data) {
      setUtility(data);
    }
  };

  const handleEdit = () => {
    navigation.navigate('AddEditUtility', { utility });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Utility',
      'Are you sure you want to delete this utility?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUtility(utilityId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete utility');
            }
          },
        },
      ]
    );
  };

  if (!utility) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Utility Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Utility Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
            <Ionicons name="pencil" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
            <Ionicons name="trash-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionValue}>{utility.description || 'No description'}</Text>
        </View>

        {utility.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.sectionValue}>{utility.location}</Text>
          </View>
        )}

        {utility.contact && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.sectionValue}>{utility.contact}</Text>
          </View>
        )}

        {utility.photoUri && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photo</Text>
            <Image source={{ uri: utility.photoUri }} style={styles.photo} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionValue: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  photo: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    resizeMode: 'cover',
    marginTop: 10,
  },
});

