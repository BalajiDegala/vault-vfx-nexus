
-- Drop the existing trending_hashtags view first
DROP VIEW IF EXISTS public.trending_hashtags;

-- Create trending_hashtags table with proper structure
CREATE TABLE public.trending_hashtags (
  hashtag TEXT PRIMARY KEY,
  post_count BIGINT DEFAULT 1,
  user_count BIGINT DEFAULT 1,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on trending_hashtags
ALTER TABLE public.trending_hashtags ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read trending hashtags
CREATE POLICY "Anyone can view trending hashtags" 
  ON public.trending_hashtags 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create policy to allow the system to update hashtag counts
CREATE POLICY "System can update hashtag counts" 
  ON public.trending_hashtags 
  FOR ALL
  TO authenticated
  USING (true);

-- Create the update_hashtag_count function
CREATE OR REPLACE FUNCTION public.update_hashtag_count(hashtag_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.trending_hashtags (hashtag, post_count, user_count, last_updated)
  VALUES (hashtag_name, 1, 1, now())
  ON CONFLICT (hashtag) 
  DO UPDATE SET 
    post_count = trending_hashtags.post_count + 1,
    last_updated = now();
END;
$$;

-- Add category column to community_posts if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'community_posts' 
                 AND column_name = 'category') THEN
    ALTER TABLE public.community_posts ADD COLUMN category TEXT DEFAULT 'general';
  END IF;
END $$;
