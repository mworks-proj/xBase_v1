import { type NextRequest, NextResponse } from "next/server"

// This route receives webhook callbacks from Xaman
// and verifies the transaction directly with Xaman API

interface XamanWebhookPayload {
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
    reference_call_uuidv4: string
    signed: boolean
    user_token: boolean
    return_url: {
      app: string | null
      web: string | null
    }
    txid?: string
  }
  userToken?: {
    user_token: string
    token_issued: number
    token_expiration: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: XamanWebhookPayload = await request.json()

    console.log("[xbase] Xaman webhook received:", JSON.stringify(payload))

    const payloadUuid = payload.meta?.payload_uuidv4

    if (!payloadUuid) {
      return NextResponse.json({ error: "Missing payload UUID" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !anonKey) {
      console.error("[xBase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Forward to Supabase Edge Function for secure verification
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/xaman-webhook`

    const response = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()
    console.log("[xBase] Webhook verification result:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[xBase] Webhook handler error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Allow GET for webhook URL verification (some services ping GET first)
export async function GET() {
  return NextResponse.json({ status: "ok", message: "xBase webhook endpoint" })
}
