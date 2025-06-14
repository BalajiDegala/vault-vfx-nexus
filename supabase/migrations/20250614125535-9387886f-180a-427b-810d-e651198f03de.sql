
-- Create the v3c_transactions table for V3Coin transfers and history
CREATE TABLE public.v3c_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  related_user_id UUID,
  project_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add an index for faster queries by user
CREATE INDEX idx_v3c_transactions_user_id ON public.v3c_transactions(user_id);

-- Enable Row-Level Security
ALTER TABLE public.v3c_transactions ENABLE ROW LEVEL SECURITY;

-- Allow each user to view only their own transactions
CREATE POLICY "Users can select their own transactions" 
  ON public.v3c_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow inserting only their own transactions (used by Supabase functions)
CREATE POLICY "Users can insert their own transaction" 
  ON public.v3c_transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow updating and deleting only their own transactions (optional: for admin use)
CREATE POLICY "Users can update their own transaction" 
  ON public.v3c_transactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transaction" 
  ON public.v3c_transactions 
  FOR DELETE 
  USING (auth.uid() = user_id);
