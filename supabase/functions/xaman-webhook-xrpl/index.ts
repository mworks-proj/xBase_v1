import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/runtime.ts" // Import Deno to fix the undeclared variable error

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}
const DEFAULT_XRPL_RPC = "https://xrplcluster.com" // mainnet cluster
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    })
  }
  try {
    const XUMM_API_KEY = Deno.env.get("XUMM_API_KEY_XRPL")
    const XUMM_API_SECRET = Deno.env.get("XUMM_API_SECRET_XRPL")
    const XRP_DESTINATION = Deno.env.get("XRP_DESTINATION")
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    const XRPL_RPC_URL = Deno.env.get("XRPL_RPC_URL") || DEFAULT_XRPL_RPC
    const XRPL_NETWORK = (Deno.env.get("XRPL_NETWORK") || "mainnet") === "testnet" ? "testnet" : "mainnet"
    if (!XUMM_API_KEY || !XUMM_API_SECRET) {
      console.error("Missing XRPL Xaman API credentials")
      return new Response(
        JSON.stringify({
          error: "Server configuration error",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      )
    }
    const webhookData = await req.json()
    console.log("XRPL webhook received:", JSON.stringify(webhookData))
    const payloadUuid = webhookData.meta?.payload_uuidv4
    if (!payloadUuid) {
      return new Response(
        JSON.stringify({
          error: "Missing payload UUID",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      )
    }
    // Fetch payload status from Xaman (XRPL app)
    const statusResponse = await fetch(`https://xumm.app/api/v1/platform/payload/${payloadUuid}`, {
      method: "GET",
      headers: {
        "X-API-Key": XUMM_API_KEY,
        "X-API-Secret": XUMM_API_SECRET,
      },
    })
    if (!statusResponse.ok) {
      const error = await statusResponse.text()
      console.error("Failed to fetch XRPL payload status:", error)
      return new Response(
        JSON.stringify({
          error: "Failed to verify transaction",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      )
    }
    const payloadStatus = await statusResponse.json()
    const response = payloadStatus.response
    const payload = payloadStatus.payload
    const txidFromPayload = response?.txid
    if (!txidFromPayload) {
      return new Response(
        JSON.stringify({
          ok: true,
          verified: false,
          reason: "txid not available yet",
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      )
    }
    // Verify on-ledger via XRPL RPC
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    let txResult = ""
    let deliveredDrops = 0
    let deliveredXRP = 0
    let signerAccount = ""
    let ctid
    let destination
    try {
      const rpcResponse = await fetch(XRPL_RPC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "tx",
          params: [
            {
              transaction: txidFromPayload,
              binary: false,
            },
          ],
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      if (!rpcResponse.ok) {
        const rpcText = await rpcResponse.text()
        console.error("XRPL RPC error:", rpcText)
        return new Response(
          JSON.stringify({
            error: "Failed to fetch transaction from XRPL RPC",
          }),
          {
            status: 502,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        )
      }
      const rpcJson = await rpcResponse.json()
      const result = rpcJson?.result
      if (!result || !result.meta) {
        console.error("Invalid XRPL RPC response:", rpcJson)
        return new Response(
          JSON.stringify({
            error: "Invalid XRPL RPC response",
          }),
          {
            status: 502,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        )
      }
      txResult = result.meta.TransactionResult
      const deliveredRaw = result.meta.delivered_amount
      deliveredDrops = typeof deliveredRaw === "string" ? Number(deliveredRaw) : Number(deliveredRaw ?? 0)
      deliveredXRP = Number.isFinite(deliveredDrops) ? deliveredDrops / 1_000_000 : 0
      signerAccount = result.Account
      ctid = result.ctid
      destination = result.Destination
    } catch (rpcError) {
      clearTimeout(timeoutId)
      console.error("XRPL RPC fetch error:", rpcError)
      return new Response(
        JSON.stringify({
          error: "Failed to verify transaction on XRPL RPC",
        }),
        {
          status: 502,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      )
    }
    const destinationMatch = XRP_DESTINATION ? destination === XRP_DESTINATION : true
    const verified = txResult === "tesSUCCESS" && destinationMatch
    // Get memo if present (from payload)
    const memos = payload?.request_json?.Memos
    let memo = ""
    if (memos && memos[0]?.Memo?.MemoData) {
      try {
        memo = new TextDecoder().decode(
          new Uint8Array(memos[0].Memo.MemoData.match(/.{1,2}/g).map((byte) => Number.parseInt(byte, 16))),
        )
      } catch (e) {
        console.error("Failed to decode memo:", e)
      }
    }
    const explorerUrl = ctid
      ? `https://xumm.app/explorer/${ctid}`
      : txidFromPayload
        ? `https://xumm.app/explorer/${XRPL_NETWORK}/${txidFromPayload}`
        : null
    console.log("XRPL verification result:", {
      txResult,
      verified,
      txid: txidFromPayload,
      ctid,
      signerAccount,
      amount: deliveredXRP,
      destination,
      explorerUrl,
    })
    if (verified && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        const { error: insertError } = await supabase.from("donations").insert({
          network: XRPL_NETWORK === "testnet" ? "xrpl-testnet" : "xrpl",
          amount: deliveredXRP,
          currency: "XRP",
          memo: memo || null,
          tx_hash: txidFromPayload,
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
        txHash: txidFromPayload,
        txResult,
        signerAccount,
        payloadUuid,
        amount: deliveredXRP,
        network: XRPL_NETWORK === "testnet" ? "xrpl-testnet" : "xrpl",
        ctid,
        explorerUrl,
        deliveredDrops,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("XRPL webhook error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    )
  }
})
