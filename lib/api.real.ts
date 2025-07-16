import axios from 'axios';
import { createEpisode, getEpisode, searchSegments, getEpisodeSpeakers, supabase, type EpisodeData, type CreateEpisodeData } from './supabase';
import { generateEmbedding, generateHostResponse } from './openai';
import { rewriteQuestion } from './claude';
import { synthesizeSpeech, getHostVoiceId, getHostVoiceSettings } from './vogent';
import { getHostPrompt } from '../constants/prompts';
import { transcribeEpisode, checkTranscriptionStatus, searchTranscript, type TranscriptSegment } from './assemblyai';

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
  relevantSegments?: TranscriptSegment[];
}

export interface EpisodeProcessResult {
  episodeId: string;
  transcriptionStarted: boolean;
  transcriptionId?: string;
}

export interface PodcastIndexEpisodeData {
  guid: string;
  enclosureUrl: string;
  title: string;
  description?: string;
  duration?: number;
  pubDate?: string;
  imageUrl?: string;
  podcastTitle?: string;
  episodeType?: string;
  explicit?: boolean;
}

export interface PodcastIndexProcessResult {
  episodeId: string;
  status: string;
  message: string;
  startedAt: string;
}

export interface PodcastIndexStatusResult {
  episodeId: string;
  processingStatus: string;
  createdAt?: string;
  updatedAt?: string;
  errorMessage?: string;
}

/**
 * Process a podcast episode for transcription and AI chat
 * This creates or updates episode data and starts transcription if needed
 */
export async function processPodcastEpisode(
  episodeData: any, 
  audioUrl: string, 
  podcastTitle: string
): Promise<EpisodeProcessResult> {
  try {
    console.log('🎙️ Processing podcast episode for transcription...');
    console.log('📹 Episode:', episodeData.title);
    console.log('🔗 Audio URL:', audioUrl);
    
    const episodeId = episodeData.id.toString();

    // Check if episode exists in database
    console.log('🔍 Checking database for existing episode...');
    const { data: existingEpisode, error: dbError } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', episodeId)
      .single();

    let needsTranscription = true;

    if (!dbError && existingEpisode) {
      console.log('✅ Episode found in database');
      
      // Check transcription status
      if (existingEpisode.transcriptionStatus === 'completed') {
        console.log('✅ Episode already has completed transcription');
        needsTranscription = false;
      } else if (existingEpisode.transcriptionStatus === 'processing') {
        console.log('⏳ Episode transcription already in progress');
        needsTranscription = false;
      }
    } else {
      // Create new episode in database
      console.log('🆕 Creating new episode in database...');
      
      const newEpisodeData: CreateEpisodeData = {
        id: episodeId,
        title: episodeData.title || 'Unknown Episode',
        description: episodeData.description || '',
        durationSeconds: episodeData.duration || 0,
        imageUrl: episodeData.image || '',
        podcastTitle: podcastTitle,
        enclosureUrl: audioUrl,
        publishedAt: new Date(episodeData.datePublished * 1000).toISOString(),
      };
      
      await createEpisode(newEpisodeData);
      console.log('✅ Episode created in database');
    }

    let transcriptionId: string | undefined;
    
    // Start transcription if needed
    if (needsTranscription && audioUrl) {
      try {
        console.log('🎤 Starting transcription process...');
        transcriptionId = await transcribeEpisode(audioUrl, episodeId);
        console.log('✅ Transcription started with ID:', transcriptionId);
    
        // Start monitoring transcription progress
        monitorTranscriptionProgress(episodeId, transcriptionId).catch(error => {
          console.error('❌ Transcription monitoring failed:', error);
    });
        
      } catch (error) {
        console.error('❌ Failed to start transcription:', error);
        // Don't throw - episode can still be used without transcription
      }
    }
    
    return {
      episodeId,
      transcriptionStarted: needsTranscription,
      transcriptionId,
    };

  } catch (error) {
    console.error('❌ Error processing podcast episode:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to process podcast episode: ${errorMessage}`);
  }
}

/**
 * Monitor transcription progress in the background
 */
async function monitorTranscriptionProgress(episodeId: string, transcriptId: string): Promise<void> {
  try {
    console.log('👀 Monitoring transcription progress for:', episodeId);
    
    const maxAttempts = 30; // 15 minutes max (30 * 30 seconds)
    let attempts = 0;

    const checkProgress = async (): Promise<void> => {
      try {
        attempts++;
        console.log(`📊 Checking transcription progress (attempt ${attempts}/${maxAttempts})...`);
        
        const { assemblyAIService } = await import('./assemblyai');
        const status = await assemblyAIService.checkTranscriptionStatus(transcriptId);
        
        console.log(`📈 Transcription status: ${status.status}`);
        
        if (status.status === 'completed') {
          console.log('🎉 Transcription completed! Processing final result...');
          await assemblyAIService.processCompletedTranscription(episodeId, transcriptId);
          console.log('✅ Transcription processing complete');
      return;
    }

        if (status.status === 'error') {
          console.error('❌ Transcription failed:', status.error);
          return;
        }
        
        if (attempts < maxAttempts && status.status === 'processing') {
          // Continue monitoring
          setTimeout(checkProgress, 30000); // Check every 30 seconds
        } else if (attempts >= maxAttempts) {
          console.warn('⚠️ Transcription monitoring timeout - stopping checks');
        }
        
      } catch (error) {
        console.error('❌ Error checking transcription progress:', error);
        if (attempts < maxAttempts) {
          setTimeout(checkProgress, 30000); // Retry in 30 seconds
        }
      }
    };

    // Start monitoring after initial delay
    setTimeout(checkProgress, 10000); // Wait 10 seconds before first check
    
  } catch (error) {
    console.error('❌ Error setting up transcription monitoring:', error);
  }
}

/**
 * Get episode data with transcription status
 */
export async function getEpisodeData(episodeId: string): Promise<EpisodeData> {
  try {
    console.log('📖 Getting episode data for:', episodeId);
    
    const episode = await getEpisode(episodeId);
    if (!episode) {
      throw new Error('Episode not found');
    }
    
    // Check transcription status if it's still processing
    if (episode.transcriptionStatus === 'processing' && episode.transcriptId) {
      try {
        const status = await checkTranscriptionStatus(episodeId);
        if (status && status.status !== episode.transcriptionStatus) {
          console.log(`📊 Transcription status updated: ${status.status}`);
          // Status will be updated by the monitoring process
        }
      } catch (error) {
        console.warn('⚠️ Could not check transcription status:', error);
      }
    }
    
    return episode;
    
  } catch (error) {
    console.error('❌ Error getting episode data:', error);
    throw error;
  }
}

/**
 * Send a question about an episode and get AI response with transcript context
 */
export async function sendQuestion(
  episodeId: string, 
  question: string
): Promise<QuestionResponse> {
  try {
    console.log('💬 Processing question for episode:', episodeId);
    console.log('❓ Question:', question);
    
    // Get episode data
    const episode = await getEpisode(episodeId);
    if (!episode) {
      throw new Error('Episode not found');
    }

    // Check if transcription is available
    let relevantSegments: TranscriptSegment[] = [];
    let contextText = '';
    
    if (episode.transcriptionStatus === 'completed') {
      try {
        console.log('🔍 Searching transcript for relevant content...');
        relevantSegments = await searchTranscript(episodeId, question);
    
        if (relevantSegments.length > 0) {
          console.log(`✅ Found ${relevantSegments.length} relevant transcript segments`);
          contextText = relevantSegments
            .map(segment => segment.text)
            .join(' ');
        }
      } catch (error) {
        console.warn('⚠️ Could not search transcript:', error);
      }
    }

    // Generate AI response with transcript context
    console.log('🤖 Generating AI response...');
    
    const questionText = question;
    const episodeContext = contextText || `Episode: ${episode.title}`;
    const hostName = 'Host';
    const hostStyle = 'You are a knowledgeable podcast host. Provide helpful, accurate responses based on the episode content.';

    const response = await generateHostResponse(questionText, episodeContext, hostName, hostStyle);
    
    console.log('✅ AI response generated');
    
    // For now, return without audio synthesis to focus on text responses
    return {
      answer: response,
      audioUrl: '', // Will implement audio synthesis later
      hostVoice: 'Host',
      relevantSegments: relevantSegments.length > 0 ? relevantSegments : undefined,
    };

  } catch (error) {
    console.error('❌ Error processing question:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to process question: ${errorMessage}`);
  }
}

/**
 * Get transcription status for an episode
 */
export async function getTranscriptionStatus(episodeId: string): Promise<string> {
  try {
    const { data: episode, error } = await supabase
      .from('episodes')
      .select('transcription_status')
      .eq('id', episodeId)
      .single();

    if (error || !episode) {
      return 'not_started';
    }

    return episode.transcription_status || 'not_started';
    
  } catch (error) {
    console.error('❌ Error getting transcription status:', error);
    return 'error';
  }
}

/**
 * Manually trigger transcription for an episode
 */
export async function startTranscription(episodeId: string, audioUrl: string): Promise<string> {
  try {
    console.log('🎤 Manually starting transcription for episode:', episodeId);
    
    const transcriptionId = await transcribeEpisode(audioUrl, episodeId);
    
    // Start monitoring
    monitorTranscriptionProgress(episodeId, transcriptionId).catch(error => {
      console.error('❌ Transcription monitoring failed:', error);
    });
    
    return transcriptionId;
    
  } catch (error) {
    console.error('❌ Error starting transcription:', error);
    throw error;
  }
} 

/**
 * Process a Podcast Index episode using the FastAPI backend
 */
export async function processPodcastIndexEpisode(
  episodeData: PodcastIndexEpisodeData,
  forceReprocess: boolean = false
): Promise<PodcastIndexProcessResult> {
  try {
    console.log('🎙️ Processing Podcast Index episode...');
    console.log('📹 Episode:', episodeData.title);
    console.log('🔗 Audio URL:', episodeData.enclosureUrl);
    
    const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    
    const response = await axios.post(`${apiBaseUrl}/process-podcast-index`, {
      episode_data: episodeData,
      episode_id: null, // Let the API generate one
      force_reprocess: forceReprocess
    });
    
    console.log('✅ Podcast Index processing started:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error processing Podcast Index episode:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to process Podcast Index episode: ${errorMessage}`);
  }
}

/**
 * Check the processing status of a Podcast Index episode
 */
export async function getPodcastIndexStatus(episodeId: string): Promise<PodcastIndexStatusResult> {
  try {
    console.log('📊 Checking Podcast Index processing status for:', episodeId);
    
    const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    
    const response = await axios.get(`${apiBaseUrl}/status/${episodeId}`);
    
    console.log('✅ Status retrieved:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error checking Podcast Index status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to check Podcast Index status: ${errorMessage}`);
  }
}

/**
 * Poll the processing status until completion or failure
 */
export async function pollPodcastIndexStatus(
  episodeId: string, 
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<PodcastIndexStatusResult> {
  try {
    console.log('🔄 Polling Podcast Index processing status...');
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`📊 Polling attempt ${attempt}/${maxAttempts}...`);
      
      const status = await getPodcastIndexStatus(episodeId);
      
      if (status.processingStatus === 'completed') {
        console.log('🎉 Podcast Index processing completed!');
        return status;
      }
      
      if (status.processingStatus === 'failed') {
        console.error('❌ Podcast Index processing failed:', status.errorMessage);
        return status;
      }
      
      if (attempt < maxAttempts) {
        console.log(`⏳ Still processing... waiting ${intervalMs}ms before next check`);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
    
    console.warn('⚠️ Polling timeout - processing may still be in progress');
    return await getPodcastIndexStatus(episodeId);
    
  } catch (error) {
    console.error('❌ Error polling Podcast Index status:', error);
    throw error;
  }
} 