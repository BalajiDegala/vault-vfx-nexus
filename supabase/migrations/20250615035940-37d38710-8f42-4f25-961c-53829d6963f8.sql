
-- Create profiles for any existing auth users that don't have profiles yet
INSERT INTO public.profiles (
  id, 
  email, 
  first_name, 
  last_name, 
  username,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data ->> 'first_name', ''),
  COALESCE(au.raw_user_meta_data ->> 'last_name', ''),
  COALESCE(au.raw_user_meta_data ->> 'username', ''),
  now(),
  now()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
