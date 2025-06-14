
-- Add bookmarks_count column to community_posts table
ALTER TABLE public.community_posts
ADD COLUMN IF NOT EXISTS bookmarks_count INTEGER NOT NULL DEFAULT 0;

-- Create community_post_bookmarks table
CREATE TABLE IF NOT EXISTS public.community_post_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT user_post_bookmark_unique UNIQUE (user_id, post_id) -- Ensure a user can only bookmark a post once
);

-- Add RLS policies for community_post_bookmarks
ALTER TABLE public.community_post_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks"
  ON public.community_post_bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
  ON public.community_post_bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON public.community_post_bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_community_post_bookmarks_user_id ON public.community_post_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_community_post_bookmarks_post_id ON public.community_post_bookmarks(post_id);

-- Function to update bookmarks_count on community_posts
CREATE OR REPLACE FUNCTION public.update_post_bookmarks_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts
    SET bookmarks_count = bookmarks_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts
    SET bookmarks_count = bookmarks_count - 1
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$
;

-- Trigger to update bookmarks_count on insert
DROP TRIGGER IF EXISTS on_community_post_bookmark_insert ON public.community_post_bookmarks;
CREATE TRIGGER on_community_post_bookmark_insert
  AFTER INSERT ON public.community_post_bookmarks
  FOR EACH ROW EXECUTE FUNCTION public.update_post_bookmarks_count();

-- Trigger to update bookmarks_count on delete
DROP TRIGGER IF EXISTS on_community_post_bookmark_delete ON public.community_post_bookmarks;
CREATE TRIGGER on_community_post_bookmark_delete
  AFTER DELETE ON public.community_post_bookmarks
  FOR EACH ROW EXECUTE FUNCTION public.update_post_bookmarks_count();

