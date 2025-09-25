-- Fix critical security issue: Remove overly permissive profile viewing policy
-- This policy currently allows any authenticated user to view all profiles with sensitive data

-- Drop the problematic policy that allows all authenticated users to view profiles
DROP POLICY IF EXISTS "Authenticated users can view profiles with restrictions" ON public.profiles;

-- The policy "Users can view their own complete profile" already exists and is secure
-- Now users can only see their own complete profile with sensitive data

-- Since public_profiles is a view, we need to make sure it only shows non-sensitive data
-- Let's check what the view definition is and recreate it if needed to ensure it's safe

-- Create a secure view for public profile information (dropping and recreating to ensure it's safe)
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT 
  user_id,
  display_name,
  first_name,
  last_name,
  avatar_url,
  experience_level,
  years_active,
  deals_completed,
  created_at
FROM public.profiles
WHERE display_name IS NOT NULL OR first_name IS NOT NULL; -- Only show profiles that have some public info

-- Grant access to the view for all authenticated users (safe since it only contains non-sensitive data)
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;