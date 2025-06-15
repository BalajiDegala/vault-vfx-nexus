
-- Clear all data from tables (keeping table structures)
-- Start with tables that have foreign key dependencies first

-- Clear transaction and activity tables
TRUNCATE TABLE public.v3c_transactions CASCADE;
TRUNCATE TABLE public.marketplace_purchases CASCADE;
TRUNCATE TABLE public.marketplace_ratings CASCADE;

-- Clear community-related tables
TRUNCATE TABLE public.community_post_comments CASCADE;
TRUNCATE TABLE public.community_post_likes CASCADE;
TRUNCATE TABLE public.community_post_bookmarks CASCADE;
TRUNCATE TABLE public.community_posts CASCADE;
TRUNCATE TABLE public.trending_hashtags CASCADE;

-- Clear project-related tables
TRUNCATE TABLE public.project_messages CASCADE;
TRUNCATE TABLE public.project_notifications CASCADE;
TRUNCATE TABLE public.project_presence CASCADE;
TRUNCATE TABLE public.project_status_history CASCADE;
TRUNCATE TABLE public.project_bids CASCADE;
TRUNCATE TABLE public.tasks CASCADE;
TRUNCATE TABLE public.shots CASCADE;
TRUNCATE TABLE public.sequences CASCADE;
TRUNCATE TABLE public.project_access CASCADE;
TRUNCATE TABLE public.shared_tasks CASCADE;
TRUNCATE TABLE public.artist_task_access CASCADE;
TRUNCATE TABLE public.messages CASCADE;
TRUNCATE TABLE public.projects CASCADE;

-- Clear user-related tables
TRUNCATE TABLE public.direct_messages CASCADE;
TRUNCATE TABLE public.portfolio_items CASCADE;
TRUNCATE TABLE public.profile_views CASCADE;
TRUNCATE TABLE public.user_follows CASCADE;
TRUNCATE TABLE public.marketplace_items CASCADE;
TRUNCATE TABLE public.payments CASCADE;
TRUNCATE TABLE public.filter_presets CASCADE;
TRUNCATE TABLE public.user_roles CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- Reset any sequences or auto-incrementing values if needed
-- (Most tables use UUIDs so this may not be necessary, but included for completeness)
