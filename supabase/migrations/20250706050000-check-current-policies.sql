-- Check current RLS policies and apply correct ones
-- This migration will check existing policies and apply only what's needed

-- First, let's check what policies currently exist
-- You can run this to see current policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename IN ('chapters', 'chapter_content');

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Users can view chapters of enrolled batches" ON public.chapters;
DROP POLICY IF EXISTS "Public can view chapters" ON public.chapters;

-- Create the correct public read policy for chapters
CREATE POLICY "Public can view chapters" ON public.chapters
  FOR SELECT USING (true);

-- Drop existing chapter_content policies
DROP POLICY IF EXISTS "Admin can manage chapter content" ON public.chapter_content;
DROP POLICY IF EXISTS "Public can view chapter content" ON public.chapter_content;
DROP POLICY IF EXISTS "Public can view chapter content metadata" ON public.chapter_content;

-- Create the correct policy for chapter_content
CREATE POLICY "Public can view chapter content" ON public.chapter_content
  FOR SELECT USING (true);

-- Verify the policies were created
-- You can check with: SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('chapters', 'chapter_content');
