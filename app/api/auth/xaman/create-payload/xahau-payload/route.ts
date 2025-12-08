import { type NextRequest, NextResponse } from "next/server"

interface PayloadRequest {
  amount: number
  memo?: string
}

interface PayloadResponse {
  ok: boolean
  uuid?: string
  nextUrl?: string
  qrUrl?: string
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<PayloadResponse>> {
  try {
    const body: PayloadRequest = await request.json()
    const { amount, memo } = body

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid amount" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

    if (!supabaseUrl || !anonKey) {
      console.error("[xbase] Missing SUPABASE_URL or SUPABASE_ANON_KEY")
      return NextResponse.json({ ok: false, error: "Server configuration error" }, { status: 500 })
    }

    if (!baseUrl) {
      console.error("[xbase] NEXT_PUBLIC_BASE_URL is not set")
      return NextResponse.json(
        { ok: false, error: "Server configuration error: NEXT_PUBLIC_BASE_URL not set" },
        { status: 500 },
      )
    }

    // Build return URL for callback
    const returnUrl = `${baseUrl}/api/auth/xaman/callback?payloadId={id}`

    // Call Supabase Edge Function (secrets are stored in Supabase, not exposed here)
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/xaman-createPayload`

    const response = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
      body: JSON.stringify({ amount, memo, returnUrl }),
    })

    const data = await response.json()

    if (!response.ok || !data.ok) {
      console.error("[xBase] Edge function error:", data)
      return NextResponse.json(
        { ok: false, error: data.error || "Failed to create payment request" },
        { status: response.status },
      )
    }

    return NextResponse.json({
      ok: true,
      uuid: data.uuid,
      nextUrl: data.nextUrl,
      qrUrl: data.qrUrl,
    })
  } catch (error) {
    console.error("[xbase] Payload creation error:", error)
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 })
  }
}
