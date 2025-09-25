-- Fix the security definer view issue
-- Recreate the public_profiles view without SECURITY DEFINER to avoid privilege escalation

DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true) AS
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
WHERE display_name IS NOT NULL OR first_name IS NOT NULL;