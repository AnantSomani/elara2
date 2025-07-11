import { PodcastIndexClient, type PodcastFeed, type SearchResponse } from './podcastIndex';

export interface PodcastSearchResult {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  feedUrl: string;
  episodeCount?: number;
  author: string;
  language: string;
  itunesId?: number;
}

class PodcastSearchService {
  private client: PodcastIndexClient;

  constructor() {
    this.client = new PodcastIndexClient();
  }

  /**
   * Search for podcasts by query term
   */
  async searchPodcasts(query: string): Promise<PodcastSearchResult[]> {
    try {
      console.log(`🔍 Searching podcasts for: "${query}"`);
      
      if (!query.trim()) {
        return [];
      }

      // Use the existing Podcast Index client - limit to 10 results
      const response: SearchResponse = await this.client.searchPodcast(query.trim(), true, 10);
      
      if (!response.feeds || response.feeds.length === 0) {
        console.log('📭 No podcasts found for query');
        return [];
      }

      // Map PodcastFeed to PodcastSearchResult
      let results = response.feeds.map(feed => this.mapFeedToSearchResult(feed));
      
      // Sort by relevance: prioritize exact matches and more popular podcasts
      results = this.sortPodcastsByRelevance(results, query);
      
      console.log(`✅ Mapped ${results.length} podcast search results`);
      return results;

    } catch (error) {
      console.error('❌ Error searching podcasts:', error);
      throw new Error('Failed to search podcasts. Please try again.');
    }
  }

  /**
   * Get a specific podcast by ID for detailed view
   */
  async getPodcastById(feedId: string): Promise<PodcastSearchResult | null> {
    try {
      const numericId = parseInt(feedId, 10);
      if (isNaN(numericId)) {
        throw new Error('Invalid podcast ID');
      }

      const feed = await this.client.getPodcastByFeedId(numericId);
      if (!feed) {
        return null;
      }

      return this.mapFeedToSearchResult(feed);
    } catch (error) {
      console.error('❌ Error getting podcast by ID:', error);
      throw new Error('Failed to load podcast details');
    }
  }

  /**
   * Get episodes for a podcast
   */
  async getPodcastEpisodes(feedId: string, maxEpisodes: number = 50) {
    try {
      const numericId = parseInt(feedId, 10);
      if (isNaN(numericId)) {
        throw new Error('Invalid podcast ID');
      }

      const response = await this.client.getEpisodesByFeedId(numericId, maxEpisodes);
      return response.items;
    } catch (error) {
      console.error('❌ Error getting podcast episodes:', error);
      throw new Error('Failed to load podcast episodes');
    }
  }

  /**
   * Map PodcastFeed to simplified PodcastSearchResult
   */
  private mapFeedToSearchResult(feed: PodcastFeed): PodcastSearchResult {
    return {
      id: feed.id.toString(),
      title: feed.title || 'Unknown Podcast',
      description: this.cleanDescription(feed.description || ''),
      imageUrl: feed.image || feed.artwork || '',
      feedUrl: feed.url || '',
      author: feed.author || feed.ownerName || 'Unknown Author',
      language: feed.language || 'en',
      itunesId: feed.itunesId,
    };
  }

  /**
   * Clean and truncate podcast description for display
   */
  private cleanDescription(description: string): string {
    // Remove HTML tags and excessive whitespace
    const cleaned = description
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ')    // Collapse whitespace
      .trim();

    // Truncate to reasonable length for search results
    const maxLength = 200;
    if (cleaned.length <= maxLength) {
      return cleaned;
    }

    return cleaned.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  }

  /**
   * Sort podcasts by relevance to the search query
   */
  private sortPodcastsByRelevance(results: PodcastSearchResult[], query: string): PodcastSearchResult[] {
    const queryLower = query.toLowerCase();
    
    return results.sort((a, b) => {
      // Calculate relevance scores
      const scoreA = this.calculateRelevanceScore(a, queryLower);
      const scoreB = this.calculateRelevanceScore(b, queryLower);
      
      // Sort by score descending (higher score = more relevant)
      return scoreB - scoreA;
    });
  }

  /**
   * Calculate relevance score for a podcast result
   */
  private calculateRelevanceScore(podcast: PodcastSearchResult, queryLower: string): number {
    let score = 0;
    
    const titleLower = podcast.title.toLowerCase();
    const authorLower = podcast.author.toLowerCase();
    
    // Exact title match gets highest score
    if (titleLower === queryLower) {
      score += 100;
    }
    
    // Title starts with query gets high score
    if (titleLower.startsWith(queryLower)) {
      score += 50;
    }
    
    // Query appears in title gets medium score
    if (titleLower.includes(queryLower)) {
      score += 25;
    }
    
    // Author match gets bonus points
    if (authorLower.includes(queryLower)) {
      score += 10;
    }
    
    // Prefer podcasts with iTunes ID (usually more established)
    if (podcast.itunesId) {
      score += 5;
    }
    
    // Prefer shorter titles (usually main shows vs clips)
    if (titleLower.length < 50) {
      score += 3;
    }
    
    return score;
  }

  /**
   * Test the search functionality
   */
  async testSearch(): Promise<void> {
    try {
      console.log('🧪 Testing podcast search functionality...');
      
      const results = await this.searchPodcasts('All-In Podcast');
      console.log(`✅ Test successful: Found ${results.length} results`);
      
      if (results.length > 0) {
        const firstResult = results[0];
        console.log(`📻 First result: "${firstResult.title}" by ${firstResult.author}`);
      }
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const podcastSearchService = new PodcastSearchService();

// Export the main search function for easy importing
export async function searchPodcasts(query: string): Promise<PodcastSearchResult[]> {
  return podcastSearchService.searchPodcasts(query);
}

// Export helper functions
export async function getPodcastById(feedId: string): Promise<PodcastSearchResult | null> {
  return podcastSearchService.getPodcastById(feedId);
}

export async function getPodcastEpisodes(feedId: string, maxEpisodes: number = 50) {
  return podcastSearchService.getPodcastEpisodes(feedId, maxEpisodes);
} 