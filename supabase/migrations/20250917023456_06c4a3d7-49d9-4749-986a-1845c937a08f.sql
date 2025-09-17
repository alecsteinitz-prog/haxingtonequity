-- Create table for deal analysis history
CREATE TABLE public.deal_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  funding_amount TEXT NOT NULL,
  funding_purpose TEXT NOT NULL,
  property_type TEXT NOT NULL,
  property_details TEXT,
  properties_count TEXT NOT NULL,
  credit_score TEXT NOT NULL,
  bank_balance TEXT,
  annual_income TEXT,
  income_sources TEXT,
  financial_assets TEXT[],
  property_address TEXT NOT NULL,
  property_info TEXT,
  property_specific_info TEXT,
  under_contract BOOLEAN,
  owns_other_properties BOOLEAN,
  current_value TEXT,
  repairs_needed BOOLEAN,
  repair_level TEXT,
  rehab_costs TEXT,
  arv_estimate TEXT,
  close_timeline DATE,
  money_plans TEXT,
  past_deals BOOLEAN,
  last_deal_profit TEXT,
  good_deal_criteria TEXT,
  analysis_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.deal_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for user access (for now allowing public access, will need auth later)
CREATE POLICY "Anyone can view deal analyses" 
ON public.deal_analyses 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create deal analyses" 
ON public.deal_analyses 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_deal_analyses_updated_at
BEFORE UPDATE ON public.deal_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();