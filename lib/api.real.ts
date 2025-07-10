import axios from 'axios';
import { createEpisode, getEpisode, searchSegments, getEpisodeSpeakers, supabase, type EpisodeData, type CreateEpisodeData } from './supabase';
import { generateEmbedding, generateHostResponse } from './openai';
import { rewriteQuestion } from './claude';
import { synthesizeSpeech, getHostVoiceId, getHostVoiceSettings } from './vogent';
import { getHostPrompt } from '../constants/prompts';
import { processYouTubeUrl, type YouTubeVideoData } from './youtube';

// Get environment variables for debugging
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// API endpoints
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const VOGENT_API_KEY = process.env.EXPO_PUBLIC_VOGENT_API_KEY || '';
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
 * Extract YouTube video ID from URL
 * Supports: youtube.com/watch?v=ID, youtube.com/shorts/ID, youtu.be/ID
 */
function extractVideoIdFromUrl(url: string): string | null {
  // Regular YouTube URL: youtube.com/watch?v=VIDEO_ID
  let match = url.match(/[?&]v=([^&#]*)/);
  if (match) return match[1];
  
  // YouTube Shorts: youtube.com/shorts/VIDEO_ID
  match = url.match(/\/shorts\/([^/?&#]*)/);
  if (match) return match[1];
  
  // Short URL: youtu.be/VIDEO_ID
  match = url.match(/youtu\.be\/([^/?&#]*)/);
  if (match) return match[1];
  
  return null;
}

/**
 * Process a YouTube URL using video ID as episode identifier
 * This function returns immediately after creating the episode and getting metadata
 */
export async function processPodcastLink(youtubeUrl: string): Promise<ProcessResult> {
  try {
    console.log('🔄 Processing YouTube URL:', youtubeUrl);
    
    // Extract video ID to use as episode ID
    const videoId = extractVideoIdFromUrl(youtubeUrl);
    if (!videoId) {
      throw new Error('Could not extract video ID from YouTube URL');
    }

    console.log('📹 Extracted video ID:', videoId);

    // Check if episode already exists
    try {
      const existingEpisode = await getEpisode(videoId);
      if (existingEpisode) {
        console.log('✅ Episode already exists:', existingEpisode.title);
        
        // Convert existing episode data to YouTube format
        const videoData: YouTubeVideoData = {
          id: videoId,
          title: existingEpisode.title,
          description: existingEpisode.description || '',
          duration: formatSecondsToISO(existingEpisode.durationSeconds || 0),
          durationSeconds: existingEpisode.durationSeconds || 0,
          thumbnailUrl: existingEpisode.thumbnailUrl || '',
          channelTitle: existingEpisode.channelTitle || '',
          publishedAt: existingEpisode.createdAt || new Date().toISOString(),
        };
        
        return {
          episodeId: videoId,
          videoData,
        };
      }
    } catch (error) {
      console.log('🆕 Episode doesn\'t exist yet, creating new one');
    }

    // Fetch YouTube metadata
    console.log('🔍 Fetching YouTube metadata...');
    const videoData = await processYouTubeUrl(youtubeUrl);
    console.log('✅ YouTube metadata fetched:', videoData.title);
    
    // Create episode with video ID
    const episodeData: CreateEpisodeData = {
      id: videoId,
      youtubeUrl: youtubeUrl,
      title: videoData.title,
      description: videoData.description,
      durationSeconds: videoData.durationSeconds,
      thumbnailUrl: videoData.thumbnailUrl,
      channelTitle: videoData.channelTitle,
    };
    
    console.log('💾 Creating episode in database...');
    const createdEpisodeId = await createEpisode(episodeData);
    console.log('✅ Episode created with ID:', createdEpisodeId);
    
    // Start background processing immediately (don't wait for it)
    startBackgroundProcessing(youtubeUrl, videoId).catch(error => {
      console.error('❌ Background processing failed:', error);
    });
    
    return {
      episodeId: videoId,
      videoData,
    };
  } catch (error) {
    console.error('❌ Error processing YouTube URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to process YouTube URL: ${errorMessage}`);
  }
}

/**
 * Start background processing for audio download and AssemblyAI transcription
 * This calls the real Python processing API to download audio and transcribe
 */
export async function startBackgroundProcessing(youtubeUrl: string, episodeId: string): Promise<void> {
  try {
    console.log('🔄 Starting background processing for episode:', episodeId);
    
    // Update status to processing
    await supabase
      .from('episodes')
      .update({ processing_status: 'processing' })
      .eq('id', episodeId);
    
    // Call the Python processing API
    const apiUrl = process.env.EXPO_PUBLIC_PROCESSING_API_URL || 'http://localhost:8000';
    
    console.log('🐍 Calling Python processing API at:', apiUrl);
    
    const response = await fetch(`${apiUrl}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        youtube_url: youtubeUrl,
        episode_id: episodeId,
        force_reprocess: false,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(`Python API error: ${errorData.detail || response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Python processing API response:', result);
    
    if (result.status === 'already_processed') {
      console.log('ℹ️  Episode was already processed');
      return;
    }
    
    console.log('🎯 Real processing started! The Python API will:');
    console.log('  1. Download actual audio from YouTube');
    console.log('  2. Transcribe with AssemblyAI speaker diarization');
    console.log('  3. Generate embeddings with OpenAI');
    console.log('  4. Update database when complete');
    console.log('');
    console.log('📊 You can check the processing status in real-time in your database!');
    
  } catch (error) {
    console.error('❌ Background processing failed:', error);
    
    // Update status to failed
    await supabase
      .from('episodes')
      .update({ 
        processing_status: 'failed',
        processing_metadata: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          failed_at: new Date().toISOString()
        }
      })
      .eq('id', episodeId);
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
    
    // Step 2: Get episode speakers to determine primary host
    const speakers = await getEpisodeSpeakers(episodeId);
    const primaryHost = speakers.find(s => s.speakerName)?.speakerName || 'Chamath'; // Default to Chamath if no mapping
    
    // Step 3: Rewrite question with Claude for better RAG performance
    const rewrittenQuestion = await rewriteQuestion(
      question, 
      episodeData.title, 
      [primaryHost] // Convert to array for compatibility
    );
    
    // Step 4: Generate embedding for semantic search
    const queryEmbedding = await generateEmbedding(rewrittenQuestion);
    
    // Step 5: Search for relevant segments
    const relevantSegments = await searchSegments(episodeId, queryEmbedding);
    
    if (relevantSegments.length === 0) {
      throw new Error('No relevant context found for your question');
    }
    
    // Step 6: Prepare context and generate response
    const context = relevantSegments.map(seg => seg.content).join('\n\n');
    const hostPrompt = await getHostPrompt(primaryHost); // Now async
    
    const answer = await generateHostResponse(
      rewrittenQuestion,
      context,
      hostPrompt.name,
      hostPrompt.systemPrompt
    );
    
    // Step 7: Convert to speech
    const voiceId = await getHostVoiceId(primaryHost);
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

// Re-export types for convenience
export type { EpisodeData } from './supabase'; 

// Helper function to convert seconds to ISO 8601 duration format
function formatSecondsToISO(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `PT${hours}H${minutes}M${secs}S`;
  } else {
    return `PT${minutes}M${secs}S`;
  }
} 