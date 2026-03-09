import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { identifyShutoffFromImage, askAboutShutoffs } from '../services/openai';
import { saveShutoff } from '../services/storage';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

// Dynamically import expo-image-picker (handle if not installed)
let ImagePicker;
try {
  ImagePicker = require('expo-image-picker');
} catch (error) {
  console.warn('expo-image-picker not installed. Camera feature will not work.');
  ImagePicker = null;
}

export default function AIAssistanceScreen() {
  const navigation = useNavigation();
  const [inputText, setInputText] = useState('');
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const scrollViewRef = useRef(null);
  const testRecordCreated = useRef(false);
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Test: Create a test record when screen loads
  useEffect(() => {
    const createTestRecord = async () => {
      // Only create once
      if (testRecordCreated.current) {
        return;
      }
      testRecordCreated.current = true;

      try {
        console.log('[AI Chat] 🧪 Creating test record for database connection...');
        
        const testShutoff = {
          id: `test-ai-chat-${Date.now()}`,
          type: 'electric',
          description: 'Test record created from AI Chat screen',
          location: 'Test Location',
          verification_status: 'unverified',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: 'This is an automatic test record to verify MongoDB connection',
        };

        console.log('[AI Chat] Test shutoff data:', testShutoff);
        await saveShutoff(testShutoff);
        console.log('[AI Chat] ✅ Test record created successfully!');
        console.log('[AI Chat] Check MongoDB Atlas to verify the record exists.');
      } catch (error) {
        console.error('[AI Chat] ❌ Failed to create test record:', error);
        console.error('[AI Chat] Error details:', error.message);
      }
    };

    // Create test record after a short delay to ensure screen is mounted
    const timer = setTimeout(() => {
      createTestRecord();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Clean markdown formatting from AI responses
  const cleanMarkdown = (text) => {
    if (!text) return '';
    
    return text
      // Remove markdown headers (# ## ###)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove markdown bold (**text** or __text__)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      // Remove markdown italic (*text* or _text_)
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      // Remove markdown list markers (-, *, +)
      .replace(/^[\s]*[-*+]\s+/gm, '')
      // Remove numbered list markers (1. 2. etc)
      .replace(/^\d+\.\s+/gm, '')
      // Remove markdown code blocks (```code```)
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code (`code`)
      .replace(/`([^`]+)`/g, '$1')
      // Remove markdown links [text](url)
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      // Remove extra blank lines (more than 2 consecutive)
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim();
  };

  const handleImageUpload = async () => {
    try {
      if (!ImagePicker) {
        Alert.alert(
          'Photo Library Not Available',
          'This feature requires expo-image-picker. Please install it by running: npx expo install expo-image-picker',
          [{ text: 'OK' }]
        );
        setShowUploadSection(false);
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable photo library access in your device settings.',
          [{ text: 'OK' }]
        );
        setShowUploadSection(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setShowUploadSection(false);
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
    }
  };

  const handleCameraCapture = async () => {
    try {
      // Check if ImagePicker is available
      if (!ImagePicker) {
        Alert.alert(
          'Camera Not Available',
          'Camera feature requires expo-image-picker. Please install it by running: npx expo install expo-image-picker',
          [{ text: 'OK' }]
        );
        setShowUploadSection(false);
        return;
      }

      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Sorry, we need camera permissions to take a photo! Please enable camera access in your device settings.',
          [{ text: 'OK' }]
        );
        setShowUploadSection(false);
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        setShowUploadSection(false);
      }
    } catch (error) {
      console.error('Failed to capture image:', error);
      Alert.alert(
        'Camera Error',
        'Failed to capture image. Please make sure the camera is available and try again.',
        [{ text: 'OK' }]
      );
      setShowUploadSection(false);
    }
  };

  const handleSubmit = async () => {
    const text = inputText.trim();

    if (!text && !selectedImage) {
      return;
    }

    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: text || 'Please identify this image.',
      image: selectedImage,
    };
    setMessages((prev) => [...prev, userMessage]);
    
    setIsLoadingText(true);
    setInputText('');
    const questionText = text;
    const imageToUse = selectedImage;
    setSelectedImage(null);

    try {
      let aiResponse;
      
      // If there's a selected image, use it with the question
      if (imageToUse) {
        aiResponse = await identifyShutoffFromImage(imageToUse, questionText);
      } else {
        // Otherwise, just ask a text question
        aiResponse = await askAboutShutoffs(questionText);
      }
      
      // Clean and format AI response (remove markdown symbols)
      const cleanedResponse = cleanMarkdown(aiResponse);
      
      // Add AI response to chat
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: cleanedResponse,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.message.includes('API key')) {
        errorMessage = 'AI is not configured. Set OPENAI_API_KEY on the backend server (e.g. Render env).';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (error.message.includes('insufficient_quota')) {
        errorMessage = 'API quota exceeded. Please check your OpenAI account.';
      }
      
      const errorMessageObj = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: errorMessage,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessageObj]);
    } finally {
      setIsLoadingText(false);
    }
  };

  const hasText = inputText.trim().length > 0;
  const canSend = hasText || !!selectedImage;

  const renderMessage = (message) => {
    const isUser = message.type === 'user';
    
    // Split text into paragraphs for better formatting
    const formatText = (text) => {
      if (!text) return [];
      // Split by double newlines to create paragraphs, filter empty ones
      const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
      return paragraphs.length > 0 ? paragraphs : [text];
    };
    
    const paragraphs = formatText(message.text);
    
    const bubble = (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.aiMessageBubble,
          message.isError && styles.errorMessageBubble,
        ]}
      >
        {paragraphs.map((paragraph, index) => (
          <Text
            key={index}
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.aiMessageText,
              index > 0 && styles.messageParagraph,
            ]}
          >
            {paragraph.trim()}
          </Text>
        ))}
      </View>
    );

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        {message.image && (
          <Image source={{ uri: message.image }} style={styles.messageImage} />
        )}
        {isUser ? bubble : (
          <View style={styles.aiBubbleRow}>
            <View style={styles.aiAvatar}>
              <Ionicons name="sparkles" size={12} color={colors.primary} />
            </View>
            {bubble}
          </View>
        )}
      </View>
    );
  };

  const SUGGESTIONS = [
    { icon: 'water-outline', color: colors.accentWater, text: 'Where is my water shutoff?' },
    { icon: 'flash-outline', color: colors.accentElectric, text: 'How do I turn off the electricity?' },
    { icon: 'flame-outline', color: colors.accentGas, text: 'What do I do if I smell gas?' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconWrap}>
              <Ionicons name="sparkles" size={22} color={colors.primary} />
            </View>
            <View style={styles.titleTextBlock}>
              <Text style={styles.headerTitle}>AI Assistant</Text>
              <Text style={styles.headerSubtitle}>Powered by OpenAI</Text>
            </View>
          </View>
        </View>

        {/* Chat area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.primary} />
              </View>
              <Text style={styles.emptyStateTitle}>Ask me anything</Text>
              <Text style={styles.emptyStateText}>
                Not sure where to start? Try one of these:
              </Text>
              <View style={styles.suggestionList}>
                {SUGGESTIONS.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.suggestionChip}
                    onPress={() => setInputText(s.text)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.suggestionIconWrap, { backgroundColor: s.color + '18' }]}>
                      <Ionicons name={s.icon} size={16} color={s.color} />
                    </View>
                    <Text style={styles.suggestionText}>{s.text}</Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.photoHint}>
                <Ionicons name="camera-outline" size={14} color={colors.textMuted} />
                <Text style={styles.emptyStateSubtext}>
                  Or tap + to send a photo for identification
                </Text>
              </View>
            </View>
          ) : (
            messages.map(renderMessage)
          )}
          {isLoadingText && (
            <View style={styles.loadingContainer}>
              <View style={styles.aiBubbleRow}>
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={12} color={colors.primary} />
                </View>
                <View style={[styles.messageBubble, styles.aiMessageBubble]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom input area */}
        <View style={[styles.bottomSection, { paddingBottom: keyboardVisible ? 8 : insets.bottom + 70 }]}>
          {selectedImage && (
            <View style={styles.selectedImageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close-circle" size={22} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}

          {showUploadSection && (
            <View style={styles.uploadSection}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleImageUpload}
                disabled={isLoadingText}
              >
                <View style={styles.uploadIconWrap}>
                  <Ionicons name="image-outline" size={26} color={colors.primary} />
                </View>
                <Text style={styles.uploadButtonText}>Upload Photo</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleCameraCapture}
                disabled={isLoadingText}
              >
                <View style={styles.uploadIconWrap}>
                  <Ionicons name="camera-outline" size={26} color={colors.primary} />
                </View>
                <Text style={styles.uploadButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={[styles.addButton, showUploadSection && styles.addButtonActive]}
              onPress={() => setShowUploadSection(!showUploadSection)}
              disabled={isLoadingText}
            >
              <Ionicons
                name={showUploadSection ? 'close' : 'add'}
                size={24}
                color={showUploadSection ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Ask here..."
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              editable={!isLoadingText}
              multiline
              maxLength={500}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <TouchableOpacity
              style={[styles.submitButton, canSend && styles.submitButtonActive]}
              onPress={handleSubmit}
              disabled={isLoadingText || !canSend}
            >
              {isLoadingText ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons
                  name="arrow-up"
                  size={20}
                  color={canSend ? colors.white : colors.textMuted}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },

  // ─── Header ───────────────────────────────────────────────
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
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.xs,
    marginLeft: -spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 0,
  },

  // ─── Chat area ────────────────────────────────────────────
  chatContainer: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  chatContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: 20,
  },

  // ─── Empty state ──────────────────────────────────────────
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 4,
    minHeight: 420,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  suggestionList: {
    width: '100%',
    gap: 10,
    marginBottom: 24,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    ...shadows.card,
  },
  suggestionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
  photoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: colors.textMuted,
  },

  // ─── Messages ─────────────────────────────────────────────
  messageContainer: {
    marginBottom: 12,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  aiBubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  aiAvatar: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.lg,
    marginBottom: 6,
    resizeMode: 'cover',
  },
  messageBubble: {
    maxWidth: '78%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  userMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  aiMessageBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
    ...shadows.card,
  },
  errorMessageBubble: {
    backgroundColor: colors.errorBackground,
    borderWidth: 1,
    borderColor: colors.error,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageParagraph: {
    marginTop: 10,
  },
  userMessageText: {
    color: colors.white,
  },
  aiMessageText: {
    color: colors.text,
  },
  loadingContainer: {
    marginBottom: 12,
  },

  // ─── Bottom input section ─────────────────────────────────
  bottomSection: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  selectedImageContainer: {
    position: 'relative',
    marginHorizontal: spacing.screenPadding,
    marginTop: 10,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  selectedImagePreview: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.background,
    borderRadius: 11,
  },
  uploadSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.screenPadding,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
  },
  uploadButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  uploadIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border,
  },

  // ─── Input bar ────────────────────────────────────────────
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    backgroundColor: colors.primaryLight,
    borderRadius: 21,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  submitButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
