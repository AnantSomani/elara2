-- Elara Podcast App - Clean Schema with Supermemory Integration
-- Purpose: Minimal podcast-focused schema leveraging Supermemory for chat/memory
-- Chat functionality handled by Supermemory Infinite Chat & Memory APIs

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- EPISODES TABLE - YouTube metadata and processing status
-- =============================================================================
CREATE TABLE episodes (
  id TEXT PRIMARY KEY,                    -- YouTube video ID (e.g., "u1Rp1J3HwrE")
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL UNIQUE,
  audio_url TEXT,
  duration_seconds INTEGER,
  thumbnail_url TEXT,
  channel_title TEXT,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Episodes indexes
CREATE INDEX idx_episodes_status ON episodes (processing_status);
CREATE INDEX idx_episodes_youtube_url ON episodes (youtube_url);
CREATE INDEX idx_episodes_created_at ON episodes (created_at);

-- =============================================================================
-- TRANSCRIPT_SEGMENTS TABLE - Semantic search and RAG
-- =============================================================================
CREATE TABLE transcript_segments (
  id SERIAL PRIMARY KEY,
  episode_id TEXT REFERENCES episodes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  speaker TEXT NOT NULL,                  -- SPEAKER_00, SPEAKER_01, etc. from diarization
  start_time FLOAT8 NOT NULL,
  end_time FLOAT8 NOT NULL,
  embedding VECTOR(1536),                 -- OpenAI text-embedding-3-small
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT chk_time_order CHECK (start_time <= end_time)
);

-- Transcript segments indexes
CREATE INDEX idx_segments_episode ON transcript_segments (episode_id);
CREATE INDEX idx_segments_speaker ON transcript_segments (speaker);
CREATE INDEX idx_segments_time ON transcript_segments (start_time, end_time);
CREATE INDEX idx_segments_created_at ON transcript_segments (created_at);

-- Vector similarity search index
CREATE INDEX idx_segments_embedding ON transcript_segments 
USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

-- =============================================================================
-- PODCAST_HOSTS TABLE - All-In host personalities and voice mapping
-- =============================================================================
CREATE TABLE podcast_hosts (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,              -- "Chamath", "Sacks", "Friedberg", "Calacanis"
  voice_id TEXT NOT NULL,                 -- ElevenLabs voice ID
  personality_prompt TEXT NOT NULL,       -- Host-specific system prompt
  description TEXT,                       -- Host bio/description
  created_at TIMESTAMP DEFAULT NOW()
);

-- Podcast hosts indexes
CREATE INDEX idx_hosts_name ON podcast_hosts (name);

-- =============================================================================
-- EPISODE_SPEAKERS TABLE - Speaker diarization mapping
-- =============================================================================
CREATE TABLE episode_speakers (
  id SERIAL PRIMARY KEY,
  episode_id TEXT REFERENCES episodes(id) ON DELETE CASCADE,
  speaker_label TEXT NOT NULL,            -- "SPEAKER_00", "SPEAKER_01", etc.
  speaker_name TEXT,                      -- "Chamath", "Sacks", etc. (mapped)
  confidence_score FLOAT CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (episode_id, speaker_label)
);

-- Episode speakers indexes
CREATE INDEX idx_episode_speakers_episode ON episode_speakers (episode_id);
CREATE INDEX idx_episode_speakers_name ON episode_speakers (speaker_name);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Drop existing trigger function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for episodes table
CREATE TRIGGER update_episodes_updated_at 
    BEFORE UPDATE ON episodes
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

-- Drop existing functions if they exist (clean slate)
DROP FUNCTION IF EXISTS get_episode_transcript(text);
DROP FUNCTION IF EXISTS search_segments(text, vector, float, int);
DROP FUNCTION IF EXISTS get_episode_speaker_mapping(text);

-- Function to get episode transcript
CREATE OR REPLACE FUNCTION get_episode_transcript(target_episode_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    transcript TEXT := '';
    segment RECORD;
BEGIN
    FOR segment IN 
        SELECT content, speaker, start_time 
        FROM transcript_segments 
        WHERE episode_id = target_episode_id 
        ORDER BY start_time
    LOOP
        transcript := transcript || 
            segment.speaker || ': ' || 
            segment.content || E'\n';
    END LOOP;
    
    RETURN transcript;
END;
$$;

-- Function for semantic search of segments
CREATE OR REPLACE FUNCTION search_segments(
  target_episode_id TEXT,
  query_embedding VECTOR(1536),
  similarity_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id INTEGER,
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
    s.id,
    s.content,
    s.speaker,
    s.start_time,
    s.end_time,
    1 - (s.embedding <-> query_embedding) AS similarity
  FROM transcript_segments s
  WHERE s.episode_id = target_episode_id
    AND s.embedding IS NOT NULL
    AND 1 - (s.embedding <-> query_embedding) > similarity_threshold
  ORDER BY s.embedding <-> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to get speaker mapping for episode
CREATE OR REPLACE FUNCTION get_episode_speaker_mapping(target_episode_id TEXT)
RETURNS TABLE (
  speaker_label TEXT,
  speaker_name TEXT,
  confidence_score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    es.speaker_label,
    es.speaker_name,
    es.confidence_score
  FROM episode_speakers es
  WHERE es.episode_id = target_episode_id
  ORDER BY es.confidence_score DESC;
END;
$$;

-- =============================================================================
-- SEED DATA - All-In Podcast Hosts
-- =============================================================================

INSERT INTO podcast_hosts (name, voice_id, personality_prompt, description) VALUES
(
  'Chamath',
  'chamath_voice_id_placeholder',
  'You are Chamath Palihapitiya. Respond in a direct, analytical style focusing on business fundamentals and market dynamics. You cut through hype with data-driven insights and aren''t afraid to challenge conventional wisdom. Keep responses concise but impactful.',
  'CEO and venture capitalist, known for direct commentary on tech and markets'
),
(
  'Sacks',
  'sacks_voice_id_placeholder', 
  'You are David Sacks. Respond with sharp business insights and strong opinions on tech industry trends. You have a historical perspective and often reference past patterns. You''re articulate and logical in your arguments.',
  'Former PayPal COO, venture capitalist and entrepreneur'
),
(
  'Friedberg',
  'friedberg_voice_id_placeholder',
  'You are David Friedberg. Respond with scientific rigor and focus on data-driven analysis. You bring a technical and analytical perspective to discussions, often grounding conversations in facts and research.',
  'Entrepreneur and investor focused on agriculture and life sciences'
),
(
  'Calacanis',
  'calacanis_voice_id_placeholder',
  'You are Jason Calacanis. Respond with enthusiastic, rapid-fire insights and startup ecosystem knowledge. You''re optimistic about technology and entrepreneurship, and you speak with energy and passion.',
  'Angel investor and podcast host known for rapid-fire commentary'
);

-- =============================================================================
-- COMMENTS AND DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE episodes IS 'YouTube podcast episodes with processing status';
COMMENT ON TABLE transcript_segments IS 'Diarized transcript segments for semantic search and RAG';
COMMENT ON TABLE podcast_hosts IS 'All-In podcast host personalities and voice configurations';
COMMENT ON TABLE episode_speakers IS 'Speaker diarization mapping from labels to actual host names';

COMMENT ON COLUMN episodes.id IS 'YouTube video ID used as primary key';
COMMENT ON COLUMN episodes.processing_status IS 'Current processing state: pending, processing, completed, failed';
COMMENT ON COLUMN transcript_segments.speaker IS 'Speaker label from diarization (SPEAKER_00, SPEAKER_01, etc.)';
COMMENT ON COLUMN transcript_segments.embedding IS 'OpenAI text-embedding-3-small vector for semantic search';
COMMENT ON COLUMN podcast_hosts.voice_id IS 'ElevenLabs voice ID for text-to-speech';
COMMENT ON COLUMN podcast_hosts.personality_prompt IS 'System prompt defining host personality and response style';
COMMENT ON COLUMN episode_speakers.speaker_label IS 'Technical speaker label from diarization system';
COMMENT ON COLUMN episode_speakers.speaker_name IS 'Mapped human-readable host name';

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ================================================';
    RAISE NOTICE '🎉 ELARA PODCAST SCHEMA CREATED SUCCESSFULLY!';
    RAISE NOTICE '🎉 ================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Schema Overview:';
    RAISE NOTICE '   • Episodes: YouTube metadata & processing';
    RAISE NOTICE '   • Transcript Segments: RAG semantic search';
    RAISE NOTICE '   • Podcast Hosts: All-In personalities';
    RAISE NOTICE '   • Episode Speakers: Diarization mapping';
    RAISE NOTICE '';
    RAISE NOTICE '💬 Chat & Memory: Handled by Supermemory APIs';
    RAISE NOTICE '🔍 Search: Vector similarity + conversation context';
    RAISE NOTICE '🎙️ Voices: ElevenLabs integration ready';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready for Supermemory integration!';
    RAISE NOTICE '';
END $$; 