import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../constants/theme';

const TABS = [
  { index: 0, label: 'Property', icon: 'home-outline', iconActive: 'home' },
  { index: 1, label: 'Reminders', icon: 'calendar-outline', iconActive: 'calendar' },
  { index: 2, label: 'Finder', icon: 'search-outline', iconActive: 'search' },
  { index: 3, label: 'Share', icon: 'share-outline', iconActive: 'share-social' },
];

export default function BottomNav() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const getCurrentRoute = () => {
    const state = navigation.getState();
    if (!state) return null;
    const currentRoute = state.routes[state.index];
    if (!currentRoute) return null;
    if (currentRoute.state?.routes) {
      const nestedIndex = currentRoute.state.index;
      if (nestedIndex !== undefined && currentRoute.state.routes[nestedIndex]) {
        const nestedRoute = currentRoute.state.routes[nestedIndex];
        if (nestedRoute.state?.routes) {
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
    if (['PropertyList', 'ShutoffsList', 'Shutoffs', 'UtilitiesList', 'Utilities', 'Property', 'PropertyDetail', 'ShutoffDetail', 'UtilityDetail', 'PersonDetail'].includes(routeName)) return 0;
    if (routeName === 'Reminders') return 1;
    if (['AIAssistance', 'Finder'].includes(routeName)) return 2;
    if (routeName === 'Share') return 3;
    return -1;
  };

  const currentRoute = getCurrentRoute();
  const activeIndex = getActiveIndex();

  const hideNavScreens = [
    'AddProperty', 'AddPerson', 'EditProperty', 'EmergencyMode',
    'MapPicker', 'Success', 'AddEditShutoff', 'AddEditUtility',
  ];
  if (currentRoute && hideNavScreens.includes(currentRoute)) {
    return null;
  }

  const handleNavPress = (index) => {
    switch (index) {
      case 0: navigation.navigate('Property'); break;
      case 1: navigation.navigate('Reminders'); break;
      case 2: navigation.navigate('AIAssistance'); break;
      case 3: navigation.navigate('Share'); break;
      default: break;
    }
  };

  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {TABS.map(({ index, label, icon, iconActive }) => {
        const isActive = activeIndex === index;
        return (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => handleNavPress(index)}
            activeOpacity={0.7}
            accessibilityLabel={label}
            accessibilityRole="button"
          >
            <Ionicons
              name={isActive ? iconActive : icon}
              size={24}
              color={isActive ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 4,
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
