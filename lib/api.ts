import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

// API endpoints
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';
const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '';

export interface EpisodeData {
  id: string;
  title: string;
  audioUrl: string;
  hosts: string[];
  transcript?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

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
    // Create a new episode record
    const { data, error } = await supabase
      .from('episodes')
      .insert({
        original_url: podcastLink,
        processing_status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger backend processing (webhook/queue)
    await triggerPodcastProcessing(data.id, podcastLink);

    return data.id;
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
  } catch (error) {
    console.error('Error fetching episode data:', error);
    throw new Error('Failed to fetch episode data');
  }
}

/**
 * Send a question about an episode and get AI response
 */
export async function sendQuestion(episodeId: string, question: string): Promise<QuestionResponse> {
  try {
    // Step 1: Get episode context
    const episodeData = await getEpisodeData(episodeId);
    
    // Step 2: Rewrite question with Claude for better RAG performance
    const rewrittenQuestion = await rewriteQuestionWithClaude(question, episodeData);
    
    // Step 3: Perform semantic search using embeddings
    const relevantSegments = await searchRelevantSegments(episodeId, rewrittenQuestion);
    
    // Step 4: Generate response with GPT-4o
    const answer = await generateResponseWithGPT4(rewrittenQuestion, relevantSegments, episodeData);
    
    // Step 5: Convert to speech with ElevenLabs
    const audioUrl = await synthesizeSpeechWithElevenLabs(answer, episodeData.hosts[0]);
    
    return {
      answer,
      audioUrl,
      hostVoice: episodeData.hosts[0],
    };
  } catch (error) {
    console.error('Error processing question:', error);
    throw new Error('Failed to process question');
  }
}

/**
 * Trigger backend podcast processing
 */
async function triggerPodcastProcessing(episodeId: string, podcastLink: string): Promise<void> {
  // This would typically call your backend webhook or queue system
  // For now, we'll simulate this with a placeholder
  console.log(`Triggering processing for episode ${episodeId}: ${podcastLink}`);
  
  // In a real implementation, you might call:
  // await axios.post('https://your-backend.com/process-podcast', {
  //   episodeId,
  //   podcastLink
  // });
}

/**
 * Rewrite question with Claude for better semantic search
 */
async function rewriteQuestionWithClaude(question: string, episodeData: EpisodeData): Promise<string> {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `Rewrite this question to be more specific and searchable for a podcast episode titled "${episodeData.title}": ${question}`
        }]
      },
      {
        headers: {
          'Authorization': `Bearer ${CLAUDE_API_KEY}`,
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
        }
      }
    );
    
    return response.data.content[0].text || question;
  } catch (error) {
    console.error('Error rewriting question with Claude:', error);
    return question; // Fallback to original question
  }
}

/**
 * Search for relevant segments using embeddings
 */
async function searchRelevantSegments(episodeId: string, question: string): Promise<string[]> {
  try {
    // Generate embedding for the question
    const embedding = await generateEmbedding(question);
    
    // Search for similar segments in Supabase using pgvector
    const { data, error } = await supabase.rpc('search_segments', {
      episode_id: episodeId,
      query_embedding: embedding,
      similarity_threshold: 0.7,
      match_count: 5
    });
    
    if (error) throw error;
    
    return data.map((segment: any) => segment.content);
  } catch (error) {
    console.error('Error searching relevant segments:', error);
    return [];
  }
}

/**
 * Generate embedding using OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        model: 'text-embedding-3-small',
        input: text,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    return response.data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Generate response using GPT-4o
 */
async function generateResponseWithGPT4(question: string, segments: string[], episodeData: EpisodeData): Promise<string> {
  try {
    const context = segments.join('\n\n');
    const hostStyle = getHostStylePrompt(episodeData.hosts[0]);
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are ${episodeData.hosts[0]} from the podcast "${episodeData.title}". ${hostStyle}
            
Answer the user's question based on the provided context from the episode. Stay in character and maintain the host's speaking style.`
          },
          {
            role: 'user',
            content: `Context from episode:\n${context}\n\nQuestion: ${question}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating response with GPT-4:', error);
    throw error;
  }
}

/**
 * Synthesize speech using ElevenLabs
 */
async function synthesizeSpeechWithElevenLabs(text: string, hostName: string): Promise<string> {
  try {
    // Map host names to ElevenLabs voice IDs
    const voiceId = getHostVoiceId(hostName);
    
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        }
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer'
      }
    );
    
    // Convert to blob URL (in a real app, you'd upload to storage)
    const blob = new Blob([response.data], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    // Fallback to a placeholder audio URL
    return 'https://example.com/fallback-audio.mp3';
  }
}

/**
 * Get host-specific style prompts
 */
function getHostStylePrompt(hostName: string): string {
  const styles: { [key: string]: string } = {
    'Chamath': 'You are direct, analytical, and often use data-driven arguments. You speak with conviction and aren\'t afraid to take contrarian positions.',
    'Sacks': 'You are articulate, often reference historical precedents, and have a legal/business perspective on topics.',
    'default': 'You are knowledgeable, engaging, and speak in a conversational tone.'
  };
  
  return styles[hostName] || styles.default;
}

/**
 * Map host names to ElevenLabs voice IDs
 */
function getHostVoiceId(hostName: string): string {
  const voiceMap: { [key: string]: string } = {
    'Chamath': 'your-chamath-voice-id',
    'Sacks': 'your-sacks-voice-id',
    'default': 'your-default-voice-id'
  };
  
  return voiceMap[hostName] || voiceMap.default;
} 