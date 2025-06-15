
-- Check if the admin role assignment worked
SELECT 
  p.email,
  p.first_name,
  p.last_name,
  ur.role,
  ur.created_at
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
WHERE p.email = 'balajidaws@gmail.com';

-- Also check all admin users in the system
SELECT 
  p.email,
  p.first_name,
  p.last_name,
  ur.role
FROM public.profiles p
JOIN public.user_roles ur ON p.id = ur.user_id
WHERE ur.role = 'admin'::app_role;
