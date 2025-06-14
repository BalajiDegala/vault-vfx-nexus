
-- Add process_v3c_donation: Transfer V3C between two users atomically
CREATE OR REPLACE FUNCTION public.process_v3c_donation(
  sender_id UUID,
  receiver_id UUID,
  v3c_amount NUMERIC,
  tx_type TEXT,
  meta JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
DECLARE
BEGIN
  -- Decrement sender balance
  UPDATE profiles SET v3_coins_balance = v3_coins_balance - v3c_amount WHERE id = sender_id;
  -- Increment receiver balance
  UPDATE profiles SET v3_coins_balance = v3_coins_balance + v3c_amount WHERE id = receiver_id;
  -- Insert record for sender (negative)
  INSERT INTO v3c_transactions (user_id, type, amount, related_user_id, metadata)
    VALUES (sender_id, tx_type, v3c_amount, receiver_id, meta);
  -- Insert record for receiver (positive, type=earn)
  INSERT INTO v3c_transactions (user_id, type, amount, related_user_id, metadata)
    VALUES (receiver_id, 'earn', v3c_amount, sender_id, meta);
END;
$$ LANGUAGE plpgsql;

-- Add process_v3c_transaction: Earn/Spend coins (direct user)
CREATE OR REPLACE FUNCTION public.process_v3c_transaction(
  p_user_id UUID,
  p_amount NUMERIC,
  p_type TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
  IF p_type IN ('earn') THEN
    UPDATE profiles SET v3_coins_balance = v3_coins_balance + p_amount WHERE id = p_user_id;
  ELSE
    UPDATE profiles SET v3_coins_balance = v3_coins_balance - p_amount WHERE id = p_user_id;
  END IF;
  INSERT INTO v3c_transactions (user_id, type, amount, metadata)
    VALUES (p_user_id, p_type, p_amount, p_metadata);
END;
$$ LANGUAGE plpgsql;
