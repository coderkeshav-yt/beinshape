-- Add slug field to batches table for SEO-friendly URLs
-- This will allow URLs like /batches/nutrition-wellness instead of /batches/123

-- Add slug column to batches table
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create a unique index on slug to ensure no duplicates
CREATE UNIQUE INDEX IF NOT EXISTS batches_slug_unique ON public.batches(slug);

-- Update existing batches with slugs based on their titles
UPDATE public.batches 
SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'))
WHERE slug IS NULL;

-- Replace spaces with hyphens to create URL-friendly slugs
UPDATE public.batches 
SET slug = REGEXP_REPLACE(slug, '\s+', '-', 'g')
WHERE slug LIKE '% %';

-- Ensure all existing batches have slugs
UPDATE public.batches 
SET slug = 'batch-' || id::text
WHERE slug IS NULL OR slug = '';

-- Make slug column NOT NULL after populating
ALTER TABLE public.batches ALTER COLUMN slug SET NOT NULL;

-- Create a function to generate slugs for new batches
CREATE OR REPLACE FUNCTION generate_batch_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Convert title to lowercase and remove special characters
  base_slug := LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'));
  -- Replace spaces with hyphens
  base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
  
  final_slug := base_slug;
  
  -- Check if slug already exists, if so append a number
  WHILE EXISTS (SELECT 1 FROM public.batches WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;
