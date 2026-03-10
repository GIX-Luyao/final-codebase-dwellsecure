import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../constants/theme';

const TABS = [
  { index: 0, label: 'Property', icon: 'home-outline', iconActive: 'home' },
  { index: 1, label: 'Reminders', icon: 'calendar-outline', iconActive: 'calendar' },
  { index: 2, label: 'Assistant', icon: 'search-outline', iconActive: 'search' },
  { index: 3, label: 'Profile', icon: 'person-outline', iconActive: 'person' },
];

export default function BottomNav() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const getCurrentRoute = () => {
    const state = navigation.getState();
    if (!state) return null;
    const currentRoute = state.routes[state.index];
    if (!currentRoute) return null;
    // When we're on MainStack (tab container), use the active tab as the "current" route so the tab bar highlights correctly
    if (currentRoute.name === 'MainStack') {
      if (currentRoute.state?.routes?.length) {
        const tabIndex = currentRoute.state.index ?? 0;
        const tabRoute = currentRoute.state.routes[tabIndex];
        if (tabRoute?.name) return tabRoute.name;
      }
      return 'Property'; // Fallback when state not yet set (e.g. just returned from EmergencyMode)
    }
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
    if (routeName === 'MainStack') return 0; // First load: MainStack is the container, initial tab is Property
    if (['PropertyList', 'ShutoffsList', 'Shutoffs', 'UtilitiesList', 'Utilities', 'Property', 'PropertyDetail', 'ShutoffDetail', 'UtilityDetail', 'PersonDetail'].includes(routeName)) return 0;
    if (routeName === 'Reminders') return 1;
    if (['AIAssistance', 'Finder'].includes(routeName)) return 2;
    if (['Profile', 'Share'].includes(routeName)) return 3;
    return -1;
  };

  const currentRoute = getCurrentRoute();
  const activeIndex = getActiveIndex();

  // Navigation bar is shown on all screens

  const handleNavPress = (index) => {
    // Always navigate within MainStack so the bottom nav stays visible (never push RootStack's Profile)
    switch (index) {
      case 0:
        navigation.navigate('MainStack', { screen: 'Property', params: { screen: 'PropertyList' } });
        break;
      case 1:
        navigation.navigate('MainStack', { screen: 'Reminders' });
        break;
      case 2:
        navigation.navigate('MainStack', { screen: 'AIAssistance' });
        break;
      case 3:
        navigation.navigate('MainStack', { screen: 'Profile' });
        break;
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
