-- Migration 005: Podcast Index Support
-- Date: 2024-12-30
-- Purpose: Add Podcast Index specific columns and support

-- Add Podcast Index specific columns
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS enclosure_url TEXT;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS podcast_index_guid TEXT;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS pub_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS episode_type TEXT DEFAULT 'youtube';
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS podcast_title TEXT;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS explicit BOOLEAN DEFAULT FALSE;

-- Update existing episodes to have episode_type = 'youtube'
UPDATE episodes SET episode_type = 'youtube' WHERE episode_type IS NULL;

-- Add indexes for Podcast Index fields
CREATE INDEX IF NOT EXISTS idx_episodes_podcast_index_guid ON episodes(podcast_index_guid);
CREATE INDEX IF NOT EXISTS idx_episodes_enclosure_url ON episodes(enclosure_url);
CREATE INDEX IF NOT EXISTS idx_episodes_episode_type ON episodes(episode_type);
CREATE INDEX IF NOT EXISTS idx_episodes_podcast_title ON episodes(podcast_title);
CREATE INDEX IF NOT EXISTS idx_episodes_pub_date ON episodes(pub_date);

-- Add comments for documentation
COMMENT ON COLUMN episodes.enclosure_url IS 'Direct audio URL from Podcast Index';
COMMENT ON COLUMN episodes.podcast_index_guid IS 'Podcast Index episode GUID';
COMMENT ON COLUMN episodes.pub_date IS 'Original podcast episode publish date';
COMMENT ON COLUMN episodes.episode_type IS 'Type: youtube, podcast_index, etc.';
COMMENT ON COLUMN episodes.podcast_title IS 'Podcast title (denormalized)';
COMMENT ON COLUMN episodes.explicit IS 'Explicit content flag from Podcast Index';

-- Add RLS policies for Podcast Index episodes (if RLS is enabled)
-- Note: These policies assume the same access rules as YouTube episodes
-- Adjust based on your specific RLS requirements

-- Example RLS policy for Podcast Index episodes (uncomment if needed)
/*
CREATE POLICY "Allow read access to podcast index episodes" ON episodes
    FOR SELECT USING (
        episode_type = 'podcast_index' AND 
        processing_status = 'completed'
    );

CREATE POLICY "Allow insert access to podcast index episodes" ON episodes
    FOR INSERT WITH CHECK (
        episode_type = 'podcast_index'
    );

CREATE POLICY "Allow update access to podcast index episodes" ON episodes
    FOR UPDATE USING (
        episode_type = 'podcast_index'
    );
*/ 