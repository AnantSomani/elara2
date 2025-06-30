import { useState, useEffect } from 'react';
import { getEpisodeData, type EpisodeData } from '../lib/api';
import { subscribeToEpisode } from '../lib/supabase';

export interface UseEpisodeResult {
  episode: EpisodeData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing episode data with real-time updates
 */
export function useEpisode(episodeId: string | null): UseEpisodeResult {
  const [episode, setEpisode] = useState<EpisodeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEpisode = async () => {
    if (!episodeId) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await getEpisodeData(episodeId);
      setEpisode(data);
    } catch (err) {
      console.error('Error fetching episode:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch episode');
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    setIsLoading(true);
    await fetchEpisode();
  };

  useEffect(() => {
    fetchEpisode();
  }, [episodeId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!episodeId) return;

    const subscription = subscribeToEpisode(episodeId, (updatedEpisode) => {
      setEpisode(updatedEpisode);
      
      // If processing just completed, we might want to refetch full data
      if (updatedEpisode.processingStatus === 'completed') {
        fetchEpisode();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [episodeId]);

  return {
    episode,
    isLoading,
    error,
    refetch,
  };
} 