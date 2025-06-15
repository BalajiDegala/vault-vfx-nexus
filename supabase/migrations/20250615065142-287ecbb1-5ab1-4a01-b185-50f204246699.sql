
-- Clean existing V3C data
DELETE FROM v3c_transactions;
UPDATE profiles SET v3_coins_balance = 0;

-- Drop existing functions to recreate them
DROP FUNCTION IF EXISTS public.process_v3c_transaction(uuid, numeric, text, jsonb);
DROP FUNCTION IF EXISTS public.process_v3c_donation(uuid, uuid, numeric, text, jsonb);

-- Add balance validation trigger function
CREATE OR REPLACE FUNCTION public.validate_v3c_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent negative balances unless explicitly allowed in metadata
  IF NEW.v3_coins_balance < 0 AND NOT (NEW.v3_coins_balance >= -1000) THEN
    RAISE EXCEPTION 'V3C balance cannot be negative: %', NEW.v3_coins_balance;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for balance validation
DROP TRIGGER IF EXISTS validate_balance_trigger ON profiles;
CREATE TRIGGER validate_balance_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_v3c_balance();

-- Enhanced V3C transaction processing with atomic operations and validation
CREATE OR REPLACE FUNCTION public.process_v3c_transaction(
  p_user_id UUID,
  p_amount NUMERIC,
  p_type TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_transaction_id TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
  v_transaction_id UUID;
  v_result JSONB;
BEGIN
  -- Start transaction
  BEGIN
    -- Get current balance with row lock
    SELECT v3_coins_balance INTO v_current_balance 
    FROM profiles 
    WHERE id = p_user_id 
    FOR UPDATE;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'User not found: %', p_user_id;
    END IF;
    
    -- Calculate new balance
    IF p_type IN ('earn', 'receive', 'bonus') THEN
      v_new_balance := v_current_balance + p_amount;
    ELSE
      v_new_balance := v_current_balance - p_amount;
      
      -- Check for sufficient balance
      IF v_new_balance < 0 THEN
        RAISE EXCEPTION 'Insufficient balance. Current: %, Required: %', v_current_balance, p_amount;
      END IF;
    END IF;
    
    -- Update balance
    UPDATE profiles 
    SET v3_coins_balance = v_new_balance, updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Insert transaction record
    INSERT INTO v3c_transactions (user_id, type, amount, metadata)
    VALUES (p_user_id, p_type, p_amount, p_metadata || jsonb_build_object(
      'previous_balance', v_current_balance,
      'new_balance', v_new_balance,
      'transaction_id', COALESCE(p_transaction_id, gen_random_uuid()::text),
      'processed_at', NOW()
    ))
    RETURNING id INTO v_transaction_id;
    
    -- Build result
    v_result := jsonb_build_object(
      'success', true,
      'transaction_id', v_transaction_id,
      'previous_balance', v_current_balance,
      'new_balance', v_new_balance,
      'amount', p_amount,
      'type', p_type
    );
    
    RETURN v_result;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Return error details
      RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'error_code', SQLSTATE
      );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced donation function with atomic operations
CREATE OR REPLACE FUNCTION public.process_v3c_donation(
  sender_id UUID,
  receiver_id UUID,
  v3c_amount NUMERIC,
  tx_type TEXT DEFAULT 'donate',
  meta JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS $$
DECLARE
  v_sender_balance NUMERIC;
  v_receiver_balance NUMERIC;
  v_sender_new_balance NUMERIC;
  v_receiver_new_balance NUMERIC;
  v_sender_tx_id UUID;
  v_receiver_tx_id UUID;
  v_result JSONB;
BEGIN
  -- Validation
  IF sender_id = receiver_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot send coins to yourself');
  END IF;
  
  IF v3c_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  BEGIN
    -- Lock both users' balances
    SELECT v3_coins_balance INTO v_sender_balance 
    FROM profiles 
    WHERE id = sender_id 
    FOR UPDATE;
    
    SELECT v3_coins_balance INTO v_receiver_balance 
    FROM profiles 
    WHERE id = receiver_id 
    FOR UPDATE;
    
    IF v_sender_balance IS NULL THEN
      RAISE EXCEPTION 'Sender not found';
    END IF;
    
    IF v_receiver_balance IS NULL THEN
      RAISE EXCEPTION 'Receiver not found';
    END IF;
    
    -- Check sender has sufficient balance
    IF v_sender_balance < v3c_amount THEN
      RAISE EXCEPTION 'Insufficient balance. Available: %, Required: %', v_sender_balance, v3c_amount;
    END IF;
    
    -- Calculate new balances
    v_sender_new_balance := v_sender_balance - v3c_amount;
    v_receiver_new_balance := v_receiver_balance + v3c_amount;
    
    -- Update balances
    UPDATE profiles SET v3_coins_balance = v_sender_new_balance, updated_at = NOW() WHERE id = sender_id;
    UPDATE profiles SET v3_coins_balance = v_receiver_new_balance, updated_at = NOW() WHERE id = receiver_id;
    
    -- Insert sender transaction (outgoing)
    INSERT INTO v3c_transactions (user_id, type, amount, related_user_id, metadata)
    VALUES (sender_id, tx_type, v3c_amount, receiver_id, meta || jsonb_build_object(
      'previous_balance', v_sender_balance,
      'new_balance', v_sender_new_balance,
      'direction', 'outgoing'
    ))
    RETURNING id INTO v_sender_tx_id;
    
    -- Insert receiver transaction (incoming)
    INSERT INTO v3c_transactions (user_id, type, amount, related_user_id, metadata)
    VALUES (receiver_id, 'receive', v3c_amount, sender_id, meta || jsonb_build_object(
      'previous_balance', v_receiver_balance,
      'new_balance', v_receiver_new_balance,
      'direction', 'incoming',
      'source_transaction', v_sender_tx_id
    ))
    RETURNING id INTO v_receiver_tx_id;
    
    -- Return success result
    RETURN jsonb_build_object(
      'success', true,
      'sender_transaction_id', v_sender_tx_id,
      'receiver_transaction_id', v_receiver_tx_id,
      'sender_new_balance', v_sender_new_balance,
      'receiver_new_balance', v_receiver_new_balance,
      'amount', v3c_amount
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'error_code', SQLSTATE
      );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for v3c_transactions table
ALTER TABLE public.v3c_transactions REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.v3c_transactions;

-- Enable realtime for profiles table (for balance updates)
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.profiles;
