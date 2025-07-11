import CryptoJS from 'crypto-js';

export interface PodcastFeed {
  id: number;
  title: string;
  url: string;
  originalUrl: string;
  link: string;
  description: string;
  author: string;
  ownerName: string;
  image: string;
  artwork: string;
  lastUpdateTime: number;
  lastCrawlTime: number;
  lastParseTime: number;
  lastGoodHttpStatusTime: number;
  lastHttpStatus: number;
  contentType: string;
  itunesId?: number;
  generator?: string;
  language: string;
  type: number;
  dead: number;
  crawlErrors: number;
  parseErrors: number;
  categories?: { [key: string]: string };
  locked: number;
  imageUrlHash: number;
}

export interface PodcastEpisode {
  id: number;
  title: string;
  link: string;
  description: string;
  guid: string;
  datePublished: number;
  datePublishedPretty: string;
  dateCrawled: number;
  enclosureUrl: string;  // 🎯 This is the direct audio URL we need!
  enclosureType: string;
  enclosureLength: number;
  duration: number;
  explicit: number;
  episode?: number;
  episodeType?: string;
  season: number;
  image: string;
  feedItunesId?: number;
  feedImage: string;
  feedId: number;
  feedTitle?: string;
  feedLanguage: string;
  chaptersUrl?: string;
  transcriptUrl?: string;
}

export interface SearchResponse {
  status: string;
  feeds: PodcastFeed[];
  count: number;
  query: string;
  description: string;
}

export interface EpisodesResponse {
  status: string;
  items: PodcastEpisode[];
  count: number;
  query: string;
  description: string;
}

export class PodcastIndexClient {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api.podcastindex.org/api/1.0';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_PODCAST_INDEX_API_KEY || '';
    this.apiSecret = process.env.EXPO_PUBLIC_PODCAST_INDEX_SECRET || '';
    
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Podcast Index API credentials not found in environment variables');
    }
  }

  /**
   * Generate authentication headers required by Podcast Index API
   */
  private generateAuthHeaders(apiPath: string): { [key: string]: string } {
    const authDate = Math.floor(Date.now() / 1000);
    
    // Create SHA1 hash: SHA1(apiKey + apiSecret + unixTime)
    // This is the correct Podcast Index API authentication method
    const stringToSign = `${this.apiKey}${this.apiSecret}${authDate}`;
    const authorization = CryptoJS.SHA1(stringToSign).toString();
    
    // Debug logging (disabled now that auth is working)
    // console.log('🔐 Auth Debug Info:');
    // console.log('🔑 API Key:', this.apiKey);
    // console.log('🔒 API Secret length:', this.apiSecret.length);
    // console.log('⏰ Auth Date:', authDate);
    // console.log('🛤️ API Path (for URL):', apiPath);
    // console.log('📝 String to Sign:', stringToSign);
    // console.log('🔐 Generated Authorization:', authorization);
    
    const headers = {
      'User-Agent': 'Elara/1.0',
      'X-Auth-Key': this.apiKey,
      'X-Auth-Date': authDate.toString(),
      'Authorization': authorization,
      'Content-Type': 'application/json'
    };
    
    // console.log('📡 Final Headers:', headers);
    
    return headers;
  }

  /**
   * Search for podcasts by term
   */
  async searchPodcast(query: string, clean: boolean = true, max: number = 10): Promise<SearchResponse> {
    try {
      console.log(`🔍 Searching Podcast Index for: "${query}"`);
      
      const apiPath = '/search/byterm';
      const url = `${this.baseUrl}${apiPath}?q=${encodeURIComponent(query)}${clean ? '&clean' : ''}&max=${max}`;
      const headers = this.generateAuthHeaders(apiPath);
      
      // console.log('🔗 Request URL:', url);
      // console.log('🔑 Auth headers generated');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Podcast Index API error: ${response.status} ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      console.log(`✅ Found ${data.count} podcast(s) matching "${query}"`);
      
      return data;
    } catch (error) {
      console.error('❌ Error searching Podcast Index:', error);
      throw error;
    }
  }

  /**
   * Get episodes for a podcast by feed ID
   */
  async getEpisodesByFeedId(feedId: number, max: number = 100): Promise<EpisodesResponse> {
    try {
      console.log(`📻 Getting episodes for feed ID: ${feedId}`);
      
      const apiPath = '/episodes/byfeedid';
      const url = `${this.baseUrl}${apiPath}?id=${feedId}&max=${max}`;
      const headers = this.generateAuthHeaders(apiPath);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Podcast Index API error: ${response.status} ${response.statusText}`);
      }

      const data: EpisodesResponse = await response.json();
      console.log(`✅ Found ${data.count} episodes for feed ${feedId}`);
      
      return data;
    } catch (error) {
      console.error('❌ Error getting episodes from Podcast Index:', error);
      throw error;
    }
  }

  /**
   * Get a specific podcast by feed ID
   */
  async getPodcastByFeedId(feedId: number): Promise<PodcastFeed | null> {
    try {
      console.log(`🎙️ Getting podcast details for feed ID: ${feedId}`);
      
      const apiPath = '/podcasts/byfeedid';
      const url = `${this.baseUrl}${apiPath}?id=${feedId}`;
      const headers = this.generateAuthHeaders(apiPath);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Podcast Index API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === 'true' && data.feed) {
        console.log(`✅ Found podcast: ${data.feed.title}`);
        return data.feed;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting podcast from Podcast Index:', error);
      throw error;
    }
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Podcast Index API connection...');
      
      const result = await this.searchPodcast('test', true);
      
      if (result.status === 'true') {
        console.log('✅ Podcast Index API connection successful!');
        return true;
      } else {
        console.log('❌ Podcast Index API returned error status');
        return false;
      }
    } catch (error) {
      console.error('❌ Podcast Index API connection failed:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const podcastIndexClient = new PodcastIndexClient(); 