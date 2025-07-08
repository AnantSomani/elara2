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
      console.log('Starting to load audio from:', uri);
      setIsLoading(true);
      
      console.log('Setting audio source...');
      setAudioSource({ uri });
      console.log('Audio source set successfully!');
    } catch (error) {
      console.error('Error loading audio:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayback = async () => {
    console.log('🎮 togglePlayback called!');
    console.log('🎮 Player exists:', !!player);
    console.log('🎮 Player properties:', player ? {
      playing: player.playing,
      isLoaded: player.isLoaded,
      currentTime: player.currentTime,
      duration: player.duration
    } : 'NO PLAYER');
    
    if (!player) {
      console.log('🎮 No player available, cannot toggle playback');
      return;
    }

    if (!player.isLoaded) {
      console.log('🎮 Audio not loaded yet, cannot toggle playback');
      return;
    }

    try {
      if (player.playing) {
        console.log('🎮 Pausing audio...');
        player.pause();
      } else {
        console.log('🎮 Playing audio...');
        player.play();
      }
    } catch (error) {
      console.error('🎮 Error toggling playback:', error);
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
        const currentPlaying = player.playing;
        const currentTime = player.currentTime;
        const currentDuration = player.duration;
        const currentLoaded = player.isLoaded;
        
        // Force update to sync React state with player state
        setForceUpdate(prev => prev + 1);
        
        console.log('🎶 Player state sync:', {
          playing: currentPlaying,
          currentTime,
          duration: currentDuration,
          isLoaded: currentLoaded
        });
      }, 500); // Check every 500ms

      return () => clearInterval(interval);
    }
  }, [player]);

  // Debug playing state changes specifically
  const isPlaying = player?.playing ?? false;
  useEffect(() => {
    console.log('🎶 useAudioPlayer isPlaying changed to:', isPlaying);
  }, [isPlaying, forceUpdate]); // Include forceUpdate to trigger on sync

  const returnState = {
    isPlaying,
    isLoading,
    position: (player?.currentTime ?? 0) * 1000, // Convert to milliseconds
    duration: (player?.duration ?? 0) * 1000, // Convert to milliseconds
    loadAudio,
    togglePlayback,
    seekTo,
    setRate,
    unload,
  };

  return returnState;
} 