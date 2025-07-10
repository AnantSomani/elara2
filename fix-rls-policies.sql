-- Fix RLS policies for episodes table to allow anonymous users to create episodes
-- Run this in your Supabase SQL editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous to insert episodes" ON episodes;
DROP POLICY IF EXISTS "Allow anonymous to select episodes" ON episodes;
DROP POLICY IF EXISTS "Allow anonymous to update episodes" ON episodes;

-- Create new policies that allow anonymous users to work with episodes
CREATE POLICY "Allow anonymous to insert episodes" ON episodes 
  FOR INSERT TO anon 
  WITH CHECK (true);

CREATE POLICY "Allow anonymous to select episodes" ON episodes 
  FOR SELECT TO anon 
  USING (true);

CREATE POLICY "Allow anonymous to update episodes" ON episodes 
  FOR UPDATE TO anon 
  USING (true);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'episodes'; 