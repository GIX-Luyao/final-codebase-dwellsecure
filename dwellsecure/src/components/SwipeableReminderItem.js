import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OPEN_POSITION = -95;
const SNAP_THRESHOLD = -40; // snap open if dragged past this point

const getReminderColors = (reminder) => {
  const type = reminder.type || 'shutoff';
  if (type === 'utility') {
    return { backgroundColor: '#CBE4F4', iconColor: '#FAD157' };
  }
  return { backgroundColor: '#CBE4F4', iconColor: '#F8A459' };
};

export default function SwipeableReminderItem({ reminder, onPress, onComplete, completed = false }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);
  const colors = getReminderColors(reminder);

  const snapTo = (toValue, cb) => {
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      bounciness: 0,
      speed: 15,
    }).start(cb);
  };

  const panResponder = useRef(
    PanResponder.create({
      // Never steal gesture on initial touch — let scroll decide first
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,

      // Take over when clearly horizontal: left swipe always, right swipe only when open
      onMoveShouldSetPanResponder: (_, { dx, dy }) => {
        if (completed) return false;
        const isHorizontal = Math.abs(dx) > Math.abs(dy) * 2 && Math.abs(dx) > 8;
        return isHorizontal && (dx < 0 || isOpen.current);
      },
      // Once we own the gesture, refuse to give it back to the ScrollView
      onPanResponderTerminateRequest: () => false,

      onPanResponderGrant: () => {
        // Anchor animation to current open/closed position so dragging from open works
        translateX.setOffset(isOpen.current ? OPEN_POSITION : 0);
        translateX.setValue(0);
      },

      onPanResponderMove: (_, { dx }) => {
        // Allow drag left (to open) and right (to close), clamp between OPEN_POSITION and 0
        const clamped = Math.min(0, Math.max(OPEN_POSITION, dx));
        translateX.setValue(clamped);
      },

      onPanResponderRelease: (_, { dx, vx }) => {
        translateX.flattenOffset();
        const currentVal = isOpen.current ? OPEN_POSITION + dx : dx;

        // Snap open: dragged past threshold OR fast leftward flick
        if (currentVal < SNAP_THRESHOLD || vx < -0.5) {
          snapTo(OPEN_POSITION);
          isOpen.current = true;
        } else {
          snapTo(0);
          isOpen.current = false;
        }
      },

      // If another responder takes over (e.g. scroll), snap back to stable position
      onPanResponderTerminate: () => {
        translateX.flattenOffset();
        snapTo(isOpen.current ? OPEN_POSITION : 0);
      },
    })
  ).current;

  const handleComplete = () => {
    snapTo(0, () => {
      isOpen.current = false;
      onComplete(reminder);
    });
  };

  const getIconName = () => {
    if (reminder.icon) return reminder.icon;
    if (reminder.type === 'utility') return 'build-outline';
    return 'flame-outline';
  };

  return (
    <View style={styles.wrapper}>
      {/* Complete button — always rendered behind the card */}
      <TouchableOpacity style={styles.completeButton} onPress={handleComplete} activeOpacity={0.8}>
        <Ionicons name="checkmark" size={30} color="#8E8E93" />
      </TouchableOpacity>

      {/* Swipeable card */}
      <Animated.View
        style={[
          styles.reminderItem,
          { backgroundColor: colors.backgroundColor, transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity style={styles.touchableContent} onPress={onPress} activeOpacity={0.7}>
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
  wrapper: {
    position: 'relative',
    marginBottom: 12,
    overflow: 'hidden',
    borderRadius: 24,
  },
  reminderItem: {
    width: '100%',
    minHeight: 85,
    borderRadius: 24,
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
    right: 5,
    top: 0,
    bottom: 0,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E1F3FF',
    borderRadius: 36,
  },
});
