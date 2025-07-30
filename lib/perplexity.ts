export interface PerplexitySearchResult {
  answer: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  searchQuery: string;
  timestamp: string;
}

export interface PerplexityResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class PerplexityClient {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || process.env.EXPO_PUBLIC_PERPLEXITY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ Perplexity API key not found. Set PERPLEXITY_API_KEY or EXPO_PUBLIC_PERPLEXITY_API_KEY in .env.local');
    }
  }

  async search(query: string, focus: 'news' | 'web' | 'academic' = 'web'): Promise<PerplexitySearchResult> {
    if (!this.apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    try {
      console.log(`🔍 Perplexity search: "${query}" (focus: ${focus})`);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [{
            role: 'user',
            content: query
          }],
          max_tokens: 1024,
          temperature: 0.1,
          top_p: 0.9,
          search_domain: focus
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Perplexity API error: ${response.status} ${errorText}`);
      }

      const data: PerplexityResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from Perplexity API');
      }

      const content = data.choices[0].message.content;
      
      // Parse the response to extract sources if available
      const sources = this.extractSources(content);
      
      const result: PerplexitySearchResult = {
        answer: content,
        sources: sources,
        searchQuery: query,
        timestamp: new Date().toISOString()
      };

      console.log(`✅ Perplexity search completed (${data.usage.total_tokens} tokens)`);
      return result;

    } catch (error) {
      console.error('❌ Perplexity search failed:', error);
      throw error;
    }
  }

  private extractSources(content: string): Array<{ title: string; url: string; snippet: string }> {
    const sources: Array<{ title: string; url: string; snippet: string }> = [];
    
    // Try to extract sources from markdown links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      sources.push({
        title: match[1],
        url: match[2],
        snippet: match[1] // Use title as snippet for now
      });
    }

    // If no markdown links found, try to extract URLs
    if (sources.length === 0) {
      const urlRegex = /https?:\/\/[^\s]+/g;
      while ((match = urlRegex.exec(content)) !== null) {
        sources.push({
          title: 'Source',
          url: match[0],
          snippet: 'Referenced source'
        });
      }
    }

    return sources;
  }

  // Convenience methods for different search types
  async searchNews(query: string): Promise<PerplexitySearchResult> {
    return this.search(query, 'news');
  }

  async searchWeb(query: string): Promise<PerplexitySearchResult> {
    return this.search(query, 'web');
  }

  async searchAcademic(query: string): Promise<PerplexitySearchResult> {
    return this.search(query, 'academic');
  }

  // Check if API is available
  isAvailable(): boolean {
    return !!this.apiKey;
  }
} 