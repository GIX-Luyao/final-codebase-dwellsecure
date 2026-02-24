import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../constants/theme';

export default function ShareScreen() {
  const [email, setEmail] = useState('');

  const handleShare = () => {
    if (!email.trim()) return;
    // TODO: Implement share API
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Share</Text>
        <Text style={styles.headerSubtitle}>Share your property information with family members</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

        <View style={styles.shareSection}>
          <Text style={styles.sectionLabel}>Add member</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleShare}>
              <Ionicons name="add" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.membersSection}>
          <Text style={styles.sectionLabel}>Shared with</Text>
          
          <View style={styles.memberCard}>
            <View style={styles.memberAvatar}>
              <Ionicons name="person" size={24} color={colors.textMuted} />
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>John Doe</Text>
              <Text style={styles.memberEmail}>john@example.com</Text>
            </View>
            <TouchableOpacity style={styles.removeButton}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.memberCard}>
            <View style={styles.memberAvatar}>
              <Ionicons name="person" size={24} color={colors.textMuted} />
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>Jane Smith</Text>
              <Text style={styles.memberEmail}>jane@example.com</Text>
            </View>
            <TouchableOpacity style={styles.removeButton}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 6,
  },
  scrollView: { flex: 1 },
  contentContainer: {
    padding: spacing.screenPadding,
    paddingBottom: 120,
  },
  shareSection: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  addButton: { padding: 4 },
  membersSection: { marginBottom: 28 },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: colors.textMuted,
  },
  removeButton: { padding: 4 },
});
