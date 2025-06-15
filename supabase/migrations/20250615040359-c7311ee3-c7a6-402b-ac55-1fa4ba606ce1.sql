
-- Add foreign key constraints to link tables with the profiles table

-- Fix community_posts -> profiles relationship
ALTER TABLE public.community_posts 
ADD CONSTRAINT community_posts_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix community_post_comments -> profiles relationship  
ALTER TABLE public.community_post_comments 
ADD CONSTRAINT community_post_comments_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix direct_messages -> profiles relationships
ALTER TABLE public.direct_messages 
ADD CONSTRAINT direct_messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.direct_messages 
ADD CONSTRAINT direct_messages_receiver_id_fkey 
FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix project_messages -> profiles relationship
ALTER TABLE public.project_messages 
ADD CONSTRAINT project_messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix shots -> profiles relationship (for assigned_to)
ALTER TABLE public.shots 
ADD CONSTRAINT shots_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Fix tasks -> profiles relationship (for assigned_to)
ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Fix marketplace_items -> profiles relationship
ALTER TABLE public.marketplace_items 
ADD CONSTRAINT marketplace_items_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
