// Embedding and RAG helper functions
export interface EmbeddingChunk {
  id: number;                    // Updated to number for SERIAL primary key
  content: string;
  speaker: string;               // SPEAKER_00, SPEAKER_01, etc.
  startTime: number;             // Updated from timestamp
  endTime: number;               // New field for end timestamp
  embedding?: number[];
}

export interface SearchResult {
  chunk: EmbeddingChunk;
  similarity: number;
}

/**
 * Split text into chunks for embedding
 */
export function chunkText(text: string, chunkSize: number = 500): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length < chunkSize) {
      currentChunk += sentence + '. ';
    } else {
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence + '. ';
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Find the most relevant chunks for a query
 */
export function findRelevantChunks(
  queryEmbedding: number[],
  chunks: EmbeddingChunk[],
  topK: number = 5,
  threshold: number = 0.7
): SearchResult[] {
  const results: SearchResult[] = [];

  for (const chunk of chunks) {
    if (!chunk.embedding) continue;

    const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
    if (similarity >= threshold) {
      results.push({ chunk, similarity });
    }
  }

  // Sort by similarity descending and take top K
  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
} 