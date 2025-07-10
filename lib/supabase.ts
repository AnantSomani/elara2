import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

export interface EpisodeData {
  id: string;                    // YouTube video ID
  title: string;
  description?: string;
  youtubeUrl: string;
  audioUrl?: string;
  durationSeconds?: number;
  thumbnailUrl?: string;
  channelTitle?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  hosts?: string[];              // Array of host names
  createdAt?: string;
  updatedAt?: string;
}

export interface SegmentData {
  id: number;
  episodeId: string;             // YouTube video ID
  content: string;
  speaker: string;               // SPEAKER_00, SPEAKER_01, etc.
  startTime: number;             // Updated from timestampStart
  endTime: number;               // Updated from timestampEnd
  embedding?: number[];
  createdAt?: string;
}

export interface PodcastHost {
  id: number;
  name: string;                  // "Chamath", "Sacks", etc.
  voiceId: string;               // Vogent speaker ID
  personalityPrompt: string;     // Host-specific system prompt
  description?: string;
  createdAt?: string;
}

export interface EpisodeSpeaker {
  id: number;
  episodeId: string;             // YouTube video ID
  speakerLabel: string;          // "SPEAKER_00", "SPEAKER_01", etc.
  speakerName?: string;          // "Chamath", "Sacks", etc.
  confidenceScore?: number;
  createdAt?: string;
}

export interface CreateEpisodeData {
  id?: string;                   // Optional YouTube video ID
  title: string;
  description?: string;
  youtubeUrl: string;
  audioUrl?: string;
  durationSeconds?: number;
  thumbnailUrl?: string;
  channelTitle?: string;
}

/**
 * Create a new episode record in Supabase with YouTube metadata
 */
export async function createEpisode(episodeData: CreateEpisodeData): Promise<string> {
  const insertData: any = {
    youtube_url: episodeData.youtubeUrl,
    title: episodeData.title,
    description: episodeData.description,
    duration_seconds: episodeData.durationSeconds,
    thumbnail_url: episodeData.thumbnailUrl,
    channel_title: episodeData.channelTitle,
    processing_status: 'pending',
    created_at: new Date().toISOString(),
  };

  // If ID is provided, use it instead of auto-generated
  if (episodeData.id) {
    insertData.id = episodeData.id;
  }

  const { data, error } = await supabase
    .from('episodes')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw error;
  }
  
  return data.id;
}

/**
 * Get episode data by ID
 */
export async function getEpisode(episodeId: string): Promise<EpisodeData> {
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('id', episodeId)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title || 'Loading...',
    description: data.description,
    youtubeUrl: data.youtube_url,
    audioUrl: data.audio_url || '',
    durationSeconds: data.duration_seconds,
    thumbnailUrl: data.thumbnail_url,
    channelTitle: data.channel_title,
    processingStatus: data.processing_status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Get all podcast hosts
 */
export async function getPodcastHosts(): Promise<PodcastHost[]> {
  const { data, error } = await supabase
    .from('podcast_hosts')
    .select('*')
    .order('name');

  if (error) throw error;

  return data.map(host => ({
    id: host.id,
    name: host.name,
    voiceId: host.voice_id,
    personalityPrompt: host.personality_prompt,
    description: host.description,
    createdAt: host.created_at,
  }));
}

/**
 * Get episode speaker mapping
 */
export async function getEpisodeSpeakers(episodeId: string): Promise<EpisodeSpeaker[]> {
  const { data, error } = await supabase
    .from('episode_speakers')
    .select('*')
    .eq('episode_id', episodeId)
    .order('confidence_score', { ascending: false });

  if (error) throw error;

  return data.map(speaker => ({
    id: speaker.id,
    episodeId: speaker.episode_id,
    speakerLabel: speaker.speaker_label,
    speakerName: speaker.speaker_name,
    confidenceScore: speaker.confidence_score,
    createdAt: speaker.created_at,
  }));
}

/**
 * Search transcript segments using vector similarity
 */
export async function searchSegments(
  episodeId: string, 
  queryEmbedding: number[], 
  similarityThreshold: number = 0.7,
  matchCount: number = 5
): Promise<SegmentData[]> {
  const { data, error } = await supabase.rpc('search_segments', {
    target_episode_id: episodeId,
    query_embedding: JSON.stringify(queryEmbedding),
    similarity_threshold: similarityThreshold,
    match_count: matchCount,
  });

  if (error) throw error;

  return data.map((segment: any) => ({
    id: segment.id,
    episodeId: episodeId,
    content: segment.content,
    speaker: segment.speaker,
    startTime: segment.start_time,
    endTime: segment.end_time,
    embedding: undefined, // Not returned in search results
  }));
}

/**
 * Update episode processing status
 */
export async function updateEpisodeStatus(
  episodeId: string, 
  status: 'pending' | 'processing' | 'completed' | 'failed'
): Promise<void> {
  const { error } = await supabase
    .from('episodes')
    .update({ 
      processing_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', episodeId);

  if (error) throw error;
}

/**
 * Subscribe to episode status changes
 */
export function subscribeToEpisode(episodeId: string, callback: (episode: EpisodeData) => void) {
  return supabase
    .channel(`episode_${episodeId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'episodes',
        filter: `id=eq.${episodeId}`,
      },
      (payload) => {
        const data = payload.new as any;
        callback({
          id: data.id,
          title: data.title || 'Loading...',
          description: data.description,
          youtubeUrl: data.youtube_url,
          audioUrl: data.audio_url || '',
          durationSeconds: data.duration_seconds,
          thumbnailUrl: data.thumbnail_url,
          channelTitle: data.channel_title,
          processingStatus: data.processing_status,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      }
    )
    .subscribe();
} 