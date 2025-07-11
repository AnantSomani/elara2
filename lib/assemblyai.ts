import { supabase } from './supabase';

const ASSEMBLYAI_API_KEY = process.env.EXPO_PUBLIC_ASSEMBLYAI_API_KEY || '';
const ASSEMBLYAI_BASE_URL = 'https://api.assemblyai.com/v2';

export interface TranscriptSegment {
  id: string;
  text: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: string;
}

export interface TranscriptionStatus {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  audio_url: string;
  text?: string;
  confidence?: number;
  error?: string;
  processing_url?: string;
}

export interface TranscriptionConfig {
  audio_url: string;
  speaker_labels?: boolean;
  auto_chapters?: boolean;
  sentiment_analysis?: boolean;
  entity_detection?: boolean;
  word_boost?: string[];
  boost_param?: 'low' | 'default' | 'high';
}

class AssemblyAIService {
  private apiKey: string;

  constructor() {
    this.apiKey = ASSEMBLYAI_API_KEY;
    
    if (!this.apiKey) {
      console.warn('⚠️ AssemblyAI API key not found in environment variables');
    }
  }

  /**
   * Start transcription of an episode's audio
   */
  async transcribeEpisode(audioUrl: string, episodeId: string): Promise<string> {
    try {
      console.log('🎤 Starting transcription for episode:', episodeId);
      console.log('🔗 Audio URL:', audioUrl);

      if (!this.apiKey) {
        throw new Error('AssemblyAI API key not configured');
      }

      const config: TranscriptionConfig = {
        audio_url: audioUrl,
        speaker_labels: true,
        auto_chapters: true,
        sentiment_analysis: true,
        entity_detection: true,
        word_boost: ['podcast', 'AI', 'technology', 'startup', 'venture', 'investment'],
        boost_param: 'high',
      };

      const response = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`AssemblyAI API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const transcriptData = await response.json();
      const transcriptId = transcriptData.id;

      console.log('✅ Transcription started with ID:', transcriptId);

      // Store transcript metadata in database
      await this.updateEpisodeTranscriptStatus(episodeId, {
        transcript_id: transcriptId,
        transcription_status: 'processing',
        audio_url: audioUrl,
      });

      return transcriptId;

    } catch (error) {
      console.error('❌ Error starting transcription:', error);
      
      // Update episode with error status
      await this.updateEpisodeTranscriptStatus(episodeId, {
        transcription_status: 'error',
        error_message: error instanceof Error ? error.message : 'Transcription failed',
      });
      
      throw error;
    }
  }

  /**
   * Check transcription status
   */
  async checkTranscriptionStatus(transcriptId: string): Promise<TranscriptionStatus> {
    try {
      if (!this.apiKey) {
        throw new Error('AssemblyAI API key not configured');
      }

      const response = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript/${transcriptId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`AssemblyAI API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        id: data.id,
        status: data.status,
        audio_url: data.audio_url,
        text: data.text,
        confidence: data.confidence,
        error: data.error,
        processing_url: data.processing_url,
      };

    } catch (error) {
      console.error('❌ Error checking transcription status:', error);
      throw error;
    }
  }

  /**
   * Get completed transcription with segments
   */
  async getTranscriptionSegments(transcriptId: string): Promise<TranscriptSegment[]> {
    try {
      if (!this.apiKey) {
        throw new Error('AssemblyAI API key not configured');
      }

      // First check if transcription is completed
      const status = await this.checkTranscriptionStatus(transcriptId);
      
      if (status.status !== 'completed') {
        throw new Error(`Transcription not ready. Status: ${status.status}`);
      }

      // Get detailed segments
      const response = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript/${transcriptId}/sentences`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`AssemblyAI API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.sentences.map((sentence: any, index: number): TranscriptSegment => ({
        id: `${transcriptId}-${index}`,
        text: sentence.text,
        start: sentence.start,
        end: sentence.end,
        confidence: sentence.confidence,
        speaker: sentence.speaker,
      }));

    } catch (error) {
      console.error('❌ Error getting transcription segments:', error);
      throw error;
    }
  }

  /**
   * Search through transcript text for relevant segments
   */
  async searchTranscript(episodeId: string, query: string): Promise<TranscriptSegment[]> {
    try {
      console.log('🔍 Searching transcript for:', query);

      // Get transcript from database
      const { data: episode, error } = await supabase
        .from('episodes')
        .select('transcript_id, full_transcript')
        .eq('id', episodeId)
        .single();

      if (error || !episode) {
        throw new Error('Episode transcript not found');
      }

      if (!episode.transcript_id) {
        throw new Error('No transcript available for this episode');
      }

      // Get all segments
      const segments = await this.getTranscriptionSegments(episode.transcript_id);
      
      // Simple text search (can be enhanced with semantic search later)
      const queryLower = query.toLowerCase();
      const matchingSegments = segments.filter(segment =>
        segment.text.toLowerCase().includes(queryLower)
      );

      console.log(`✅ Found ${matchingSegments.length} matching segments`);
      return matchingSegments;

    } catch (error) {
      console.error('❌ Error searching transcript:', error);
      throw error;
    }
  }

  /**
   * Process completed transcription and store in database
   */
  async processCompletedTranscription(episodeId: string, transcriptId: string): Promise<void> {
    try {
      console.log('📝 Processing completed transcription:', transcriptId);

      // Get the completed transcription
      const status = await this.checkTranscriptionStatus(transcriptId);
      
      if (status.status !== 'completed') {
        throw new Error(`Transcription not completed. Status: ${status.status}`);
      }

      if (!status.text) {
        throw new Error('No transcript text available');
      }

      // Get detailed segments
      const segments = await this.getTranscriptionSegments(transcriptId);

      // Update episode with completed transcript
      await this.updateEpisodeTranscriptStatus(episodeId, {
        transcription_status: 'completed',
        full_transcript: status.text,
        transcript_confidence: status.confidence,
        transcript_segments: segments,
      });

      console.log('✅ Transcript processing completed for episode:', episodeId);

    } catch (error) {
      console.error('❌ Error processing completed transcription:', error);
      
      // Update with error status
      await this.updateEpisodeTranscriptStatus(episodeId, {
        transcription_status: 'error',
        error_message: error instanceof Error ? error.message : 'Processing failed',
      });
      
      throw error;
    }
  }

  /**
   * Update episode transcript status in database
   */
  private async updateEpisodeTranscriptStatus(episodeId: string, updates: Record<string, any>): Promise<void> {
    try {
      const { error } = await supabase
        .from('episodes')
        .update(updates)
        .eq('id', episodeId);

      if (error) {
        console.error('❌ Database update error:', error);
        throw new Error(`Database update failed: ${error.message}`);
      }

      console.log('✅ Episode transcript status updated:', episodeId);

    } catch (error) {
      console.error('❌ Error updating episode transcript status:', error);
      throw error;
    }
  }

  /**
   * Check if episode has completed transcript
   */
  async hasCompletedTranscript(episodeId: string): Promise<boolean> {
    try {
      const { data: episode, error } = await supabase
        .from('episodes')
        .select('transcription_status')
        .eq('id', episodeId)
        .single();

      if (error) {
        return false;
      }

      return episode?.transcription_status === 'completed';

    } catch (error) {
      console.error('❌ Error checking transcript status:', error);
      return false;
    }
  }
}

// Export singleton instance
export const assemblyAIService = new AssemblyAIService();

// Export convenience functions
export async function transcribeEpisode(audioUrl: string, episodeId: string): Promise<string> {
  return assemblyAIService.transcribeEpisode(audioUrl, episodeId);
}

export async function getTranscriptionSegments(episodeId: string): Promise<TranscriptSegment[]> {
  const { data: episode, error } = await supabase
    .from('episodes')
    .select('transcript_id')
    .eq('id', episodeId)
    .single();

  if (error || !episode?.transcript_id) {
    throw new Error('No transcript ID found for episode');
  }

  return assemblyAIService.getTranscriptionSegments(episode.transcript_id);
}

export async function checkTranscriptionStatus(episodeId: string): Promise<TranscriptionStatus | null> {
  const { data: episode, error } = await supabase
    .from('episodes')
    .select('transcript_id')
    .eq('id', episodeId)
    .single();

  if (error || !episode?.transcript_id) {
    return null;
  }

  return assemblyAIService.checkTranscriptionStatus(episode.transcript_id);
}

export async function searchTranscript(episodeId: string, query: string): Promise<TranscriptSegment[]> {
  return assemblyAIService.searchTranscript(episodeId, query);
} 