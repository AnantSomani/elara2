import { useState, useEffect } from 'react';
import { useAudioPlayer as useExpoAudioPlayer, AudioSource } from 'expo-audio';

export interface UseAudioPlayerResult {
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
 * Custom hook for managing audio playback using expo-audio
 */
export function useAudioPlayer(): UseAudioPlayerResult {
  const [isLoading, setIsLoading] = useState(false);
  const [audioSource, setAudioSource] = useState<AudioSource | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Use the new expo-audio hook
  const player = useExpoAudioPlayer(audioSource);

  const loadAudio = async (uri: string) => {
    try {
      setIsLoading(true);
      setAudioSource({ uri });
    } catch (error) {
      console.error('Error loading audio:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayback = async () => {
    if (!player || !player.isLoaded) {
      return;
    }

    try {
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const seekTo = async (positionMillis: number) => {
    if (!player) return;

    try {
      player.seekTo(positionMillis / 1000); // expo-audio expects seconds
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const setRate = async (rate: number) => {
    if (!player) return;

    try {
      // Note: rate setting might not be available in expo-audio
      console.warn('Rate setting may not be supported in expo-audio');
    } catch (error) {
      console.error('Error setting rate:', error);
    }
  };

  const unload = async () => {
    try {
      setAudioSource(null);
    } catch (error) {
      console.error('Error unloading audio:', error);
    }
  };

  // Force re-renders to sync with player state changes
  useEffect(() => {
    if (player) {
      const interval = setInterval(() => {
        setForceUpdate(prev => prev + 1);
      }, 500); // Check every 500ms

      return () => clearInterval(interval);
    }
  }, [player]);

  return {
    isPlaying: player?.playing ?? false,
    isLoading,
    position: (player?.currentTime ?? 0) * 1000, // Convert to milliseconds
    duration: (player?.duration ?? 0) * 1000, // Convert to milliseconds
    loadAudio,
    togglePlayback,
    seekTo,
    setRate,
    unload,
  };
} 