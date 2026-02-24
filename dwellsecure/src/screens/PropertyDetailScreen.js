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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{getStreetAddress(property) || property?.address || 'Address'}</Text>
          <View style={styles.headerActions}>
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
              navigation.navigate('EditProperty', {
                property,
                initialStep: 3,
              });
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
              <View style={styles.imageOverlay} pointerEvents="none">
                <Text style={styles.imageOverlayText} numberOfLines={2}>
                  {addressText}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Utility Shutoffs</Text>
          </View>
          <View style={styles.utilitiesFocusList}>
            {utilityTypes.map((t) => {
              const utility = findUtilityForType(t.key);
              const firstPhoto =
                utility?.photos && Array.isArray(utility.photos) && utility.photos.length > 0 ? utility.photos[0] : null;

              return (
                <TouchableOpacity
                  key={t.key}
                  style={styles.utilityFocusCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (utility?.id) {
                      navigation.navigate('UtilityDetail', { utilityId: utility.id });
                      return;
                    }
                    navigation.navigate('AddEditUtility', {
                      utility: null,
                      propertyId,
                      presetDescription: t.label,
                    });
                  }}
                >
                  <View style={styles.utilityFocusLeft}>
                    <View style={styles.utilityFocusIconWrap}>
                      <Ionicons name={t.icon} size={18} color={colors.text} />
                    </View>
                    <View style={styles.utilityFocusText}>
                      <Text style={styles.utilityFocusTitle}>{t.label}</Text>
                      <Text style={styles.utilityFocusSubtitle}>{utility?.id ? 'View details' : 'Tap to add'}</Text>
                    </View>
                  </View>

                  <View style={styles.utilityFocusRight}>
                    {firstPhoto ? (
                      <Image source={{ uri: firstPhoto }} style={styles.utilityFocusThumb} />
                    ) : (
                      <View style={styles.utilityFocusThumbPlaceholder}>
                        <Ionicons name={utility?.id ? 'image-outline' : 'add'} size={18} color="#999" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.utilityFocusCard}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('AddEditUtility', {
                  utility: null,
                  propertyId,
                })
              }
            >
              <View style={styles.utilityFocusLeft}>
                <View style={styles.utilityFocusIconWrap}>
                  <Ionicons name="add" size={18} color={colors.text} />
                </View>
                <View style={styles.utilityFocusText}>
                  <Text style={styles.utilityFocusTitle}>Add another utility shutoff</Text>
                  <Text style={styles.utilityFocusSubtitle}>Create an additional shutoff beyond Gas, Electricity, and Water</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Utility Equipments</Text>
          </View>
          <View style={styles.shutoffsGrid}>
            {['gas', 'electric', 'water'].map((type, index) => {
              // Find shutoff of this type
              const shutoff = Array.isArray(shutoffs) 
                ? shutoffs.find(s => {
                    const normalizedType = s.type === 'fire' ? 'gas' : s.type === 'power' ? 'electric' : s.type;
                    return normalizedType === type;
                  })
                : null;
              
              const icons = ['flame-outline', 'flash-outline', 'water-outline'];
              const typeLabels = ['gas', 'electric', 'water'];
              
              if (shutoff && shutoff.id) {
                // Get first photo if available
                const firstPhoto = shutoff.photos && Array.isArray(shutoff.photos) && shutoff.photos.length > 0 
                  ? shutoff.photos[0] 
                  : null;
                
                return (
                  <View key={shutoff.id} style={styles.gridItemContainer}>
                    <Ionicons name={icons[index]} size={18} color={colors.text} style={styles.gridItemIcon} />
                    <TouchableOpacity
                      style={styles.gridItem}
                      onPress={() => navigation.navigate('ShutoffDetail', { shutoffId: shutoff.id })}
                    >
                      {firstPhoto ? (
                        <Image source={{ uri: firstPhoto }} style={styles.gridItemImage} />
                      ) : (
                        <View style={styles.gridItemPlaceholder}>
                          <Ionicons name="image-outline" size={26} color="#ccc" />
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              } else {
                // Show add button for this type
                return (
                  <View key={`placeholder-${type}`} style={styles.gridItemContainer}>
                    <Ionicons name={icons[index]} size={18} color={colors.text} style={styles.gridItemIcon} />
                    <TouchableOpacity
                      style={styles.gridItem}
                      onPress={() => navigation.navigate('AddEditShutoff', { shutoff: null, type: typeLabels[index], propertyId: propertyId })}
                    >
                      <View style={styles.gridItemPlaceholder}>
                        <Ionicons name="add" size={26} color="#999" />
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              }
            })}
          </View>
          <TouchableOpacity
            style={styles.utilityEquipmentAddRow}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('AddEditShutoff', {
                shutoff: null,
                type: null,
                propertyId,
              })
            }
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.text} />
            <Text style={styles.utilityEquipmentAddText}>Add another utility equipment</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
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
                <Ionicons name="add" size={30} color="#999" />
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
    paddingBottom: 10,
  },
  propertyImageWrap: {
    width: '100%',
    height: 120,
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
    paddingVertical: 15,
  },
  sectionHeader: {
    marginBottom: 15,
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
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  addPersonText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
