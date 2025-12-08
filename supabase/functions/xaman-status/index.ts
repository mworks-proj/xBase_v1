// Supabase Edge Function for checking Xaman payload status
// Deploy with: supabase functions deploy xaman-status
// Secrets needed: XUMM_API_KEY, XUMM_API_SECRET

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

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const payloadId = url.searchParams.get("payloadId")

    if (!payloadId) {
      return new Response(JSON.stringify({ error: "Missing payloadId parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Get Xaman API credentials from Supabase secrets
    const XUMM_API_KEY = Deno.env.get("XUMM_API_KEY")
    const XUMM_API_SECRET = Deno.env.get("XUMM_API_SECRET")

    if (!XUMM_API_KEY || !XUMM_API_SECRET) {
      console.error("Missing XUMM_API_KEY or XUMM_API_SECRET")
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Get payload status from Xaman
    const response = await fetch(`https://xumm.app/api/v1/platform/payload/${payloadId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": XUMM_API_KEY,
        "X-API-Secret": XUMM_API_SECRET,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Xaman API error:", errorText)
      return new Response(JSON.stringify({ error: "Failed to fetch payload status" }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const data = await response.json()
    const meta = data.meta || {}
    const responseData = data.response || {}

    // Determine status
    const signed = meta.signed === true
    const rejected = meta.cancelled === true || meta.rejected === true
    const expired = meta.expired === true
    const txid = responseData.txid || null

    const networkId = responseData.networkId
    const network = networkId === 21337 ? "xahau" : "mainnet"

    // Format: https://xumm.app/explorer/{network}/{txhash}
    // Also support CTID if available: https://xumm.app/explorer/{ctid}
    let explorerUrl = null
    if (txid) {
      // Check if CTID is available (more efficient)
      const ctid = responseData.ctid
      if (ctid) {
        explorerUrl = `https://xumm.app/explorer/${ctid}`
      } else {
        explorerUrl = `https://xumm.app/explorer/${network}/${txid}`
      }
    }

    return new Response(
      JSON.stringify({
        signed,
        rejected,
        expired,
        txid,
        network,
        explorerUrl,
        resolvedAt: meta.resolved_at,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("Status check error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
