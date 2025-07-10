import { useState, useRef } from 'react';
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import { Alert } from 'react-native';

export interface UseVoiceRecordingResult {
  isRecording: boolean;
  recordingUri: string | null;
  duration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  clearRecording: () => void;
  requestPermissions: () => Promise<boolean>;
}

/**
 * Custom hook for managing voice recording
 */
export function useVoiceRecording(): UseVoiceRecordingResult {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await AudioModule.requestRecordingPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return false;
    }
  };

  const startRecording = async () => {
    try {
      // Check permissions
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please grant microphone permission to use voice input'
        );
        return;
      }

      // Prepare and start recording
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      
      setIsRecording(true);
      setDuration(0);

      // Start duration timer
      durationInterval.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    try {
      setIsRecording(false);
      
      // Clear duration timer
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      // Stop recording and get URI
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      
      setRecordingUri(uri);
      
      return uri;
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
      return null;
    }
  };

  const clearRecording = () => {
    setRecordingUri(null);
    setDuration(0);
    
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  };

  return {
    isRecording,
    recordingUri,
    duration,
    startRecording,
    stopRecording,
    clearRecording,
    requestPermissions,
  };
} 