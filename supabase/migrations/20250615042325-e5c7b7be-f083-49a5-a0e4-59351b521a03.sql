
-- First, let's check if the user exists in auth.users
SELECT email FROM auth.users WHERE email = 'balajidaws@gmail.com';

-- Create a profile if it doesn't exist and assign admin role
DO $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'balajidaws@gmail.com';
    
    IF user_uuid IS NOT NULL THEN
        -- Insert profile if it doesn't exist
        INSERT INTO public.profiles (id, email, created_at, updated_at)
        VALUES (user_uuid, 'balajidaws@gmail.com', now(), now())
        ON CONFLICT (id) DO UPDATE SET 
            email = EXCLUDED.email,
            updated_at = now();
            
        -- Insert admin role if it doesn't exist
        INSERT INTO public.user_roles (user_id, role)
        VALUES (user_uuid, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Admin role assigned successfully to %', 'balajidaws@gmail.com';
    ELSE
        RAISE NOTICE 'User % not found in auth.users. Please sign up first.', 'balajidaws@gmail.com';
    END IF;
END $$;

-- Verify the assignment
SELECT 
    p.email,
    ur.role,
    ur.created_at
FROM public.profiles p
JOIN public.user_roles ur ON p.id = ur.user_id
WHERE p.email = 'balajidaws@gmail.com' AND ur.role = 'admin'::app_role;
