// Supermemory-enhanced API for Elara podcast app
// Updated to use official Supermemory API v3

import { supermemoryClient, type SupermemorySearchResult } from './supermemory';
import { formatMemoriesForContext, buildSupermemorySearchOptions, combineMemories, truncateContext } from './memoryUtils';
import { generateHostResponse } from './openai';
import { getEpisodeData } from './api.real';
import { type TranscriptSegment } from './assemblyai';

export interface SupermemoryQuestionResponse {
  answer: string;
  memories: SupermemorySearchResult[];
  episodeMemories: SupermemorySearchResult[];
  sessionMemories: SupermemorySearchResult[];
  summary: string;
}

export interface SupermemorySearchOptions {
  episodeId?: string;
  sessionId?: string;
  speaker_name?: string;
  podcast_title?: string;
  limit?: number;
  documentThreshold?: number;
  userId?: string;
}

/**
 * Enhanced sendQuestion function with Supermemory integration
 * Updated to use v3 API structure
 */
export async function sendQuestionWithSupermemory(
  question: string,
  episodeId?: string,
  options: SupermemorySearchOptions = {}
): Promise<SupermemoryQuestionResponse> {
  try {
    console.log('🧠 Processing question with Supermemory v3:', episodeId);

    // Search Supermemory for relevant content
    let episodeMemories: SupermemorySearchResult[] = [];
    let sessionMemories: SupermemorySearchResult[] = [];

    try {
      console.log('🔍 Searching Supermemory for relevant content...');

      // Build search options for v3 API
      const searchOptions = buildSupermemorySearchOptions(question, {
        episode_id: episodeId,
        speaker_name: options.speaker_name,
        podcast_title: options.podcast_title,
        limit: options.limit || 10,
        documentThreshold: options.documentThreshold || 0.7,
        userId: options.userId,
      });

      // Search for episode-specific memories
      if (episodeId) {
        episodeMemories = await supermemoryClient.searchMemories(question, searchOptions);
        console.log(`✅ Found ${episodeMemories.length} episode memories`);
      }

      // Search for session memories if session ID provided
      if (options.sessionId) {
        try {
          sessionMemories = await supermemoryClient.getInfiniteContext(options.sessionId, question);
          console.log(`✅ Found ${sessionMemories.length} session memories`);
        } catch (error) {
          console.warn('⚠️ Session memory search failed:', error);
        }
      }

    } catch (error) {
      console.warn('⚠️ Supermemory search failed, falling back to basic search:', error);
    }

    // Combine and format memories
    const allMemories = combineMemories(episodeMemories, sessionMemories);
    const truncatedMemories = truncateContext(allMemories, 4000);
    const memoryContext = formatMemoriesForContext(truncatedMemories);

    console.log('🤖 Generating AI response with Supermemory context...');

    // Build the prompt with Supermemory context
    const prompt = `You are an AI assistant helping users understand podcast content. Use the following relevant podcast segments to answer the user's question:

${memoryContext}

User Question: ${question}

Please provide a comprehensive answer based on the podcast content above. If the content doesn't contain enough information to answer the question, say so. Be conversational and helpful.`;

    // Call the AI service (using existing API)
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        episodeId: episodeId,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const answer = aiResponse.answer || aiResponse.content || 'I could not generate a response.';

    // Update session memory if session ID provided
    if (options.sessionId) {
      try {
        await supermemoryClient.updateSessionMemory(options.sessionId, question, answer);
        console.log('✅ Session memory updated');
      } catch (error) {
        console.warn('⚠️ Failed to update session memory:', error);
      }
    }

    return {
      answer,
      memories: allMemories,
      episodeMemories,
      sessionMemories,
      summary: `Found ${allMemories.length} relevant segments from the podcast.`,
    };

  } catch (error) {
    console.error('❌ Error processing question with Supermemory:', error);
    throw error;
  }
}

/**
 * Search Supermemory with fallback logic
 * Updated to use v3 API structure
 */
export async function searchSupermemoryWithFallback(
  query: string,
  options: SupermemorySearchOptions = {},
  maxRetries: number = 3
): Promise<SupermemorySearchResult[]> {
  let memories: SupermemorySearchResult[] = [];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`🔍 Supermemory search attempt ${attempt + 1}/${maxRetries}...`);

      // Build search options for v3 API
      const searchOptions = buildSupermemorySearchOptions(query, {
        episode_id: options.episodeId,
        speaker_name: options.speaker_name,
        podcast_title: options.podcast_title,
        limit: options.limit || 10,
        documentThreshold: options.documentThreshold || 0.7,
        userId: options.userId,
      });

      memories = await supermemoryClient.searchMemories(query, searchOptions);
      console.log(`✅ Found ${memories.length} memories on attempt ${attempt + 1}`);
      break;

    } catch (error) {
      console.error(`❌ Supermemory search attempt ${attempt + 1} failed:`, error);
      
      if (attempt === maxRetries - 1) {
        // On final attempt, try with lower threshold
        try {
          const fallbackOptions = buildSupermemorySearchOptions(query, {
            episode_id: options.episodeId,
            speaker_name: options.speaker_name,
            podcast_title: options.podcast_title,
            limit: options.limit || 10,
            documentThreshold: 0.3, // Lower threshold for fallback
            userId: options.userId,
          });
          
          memories = await supermemoryClient.searchMemories(query, fallbackOptions);
          console.log(`✅ Fallback search found ${memories.length} memories`);
        } catch (fallbackError) {
          console.error('❌ Fallback search also failed:', fallbackError);
          return [];
        }
      }
    }
  }

  return memories;
}

/**
 * Create context summary for debugging
 */
function createContextSummary(
  memories: SupermemorySearchResult[], 
  episode: any
): string {
  if (memories.length === 0) {
    return 'No relevant content found in episode.';
  }

  const speakers = new Set<string>();
  const timeRange = getTimeRange(memories);
  
  memories.forEach(memory => {
    if (memory.metadata?.speaker_name) {
      speakers.add(memory.metadata.speaker_name);
    }
  });

  let summary = `Found ${memories.length} relevant segments`;
  
  if (speakers.size > 0) {
    summary += ` from ${Array.from(speakers).join(', ')}`;
  }
  
  if (timeRange) {
    summary += ` (${timeRange})`;
  }

  return summary;
}

/**
 * Get time range of memories
 */
function getTimeRange(memories: SupermemorySearchResult[]): string | null {
  const times = memories
    .map(m => m.metadata?.start_time)
    .filter(t => t !== undefined)
    .sort((a, b) => (a || 0) - (b || 0));
  
  if (times.length === 0) return null;
  
  const start = formatTimestamp(times[0]);
  const end = formatTimestamp(times[times.length - 1]);
  
  return `${start} - ${end}`;
}

/**
 * Format timestamp for display
 */
function formatTimestamp(seconds?: number): string {
  if (!seconds) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Test Supermemory integration
 * Updated to use v3 API structure
 */
export async function testSupermemoryIntegration(): Promise<{
  success: boolean;
  details: string;
}> {
  try {
    console.log('🧪 Testing Supermemory Integration...');

    // Test health check
    const health = await supermemoryClient.healthCheck();
    if (!health) {
      return {
        success: false,
        details: 'Health check failed - API may be unavailable',
      };
    }

    // Test memory creation
    const testMemory = {
      content: 'This is a test memory for integration testing.',
      metadata: {
        speaker_name: 'Test Speaker',
        episode_id: 'test-episode',
        podcast_title: 'Test Podcast',
        timestamp: new Date().toISOString(),
      },
      containerTags: ['test', 'integration'],
    };

    const memoryId = await supermemoryClient.createMemory(testMemory);
    console.log('✅ Test memory created:', memoryId);

    // Test search
    const searchOptions = buildSupermemorySearchOptions('test', {
      episode_id: 'test-episode',
      limit: 1,
      documentThreshold: 0.5,
    });

    const testResults = await supermemoryClient.searchMemories('test', searchOptions);
    console.log('✅ Test search successful:', testResults.length, 'results');

    return {
      success: true,
      details: `Integration test passed. Created memory: ${memoryId}, Found ${testResults.length} search results.`,
    };

  } catch (error) {
    console.error('❌ Supermemory integration test failed:', error);
    return {
      success: false,
      details: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
} 