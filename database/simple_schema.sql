-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Simplified schema focused on transcript fetching
-- This is what you actually need for your MVP

-- Episodes with complete transcripts
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  youtube_url TEXT,
  audio_url TEXT,
  duration_seconds INTEGER,
  
  -- CORE TRANSCRIPT DATA (what you actually want)
  full_transcript TEXT,                    -- Complete transcript for easy retrieval
  transcript_with_speakers TEXT,           -- Formatted with speaker labels
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transcript segments for semantic search and detailed analysis
CREATE TABLE transcript_segments (
  id SERIAL PRIMARY KEY,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  
  -- SIMPLE SPEAKER INFO
  speaker_id TEXT NOT NULL,               -- "SPEAKER_00", "SPEAKER_01", etc.
  speaker_name TEXT,                      -- "Chamath", "Sacks", etc. (simple mapping)
  
  -- CONTENT & TIMING
  content TEXT NOT NULL,
  start_time FLOAT8 NOT NULL,
  end_time FLOAT8 NOT NULL,
  
  -- SEARCH CAPABILITY
  embedding VECTOR(1536),                 -- For semantic search
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Simple indexes for performance
CREATE INDEX idx_episodes_status ON episodes (processing_status);
CREATE INDEX idx_segments_episode ON transcript_segments (episode_id);
CREATE INDEX idx_segments_speaker ON transcript_segments (speaker_id);
CREATE INDEX idx_segments_time ON transcript_segments (start_time, end_time);
CREATE INDEX ON transcript_segments USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

-- Helper function to get formatted transcript
CREATE OR REPLACE FUNCTION get_formatted_transcript(episode_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    formatted_transcript TEXT := '';
    segment RECORD;
BEGIN
    FOR segment IN 
        SELECT speaker_name, content, start_time 
        FROM transcript_segments 
        WHERE episode_id = episode_uuid 
        ORDER BY start_time
    LOOP
        formatted_transcript := formatted_transcript || 
            COALESCE(segment.speaker_name, 'Unknown') || ': ' || 
            segment.content || E'\n\n';
    END LOOP;
    
    RETURN formatted_transcript;
END;
$$;

-- Example queries that are now simple:

-- 1. Get full transcript (SIMPLE!)
-- SELECT full_transcript FROM episodes WHERE id = 'episode-id';

-- 2. Get transcript with speakers (SIMPLE!)
-- SELECT transcript_with_speakers FROM episodes WHERE id = 'episode-id';

-- 3. Get segments by speaker (SIMPLE!)
-- SELECT content, start_time FROM transcript_segments 
-- WHERE episode_id = 'episode-id' AND speaker_name = 'Chamath' 
-- ORDER BY start_time;

-- 4. Search transcript semantically (SIMPLE!)
-- SELECT content, speaker_name, start_time 
-- FROM transcript_segments 
-- WHERE episode_id = 'episode-id'
-- ORDER BY embedding <=> 'query_embedding'
-- LIMIT 5; 