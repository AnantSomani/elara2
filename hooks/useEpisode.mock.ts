// MOCK useEpisode hook for frontend design/dev only
// To enable: set EXPO_PUBLIC_USE_MOCKS=true in your .env.local
// To disable: set EXPO_PUBLIC_USE_MOCKS=false

import { useState, useEffect } from 'react';
import type { UseEpisodeResult } from './useEpisode';
export type { UseEpisodeResult };

export function useEpisode(episodeId: string | null): UseEpisodeResult {
  const [episode, setEpisode] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    // Simulate loading and then return mock data
    const timeout = setTimeout(() => {
      if (!episodeId) {
        setError('No episode ID provided');
        setIsLoading(false);
        return;
      }
      setEpisode({
        id: episodeId,
        title: 'Mock Podcast Episode',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        hosts: ['Chamath', 'Sacks', 'Friedberg', 'Jason'],
        transcript: 'This is a mock transcript.',
        processingStatus: 'completed',
      });
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timeout);
  }, [episodeId]);

  return {
    episode,
    isLoading,
    error,
    refetch: async () => {},
  };
} 