import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Request permission, set audio mode, and start recording.
 * Returns the recording object. Call stopRecordingWithBase64(recording) when user stops.
 * @returns {Promise<import('expo-av').Recording>}
 */
export async function startVoiceRecording() {
  const { status } = await Audio.requestPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Microphone permission is required to record.');
  }
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  return recording;
}

/**
 * Stop recording and read the file as base64 for the voice-note API.
 * @param {import('expo-av').Recording} recording
 * @returns {Promise<string>} base64 string
 */
export async function stopRecordingWithBase64(recording) {
  if (!recording) throw new Error('No active recording.');
  await recording.stopAndUnloadAsync();
  await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
  const uri = recording.getURI();
  if (!uri) throw new Error('Recording file not available.');
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
  return base64;
}
