import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function SuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { address, addressLine1 } = route.params || {};
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate checkmark icon
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoHome = () => {
    // Navigate to PropertyList (home page - first tab in bottom nav)
    // Reset PropertyStack navigation to PropertyList
    navigation.reset({
      index: 0,
      routes: [{ name: 'PropertyList' }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>All set!</Text>
        
        <View style={styles.propertyInfo}>
          <Text style={styles.address}>
            {addressLine1 || address || '604 7th Ave'}
          </Text>
          <Text style={styles.subtitle}>Added as your property</Text>
        </View>

        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <TouchableOpacity 
            style={styles.checkmarkCircle}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark" size={60} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  content: {
    alignItems: 'center',
    gap: 80,
    maxWidth: 500,
    width: '100%',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1E1E1E',
  },
  propertyInfo: {
    alignItems: 'center',
    gap: 16,
  },
  address: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1E1E1E',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E1E1E',
    textAlign: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#30ACFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
});
