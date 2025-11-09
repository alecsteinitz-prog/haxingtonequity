-- Create a temporary RLS policy to allow development mode inserts
-- This allows the dev user ID to bypass authentication checks for testing

-- Drop existing restrictive policies temporarily
DROP POLICY IF EXISTS "Users can create their own deal analyses" ON public.deal_analyses;
DROP POLICY IF EXISTS "Financial data access restricted to owners" ON public.deal_analyses;

-- Create permissive policy for inserts that allows dev mode
CREATE POLICY "Allow inserts for authenticated and dev users"
ON public.deal_analyses
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  OR user_id = '00000000-0000-0000-0000-000000000001'::uuid
);

-- Recreate select policy with dev mode support
CREATE POLICY "Users can view their own analyses or dev mode"
ON public.deal_analyses
FOR SELECT
USING (
  auth.uid() = user_id 
  OR user_id = '00000000-0000-0000-0000-000000000001'::uuid
);

-- Recreate update policy with dev mode support
CREATE POLICY "Users can update their own analyses or dev mode"
ON public.deal_analyses
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR user_id = '00000000-0000-0000-0000-000000000001'::uuid
);

-- Recreate delete policy with dev mode support
CREATE POLICY "Users can delete their own analyses or dev mode"
ON public.deal_analyses
FOR DELETE
USING (
  auth.uid() = user_id 
  OR user_id = '00000000-0000-0000-0000-000000000001'::uuid
);