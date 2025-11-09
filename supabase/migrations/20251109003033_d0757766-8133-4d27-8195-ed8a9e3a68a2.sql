-- Create validation_logs table for tracking data quality issues
CREATE TABLE public.validation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('lender_match', 'deal_analysis', 'recommendation')),
  validation_status TEXT NOT NULL CHECK (validation_status IN ('passed', 'warning', 'failed')),
  issues JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback_submissions table
CREATE TABLE public.feedback_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_id UUID,
  feedback_type TEXT NOT NULL,
  notes TEXT,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_settings table for admin toggles
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  data_review_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.validation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for validation_logs (admin only)
CREATE POLICY "Admins can view all validation logs"
ON public.validation_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert validation logs"
ON public.validation_logs
FOR INSERT
WITH CHECK (true);

-- RLS Policies for feedback_submissions
CREATE POLICY "Users can view their own feedback"
ON public.feedback_submissions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can submit feedback"
ON public.feedback_submissions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
ON public.feedback_submissions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update feedback status"
ON public.feedback_submissions
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for admin_settings
CREATE POLICY "Users can view their own admin settings"
ON public.admin_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage their own settings"
ON public.admin_settings
FOR ALL
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_validation_logs_analysis_id ON public.validation_logs(analysis_id);
CREATE INDEX idx_validation_logs_created_at ON public.validation_logs(created_at DESC);
CREATE INDEX idx_validation_logs_status ON public.validation_logs(validation_status);
CREATE INDEX idx_feedback_submissions_user_id ON public.feedback_submissions(user_id);
CREATE INDEX idx_feedback_submissions_status ON public.feedback_submissions(status);
CREATE INDEX idx_feedback_submissions_created_at ON public.feedback_submissions(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_feedback_submissions_updated_at
BEFORE UPDATE ON public.feedback_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create validation function
CREATE OR REPLACE FUNCTION public.validate_analysis_data(
  p_analysis_id UUID,
  p_analysis_type TEXT,
  p_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_issues JSONB := '[]'::jsonb;
  v_status TEXT := 'passed';
  v_log_id UUID;
BEGIN
  -- Validate based on analysis type
  IF p_analysis_type = 'deal_analysis' THEN
    -- Check for missing critical fields
    IF p_data->>'property_address' IS NULL OR p_data->>'property_address' = '' THEN
      v_issues := v_issues || jsonb_build_object('field', 'property_address', 'issue', 'missing', 'severity', 'high');
      v_status := 'failed';
    END IF;
    
    IF p_data->>'purchase_price' IS NULL THEN
      v_issues := v_issues || jsonb_build_object('field', 'purchase_price', 'issue', 'missing', 'severity', 'high');
      v_status := 'failed';
    END IF;
    
    -- Validate price per sqft consistency
    IF p_data->>'purchase_price' IS NOT NULL AND p_data->>'square_footage' IS NOT NULL THEN
      DECLARE
        v_price NUMERIC := (p_data->>'purchase_price')::NUMERIC;
        v_sqft NUMERIC := (p_data->>'square_footage')::NUMERIC;
        v_price_per_sqft NUMERIC;
        v_reported_ppsf NUMERIC := COALESCE((p_data->>'price_per_sqft')::NUMERIC, 0);
      BEGIN
        IF v_sqft > 0 THEN
          v_price_per_sqft := v_price / v_sqft;
          -- Check if reported price per sqft is significantly different (>10% variance)
          IF v_reported_ppsf > 0 AND ABS(v_price_per_sqft - v_reported_ppsf) / v_reported_ppsf > 0.1 THEN
            v_issues := v_issues || jsonb_build_object(
              'field', 'price_per_sqft', 
              'issue', 'inconsistent', 
              'severity', 'medium',
              'details', format('Calculated: %s, Reported: %s', v_price_per_sqft, v_reported_ppsf)
            );
            IF v_status = 'passed' THEN v_status := 'warning'; END IF;
          END IF;
        END IF;
      END;
    END IF;
    
    -- Check for outlier values
    IF p_data->>'purchase_price' IS NOT NULL THEN
      DECLARE v_price NUMERIC := (p_data->>'purchase_price')::NUMERIC;
      BEGIN
        IF v_price <= 0 OR v_price > 50000000 THEN
          v_issues := v_issues || jsonb_build_object('field', 'purchase_price', 'issue', 'outlier', 'severity', 'high');
          v_status := 'failed';
        END IF;
      END;
    END IF;
    
    -- Validate numeric fields
    IF p_data->>'rehab_budget' IS NOT NULL THEN
      BEGIN
        DECLARE v_rehab NUMERIC := (p_data->>'rehab_budget')::NUMERIC;
        BEGIN
          IF v_rehab < 0 THEN
            v_issues := v_issues || jsonb_build_object('field', 'rehab_budget', 'issue', 'invalid_number', 'severity', 'high');
            v_status := 'failed';
          END IF;
        EXCEPTION WHEN OTHERS THEN
          v_issues := v_issues || jsonb_build_object('field', 'rehab_budget', 'issue', 'invalid_format', 'severity', 'high');
          v_status := 'failed';
        END;
      END;
    END IF;
    
  ELSIF p_analysis_type = 'lender_match' THEN
    -- Validate lender matching data
    IF p_data->>'loan_amount' IS NULL THEN
      v_issues := v_issues || jsonb_build_object('field', 'loan_amount', 'issue', 'missing', 'severity', 'high');
      v_status := 'failed';
    END IF;
    
    IF p_data->>'credit_score' IS NOT NULL THEN
      DECLARE v_credit INTEGER := (p_data->>'credit_score')::INTEGER;
      BEGIN
        IF v_credit < 300 OR v_credit > 850 THEN
          v_issues := v_issues || jsonb_build_object('field', 'credit_score', 'issue', 'outlier', 'severity', 'high');
          v_status := 'failed';
        END IF;
      EXCEPTION WHEN OTHERS THEN
        v_issues := v_issues || jsonb_build_object('field', 'credit_score', 'issue', 'invalid_format', 'severity', 'high');
        v_status := 'failed';
      END;
    END IF;
  END IF;
  
  -- Insert validation log
  INSERT INTO public.validation_logs (analysis_id, analysis_type, validation_status, issues, metadata)
  VALUES (p_analysis_id, p_analysis_type, v_status, v_issues, p_data)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;