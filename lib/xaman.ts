"use server"

// Xaman API client for XRPL payments
// Docs: https://docs.xaman.dev/

const XAMAN_API_URL = "https://xumm.app/api/v1"

function getXamanHeaders() {
  const apiKey = process.env.XAMAN_API_KEY
  const apiSecret = process.env.XAMAN_API_SECRET
  
  if (!apiKey || !apiSecret) {
    throw new Error("Missing XAMAN_API_KEY or XAMAN_API_SECRET environment variables")
  }
  
  return {
    "Content-Type": "application/json",
    "X-API-Key": apiKey,
    "X-API-Secret": apiSecret,
  }
}

export interface XamanPayloadRequest {
  txjson: {
    TransactionType: "Payment"
    Destination: string
    Amount: string // drops (1 XRP = 1,000,000 drops)
    DestinationTag?: number
  }
  options?: {
    submit?: boolean
    expire?: number // minutes
    return_url?: {
      app?: string
      web?: string
    }
  }
  custom_meta?: {
    identifier?: string
    blob?: Record<string, unknown>
    instruction?: string
  }
}

export interface XamanPayloadResponse {
  uuid: string
  next: {
    always: string // QR code URL or deep link
    no_push_msg_received?: string
  }
  refs: {
    qr_png: string
    qr_matrix: string
    qr_uri_quality_opts: string[]
    websocket_status: string
  }
  pushed: boolean
}

export interface XamanPayloadStatus {
  meta: {
    exists: boolean
    uuid: string
    multisign: boolean
    submit: boolean
    destination: string
    resolved_destination: string
    resolved: boolean
    signed: boolean
    cancelled: boolean
    expired: boolean
    pushed: boolean
    app_opened: boolean
    return_url_app: string | null
    return_url_web: string | null
  }
  application: {
    name: string
    description: string
    disabled: number
    uuidv4: string
    icon_url: string
    issued_user_token: string | null
  }
  payload: {
    tx_type: string
    tx_destination: string
    tx_destination_tag: number | null
    request_json: Record<string, unknown>
    origintype: string
    signmethod: string
    created_at: string
    expires_at: string
    expires_in_seconds: number
  }
  response: {
    hex: string | null
    txid: string | null
    resolved_at: string | null
    dispatched_nodetype: string | null
    dispatched_to: string | null
    dispatched_result: string | null
    multisign_account: string | null
    account: string | null
  }
}

export interface XamanWebhookPayload {
  meta: {
    url: string
    application_uuidv4: string
    payload_uuidv4: string
    opened_by_deeplink: boolean
  }
  custom_meta: {
    identifier: string | null
    blob: Record<string, unknown> | null
    instruction: string | null
  }
  payloadResponse: {
    payload_uuidv4: string
    reference_call_uuidv4: string
    signed: boolean
    user_token: boolean
    return_url: {
      app: string | null
      web: string | null
    }
    txid: string | null
  }
  userToken: {
    user_token: string | null
    token_issued: string | null
    token_expiration: string | null
  }
}

// Create a payment payload
export async function createXamanPayload(
  request: XamanPayloadRequest
): Promise<XamanPayloadResponse> {
  const response = await fetch(`${XAMAN_API_URL}/platform/payload`, {
    method: "POST",
    headers: getXamanHeaders(),
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("Xaman API error:", error)
    throw new Error(`Failed to create Xaman payload: ${response.status}`)
  }

  return response.json()
}

// Get payload status
export async function getXamanPayloadStatus(
  payloadUuid: string
): Promise<XamanPayloadStatus> {
  const response = await fetch(`${XAMAN_API_URL}/platform/payload/${payloadUuid}`, {
    method: "GET",
    headers: getXamanHeaders(),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("Xaman API error:", error)
    throw new Error(`Failed to get Xaman payload status: ${response.status}`)
  }

  return response.json()
}

// Cancel a payload
export async function cancelXamanPayload(payloadUuid: string): Promise<boolean> {
  const response = await fetch(`${XAMAN_API_URL}/platform/payload/${payloadUuid}`, {
    method: "DELETE",
    headers: getXamanHeaders(),
  })

  return response.ok
}

// Convert USD to XRP drops (1 XRP = 1,000,000 drops)
// This is a placeholder - in production, use a real price oracle
export function usdToXrpDrops(usdAmount: number, xrpPrice: number): string {
  const xrpAmount = usdAmount / xrpPrice
  const drops = Math.ceil(xrpAmount * 1_000_000) // Round up to nearest drop
  return drops.toString()
}

// Convert drops to XRP for display
export function dropsToXrp(drops: string | number): number {
  const dropsNum = typeof drops === "string" ? parseInt(drops, 10) : drops
  return dropsNum / 1_000_000
}

// Format XRP amount for display
export function formatXrp(drops: string | number): string {
  const xrp = dropsToXrp(drops)
  return xrp.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 6 
  })
}
