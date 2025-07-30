-- Fix and ensure retrieval functions are properly set up
-- Run this in your Supabase SQL Editor

-- Enable the pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS search_segments(text, vector, float, int);
DROP FUNCTION IF EXISTS match_segments(vector, float, int, text);

-- Create the main search function for semantic search
CREATE OR REPLACE FUNCTION search_segments(
  target_episode_id TEXT,
  query_embedding VECTOR(1536),
  similarity_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id INTEGER,
  content TEXT,
  speaker_name TEXT,
  start_time FLOAT8,
  end_time FLOAT8,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.id,
        ts.content,
        ts.speaker_name,
        ts.start_time,
        ts.end_time,
        1 - (ts.embedding <=> query_embedding) AS similarity
    FROM transcript_segments ts
    WHERE ts.episode_id = target_episode_id
      AND ts.embedding IS NOT NULL
      AND 1 - (ts.embedding <=> query_embedding) > similarity_threshold
    ORDER BY ts.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Create a more flexible search function
CREATE OR REPLACE FUNCTION match_segments(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  episode_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  episode_id TEXT,
  content TEXT,
  speaker TEXT,
  start_time FLOAT8,
  end_time FLOAT8,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    transcript_segments.id,
    transcript_segments.episode_id,
    transcript_segments.content,
    transcript_segments.speaker_name,
    transcript_segments.start_time,
    transcript_segments.end_time,
    1 - (transcript_segments.embedding <=> query_embedding) as similarity
  FROM transcript_segments
  WHERE 
    transcript_segments.embedding IS NOT NULL
    AND (episode_filter IS NULL OR transcript_segments.episode_id = episode_filter)
    AND 1 - (transcript_segments.embedding <=> query_embedding) > match_threshold
  ORDER BY transcript_segments.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create a function to check if embeddings exist for an episode
CREATE OR REPLACE FUNCTION check_episode_embeddings(episode_id TEXT)
RETURNS TABLE (
  total_segments BIGINT,
  segments_with_embeddings BIGINT,
  embedding_coverage FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_segments,
    COUNT(*) FILTER (WHERE embedding IS NOT NULL) as segments_with_embeddings,
    ROUND(
      (COUNT(*) FILTER (WHERE embedding IS NOT NULL)::FLOAT / COUNT(*)::FLOAT) * 100, 
      2
    ) as embedding_coverage
  FROM transcript_segments 
  WHERE episode_id = check_episode_embeddings.episode_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION search_segments(text, vector, float, int) TO anon;
GRANT EXECUTE ON FUNCTION search_segments(text, vector, float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION match_segments(vector, float, int, text) TO anon;
GRANT EXECUTE ON FUNCTION match_segments(vector, float, int, text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_episode_embeddings(text) TO anon;
GRANT EXECUTE ON FUNCTION check_episode_embeddings(text) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transcript_segments_episode_embedding 
ON transcript_segments(episode_id) 
WHERE embedding IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transcript_segments_embedding 
ON transcript_segments USING ivfflat (embedding vector_cosine_ops)
WHERE embedding IS NOT NULL;

-- Add comments for documentation
COMMENT ON FUNCTION search_segments IS 'Search transcript segments by vector similarity for a specific episode';
COMMENT ON FUNCTION match_segments IS 'Search transcript segments by vector similarity across all episodes or filtered by episode';
COMMENT ON FUNCTION check_episode_embeddings IS 'Check embedding coverage for a specific episode';

-- Test the functions with a sample query
-- SELECT * FROM check_episode_embeddings('your-episode-id-here'); 