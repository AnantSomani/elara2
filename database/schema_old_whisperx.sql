-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Podcast episodes metadata
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  youtube_url TEXT,
  audio_url TEXT,
  duration_seconds INTEGER,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  transcript TEXT, -- Full transcript for backup/reference
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Speakers per episode (mapped from SPEAKER_00, SPEAKER_01, etc.)
CREATE TABLE episode_speakers (
  id SERIAL PRIMARY KEY,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  speaker_label TEXT NOT NULL,      -- e.g., "SPEAKER_00"
  speaker_name TEXT,                -- e.g., "Chamath" (optional mapping)
  voice_id TEXT,                    -- ElevenLabs voice reference
  confidence_score FLOAT,           -- Speaker identification confidence
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (episode_id, speaker_label)
);

-- Diarized transcript segments (this matches your background processing script)
CREATE TABLE segments (
  id SERIAL PRIMARY KEY,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,            -- The text content
  speaker TEXT NOT NULL,            -- From WhisperX (SPEAKER_00, etc.)
  speaker_name TEXT,                -- Mapped name (Chamath, Sacks, etc.)
  timestamp_start FLOAT8 NOT NULL,  -- in seconds
  timestamp_end FLOAT8 NOT NULL,
  embedding VECTOR(1536),           -- OpenAI text-embedding-3-small
  words JSONB,                      -- Optional: word-level metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Podcast hosts reference table (for mapping speakers to known hosts)
CREATE TABLE podcast_hosts (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,        -- "Chamath", "Sacks", "Friedberg", "Calacanis"
  voice_id TEXT,                    -- ElevenLabs voice ID
  description TEXT,                 -- Host description/bio
  personality_prompt TEXT,          -- Custom prompt for this host
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default All-In Podcast hosts
INSERT INTO podcast_hosts (name, description, personality_prompt) VALUES
('Chamath', 'CEO and venture capitalist, known for direct commentary on tech and markets', 'You are Chamath Palihapitiya. Respond in a direct, analytical style focusing on business fundamentals and market dynamics.'),
('Sacks', 'Former PayPal COO, venture capitalist and entrepreneur', 'You are David Sacks. Respond with sharp business insights and strong opinions on tech industry trends.'),
('Friedberg', 'Entrepreneur and investor focused on agriculture and life sciences', 'You are David Friedberg. Respond with scientific rigor and focus on data-driven analysis.'),
('Calacanis', 'Angel investor and podcast host known for rapid-fire commentary', 'You are Jason Calacanis. Respond with enthusiastic, rapid-fire insights and startup ecosystem knowledge.');

-- Chat sessions for user interactions
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  user_id TEXT, -- Could be device ID or user identifier
  created_at TIMESTAMP DEFAULT NOW()
);

-- Individual chat messages
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  ai_response TEXT,
  responding_host TEXT, -- Which host personality responded
  voice_audio_url TEXT, -- ElevenLabs generated audio URL
  relevant_segments JSONB, -- Array of segment IDs that were used for context
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX ON segments USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
CREATE INDEX idx_segments_episode ON segments (episode_id);
CREATE INDEX idx_segments_speaker ON segments (speaker);
CREATE INDEX idx_segments_time ON segments (timestamp_start, timestamp_end);
CREATE INDEX idx_episodes_status ON episodes (processing_status);
CREATE INDEX idx_chat_messages_session ON chat_messages (session_id);
CREATE INDEX idx_chat_messages_episode ON chat_messages (episode_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON episodes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies if needed
-- ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE segments ENABLE ROW LEVEL SECURITY; 