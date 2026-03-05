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
import * as DocumentPicker from 'expo-document-picker';
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
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
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
    
    if (!text) {
      return;
    }

    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: text,
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
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Assistant</Text>
          <Text style={styles.headerSubtitle}>Powered by OpenAI</Text>
        </View>
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
              <Ionicons name="chatbubble-ellipses-outline" size={56} color={colors.textMuted} />
              <Text style={styles.emptyStateTitle}>Ask me anything</Text>
              <Text style={styles.emptyStateText}>
                Not sure where to start? Try asking ChatGPT:
              </Text>
              <View style={styles.suggestionList}>
                <View style={styles.suggestionChip}>
                  <Ionicons name="water-outline" size={15} color={colors.primary} />
                  <Text style={styles.suggestionText}>"Where is my water shutoff?"</Text>
                </View>
                <View style={styles.suggestionChip}>
                  <Ionicons name="flash-outline" size={15} color={colors.primary} />
                  <Text style={styles.suggestionText}>"How do I turn off the electricity?"</Text>
                </View>
                <View style={styles.suggestionChip}>
                  <Ionicons name="flame-outline" size={15} color={colors.primary} />
                  <Text style={styles.suggestionText}>"What do I do if I smell gas?"</Text>
                </View>
              </View>
              <Text style={styles.emptyStateSubtext}>
                Or send a photo and I'll identify your shutoffs
              </Text>
            </View>
          ) : (
            messages.map(renderMessage)
          )}
          {isLoadingText && (
            <View style={styles.loadingContainer}>
              <View style={styles.messageBubble}>
                <ActivityIndicator size="small" color={colors.textSecondary} />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.bottomSection, { paddingBottom: keyboardVisible ? 8 : insets.bottom + 70 }]}>
          {selectedImage && (
            <View style={styles.selectedImageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close-circle" size={20} color={colors.error} />
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
                <Ionicons name="image-outline" size={32} color={colors.primary} />
                <Text style={styles.uploadButtonText}>Upload Photo</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity 
                style={styles.uploadButton} 
                onPress={handleCameraCapture}
                disabled={isLoadingText}
              >
                <Ionicons name="camera-outline" size={32} color={colors.primary} />
                <Text style={styles.uploadButtonText}>Using Camera</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.inputContainer}>
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
              style={styles.addButton} 
              onPress={() => setShowUploadSection(!showUploadSection)}
              disabled={isLoadingText}
            >
              <Ionicons name="add" size={28} color={colors.textMuted} />
            </TouchableOpacity>
            {hasText && (
              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleSubmit}
                disabled={isLoadingText}
              >
                {isLoadingText ? (
                  <ActivityIndicator size="small" color={colors.textMuted} />
                ) : (
                  <Ionicons name="send" size={20} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            )}
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
    fontSize: 13,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  chatContent: {
    padding: spacing.lg,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: spacing.screenPadding,
    minHeight: 400,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  suggestionList: {
    width: '100%',
    gap: 10,
    marginBottom: 20,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.md,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userMessageBubble: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  aiMessageBubble: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  errorMessageBubble: {
    backgroundColor: colors.errorBackground,
    borderColor: colors.error,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  messageParagraph: {
    marginTop: 12,
  },
  userMessageText: {
    color: colors.white,
  },
  aiMessageText: {
    color: colors.text,
  },
  loadingContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bottomSection: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  selectedImageContainer: {
    position: 'relative',
    marginHorizontal: spacing.screenPadding,
    marginTop: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  selectedImagePreview: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.sm,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.surface,
    borderRadius: 10,
  },
  uploadSection: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: spacing.lg,
    marginHorizontal: spacing.screenPadding,
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  uploadButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
  },
  divider: {
    width: 2,
    height: 60,
    backgroundColor: colors.border,
    marginHorizontal: spacing.screenPadding,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 12,
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 100,
    backgroundColor: colors.surface,
    borderRadius: 25,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
