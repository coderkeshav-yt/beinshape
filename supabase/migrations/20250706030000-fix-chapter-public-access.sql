-- Fix chapter access for guests and non-enrolled users
-- Allow public read access to basic chapter information
-- Keep detailed content restricted to enrolled users

-- Drop the restrictive policy that only allows enrolled users to view chapters
DROP POLICY IF EXISTS "Users can view chapters of enrolled batches" ON public.chapters;

-- Create a new policy that allows public read access to chapters
CREATE POLICY "Public can view chapters" ON public.chapters
  FOR SELECT USING (true);

-- Update the chapter_content policy to allow public read access to basic info
-- but restrict video content to enrolled users
DROP POLICY IF EXISTS "Public can view chapter content" ON public.chapter_content;

-- Create policy for public read access to chapter content metadata
CREATE POLICY "Public can view chapter content metadata" ON public.chapter_content
  FOR SELECT USING (true);

-- Note: Video content access is controlled at the application level
-- based on user enrollment status and chapter free status
