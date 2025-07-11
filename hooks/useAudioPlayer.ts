import { useState, useEffect, useCallback } from 'react';
import { useAudioPlayer as useExpoAudioPlayer, AudioSource } from 'expo-audio';

export interface UseAudioPlayerResult {
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  position: number;
  duration: number;
  loadAudio: (uri: string) => Promise<void>;
  togglePlayback: () => Promise<void>;
  seekTo: (positionMillis: number) => Promise<void>;
  setRate: (rate: number) => Promise<void>;
  unload: () => Promise<void>;
  error: string | null;
}

/**
 * Enhanced custom hook for managing podcast audio playback with CDN streaming support
 */
export function useAudioPlayer(): UseAudioPlayerResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [audioSource, setAudioSource] = useState<AudioSource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Use the expo-audio hook
  const player = useExpoAudioPlayer(audioSource);

  const loadAudio = useCallback(async (uri: string) => {
    try {
      console.log('🎵 Loading podcast audio from CDN:', uri);
      setIsLoading(true);
      setError(null);
      
      // Validate URI format
      if (!uri || (!uri.startsWith('http://') && !uri.startsWith('https://'))) {
        throw new Error('Invalid audio URL format');
      }

      // Set the audio source for expo-audio
      setAudioSource({ uri });
      
      console.log('✅ Audio source set successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load audio';
      console.error('❌ Audio loading error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const togglePlayback = useCallback(async () => {
    if (!player || !player.isLoaded) {
      console.warn('⚠️ Player not ready for playback');
      return;
    }

    try {
      setError(null);
      
      if (player.playing) {
        console.log('⏸️ Pausing playback');
        player.pause();
      } else {
        console.log('▶️ Starting playback');
        setIsBuffering(true);
        player.play();
        
        // Clear buffering state after a short delay
        setTimeout(() => setIsBuffering(false), 1000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Playback error';
      console.error('❌ Playback error:', errorMessage);
      setError(errorMessage);
      setIsBuffering(false);
    }
  }, [player]);

  const seekTo = useCallback(async (positionMillis: number) => {
    if (!player || !player.isLoaded) {
      console.warn('⚠️ Player not ready for seeking');
      return;
    }

    try {
      const positionSeconds = positionMillis / 1000;
      console.log(`⏭️ Seeking to ${positionSeconds}s`);
      
      setIsBuffering(true);
      player.seekTo(positionSeconds);
      
      // Clear buffering state after seeking
      setTimeout(() => setIsBuffering(false), 500);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Seek error';
      console.error('❌ Seek error:', errorMessage);
      setError(errorMessage);
      setIsBuffering(false);
    }
  }, [player]);

  const setRate = useCallback(async (rate: number) => {
    if (!player || !player.isLoaded) {
      console.warn('⚠️ Player not ready for rate change');
      return;
    }

    try {
      // expo-audio may not support rate changes yet
      console.log(`🎛️ Attempting to set playback rate to ${rate}x`);
      // player.setRate(rate); // Uncomment when expo-audio supports it
      console.warn('⚠️ Rate setting not yet supported in expo-audio');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Rate change error';
      console.error('❌ Rate change error:', errorMessage);
      setError(errorMessage);
    }
  }, [player]);

  const unload = useCallback(async () => {
    try {
      console.log('🗑️ Unloading audio');
      setAudioSource(null);
      setError(null);
      setIsBuffering(false);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unload error';
      console.error('❌ Unload error:', errorMessage);
      setError(errorMessage);
    }
  }, []);

  // Monitor player state changes and update position
  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      // Only update if player is loaded to avoid unnecessary re-renders
      if (player.isLoaded) {
        setForceUpdate(prev => prev + 1);
        
        // Clear any stale errors when playback is working
        if (player.playing && error) {
          setError(null);
        }
      }
    }, 250); // Update every 250ms for smoother progress tracking

    return () => clearInterval(interval);
  }, [player, error]);

  // Handle player load state changes
  useEffect(() => {
    if (player?.isLoaded) {
      setIsLoading(false);
      setIsBuffering(false);
      console.log('✅ Audio loaded and ready for playback');
    }
  }, [player?.isLoaded]);

  return {
    isPlaying: player?.playing ?? false,
    isLoading,
    isBuffering,
    position: (player?.currentTime ?? 0) * 1000, // Convert to milliseconds
    duration: (player?.duration ?? 0) * 1000, // Convert to milliseconds
    error,
    loadAudio,
    togglePlayback,
    seekTo,
    setRate,
    unload,
  };
} 