// AUTO-SWITCH: This file exports either the real or mock useEpisode hook
// To use mocks, set EXPO_PUBLIC_USE_MOCKS=true in your .env.local
// To use real backend, set EXPO_PUBLIC_USE_MOCKS=false

import { useState, useEffect } from 'react';
import { getEpisodeData } from '../lib/api';
import { subscribeToEpisode, type EpisodeData } from '../lib/supabase';

export interface UseEpisodeResult {
  episode: EpisodeData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';

let useEpisodeImpl: (episodeId: string | null) => UseEpisodeResult;

if (USE_MOCKS) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  useEpisodeImpl = require('./useEpisode.mock').useEpisode;
} else {
  useEpisodeImpl = function useEpisode(episodeId: string | null): UseEpisodeResult {
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
  };
} 

export const useEpisode = useEpisodeImpl; 