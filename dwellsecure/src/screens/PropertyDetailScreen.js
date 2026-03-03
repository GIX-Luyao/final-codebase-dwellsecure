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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getProperty, getShutoffs, getUtilities, getPeople, deleteProperty } from '../services/storage';
import { getStreetAddress } from '../utils/addressUtils';
import { colors, spacing } from '../constants/theme';

export default function PropertyDetailScreen({ route }) {
  const navigation = useNavigation();
  const { propertyId } = route.params || {};
  
  const [property, setProperty] = useState(null);
  const [shutoffs, setShutoffs] = useState([]);
  const [utilities, setUtilities] = useState([]);
  const [people, setPeople] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [propertyId])
  );

  const loadData = async () => {
    try {
      const propertyData = await getProperty(propertyId);
      setProperty(propertyData || null);

      const shutoffsData = await getShutoffs();
      // Filter shutoffs by propertyId - only show shutoffs belonging to this property
      const propertyShutoffs = propertyId && Array.isArray(shutoffsData)
        ? shutoffsData.filter(s => s.propertyId === propertyId)
        : [];
      setShutoffs(propertyShutoffs);

      const utilitiesData = await getUtilities();
      // Filter utilities by propertyId - only show utilities belonging to this property
      const propertyUtilities = propertyId && Array.isArray(utilitiesData)
        ? utilitiesData.filter(u => u.propertyId === propertyId)
        : [];
      setUtilities(propertyUtilities);

      const allPeople = await getPeople();
      const propertyPeople = propertyId && Array.isArray(allPeople) 
        ? allPeople.filter(p => p.propertyId === propertyId) 
        : [];
      setPeople(propertyPeople);
    } catch (error) {
      console.error('[PropertyDetail] Error loading data:', error);
      // Set safe defaults on error
      setShutoffs([]);
      setUtilities([]);
      setPeople([]);
    }
  };

  const handleDelete = () => {
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
              await deleteProperty(propertyId);
              navigation.navigate('PropertyList');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete property');
            }
          },
        },
      ]
    );
  };

  const renderPlaceholder = (text) => (
    <View style={styles.placeholderItem}>
      <Ionicons name="image-outline" size={40} color="#ccc" />
    </View>
  );

  const addressText = property?.address || '4120 11th Ave, Seattle, Washington 98105, USA';

  const utilityTypes = [
    { key: 'gas', label: 'Gas', icon: 'flame-outline' },
    { key: 'electricity', label: 'Electricity', icon: 'flash-outline' },
    { key: 'water', label: 'Water', icon: 'water-outline' },
  ];

  const findUtilityForType = (typeKey) => {
    if (!Array.isArray(utilities)) return null;
    const normalized = (s) => String(s || '').trim().toLowerCase();

    return (
      utilities.find((u) => {
        const desc = normalized(u?.description);
        const name = normalized(u?.name);
        if (!desc && !name) return false;

        if (typeKey === 'electricity') {
          return desc.includes('electric') || name.includes('electric') || desc.includes('power') || name.includes('power');
        }
        if (typeKey === 'gas') return desc.includes('gas') || name.includes('gas');
        if (typeKey === 'water') return desc.includes('water') || name.includes('water');
        return false;
      }) || null
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerSide}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {getStreetAddress(property) || 'My Home'}
            </Text>
          </View>
          <View style={[styles.headerSide, styles.headerActions]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditProperty', { property, initialStep: 2 })}
              style={styles.headerActionButton}
              disabled={!property}
            >
              <Ionicons name="pencil" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.headerActionButton}>
              <Ionicons name="trash-outline" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.imageSection}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (!property) return;
              navigation.navigate('PropertyPhoto', { propertyId: property.id });
            }}
          >
            <View style={styles.propertyImageWrap}>
              {property?.imageUri ? (
                <Image source={{ uri: property.imageUri }} style={styles.propertyImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="image-outline" size={52} color="#ccc" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Utility Shutoffs</Text>
          </View>
          <View style={styles.utilitiesShutoffsRowWrap}>
            <View style={styles.utilitiesShutoffsRow}>
              {[
                { type: 'gas', icon: 'flame-outline', label: 'Gas' },
                { type: 'electric', icon: 'flash-outline', label: 'Electricity' },
                { type: 'water', icon: 'water-outline', label: 'Water' },
              ].map(({ type, icon, label }) => {
                const shutoff = Array.isArray(shutoffs)
                  ? shutoffs.find(s => {
                      const normalizedType = s.type === 'fire' ? 'gas' : s.type === 'power' ? 'electric' : s.type;
                      return normalizedType === type;
                    })
                  : null;
                const firstPhoto = shutoff?.photos && Array.isArray(shutoff.photos) && shutoff.photos.length > 0
                  ? shutoff.photos[0]
                  : null;

                return (
                  <View key={type} style={styles.utilityShutoffColumnWrap}>
                    <Text style={styles.utilityShutoffLabel}>{label}</Text>
                    <TouchableOpacity
                      style={styles.utilityShutoffColumn}
                      activeOpacity={0.8}
                      onPress={() => {
                        if (shutoff?.id) {
                          navigation.navigate('ShutoffDetail', { shutoffId: shutoff.id });
                          return;
                        }
                        navigation.navigate('AddEditShutoff', {
                          shutoff: null,
                          type,
                          propertyId,
                        });
                      }}
                    >
                      <View style={styles.utilityShutoffTop}>
                        <View style={styles.utilityShutoffIconWrap}>
                          <Ionicons name={icon} size={20} color={colors.text} />
                        </View>
                        {shutoff?.id && (
                          <Text style={styles.utilityShutoffSubtitle}>View details</Text>
                        )}
                      </View>
                      <View style={styles.utilityShutoffBox}>
                        {firstPhoto ? (
                          <Image source={{ uri: firstPhoto }} style={styles.utilityShutoffBoxImage} />
                        ) : !shutoff?.id ? (
                          <View style={styles.utilityShutoffBoxPlaceholder}>
                            <Text style={styles.utilityShutoffAddText}>Add</Text>
                            <View style={styles.utilityShutoffAddCircle}>
                              <Ionicons name="add" size={16} color="#1095EE" />
                            </View>
                          </View>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Other Utilities</Text>
          </View>
          <View style={styles.utilitiesShutoffsRowWrap}>
            <View style={styles.otherUtilitiesRow}>
              {utilities.map((utility) => {
                const firstPhoto =
                  utility?.photos && Array.isArray(utility.photos) && utility.photos.length > 0
                    ? utility.photos[0]
                    : null;
                return (
                  <View key={utility.id} style={styles.otherUtilityItemWrap}>
                    <TouchableOpacity
                      style={styles.utilityShutoffColumn}
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('UtilityDetail', { utilityId: utility.id })}
                    >
                      <View style={styles.utilityShutoffTop}>
                        <View style={styles.utilityShutoffIconWrap}>
                          <Ionicons
                            name={utility?.utilityIcon || 'apps-outline'}
                            size={20}
                            color={utility?.utilityIcon ? '#1095EE' : colors.textSecondary || '#999'}
                          />
                        </View>
                        <Text style={styles.utilityShutoffSubtitle}>View details</Text>
                      </View>
                      <View style={styles.utilityShutoffBox}>
                        {firstPhoto && (
                          <Image source={{ uri: firstPhoto }} style={styles.utilityShutoffBoxImage} />
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
              {/* Add button card */}
              <View style={styles.otherUtilityItemWrap}>
                <TouchableOpacity
                  style={styles.utilityShutoffColumn}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('AddEditUtility', { utility: null, propertyId })}
                >
                  <View style={styles.utilityShutoffTop}>
                    <View style={styles.utilityShutoffIconWrap}>
                      <Ionicons name="apps-outline" size={20} color={colors.textSecondary || '#999'} />
                    </View>
                  </View>
                  <View style={styles.utilityShutoffBox}>
                    <View style={[styles.utilityShutoffBoxPlaceholder, { marginTop: -20 }]}>
                      <Text style={styles.utilityShutoffAddText}>Add</Text>
                      <View style={styles.utilityShutoffAddCircle}>
                        <Ionicons name="add" size={16} color="#1095EE" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderPeople}>
            <Text style={styles.sectionTitle}>People</Text>
            <Text style={styles.sectionSubtitle}>
              Add a family member or renter to share how to operate your utility shutoffs and equipment.
            </Text>
          </View>
          <View style={styles.peopleContainer}>
            {people.map((person) => (
              <TouchableOpacity
                key={person.id}
                style={styles.personItem}
                onPress={() => navigation.navigate('PersonDetail', { personId: person.id })}
              >
                {person.profilePhoto ? (
                  <Image source={{ uri: person.profilePhoto }} style={styles.personAvatarImage} />
                ) : (
                  <View style={styles.personAvatar}>
                    <Ionicons name="person" size={40} color="#999" />
                  </View>
                )}
                <Text style={styles.personName}>{person.name}</Text>
                {person.role && <Text style={styles.personRole}>{person.role}</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addPersonButton}
              onPress={() => navigation.navigate('AddPerson', { propertyId: propertyId })}
            >
              <View style={styles.addPersonCircle}>
                <Ionicons name="add" size={30} color="#1095EE" />
              </View>
              <Text style={styles.addPersonText}>Add Person</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    backgroundColor: colors.background,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSide: {
    minWidth: 92,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingRight: 6,
  },
  backText: {
    marginLeft: 2,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerActions: {
    justifyContent: 'flex-end',
  },
  headerActionButton: {
    marginLeft: 12,
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100, // Space for bottom nav
  },
  imageSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 6,
  },
  propertyImageWrap: {
    width: '100%',
    aspectRatio: 2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  imageOverlayText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionHeaderPeople: {
    marginBottom: 12,
  },
  sectionSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary || '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  shutoffsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  utilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  utilitiesShutoffsRowWrap: {
    width: '98%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  utilitiesShutoffsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 14,
  },
  otherUtilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  otherUtilityItemWrap: {
    flexBasis: '30%',
    flexGrow: 1,
    flexShrink: 0,
    maxWidth: '32%',
    gap: 6,
  },
  utilityShutoffColumnWrap: {
    flex: 1,
    gap: 6,
  },
  utilityShutoffLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  utilityShutoffColumn: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border || '#ddd',
    borderRadius: 12,
    paddingTop: 12,
    paddingBottom: 6,
    paddingHorizontal: 12,
  },
  utilityShutoffTop: {
    alignItems: 'center',
    marginBottom: 0,
  },
  utilityShutoffIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 10,
    marginBottom: 10,
  },
  utilityShutoffTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  utilityShutoffSubtitle: {
    marginTop: 9,
    fontSize: 12,
    color: colors.textSecondary || '#666',
  },
  utilityShutoffBox: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 56,
    maxHeight: 56,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  utilityShutoffBoxImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  utilityShutoffBoxPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: -20,
  },
  utilityShutoffAddText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1095EE',
  },
  utilityShutoffAddCircle: {
    width: 20,
    height: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1095EE',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addUtilityShutoffButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  addUtilityShutoffButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  utilitiesFocusList: {
    gap: 12,
  },
  utilityFocusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  utilityFocusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  utilityFocusIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  utilityFocusText: {
    flex: 1,
  },
  utilityFocusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  utilityFocusSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary || '#666',
  },
  utilityFocusRight: {
    marginLeft: 10,
  },
  utilityFocusThumb: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },
  utilityFocusThumbPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridItemContainer: {
    width: '30%',
    alignItems: 'center',
    marginRight: '3.33%',
    marginBottom: 10,
  },
  gridItemIcon: {
    marginBottom: 8,
  },
  gridItem: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  utilityGridItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: '3.33%',
    marginBottom: 10,
  },
  gridItemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  gridItemPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderItem: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
  },
  addItemPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
  },
  peopleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  personItem: {
    alignItems: 'center',
    width: 100,
    marginRight: 15,
    marginBottom: 15,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border || '#ddd',
    backgroundColor: colors.background,
  },
  personAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  personAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  personName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  personRole: {
    fontSize: 12,
    color: '#666',
  },
  addPersonButton: {
    alignItems: 'center',
    width: 100,
  },
  addPersonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1095EE',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  addPersonText: {
    fontSize: 12,
    color: '#1095EE',
    fontWeight: '600',
    textAlign: 'center',
  },
});
