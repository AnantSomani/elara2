// MOCK API for frontend design/dev only
// To enable: set EXPO_PUBLIC_USE_MOCKS=true in your .env.local
// To disable: set EXPO_PUBLIC_USE_MOCKS=false

import type { ProcessResult, QuestionResponse } from './api.real';
import type { EpisodeData } from './supabase';
import type { YouTubeVideoData } from './youtube';

export async function processPodcastLink(youtubeUrl: string): Promise<ProcessResult> {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));
  const videoData: YouTubeVideoData = {
    id: 'mock-video-id',
    title: 'Mock Podcast Episode',
    description: 'This is a mock description for design/dev.',
    duration: 'PT1H0M0S',
    durationSeconds: 3600,
    thumbnailUrl: 'https://placehold.co/600x400',
    channelTitle: 'Mock Channel',
    publishedAt: '2024-01-01T00:00:00Z',
  };
  return {
    episodeId: 'mock-episode-id',
    videoData,
  };
}

export async function getEpisodeData(episodeId: string): Promise<EpisodeData> {
  await new Promise(res => setTimeout(res, 300));
  return {
    id: episodeId,
    title: 'Mock Podcast Episode',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    hosts: ['Chamath', 'Sacks', 'Friedberg', 'Jason'],
    transcript: 'This is a mock transcript.',
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