// AUTO-SWITCH: This file exports either the real or mock API functions
// To use mocks, set EXPO_PUBLIC_USE_MOCKS=true in your .env.local
// To disable: set EXPO_PUBLIC_USE_MOCKS=false

import * as RealAPI from './api.real';
import * as MockAPI from './api.mock';

const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';
const api = USE_MOCKS ? MockAPI : RealAPI;

// Export all API functions/types from the selected implementation
export const processPodcastEpisode = api.processPodcastEpisode;
export const getEpisodeData = api.getEpisodeData;
export const sendQuestion = api.sendQuestion;
export const processPodcastIndexEpisode = api.processPodcastIndexEpisode;
export const getPodcastIndexStatus = api.getPodcastIndexStatus;
export const pollPodcastIndexStatus = api.pollPodcastIndexStatus;
export type { 
  EpisodeProcessResult, 
  QuestionResponse,
  PodcastIndexEpisodeData,
  PodcastIndexProcessResult,
  PodcastIndexStatusResult
} from './api.real';