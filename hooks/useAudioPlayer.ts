import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

export interface UseAudioPlayerResult {
  sound: Audio.Sound | null;
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  loadAudio: (uri: string) => Promise<void>;
  togglePlayback: () => Promise<void>;
  seekTo: (positionMillis: number) => Promise<void>;
  setRate: (rate: number) => Promise<void>;
  unload: () => Promise<void>;
}

/**
 * Custom hook for managing audio playback
 */
export function useAudioPlayer(): UseAudioPlayerResult {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const soundRef = useRef<Audio.Sound | null>(null);

  const loadAudio = async (uri: string) => {
    try {
      setIsLoading(true);
      
      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      
      soundRef.current = newSound;
      setSound(newSound);
    } catch (error) {
      console.error('Error loading audio:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayback = async () => {
    if (!soundRef.current) return;

    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const seekTo = async (positionMillis: number) => {
    if (!soundRef.current) return;

    try {
      await soundRef.current.setPositionAsync(positionMillis);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const setRate = async (rate: number) => {
    if (!soundRef.current) return;

    try {
      await soundRef.current.setRateAsync(rate, true);
    } catch (error) {
      console.error('Error setting rate:', error);
    }
  };

  const unload = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setSound(null);
        setIsPlaying(false);
        setPosition(0);
        setDuration(0);
      } catch (error) {
        console.error('Error unloading audio:', error);
      }
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
      
      // Handle playback completion
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unload();
    };
  }, []);

  return {
    sound,
    isPlaying,
    isLoading,
    position,
    duration,
    loadAudio,
    togglePlayback,
    seekTo,
    setRate,
    unload,
  };
} 