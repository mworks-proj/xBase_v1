"use server"

import { createClient } from "@/lib/supabase/server"
import { 
  createXamanPayload, 
  getXamanPayloadStatus, 
  usdToXrpDrops,
  dropsToXrp,
  type XamanPayloadStatus 
} from "@/lib/xaman"
import { getServiceById, isCustomQuote } from "@/lib/products"
import { v4 as uuidv4 } from "uuid"

// Get current XRP price from an oracle (placeholder - use CoinGecko, etc.)
async function getXrpPrice(): Promise<number> {
  try {
    // In production, use a reliable price feed
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd",
      { next: { revalidate: 60 } } // Cache for 1 minute
    )
    if (response.ok) {
      const data = await response.json()
      return data.ripple?.usd || 0.5 // Fallback price
    }
  } catch (error) {
    console.error("Failed to fetch XRP price:", error)
  }
  return 0.5 // Fallback price if API fails
}

interface CreateXamanPaymentResult {
  success: boolean
  error?: string
  paymentId?: string
  payloadUuid?: string
  qrCodeUrl?: string
  deepLink?: string
  websocketUrl?: string
  xrpAmount?: number
  expiresAt?: string
}

export async function createXamanPayment(
  serviceId: string,
  taxReturnId?: string
): Promise<CreateXamanPaymentResult> {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: "Please sign in to continue" }
    }

    // Get the service from our products array
    const service = getServiceById(serviceId)
    if (!service) {
      return { success: false, error: "Invalid service selected" }
    }

    // Reject custom quote services
    if (isCustomQuote(serviceId)) {
      return { success: false, error: "This service requires a custom quote. Please contact us." }
    }

    // Get current XRP price and calculate amount
    const xrpPrice = await getXrpPrice()
    const usdAmount = service.priceInCents / 100
    const xrpDrops = usdToXrpDrops(usdAmount, xrpPrice)
    const xrpAmount = dropsToXrp(xrpDrops)

    // Generate unique identifier for this payment
    const customId = uuidv4()
    const destinationTag = Math.floor(Math.random() * 2147483647) // Random 32-bit int

    // Get destination address from env
    const destinationAddress = process.env.XRPL_DESTINATION_ADDRESS
    if (!destinationAddress) {
      console.error("Missing XRPL_DESTINATION_ADDRESS")
      return { success: false, error: "Payment configuration error" }
    }

    // Create Xaman payload
    const payload = await createXamanPayload({
      txjson: {
        TransactionType: "Payment",
        Destination: destinationAddress,
        Amount: xrpDrops,
        DestinationTag: destinationTag,
      },
      options: {
        submit: true,
        expire: 15, // 15 minutes
        return_url: {
          web: `${process.env.NEXT_PUBLIC_APP_URL || ""}/portal/payments/xaman-success?id=${customId}`,
        },
      },
      custom_meta: {
        identifier: customId,
        blob: {
          user_id: user.id,
          tax_return_id: taxReturnId || null,
          service_id: serviceId,
          service_name: service.name,
          usd_amount: usdAmount,
          xrp_price: xrpPrice,
        },
        instruction: `Payment for ${service.name} - $${usdAmount.toFixed(2)} USD`,
      },
    })

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    // Create pending payment record
    const paymentData: Record<string, unknown> = {
      user_id: user.id,
      amount: usdAmount,
      currency: "xrp",
      payment_method: "xaman",
      provider: "xaman",
      status: "pending",
      description: service.name,
      xaman_payload_uuid: payload.uuid,
      xaman_payload_custom_id: customId,
      xrpl_destination_address: destinationAddress,
      xrpl_destination_tag: destinationTag,
      xrpl_amount_drops: xrpDrops,
      expires_at: expiresAt,
    }

    if (taxReturnId) {
      paymentData.tax_return_id = taxReturnId
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert(paymentData)
      .select("id")
      .single()

    if (paymentError) {
      console.error("Error creating payment record:", paymentError)
      return { success: false, error: "Failed to create payment record" }
    }

    return {
      success: true,
      paymentId: payment.id,
      payloadUuid: payload.uuid,
      qrCodeUrl: payload.refs.qr_png,
      deepLink: payload.next.always,
      websocketUrl: payload.refs.websocket_status,
      xrpAmount,
      expiresAt,
    }
  } catch (error) {
    console.error("Xaman payment error:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Payment creation failed" 
    }
  }
}

export async function checkXamanPaymentStatus(
  payloadUuid: string
): Promise<{
  success: boolean
  status: "pending" | "signed" | "cancelled" | "expired" | "failed"
  txHash?: string
  error?: string
}> {
  try {
    const status = await getXamanPayloadStatus(payloadUuid)

    if (status.meta.expired) {
      return { success: true, status: "expired" }
    }

    if (status.meta.cancelled) {
      return { success: true, status: "cancelled" }
    }

    if (status.meta.signed && status.response.txid) {
      return { 
        success: true, 
        status: "signed", 
        txHash: status.response.txid 
      }
    }

    if (status.meta.resolved && !status.meta.signed) {
      return { success: true, status: "failed" }
    }

    return { success: true, status: "pending" }
  } catch (error) {
    console.error("Error checking Xaman payment status:", error)
    return { 
      success: false, 
      status: "pending",
      error: error instanceof Error ? error.message : "Failed to check status" 
    }
  }
}

export async function getXamanPaymentDetails(customId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: "Unauthorized" }
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .select("*")
    .eq("xaman_payload_custom_id", customId)
    .eq("user_id", user.id)
    .single()

  if (error || !payment) {
    return { error: "Payment not found" }
  }

  return { payment }
}
