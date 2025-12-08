#!/bin/bash
# xBase Supabase Setup Script
# Usage: ./scripts/setup-supabase.sh

set -e

echo "==================================="
echo "  xBase Supabase Setup"
echo "==================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "Error: Supabase CLI is not installed"
  echo "Install it with: npm install -g supabase"
  exit 1
fi

# Check for project ref
if [ -z "$SUPABASE_PROJECT_REF" ]; then
  echo "Enter your Supabase project ref:"
  read -r SUPABASE_PROJECT_REF
fi

echo ""
echo "Step 1: Linking to Supabase project..."
supabase link --project-ref "$SUPABASE_PROJECT_REF"

echo ""
echo "Step 2: Setting up secrets..."
echo "You'll need to provide the following from Xaman Developer Console:"
echo ""
echo "Xahau Network:"
read -p "  XUMM_API_KEY (Xahau): " XUMM_API_KEY
read -p "  XUMM_API_SECRET (Xahau): " XUMM_API_SECRET
read -p "  XAH_DESTINATION (your XAH address): " XAH_DESTINATION

echo ""
echo "XRPL Network:"
read -p "  XUMM_API_KEY_XRPL: " XUMM_API_KEY_XRPL
read -p "  XUMM_API_SECRET_XRPL: " XUMM_API_SECRET_XRPL
read -p "  XRP_DESTINATION (your XRP address): " XRP_DESTINATION

echo ""
echo "Setting secrets..."
supabase secrets set \
  XUMM_API_KEY="$XUMM_API_KEY" \
  XUMM_API_SECRET="$XUMM_API_SECRET" \
  XAH_DESTINATION="$XAH_DESTINATION" \
  XUMM_API_KEY_XRPL="$XUMM_API_KEY_XRPL" \
  XUMM_API_SECRET_XRPL="$XUMM_API_SECRET_XRPL" \
  XRP_DESTINATION="$XRP_DESTINATION"

echo ""
echo "Step 3: Deploying Edge Functions..."
echo "  - xaman-createPayload (Xahau)"
supabase functions deploy xaman-createPayload

echo "  - xaman-createPayload-xrpl (XRPL)"
supabase functions deploy xaman-createPayload-xrpl

echo "  - xaman-status (unified for both networks)"
supabase functions deploy xaman-status

echo "  - xaman-webhook (payment notifications)"
supabase functions deploy xaman-webhook

echo ""
echo "==================================="
echo "  Supabase Setup Complete!"
echo "==================================="
echo ""
echo "Your Edge Functions are now deployed:"
echo "  ✓ xaman-createPayload (Xahau payments)"
echo "  ✓ xaman-createPayload-xrpl (XRPL payments)"
echo "  ✓ xaman-status (payment status checker)"
echo "  ✓ xaman-webhook (payment notifications)"
echo ""
echo "Secrets configured:"
echo "  ✓ Xahau: XUMM_API_KEY, XUMM_API_SECRET, XAH_DESTINATION"
echo "  ✓ XRPL: XUMM_API_KEY_XRPL, XUMM_API_SECRET_XRPL, XRP_DESTINATION"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env.local"
echo "  2. Add your Supabase URL and anon key to .env.local"
echo "  3. Run: pnpm dev"
echo ""
