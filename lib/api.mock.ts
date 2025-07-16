// MOCK API for frontend design/dev only
// To enable: set EXPO_PUBLIC_USE_MOCKS=true in your .env.local
// To disable: set EXPO_PUBLIC_USE_MOCKS=false

import type { 
  EpisodeProcessResult, 
  QuestionResponse,
  PodcastIndexEpisodeData,
  PodcastIndexProcessResult,
  PodcastIndexStatusResult
} from './api.real';
import type { EpisodeData } from './supabase';

export async function processPodcastEpisode(
  episodeData: any, 
  audioUrl: string, 
  podcastTitle: string
): Promise<EpisodeProcessResult> {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));
  return {
    episodeId: 'mock-episode-id',
    transcriptionStarted: false,
  };
}

export async function processPodcastLink(youtubeUrl: string): Promise<EpisodeProcessResult> {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));
  return {
    episodeId: 'mock-episode-id',
    transcriptionStarted: false,
  };
}

export async function getEpisodeData(episodeId: string): Promise<EpisodeData> {
  await new Promise(res => setTimeout(res, 300));
  return {
    id: episodeId,
    title: 'Mock Podcast Episode',
    enclosureUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    hosts: ['Chamath', 'Sacks', 'Friedberg', 'Jason'],
    processingStatus: 'completed',
  };
}

export async function sendQuestion(episodeId: string, question: string): Promise<QuestionResponse> {
  await new Promise(res => setTimeout(res, 800));
  return {
    answer: `Mock answer to: "${question}"`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    hostVoice: 'Chamath',
  };
}

export async function processPodcastIndexEpisode(
  episodeData: PodcastIndexEpisodeData,
  forceReprocess: boolean = false
): Promise<PodcastIndexProcessResult> {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 1000));
  return {
    episodeId: episodeData.guid,
    status: 'processing',
    message: 'Mock Podcast Index episode processing started',
    startedAt: new Date().toISOString(),
  };
}

export async function getPodcastIndexStatus(episodeId: string): Promise<PodcastIndexStatusResult> {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 300));
  return {
    episodeId,
    processingStatus: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function pollPodcastIndexStatus(
  episodeId: string, 
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<PodcastIndexStatusResult> {
  // Simulate processing time
  await new Promise(res => setTimeout(res, 2000));
  return {
    episodeId,
    processingStatus: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
} 