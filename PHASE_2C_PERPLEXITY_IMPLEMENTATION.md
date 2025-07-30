# Phase 2c: Perplexity API Integration Implementation

## 🎯 Overview

Phase 2c implements real-time data retrieval using the Perplexity API, providing up-to-date information from news, web, and academic sources. This enhances the AI chat experience with current, relevant information beyond the podcast transcript content.

## 🏗️ Architecture

### Core Components

1. **PerplexityClient** (`lib/perplexity.ts`)
   - Direct API integration with Perplexity
   - Supports news, web, and academic search domains
   - Automatic source extraction and parsing

2. **Real-time Data Tools** (`lib/realTimeData.ts`)
   - Tool registry pattern for extensible data sources
   - Individual tools for news, web, and academic searches
   - Consistent interface for all real-time data sources

3. **Knowledge Graph Stub** (`lib/knowledgeGraph.ts`)
   - Interface for future Neo4j integration
   - Stub implementation for testing
   - Extensible for Phase 2d

4. **Unified Retrieval Manager** (`lib/retrievalManager.ts`)
   - Combines transcript, real-time, and knowledge graph data
   - Relevance scoring and result ranking
   - Context-aware retrieval

## 🚀 Implementation Details

### PerplexityClient Features

```typescript
// Basic usage
const client = new PerplexityClient();
const result = await client.search('query', 'news');

// Convenience methods
await client.searchNews('latest tech news');
await client.searchWeb('current events');
await client.searchAcademic('research papers');
```

**Key Features:**
- ✅ Real-time web search with AI synthesis
- ✅ News-focused search for current events
- ✅ Academic search for research information
- ✅ Automatic source extraction and citation
- ✅ Error handling and rate limiting
- ✅ Cost-effective ($5/month for 1000 requests)

### Real-time Data Tools

```typescript
// Tool registry
const registry = new RealTimeDataToolRegistry();

// Execute specific tool
const newsResult = await registry.executeTool('news_search', 'query');

// Execute all available tools
const allResults = await registry.executeAllTools('query');
```

**Available Tools:**
- `news_search`: Recent news articles
- `web_search`: General web information
- `academic_search`: Research and academic sources

### Unified Retrieval Manager

```typescript
// Quick retrieval
const results = await retrievalManager.quickRetrieve('query', episodeId);

// Full retrieval with context
const results = await retrievalManager.retrieveAll({
  userQuery: 'query',
  episodeId: 'episode-id',
  maxResults: 10
});
```

**Data Sources:**
1. **Transcript segments** (if episode provided)
2. **Perplexity news search**
3. **Perplexity web search**
4. **Perplexity academic search**
5. **Knowledge graph** (stub for now)

## 📊 Cost Analysis

| Component | Cost | Requests/Month | Status |
|-----------|------|----------------|--------|
| **Perplexity API** | $5/month | 1,000 | ✅ Implemented |
| SerpAPI | $50/month | 5,000 | ❌ Not needed |
| Tavily | $10/month | 1,000 | ❌ Not needed |
| Google CSE | $5/1K queries | 1,000 | ❌ Not needed |

**Total Cost:** $5/month for comprehensive real-time data

## 🧪 Testing

### Test Scripts

1. **Perplexity API Test**
   ```bash
   node scripts/test-perplexity.js
   ```

2. **Retrieval Manager Test**
   ```bash
   node scripts/test-retrieval-manager.js
   ```

### Manual Testing

```typescript
// Test Perplexity client
import { PerplexityClient } from './lib/perplexity';

const client = new PerplexityClient();
const result = await client.searchNews('latest AI developments');
console.log(result.answer);

// Test retrieval manager
import { retrievalManager } from './lib/retrievalManager';

const results = await retrievalManager.quickRetrieve('machine learning trends');
console.log(results.map(r => `${r.source}: ${r.relevance}`));
```

## 🔧 Configuration

### Environment Variables

Add to `.env.local`:
```bash
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

**Note:** The system also supports `EXPO_PUBLIC_PERPLEXITY_API_KEY` for backward compatibility.

### API Key Setup

1. Sign up at [Perplexity API](https://www.perplexity.ai/api)
2. Get your API key from the dashboard
3. Add to `.env.local` file
4. Restart your development server

## 📈 Usage Examples

### Basic Real-time Search

```typescript
import { PerplexityClient } from './lib/perplexity';

const client = new PerplexityClient();

// Get latest news
const news = await client.searchNews('tech industry updates');
console.log(news.answer);

// Get web information
const web = await client.searchWeb('current market trends');
console.log(web.answer);

// Get academic research
const academic = await client.searchAcademic('AI safety research');
console.log(academic.answer);
```

### Enhanced Chat with Real-time Data

```typescript
import { retrievalManager } from './lib/retrievalManager';

// Get comprehensive results
const results = await retrievalManager.retrieveAll({
  userQuery: 'What are the latest developments in AI?',
  episodeId: 'episode-123', // Optional
  maxResults: 10
});

// Process results by source
const transcriptResults = results.filter(r => r.source === 'transcript');
const realTimeResults = results.filter(r => r.source.startsWith('perplexity'));
const kgResults = results.filter(r => r.source === 'knowledge_graph');
```

### Tool Registry Usage

```typescript
import { realTimeDataToolRegistry } from './lib/realTimeData';

// Get available tools
const tools = realTimeDataToolRegistry.getAvailableTools();
console.log(tools.map(t => t.name));

// Execute specific tool
const newsTool = realTimeDataToolRegistry.getTool('news_search');
const result = await newsTool.execute('breaking news today');
```

## 🔄 Integration Points

### Existing API Integration

The new retrieval system integrates with existing components:

1. **API Layer** (`lib/api.ts`)
   - Exports new retrieval functionality
   - Maintains backward compatibility
   - Provides unified interface

2. **Supabase Integration**
   - Uses existing `searchSegments` function
   - Leverages existing transcript data
   - Maintains database consistency

3. **OpenAI Integration**
   - Uses `generateEmbedding` for transcript search
   - Compatible with existing chat system
   - Extends AI capabilities

### Future Integration (Phase 2d)

1. **Neo4j Knowledge Graph**
   - Replace stub implementation
   - Add entity relationship queries
   - Enhance context understanding

2. **Advanced Retrieval**
   - Multi-modal search
   - Temporal relevance scoring
   - Personalized results

## 🎯 Benefits

### For Users
- ✅ **Real-time information**: Always up-to-date data
- ✅ **Comprehensive answers**: Multiple data sources
- ✅ **Source citations**: Transparent information sources
- ✅ **Context-aware**: Episode-specific + general knowledge

### For Developers
- ✅ **Modular architecture**: Easy to extend
- ✅ **Cost-effective**: $5/month for full functionality
- ✅ **Reliable**: Error handling and fallbacks
- ✅ **Testable**: Comprehensive test coverage

### For System
- ✅ **Scalable**: Tool registry pattern
- ✅ **Maintainable**: Clean separation of concerns
- ✅ **Extensible**: Easy to add new data sources
- ✅ **Performance**: Efficient retrieval and caching

## 🚀 Next Steps

### Phase 2d: Knowledge Graph Integration
1. Set up Neo4j database
2. Implement entity extraction
3. Build relationship queries
4. Replace stub implementation

### Phase 2e: Advanced Features
1. Multi-modal search
2. Temporal relevance
3. Personalized results
4. Advanced caching

## 📝 Notes

- **API Limits**: 1000 requests/month on basic plan
- **Rate Limiting**: Implemented in client
- **Error Handling**: Graceful fallbacks
- **Source Extraction**: Automatic from API responses
- **Cost Monitoring**: Track usage in Perplexity dashboard

## 🔗 Resources

- [Perplexity API Documentation](https://docs.perplexity.ai/)
- [API Pricing](https://www.perplexity.ai/api)
- [Neo4j Documentation](https://neo4j.com/docs/) (for Phase 2d)
- [Vector Search Guide](https://supabase.com/docs/guides/ai/vector-search) 