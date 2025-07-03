import axios from 'axios';
import { createEpisode, getEpisode, searchSegments, supabase, type EpisodeData, type CreateEpisodeData } from './supabase';
import { generateEmbedding, generateHostResponse } from './openai';
import { rewriteQuestion } from './claude';
import { synthesizeSpeech, getHostVoiceId, getHostVoiceSettings } from './elevenlabs';
import { getHostPrompt } from '../constants/prompts';
import { processYouTubeUrl, type YouTubeVideoData } from './youtube';

// Get environment variables for debugging
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// API endpoints
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';
const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '';

export interface QuestionResponse {
  answer: string;
  audioUrl: string;
  hostVoice: string;
}

export interface ProcessResult {
  episodeId: string;
  videoData: YouTubeVideoData;
}

/**
 * Process a YouTube URL with proper validation and metadata fetching
 */
export async function processPodcastLink(youtubeUrl: string): Promise<ProcessResult> {
  try {
    console.log('🔗 Processing YouTube URL:', youtubeUrl);
    console.log('🔐 Supabase URL:', supabaseUrl ? 'Connected' : 'Missing');
    console.log('🔑 YouTube API Key:', process.env.EXPO_PUBLIC_YOUTUBE_API_KEY ? 'Set' : 'Missing');
    
    // Step 1: Fetch and validate YouTube video metadata
    console.log('📺 Fetching YouTube video metadata...');
    const videoData = await processYouTubeUrl(youtubeUrl);
    console.log('✅ Video metadata retrieved:', videoData.title);
    
    // Step 2: Create episode record with proper data
    console.log('📝 Creating episode record in database...');
    const episodeData: CreateEpisodeData = {
      youtubeUrl: youtubeUrl,
      title: videoData.title,
      description: videoData.description,
      durationSeconds: videoData.durationSeconds,
      thumbnailUrl: videoData.thumbnailUrl,
      channelTitle: videoData.channelTitle,
    };
    
    const episodeId = await createEpisode(episodeData);
    console.log('✅ Episode created with ID:', episodeId);
    
    // Step 3: Trigger backend processing
    console.log('🚀 Triggering backend processing...');
    await triggerPodcastProcessing(episodeId, youtubeUrl);
    console.log('✅ Processing triggered successfully');
    
    return {
      episodeId,
      videoData,
    };
  } catch (error) {
    console.error('❌ Error processing YouTube URL:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to process YouTube URL: ${errorMessage}`);
  }
}

/**
 * Get episode data by ID
 */
export async function getEpisodeData(episodeId: string): Promise<EpisodeData> {
  try {
    return await getEpisode(episodeId);
  } catch (error) {
    console.error('Error fetching episode data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch episode data: ${errorMessage}`);
  }
}

/**
 * Send a question about an episode and get AI response
 */
export async function sendQuestion(
  episodeId: string, 
  question: string
): Promise<QuestionResponse> {
  try {
    // Step 1: Get episode context
    const episodeData = await getEpisode(episodeId);
    
    // Step 2: Rewrite question with Claude for better RAG performance
    const rewrittenQuestion = await rewriteQuestion(
      question, 
      episodeData.title, 
      episodeData.hosts
    );
    
    // Step 3: Generate embedding for semantic search
    const queryEmbedding = await generateEmbedding(rewrittenQuestion);
    
    // Step 4: Search for relevant segments
    const relevantSegments = await searchSegments(episodeId, queryEmbedding);
    
    if (relevantSegments.length === 0) {
      throw new Error('No relevant context found for your question');
    }
    
    // Step 5: Prepare context and generate response
    const context = relevantSegments.map(seg => seg.content).join('\n\n');
    const primaryHost = episodeData.hosts[0] || 'Host';
    const hostPrompt = getHostPrompt(primaryHost);
    
    const answer = await generateHostResponse(
      rewrittenQuestion,
      context,
      hostPrompt.name,
      hostPrompt.systemPrompt
    );
    
    // Step 6: Convert to speech
    const voiceId = getHostVoiceId(primaryHost);
    const voiceSettings = getHostVoiceSettings(primaryHost);
    const audioUrl = await synthesizeSpeech(answer, voiceId, voiceSettings);
    
    return {
      answer,
      audioUrl,
      hostVoice: primaryHost,
    };
  } catch (error) {
    console.error('Error processing question:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to process question: ${errorMessage}`);
  }
}

/**
 * Trigger backend podcast processing (placeholder)
 */
async function triggerPodcastProcessing(episodeId: string, podcastLink: string): Promise<void> {
  // This would typically call your backend webhook or queue system
  console.log(`Triggering processing for episode ${episodeId}: ${podcastLink}`);
  // TODO: Implement actual backend integration
}

// Re-export types for convenience
export type { EpisodeData } from './supabase'; 