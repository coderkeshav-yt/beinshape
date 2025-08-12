
-- Create a table for coupons
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to coupons table
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Create policy that allows admins to manage coupons
CREATE POLICY "Admins can manage coupons" 
  ON public.coupons 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Create policy that allows users to view active coupons
CREATE POLICY "Users can view active coupons" 
  ON public.coupons 
  FOR SELECT 
  USING (is_active = true);

-- Create a function to increment coupon usage
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.coupons 
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE code = coupon_code AND is_active = true;
END;
$$;
