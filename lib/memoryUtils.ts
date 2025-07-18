// Memory utilities for Supermemory integration
// Updated to use official Supermemory API v3 structure

import { type SupermemorySearchResult } from './supermemory';

/**
 * Format Supermemory memories for GPT-4o context
 * Updated to use 'content' field instead of 'text'
 */
export function formatMemoriesForContext(memories: SupermemorySearchResult[]): string {
  if (!memories || memories.length === 0) {
    return '';
  }

  const formattedMemories = memories.map((memory, index) => {
    const speaker = memory.metadata?.speaker_name || 'Unknown';
    const timestamp = memory.metadata?.timestamp || '';
    const timeInfo = timestamp ? ` (${timestamp})` : '';
    
    return `${index + 1}. [${speaker}${timeInfo}]: ${memory.content}`;
  });

  return `Relevant podcast content:\n${formattedMemories.join('\n\n')}`;
}

/**
 * Build Supermemory search options for v3 API
 * Updated to use v3 API structure with 'q', 'documentThreshold', etc.
 */
export function buildSupermemorySearchOptions(
  query: string,
  options: {
    episode_id?: string;
    speaker_name?: string;
    podcast_title?: string;
    start_time?: number;
    end_time?: number;
    limit?: number;
    documentThreshold?: number;
    userId?: string;
  } = {}
) {
  const searchOptions: any = {
    q: query,
    documentThreshold: options.documentThreshold || 0.7,
    limit: options.limit || 10,
  };

  // Add container tags for filtering
  const containerTags = [];
  if (options.episode_id) {
    containerTags.push(`episode:${options.episode_id}`);
  }
  if (options.podcast_title) {
    containerTags.push(`podcast:${options.podcast_title}`);
  }
  if (options.speaker_name) {
    containerTags.push(`speaker:${options.speaker_name}`);
  }

  if (containerTags.length > 0) {
    searchOptions.containerTags = containerTags;
  }

  if (options.userId) {
    searchOptions.userId = options.userId;
  }

  return searchOptions;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(seconds?: number): string {
  if (!seconds) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Combine episode and session memories with deduplication
 * Updated to use 'content' field for comparison
 */
export function combineMemories(
  episodeMemories: SupermemorySearchResult[],
  sessionMemories: SupermemorySearchResult[]
): SupermemorySearchResult[] {
  const combined = [...episodeMemories];
  const episodeIds = new Set(episodeMemories.map(m => m.id));

  // Add session memories that aren't already in episode memories
  sessionMemories.forEach(sessionMemory => {
    if (!episodeIds.has(sessionMemory.id)) {
      combined.push(sessionMemory);
    }
  });

  // Sort by score (highest first) and remove duplicates
  const uniqueMemories = combined.filter((memory, index, self) => 
    index === self.findIndex(m => m.id === memory.id)
  );

  return uniqueMemories.sort((a, b) => (b.score || 0) - (a.score || 0));
}

/**
 * Truncate context to fit within token limits
 * Updated to use 'content' field for length calculation
 */
export function truncateContext(
  memories: SupermemorySearchResult[],
  maxTokens: number = 4000
): SupermemorySearchResult[] {
  let currentTokens = 0;
  const truncated: SupermemorySearchResult[] = [];

  for (const memory of memories) {
    // Rough estimate: 1 token ≈ 4 characters
    const estimatedTokens = Math.ceil((memory.content?.length || 0) / 4);
    
    if (currentTokens + estimatedTokens > maxTokens) {
      break;
    }
    
    truncated.push(memory);
    currentTokens += estimatedTokens;
  }

  return truncated;
}

/**
 * Extract unique speakers from memories
 * Updated to use 'speaker_name' field
 */
export function extractSpeakers(memories: SupermemorySearchResult[]): string[] {
  const speakers = new Set<string>();
  
  memories.forEach(memory => {
    if (memory.metadata?.speaker_name) {
      speakers.add(memory.metadata.speaker_name);
    }
  });
  
  return Array.from(speakers);
}

/**
 * Group memories by speaker
 * Updated to use 'speaker_name' field
 */
export function groupMemoriesBySpeaker(memories: SupermemorySearchResult[]): Record<string, SupermemorySearchResult[]> {
  const grouped: Record<string, SupermemorySearchResult[]> = {};
  
  memories.forEach(memory => {
    const speaker = memory.metadata?.speaker_name || 'Unknown';
    if (!grouped[speaker]) {
      grouped[speaker] = [];
    }
    grouped[speaker].push(memory);
  });
  
  return grouped;
}

/**
 * Calculate relevance score for a memory
 * Updated to use 'content' field for analysis
 */
export function calculateRelevanceScore(
  memory: SupermemorySearchResult,
  query: string
): number {
  // Base score from Supermemory
  let score = memory.score || 0;
  
  // Boost score if query terms appear in content
  const queryTerms = query.toLowerCase().split(/\s+/);
  const content = memory.content?.toLowerCase() || '';
  
  queryTerms.forEach(term => {
    if (content.includes(term)) {
      score += 0.1; // Small boost for each matching term
    }
  });
  
  return Math.min(score, 1.0); // Cap at 1.0
}

/**
 * Create a summary of memories for context
 */
export function createMemorySummary(memories: SupermemorySearchResult[]): string {
  if (memories.length === 0) {
    return 'No relevant content found.';
  }
  
  const speakers = extractSpeakers(memories);
  const timeRange = getTimeRange(memories);
  
  let summary = `Found ${memories.length} relevant segments`;
  
  if (speakers.length > 0) {
    summary += ` from ${speakers.join(', ')}`;
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
 * Validate memory data structure
 */
export function validateMemory(memory: any): memory is SupermemorySearchResult {
  return (
    memory &&
    typeof memory.id === 'string' &&
    typeof memory.content === 'string' &&
    memory.metadata &&
    typeof memory.metadata.speaker_name === 'string' &&
    typeof memory.metadata.episode_id === 'string' &&
    (memory.score === undefined || typeof memory.score === 'number')
  );
}

/**
 * Filter memories by quality score
 */
export function filterByQuality(
  memories: SupermemorySearchResult[], 
  minScore: number = 0.5
): SupermemorySearchResult[] {
  return memories.filter(memory => (memory.score || 0) >= minScore);
} 