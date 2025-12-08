-- Create donations table for tracking XAH and XRP donations
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Payload and transaction info
  payload_uuid TEXT NOT NULL,
  tx_hash TEXT,
  
  -- Network and currency
  network TEXT NOT NULL CHECK (network IN ('xahau', 'xrpl')),
  currency TEXT NOT NULL CHECK (currency IN ('XAH', 'XRP')),
  
  -- Amount and sender
  amount NUMERIC NOT NULL CHECK (amount > 0),
  sender_address TEXT,
  
  -- Memo from donor
  memo TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Indexes for performance
  CONSTRAINT unique_payload_uuid UNIQUE (payload_uuid)
);

-- Create index on completed_at for feed queries
CREATE INDEX IF NOT EXISTS idx_donations_completed_at ON public.donations(completed_at DESC) 
WHERE status = 'completed';

-- Create index on network for filtering
CREATE INDEX IF NOT EXISTS idx_donations_network ON public.donations(network);

-- Enable Row Level Security
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to read completed donations only
CREATE POLICY "Allow public read completed donations" 
ON public.donations
FOR SELECT
USING (status = 'completed');

-- Policy: Allow service role to insert donations (from webhook)
CREATE POLICY "Allow service role insert" 
ON public.donations
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Policy: Allow service role to update donations (from webhook)
CREATE POLICY "Allow service role update" 
ON public.donations
FOR UPDATE
USING (auth.role() = 'service_role');

-- Add comment for documentation
COMMENT ON TABLE public.donations IS 'Tracks XAH and XRP donations made via Xaman wallet';
COMMENT ON COLUMN public.donations.payload_uuid IS 'UUID from Xaman payload creation';
COMMENT ON COLUMN public.donations.tx_hash IS 'On-ledger transaction hash once completed';
COMMENT ON COLUMN public.donations.network IS 'Network: xahau or xrpl';
COMMENT ON COLUMN public.donations.currency IS 'Currency: XAH or XRP';
COMMENT ON COLUMN public.donations.memo IS 'Optional memo from donor';
COMMENT ON COLUMN public.donations.status IS 'Status: pending, completed, or failed';
