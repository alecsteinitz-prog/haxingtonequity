-- Add columns to deal_analyses table for comparable sales data and adjustments
ALTER TABLE deal_analyses 
ADD COLUMN IF NOT EXISTS comps_data jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS adjusted_arv text,
ADD COLUMN IF NOT EXISTS adjusted_score integer,
ADD COLUMN IF NOT EXISTS comps_confidence integer DEFAULT 75;

-- Add comment explaining the new columns
COMMENT ON COLUMN deal_analyses.comps_data IS 'Array of comparable sales with address, sqft, price, status fields';
COMMENT ON COLUMN deal_analyses.adjusted_arv IS 'User-adjusted ARV after reviewing comps';
COMMENT ON COLUMN deal_analyses.adjusted_score IS 'Recalculated feasibility score after adjustments';
COMMENT ON COLUMN deal_analyses.comps_confidence IS 'Confidence meter 0-100 for comps reliability';