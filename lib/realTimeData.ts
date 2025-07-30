import { PerplexityClient, PerplexitySearchResult } from './perplexity';

export interface RealTimeDataTool {
  name: string;
  description: string;
  execute: (query: string, context?: any) => Promise<any>;
}

export interface RealTimeDataResult {
  type: 'news' | 'web' | 'academic';
  content: PerplexitySearchResult;
  query: string;
  timestamp: string;
  source: 'perplexity';
}

export class PerplexityNewsTool implements RealTimeDataTool {
  name = 'news_search';
  description = 'Search for recent news articles related to the query';
  private client: PerplexityClient;

  constructor() {
    this.client = new PerplexityClient();
  }
  
  async execute(query: string, context?: any): Promise<RealTimeDataResult> {
    if (!this.client.isAvailable()) {
      throw new Error('Perplexity API not available');
    }

    const result = await this.client.searchNews(query);
    
    return {
      type: 'news',
      content: result,
      query: query,
      timestamp: new Date().toISOString(),
      source: 'perplexity'
    };
  }
}

export class PerplexityWebTool implements RealTimeDataTool {
  name = 'web_search';
  description = 'Search the web for current information';
  private client: PerplexityClient;

  constructor() {
    this.client = new PerplexityClient();
  }
  
  async execute(query: string, context?: any): Promise<RealTimeDataResult> {
    if (!this.client.isAvailable()) {
      throw new Error('Perplexity API not available');
    }

    const result = await this.client.searchWeb(query);
    
    return {
      type: 'web',
      content: result,
      query: query,
      timestamp: new Date().toISOString(),
      source: 'perplexity'
    };
  }
}

export class PerplexityAcademicTool implements RealTimeDataTool {
  name = 'academic_search';
  description = 'Search academic sources for research information';
  private client: PerplexityClient;

  constructor() {
    this.client = new PerplexityClient();
  }
  
  async execute(query: string, context?: any): Promise<RealTimeDataResult> {
    if (!this.client.isAvailable()) {
      throw new Error('Perplexity API not available');
    }

    const result = await this.client.searchAcademic(query);
    
    return {
      type: 'academic',
      content: result,
      query: query,
      timestamp: new Date().toISOString(),
      source: 'perplexity'
    };
  }
}

// Tool registry for managing all real-time data tools
export class RealTimeDataToolRegistry {
  private tools: Map<string, RealTimeDataTool> = new Map();

  constructor() {
    this.registerTool(new PerplexityNewsTool());
    this.registerTool(new PerplexityWebTool());
    this.registerTool(new PerplexityAcademicTool());
  }

  registerTool(tool: RealTimeDataTool): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): RealTimeDataTool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): RealTimeDataTool[] {
    return Array.from(this.tools.values());
  }

  getAvailableTools(): RealTimeDataTool[] {
    return this.getAllTools().filter(tool => {
      if (tool instanceof PerplexityNewsTool || 
          tool instanceof PerplexityWebTool || 
          tool instanceof PerplexityAcademicTool) {
        return new PerplexityClient().isAvailable();
      }
      return true;
    });
  }

  async executeTool(toolName: string, query: string, context?: any): Promise<any> {
    const tool = this.getTool(toolName);
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found`);
    }
    return tool.execute(query, context);
  }

  async executeAllTools(query: string, context?: any): Promise<RealTimeDataResult[]> {
    const availableTools = this.getAvailableTools();
    const results: RealTimeDataResult[] = [];

    for (const tool of availableTools) {
      try {
        const result = await tool.execute(query, context);
        results.push(result);
      } catch (error) {
        console.warn(`Failed to execute tool ${tool.name}:`, error);
      }
    }

    return results;
  }
}

// Singleton instance
export const realTimeDataToolRegistry = new RealTimeDataToolRegistry(); 