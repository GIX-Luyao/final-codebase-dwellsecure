import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AIAssistanceScreen({ navigation }) {
  const [inputText, setInputText] = useState('');

  const handleImageUpload = () => {
    console.log('Image upload pressed');
  };

  const handleVideoUpload = () => {
    console.log('Video upload pressed');
  };

  const handleSubmit = () => {
    console.log('Submit pressed:', inputText);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Finder</Text>
        <Text style={styles.subtitle}>Send a image and we help you identify it</Text>

        <View style={styles.uploadSection}>
          <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
            <Ionicons name="image-outline" size={40} color="#999" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.uploadButton} onPress={handleVideoUpload}>
            <Ionicons name="play-outline" size={40} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask here..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Ionicons name="add" size={28} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100, // Space for bottom nav
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 40,
  },
  uploadSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8E8E8',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    marginTop: 'auto',
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  divider: {
    width: 2,
    height: 60,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  submitButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
});
