# 🧱 xBase — Build on Xahau with xMerch

> 🧩 **Developer Starter Template**  
> Build trustless commerce apps using **Next.js + Xaman + Xahau + Supabase**.

xBase is the default template included with the **xMerch CLI**.  
It scaffolds a fully working Web3-native dApp wired for:

- 🔐 Xaman (Xumm) authentication  
- 💸 Xahau & XRPL payment payloads  
- ⚡ Real-time on-chain donation tracking with live feed
- 🗄️ Supabase Edge Functions (secure API key storage)
- 🎨 Next.js 16 + Tailwind CSS v4 + shadcn/ui
- 🐳 Docker-ready for Evernode deployment

No traditional backend servers required — fully serverless with Edge Functions.

**Public repo meta**
- Contributing guidelines: see `CONTRIBUTING.md`
- Code of Conduct: see `CODE_OF_CONDUCT.md`
- Security reporting: see `SECURITY.md`
- Release notes: see `CHANGELOG.md`

---

## 🏗️ Architecture

```mermaid
flowchart LR
  A[Next.js app<br/>(Evernode/Docker)<br/><small>No secrets in container</small>]
  B[Supabase Edge Functions<br/><small>Secrets in Vault</small>]
  C[Xaman API (xumm.app)]
  D[(Supabase Database<br/>Donations table)]

  A -->|Uses service role key| B
  B -->|Creates/queries payloads| C
  B -->|Stores donation status| D
```

**Why this architecture?**
- Evernode is a trustless environment — you don't own the host
- API keys stored in Supabase Vault, not in the Docker container
- Edge Functions handle all sensitive Xaman API calls
- Your container only needs Supabase URL + Service Role Key
- Database tracks transaction history for live donation feed

---

## 🚀 Quick Start

\`\`\`bash
pnpm dlx xmerch create
cd xbase-project
pnpm dev
\`\`\`

This generates a full working dApp with:

- `.env.local` (auto-copied)
- `.gitignore` (auto-copied)
- Donation UI connected to Xaman
- API routes for creating Xahau & XRPL payment payloads
- Live donation feed from Supabase

Visit:

\`\`\`bash
http://localhost:3000
\`\`\`

---

## 🧰 Environment Variables

Your newly generated `.env.local` needs real values before running:

| Variable | Description |
|----------|-------------|
| NEXT_PUBLIC_BASE_URL | Local/production URL (e.g., `http://localhost:3000`) |
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon key |
| SUPABASE_URL | Supabase project URL (server-side) |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key |
| XUMM_API_KEY | Xaman App Key (stored in Supabase Vault) |
| XUMM_API_SECRET | Xaman App Secret (stored in Supabase Vault) |
| XAH_DESTINATION | rAddress receiving payments (stored in Supabase Vault) |
| NEXT_PUBLIC_XAHAU_NETWORK_ID | Default: `21337` |
| NEXT_PUBLIC_XRPL_NETWORK_ID | Default: `0` or `1` (Mainnet/Testnet) |
| EVERNODE_PRIVATE_KEY | Evernode key (if deploying there) |
| COINMARKETCAP_API_KEY | (Optional) XAH → USD pricing feed |

For Docker deploys, fill the separate `.env.deploy` (auto-copied, gitignored) with:

| Variable | Description |
|----------|-------------|
| DOCKER_USERNAME | Your Docker Hub username |
| DOCKER_PERSONAL_ACCESS_TOKEN | Docker Hub token (preferred over password) |
| DOCKER_NAMESPACE | Your org/namespace; use your username if you have no org |

You can obtain Xaman credentials at:

👉 https://apps.xaman.dev

---

## 📁 Project Structure

\`\`\`bash
xbase-project/
│
├── app/
│   ├── api/
│   │   ├── auth/xaman/
│   │   │   ├── create-payload/
│   │   │   │   ├── xahau-payload/route.ts    # Xahau payment payload
│   │   │   │   └── xrpl-payload/route.ts     # XRPL payment payload
│   │   │   ├── callback/route.ts             # OAuth callback handler
│   │   │   └── status/[payloadId]/route.ts   # Payload status checker
│   │   ├── donations/route.ts                # Fetch donations from DB
│   │   └── webhooks/xaman/route.ts           # Webhook handler
│   ├── donate/
│   │   ├── success/page.tsx                  # Success page
│   │   ├── cancelled/page.tsx                # Cancelled page
│   │   └── status/page.tsx                   # Status polling page
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                              # Landing page with donation UI
│
├── components/
│   ├── donate-form.tsx                       # Main donation form
│   ├── donation-feed.tsx                     # Live donation feed
│   ├── hackathon-badge.tsx                   # Hackathon badge
│   ├── tech-stack-scroll.tsx                 # Technology stack display
│   ├── theme-provider.tsx                    # Dark/light theme provider
│   ├── theme-toggle.tsx                      # Theme toggle button
│   ├── typing-command.tsx                    # Typing animation
│   └── ui/                                   # shadcn/ui components
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                         # Client-side Supabase client
│   │   └── server.ts                         # Server-side Supabase client
│   └── xaman/
│       └── utils.ts                          # Xaman utility functions
│
├── supabase/
│   ├── functions/
│   │   ├── xaman-createPayload-xahau/        # Edge Function for Xahau
│   │   ├── xaman-createPayload-xrpl/         # Edge Function for XRPL
│   │   └── xaman-webhook/                    # Edge Function for webhooks
│   ├── migrations/
│   │   └── create_donations_table.sql        # Database migration
│   └── README.md                             # Supabase setup guide
│
├── types/
│   └── xaman.ts                              # TypeScript types
│
├── .env.example                              # Environment template
├── .env.deploy.example                       # Docker deploy env template
├── .gitignore
├── Dockerfile                                # Docker build config
├── docker-compose.yml                        # Docker Compose config
├── evernode.config.json                      # Evernode deployment config
├── file_tree.txt                             # Complete file tree
├── package.json
├── tailwind.config.ts
└── README.md
\`\`\`

---

## ⚡ Donation Flow Overview

### **1. Frontend (donate-form.tsx)**  

User selects a donation amount (10, 50, 100 XAH) or enters custom amount.  
Clicking **Donate** triggers:

\`\`\`tsx
const res = await fetch("/api/auth/xaman/create-payload/xahau-payload", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ amount, memo }),
});
\`\`\`

---

### **2. Backend API Route (route.ts)**  

The Next.js API route proxies the request to the Supabase Edge Function:

\`\`\`ts
const edgeFunctionUrl = `${process.env.SUPABASE_URL}/functions/v1/xaman-createPayload-xahau`;
const response = await fetch(edgeFunctionUrl, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ amount, memo })
});
\`\`\`

---

### **3. Edge Function (Supabase)**  

The Edge Function creates a **Xahau Payment Payload** using Xaman SDK with credentials from Supabase Vault:

\`\`\`ts
const XUMM_API_KEY = Deno.env.get("XUMM_API_KEY");
const XUMM_API_SECRET = Deno.env.get("XUMM_API_SECRET");
const XAH_DESTINATION = Deno.env.get("XAH_DESTINATION");

const payload = {
  txjson: {
    TransactionType: "Payment",
    Destination: XAH_DESTINATION,
    Amount: String(amount * 1_000_000),
    NetworkID: 21337,
    // ... other fields
  }
};

const response = await fetch("https://xumm.app/api/v1/platform/payload", {
  method: "POST",
  headers: {
    "X-API-Key": XUMM_API_KEY,
    "X-API-Secret": XUMM_API_SECRET
  },
  body: JSON.stringify(payload)
});
\`\`\`

Returns:

\`\`\`json
{ 
  "uuid": "...", 
  "next": { "always": "https://xumm.app/sign/..." },
  "refs": { "qr_png": "https://xumm.app/sign/..._q.png" }
}
\`\`\`

---

### **4. User Signs Transaction**  

Xaman opens automatically (mobile) or in a new window (desktop).  
User reviews and signs the transaction in Xaman wallet.

---

### **5. Webhook Receiver**  

When transaction is signed, Xaman calls the webhook Edge Function.  
The webhook validates:

- ✅ Payment signed?
- ✅ Transaction hash?
- ✅ Correct destination address?
- ✅ Correct network ID?
- ✅ Transaction successful (tesSUCCESS)?

If validated, stores donation in Supabase database:

\`\`\`ts
await supabase.from("donations").insert({
  network: "xahau",
  amount,
  currency: "XAH",
  memo,
  tx_hash: txHash,
  sender_address: signerAccount,
  status: "completed",
  payload_uuid: payloadUuid,
  completed_at: new Date().toISOString()
});
\`\`\`

---

### **6. Live Feed Updates**

The donations feed component fetches recent donations:

\`\`\`ts
const donations = await fetch("/api/donations").then(r => r.json());
\`\`\`

This displays real-time transaction history on the landing page.

---

## 🧪 Payload Builder (Reusable)

Edge Functions contain fully typed payload generators for both networks:

- **Xahau**: NetworkID `21337`
- **XRPL**: NetworkID `0` (Mainnet) or `1` (Testnet)

Both include:

- NetworkID configuration
- Memo hex encoding
- Expiration timestamps
- Safe default flags
- Drop conversion (1 XAH/XRP = 1,000,000 drops)

This keeps API routes clean and maintainable.

---

## 🎨 UI & Styling

xBase uses:

- **Next.js 16** (App Router + Turbopack + React 19)
- **Tailwind CSS v4** (with @theme inline configuration)
- **shadcn/ui** (accessible component library)
- **Framer Motion** (for animations)

Everything is intentionally minimal and customizable:

- Theme the donation flow
- Extend components
- Create storefront layouts
- Add modals and animations
- Full dark/light mode support

---

## 🛡️ Security

| Layer | Protection |
|-------|------------|
| **Xaman Credentials** | Stored in Supabase Vault (Edge Function secrets) |
| **Edge Functions** | Handle all sensitive API calls, isolated from frontend |
| **Docker Container** | Only has Supabase URL + Service Role Key |
| **Transaction Verification** | Destination, amount, network, and result code validated |
| **Database RLS** | Row Level Security ensures public can only read completed donations |

**Never expose Xaman API keys in:**
- Frontend code
- Environment variables visible to client
- Docker container environment
- Git repository

---

## 🐳 Docker Deployment

### Build Locally

\`\`\`bash
docker build -t xbase .
\`\`\`

### Run Container

\`\`\`bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
  -e SUPABASE_URL=https://xxx.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=xxx \
  -e NEXT_PUBLIC_BASE_URL=https://your-domain.com \
  xbase
\`\`\`

### Docker Compose

\`\`\`bash
cp .env.example .env
# Edit .env with your values
docker-compose up -d
\`\`\`

### Docker Deploy Prep

- Optional: run `pnpm build` locally first to surface build errors before Docker build
- Fill `.env.deploy` with Docker Hub credentials
- Run: `set -a; source .env.deploy; set +a; xmerch deploy --docker --dry-run` to verify
- Deploy: `xmerch deploy --docker` to push
- If Docker Swarm isn't initialized, add `--force-local-swarm`
- `.dockerignore` prevents `node_modules`/`.next` from being copied

---

## 🚀 Evernode Deployment

xBase is designed for Evernode's trustless hosting environment.

1. Build and push Docker image to your registry
2. Deploy to Evernode with environment variables (via evrPanel or CLI)
3. See `evernode.config.json` for resource configuration
4. API keys stay secure in Supabase, not in the container

---

## 🧱 Suggested Next Steps

After getting xBase running, extend it:

- 🎫 **NFT Access Keys** — Issue NFTs as membership tokens
- 🪝 **Custom Hooks** — Deploy Xahau Hooks for advanced logic
- 💳 **Subscriptions** — Build recurring payment flows
- 🛒 **E-commerce** — Add product catalogs and shopping cart
- 📊 **Analytics** — Track conversion rates and donor behavior
- 🌐 **Multi-chain** — Support XRPL mainnet alongside Xahau
- 🎨 **Custom Branding** — Theme the UI to match your brand
- 🔗 **API Integrations** — Connect to external services (email, CRM, etc.)

---

## 🔗 Helpful Resources

- **Xaman Developer Dashboard** → https://apps.xaman.dev
- **Xahau Documentation** → https://xahau.network
- **Xahau Hooks Docs** → https://hooks.xahau.network
- **XRPL Documentation** → https://xrpl.org
- **Supabase Edge Functions** → https://supabase.com/docs/guides/functions
- **xMerch CLI Repository** → https://github.com/mworks-proj/xmerch-cli
- **Evernode Documentation** → https://evernode.org

---

## 🧪 Testing

### Test Payload Creation

\`\`\`bash
curl -X POST http://localhost:3000/api/auth/xaman/create-payload/xahau-payload \
  -H "Content-Type: application/json" \
  -d '{"amount": 10, "memo": "Test donation"}'
\`\`\`

Expected response:

\`\`\`json
{
  "ok": true,
  "uuid": "...",
  "nextUrl": "https://xumm.app/sign/...",
  "qrUrl": "https://xumm.app/sign/..._q.png"
}
\`\`\`

### Test Donations API

\`\`\`bash
curl http://localhost:3000/api/donations
\`\`\`

Expected response:

\`\`\`json
{
  "donations": [
    {
      "id": "...",
      "network": "xahau",
      "amount": "10.000000",
      "currency": "XAH",
      "memo": "Test donation",
      "tx_hash": "...",
      "sender_address": "r...",
      "status": "completed",
      "created_at": "2025-01-26T..."
    }
  ]
}
\`\`\`

---

## 📄 License

MIT © 2025 MWorks Design LLC
