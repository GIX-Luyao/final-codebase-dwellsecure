import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ShareScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share with:', email);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Share</Text>
        <Text style={styles.subtitle}>Share your property information with family members</Text>

        <View style={styles.shareSection}>
          <Text style={styles.sectionLabel}>Add member</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleShare}>
              <Ionicons name="add" size={24} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.membersSection}>
          <Text style={styles.sectionLabel}>Shared with</Text>
          
          <View style={styles.memberCard}>
            <View style={styles.memberAvatar}>
              <Ionicons name="person" size={24} color="#999" />
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>John Doe</Text>
              <Text style={styles.memberEmail}>john@example.com</Text>
            </View>
            <TouchableOpacity style={styles.removeButton}>
              <Ionicons name="close" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.memberCard}>
            <View style={styles.memberAvatar}>
              <Ionicons name="person" size={24} color="#999" />
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>Jane Smith</Text>
              <Text style={styles.memberEmail}>jane@example.com</Text>
            </View>
            <TouchableOpacity style={styles.removeButton}>
              <Ionicons name="close" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120, // Space for bottom nav
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
    marginBottom: 32,
  },
  shareSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  addButton: {
    padding: 4,
  },
  membersSection: {
    marginBottom: 32,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: '#999',
  },
  removeButton: {
    padding: 4,
  },
});
