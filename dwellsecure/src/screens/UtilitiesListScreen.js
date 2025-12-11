import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getUtilities, deleteUtility } from '../services/storage';
import UtilityCard from '../components/UtilityCard';

export default function UtilitiesListScreen({ navigation }) {
  const [utilities, setUtilities] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadUtilities();
    }, [])
  );

  const loadUtilities = async () => {
    const data = await getUtilities();
    setUtilities(data);
  };

  const handleAdd = () => {
    navigation.navigate('AddEditUtility', { utility: null });
  };

  const handleEdit = (utility) => {
    navigation.navigate('AddEditUtility', { utility });
  };

  const handleDelete = async (id) => {
    await deleteUtility(id);
    loadUtilities();
  };

  return (
    <View style={styles.container}>
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
});
