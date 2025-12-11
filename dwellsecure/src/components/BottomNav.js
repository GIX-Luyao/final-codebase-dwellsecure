import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();

  const getCurrentRoute = () => {
    const state = navigation.getState();
    if (!state) return null;
    
    // Get the current route from the root navigator
    const currentRoute = state.routes[state.index];
    if (!currentRoute) return null;
    
    // If we're in a nested stack, get the nested route
    if (currentRoute.state && currentRoute.state.routes) {
      const nestedIndex = currentRoute.state.index;
      if (nestedIndex !== undefined && currentRoute.state.routes[nestedIndex]) {
        const nestedRoute = currentRoute.state.routes[nestedIndex];
        // Check if there's another level of nesting (e.g., ShutoffsStack -> ShutoffsList)
        if (nestedRoute.state && nestedRoute.state.routes) {
          const deepNestedIndex = nestedRoute.state.index;
          if (deepNestedIndex !== undefined && nestedRoute.state.routes[deepNestedIndex]) {
            return nestedRoute.state.routes[deepNestedIndex].name;
          }
        }
        return nestedRoute.name;
      }
    }
    
    return currentRoute.name;
  };

  const getActiveIndex = () => {
    const routeName = getCurrentRoute();
    
    // Tab 0: Property/Utility (PropertyList, ShutoffsList, UtilitiesList, Property, PropertyDetail, ShutoffDetail, UtilityDetail, PersonDetail)
    if (routeName === 'PropertyList' || routeName === 'ShutoffsList' || routeName === 'Shutoffs' || routeName === 'UtilitiesList' || routeName === 'Utilities' || routeName === 'Property' || routeName === 'PropertyDetail' || routeName === 'ShutoffDetail' || routeName === 'UtilityDetail' || routeName === 'PersonDetail') {
      return 0;
    } 
    // Tab 1: Reminders
    else if (routeName === 'Reminders') {
      return 1;
    } 
    // Tab 2: AI Assistance
    else if (routeName === 'AIAssistance' || routeName === 'Finder') {
      return 2;
    }
    // Tab 3: Share
    else if (routeName === 'Share') {
      return 3;
    }
    return -1;
  };

  const activeIndex = getActiveIndex();
  
  // Get current route
  const currentRoute = getCurrentRoute();
  
  // Hide nav only on add/edit screens (not detail screens)
  const hideNavScreens = [
    'AddEditShutoff',
    'AddEditUtility',
    'AddProperty',
    'AddPerson',
    'EditProperty',
    'EmergencyMode',
    'MapPicker',
  ];
  
  // Hide nav only on add/edit screens
  if (currentRoute && hideNavScreens.includes(currentRoute)) {
    return null;
  }
  
  // Show nav on all other screens (main screens and their parent stacks)
  // If activeIndex is -1 but we're not on a detail screen, still show nav
  // (this handles cases where route detection might not work perfectly)

  const handleNavPress = (index) => {
    switch (index) {
      case 0:
        // Navigate to PropertyList (first tab - Property/Utility)
        navigation.navigate('Property');
        break;
      case 1:
        // Navigate to Reminders
        navigation.navigate('Reminders');
        break;
      case 2:
        // Navigate to AI Assistance
        navigation.navigate('AIAssistance');
        break;
      case 3:
        // Navigate to Share
        navigation.navigate('Share');
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.bottomNav}>
      {[0, 1, 2, 3].map((index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.navItem,
            activeIndex === index && styles.navItemActive,
          ]}
          onPress={() => handleNavPress(index)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    backgroundColor: '#E8E8E8',
    gap: 12,
    zIndex: 100,
    elevation: 10,
  },
  navItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  navItemActive: {
    backgroundColor: '#999',
  },
});

