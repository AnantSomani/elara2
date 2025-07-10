-- Add missing columns to episodes table
-- Run this in your Supabase SQL editor

ALTER TABLE episodes 
ADD COLUMN IF NOT EXISTS channel_title TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Update existing episodes with fallback data if needed
UPDATE episodes 
SET 
  channel_title = 'Unknown Channel'
WHERE channel_title IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'episodes' 
AND column_name IN ('channel_title', 'thumbnail_url')
ORDER BY column_name; 