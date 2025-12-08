# Getting Started with xBase

**Welcome!** This guide will walk you through setting up your own crypto donation app from scratch. No prior blockchain experience needed.

## What You'll Build

A production-ready donation app that accepts **Xahau (XAH)** and **XRPL (XRP)** payments via Xaman wallet, deployed trustlessly on Evernode.

**Live Demo Flow:**
1. User selects network (Xahau or XRPL) and amount
2. QR code appears → User scans with Xaman mobile wallet
3. User signs transaction → Payment confirmed on blockchain
4. Donation appears in live feed on your website

---

## Prerequisites

Before starting, you'll need:

### Required Accounts (All Free)
- **Supabase Account** - Backend database and serverless functions ([signup](https://supabase.com))
- **Xaman Developer Account** - Payment integration API keys ([signup](https://apps.xaman.app))
- **GitHub Account** - For deploying Edge Functions automatically (optional but recommended)

### Required Software
- **Node.js 18+** - JavaScript runtime ([download](https://nodejs.org))
- **pnpm** - Package manager (`npm install -g pnpm`)
- **Docker** - For containerization ([download](https://docker.com))
- **Supabase CLI** - For deploying functions (`pnpm add -g supabase`)

### Helpful But Optional
- **Git** - Version control
- **VS Code** - Code editor with good TypeScript support

---

## Key Concepts Explained

### What is Xahau/XRPL?
- **XRPL (XRP Ledger)** - A blockchain network for fast, low-cost payments using XRP currency
- **Xahau** - A sidechain of XRPL with additional smart contract features, uses XAH currency
- Both networks use the same wallet app: **Xaman**

### What is Xaman?
A mobile wallet app (formerly called Xumm) that lets users:
- Store XRP and XAH securely
- Sign transactions via QR codes
- Your donation app creates payment requests, Xaman signs them

### What is Supabase?
An open-source Firebase alternative providing:
- **PostgreSQL Database** - Stores donation records
- **Edge Functions** - Serverless API endpoints (runs Deno/TypeScript)
- **Row Level Security (RLS)** - Database-level access control
- **Realtime** - Live updates when new donations arrive

### What are Edge Functions?
Serverless functions that run close to users for low latency. Think of them as API endpoints that:
- Create Xaman payment payloads
- Check payment status
- Receive webhook notifications when payments complete

**Why use them?** Your API keys stay server-side in Supabase, never exposed in your Docker container.

### What is Evernode?
A decentralized hosting platform built on XRPL where:
- Docker containers run on distributed hosts
- No single point of failure
- You don't trust the host (that's why secrets stay in Supabase)

### What is Docker?
Packages your app + dependencies into a portable container that runs anywhere.

**Build args** - Variables passed during image build (for Next.js `NEXT_PUBLIC_*` vars)
**Runtime env vars** - Variables passed when container starts (for server secrets)

---

## Architecture Overview

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                        │
│  (Your Donation Page running in Docker on Evernode)         │
└───────────────┬─────────────────────────────────────────────┘
                │
                │ 1. Click "Donate 10 XAH"
                │
                ↓
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTIONS                         │
│  (Serverless API with your Xaman API keys stored safely)    │
│                                                              │
│  • xaman-createPayload (Xahau) ──┐                          │
│  • xaman-createPayload-xrpl (XRPL) ├→ Creates payment       │
│  • xaman-status (Both networks)   ──┘   request             │
└───────────────┬─────────────────────────────────────────────┘
                │
                │ 2. Create payload with Xaman API
                │
                ↓
┌─────────────────────────────────────────────────────────────┐
│                      XAMAN API                               │
│  (Xaman's servers generate QR code & handle signing)        │
└───────────────┬─────────────────────────────────────────────┘
                │
                │ 3. Returns QR code → User scans with phone
                │
                ↓
┌─────────────────────────────────────────────────────────────┐
│                  XAMAN MOBILE WALLET                         │
│  (User reviews & signs transaction on their device)         │
└───────────────┬─────────────────────────────────────────────┘
                │
                │ 4. Transaction submitted to blockchain
                │
                ↓
┌─────────────────────────────────────────────────────────────┐
│              XAHAU/XRPL BLOCKCHAIN                           │
│  (Decentralized ledger confirms payment)                    │
└───────────────┬─────────────────────────────────────────────┘
                │
                │ 5. Webhook fires when confirmed
                │
                ↓
┌─────────────────────────────────────────────────────────────┐
│         SUPABASE DATABASE (donations table)                  │
│  (Stores: address, amount, memo, txid, network)             │
└─────────────────────────────────────────────────────────────┘
                │
                │ 6. Live feed polls database
                │
                ↓
        User sees donation in feed! 🎉
\`\`\`

**Why this flow?**
- **Security**: API keys never touch your Docker container
- **Trustless**: Host can't steal credentials or modify transaction logic
- **Scalable**: Serverless functions scale automatically
- **Real-time**: Webhooks + database ensure instant updates

---

## Step-by-Step Setup

### Step 1: Create Your App

\`\`\`bash
# Using xMerch CLI (recommended)
pnpm dlx xmerch create my-donation-app

# Or clone manually
git clone <your-repo>
cd xBase_v2
pnpm install
\`\`\`

### Step 2: Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name, database password, region (pick closest to your users)
3. Wait ~2 minutes for project to initialize
4. Copy your **Project URL** and **anon public key**:
   - Dashboard → Settings → API
   - You'll need these for `.env.local`

### Step 3: Configure Local Environment

\`\`\`bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your values:
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
\`\`\`

### Step 4: Set Up Database

**Option A: Supabase Dashboard (Easiest)**
1. Dashboard → SQL Editor → **New Query**
2. Copy contents of `supabase/migrations/20250130000000_create_donations_table.sql`
3. Paste → **Run**
4. Verify: Table Editor → Should see `donations` table

**Option B: Supabase CLI**
\`\`\`bash
supabase link --project-ref YOUR_PROJECT_ID
supabase db push
\`\`\`

**What this creates:**
- `donations` table with columns for address, amount, memo, txid, network
- RLS policies: Public can read, only service role can write
- Indexes for fast queries on recent donations

### Step 5: Get Xaman API Keys

1. Go to [apps.xaman.app](https://apps.xaman.app) → **Sign In with Xaman**
2. Create New App → Fill in details:
   - Name: "My Donation App"
   - Webhook URL: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/xaman-webhook`
3. Copy **API Key** and **API Secret**

**Need separate keys for Xahau and XRPL?** 
- No! Same keys work for both networks
- But you can create separate apps if you want different branding

### Step 6: Set Up Destination Addresses

**Where donations will be sent.** You need wallet addresses on both networks:

**Get Xahau Address:**
1. Open Xaman app → Switch to Xahau network (Settings → Network → Xahau)
2. Copy your wallet address (starts with `r...`)

**Get XRPL Address:**
1. Switch to XRP Ledger (Settings → Network → Mainnet)
2. Copy your wallet address (starts with `r...`)

**Important:** Test with small amounts first! Use testnet addresses initially.

### Step 7: Deploy Edge Functions

See detailed guide in [`supabase/README.md`](./supabase/README.md), but here's the quick version:

\`\`\`bash
cd supabase
chmod +x ../scripts/setup-supabase.sh
../scripts/setup-supabase.sh
\`\`\`

This script will:
1. Deploy all 4 Edge Functions to your Supabase project
2. Prompt you for Xaman API keys
3. Set up destination addresses
4. Configure webhook URL

**What gets deployed:**
- `xaman-createPayload` - Creates Xahau payment requests
- `xaman-createPayload-xrpl` - Creates XRPL payment requests  
- `xaman-status` - Checks payment status (both networks)
- `xaman-webhook` - Receives confirmation when payment completes

### Step 8: Test Locally

\`\`\`bash
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000):
1. Select network (Xahau or XRPL)
2. Enter amount → Click "Donate"
3. QR code appears → Scan with Xaman mobile app
4. Sign transaction → Watch it appear in live feed

**Troubleshooting:**
- QR not appearing? Check browser console for Edge Function errors
- Payment not completing? Check Supabase Logs → Edge Functions
- Donation not in feed? Check Database → donations table

### Step 9: Build Docker Image

See [`DOCKER.md`](./DOCKER.md) for full guide. Quick version:

\`\`\`bash
# Copy deploy config
cp env.deploy.example .env.deploy

# Edit .env.deploy with your values
nano .env.deploy

# Build image
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key \
  --build-arg NEXT_PUBLIC_BASE_URL=https://yourdomain.com \
  -t xbase-donation:latest .
\`\`\`

**Why build args?** Next.js bundles `NEXT_PUBLIC_*` vars at build time, not runtime.

### Step 10: Deploy to Evernode

\`\`\`bash
# Tag for Docker Hub
docker tag xbase-donation:latest YOUR_DOCKERHUB_USERNAME/xbase-donation:latest

# Push
docker push YOUR_DOCKERHUB_USERNAME/xbase-donation:latest

# Deploy to Evernode (use Evernode CLI or dashboard)
# Your image is now running trustlessly!
\`\`\`

---

## Understanding the Donation Flow

Let's walk through exactly what happens when someone donates:

### 1. User Clicks "Donate 10 XAH"

**Frontend Code:** `components/donate-xah-form.tsx`
\`\`\`typescript
// User selects Xahau network, enters 10 XAH
const response = await fetch('/api/auth/xaman/create-payload/xahau-payload', {
  method: 'POST',
  body: JSON.stringify({ amount: 10, memo: "Supporting xBase!" })
})
\`\`\`

**What happens:**
- Next.js API route receives request
- Proxies to Supabase Edge Function `xaman-createPayload`

### 2. Edge Function Creates Payment Request

**Edge Function:** `supabase/functions/xaman-createPayload/index.ts`
\`\`\`typescript
// Builds Xahau transaction
const txjson = {
  TransactionType: "Payment",
  Destination: "rYOUR_XAHAU_ADDRESS",
  Amount: "10000000", // 10 XAH in drops (1 XAH = 1M drops)
  NetworkID: 21337 // Xahau mainnet
}

// Calls Xaman API with your secret keys (stored in Supabase Vault)
const payload = await fetch('https://xumm.app/api/v1/platform/payload', {
  headers: { 'X-API-Key': XUMM_API_KEY, 'X-API-Secret': XUMM_API_SECRET },
  body: JSON.stringify({ txjson, options: { submit: true } })
})
\`\`\`

**Returns:**
- `uuid` - Unique payment ID
- `qr_png` - QR code image URL
- `websocket_status` - Live status updates

### 3. User Scans QR Code

**Frontend shows QR code:**
- Desktop: Modal popup with QR
- Mobile: Direct redirect to `xumm://payload/uuid`

**User opens Xaman app:**
- Reviews transaction details (amount, destination, memo)
- Approves or rejects

### 4. Transaction Hits Blockchain

**Xaman submits to Xahau/XRPL:**
- Transaction gets validated by network validators
- Confirmed in ~3-5 seconds
- Transaction hash (`txid`) generated

### 5. Webhook Fires

**Xaman calls:** `https://YOUR_PROJECT_ID.supabase.co/functions/v1/xaman-webhook`

**Edge Function:** `supabase/functions/xaman-webhook/index.ts`
\`\`\`typescript
// Receives payload data
const { meta, response } = await req.json()

if (response?.signed && response?.txid) {
  // Insert into database
  await supabase.from('donations').insert({
    wallet_address: meta.from_account,
    amount: parseFloat(txAmount),
    currency: currency,
    network: networkId === 21337 ? 'xahau' : 'xrpl',
    transaction_hash: response.txid,
    memo: memoText,
    completed_at: new Date()
  })
}
\`\`\`

### 6. Live Feed Updates

**Frontend:** `components/donation-feed.tsx`
\`\`\`typescript
// Polls every 30 seconds (pauses when tab hidden)
const { data: donations } = useSWR('/api/donations', fetcher, {
  refreshInterval: 30000
})

// Displays in horizontal carousel
donations.map(d => (
  <DonationCard 
    address={d.wallet_address}
    amount={d.amount}
    memo={d.memo}
    network={d.network}
  />
))
\`\`\`

---

## Common Questions

### Why Supabase instead of my own server?
- **Trustless deployment**: Your Docker container never has API keys
- **Automatic scaling**: Edge Functions scale to millions of requests
- **Built-in database**: PostgreSQL with real-time updates
- **Free tier**: Generous limits for small/medium traffic

### Why separate Edge Functions for Xahau and XRPL?
- Different `NetworkID` values (21337 vs none)
- Different destination addresses
- Easier to extend with network-specific features later
- But they share the same status checker (network-agnostic)

### Can I accept other currencies?
Yes! Fork the template and modify:
- Edge Functions to create different transaction types
- Database schema to support new currencies
- Frontend to show new payment options

### How do I track conversion rates?
Check the `/api/health` endpoint or add analytics:
- Google Analytics
- PostHog
- Custom dashboard querying `donations` table

### Is this production-ready?
Yes, but recommendations:
- Test thoroughly on testnet first
- Start with small donation limits
- Monitor Supabase logs for errors
- Set up alerts for failed transactions
- Consider rate limiting to prevent spam

---

## Next Steps

1. **Customize the UI** - Edit `app/page.tsx` with your branding
2. **Add more features:**
   - Donation goals/progress bars
   - Leaderboards
   - Email notifications
   - Multi-currency support
3. **Set up monitoring:**
   - Supabase Dashboard → Logs
   - Health check endpoint: `/api/health`
4. **Deploy to production:**
   - Follow [`DOCKER.md`](./DOCKER.md)
   - Update `NEXT_PUBLIC_BASE_URL` to your domain
5. **Share your app** - Add to xMerch showcase!

---

## Getting Help

- **Template Issues**: Check existing issues or create new one
- **Supabase Questions**: [Supabase Discord](https://discord.supabase.com)
- **Xaman Integration**: [Xaman Developer Docs](https://docs.xaman.app)
- **Evernode Deployment**: [Evernode Docs](https://docs.evernode.org)

**Built with xBase?** Share it with us! We'd love to see what you create.

---

**Ready to build?** Start with Step 1 above and follow along. You'll have a working donation app in under an hour! 🚀
