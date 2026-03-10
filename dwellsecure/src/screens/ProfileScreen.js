import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureTour } from '../contexts/FeatureTourContext';
import { resetOnboarding, resetAllData, resetFeatureTour } from '../services/storage';
import { colors, spacing, typography, borderRadius, shadows, BOTTOM_NAV_HEIGHT } from '../constants/theme';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, signOut, updateProfile } = useAuth();
  const { requestShowFeatureTour } = useFeatureTour();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [subscriptionPlan] = useState('Free');

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setEmail(user.email ?? '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      setIsEditingProfile(false);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', onPress: () => signOut() },
      ]
    );
  };

  const handleSettingsPress = async () => {
    Alert.alert(
      'Settings',
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          onPress: async () => {
            Alert.alert(
              'Sign out',
              'Are you sure you want to sign out?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign out', onPress: () => signOut() },
              ]
            );
          },
        },
        {
          text: 'Show guide again',
          onPress: async () => {
            try {
              await resetFeatureTour();
              requestShowFeatureTour();
            } catch (e) {
              Alert.alert('Error', 'Could not reset guide');
            }
          },
        },
        {
          text: 'Reset Onboarding',
          onPress: async () => {
            Alert.alert(
              'Reset Onboarding',
              'Do you want to go back to the onboarding screen?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset',
                  onPress: async () => {
                    try {
                      await resetOnboarding();
                      Alert.alert('Success', 'Onboarding has been reset. You will be taken to the onboarding screen.', [
                        { text: 'OK' },
                      ]);
                    } catch (error) {
                      Alert.alert('Error', 'Failed to reset onboarding');
                    }
                  },
                },
              ]
            );
          },
        },
        {
          text: 'Reset All Data',
          style: 'destructive',
          onPress: async () => {
            Alert.alert(
              'Reset All Data',
              'This will delete all your properties, shutoffs, utilities, people, and reminders. This action cannot be undone. Are you sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset All',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await resetAllData();
                      Alert.alert('Success', 'All data has been reset. You will be taken to the onboarding screen.', [
                        { text: 'OK' },
                      ]);
                    } catch (error) {
                      Alert.alert('Error', 'Failed to reset data');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeContent} edges={['bottom']}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.xl) + spacing.md }]}>
          <View style={styles.titleRow}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="person" size={22} color={colors.primary} />
          </View>
          <View style={styles.titleTextBlock}>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Manage your account</Text>
          </View>
        </View>
          <TouchableOpacity
            style={styles.headerSettingsButton}
            onPress={handleSettingsPress}
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: (insets.bottom || 0) + BOTTOM_NAV_HEIGHT }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile information</Text>
          <View style={styles.card}>
            <View style={styles.profileCardRow}>
              <View style={styles.profileCardLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(name || email || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
                {!isEditingProfile ? (
                  <>
                    <Text style={styles.displayName}>{name || 'No name set'}</Text>
                    <Text style={styles.displayEmail}>{email || '—'}</Text>
                    <TouchableOpacity
                      style={styles.profileCardAction}
                      onPress={() => setIsEditingProfile(true)}
                      accessibilityLabel="Edit profile"
                    >
                      <Ionicons name="pencil" size={16} color={colors.primary} />
                      <Text style={styles.profileCardActionText}>Edit</Text>
                      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  </>
                ) : null}
              </View>
              <View style={styles.profileCardRight}>
                <View style={styles.shareSectionAvatar}>
                  <Ionicons name="people-outline" size={22} color={colors.primary} />
                </View>
                <Text style={styles.shareSectionTitle}>Sharing & People</Text>
                <Text style={styles.shareSectionSubtitle}>Manage who has access</Text>
                <TouchableOpacity
                  style={styles.profileCardAction}
                  onPress={() => navigation.getParent()?.navigate('Share')}
                  accessibilityLabel="Open Sharing & People"
                >
                  <Ionicons name="open-outline" size={16} color={colors.primary} />
                  <Text style={styles.profileCardActionText}>Open</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
            {isEditingProfile && (
              <View style={styles.editFields}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
                <Text style={[styles.label, { marginTop: spacing.md }]}>Email</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={email}
                  editable={false}
                  placeholder="Email"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={styles.hint}>Email cannot be changed here.</Text>
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setName(user?.name ?? '');
                      setEmail(user?.email ?? '');
                      setIsEditingProfile(false);
                    }}
                    disabled={saving}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={saving}>
                    {saving ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={styles.saveButtonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account settings</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Push notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={notificationsEnabled ? colors.primary : colors.textMuted}
              />
            </View>
            <View style={styles.settingRow}>
              <Ionicons name="lock-closed-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Change password</Text>
              <TouchableOpacity onPress={() => Alert.alert('Coming soon', 'Password change will be available in a future update.')}>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.card}>
            <View style={styles.subscriptionRow}>
              <View style={styles.subscriptionBadge}>
                <Text style={styles.subscriptionBadgeText}>{subscriptionPlan}</Text>
              </View>
              <Text style={styles.subscriptionStatus}>Active</Text>
            </View>
            <Text style={styles.subscriptionHint}>
              You have access to all core features. Upgrade later for premium options.
            </Text>
            <TouchableOpacity
              style={styles.manageSubscriptionButton}
              onPress={() => Alert.alert('Subscription', 'Manage subscription will be available in a future update.')}
            >
              <Text style={styles.manageSubscriptionText}>Manage subscription</Text>
              <Ionicons name="open-outline" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & data</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => Alert.alert('Share', 'Share property information with family members will be available in a future update.')}
            >
              <Ionicons name="share-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.menuLabel}>Share</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => Alert.alert('Help', 'Help and FAQ will be available in a future update.')}
            >
              <Ionicons name="help-circle-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.menuLabel}>Help & FAQ</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => Alert.alert('Privacy', 'Privacy policy will be available in a future update.')}
            >
              <Ionicons name="shield-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.menuLabel}>Privacy policy</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => Alert.alert('Terms', 'Terms of service will be available in a future update.')}
            >
              <Ionicons name="document-text-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.menuLabel}>Terms of service</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

        <Text style={styles.footerVersion}>Dwell Secure</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeContent: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  headerSettingsButton: {
    width: 40,
    height: 40,
    marginLeft: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary + '33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleTextBlock: {
    flex: 1,
    gap: 0,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: 120,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.card,
  },
  profileCardRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  profileCardLeft: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  profileCardRight: {
    flex: 1,
    paddingLeft: spacing.lg,
    borderLeftWidth: 1,
    borderLeftColor: colors.borderLight,
    justifyContent: 'flex-start',
  },
  shareSectionAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  shareSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  shareSectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  displayEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  profileCardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginTop: 2,
  },
  profileCardActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  editFields: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputDisabled: {
    backgroundColor: colors.borderLight,
    color: colors.textSecondary,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    minWidth: 80,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.md,
  },
  subscriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  subscriptionBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  subscriptionBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  subscriptionStatus: {
    fontSize: 14,
    color: colors.success,
    marginLeft: spacing.md,
  },
  subscriptionHint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  manageSubscriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  manageSubscriptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.md,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 36,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    marginTop: spacing.lg,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  footerVersion: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
