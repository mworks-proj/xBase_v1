# xBase Deployment Guide

Complete guide for deploying xBase to Docker, Evernode, and other platforms.

---

## Table of Contents

1. [Understanding Next.js Environment Variables](#understanding-nextjs-environment-variables)
2. [Prerequisites](#prerequisites)
3. [Configure Supabase](#step-1-configure-supabase)
4. [Build Docker Image](#step-2-build-docker-image)
5. [Deploy to Evernode](#step-3-deploy-to-evernode)
6. [Verification & Troubleshooting](#verification-and-troubleshooting)

---

## Understanding Next.js Environment Variables

Next.js has two types of environment variables that behave differently in Docker:

1. **`NEXT_PUBLIC_*` variables** - Bundled into JavaScript at **build time**, visible in browser
2. **Server-side variables** - Only available in API routes/server components at **runtime**

For Docker, `NEXT_PUBLIC_*` vars must be passed as **build args** during the build stage.

### Required Environment Variables

**Build-time (passed as `--build-arg`):**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
- `NEXT_PUBLIC_BASE_URL` - Your deployed domain (e.g., `https://xbase.zerp.network`)

**Runtime (stored in Supabase Vault, not Docker):**
- `XUMM_API_KEY` - Xaman API key
- `XUMM_API_SECRET` - Xaman API secret
- `XAH_DESTINATION` - Xahau destination address
- `XUMM_API_KEY_XRPL` - Xaman API key for XRPL
- `XUMM_API_SECRET_XRPL` - Xaman API secret for XRPL
- `XRP_DESTINATION` - XRPL destination address

---

## Prerequisites

1. **Supabase project** with Edge Functions enabled
2. **Xaman Developer account** with API credentials for both Xahau and XRPL
3. **Docker Hub account** for image hosting
4. **Evernode host** or cluster access (for Evernode deployment)
5. **Docker installed locally** for building

---

## Step 1: Configure Supabase

### 1.1 Set Edge Function Secrets

All sensitive API keys are stored in Supabase Vault, NOT in the Docker container.

**Via Supabase Dashboard:**
1. Go to Project Settings > Edge Functions > Secrets
2. Add each secret:

\`\`\`
XUMM_API_KEY=your-xahau-xaman-api-key
XUMM_API_SECRET=your-xahau-xaman-api-secret
XAH_DESTINATION=rYourDestinationXahauAddress

XUMM_API_KEY_XRPL=your-xrpl-xaman-api-key
XUMM_API_SECRET_XRPL=your-xrpl-xaman-api-secret
XRP_DESTINATION=rYourDestinationXRPLAddress

SUPABASE_URL=https://your-project.supabase.co
\`\`\`

**Via Supabase CLI:**

\`\`\`bash
supabase link --project-ref YOUR_PROJECT_REF

supabase secrets set \
  XUMM_API_KEY=xxx \
  XUMM_API_SECRET=xxx \
  XAH_DESTINATION=rXxx \
  XUMM_API_KEY_XRPL=xxx \
  XUMM_API_SECRET_XRPL=xxx \
  XRP_DESTINATION=rXxx \
  SUPABASE_URL=https://your-project.supabase.co
\`\`\`

### 1.2 Apply Database Migrations

\`\`\`bash
# Apply migrations to create donations table
supabase db push

# Or manually in Supabase Dashboard SQL Editor:
# Copy contents of supabase/migrations/20250130000000_create_donations_table.sql
\`\`\`

### 1.3 Deploy Edge Functions

\`\`\`bash
# Deploy all Edge Functions
supabase functions deploy xaman-createPayload
supabase functions deploy xaman-createPayload-xrpl
supabase functions deploy xaman-status
supabase functions deploy xaman-webhook
\`\`\`

For detailed Edge Function setup, see `supabase/README.md`.

---

## Step 2: Build Docker Image

### Option 1: Using .env.deploy (Recommended)

The xmerch CLI automatically creates `.env.deploy` from `env.deploy.example`.

1. **Edit `.env.deploy`** with your values:

\`\`\`env
# Docker Hub Credentials
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PERSONAL_ACCESS_TOKEN=dckr_pat_xxx
DOCKER_IMAGE_NAME=xbase_v2
DOCKER_IMAGE_TAG=latest

# Build Arguments (Public Environment Variables)
NEXT_PUBLIC_BASE_URL=https://xbase.zerp.network
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

2. **Run the deployment script:**

\`\`\`bash
chmod +x scripts/deploy-docker.sh
./scripts/deploy-docker.sh
\`\`\`

This will:
- Load variables from `.env.deploy`
- Build with correct build args
- Tag the image
- Login to Docker Hub
- Push to your repository

### Option 2: Manual Build

\`\`\`bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
  --build-arg NEXT_PUBLIC_BASE_URL=https://xbase.zerp.network \
  -t xbase_v2:latest \
  .

# Tag for Docker Hub
docker tag xbase_v2:latest your-username/xbase_v2:latest

# Push
docker login
docker push your-username/xbase_v2:latest
\`\`\`

### Option 3: Using docker-compose (Local Testing)

\`\`\`bash
# Copy environment file
cp .env.example .env

# Edit with local values
nano .env

# Build and run
docker-compose up --build
\`\`\`

---

## Step 3: Deploy to Evernode

### 3.1 Understanding Evernode Deployment

Evernode runs Docker containers on decentralized infrastructure. Your xBase template is deployed as:

\`\`\`bash
mworksusa/xbase_v2:latest--gptcp1--3000--subdomain--xbase--proxyssl--false
\`\`\`

**Breakdown:**
- `mworksusa/xbase_v2:latest` - Your Docker Hub image
- `--gptcp1` - Global proxy TCP protocol
- `--3000` - Container port
- `--subdomain--xbase` - Subdomain (becomes `xbase.zerp.network`)
- `--proxyssl--false` - SSL handled by Evernode proxy

### 3.2 Deploy to Evernode

1. **Ensure image is pushed to Docker Hub:**

\`\`\`bash
docker push mworksusa/xbase_v2:latest
\`\`\`

2. **Deploy using Evernode CLI or Dashboard:**

\`\`\`bash
# Using Evernode CLI
evernode deploy mworksusa/xbase_v2:latest \
  --port 3000 \
  --subdomain xbase \
  --ssl auto
\`\`\`

3. **Your app will be available at:**
- `https://xbase.zerp.network` (Evernode proxy handles SSL)

### 3.3 Configure Xaman Webhook

After deployment, update your Xaman Developer Console:

1. Go to https://apps.xumm.dev
2. Add webhook URL: `https://xbase.zerp.network/api/webhooks/xaman`
3. Enable delivery notifications

### 3.4 Health Check Configuration

Evernode uses `evernode.config.json` for health monitoring:

\`\`\`json
{
  "healthCheck": {
    "enabled": true,
    "interval": 30,
    "timeout": 5,
    "path": "/api/health"
  }
}
\`\`\`

Evernode will ping `https://xbase.zerp.network/api/health` every 30 seconds.

---

## Security Architecture

\`\`\`
┌──────────────────────────────────────────────────────────────┐
│                         EVERNODE                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Docker Container (xBase)                                │ │
│  │  - NEXT_PUBLIC_* vars only (baked at build time)        │ │
│  │  - No Xaman API keys                                     │ │
│  │  - Proxies requests to Supabase Edge Functions          │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       SUPABASE                                │
│  ┌─────────────────┐    ┌─────────────────────────────────┐  │
│  │  Edge Functions │◀──▶│  Vault (Secrets)                │  │
│  │  - createPayload│    │  - XUMM_API_KEY                 │  │
│  │  - webhook      │    │  - XUMM_API_SECRET              │  │
│  │  - status       │    │  - XAH_DESTINATION              │  │
│  └─────────────────┘    │  - XRP_DESTINATION              │  │
│                         └─────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      XAMAN API                                │
│  - Payment payload creation                                   │
│  - Transaction status verification                            │
└──────────────────────────────────────────────────────────────┘
\`\`\`

### What's Safe vs Sensitive

✅ **Safe to include in Docker image (public):**
- `NEXT_PUBLIC_SUPABASE_URL` - Public project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public key, protected by RLS
- `NEXT_PUBLIC_BASE_URL` - Your public domain

❌ **NEVER include in Docker image (sensitive):**
- `XUMM_API_KEY` - Stored in Supabase Vault
- `XUMM_API_SECRET` - Stored in Supabase Vault
- Destination addresses - Stored in Supabase Vault

**Why this matters for Evernode:** You don't control the Evernode host, so keeping secrets in Supabase Vault ensures trustless deployment.

---

## Verification and Troubleshooting

### Pre-Deployment Checklist

- [ ] Supabase Edge Functions deployed
- [ ] Secrets set in Supabase Vault
- [ ] Database migrations applied
- [ ] RLS policies enabled on `donations` table
- [ ] Docker image built with correct build args
- [ ] Image pushed to Docker Hub
- [ ] `NEXT_PUBLIC_BASE_URL` matches deployment domain
- [ ] Xaman webhook URL configured

### Test Health Endpoint

\`\`\`bash
# Local
curl http://localhost:3000/api/health

# Evernode
curl https://xbase.zerp.network/api/health
\`\`\`

Expected response:
\`\`\`json
{
  "status": "healthy",
  "timestamp": "2025-01-30T...",
  "version": "1.0.0",
  "environment": {
    "supabase_url": "configured",
    "supabase_anon_key": "configured",
    "base_url": "configured"
  },
  "database": {
    "connected": true
  }
}
\`\`\`

### Common Issues

**1. "Server configuration error: Missing BASE_URL"**
- **Cause:** `NEXT_PUBLIC_BASE_URL` not passed as build arg
- **Fix:** Rebuild with `--build-arg NEXT_PUBLIC_BASE_URL=https://your-domain.com`

**2. "Failed to fetch payload status"**
- **Cause:** Supabase Edge Functions not deployed or secrets missing
- **Fix:** Check `supabase functions list` and verify secrets in dashboard

**3. Donation completes but doesn't show in feed**
- **Cause:** Webhook not configured or URL mismatch
- **Fix:** Verify webhook URL in Xaman Console matches your deployed domain

**4. Docker image fails to start**
- **Cause:** Missing `output: 'standalone'` in `next.config.mjs`
- **Fix:** Already configured in template, verify it hasn't been removed

### Viewing Logs

**Supabase Edge Functions:**
\`\`\`bash
supabase functions logs xaman-createPayload
supabase functions logs xaman-webhook
\`\`\`

**Docker Container:**
\`\`\`bash
# Local
docker logs xbase-app

# Evernode (via Evernode dashboard or SSH)
docker logs <container-id>
\`\`\`

### Testing the Donation Flow

1. **Visit your deployed site:** `https://xbase.zerp.network`
2. **Select network** (Xahau or XRPL)
3. **Choose amount**
4. **Click "Donate"** - Should open Xaman wallet
5. **Sign transaction** in Xaman
6. **Verify:**
   - Redirect back to success page
   - Donation appears in live feed
   - Transaction hash links to explorer

---

## Using xmerch CLI (Optional)

If you're using the xmerch CLI, some steps are automated:

\`\`\`bash
# Create new project from template
pnpm dlx xmerch create my-donation-app

# Deploy Docker image
cd my-donation-app
xmerch deploy --docker

# Check deployment status
xmerch deploy status
\`\`\`

The CLI will:
- Copy template files
- Install dependencies
- Read `.env.deploy` for configuration
- Build and push Docker image automatically

---

## Next Steps

After successful deployment:

1. **Test donation flow** on your live site
2. **Monitor Edge Function logs** for any errors
3. **Verify webhook** receives signed transactions
4. **Check donation feed** updates in real-time
5. **Set up monitoring** (optional) for Evernode uptime
6. **Configure custom domain** (optional) if not using `*.zerp.network`

For more details:
- **Getting Started:** `GETTING_STARTED.md`
- **Supabase Setup:** `supabase/README.md`
- **Docker Details:** Review this file
- **Main README:** `README.md`
