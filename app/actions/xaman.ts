"use server"

import { createClient } from "@/lib/supabase/server"
import { 
  createXamanPayload, 
  getXamanPayloadStatus,
  getLedgerConfig,
  getLedgerFromNetworkId,
  verifyLedgerMatch,
  type Ledger,
} from "@/lib/xaman"
import { usdToXrpDrops, dropsToXrp } from "@/lib/xrp-utils"
import { getServiceById, isCustomQuote } from "@/lib/products"
import { v4 as uuidv4 } from "uuid"

// Get current XRP price from an oracle (placeholder - use CoinGecko, etc.)
async function getXrpPrice(): Promise<number> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd",
      { next: { revalidate: 60 } }
    )
    if (response.ok) {
      const data = await response.json()
      return data.ripple?.usd || 2.50
    }
  } catch (error) {
    console.error("Failed to fetch XRP price:", error)
  }
  return 2.50
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
  ledger?: Ledger
}

export async function createXamanPayment(
  serviceId: string,
  taxReturnId?: string,
  ledger: Ledger = "xrpl"
): Promise<CreateXamanPaymentResult> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: "Please sign in to continue" }
    }

    const service = getServiceById(serviceId)
    if (!service) {
      return { success: false, error: "Invalid service selected" }
    }

    if (isCustomQuote(serviceId)) {
      return { success: false, error: "This service requires a custom quote. Please contact us." }
    }

    // Get ledger configuration
    const ledgerConfig = getLedgerConfig(ledger)
    if (!ledgerConfig.destinationAddress) {
      return { success: false, error: `${ledgerConfig.name} payments not configured. Please set ${ledger.toUpperCase()}_DESTINATION_ADDRESS.` }
    }

    // Get current price and calculate amount
    const xrpPrice = await getXrpPrice()
    const usdAmount = service.priceInCents / 100
    const xrpDrops = usdToXrpDrops(usdAmount, xrpPrice)
    const xrpAmount = dropsToXrp(xrpDrops)

    // Generate unique identifier
    const customId = uuidv4()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    // Build transaction JSON
    const txjson: Record<string, unknown> = {
      TransactionType: "Payment",
      Destination: ledgerConfig.destinationAddress,
      Amount: xrpDrops,
    }

    if (ledgerConfig.destinationTag) {
      txjson.DestinationTag = ledgerConfig.destinationTag
    }

    // Add NetworkID for Xahau
    if (ledger === "xahau" && ledgerConfig.networkId) {
      txjson.NetworkID = ledgerConfig.networkId
    }

    // Create Xaman payload
    const payload = await createXamanPayload({
      txjson: txjson as { TransactionType: string; Destination: string; Amount: string; DestinationTag?: number },
      options: {
        submit: true,
        expire: 15,
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
          expected_ledger: ledger,
        },
        instruction: `Pay ${xrpAmount.toFixed(2)} ${ledgerConfig.nativeCurrency} for ${service.name}`,
      },
    })

    // Create pending payment record
    const paymentData: Record<string, unknown> = {
      user_id: user.id,
      amount: usdAmount,
      currency: ledgerConfig.nativeCurrency.toLowerCase(),
      payment_method: "xaman",
      provider: "xaman",
      status: "pending",
      description: service.name,
      xaman_payload_uuid: payload.uuid,
      xaman_payload_custom_id: customId,
      xaman_payload_status: "pending",
      expected_ledger: ledger,
      destination_address: ledgerConfig.destinationAddress,
      destination_tag: ledgerConfig.destinationTag,
      amount_drops: xrpDrops,
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
      ledger,
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
  status: "pending" | "signed" | "rejected" | "cancelled" | "expired" | "failed"
  txHash?: string
  sourceAddress?: string
  networkId?: number
  ledger?: string
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
      const networkId = status.response.environment_networkid
      const ledger = networkId !== null ? getLedgerFromNetworkId(networkId) : null
      
      return { 
        success: true, 
        status: "signed", 
        txHash: status.response.txid,
        sourceAddress: status.response.account || undefined,
        networkId: networkId || undefined,
        ledger: ledger || undefined,
      }
    }

    if (status.meta.resolved && !status.meta.signed) {
      return { success: true, status: "rejected" }
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

export async function verifyAndCompleteXamanPayment(
  customId: string
): Promise<{ 
  success: boolean
  error?: string
  txHash?: string
  ledger?: string
  ledgerMismatch?: boolean
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("xaman_payload_custom_id", customId)
      .eq("user_id", user.id)
      .single()

    if (paymentError || !payment) {
      return { success: false, error: "Payment not found" }
    }

    // If already completed, return success
    if (payment.status === "completed" && payment.tx_hash) {
      return { 
        success: true, 
        txHash: payment.tx_hash,
        ledger: payment.ledger,
      }
    }

    if (!payment.xaman_payload_uuid) {
      return { success: false, error: "No Xaman payload associated" }
    }

    // Get the status from Xaman
    const status = await getXamanPayloadStatus(payment.xaman_payload_uuid)

    if (!status.meta.resolved) {
      return { success: false, error: "Payment not yet resolved" }
    }

    if (!status.meta.signed || !status.response.txid) {
      const failStatus = status.meta.cancelled ? "cancelled" : status.meta.expired ? "expired" : "rejected"
      
      await supabase
        .from("payments")
        .update({
          status: "failed",
          xaman_signed: false,
          xaman_resolved: true,
          xaman_payload_status: failStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id)

      return { success: false, error: "Payment was not signed" }
    }

    // Verify ledger if expected_ledger was set
    const expectedLedger = payment.expected_ledger as Ledger | null
    const networkId = status.response.environment_networkid
    const actualLedger = networkId !== null ? getLedgerFromNetworkId(networkId) : null
    let ledgerMismatch = false

    if (expectedLedger && networkId !== null) {
      const verification = verifyLedgerMatch(expectedLedger, networkId)
      if (!verification.valid) {
        console.warn(`Ledger mismatch for payment ${payment.id}: ${verification.message}`)
        ledgerMismatch = true
      }
    }

    // Update payment as completed
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: "completed",
        tx_hash: status.response.txid,
        source_address: status.response.account,
        ledger: actualLedger,
        network_id: networkId?.toString(),
        network_endpoint: status.response.environment_nodeuri,
        xaman_signed: true,
        xaman_resolved: true,
        xaman_payload_status: "signed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id)

    if (updateError) {
      console.error("Error updating payment:", updateError)
      return { success: false, error: "Failed to update payment record" }
    }

    // Update tax return if linked
    if (payment.tax_return_id) {
      await supabase
        .from("tax_returns")
        .update({
          payment_status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.tax_return_id)
    }

    return { 
      success: true, 
      txHash: status.response.txid,
      ledger: actualLedger || undefined,
      ledgerMismatch,
    }
  } catch (error) {
    console.error("Error verifying Xaman payment:", error)
    return { success: false, error: "Failed to verify payment" }
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
