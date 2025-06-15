
-- Enable RLS on tables that don't have it enabled
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

-- Create policies to allow viewing data (you can make these more restrictive later)
-- Community posts - allow all to view
DROP POLICY IF EXISTS "Anyone can view community posts" ON public.community_posts;
CREATE POLICY "Anyone can view community posts" ON public.community_posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create posts" ON public.community_posts;
CREATE POLICY "Users can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Community comments - allow all to view
DROP POLICY IF EXISTS "Anyone can view comments" ON public.community_post_comments;
CREATE POLICY "Anyone can view comments" ON public.community_post_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON public.community_post_comments;
CREATE POLICY "Users can create comments" ON public.community_post_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Community likes - allow all to view
DROP POLICY IF EXISTS "Anyone can view likes" ON public.community_post_likes;
CREATE POLICY "Anyone can view likes" ON public.community_post_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create likes" ON public.community_post_likes;
CREATE POLICY "Users can create likes" ON public.community_post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Community bookmarks - allow all to view
DROP POLICY IF EXISTS "Anyone can view bookmarks" ON public.community_post_bookmarks;
CREATE POLICY "Anyone can view bookmarks" ON public.community_post_bookmarks
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create bookmarks" ON public.community_post_bookmarks;
CREATE POLICY "Users can create bookmarks" ON public.community_post_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Projects - allow all to view for now
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;
CREATE POLICY "Anyone can view projects" ON public.projects
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- User roles - allow all to view
DROP POLICY IF EXISTS "Anyone can view user roles" ON public.user_roles;
CREATE POLICY "Anyone can view user roles" ON public.user_roles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create roles" ON public.user_roles;
CREATE POLICY "Users can create roles" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Portfolio items - allow all to view
DROP POLICY IF EXISTS "Anyone can view portfolio items" ON public.portfolio_items;
CREATE POLICY "Anyone can view portfolio items" ON public.portfolio_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create portfolio items" ON public.portfolio_items;
CREATE POLICY "Users can create portfolio items" ON public.portfolio_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Marketplace items - allow all to view
DROP POLICY IF EXISTS "Anyone can view marketplace items" ON public.marketplace_items;
CREATE POLICY "Anyone can view marketplace items" ON public.marketplace_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create marketplace items" ON public.marketplace_items;
CREATE POLICY "Users can create marketplace items" ON public.marketplace_items
  FOR INSERT WITH CHECK (auth.uid() = seller_id);
