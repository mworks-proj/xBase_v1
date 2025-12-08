import { type NextRequest, NextResponse } from "next/server"

interface XamanCallbackParams {
  payloadId?: string
  customIdentifier?: string
  txid?: string
  signed?: string
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams

    // Extract callback parameters from Xaman
    const payloadId = searchParams.get("payloadId")
    const customIdentifier = searchParams.get("customIdentifier")
    const txid = searchParams.get("txid")
    const signed = searchParams.get("signed")

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

    if (!baseUrl) {
      console.error("[xbase] NEXT_PUBLIC_BASE_URL is not set - cannot redirect")
      return NextResponse.json(
        { ok: false, error: "Server configuration error: NEXT_PUBLIC_BASE_URL not set" },
        { status: 500 },
      )
    }

    if (signed === "true" && txid) {
      // Transaction was signed successfully
      const successUrl = new URL("/donate/success", baseUrl)
      successUrl.searchParams.set("txid", txid)
      if (payloadId) successUrl.searchParams.set("payloadId", payloadId)

      return NextResponse.redirect(successUrl.toString())
    } else if (signed === "false") {
      // User rejected the transaction
      const cancelUrl = new URL("/donate/cancelled", baseUrl)
      if (payloadId) cancelUrl.searchParams.set("payloadId", payloadId)

      return NextResponse.redirect(cancelUrl.toString())
    } else {
      // Pending or unknown state - redirect to status page
      const statusUrl = new URL("/donate/status", baseUrl)
      if (payloadId) statusUrl.searchParams.set("payloadId", payloadId)

      return NextResponse.redirect(statusUrl.toString())
    }
  } catch (error) {
    console.error("[xbase] OAuth callback error:", error)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      return NextResponse.json({ ok: false, error: "Configuration error" }, { status: 500 })
    }
    return NextResponse.redirect(`${baseUrl}/donate?error=callback_failed`)
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Handle POST callbacks from Xaman (webhook style)
  try {
    const body = await request.json()

    const { payloadId, txid, signed } = body

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

    if (!baseUrl) {
      console.error("[xbase] NEXT_PUBLIC_BASE_URL is not set")
      return NextResponse.json({ ok: false, error: "Configuration error" }, { status: 500 })
    }

    // Forward to the webhook handler for verification
    const webhookUrl = `${baseUrl}/api/webhooks/xaman`

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    return NextResponse.json({ ok: true, received: true })
  } catch (error) {
    console.error("[xbase] POST callback error:", error)
    return NextResponse.json({ ok: false, error: "Callback processing failed" }, { status: 500 })
  }
}
