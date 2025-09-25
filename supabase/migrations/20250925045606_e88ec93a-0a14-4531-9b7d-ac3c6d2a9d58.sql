-- Fix critical security issue: Replace public RLS policies with user-specific policies for deal_analyses table

-- Drop the existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can create deal analyses" ON public.deal_analyses;
DROP POLICY IF EXISTS "Anyone can view deal analyses" ON public.deal_analyses;

-- Create secure user-specific policies
CREATE POLICY "Users can create their own deal analyses" 
ON public.deal_analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own deal analyses" 
ON public.deal_analyses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own deal analyses" 
ON public.deal_analyses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deal analyses" 
ON public.deal_analyses 
FOR DELETE 
USING (auth.uid() = user_id);