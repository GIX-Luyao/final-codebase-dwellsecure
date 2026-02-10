import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = -80;

// Get colors based on reminder type
const getReminderColors = (reminder) => {
  const type = reminder.type || 'shutoff';
  if (type === 'shutoff') {
    return {
      backgroundColor: '#CBE4F4', // Light blue
      iconColor: '#F8A459', // Orange
    };
  } else if (type === 'utility') {
    return {
      backgroundColor: '#CBE4F4', // Light blue
      iconColor: '#FAD157', // Yellow
    };
  }
  return {
    backgroundColor: '#CBE4F4', // Light blue
    iconColor: '#F8A459',
  };
};

export default function SwipeableReminderItem({ reminder, onPress, onComplete, completed = false }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiped, setSwiped] = useState(false);
  const colors = getReminderColors(reminder);
  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow left swipe (negative dx)
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
          if (gestureState.dx < SWIPE_THRESHOLD && !swiped) {
            setSwiped(true);
          } else if (gestureState.dx >= SWIPE_THRESHOLD && swiped) {
            setSwiped(false);
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD) {
          // Swipe threshold reached, show complete button
          Animated.spring(translateX, {
            toValue: -70,
            useNativeDriver: true,
          }).start();
          setSwiped(true);
        } else {
          // Reset position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          setSwiped(false);
        }
      },
    })
  ).current;

  const handleComplete = () => {
    onComplete(reminder);
    // Reset position after completing
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    setSwiped(false);
  };

  const getIconName = () => {
    if (reminder.icon) {
      return reminder.icon;
    }
    const type = reminder.type || 'shutoff';
    if (type === 'shutoff') {
      return 'flame-outline';
    } else if (type === 'utility') {
      return 'build-outline';
    }
    return 'alert-circle-outline';
  };

  return (
    <View style={styles.reminderItemWrapper}>
      {/* Complete button - shown when swiped */}
      {swiped && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={30} color="#8E8E93" />
        </TouchableOpacity>
      )}

      {/* Main reminder card */}
      <Animated.View
        style={[
          styles.reminderItem,
          {
            backgroundColor: colors.backgroundColor,
            transform: [{ translateX }],
          },
        ]}
        {...(!completed ? panResponder.panHandlers : {})}
      >
        <TouchableOpacity
          style={styles.touchableContent}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View style={[styles.reminderIcon, { backgroundColor: colors.iconColor }]}>
            <View style={styles.iconBackground}>
              <Ionicons name={getIconName()} size={28} color="#fff" />
            </View>
          </View>
          <Text style={styles.reminderText}>{reminder.title}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  reminderItemWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderItem: {
    width: '100%',
    minHeight: 85,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 18,
  },
  touchableContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 18,
  },
  reminderIcon: {
    width: 55,
    height: 56,
    minWidth: 55,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconBackground: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  completeButton: {
    position: 'absolute',
    right: 0,
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: '#E1F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});

