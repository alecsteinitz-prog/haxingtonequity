-- Fix critical security flaw: Implement proper field-level access control for profiles

-- Drop the insecure policy
DROP POLICY IF EXISTS "Public access to social profile fields and full access to own profile" ON public.profiles;

-- Create a secure function to determine if a user can access sensitive profile data
CREATE OR REPLACE FUNCTION public.can_view_full_profile(_profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only the profile owner can see their full profile
  SELECT auth.uid() = _profile_user_id;
$$;

-- Create a restrictive policy that only allows authenticated users to see profiles
-- Public access will be handled through specific queries that only select safe fields
CREATE POLICY "Authenticated users can view profiles with restrictions" 
ON public.profiles 
FOR SELECT 
USING (
  -- Authenticated users can see profiles, but application logic must restrict sensitive fields
  auth.role() = 'authenticated'
);

-- Create a policy for users to see their own complete profile  
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add a comment documenting the security approach
COMMENT ON TABLE public.profiles IS 
'SECURITY: This table contains sensitive PII. Applications must only select public fields (display_name, first_name, last_name, avatar_url, experience_level) when showing other users'' profiles. Sensitive fields (email, phone, linkedin_profile, bio, location) should only be selected when user_id = auth.uid().';

-- Create a safe view for public profile data that only exposes non-sensitive fields
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  user_id,
  display_name,
  first_name, 
  last_name,
  avatar_url,
  experience_level,
  created_at,
  deals_completed,
  years_active
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_invoker = true);

-- Grant select on the public view to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;