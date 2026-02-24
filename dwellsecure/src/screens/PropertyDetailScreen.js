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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getProperty, getShutoffs, getUtilities, getPeople, deleteProperty } from '../services/storage';
import { getStreetAddress } from '../utils/addressUtils';

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{getStreetAddress(property) || property?.address || 'Address'}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => navigation.navigate('EditProperty')} style={styles.headerActionButton}>
              <Ionicons name="pencil" size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.headerActionButton}>
              <Ionicons name="trash-outline" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.imageSection}>
          {property?.imageUri ? (
            <Image source={{ uri: property.imageUri }} style={styles.propertyImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={80} color="#ccc" />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shutoffs</Text>
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
                    <Ionicons name={icons[index]} size={20} color="#333" style={styles.gridItemIcon} />
                    <TouchableOpacity
                      style={styles.gridItem}
                      onPress={() => navigation.navigate('ShutoffDetail', { shutoffId: shutoff.id })}
                    >
                      {firstPhoto ? (
                        <Image source={{ uri: firstPhoto }} style={styles.gridItemImage} />
                      ) : (
                        <View style={styles.gridItemPlaceholder}>
                          <Ionicons name="image-outline" size={30} color="#ccc" />
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              } else {
                // Show add button for this type
                return (
                  <View key={`placeholder-${type}`} style={styles.gridItemContainer}>
                    <Ionicons name={icons[index]} size={20} color="#333" style={styles.gridItemIcon} />
                    <TouchableOpacity
                      style={styles.gridItem}
                      onPress={() => navigation.navigate('AddEditShutoff', { shutoff: null, type: typeLabels[index], propertyId: propertyId })}
                    >
                      <View style={styles.gridItemPlaceholder}>
                        <Ionicons name="add-circle-outline" size={40} color="#999" />
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              }
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Utilities</Text>
          </View>
          <View style={styles.utilitiesGrid}>
            {Array.isArray(utilities) && utilities.map((utility) => {
              if (!utility || !utility.id) return null;
              // Get first photo if available
              const firstPhoto = utility.photos && Array.isArray(utility.photos) && utility.photos.length > 0 
                ? utility.photos[0] 
                : null;
              
              return (
                <TouchableOpacity
                  key={utility.id}
                  style={styles.utilityGridItem}
                  onPress={() => navigation.navigate('UtilityDetail', { utilityId: utility.id })}
                >
                  {firstPhoto ? (
                    <Image source={{ uri: firstPhoto }} style={styles.gridItemImage} />
                  ) : (
                    <View style={styles.gridItemPlaceholder}>
                      <Ionicons name="image-outline" size={30} color="#ccc" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
            {/* Add button always in next position */}
            <TouchableOpacity
              style={styles.utilityGridItem}
              onPress={() => navigation.navigate('AddEditUtility', { utility: null, propertyId: propertyId })}
            >
              <View style={styles.addItemPlaceholder}>
                <Ionicons name="add-circle-outline" size={30} color="#999" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>People</Text>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 10,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    marginLeft: 15,
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
  propertyImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
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
