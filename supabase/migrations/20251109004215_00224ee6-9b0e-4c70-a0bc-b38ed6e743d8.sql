-- Create user_badges table to track user achievements
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress INTEGER NOT NULL DEFAULT 0,
  target INTEGER NOT NULL,
  is_earned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_badge UNIQUE(user_id, badge_type)
);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own badges"
  ON public.user_badges
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
  ON public.user_badges
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own badges"
  ON public.user_badges
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create view for leaderboard (weekly top analyzers)
CREATE OR REPLACE VIEW public.weekly_leaderboard AS
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

-- Grant access to the view
GRANT SELECT ON public.weekly_leaderboard TO authenticated;

-- Create function to update badge progress
CREATE OR REPLACE FUNCTION public.update_badge_progress(
  p_user_id UUID,
  p_badge_type TEXT,
  p_progress INTEGER,
  p_target INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_earned BOOLEAN;
BEGIN
  v_is_earned := p_progress >= p_target;
  
  INSERT INTO public.user_badges (user_id, badge_type, progress, target, is_earned)
  VALUES (p_user_id, p_badge_type, p_progress, p_target, v_is_earned)
  ON CONFLICT (user_id, badge_type)
  DO UPDATE SET
    progress = p_progress,
    target = p_target,
    is_earned = v_is_earned,
    earned_at = CASE 
      WHEN NOT user_badges.is_earned AND v_is_earned THEN NOW()
      ELSE user_badges.earned_at
    END,
    updated_at = NOW();
END;
$$;

-- Create trigger to update badges when deal analyses are created
CREATE OR REPLACE FUNCTION public.check_analysis_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_analyses_count INTEGER;
BEGIN
  -- Count total analyses for this user
  SELECT COUNT(*) INTO v_analyses_count
  FROM public.deal_analyses
  WHERE user_id = NEW.user_id;
  
  -- Update "First Analyzed Deal" badge
  PERFORM public.update_badge_progress(NEW.user_id, 'first_analyzed_deal', v_analyses_count, 1);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_deal_analysis_created
  AFTER INSERT ON public.deal_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.check_analysis_badges();

-- Create trigger to update badges when posts are created
CREATE OR REPLACE FUNCTION public.check_post_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_posts_count INTEGER;
BEGIN
  -- Count total posts for this user
  SELECT COUNT(*) INTO v_posts_count
  FROM public.posts
  WHERE user_id = NEW.user_id;
  
  -- Update "5 Deals Shared in Community" badge
  PERFORM public.update_badge_progress(NEW.user_id, 'deals_shared', v_posts_count, 5);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_post_created
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.check_post_badges();

-- Add index for performance
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_user_badges_badge_type ON public.user_badges(badge_type);
CREATE INDEX idx_deal_analyses_created_at ON public.deal_analyses(created_at);

-- Add trigger for updated_at
CREATE TRIGGER update_user_badges_updated_at
  BEFORE UPDATE ON public.user_badges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();