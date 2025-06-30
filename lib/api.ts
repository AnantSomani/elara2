import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { createEpisode, getEpisode, searchSegments, type EpisodeData } from './supabase';
import { generateEmbedding, generateHostResponse } from './openai';
import { rewriteQuestion } from './claude';
import { synthesizeSpeech, getHostVoiceId, getHostVoiceSettings } from './elevenlabs';
import { getHostPrompt } from '../constants/prompts';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

// API endpoints
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';
const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '';

export interface QuestionResponse {
  answer: string;
  audioUrl: string;
  hostVoice: string;
}

/**
 * Process a podcast link and return episode ID
 */
export async function processPodcastLink(podcastLink: string): Promise<string> {
  try {
    // Create episode record in Supabase
    const episodeId = await createEpisode(podcastLink);
    
    // TODO: Trigger backend processing
    await triggerPodcastProcessing(episodeId, podcastLink);
    
    return episodeId;
  } catch (error) {
    console.error('Error processing podcast link:', error);
    throw new Error('Failed to process podcast link');
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
    throw new Error('Failed to fetch episode data');
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
    throw new Error('Failed to process question');
  }
}

/**
 * Trigger backend podcast processing (placeholder)
 */
async function triggerPodcastProcessing(episodeId: string, podcastLink: string): Promise<void> {
  // This would typically call your backend webhook or queue system
  console.log(`Triggering processing for episode ${episodeId}: ${podcastLink}`);
  
  // TODO: Implement actual backend integration
  // Example:
  // const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  // if (backendUrl) {
  //   await fetch(`${backendUrl}/process-podcast`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ episodeId, podcastLink }),
  //   });
  // }
}

// Re-export types and utilities for convenience
export type { EpisodeData } from './supabase';
export { supabase } from './supabase'; 