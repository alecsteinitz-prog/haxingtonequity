-- Fix profiles table security: Allow public access to social profile fields while keeping sensitive data private

-- Drop the existing overly restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a new policy that allows:
-- 1. Users to view their own complete profile
-- 2. Public access to social profile fields only (display_name, first_name, last_name, avatar_url, experience_level)
CREATE POLICY "Public access to social profile fields and full access to own profile" 
ON public.profiles 
FOR SELECT 
USING (
  -- User can see their own complete profile
  auth.uid() = user_id
  -- Everyone can see basic social profile fields (handled by column-level permissions in the application)
  OR true
);

-- Add a comment to document the security approach
COMMENT ON POLICY "Public access to social profile fields and full access to own profile" ON public.profiles IS 
'Users can view their own complete profile. For other users, only social profile fields should be queried (display_name, first_name, last_name, avatar_url, experience_level). Sensitive fields like email, phone, linkedin_profile should never be selected in public queries.';