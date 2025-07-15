import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Debug logging for environment variables (safe - only shows length/prefix)
console.log('🔧 Supabase URL configured:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING');
console.log('🔧 Supabase Key configured:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'MISSING');

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface EpisodeData {
  id: string;                    // Podcast Index episode GUID or unique ID
  podcastId?: string;            // Podcast Index podcast ID
  guid?: string;                 // Podcast Index episode GUID
  title: string;
  description?: string;
  enclosureUrl?: string;         // Audio file URL
  imageUrl?: string;             // Episode or podcast artwork
  publishedAt?: string;          // Original publish date
  durationSeconds?: number;
  feedUrl?: string;              // Podcast RSS feed URL
  episodeType?: string;          // e.g., 'full', 'trailer', 'bonus'
  explicit?: boolean;            // Explicit content flag
  podcastTitle?: string;         // Podcast title (denormalized)
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  hosts?: string[];
  // Transcription fields
  assemblyaiTranscriptId?: string;
  assemblyaiStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  transcriptId?: string;
  transcriptionStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  speakers?: string[];
  episodeChapters?: any[];
  detectedEntities?: any[];
  processingMetadata?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface SegmentData {
  id: number;
  episodeId: string;             // Episode ID
  content: string;
  speaker: string;               // Kept for backwards compatibility
  speakerName?: string;          // New field matching database schema
  startTime: number;             
  endTime: number;               
  embedding?: number[];
  confidence?: number;           // Transcription confidence score
  words?: any[];                 // Word-level data
  segmentType?: string;          // Type of segment
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
  id?: string;                   // Podcast Index episode GUID or unique ID
  podcastId?: string;
  guid?: string;
  title: string;
  description?: string;
  enclosureUrl?: string;
  imageUrl?: string;
  publishedAt?: string;
  durationSeconds?: number;
  feedUrl?: string;
  episodeType?: string;
  explicit?: boolean;
  podcastTitle?: string;
}

/**
 * Create a new episode record in Supabase with podcast metadata
 */
export async function createEpisode(episodeData: CreateEpisodeData): Promise<string> {
  const insertData: any = {
    title: episodeData.title,
    description: episodeData.description,
    duration_seconds: episodeData.durationSeconds,
    thumbnail_url: episodeData.imageUrl,
    channel_title: episodeData.podcastTitle,
    audio_url: episodeData.enclosureUrl,
    processing_status: 'pending',
    created_at: new Date().toISOString(),
  };

  // Add optional fields if provided
  if (episodeData.guid) {
    insertData.guid = episodeData.guid;
  }
  
  if (episodeData.podcastId) {
    insertData.podcast_id = episodeData.podcastId;
  }

  if (episodeData.publishedAt) {
    insertData.published_at = episodeData.publishedAt;
  }

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
  console.log('🔍 getEpisode: Starting query for episode ID:', episodeId);
  
  try {
    console.log('🔍 getEpisode: Making Supabase query...');
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', episodeId)
      .single();

    console.log('🔍 getEpisode: Query completed. Error:', error ? 'YES' : 'NO');
    console.log('🔍 getEpisode: Data received:', data ? 'YES' : 'NO');

    if (error) {
      console.error('❌ getEpisode: Supabase error:', error);
      throw error;
    }

    if (!data) {
      console.error('❌ getEpisode: No data returned');
      throw new Error('Episode not found');
    }

    console.log('✅ getEpisode: Successfully found episode:', data.title);

    return {
      id: data.id,
      title: data.title || 'Loading...',
      description: data.description,
      enclosureUrl: data.audio_url,
      imageUrl: data.thumbnail_url,
      publishedAt: data.published_at,
      durationSeconds: data.duration_seconds,
      feedUrl: data.feed_url,
      episodeType: data.episode_type,
      explicit: data.explicit,
      podcastTitle: data.channel_title,
      processingStatus: data.processing_status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('❌ getEpisode: Catch block error:', error);
    throw error;
  }
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
    speaker: segment.speaker_name || 'Unknown', // Map speaker_name to speaker for compatibility
    speakerName: segment.speaker_name,
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
          enclosureUrl: data.audio_url,
          imageUrl: data.thumbnail_url,
          publishedAt: data.published_at,
          durationSeconds: data.duration_seconds,
          feedUrl: data.feed_url,
          episodeType: data.episode_type,
          explicit: data.explicit,
          podcastTitle: data.channel_title,
          processingStatus: data.processing_status,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      }
    )
    .subscribe();
} 