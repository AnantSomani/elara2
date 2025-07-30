import { searchSegments, type SegmentData } from './supabase';
import { realTimeDataToolRegistry, type RealTimeDataResult } from './realTimeData';
import { knowledgeGraphClient, type KnowledgeGraphResult } from './knowledgeGraph';
import { PerplexityClient } from './perplexity';
import { generateEmbedding } from './openai';

export interface RetrievalResult {
  source: 'transcript' | 'metadata' | 'perplexity_news' | 'perplexity_web' | 'perplexity_academic' | 'knowledge_graph';
  content: any;
  relevance: number;
  timestamp: string;
  confidence?: number;
  query?: string;
}

export interface RetrievalContext {
  episodeId?: string;
  episodeTitle?: string;
  episodeDescription?: string;
  userQuery: string;
  maxResults?: number;
}

export class RetrievalManager {
  private perplexityClient: PerplexityClient;

  constructor() {
    this.perplexityClient = new PerplexityClient();
  }

  async retrieveAll(context: RetrievalContext): Promise<RetrievalResult[]> {
    const results: RetrievalResult[] = [];
    const { episodeId, userQuery, maxResults = 10 } = context;

    console.log(`🔍 Starting unified retrieval for query: "${userQuery}"`);

    // 1. Transcript retrieval (if episode provided)
    if (episodeId) {
      try {
        const transcriptResults = await this.retrieveTranscript(userQuery, episodeId);
        results.push(...transcriptResults);
        console.log(`✅ Found ${transcriptResults.length} transcript segments`);
      } catch (error) {
        console.warn('❌ Transcript retrieval failed:', error);
      }
    }

    // 2. Perplexity real-time data retrieval
    try {
      const perplexityResults = await this.retrievePerplexityData(userQuery);
      results.push(...perplexityResults);
      console.log(`✅ Found ${perplexityResults.length} real-time data results`);
    } catch (error) {
      console.warn('❌ Perplexity retrieval failed:', error);
    }

    // 3. Knowledge graph retrieval
    try {
      const kgResults = await this.retrieveKnowledgeGraph(userQuery);
      results.push(...kgResults);
      console.log(`✅ Found ${kgResults.length} knowledge graph results`);
    } catch (error) {
      console.warn('❌ Knowledge graph retrieval failed:', error);
    }

    // Sort by relevance and limit results
    const sortedResults = results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults);

    console.log(`🎯 Total retrieval results: ${sortedResults.length}`);
    return sortedResults;
  }

  private async retrieveTranscript(query: string, episodeId: string): Promise<RetrievalResult[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(query);
      const segments = await searchSegments(episodeId, queryEmbedding, 0.7, 5);
      
      return segments.map((segment: SegmentData, index: number) => ({
        source: 'transcript' as const,
        content: segment,
        relevance: 0.9 - (index * 0.1), // Higher relevance for first results
        timestamp: new Date().toISOString(),
        confidence: 0.95,
        query: query
      }));
    } catch (error) {
      console.error('Transcript retrieval error:', error);
      return [];
    }
  }

  private async retrievePerplexityData(query: string): Promise<RetrievalResult[]> {
    const results: RetrievalResult[] = [];
    
    if (!this.perplexityClient.isAvailable()) {
      console.warn('⚠️ Perplexity API not available, skipping real-time data retrieval');
      return results;
    }

    try {
      // News search
      const newsResult = await this.perplexityClient.searchNews(query);
      results.push({
        source: 'perplexity_news',
        content: newsResult,
        relevance: 0.8,
        timestamp: new Date().toISOString(),
        confidence: 0.9,
        query: query
      });

      // Web search
      const webResult = await this.perplexityClient.searchWeb(query);
      results.push({
        source: 'perplexity_web',
        content: webResult,
        relevance: 0.7,
        timestamp: new Date().toISOString(),
        confidence: 0.85,
        query: query
      });

      // Academic search (lower relevance for general queries)
      const academicResult = await this.perplexityClient.searchAcademic(query);
      results.push({
        source: 'perplexity_academic',
        content: academicResult,
        relevance: 0.6,
        timestamp: new Date().toISOString(),
        confidence: 0.8,
        query: query
      });

    } catch (error) {
      console.error('Perplexity retrieval error:', error);
    }

    return results;
  }

  private async retrieveKnowledgeGraph(query: string): Promise<RetrievalResult[]> {
    try {
      const kgResult = await knowledgeGraphClient.search(query);
      
      if (kgResult.results.length === 0) {
        return []; // No results from stub implementation
      }

      return [{
        source: 'knowledge_graph',
        content: kgResult,
        relevance: 0.75,
        timestamp: new Date().toISOString(),
        confidence: 0.9,
        query: query
      }];
    } catch (error) {
      console.error('Knowledge graph retrieval error:', error);
      return [];
    }
  }

  // Convenience method for quick retrieval
  async quickRetrieve(query: string, episodeId?: string): Promise<RetrievalResult[]> {
    return this.retrieveAll({
      userQuery: query,
      episodeId: episodeId,
      maxResults: 5
    });
  }

  // Get available data sources
  getAvailableSources(): string[] {
    const sources: string[] = [];
    
    if (this.perplexityClient.isAvailable()) {
      sources.push('perplexity_news', 'perplexity_web', 'perplexity_academic');
    }
    
    if (knowledgeGraphClient.isAvailable()) {
      sources.push('knowledge_graph');
    }
    
    return sources;
  }

  // Check if any real-time sources are available
  hasRealTimeSources(): boolean {
    return this.perplexityClient.isAvailable() || knowledgeGraphClient.isAvailable();
  }
}

// Singleton instance
export const retrievalManager = new RetrievalManager(); 