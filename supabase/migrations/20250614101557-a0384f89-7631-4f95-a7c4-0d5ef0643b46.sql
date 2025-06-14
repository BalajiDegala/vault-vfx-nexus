
-- Add attachments column to community_posts table
ALTER TABLE public.community_posts 
ADD COLUMN attachments jsonb DEFAULT '[]'::jsonb;

-- Create storage bucket for community post attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-attachments', 
  'community-attachments', 
  true, 
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf', 'text/plain', 'application/zip']
);

-- Create RLS policies for the storage bucket
CREATE POLICY "Users can upload community attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'community-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Community attachments are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'community-attachments');

CREATE POLICY "Users can update their own community attachments" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'community-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own community attachments" ON storage.objects
FOR DELETE USING (
  bucket_id = 'community-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
