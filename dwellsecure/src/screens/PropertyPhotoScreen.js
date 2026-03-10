import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { getProperty, saveProperty } from '../services/storage';
import { uploadMedia } from '../services/mediaService';
import { colors, spacing, borderRadius } from '../constants/theme';

export default function PropertyPhotoScreen({ route }) {
  const navigation = useNavigation();
  const { propertyId } = route.params || {};
  const [property, setProperty] = useState(null);
  const [imageUri, setImageUri] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const load = async () => {
        if (!propertyId) return;
        const data = await getProperty(propertyId);
        if (!cancelled) {
          setProperty(data || null);
          setImageUri(data?.imageUri || null);
        }
      };
      load();
      return () => { cancelled = true; };
    }, [propertyId])
  );

  const pickImage = () => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add or change the photo',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Camera permission is required to take photos');
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });
              if (!result.canceled && result.assets?.length > 0) {
                const uri = result.assets[0].uri;
                setImageUri(uri);
                await savePropertyWithImage(uri);
              }
            } catch (error) {
              console.error('Camera error:', error);
              Alert.alert('Error', 'Failed to take photo');
            }
          },
        },
        {
          text: 'Photo Library',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Photo library permission is required');
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });
              if (!result.canceled && result.assets?.length > 0) {
                const uri = result.assets[0].uri;
                setImageUri(uri);
                await savePropertyWithImage(uri);
              }
            } catch (error) {
              console.error('Image picker error:', error);
              Alert.alert('Error', 'Failed to pick image');
            }
          },
        },
        {
          text: 'Choose File',
          onPress: async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: 'image/*',
                copyToCacheDirectory: true,
              });
              if (!result.canceled && result.assets?.length > 0) {
                const uri = result.assets[0].uri;
                setImageUri(uri);
                await savePropertyWithImage(uri);
              }
            } catch (error) {
              console.error('Document picker error:', error);
              Alert.alert('Error', 'Failed to pick image');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const savePropertyWithImage = async (uri) => {
    if (!property) return;
    let finalUri = uri || null;
    if (uri) {
      try {
        const url = await uploadMedia({
          uri,
          path: `properties/${propertyId}/photos/${Date.now()}.jpg`,
          contentType: 'image/jpeg',
        });
        finalUri = url;
      } catch (e) {
        Alert.alert('Upload failed', e.message || 'Could not upload photo.');
        // Fall back to local URI so user still sees something on this device
        finalUri = uri;
      }
    }
    const updated = {
      ...property,
      imageUri: finalUri,
      updatedAt: new Date().toISOString(),
    };
    await saveProperty(updated);
    setProperty(updated);
  };

  const removePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Remove the current property photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setImageUri(null);
            await savePropertyWithImage(null);
          },
        },
      ]
    );
  };

  const addressText = property?.address || '';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Property Photo</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.previewSection}>
          <Text style={styles.sectionLabel}>Preview</Text>
          <View style={styles.previewCard}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.placeholderWrap}>
                <Ionicons name="image-outline" size={80} color="#ccc" />
                <Text style={styles.placeholderText}>No photo yet</Text>
                <Text style={styles.placeholderHint}>Tap a button below to add one</Text>
              </View>
            )}
            {addressText ? (
              <View style={styles.previewOverlay}>
                <Text style={styles.previewOverlayText} numberOfLines={2}>{addressText}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionLabel}>Options</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={pickImage} activeOpacity={0.8}>
            <Ionicons name="camera" size={22} color={colors.primary} />
            <Text style={styles.primaryButtonText}>Change or upload photo</Text>
          </TouchableOpacity>
          {imageUri ? (
            <TouchableOpacity style={styles.removeButton} onPress={removePhoto} activeOpacity={0.8}>
              <Ionicons name="trash-outline" size={22} color="#dc2626" />
              <Text style={styles.removeButtonText}>Remove photo</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingRight: spacing.sm,
  },
  backText: {
    fontSize: 16,
    color: colors.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerSide: {
    width: 70,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxl * 2,
  },
  previewSection: {
    marginBottom: spacing.xxl,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  previewCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    minHeight: 260,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 280,
  },
  placeholderWrap: {
    minHeight: 260,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  placeholderHint: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  previewOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  previewOverlayText: {
    fontSize: 15,
    color: colors.white,
    fontWeight: '500',
  },
  actionsSection: {},
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorBackground,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
});
