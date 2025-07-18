// Supermemory API client for Elara podcast app
// Uses official Supermemory API v3 structure

export interface SupermemoryMemory {
  content: string;
  customId?: string;
  metadata?: {
    speaker_name?: string;
    timestamp?: string;
    episode_id?: string;
    podcast_title?: string;
    elara_segment_id?: string;
    episode_title?: string;
    duration?: number;
    start_time?: number;
    end_time?: number;
    [key: string]: any;
  };
  containerTags?: string[];
  userId?: string;
}

export interface SupermemorySearchResult {
  chunks: Array<{
    content: string;
    isRelevant: boolean;
    score: number;
  }>;
  createdAt: string;
  documentId: string;
  metadata?: {
    category?: string;
    isPublic?: boolean;
    readingTime?: number;
    source?: string;
    speaker_name?: string;
    timestamp?: string;
    episode_id?: string;
    podcast_title?: string;
    elara_segment_id?: string;
    episode_title?: string;
    duration?: number;
    start_time?: number;
    end_time?: number;
    [key: string]: any;
  };
  score: number;
  summary?: string;
  title?: string;
  updatedAt: string;
}

export interface SupermemorySearchOptions {
  q?: string;
  documentThreshold?: number;
  limit?: number;
  onlyMatchingChunks?: boolean;
  userId?: string;
  containerTags?: string[];
  space?: string;
}

export interface InfiniteChatSession {
  sessionId: string;
  enabled: boolean;
  memories: SupermemorySearchResult[];
}

export class SupermemoryClient {
  private apiKey: string;
  private baseUrl: string;
  private sessionId?: string;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_SUPERMEMORY_API_KEY || '';
    this.baseUrl = process.env.EXPO_PUBLIC_SUPERMEMORY_BASE_URL || 'https://api.supermemory.ai/v3';
    
    if (!this.apiKey) {
      console.warn('⚠️ Supermemory API key not found in environment variables');
    }
  }

  /**
   * Create a new memory in Supermemory
   * Uses official API v3 structure: { content: string, metadata?: object, containerTags?: string[], userId?: string }
   */
  async createMemory(memory: SupermemoryMemory): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error('Supermemory API key not configured');
      }

      console.log('📝 Creating Supermemory:', {
        content: memory.content.substring(0, 100) + '...',
        metadata: memory.metadata,
        containerTags: memory.containerTags
      });

      const response = await fetch(`${this.baseUrl}/memories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memory),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Supermemory API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('✅ Memory created with ID:', result.id);
      return result.id;

    } catch (error) {
      console.error('❌ Error creating Supermemory:', error);
      throw error;
    }
  }

  /**
   * Search memories in Supermemory
   * Uses official API v3 structure with proper parameters
   */
  async searchMemories(query: string, options: SupermemorySearchOptions = {}): Promise<SupermemorySearchResult[]> {
    try {
      if (!this.apiKey) {
        throw new Error('Supermemory API key not configured');
      }

      // Build search parameters following official SDK structure
      const searchParams: any = {
        q: query,
        documentThreshold: options.documentThreshold || 0.3, // Lower threshold as suggested
        limit: options.limit || 10,
        onlyMatchingChunks: options.onlyMatchingChunks || false,
      };

      // Add user ID if provided
      if (options.userId) {
        searchParams.userId = options.userId;
      }

      // Add container tags if provided
      if (options.containerTags && options.containerTags.length > 0) {
        searchParams.containerTags = options.containerTags;
      }

      // Add space if provided
      if (options.space) {
        searchParams.space = options.space;
      }

      console.log('🔍 Searching Supermemory with params:', searchParams);

      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST', // Use POST as per official SDK
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Supermemory API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log(`✅ Found ${result.results?.length || 0} memories`);
      return result.results || [];

    } catch (error) {
      console.error('❌ Error searching Supermemory:', error);
      throw error;
    }
  }

  /**
   * Get memory status by ID
   */
  async getMemoryStatus(memoryId: string): Promise<any> {
    try {
      if (!this.apiKey) {
        throw new Error('Supermemory API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/memories/${memoryId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Supermemory API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('❌ Error getting memory status:', error);
      throw error;
    }
  }

  /**
   * Update an existing memory
   */
  async updateMemory(memoryId: string, updates: Partial<SupermemoryMemory>): Promise<void> {
    try {
      if (!this.apiKey) {
        throw new Error('Supermemory API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/memories/${memoryId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Supermemory API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      console.log('✅ Memory updated successfully');

    } catch (error) {
      console.error('❌ Error updating Supermemory:', error);
      throw error;
    }
  }

  /**
   * Delete a memory
   */
  async deleteMemory(memoryId: string): Promise<void> {
    try {
      if (!this.apiKey) {
        throw new Error('Supermemory API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/memories/${memoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Supermemory API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      console.log('✅ Memory deleted successfully');

    } catch (error) {
      console.error('❌ Error deleting Supermemory:', error);
      throw error;
    }
  }

  /**
   * Batch create multiple memories
   */
  async batchCreateMemories(memories: SupermemoryMemory[]): Promise<string[]> {
    try {
      if (!this.apiKey) {
        throw new Error('Supermemory API key not configured');
      }

      console.log(`📝 Batch creating ${memories.length} memories...`);

      const response = await fetch(`${this.baseUrl}/memories/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memories }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Supermemory API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log(`✅ Batch created ${result.ids?.length || 0} memories`);
      return result.ids || [];

    } catch (error) {
      console.error('❌ Error batch creating Supermemory:', error);
      throw error;
    }
  }

  /**
   * Health check for Supermemory service
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        return false;
      }

      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Supermemory health check failed:', error);
      return false;
    }
  }

  /**
   * Enable Infinite Chat for a session
   * Note: This may not be available in the current API version
   */
  async enableInfiniteChat(sessionId: string): Promise<void> {
    try {
      if (!this.apiKey) {
        throw new Error('Supermemory API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/infinite-context/enable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Supermemory API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      this.sessionId = sessionId;
      console.log('✅ Infinite Chat enabled for session:', sessionId);

    } catch (error) {
      console.error('❌ Error enabling Infinite Chat:', error);
      throw error;
    }
  }

  /**
   * Get Infinite Chat context for a query
   * Note: This may not be available in the current API version
   */
  async getInfiniteContext(sessionId: string, query: string): Promise<SupermemorySearchResult[]> {
    try {
      if (!this.apiKey) {
        throw new Error('Supermemory API key not configured');
      }

      const params = new URLSearchParams({
        session_id: sessionId,
        query: query,
      });

      const response = await fetch(`${this.baseUrl}/infinite-context?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Supermemory API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      return result.memories || [];

    } catch (error) {
      console.error('❌ Error getting Infinite Chat context:', error);
      throw error;
    }
  }

  /**
   * Update session memory (for Infinite Chat)
   * Note: This may not be available in the current API version
   */
  async updateSessionMemory(sessionId: string, userMessage: string, aiResponse: string): Promise<void> {
    try {
      if (!this.apiKey) {
        throw new Error('Supermemory API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/infinite-context/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_message: userMessage,
          ai_response: aiResponse,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Supermemory API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('❌ Error updating session memory:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const supermemoryClient = new SupermemoryClient();