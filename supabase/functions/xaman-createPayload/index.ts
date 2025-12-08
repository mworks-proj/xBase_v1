// Supabase Edge Function for creating Xaman Payment payloads (Xahau)
// Deploy with: supabase functions deploy xaman-createPayload
// Secrets needed in Supabase: XUMM_API_KEY, XUMM_API_SECRET, XAH_DESTINATION, SUPABASE_URL

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

declare const Deno: {
  env: {
    get(key: string): string | undefined
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface PayloadRequest {
  amount: number
  memo?: string
  returnUrl?: string
}

// Helper to convert string to hex
function stringToHex(str: string): string {
  return Array.from(new TextEncoder().encode(str))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()
}

// Convert XAH to drops (1 XAH = 1,000,000 drops)
function xahToDrops(xah: number): string {
  return Math.floor(xah * 1_000_000).toString()
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Get secrets from Supabase environment (set via `supabase secrets set`)
    const XUMM_API_KEY = Deno.env.get("XUMM_API_KEY")
    const XUMM_API_SECRET = Deno.env.get("XUMM_API_SECRET")
    const DESTINATION = Deno.env.get("XAH_DESTINATION")
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")

    if (!XUMM_API_KEY || !XUMM_API_SECRET) {
      console.error("Missing XUMM_API_KEY or XUMM_API_SECRET in Supabase secrets")
      return new Response(
        JSON.stringify({ ok: false, error: "Server configuration error: Missing Xaman credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    if (!DESTINATION) {
      console.error("Missing XAH_DESTINATION in Supabase secrets")
      return new Response(
        JSON.stringify({ ok: false, error: "Server configuration error: Missing destination address" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const body: PayloadRequest = await req.json()
    const { amount, memo, returnUrl } = body

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Build Xahau Payment transaction
    const txjson: Record<string, unknown> = {
      TransactionType: "Payment",
      Destination: DESTINATION,
      Amount: xahToDrops(amount),
      NetworkID: 21337, // Xahau mainnet
    }

    // Add memo if provided
    if (memo && memo.trim()) {
      txjson.Memos = [
        {
          Memo: {
            MemoType: stringToHex("text/plain"),
            MemoData: stringToHex(memo.trim()),
          },
        },
      ]
    }

    // Build payload options
    const payloadOptions: Record<string, unknown> = {
      submit: true,
      expire: 10, // 10 minutes
    }

    if (SUPABASE_URL) {
      payloadOptions.webhook = `${SUPABASE_URL}/functions/v1/xaman-webhook`
    }

    if (returnUrl) {
      payloadOptions.return_url = {
        web: returnUrl,
      }
    }

    const payload = {
      txjson,
      options: payloadOptions,
      custom_meta: {
        instruction: `Donate ${amount} XAH to xBase`,
        identifier: `xbase-donate-${Date.now()}`,
      },
    }

    console.log("Creating Xaman Xahau payload:", JSON.stringify(payload))

    try {
      const response = await fetch("https://xumm.app/api/v1/platform/payload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": XUMM_API_KEY,
          "X-API-Secret": XUMM_API_SECRET,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Xaman API error:", response.status, errorText)
        return new Response(JSON.stringify({ ok: false, error: `Xaman API error: ${response.status}` }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const data = await response.json()
      console.log("Xaman Xahau payload created:", data.uuid)

      return new Response(
        JSON.stringify({
          ok: true,
          uuid: data.uuid,
          nextUrl: data.next?.always,
          qrUrl: data.refs?.qr_png,
          websocketUrl: data.refs?.websocket_status,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    } catch (fetchError) {
      console.error("Fetch error:", fetchError)
      return new Response(
        JSON.stringify({ ok: false, error: fetchError instanceof Error ? fetchError.message : "Network error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }
  } catch (error) {
    console.error("Edge function error:", error)
    return new Response(
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})
