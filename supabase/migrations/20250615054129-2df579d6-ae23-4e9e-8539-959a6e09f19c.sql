
-- Drop existing RLS policies on v3c_transactions
DROP POLICY IF EXISTS "Users can select their own transactions" ON public.v3c_transactions;
DROP POLICY IF EXISTS "Users can insert their own transaction" ON public.v3c_transactions;
DROP POLICY IF EXISTS "Users can update their own transaction" ON public.v3c_transactions;
DROP POLICY IF EXISTS "Users can delete their own transaction" ON public.v3c_transactions;

-- Create new RLS policies that allow admin access
CREATE POLICY "Users can view their own transactions or admins can view all" 
  ON public.v3c_transactions 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Allow users to insert their own transactions OR admins to insert any transaction
CREATE POLICY "Users can insert their own transactions or admins can insert any" 
  ON public.v3c_transactions 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Allow users to update their own transactions OR admins to update any
CREATE POLICY "Users can update their own transactions or admins can update any" 
  ON public.v3c_transactions 
  FOR UPDATE 
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Allow users to delete their own transactions OR admins to delete any
CREATE POLICY "Users can delete their own transactions or admins can delete any" 
  ON public.v3c_transactions 
  FOR DELETE 
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin'::app_role)
  );
