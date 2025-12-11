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
    const propertyData = await getProperty();
    setProperty(propertyData);

    const shutoffsData = await getShutoffs();
    setShutoffs(shutoffsData);

    const utilitiesData = await getUtilities();
    setUtilities(utilitiesData);

    const peopleData = await getPeople();
    setPeople(peopleData);
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
              await deleteProperty();
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
          <Text style={styles.headerTitle}>{property?.address || '604 7th Ave'}</Text>
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

      <ScrollView style={styles.content}>
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
          <View style={styles.itemsGrid}>
            {shutoffs.slice(0, 3).map((shutoff, index) => {
              const icons = ['flame-outline', 'flash-outline', 'water'];
              return (
                <View key={shutoff.id} style={styles.gridItemContainer}>
                  <Ionicons name={icons[index]} size={20} color="#333" style={styles.gridItemIcon} />
                  <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => navigation.navigate('ShutoffDetail', { shutoffId: shutoff.id })}
                  >
                    {shutoff.photoUri ? (
                      <Image source={{ uri: shutoff.photoUri }} style={styles.gridItemImage} />
                    ) : (
                      <View style={styles.gridItemPlaceholder}>
                        <Ionicons name="image-outline" size={30} color="#ccc" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
            {[...Array(Math.max(0, 3 - shutoffs.length))].map((_, index) => {
              const icons = ['flame-outline', 'flash-outline', 'water'];
              const types = ['fire', 'power', 'water'];
              const iconIndex = shutoffs.length + index;
              return (
                <View key={`placeholder-${index}`} style={styles.gridItemContainer}>
                  <Ionicons name={icons[iconIndex]} size={20} color="#333" style={styles.gridItemIcon} />
                  <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => navigation.navigate('AddEditShutoff', { shutoff: null, type: types[iconIndex] })}
                  >
                    <View style={styles.gridItemPlaceholder}>
                      <Ionicons name="add-circle-outline" size={40} color="#999" />
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Utilities</Text>
          </View>
          <View style={styles.itemsGrid}>
            {utilities.slice(0, 3).map((utility) => (
              <TouchableOpacity
                key={utility.id}
                style={styles.utilityGridItem}
                onPress={() => navigation.navigate('UtilityDetail', { utilityId: utility.id })}
              >
                {utility.photoUri ? (
                  <Image source={{ uri: utility.photoUri }} style={styles.gridItemImage} />
                ) : (
                  <View style={styles.gridItemPlaceholder}>
                    <Ionicons name="image-outline" size={30} color="#ccc" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
            {[...Array(Math.max(0, 3 - utilities.length))].map((_, index) => (
              <TouchableOpacity
                key={`add-utility-${index}`}
                style={styles.utilityGridItem}
                onPress={() => navigation.navigate('AddEditUtility', { utility: null })}
              >
                <View style={styles.addItemPlaceholder}>
                  <Ionicons name="add-circle-outline" size={30} color="#999" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>People</Text>
          </View>
          <View style={styles.itemsGrid}>
            {people.slice(0, 1).map((person) => (
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
                <Text style={styles.personRole}>{person.role}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addPersonButton}
              onPress={() => navigation.navigate('AddPerson')}
            >
              <View style={styles.addPersonCircle}>
                <Ionicons name="add" size={30} color="#999" />
              </View>
            </TouchableOpacity>
            {[...Array(Math.max(0, 1 - people.length))].map((_, index) => (
              <View key={`person-placeholder-${index}`} style={styles.utilityGridItem}>
                {renderPlaceholder()}
              </View>
            ))}
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
    justifyContent: 'space-between',
  },
  gridItemContainer: {
    width: '30%',
    alignItems: 'center',
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
  personItem: {
    alignItems: 'center',
    marginRight: 20,
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
  },
});
