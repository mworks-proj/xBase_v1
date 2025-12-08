// Supabase Edge Function for creating Xaman XRPL Payment payloads
// Deploy with: supabase functions deploy xaman-createPayload-xrpl
// Secrets needed in Supabase: XUMM_API_KEY_XRPL, XUMM_API_SECRET_XRPL, XRP_DESTINATION, SUPABASE_URL

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

function stringToHex(str: string): string {
  return Array.from(new TextEncoder().encode(str))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()
}

// Convert XRP to drops (1 XRP = 1,000,000 drops)
function xrpToDrops(xrp: number): string {
  return Math.floor(xrp * 1_000_000).toString()
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const XUMM_API_KEY = Deno.env.get("XUMM_API_KEY_XRPL")
    const XUMM_API_SECRET = Deno.env.get("XUMM_API_SECRET_XRPL")
    const DESTINATION = Deno.env.get("XRP_DESTINATION")
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")

    if (!XUMM_API_KEY || !XUMM_API_SECRET) {
      console.error("Missing XUMM_API_KEY_XRPL or XUMM_API_SECRET_XRPL in Supabase secrets")
      return new Response(
        JSON.stringify({ ok: false, error: "Server configuration error: Missing Xaman credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    if (!DESTINATION) {
      console.error("Missing XRP_DESTINATION in Supabase secrets")
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

    const txjson: Record<string, unknown> = {
      TransactionType: "Payment",
      Destination: DESTINATION,
      Amount: xrpToDrops(amount),
    }

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

    const payloadOptions: Record<string, unknown> = {
      submit: true,
      expire: 10,
      force_network: "MAINNET",
    }

    if (SUPABASE_URL) {
      payloadOptions.webhook = `${SUPABASE_URL}/functions/v1/xaman-webhook-xrpl`
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
        instruction: `Donate ${amount} XRP to xBase`,
        identifier: `xbase-donate-xrpl-${Date.now()}`,
      },
    }

    console.log("Creating Xaman XRPL payload:", JSON.stringify(payload))

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
      console.log("Xaman XRPL payload created:", data.uuid)

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
