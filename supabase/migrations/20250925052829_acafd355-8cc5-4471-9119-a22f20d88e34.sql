-- Clean up existing NULL user_id records and apply comprehensive security fixes

-- =============================================================================
-- 1. DATA CLEANUP - Remove orphaned financial records for security
-- =============================================================================

-- Delete records with NULL user_id as they represent a security risk
DELETE FROM public.deal_analyses WHERE user_id IS NULL;

-- =============================================================================
-- 2. FINANCIAL DATA SECURITY - Enforce user ownership
-- =============================================================================

-- Now make user_id NOT NULL to prevent future orphaned financial records
ALTER TABLE public.deal_analyses 
ALTER COLUMN user_id SET NOT NULL;

-- Add constraint to ensure financial data is always associated with a user
ALTER TABLE public.deal_analyses 
ADD CONSTRAINT deal_analyses_user_id_required 
CHECK (user_id IS NOT NULL);

-- =============================================================================
-- 3. ENHANCED RLS POLICIES FOR FINANCIAL DATA
-- =============================================================================

-- Create comprehensive financial data protection policies
DROP POLICY IF EXISTS "Financial data access restricted to owners" ON public.deal_analyses;
CREATE POLICY "Financial data access restricted to owners" 
ON public.deal_analyses 
FOR ALL 
USING (auth.uid() = user_id);

-- Ensure deal_history is also properly protected
DROP POLICY IF EXISTS "Deal history financial data restricted to owners" ON public.deal_history;
CREATE POLICY "Deal history financial data restricted to owners" 
ON public.deal_history 
FOR ALL 
USING (auth.uid() = user_id);

-- =============================================================================
-- 4. INPUT VALIDATION FUNCTIONS FOR SECURITY
-- =============================================================================

-- Create validation functions for financial data
CREATE OR REPLACE FUNCTION public.validate_financial_amount(amount text)
RETURNS boolean AS $$
BEGIN
  -- Ensure amount is reasonable and properly formatted
  RETURN amount IS NOT NULL AND 
         amount ~ '^[\$,0-9\.]+$' AND 
         (REPLACE(REPLACE(amount, '$', ''), ',', '')::numeric) BETWEEN 0 AND 999999999;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql 
IMMUTABLE 
SECURITY DEFINER 
SET search_path = public;

-- Create email validation function
CREATE OR REPLACE FUNCTION public.validate_email(email text)
RETURNS boolean AS $$
BEGIN
  RETURN email IS NOT NULL AND 
         email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND 
         length(email) <= 255;
END;
$$ LANGUAGE plpgsql 
IMMUTABLE 
SECURITY DEFINER 
SET search_path = public;

-- =============================================================================
-- 5. SENSITIVE DATA DOCUMENTATION
-- =============================================================================

-- Document sensitive financial fields
COMMENT ON COLUMN public.deal_analyses.annual_income IS 'SENSITIVE: Financial PII - access restricted to data owner only';
COMMENT ON COLUMN public.deal_analyses.bank_balance IS 'SENSITIVE: Financial PII - access restricted to data owner only';
COMMENT ON COLUMN public.deal_analyses.credit_score IS 'SENSITIVE: Financial PII - access restricted to data owner only';
COMMENT ON COLUMN public.deal_analyses.financial_assets IS 'SENSITIVE: Financial PII - access restricted to data owner only';
COMMENT ON COLUMN public.deal_analyses.funding_amount IS 'SENSITIVE: Financial PII - access restricted to data owner only';

COMMENT ON COLUMN public.deal_history.deal_value IS 'SENSITIVE: Financial data - access restricted to data owner only';
COMMENT ON COLUMN public.deal_history.profit_amount IS 'SENSITIVE: Financial data - access restricted to data owner only';

-- Document sensitive profile fields
COMMENT ON COLUMN public.profiles.email IS 'SENSITIVE PII: Email address - never expose in public queries';
COMMENT ON COLUMN public.profiles.phone IS 'SENSITIVE PII: Phone number - never expose in public queries';
COMMENT ON COLUMN public.profiles.linkedin_profile IS 'SENSITIVE PII: Social media profile - never expose in public queries';