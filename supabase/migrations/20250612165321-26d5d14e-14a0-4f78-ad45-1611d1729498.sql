
-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Create storage bucket for portfolio items
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio', 'portfolio', true);

-- Create portfolio items table
CREATE TABLE public.portfolio_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  file_url TEXT,
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user follows table for social features
CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create profile views table for analytics
CREATE TABLE public.profile_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for portfolio items
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all portfolio items" 
  ON public.portfolio_items 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own portfolio items" 
  ON public.portfolio_items 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Add RLS policies for user follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all follows" 
  ON public.user_follows 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own follows" 
  ON public.user_follows 
  FOR ALL 
  USING (auth.uid() = follower_id);

-- Add RLS policies for profile views
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profile views" 
  ON public.profile_views 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create profile views" 
  ON public.profile_views 
  FOR INSERT 
  WITH CHECK (true);

-- Add storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatars" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add storage policies for portfolio
CREATE POLICY "Portfolio items are publicly accessible" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'portfolio');

CREATE POLICY "Users can upload their own portfolio items" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own portfolio items" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own portfolio items" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add some useful columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portfolio_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS online_status TEXT DEFAULT 'offline';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create functions to update counts
CREATE OR REPLACE FUNCTION update_user_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update follower's following count
    UPDATE public.profiles 
    SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    
    -- Update following's followers count
    UPDATE public.profiles 
    SET followers_count = followers_count + 1 
    WHERE id = NEW.following_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update follower's following count
    UPDATE public.profiles 
    SET following_count = following_count - 1 
    WHERE id = OLD.follower_id;
    
    -- Update following's followers count
    UPDATE public.profiles 
    SET followers_count = followers_count - 1 
    WHERE id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for follow counts
CREATE TRIGGER trigger_update_user_follow_counts
  AFTER INSERT OR DELETE ON public.user_follows
  FOR EACH ROW EXECUTE FUNCTION update_user_follow_counts();

-- Create function to update portfolio count
CREATE OR REPLACE FUNCTION update_user_portfolio_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET portfolio_count = portfolio_count + 1 
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles 
    SET portfolio_count = portfolio_count - 1 
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for portfolio count
CREATE TRIGGER trigger_update_user_portfolio_count
  AFTER INSERT OR DELETE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION update_user_portfolio_count();
