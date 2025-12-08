import { type NextRequest, NextResponse } from "next/server"

interface StatusResponse {
  signed: boolean
  rejected: boolean
  expired: boolean
  txid?: string
  error?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ payloadId: string }> },
): Promise<NextResponse<StatusResponse>> {
  try {
    const { payloadId } = await params

    if (!payloadId) {
      return NextResponse.json(
        { signed: false, rejected: false, expired: false, error: "Missing payloadId" },
        { status: 400 },
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { signed: false, rejected: false, expired: false, error: "Server configuration error" },
        { status: 500 },
      )
    }

    // Call Supabase Edge Function
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/xaman-status?payloadId=${payloadId}`

    const response = await fetch(edgeFunctionUrl, {
      headers: {
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[xBase] Edge function status error:", errorData)
      return NextResponse.json(
        { signed: false, rejected: false, expired: false, error: "Failed to fetch status" },
        { status: response.status },
      )
    }

    const data = await response.json()

    return NextResponse.json({
      signed: data.signed === true,
      rejected: data.rejected === true,
      expired: data.expired === true,
      txid: data.txid,
    })
  } catch (error) {
    console.error("[xBase] Status check error:", error)
    return NextResponse.json(
      { signed: false, rejected: false, expired: false, error: "Status check failed" },
      { status: 500 },
    )
  }
}
