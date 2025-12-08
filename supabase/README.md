# Supabase Edge Functions for xBase

This directory contains Deno-based Supabase Edge Functions for handling Xaman wallet transactions on both Xahau and XRPL networks.

## Functions Overview

### xaman-createPayload (Xahau Network)
Creates Xaman payment payloads for XAH donations on the Xahau network (NetworkID: 21337).

**Endpoint:** `https://YOUR_PROJECT_REF.supabase.co/functions/v1/xaman-createPayload`

### xaman-createPayload-xrpl (XRPL Network)
Creates Xaman payment payloads for XRP donations on the XRPL mainnet (NetworkID: 0 or 1).

**Endpoint:** `https://YOUR_PROJECT_REF.supabase.co/functions/v1/xaman-createPayload-xrpl`

### xaman-status (Unified Status Checker)
Polls Xaman API to check payload status for both Xahau and XRPL transactions. Returns transaction hash, network type, and explorer URL using the Xumm explorer launchpad format.

**Endpoint:** `https://YOUR_PROJECT_REF.supabase.co/functions/v1/xaman-status?payloadId={uuid}`

**Note:** This single status function works for both networks since Xaman payload UUIDs are network-agnostic.

### xaman-webhook (Transaction Verification)
Handles Xaman delivery callbacks, verifies transactions, and stores completed donations in the database.

**Endpoint:** `https://YOUR_PROJECT_REF.supabase.co/functions/v1/xaman-webhook`

---

## Required Secrets

Set these in **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**:

### For Xahau Network:
- `XUMM_API_KEY` - Your Xaman API key for Xahau
- `XUMM_API_SECRET` - Your Xaman API secret for Xahau
- `XAH_DESTINATION` - The destination r-address for XAH donations

### For XRPL Network:
- `XUMM_API_KEY_XRPL` - Your Xaman API key for XRPL (can be same as Xahau)
- `XUMM_API_SECRET_XRPL` - Your Xaman API secret for XRPL (can be same as Xahau)
- `XRP_DESTINATION` - The destination r-address for XRP donations

### Database Access:
- `SUPABASE_URL` - Your Supabase project URL (auto-available in Edge Functions)

**Note:** You can use the same Xaman API credentials for both networks, or separate credentials if you have different apps registered.

---

## Quick Setup

### 1. Get Xaman API Credentials

Visit **https://apps.xaman.dev** and create an app to get your API key and secret.

### 2. Set Secrets via Supabase CLI

\`\`\`bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Set Xahau secrets
supabase secrets set XUMM_API_KEY=your_xahau_api_key
supabase secrets set XUMM_API_SECRET=your_xahau_api_secret
supabase secrets set XAH_DESTINATION=rYourXahauDestinationAddress

# Set XRPL secrets
supabase secrets set XUMM_API_KEY_XRPL=your_xrpl_api_key
supabase secrets set XUMM_API_SECRET_XRPL=your_xrpl_api_secret
supabase secrets set XRP_DESTINATION=rYourXRPLDestinationAddress
\`\`\`

### 3. Deploy Edge Functions

\`\`\`bash
# Deploy all functions
supabase functions deploy xaman-createPayload
supabase functions deploy xaman-createPayload-xrpl
supabase functions deploy xaman-status
supabase functions deploy xaman-webhook
\`\`\`

---

## Local Development

### Start Local Supabase

\`\`\`bash
# Initialize Supabase (if not already done)
supabase init

# Start local Supabase stack
supabase start
\`\`\`

### Create Local Environment File

\`\`\`bash
# Create .env file for local development
cat > supabase/functions/.env << EOF
XUMM_API_KEY=your_xahau_api_key
XUMM_API_SECRET=your_xahau_api_secret
XAH_DESTINATION=rYourXahauDestinationAddress
XUMM_API_KEY_XRPL=your_xrpl_api_key
XUMM_API_SECRET_XRPL=your_xrpl_api_secret
XRP_DESTINATION=rYourXRPLDestinationAddress
SUPABASE_URL=http://localhost:54321
EOF
\`\`\`

### Serve Functions Locally

\`\`\`bash
supabase functions serve --env-file supabase/functions/.env
\`\`\`

Functions will be available at:
- `http://127.0.0.1:54321/functions/v1/xaman-createPayload`
- `http://127.0.0.1:54321/functions/v1/xaman-createPayload-xrpl`
- `http://127.0.0.1:54321/functions/v1/xaman-status`
- `http://127.0.0.1:54321/functions/v1/xaman-webhook`

---

## Testing

### Test Xahau Payload Creation

\`\`\`bash
curl -X POST http://127.0.0.1:54321/functions/v1/xaman-createPayload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"amount": 10, "memo": "Test XAH donation"}'
\`\`\`

Expected response:
\`\`\`json
{
  "ok": true,
  "uuid": "7a97be3d-fa02-414d-9fce-d6a6c7763a12",
  "nextUrl": "https://xumm.app/sign/7a97be3d-fa02-414d-9fce-d6a6c7763a12",
  "qrUrl": "https://xumm.app/sign/7a97be3d-fa02-414d-9fce-d6a6c7763a12_q.png",
  "websocketUrl": "wss://xumm.app/sign/7a97be3d-fa02-414d-9fce-d6a6c7763a12"
}
\`\`\`

### Test XRPL Payload Creation

\`\`\`bash
curl -X POST http://127.0.0.1:54321/functions/v1/xaman-createPayload-xrpl \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"amount": 10, "memo": "Test XRP donation"}'
\`\`\`

### Test Status Checker

\`\`\`bash
curl "http://127.0.0.1:54321/functions/v1/xaman-status?payloadId=7a97be3d-fa02-414d-9fce-d6a6c7763a12" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
\`\`\`

Expected response:
\`\`\`json
{
  "signed": true,
  "rejected": false,
  "expired": false,
  "txid": "ABC123...",
  "network": "xahau",
  "explorerUrl": "https://xumm.app/explorer/xahau/ABC123..."
}
\`\`\`

### Test Production Endpoints

Replace `http://127.0.0.1:54321` with `https://YOUR_PROJECT_REF.supabase.co` to test deployed functions.

---

## Webhook Setup

1. Go to **Xaman Developer Console** → **Your App** → **Webhooks**
2. Add webhook URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/xaman-webhook`
3. Enable **Payload delivery notifications**
4. Save settings

When a user signs a transaction in Xaman, the webhook will automatically:
- Verify the transaction (network, destination, amount, success)
- Store the donation in your Supabase `donations` table
- Make it available in the live donation feed

---

## Database Migration

Before deploying Edge Functions:
1. Apply the database migration:

\`\`\`bash
supabase db push
\`\`\`

This creates the `donations` table with Row Level Security (RLS) policies.

---

## Monitoring

### View Function Logs

\`\`\`bash
# Real-time logs
supabase functions logs --tail

# Specific function
supabase functions logs xaman-createPayload --tail

# Production logs (in Supabase Dashboard)
# Go to Edge Functions → Select function → Logs tab
\`\`\`

### Common Issues

**Problem:** "Missing XUMM_API_KEY or XUMM_API_SECRET in Supabase secrets"

**Solution:** Verify secrets are set:
\`\`\`bash
supabase secrets list
\`\`\`

**Problem:** "Xaman API error: 400"

**Solution:** Check that:
- API credentials are valid at https://apps.xaman.dev
- Destination addresses are valid r-addresses
- Network configuration matches (Xahau vs XRPL)

**Problem:** "Failed to insert donation into database"

**Solution:** 
- Verify database migration is applied
- Check RLS policies allow inserts from Edge Functions
- Review Edge Function logs for specific error

---

## Security Notes

All Edge Functions run in a secure Deno runtime with:
- Isolated execution environment
- No access to frontend code or user data
- Secrets stored in Supabase Vault (encrypted at rest)
- CORS headers configured for your domain only

**Never expose:**
- `XUMM_API_KEY` / `XUMM_API_SECRET` in frontend code
- `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Edge Function secrets in Docker containers

---

## Next Steps

After deploying Edge Functions:
1. Test payload creation from your Next.js app
2. Complete a test donation and verify webhook receives it
3. Check donation appears in database and live feed
4. Monitor Edge Function logs for any errors
5. Deploy Docker container with Supabase credentials

For Docker deployment, see `DOCKER.md` in the root directory.

---

## Visual Flow Diagram

\`\`\`
┌──────────────────────────────────────────────────────────────────┐
│                    USER DONATES 10 XAH                           │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ POST /api/auth/xaman/create-payload/xahau-payload
                         │ Body: { amount: 10, memo: "Thanks!" }
                         │
                         ↓
┌──────────────────────────────────────────────────────────────────┐
│  EDGE FUNCTION: xaman-createPayload (Deno on Supabase)          │
│                                                                  │
│  1. Get secrets from Vault:                                     │
│     • XUMM_API_KEY                                              │
│     • XUMM_API_SECRET                                           │
│     • XAH_DESTINATION                                           │
│                                                                  │
│  2. Build Xahau transaction:                                    │
│     {                                                            │
│       TransactionType: "Payment",                               │
│       Destination: "rYourXahauAddress...",                      │
│       Amount: "10000000", // drops                              │
│       NetworkID: 21337    // Xahau mainnet                      │
│     }                                                            │
│                                                                  │
│  3. Call Xaman API:                                             │
│     POST https://xumm.app/api/v1/platform/payload              │
│     Headers: { X-API-Key, X-API-Secret }                        │
│                                                                  │
│  4. Return to frontend:                                         │
│     {                                                            │
│       uuid: "abc-123",                                          │
│       qrUrl: "https://xumm.app/sign/...",                       │
│       websocketUrl: "wss://..."                                 │
│     }                                                            │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ QR code shown to user
                         │
                         ↓
┌──────────────────────────────────────────────────────────────────┐
│  USER SCANS QR → XAMAN APP → SIGNS TRANSACTION                  │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ Transaction submitted to blockchain
                         │
                         ↓
┌──────────────────────────────────────────────────────────────────┐
│  XAHAU BLOCKCHAIN CONFIRMS (3-5 seconds)                         │
│  • Validators process transaction                                │
│  • Transaction hash (txid) generated                             │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ Webhook fires
                         │
                         ↓
┌──────────────────────────────────────────────────────────────────┐
│  EDGE FUNCTION: xaman-webhook                                    │
│                                                                  │
│  1. Receives payload from Xaman:                                │
│     {                                                            │
│       meta: { uuid, from_account },                             │
│       response: { signed: true, txid: "ABC123..." }             │
│     }                                                            │
│                                                                  │
│  2. Parses network from NetworkID:                              │
│     • 21337 = Xahau                                             │
│     • else = XRPL                                               │
│                                                                  │
│  3. Inserts into database:                                      │
│     INSERT INTO donations (                                     │
│       wallet_address, amount, currency,                         │
│       network, transaction_hash, memo                           │
│     )                                                            │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ Donation saved!
                         │
                         ↓
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND POLLS: GET /api/donations                              │
│  • Fetches latest donations from database                       │
│  • Updates live feed every 30 seconds                           │
│  • User sees their donation appear! 🎉                          │
└──────────────────────────────────────────────────────────────────┘
\`\`\`

---

## Status Checking Flow

\`\`\`
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND POLLS STATUS (every 2 seconds while pending)           │
│                                                                  │
│  GET /api/auth/xaman/status/{payloadId}                          │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────────────┐
│  EDGE FUNCTION: xaman-status (network-agnostic!)                 │
│                                                                  │
│  1. Calls Xaman API:                                            │
│     GET https://xumm.app/api/v1/platform/payload/{payloadId}    │
│                                                                  │
│  2. Checks response.meta:                                       │
│     • signed: true/false                                        │
│     • rejected: true/false                                      │
│     • expired: true/false                                       │
│                                                                  │
│  3. If signed, parses network:                                  │
│     • response.response.networkId === 21337 → Xahau             │
│     • else → XRPL                                               │
│                                                                  │
│  4. Generates explorer URL:                                     │
│     • Prefers CTID if available (more efficient)                │
│     • Falls back to txhash format                               │
│     • Format: https://xumm.app/explorer/{network}/{hash}        │
│                                                                  │
│  5. Returns to frontend:                                        │
│     {                                                            │
│       signed: true,                                             │
│       txid: "ABC123...",                                        │
│       network: "xahau",                                         │
│       explorerUrl: "https://xumm.app/explorer/xahau/ABC123"     │
│     }                                                            │
└──────────────────────────────────────────────────────────────────┘
\`\`\`

**Why one status function for both networks?**
- Xaman API returns network info in the payload response
- Same status endpoint works for Xahau, XRPL, and any future networks
- Reduces deployment complexity (4 functions instead of 6)
