// Host-specific prompt templates and utilities
// Host data is now stored in the database (podcast_hosts table)

import { getPodcastHosts, type PodcastHost } from '../lib/supabase';

// Cache for host data to avoid repeated database calls
let hostsCache: PodcastHost[] | null = null;
let hostsCacheExpiry: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const CONTEXT_PROMPTS = {
  ragSystem: `You are responding to a question about a specific podcast episode. Use the provided context from the episode transcript to answer the question accurately. 

  Guidelines:
  - Stay true to what was actually discussed in the episode
  - If the context doesn't contain enough information, acknowledge this
  - Maintain the host's speaking style and personality
  - Reference specific points from the transcript when relevant
  - Keep responses concise but informative (2-3 sentences max for TTS)`,

  questionRewrite: `Rewrite the following question to be more specific and searchable for semantic search over a podcast transcript. 

  Guidelines:
  - Make it more specific and targeted
  - Include relevant keywords that might appear in the transcript
  - Maintain the original intent
  - Keep it concise
  - Focus on the main topic or concept being asked about`,

  fallback: `I don't have enough context from this episode to answer your question accurately. Could you try rephrasing your question or asking about a different topic that was discussed in the episode?`,
};

/**
 * Get cached hosts or fetch from database
 */
async function getCachedHosts(): Promise<PodcastHost[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (hostsCache && hostsCacheExpiry && now < hostsCacheExpiry) {
    return hostsCache;
  }
  
  // Fetch fresh data
  try {
    hostsCache = await getPodcastHosts();
    hostsCacheExpiry = now + CACHE_DURATION;
    return hostsCache;
  } catch (error) {
    console.error('Error fetching podcast hosts:', error);
    
    // Return empty array if database fetch fails
    return [];
  }
}

/**
 * Get host prompt configuration by name
 */
export async function getHostPrompt(hostName: string): Promise<{
  name: string;
  systemPrompt: string;
  voiceId: string;
}> {
  const hosts = await getCachedHosts();
  
  // Normalize host name for matching
  const normalizedName = hostName.toLowerCase().replace(/\s+/g, '');
  
  // Name variations mapping
  const nameMap: { [key: string]: string } = {
    'chamath': 'Chamath',
    'chamathpalihapitiya': 'Chamath',
    'sacks': 'Sacks',
    'davidsacks': 'Sacks',
    'friedberg': 'Friedberg',
    'davidfriedberg': 'Friedberg',
    'calacanis': 'Calacanis',
    'jasoncalacanis': 'Calacanis',
    'jason': 'Calacanis',
  };

  const mappedName = nameMap[normalizedName] || hostName;
  const host = hosts.find(h => h.name === mappedName);

  if (host) {
    return {
      name: host.name,
      systemPrompt: host.personalityPrompt,
      voiceId: host.voiceId,
    };
  }

  // Fallback for unknown hosts
  return {
    name: 'Podcast Host',
    systemPrompt: `You are a knowledgeable podcast host. Your speaking style is:
    - Conversational and engaging
    - Well-informed on various topics
    - Ask thoughtful questions
    - Provide balanced perspectives
    - Use natural speech patterns
    - Reference the podcast context appropriately
    - Maintain an informative yet accessible tone`,
    voiceId: 'default-voice-id',
  };
}

/**
 * Get all available hosts
 */
export async function getAllHosts(): Promise<PodcastHost[]> {
  return getCachedHosts();
}

/**
 * Clear the hosts cache (useful for testing or after host updates)
 */
export function clearHostsCache(): void {
  hostsCache = null;
  hostsCacheExpiry = null;
}

/**
 * Get host voice ID by name
 */
export async function getHostVoiceId(hostName: string): Promise<string> {
  const hostPrompt = await getHostPrompt(hostName);
  return hostPrompt.voiceId;
}

// Legacy export for backward compatibility
export const HOST_PROMPTS = {
  // This is now deprecated - use getHostPrompt() instead
  // Keeping for backward compatibility during transition
}; 