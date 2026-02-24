import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getUtilities, deleteUtility, getProperties } from '../services/storage';
import UtilityCard from '../components/UtilityCard';

export default function UtilitiesListScreen({ navigation }) {
  const [utilities, setUtilities] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadUtilities();
    }, [])
  );

  const loadUtilities = async () => {
    try {
      setErrorMessage(null);
      const data = await getUtilities();
      // Ensure data is always an array to prevent crashes
      setUtilities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[UtilitiesList] Error loading utilities:', error);
      // Set empty array on error to show empty state instead of crashing
      setUtilities([]);
      // Show user-friendly error message
      if (error.message && error.message.includes('Network')) {
        setErrorMessage('Network error: Unable to load utilities. Check your connection.');
      } else if (error.message && error.message.includes('API_UNAVAILABLE')) {
        setErrorMessage('Server unavailable: Using local data only.');
      } else {
        setErrorMessage('Error loading utilities. Please try again.');
      }
    }
  };

  const handleAdd = async () => {
    const properties = await getProperties();
    const propertyId = Array.isArray(properties) && properties.length > 0 ? properties[0].id : undefined;
    navigation.navigate('AddEditUtility', { utility: null, propertyId });
  };

  const handleEdit = (utility) => {
    navigation.navigate('AddEditUtility', { utility });
  };

  const handleDelete = async (id) => {
    try {
      await deleteUtility(id);
      loadUtilities();
    } catch (error) {
      console.error('[UtilitiesList] Error deleting utility:', error);
      Alert.alert('Error', 'Failed to delete utility. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color="#d32f2f" />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={() => setErrorMessage(null)}>
            <Ionicons name="close" size={20} color="#d32f2f" />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Utilities</Text>
        <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
          <Ionicons name="add" size={28} color="#666" />
        </TouchableOpacity>
      </View>

      {utilities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="flash-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No utilities recorded</Text>
          <Text style={styles.emptySubtext}>Tap + to add your first utility</Text>
        </View>
      ) : (
        <FlatList
          data={utilities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UtilityCard
              utility={item}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 5,
  },
  list: {
    padding: 15,
    paddingBottom: 100, // Space for bottom nav
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingBottom: 100, // Space for bottom nav
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcdd2',
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#d32f2f',
  },
});
