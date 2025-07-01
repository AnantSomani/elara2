import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

export interface EpisodeData {
  id: string;
  title: string;
  audioUrl: string;
  hosts: string[];
  transcript?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface SegmentData {
  id: string;
  episodeId: string;
  content: string;
  speaker: string;
  timestampStart: number;
  timestampEnd: number;
  embedding?: number[];
}

export interface CreateEpisodeData {
  youtubeUrl: string;
  title: string;
  description?: string;
  durationSeconds: number;
  thumbnailUrl?: string;
  channelTitle?: string;
}

/**
 * Create a new episode record in Supabase with YouTube metadata
 */
export async function createEpisode(episodeData: CreateEpisodeData): Promise<string> {
  console.log('🔍 Creating episode record:', {
    title: episodeData.title,
    duration: `${Math.floor(episodeData.durationSeconds / 60)}:${(episodeData.durationSeconds % 60).toString().padStart(2, '0')}`,
    channel: episodeData.channelTitle,
  });
  
  const { data, error } = await supabase
    .from('episodes')
    .insert({
      youtube_url: episodeData.youtubeUrl,
      title: episodeData.title,
      description: episodeData.description,
      duration_seconds: episodeData.durationSeconds,
      processing_status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('🚨 Supabase error details:', error);
    console.error('🚨 Error code:', error.code);
    console.error('🚨 Error message:', error.message);
    console.error('🚨 Error hint:', error.hint);
    throw error;
  }
  
  console.log('✅ Episode created successfully with ID:', data.id);
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
    audioUrl: data.audio_url || '',
    hosts: data.hosts || [],
    transcript: data.transcript,
    processingStatus: data.processing_status,
  };
}

/**
 * Update episode processing status
 */
export async function updateEpisodeStatus(
  episodeId: string, 
  status: EpisodeData['processingStatus']
): Promise<void> {
  const { error } = await supabase
    .from('episodes')
    .update({ processing_status: status })
    .eq('id', episodeId);

  if (error) throw error;
}

/**
 * Search for relevant segments using vector similarity
 */
export async function searchSegments(
  episodeId: string,
  queryEmbedding: number[],
  similarityThreshold: number = 0.7,
  matchCount: number = 5
): Promise<SegmentData[]> {
  const { data, error } = await supabase.rpc('search_segments', {
    episode_id: episodeId,
    query_embedding: queryEmbedding,
    similarity_threshold: similarityThreshold,
    match_count: matchCount
  });

  if (error) throw error;

  return data.map((segment: any) => ({
    id: segment.id,
    episodeId: segment.episode_id,
    content: segment.content,
    speaker: segment.speaker,
    timestampStart: segment.timestamp_start,
    timestampEnd: segment.timestamp_end,
  }));
}

/**
 * Insert segments for an episode
 */
export async function insertSegments(segments: Omit<SegmentData, 'id'>[]): Promise<void> {
  const { error } = await supabase
    .from('segments')
    .insert(segments.map(segment => ({
      episode_id: segment.episodeId,
      content: segment.content,
      speaker: segment.speaker,
      timestamp_start: segment.timestampStart,
      timestamp_end: segment.timestampEnd,
      embedding: segment.embedding,
    })));

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
          audioUrl: data.audio_url || '',
          hosts: data.hosts || [],
          transcript: data.transcript,
          processingStatus: data.processing_status,
        });
      }
    )
    .subscribe();
} 