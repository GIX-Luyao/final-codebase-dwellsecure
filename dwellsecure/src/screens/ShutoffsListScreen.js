import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getShutoffs, deleteShutoff } from '../services/storage';
import ShutoffCard from '../components/ShutoffCard';

export default function ShutoffsListScreen({ navigation }) {
  const [shutoffs, setShutoffs] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadShutoffs();
    }, [])
  );

  const loadShutoffs = async () => {
    const data = await getShutoffs();
    setShutoffs(data);
  };

  const handleAdd = () => {
    navigation.navigate('AddEditShutoff', { shutoff: null });
  };

  const handleEdit = (shutoff) => {
    navigation.navigate('AddEditShutoff', { shutoff });
  };

  const handleDelete = async (id) => {
    await deleteShutoff(id);
    loadShutoffs();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shutoffs</Text>
        <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
          <Ionicons name="add" size={28} color="#0066cc" />
        </TouchableOpacity>
      </View>

      {shutoffs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="list-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No shutoffs recorded</Text>
          <Text style={styles.emptySubtext}>Tap + to add your first shutoff</Text>
        </View>
      ) : (
        <FlatList
          data={shutoffs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ShutoffCard
              shutoff={item}
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

