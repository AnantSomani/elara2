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
      console.log('AUDIO: Attempting to load', uri);
      setIsLoading(true);
      setError(null);
      if (!uri || (!uri.startsWith('http://') && !uri.startsWith('https://'))) {
        throw new Error('Invalid audio URL format');
      }
      setAudioSource({ uri });
      console.log('AUDIO: Audio source set successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load audio';
      console.error('AUDIO: loadAudio failed', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const togglePlayback = useCallback(async () => {
    if (!player || !player.isLoaded) {
      console.warn('AUDIO: Player not ready for playback', player);
      return;
    }
    try {
      setError(null);
      if (player.playing) {
        console.log('AUDIO: Pausing playback');
        player.pause();
      } else {
        console.log('AUDIO: Starting playback');
        setIsBuffering(true);
        player.play();
        setTimeout(() => setIsBuffering(false), 1000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Playback error';
      console.error('AUDIO: Playback error', errorMessage);
      setError(errorMessage);
      setIsBuffering(false);
    }
  }, [player]);

  const seekTo = useCallback(async (positionMillis: number) => {
    if (!player || !player.isLoaded) {
      console.warn('AUDIO: Player not ready for seeking', player);
      return;
    }
    try {
      const positionSeconds = positionMillis / 1000;
      console.log(`AUDIO: Seeking to ${positionSeconds}s`);
      setIsBuffering(true);
      player.seekTo(positionSeconds);
      setTimeout(() => setIsBuffering(false), 500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Seek error';
      console.error('AUDIO: Seek error', errorMessage);
      setError(errorMessage);
      setIsBuffering(false);
    }
  }, [player]);

  const setRate = useCallback(async (rate: number) => {
    if (!player || !player.isLoaded) {
      console.warn('AUDIO: Player not ready for rate change', player);
      return;
    }
    try {
      console.log(`AUDIO: Attempting to set playback rate to ${rate}x`);
      console.warn('AUDIO: Rate setting not yet supported in expo-audio');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Rate change error';
      console.error('AUDIO: Rate change error', errorMessage);
      setError(errorMessage);
    }
  }, [player]);

  const unload = useCallback(async () => {
    try {
      console.log('AUDIO: Unloading audio');
      setAudioSource(null);
      setError(null);
      setIsBuffering(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unload error';
      console.error('AUDIO: Unload error', errorMessage);
      setError(errorMessage);
    }
  }, []);

  useEffect(() => {
    if (!player) return;
    const interval = setInterval(() => {
      if (player.isLoaded) {
        setForceUpdate(prev => prev + 1);
        if (player.playing && error) {
          setError(null);
        }
        console.log('AUDIO: Player state', {
          isLoaded: player.isLoaded,
          playing: player.playing,
          currentTime: player.currentTime,
          duration: player.duration,
        });
      }
    }, 250);
    return () => clearInterval(interval);
  }, [player, error]);

  useEffect(() => {
    if (player?.isLoaded) {
      setIsLoading(false);
      setIsBuffering(false);
      console.log('AUDIO: Audio loaded and ready for playback', {
        duration: player.duration,
        currentTime: player.currentTime,
      });
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