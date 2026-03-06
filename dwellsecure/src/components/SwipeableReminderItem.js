import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

const OPEN_POSITION = -88;
const SNAP_THRESHOLD = -40;

const getTypeTheme = (reminder) => {
  const type = reminder.type || 'shutoff';
  if (type === 'utility') {
    return {
      accentColor: colors.accentGas,
      iconBg: '#FFF7ED',
      iconColor: colors.accentGas,
      label: 'Utility',
    };
  }
  return {
    accentColor: colors.primary,
    iconBg: colors.primaryLight,
    iconColor: colors.primary,
    label: 'Shutoff',
  };
};

const formatDateTime = (isoString) => {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return { date, time };
  } catch {
    return null;
  }
};

export default function SwipeableReminderItem({ reminder, onPress, onComplete, completed = false }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);
  const theme = getTypeTheme(reminder);
  const dateTime = formatDateTime(reminder.date);

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
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, { dx, dy }) => {
        if (completed) return false;
        const isHorizontal = Math.abs(dx) > Math.abs(dy) * 2 && Math.abs(dx) > 8;
        return isHorizontal && (dx < 0 || isOpen.current);
      },
      onPanResponderTerminateRequest: () => false,
      onPanResponderGrant: () => {
        translateX.setOffset(isOpen.current ? OPEN_POSITION : 0);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, { dx }) => {
        const clamped = Math.min(0, Math.max(OPEN_POSITION, dx));
        translateX.setValue(clamped);
      },
      onPanResponderRelease: (_, { dx, vx }) => {
        translateX.flattenOffset();
        const currentVal = isOpen.current ? OPEN_POSITION + dx : dx;
        if (currentVal < SNAP_THRESHOLD || vx < -0.5) {
          snapTo(OPEN_POSITION);
          isOpen.current = true;
        } else {
          snapTo(0);
          isOpen.current = false;
        }
      },
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
      {/* Complete action revealed on swipe */}
      <View style={styles.completeAction}>
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete} activeOpacity={0.8}>
          <Ionicons name="checkmark" size={22} color={colors.white} />
          <Text style={styles.completeLabel}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable card */}
      <Animated.View
        style={[styles.card, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {/* Colored left accent bar */}
        <View style={[styles.accentBar, { backgroundColor: theme.accentColor }]} />

        <TouchableOpacity style={styles.touchableContent} onPress={onPress} activeOpacity={0.7}>
          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: theme.iconBg }]}>
            <Ionicons name={getIconName()} size={22} color={theme.iconColor} />
          </View>

          {/* Text */}
          <View style={styles.textWrap}>
            <Text style={styles.titleText} numberOfLines={2}>{reminder.title}</Text>
            {dateTime && (
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                <Text style={styles.metaText}>{dateTime.date} · {dateTime.time}</Text>
              </View>
            )}
            <View style={[styles.typeBadge, { backgroundColor: theme.iconBg, borderColor: theme.accentColor + '40' }]}>
              <Text style={[styles.typeBadgeText, { color: theme.accentColor }]}>{theme.label}</Text>
            </View>
          </View>

          {/* Chevron */}
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginBottom: 10,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },

  /* Revealed complete button */
  completeAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButton: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  completeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },

  /* Main card */
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
    borderTopLeftRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.lg,
  },
  touchableContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },

  /* Icon */
  iconWrap: {
    width: 44,
    height: 44,
    minWidth: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Text area */
  textWrap: {
    flex: 1,
    gap: 4,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginTop: 2,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
