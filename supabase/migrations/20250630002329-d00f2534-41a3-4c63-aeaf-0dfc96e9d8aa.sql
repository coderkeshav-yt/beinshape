
-- Add columns to chapters table for enhanced content
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS detailed_description TEXT;

-- Create a table for chapter content/subtopics
CREATE TABLE IF NOT EXISTS public.chapter_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  tags TEXT[],
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for chapter_content table
ALTER TABLE public.chapter_content ENABLE ROW LEVEL SECURITY;

-- Create policies for chapter_content (admin only for now)
CREATE POLICY "Admin can manage chapter content" 
  ON public.chapter_content 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create policy for public read access to chapter content
CREATE POLICY "Public can view chapter content" 
  ON public.chapter_content 
  FOR SELECT 
  USING (true);
