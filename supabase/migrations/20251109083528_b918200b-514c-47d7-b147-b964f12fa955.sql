-- Remove foreign key constraint to allow dev mode user ID
-- This allows development mode testing without requiring actual auth users

ALTER TABLE public.deal_analyses 
DROP CONSTRAINT IF EXISTS deal_analyses_user_id_fkey;

-- Note: In production, you would want to re-add this constraint
-- ALTER TABLE public.deal_analyses 
-- ADD CONSTRAINT deal_analyses_user_id_fkey 
-- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;