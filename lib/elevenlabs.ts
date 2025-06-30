import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';

const elevenlabsClient = axios.create({
  baseURL: 'https://api.elevenlabs.io/v1',
  headers: {
    'xi-api-key': ELEVENLABS_API_KEY,
    'Content-Type': 'application/json',
  },
});

export interface VoiceSettings {
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export interface VoiceInfo {
  voiceId: string;
  name: string;
  category: string;
}

/**
 * Convert text to speech using ElevenLabs
 */
export async function synthesizeSpeech(
  text: string,
  voiceId: string,
  settings: VoiceSettings = {}
): Promise<string> {
  const {
    stability = 0.5,
    similarityBoost = 0.5,
    style = 0.0,
    useSpeakerBoost = true,
  } = settings;

  try {
    const response = await elevenlabsClient.post(
      `/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          style,
          use_speaker_boost: useSpeakerBoost,
        }
      },
      {
        responseType: 'arraybuffer'
      }
    );
    
    // Convert to blob URL for playback
    const blob = new Blob([response.data], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    throw new Error('Failed to synthesize speech');
  }
}

/**
 * Stream text to speech for real-time playback
 */
export async function streamSpeech(
  text: string,
  voiceId: string,
  settings: VoiceSettings = {}
): Promise<ReadableStream> {
  const {
    stability = 0.5,
    similarityBoost = 0.5,
    style = 0.0,
    useSpeakerBoost = true,
  } = settings;

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: useSpeakerBoost,
          }
        }),
      }
    );

    if (!response.body) {
      throw new Error('No response body');
    }

    return response.body;
  } catch (error) {
    console.error('Error streaming speech:', error);
    throw new Error('Failed to stream speech');
  }
}

/**
 * Get available voices
 */
export async function getVoices(): Promise<VoiceInfo[]> {
  try {
    const response = await elevenlabsClient.get('/voices');
    
    return response.data.voices.map((voice: any) => ({
      voiceId: voice.voice_id,
      name: voice.name,
      category: voice.category,
    }));
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw new Error('Failed to fetch voices');
  }
}

/**
 * Get voice information by ID
 */
export async function getVoice(voiceId: string): Promise<VoiceInfo | null> {
  try {
    const response = await elevenlabsClient.get(`/voices/${voiceId}`);
    
    return {
      voiceId: response.data.voice_id,
      name: response.data.name,
      category: response.data.category,
    };
  } catch (error) {
    console.error('Error fetching voice:', error);
    return null;
  }
}

/**
 * Validate ElevenLabs API key
 */
export async function validateApiKey(): Promise<boolean> {
  try {
    await getVoices();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Map host names to voice IDs
 */
export function getHostVoiceId(hostName: string): string {
  const voiceMap: { [key: string]: string } = {
    'chamath': process.env.EXPO_PUBLIC_CHAMATH_VOICE_ID || 'default-voice-id',
    'chamathpalihapitiya': process.env.EXPO_PUBLIC_CHAMATH_VOICE_ID || 'default-voice-id',
    'sacks': process.env.EXPO_PUBLIC_SACKS_VOICE_ID || 'default-voice-id',
    'davidsacks': process.env.EXPO_PUBLIC_SACKS_VOICE_ID || 'default-voice-id',
    'friedberg': process.env.EXPO_PUBLIC_FRIEDBERG_VOICE_ID || 'default-voice-id',
    'davidfriedberg': process.env.EXPO_PUBLIC_FRIEDBERG_VOICE_ID || 'default-voice-id',
    'calacanis': process.env.EXPO_PUBLIC_CALACANIS_VOICE_ID || 'default-voice-id',
    'jasoncalacanis': process.env.EXPO_PUBLIC_CALACANIS_VOICE_ID || 'default-voice-id',
    'jason': process.env.EXPO_PUBLIC_CALACANIS_VOICE_ID || 'default-voice-id',
  };
  
  const normalizedName = hostName.toLowerCase().replace(/\s+/g, '');
  return voiceMap[normalizedName] || process.env.EXPO_PUBLIC_DEFAULT_VOICE_ID || 'default-voice-id';
}

/**
 * Get optimized voice settings for podcast hosts
 */
export function getHostVoiceSettings(hostName: string): VoiceSettings {
  const settingsMap: { [key: string]: VoiceSettings } = {
    'chamath': {
      stability: 0.6,
      similarityBoost: 0.8,
      style: 0.2,
      useSpeakerBoost: true,
    },
    'sacks': {
      stability: 0.7,
      similarityBoost: 0.7,
      style: 0.1,
      useSpeakerBoost: true,
    },
    'friedberg': {
      stability: 0.8,
      similarityBoost: 0.6,
      style: 0.0,
      useSpeakerBoost: true,
    },
    'calacanis': {
      stability: 0.5,
      similarityBoost: 0.9,
      style: 0.3,
      useSpeakerBoost: true,
    },
  };
  
  const normalizedName = hostName.toLowerCase().replace(/\s+/g, '');
  return settingsMap[normalizedName] || {
    stability: 0.6,
    similarityBoost: 0.7,
    style: 0.1,
    useSpeakerBoost: true,
  };
} 