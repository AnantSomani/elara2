-- Migration 001: Podcast Transcription Schema
-- Date: 2024-12-30  
-- Purpose: Add transcription support for podcast episodes with AssemblyAI integration

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- Add transcription columns to episodes table
ALTER TABLE episodes 
ADD COLUMN IF NOT EXISTS assemblyai_transcript_id TEXT,
ADD COLUMN IF NOT EXISTS assemblyai_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS transcript_id TEXT,
ADD COLUMN IF NOT EXISTS transcription_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS speakers TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS episode_chapters JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS detected_entities JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS processing_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_episodes_assemblyai_transcript_id ON episodes(assemblyai_transcript_id);
CREATE INDEX IF NOT EXISTS idx_episodes_assemblyai_status ON episodes(assemblyai_status);
CREATE INDEX IF NOT EXISTS idx_episodes_transcription_status ON episodes(transcription_status);
CREATE INDEX IF NOT EXISTS idx_episodes_speakers ON episodes USING GIN(speakers);
CREATE INDEX IF NOT EXISTS idx_episodes_published_at ON episodes(published_at);

-- Drop existing transcript_segments table if it exists to ensure clean schema
DROP TABLE IF EXISTS transcript_segments CASCADE;

-- Create transcript_segments table for semantic search  
CREATE TABLE transcript_segments (
  id SERIAL PRIMARY KEY,
  episode_id TEXT REFERENCES episodes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  speaker_name TEXT,
  start_time FLOAT8 NOT NULL,
  end_time FLOAT8 NOT NULL,
  embedding VECTOR(1536),
  confidence DECIMAL(3,2) DEFAULT 0.9,
  words JSONB DEFAULT '[]',
  segment_type TEXT DEFAULT 'utterance',
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT chk_time_order CHECK (start_time <= end_time),
  CONSTRAINT chk_confidence_range CHECK (confidence >= 0.0 AND confidence <= 1.0)
);

-- Add indexes for transcript segments
CREATE INDEX IF NOT EXISTS idx_segments_episode ON transcript_segments (episode_id);
CREATE INDEX IF NOT EXISTS idx_segments_speaker ON transcript_segments (speaker_name);
CREATE INDEX IF NOT EXISTS idx_segments_time ON transcript_segments (start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_segments_created_at ON transcript_segments (created_at);
CREATE INDEX IF NOT EXISTS idx_segments_confidence ON transcript_segments(confidence);
CREATE INDEX IF NOT EXISTS idx_segments_type ON transcript_segments(segment_type);

-- Create vector index for semantic search (with error handling)
DO $$
BEGIN
    CREATE INDEX idx_segments_embedding ON transcript_segments 
    USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
    RAISE NOTICE '✅ Created vector index for embeddings';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Could not create vector index (pgvector may not be fully configured)';
END $$;

-- Drop existing processing_logs table if it exists to ensure clean schema
DROP TABLE IF EXISTS processing_logs CASCADE;

-- Add processing logs table for debugging and audit trail
CREATE TABLE processing_logs (
    id BIGSERIAL PRIMARY KEY,
    episode_id TEXT REFERENCES episodes(id),
    processing_type TEXT NOT NULL,
    status TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for processing logs
CREATE INDEX IF NOT EXISTS idx_processing_logs_episode_id ON processing_logs(episode_id);
CREATE INDEX IF NOT EXISTS idx_processing_logs_status ON processing_logs(status);
CREATE INDEX IF NOT EXISTS idx_processing_logs_type ON processing_logs(processing_type);
CREATE INDEX IF NOT EXISTS idx_processing_logs_created_at ON processing_logs(created_at);

-- Drop existing functions to avoid parameter conflicts
DROP FUNCTION IF EXISTS get_episode_transcript(text);
DROP FUNCTION IF EXISTS search_segments(text, vector, float, int);

-- Create helper function for getting episode transcripts
CREATE OR REPLACE FUNCTION get_episode_transcript(episode_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    transcript TEXT := '';
    segment RECORD;
BEGIN
    FOR segment IN 
        SELECT content, speaker_name, start_time 
        FROM transcript_segments 
        WHERE episode_id = episode_text 
        ORDER BY start_time
    LOOP
        transcript := transcript || 
            COALESCE(segment.speaker_name || ': ', '') || 
            segment.content || E'\n';
    END LOOP;
    
    RETURN transcript;
END;
$$;

-- Create search function for semantic search
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
        1 - (ts.embedding <-> query_embedding) AS similarity
    FROM transcript_segments ts
    WHERE ts.episode_id = target_episode_id
      AND 1 - (ts.embedding <-> query_embedding) > similarity_threshold
    ORDER BY ts.embedding <-> query_embedding
    LIMIT match_count;
END;
$$;

-- Add comments for documentation
COMMENT ON COLUMN episodes.assemblyai_transcript_id IS 'AssemblyAI transcript ID for tracking';
COMMENT ON COLUMN episodes.assemblyai_status IS 'AssemblyAI Status: pending, processing, completed, failed';
COMMENT ON COLUMN episodes.transcript_id IS 'Generic transcript ID for tracking';
COMMENT ON COLUMN episodes.transcription_status IS 'Transcription Status: pending, processing, completed, failed';
COMMENT ON COLUMN episodes.speakers IS 'Array of identified speaker names';
COMMENT ON COLUMN episodes.episode_chapters IS 'Auto-detected chapters from AssemblyAI';
COMMENT ON COLUMN episodes.detected_entities IS 'Named entities detected by AssemblyAI';
COMMENT ON COLUMN episodes.processing_metadata IS 'AssemblyAI processing metadata and config';
COMMENT ON COLUMN episodes.published_at IS 'Original podcast episode publish date';

COMMENT ON TABLE transcript_segments IS 'Diarized transcript segments for semantic search and RAG';
COMMENT ON COLUMN transcript_segments.speaker_name IS 'Speaker name (mapped from diarization labels)';
COMMENT ON COLUMN transcript_segments.embedding IS 'OpenAI text-embedding-3-small vector for semantic search';
COMMENT ON COLUMN transcript_segments.confidence IS 'Transcription confidence score (0.0-1.0)';
COMMENT ON COLUMN transcript_segments.words IS 'Word-level timestamps and confidence';
COMMENT ON COLUMN transcript_segments.segment_type IS 'Type: utterance, chapter, entity, etc.';

COMMENT ON TABLE processing_logs IS 'Audit trail for all podcast processing operations';
COMMENT ON COLUMN processing_logs.processing_type IS 'Type: assemblyai_transcription, embedding_generation, etc.';