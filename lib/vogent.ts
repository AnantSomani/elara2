import axios from 'axios';
import { getHostPrompt } from '../constants/prompts';

const VOGENT_API_KEY = process.env.EXPO_PUBLIC_VOGENT_API_KEY || '';

const vogentClient = axios.create({
  baseURL: 'https://api.vogent.ai/v1',
  headers: {
    'Authorization': `Bearer ${VOGENT_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export interface VoiceSettings {
  temperature?: number;
  speed?: number;
  pitch?: number;
}

export interface SpeakerInfo {
  speakerId: string;
  name: string;
  description?: string;
}

/**
 * Convert text to speech using Vogent's Multispeaker TTS
 */
export async function synthesizeSpeech(
  text: string,
  speakerId: string,
  settings: VoiceSettings = {}
): Promise<string> {
  const {
    temperature = 0.7,
    speed = 1.0,
    pitch = 1.0,
  } = settings;

  try {
    const response = await vogentClient.post(
      '/tts/synthesize',
      {
        text,
        speaker_id: speakerId,
        temperature,
        speed,
        pitch,
      },
      {
        responseType: 'arraybuffer'
      }
    );
    
    // Convert to blob URL for playbook
    const blob = new Blob([response.data], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error synthesizing speech with Vogent:', error);
    throw new Error('Failed to synthesize speech');
  }
}

/**
 * Stream text to speech for real-time playback
 */
export async function streamSpeech(
  text: string,
  speakerId: string,
  settings: VoiceSettings = {}
): Promise<ReadableStream> {
  const {
    temperature = 0.7,
    speed = 1.0,
    pitch = 1.0,
  } = settings;

  try {
    const response = await fetch(
      'https://api.vogent.ai/v1/tts/stream',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VOGENT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          speaker_id: speakerId,
          temperature,
          speed,
          pitch,
        }),
      }
    );

    if (!response.body) {
      throw new Error('No response body');
    }

    return response.body;
  } catch (error) {
    console.error('Error streaming speech with Vogent:', error);
    throw new Error('Failed to stream speech');
  }
}

/**
 * Get available speakers/voices
 */
export async function getSpeakers(): Promise<SpeakerInfo[]> {
  try {
    const response = await vogentClient.get('/tts/speakers');
    
    return response.data.speakers.map((speaker: any) => ({
      speakerId: speaker.id,
      name: speaker.name,
      description: speaker.description,
    }));
  } catch (error) {
    console.error('Error fetching speakers:', error);
    throw new Error('Failed to fetch speakers');
  }
}

/**
 * Get speaker information by ID
 */
export async function getSpeaker(speakerId: string): Promise<SpeakerInfo | null> {
  try {
    const response = await vogentClient.get(`/tts/speakers/${speakerId}`);
    
    return {
      speakerId: response.data.id,
      name: response.data.name,
      description: response.data.description,
    };
  } catch (error) {
    console.error('Error fetching speaker:', error);
    return null;
  }
}

/**
 * Validate Vogent API key
 */
export async function validateApiKey(): Promise<boolean> {
  try {
    await getSpeakers();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get host voice ID from database (now async)
 */
export async function getHostVoiceId(hostName: string): Promise<string> {
  try {
    const hostPrompt = await getHostPrompt(hostName);
    return hostPrompt.voiceId;
  } catch (error) {
    console.error('Error getting host voice ID:', error);
    // Fallback to environment variables if database fails
    return getFallbackVoiceId(hostName);
  }
}

/**
 * Fallback voice ID mapping using environment variables
 */
function getFallbackVoiceId(hostName: string): string {
  const voiceMap: { [key: string]: string } = {
    'chamath': process.env.EXPO_PUBLIC_CHAMATH_SPEAKER_ID || 'default-speaker-id',
    'chamathpalihapitiya': process.env.EXPO_PUBLIC_CHAMATH_SPEAKER_ID || 'default-speaker-id',
    'sacks': process.env.EXPO_PUBLIC_SACKS_SPEAKER_ID || 'default-speaker-id',
    'davidsacks': process.env.EXPO_PUBLIC_SACKS_SPEAKER_ID || 'default-speaker-id',
    'friedberg': process.env.EXPO_PUBLIC_FRIEDBERG_SPEAKER_ID || 'default-speaker-id',
    'davidfriedberg': process.env.EXPO_PUBLIC_FRIEDBERG_SPEAKER_ID || 'default-speaker-id',
    'calacanis': process.env.EXPO_PUBLIC_CALACANIS_SPEAKER_ID || 'default-speaker-id',
    'jasoncalacanis': process.env.EXPO_PUBLIC_CALACANIS_SPEAKER_ID || 'default-speaker-id',
    'jason': process.env.EXPO_PUBLIC_CALACANIS_SPEAKER_ID || 'default-speaker-id',
  };
  
  const normalizedName = hostName.toLowerCase().replace(/\s+/g, '');
  return voiceMap[normalizedName] || process.env.EXPO_PUBLIC_DEFAULT_SPEAKER_ID || 'default-speaker-id';
}

/**
 * Get optimized voice settings for podcast hosts
 */
export function getHostVoiceSettings(hostName: string): VoiceSettings {
  // Customize settings per host personality
  const settingsMap: { [key: string]: VoiceSettings } = {
    'chamath': { temperature: 0.8, speed: 1.1, pitch: 1.0 }, // Direct, energetic
    'sacks': { temperature: 0.7, speed: 1.0, pitch: 1.0 },   // Measured, thoughtful
    'friedberg': { temperature: 0.6, speed: 0.95, pitch: 1.0 }, // Scientific, careful
    'calacanis': { temperature: 0.9, speed: 1.2, pitch: 1.1 }, // Enthusiastic, energetic
  };
  
  const normalizedName = hostName.toLowerCase().replace(/\s+/g, '');
  return settingsMap[normalizedName] || { temperature: 0.7, speed: 1.0, pitch: 1.0 };
}

/**
 * Create a voice agent for conversational AI
 */
export async function createAgent(config: {
  name: string;
  prompt: string;
  speakerId: string;
  phoneNumber?: string;
}): Promise<string> {
  try {
    const response = await vogentClient.post('/agents', {
      name: config.name,
      prompt: config.prompt,
      tts_config: {
        speaker_id: config.speakerId,
      },
      phone_number: config.phoneNumber,
    });
    
    return response.data.id;
  } catch (error) {
    console.error('Error creating Vogent agent:', error);
    throw new Error('Failed to create agent');
  }
}

/**
 * Test TTS with Voicelab
 */
export async function testVoice(
  text: string,
  speakerId: string
): Promise<string> {
  try {
    const response = await vogentClient.post(
      '/voicelab/test',
      {
        text,
        speaker_id: speakerId,
      },
      {
        responseType: 'arraybuffer'
      }
    );
    
    const blob = new Blob([response.data], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error testing voice:', error);
    throw new Error('Failed to test voice');
  }
} 