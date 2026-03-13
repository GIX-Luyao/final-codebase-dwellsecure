import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getShutoffs, deleteShutoff, getProperties } from '../services/storage';
import { isEmergencyMode } from '../services/modeService';
import ShutoffCard from '../components/ShutoffCard';
import ApiStatusIndicator from '../components/ApiStatusIndicator';
import { colors, spacing, borderRadius } from '../constants/theme';

export default function ShutoffsListScreen({ navigation }) {
  const [shutoffs, setShutoffs] = useState([]);
  const [isInEmergencyMode, setIsInEmergencyMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useFocusEffect(
    useCallback(() => {
      checkMode();
      loadShutoffs();
    }, [])
  );

  const checkMode = async () => {
    const inEmergency = await isEmergencyMode();
    setIsInEmergencyMode(inEmergency);
  };

  const loadShutoffs = async () => {
    try {
      setErrorMessage(null);
      const data = await getShutoffs();
      // Ensure data is always an array to prevent crashes
      setShutoffs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[ShutoffsList] Error loading shutoffs:', error);
      // Set empty array on error to show empty state instead of crashing
      setShutoffs([]);
      // Show user-friendly error message
      if (error.message && error.message.includes('Network')) {
        setErrorMessage('Network error: Unable to load shutoffs. Check your connection.');
      } else if (error.message && error.message.includes('API_UNAVAILABLE')) {
        setErrorMessage('Server unavailable: Using local data only.');
      } else {
        setErrorMessage('Error loading shutoffs. Please try again.');
      }
    }
  };

  const handleAdd = async () => {
    if (isInEmergencyMode) {
      Alert.alert('Emergency Mode', 'Cannot create shutoff records in Emergency Mode.');
      return;
    }
    const properties = await getProperties();
    const propertyId = Array.isArray(properties) && properties.length > 0 ? properties[0].id : undefined;
    navigation.navigate('AddEditShutoff', { shutoff: null, propertyId });
  };

  const handleEdit = (shutoff) => {
    if (isInEmergencyMode) {
      Alert.alert('Emergency Mode', 'Cannot edit shutoff records in Emergency Mode.');
      return;
    }
    navigation.navigate('AddEditShutoff', { shutoff });
  };

  const handleDelete = async (id) => {
    try {
      await deleteShutoff(id);
      loadShutoffs();
    } catch (error) {
      console.error('[ShutoffsList] Error deleting shutoff:', error);
      Alert.alert('Error', 'Failed to delete shutoff. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ApiStatusIndicator />
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color={colors.error} />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={() => setErrorMessage(null)}>
            <Ionicons name="close" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shutoffs</Text>
        {isInEmergencyMode && (
          <View style={styles.emergencyBadge}>
            <Ionicons name="alert-circle" size={20} color={colors.emergency} />
            <Text style={styles.emergencyText}>Emergency Mode</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={handleAdd}
          style={[styles.addButton, isInEmergencyMode && styles.addButtonDisabled]}
          disabled={isInEmergencyMode}
        >
          <Ionicons name="add" size={28} color={isInEmergencyMode ? colors.textMuted : colors.primary} />
        </TouchableOpacity>
      </View>

      {shutoffs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="list-outline" size={64} color={colors.textMuted} />
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
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.screenPadding,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    padding: spacing.sm,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emergencyLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    gap: 6,
  },
  emergencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.emergency,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorBackground,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.error,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: colors.error,
  },
});

