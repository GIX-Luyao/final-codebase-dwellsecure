import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Template for integrating Builder.io / Figma generated components
 * 
 * To use:
 * 1. Replace the JSX below with your Builder.io generated component
 * 2. Convert HTML elements to React Native (div -> View, span -> Text, etc.)
 * 3. Convert CSS to StyleSheet format
 * 4. Update event handlers (onClick -> onPress)
 * 5. Import any additional React Native components needed
 */

export default function BuilderComponentTemplate({ 
  // Add props that your Builder.io component needs
  title,
  onPress,
  ...props 
}) {
  return (
    <View style={styles.container}>
      {/* 
        PASTE YOUR BUILDER.IO GENERATED JSX HERE
        Then convert:
        - <div> → <View>
        - <span>, <p> → <Text>
        - <button> → <TouchableOpacity>
        - className → style={styles.className}
        - onClick → onPress
        - CSS → StyleSheet below
      */}
      <Text style={styles.title}>{title || 'Builder Component'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Convert your CSS here
    // Example: backgroundColor: '#fff' instead of background-color: #fff
  },
  title: {
    // Add your styles here
  },
});

