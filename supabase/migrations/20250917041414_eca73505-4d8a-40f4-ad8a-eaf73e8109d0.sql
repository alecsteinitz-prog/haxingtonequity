-- Create storage bucket for profile avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update profiles table with new profile fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'first_deal';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS property_focus TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS actively_seeking_funding BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS funding_eligibility_score INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_eligibility_update TIMESTAMP WITH TIME ZONE;

-- Create deal_history table for storing user's past deals
CREATE TABLE IF NOT EXISTS public.deal_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  property_type TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  deal_status TEXT NOT NULL CHECK (deal_status IN ('closed', 'pending', 'analysis')),
  deal_value DECIMAL,
  profit_amount DECIMAL,
  close_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on deal_history
ALTER TABLE public.deal_history ENABLE ROW LEVEL SECURITY;

-- Create policies for deal_history
CREATE POLICY "Users can view their own deal history" 
ON public.deal_history 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own deal history" 
ON public.deal_history 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own deal history" 
ON public.deal_history 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own deal history" 
ON public.deal_history 
FOR DELETE 
USING (user_id = auth.uid());

-- Add trigger for updated_at on deal_history
CREATE TRIGGER update_deal_history_updated_at
BEFORE UPDATE ON public.deal_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add constraints and indexes
CREATE INDEX IF NOT EXISTS idx_deal_history_user_id ON public.deal_history(user_id);
CREATE INDEX IF NOT EXISTS idx_deal_history_deal_status ON public.deal_history(deal_status);

-- Update the handle_new_user function to include new profile fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    email, 
    first_name, 
    last_name,
    display_name,
    experience_level,
    actively_seeking_funding
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    'first_deal',
    true
  );
  
  -- Assign default investor role
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (NEW.id, 'investor');
  
  RETURN NEW;
END;
$function$;