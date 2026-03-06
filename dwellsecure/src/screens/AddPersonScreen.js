import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { savePerson, getPerson } from '../services/storage';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';

export default function AddPersonScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { person, propertyId } = route.params || {};
  const isEditing = !!person;

  const [name, setName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (isEditing && person) {
      loadPersonData();
    }
  }, []);

  const loadPersonData = async () => {
    const data = await getPerson(person.id);
    if (data) {
      setName(data.name || '');
      setProfilePhoto(data.profilePhoto || null);
      setRole(data.role || '');
      setPhone(data.phone || '');
      setEmail(data.email || '');
    }
  };

  const pickProfilePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to your photo library.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setProfilePhoto(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const getInitials = (n = '') =>
    n.trim().split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    const personData = {
      id: isEditing ? person.id : Date.now().toString(),
      name: name.trim(),
      profilePhoto,
      role: role.trim(),
      phone: phone.trim(),
      email: email.trim(),
      propertyId: isEditing ? (person.propertyId || propertyId) : propertyId,
      createdAt: isEditing ? person.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await savePerson(personData);
    Alert.alert('Success', `Person ${isEditing ? 'updated' : 'added'} successfully`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const fields = [
    { key: 'name',  label: 'Name',  icon: 'person-outline',  placeholder: 'Enter full name', value: name,  setter: setName,  keyboard: 'default',       capitalize: 'words' },
    { key: 'role',  label: 'Role',  icon: 'briefcase-outline', placeholder: 'e.g. Homeowner, Tenant…', value: role,  setter: setRole,  keyboard: 'default',       capitalize: 'words' },
    { key: 'phone', label: 'Phone', icon: 'call-outline',    placeholder: '(123) 456-7890',  value: phone, setter: setPhone, keyboard: 'phone-pad',     capitalize: 'none'  },
    { key: 'email', label: 'Email', icon: 'mail-outline',    placeholder: 'email@example.com', value: email, setter: setEmail, keyboard: 'email-address', capitalize: 'none'  },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Person' : 'Add Person'}</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickProfilePhoto} style={styles.avatarWrapper} activeOpacity={0.8}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                {name.trim() ? (
                  <Text style={styles.avatarInitials}>{getInitials(name)}</Text>
                ) : (
                  <Ionicons name="person" size={44} color={colors.white} />
                )}
              </View>
            )}
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={14} color={colors.white} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickProfilePhoto} activeOpacity={0.7}>
            <Text style={styles.photoButtonText}>
              {profilePhoto ? 'Change Photo' : 'Add Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {fields.map(({ key, label, icon, placeholder, value, setter, keyboard, capitalize }, idx) => (
            <View key={key}>
              {idx > 0 && <View style={styles.divider} />}
              <View style={styles.fieldRow}>
                <View style={styles.fieldIconWrap}>
                  <Ionicons name={icon} size={18} color={colors.primary} />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={value}
                    onChangeText={setter}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    keyboardType={keyboard}
                    autoCapitalize={capitalize}
                    returnKeyType="done"
                    blurOnSubmit
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
          <Ionicons name={isEditing ? 'checkmark-circle-outline' : 'person-add-outline'} size={20} color={colors.white} />
          <Text style={styles.saveButtonText}>{isEditing ? 'Save Changes' : 'Add Person'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.card,
  },
  headerTitle: {
    ...typography.titleSmall,
    fontSize: 17,
  },
  /* Scroll */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: 48,
  },

  /* Avatar */
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
    ...shadows.cardHover,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  /* Form Card */
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  fieldIconWrap: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  fieldInput: {
    fontSize: 16,
    color: colors.text,
    paddingVertical: 0,
    minHeight: 28,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: spacing.lg + 32 + spacing.md,
  },

  /* Save Button */
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    ...shadows.button,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});
