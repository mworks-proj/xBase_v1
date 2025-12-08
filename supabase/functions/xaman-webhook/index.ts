import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/web/window.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface WebhookPayload {
  meta: {
    url: string
    application: {
      name: string
      uuidv4: string
    }
    payload_uuidv4: string
    custom_identifier?: string
  }
  custom_meta?: {
    identifier?: string
    instruction?: string
  }
  payloadResponse?: {
    payload_uuidv4: string
    signed: boolean
    txid?: string
  }
  userToken?: {
    user_token: string
    token_issued: number
    token_expiration: number
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const XUMM_API_KEY = Deno.env.get("XUMM_API_KEY")
    const XUMM_API_SECRET = Deno.env.get("XUMM_API_SECRET")
    const XAH_DESTINATION = Deno.env.get("XAH_DESTINATION")
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!XUMM_API_KEY || !XUMM_API_SECRET) {
      console.error("Missing Xaman API credentials")
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const webhookData: WebhookPayload = await req.json()
    console.log("Webhook received:", JSON.stringify(webhookData))

    const payloadUuid = webhookData.meta?.payload_uuidv4

    if (!payloadUuid) {
      return new Response(JSON.stringify({ error: "Missing payload UUID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Fetch full payload status from Xaman API
    const statusResponse = await fetch(`https://xumm.app/api/v1/platform/payload/${payloadUuid}`, {
      method: "GET",
      headers: {
        "X-API-Key": XUMM_API_KEY,
        "X-API-Secret": XUMM_API_SECRET,
      },
    })

    if (!statusResponse.ok) {
      const error = await statusResponse.json()
      console.error("Failed to fetch payload status:", error)
      return new Response(JSON.stringify({ error: "Failed to verify transaction" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const payloadStatus = await statusResponse.json()
    console.log("Payload status:", JSON.stringify(payloadStatus))

    const response = payloadStatus.response
    const payload = payloadStatus.payload

    if (!response?.dispatched_result) {
      console.log("Transaction not yet submitted")
      return new Response(JSON.stringify({ ok: true, verified: false, reason: "Transaction not submitted" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const txResult = response.dispatched_result
    const isSuccess = txResult === "tesSUCCESS"
    const txDestination = response.destination
    const destinationMatch = txDestination === XAH_DESTINATION
    const networkId = response.networkId
    const signerAccount = response.account
    const txHash = response.txid

    // Determine network (21337 = Xahau, 0 or undefined = XRPL)
    const network = networkId === 21337 ? "xahau" : "xrpl"
    const currency = network === "xahau" ? "XAH" : "XRP"

    // Get amount from payload (in drops)
    const amountDrops = payload?.request_json?.Amount
    const amount = amountDrops ? Number(amountDrops) / 1_000_000 : 0

    // Get memo if present
    const memos = payload?.request_json?.Memos
    let memo = ""
    if (memos && memos[0]?.Memo?.MemoData) {
      try {
        memo = new TextDecoder().decode(
          new Uint8Array(memos[0].Memo.MemoData.match(/.{1,2}/g).map((byte: string) => Number.parseInt(byte, 16))),
        )
      } catch (e) {
        console.error("Failed to decode memo:", e)
      }
    }

    const verified = isSuccess && destinationMatch

    console.log("Verification result:", {
      txResult,
      isSuccess,
      destinationMatch,
      verified,
      txHash,
      signerAccount,
      amount,
      network,
    })

    if (verified && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        const { error: insertError } = await supabase.from("donations").insert({
          network,
          amount,
          currency,
          memo: memo || null,
          tx_hash: txHash,
          sender_address: signerAccount,
          status: "completed",
          payload_uuid: payloadUuid,
          completed_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("Failed to store donation:", insertError)
        } else {
          console.log("Donation stored successfully")
        }
      } catch (dbError) {
        console.error("Database error:", dbError)
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        verified,
        txHash,
        txResult,
        signerAccount,
        destination: txDestination,
        networkId,
        payloadUuid,
        amount,
        network,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("Webhook error:", error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
