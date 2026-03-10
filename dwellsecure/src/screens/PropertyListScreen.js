import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PropertyCard from '../components/PropertyCard';
import { getProperties, deleteProperty } from '../services/storage';
import { checkApiHealth } from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { useSync } from '../contexts/SyncContext';
import { colors, spacing, borderRadius } from '../constants/theme';

export default function PropertyListScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { lastSyncAt } = useSync();
  const [properties, setProperties] = useState([]);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadProperties();
      refreshConnectionStatus();
    }, [])
  );

  React.useEffect(() => { loadProperties(); }, [user?.id]);
  React.useEffect(() => { loadProperties(); }, [lastSyncAt]);
  React.useEffect(() => {
    let isMounted = true;

    const runCheck = async () => {
      if (isMounted) {
        setIsCheckingConnection(true);
      }
      const connected = await checkApiHealth();
      if (isMounted) {
        setIsDbConnected(connected);
        setIsCheckingConnection(false);
      }
    };

    runCheck();
    const interval = setInterval(runCheck, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const loadProperties = async () => {
    const data = await getProperties();
    setProperties(data);
  };

  const refreshConnectionStatus = async () => {
    setIsCheckingConnection(true);
    const connected = await checkApiHealth();
    setIsDbConnected(connected);
    setIsCheckingConnection(false);
  };

  const handleLongPress = (property) => {
    Alert.alert(
      'Property Options',
      'What would you like to do?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Property',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Property',
              'Are you sure you want to delete this property? This action cannot be undone.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteProperty(property.id);
                      loadProperties();
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete property');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.xl) }]}>
        <View style={styles.headerTextContainer} pointerEvents="box-none">
          <Text style={styles.headerTitle}>Dwell Secure</Text>
          <Text style={styles.headerSubtitle}>All your critical property data in one place</Text>
          <View style={[styles.connectionIndicator, isDbConnected ? styles.connectionConnected : styles.connectionDisconnected]}>
            <View style={[styles.connectionDot, isDbConnected ? styles.connectionDotConnected : styles.connectionDotDisconnected]} />
            <Text style={styles.connectionText}>
              {isCheckingConnection
                ? 'Checking backend...'
                : isDbConnected
                  ? 'Database connected'
                  : 'Database disconnected'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.contentWrap}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {properties.length > 0 ? (
          <View style={styles.propertyContainer}>
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onPress={() => navigation.navigate('PropertyDetail', { propertyId: property.id })}
                onLongPress={() => handleLongPress(property)}
              />
            ))}
            <TouchableOpacity
              style={styles.addPropertyBox}
              onPress={() => navigation.navigate('AddProperty')}
              accessibilityLabel="Add property"
            >
              <Ionicons name="add-circle-outline" size={40} color={colors.textMuted} />
              <Text style={styles.addPropertyLabel}>Add another property</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => navigation.navigate('AddProperty')}
              accessibilityLabel="Add your first property"
            >
              <Ionicons name="add" size={60} color={colors.textMuted} />
            </TouchableOpacity>
            <Text style={styles.helperText}>Click to add a property</Text>
          </View>
        )}
      </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
    minHeight: 150,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    position: 'relative',
  },
  contentWrap: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  headerTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 56,
    paddingTop: spacing.xxl + spacing.xxl,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  connectionConnected: {
    backgroundColor: '#e8f5e9',
  },
  connectionDisconnected: {
    backgroundColor: '#fff3e0',
  },
  connectionDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  connectionDotConnected: {
    backgroundColor: '#2e7d32',
  },
  connectionDotDisconnected: {
    backgroundColor: '#ef6c00',
  },
  connectionText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  content: { flex: 1 },
  contentContainer: {
    padding: spacing.screenPadding,
    paddingBottom: 120,
  },
  propertyContainer: { width: '100%' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  circleButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  helperText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  addPropertyBox: {
    width: '100%',
    minHeight: 140,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  addPropertyLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
  },
});
