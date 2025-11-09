-- Drop the existing view
DROP VIEW IF EXISTS public.weekly_leaderboard;

-- Recreate view without SECURITY DEFINER (uses SECURITY INVOKER by default which is safe)
CREATE VIEW public.weekly_leaderboard 
WITH (security_invoker = true)
AS
SELECT 
  p.user_id,
  p.display_name,
  p.first_name,
  p.last_name,
  p.avatar_url,
  COUNT(da.id) as analyses_count
FROM public.profiles p
LEFT JOIN public.deal_analyses da ON da.user_id = p.user_id 
  AND da.created_at >= NOW() - INTERVAL '7 days'
GROUP BY p.user_id, p.display_name, p.first_name, p.last_name, p.avatar_url
HAVING COUNT(da.id) > 0
ORDER BY analyses_count DESC
LIMIT 10;