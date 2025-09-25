-- Create user interaction tracking tables for recommendation algorithm

-- Table to track user interactions with posts (for personalization)
CREATE TABLE IF NOT EXISTS public.user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'save', 'share', 'dwell_time')),
  interaction_value NUMERIC DEFAULT 1, -- For dwell time (seconds), or weighted values
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id, interaction_type)
);

-- Enable RLS
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_interactions (drop existing if they exist)
DROP POLICY IF EXISTS "Users can view their own interactions" ON public.user_interactions;
DROP POLICY IF EXISTS "Users can create their own interactions" ON public.user_interactions;
DROP POLICY IF EXISTS "Users can update their own interactions" ON public.user_interactions;

CREATE POLICY "Users can view their own interactions" 
ON public.user_interactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interactions" 
ON public.user_interactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions" 
ON public.user_interactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Table to track user preferences and interests (derived from interactions)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  preferred_strategies JSONB DEFAULT '{}', -- {"fix_and_flip": 0.8, "brrrr": 0.3, "wholesale": 0.1}
  preferred_topics JSONB DEFAULT '{}', -- {"financing": 0.9, "rehab": 0.7}
  engagement_patterns JSONB DEFAULT '{}', -- Time-based engagement data
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_preferences
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;

CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR ALL 
USING (auth.uid() = user_id);

-- Add strategy categorization to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS strategy_tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS content_topics JSONB DEFAULT '[]';

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_post_id ON public.user_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON public.user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON public.user_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_strategy_tags ON public.posts USING GIN(strategy_tags);
CREATE INDEX IF NOT EXISTS idx_posts_content_topics ON public.posts USING GIN(content_topics);

-- Function to update user preferences based on interactions
CREATE OR REPLACE FUNCTION public.update_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  -- Update preferences when new interaction is added
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) 
  DO UPDATE SET last_updated = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update preferences on new interactions
DROP TRIGGER IF EXISTS update_preferences_on_interaction ON public.user_interactions;
CREATE TRIGGER update_preferences_on_interaction
  AFTER INSERT ON public.user_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_preferences();