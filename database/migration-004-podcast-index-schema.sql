-- Migration 004: Podcast Index Schema Update
-- Date: 2024-06-30
-- Purpose: Update episodes table for Podcast Index support, deprecate YouTube fields

-- Add Podcast Index fields
ALTER TABLE episodes
  ADD COLUMN IF NOT EXISTS podcast_id TEXT,                -- Podcast Index podcast ID
  ADD COLUMN IF NOT EXISTS guid TEXT,                      -- Podcast Index episode GUID (unique)
  ADD COLUMN IF NOT EXISTS enclosure_url TEXT,             -- Audio file URL
  ADD COLUMN IF NOT EXISTS image_url TEXT,                 -- Episode or podcast artwork
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMP,         -- Original publish date
  ADD COLUMN IF NOT EXISTS feed_url TEXT,                  -- Podcast RSS feed URL
  ADD COLUMN IF NOT EXISTS episode_type TEXT,              -- e.g., 'full', 'trailer', 'bonus'
  ADD COLUMN IF NOT EXISTS explicit BOOLEAN,               -- Explicit content flag
  ADD COLUMN IF NOT EXISTS podcast_title TEXT;             -- Podcast title (for denormalized display)

-- Remove YouTube-specific fields
ALTER TABLE episodes
  DROP COLUMN IF EXISTS youtube_url,
  DROP COLUMN IF EXISTS channel_title,
  DROP COLUMN IF EXISTS thumbnail_url;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_episodes_guid ON episodes(guid);
CREATE INDEX IF NOT EXISTS idx_episodes_podcast_id ON episodes(podcast_id);
CREATE INDEX IF NOT EXISTS idx_episodes_enclosure_url ON episodes(enclosure_url);

-- Add comments for documentation
COMMENT ON COLUMN episodes.guid IS 'Podcast Index episode GUID (unique identifier)';
COMMENT ON COLUMN episodes.enclosure_url IS 'Direct audio file URL from Podcast Index';
COMMENT ON COLUMN episodes.podcast_id IS 'Podcast Index podcast ID';
COMMENT ON COLUMN episodes.image_url IS 'Episode or podcast artwork URL';
COMMENT ON COLUMN episodes.published_at IS 'Original publish date from feed';
COMMENT ON COLUMN episodes.feed_url IS 'Podcast RSS feed URL';
COMMENT ON COLUMN episodes.episode_type IS 'Episode type: full, trailer, bonus, etc.';
COMMENT ON COLUMN episodes.explicit IS 'Explicit content flag from feed';
COMMENT ON COLUMN episodes.podcast_title IS 'Podcast title (denormalized for display)'; 