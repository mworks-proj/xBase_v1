// Xaman types and API client - Ledger-aware version
// Docs: https://docs.xaman.dev/
// NOTE: This is a server-only module - do not import in client components

import "server-only"

// =============================================================================
// Types
// =============================================================================

export type Ledger = "xrpl" | "xahau"

export interface LedgerConfig {
  id: Ledger
  name: string
  nativeCurrency: string
  destinationAddress: string
  destinationTag?: number
  networkId?: number
  explorerUrl: string
}

export interface XamanPayloadRequest {
  txjson: {
    TransactionType: string
    Destination: string
    Amount: string
    DestinationTag?: number
    NetworkID?: number
    [key: string]: unknown
  }
  options?: {
    submit?: boolean
    expire?: number
    return_url?: {
      app?: string
      web?: string
    }
    force_network?: string
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
    always: string
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
    opened_by_deeplink: boolean | null
    return_url_app: string | null
    return_url_web: string | null
    is_xapp: boolean
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
    origintype: string | null
    signmethod: string | null
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
    environment_nodeuri: string | null
    environment_nodetype: string | null
    environment_networkid: number | null
  }
  custom_meta: {
    identifier: string | null
    blob: Record<string, unknown> | null
    instruction: string | null
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

// =============================================================================
// Configuration
// =============================================================================

const XAMAN_API_URL = "https://xumm.app/api/v1"

// Ledger configurations - destination addresses from environment variables
export const LEDGER_CONFIGS: Record<Ledger, LedgerConfig> = {
  xrpl: {
    id: "xrpl",
    name: "XRP Ledger",
    nativeCurrency: "XRP",
    destinationAddress: process.env.XRPL_DESTINATION_ADDRESS || "",
    destinationTag: process.env.XRPL_DESTINATION_TAG ? parseInt(process.env.XRPL_DESTINATION_TAG) : undefined,
    networkId: 0,
    explorerUrl: "https://livenet.xrpl.org",
  },
  xahau: {
    id: "xahau",
    name: "Xahau",
    nativeCurrency: "XAH",
    destinationAddress: process.env.XAHAU_DESTINATION_ADDRESS || "",
    destinationTag: process.env.XAHAU_DESTINATION_TAG ? parseInt(process.env.XAHAU_DESTINATION_TAG) : undefined,
    networkId: 21337,
    explorerUrl: "https://explorer.xahau.network",
  },
}

// Map network IDs to ledger types for verification
export const NETWORK_ID_TO_LEDGER: Record<number, Ledger> = {
  0: "xrpl",      // XRPL Mainnet
  1: "xrpl",      // XRPL Testnet
  2: "xrpl",      // XRPL Devnet
  21337: "xahau", // Xahau Mainnet
  21338: "xahau", // Xahau Testnet
}

// =============================================================================
// API Helpers
// =============================================================================

function getXamanHeaders(): HeadersInit {
  const apiKey = process.env.XAMAN_API_KEY
  const apiSecret = process.env.XAMAN_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error("XAMAN_API_KEY and XAMAN_API_SECRET must be set")
  }

  return {
    "Content-Type": "application/json",
    "X-API-Key": apiKey,
    "X-API-Secret": apiSecret,
  }
}

// =============================================================================
// API Functions
// =============================================================================

export async function createXamanPayload(
  payload: XamanPayloadRequest
): Promise<XamanPayloadResponse> {
  const response = await fetch(`${XAMAN_API_URL}/platform/payload`, {
    method: "POST",
    headers: getXamanHeaders(),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("Xaman API error:", error)
    throw new Error(`Xaman API error: ${response.status}`)
  }

  return response.json()
}

export async function getXamanPayloadStatus(
  payloadUuid: string
): Promise<XamanPayloadStatus> {
  const response = await fetch(
    `${XAMAN_API_URL}/platform/payload/${payloadUuid}`,
    {
      method: "GET",
      headers: getXamanHeaders(),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    console.error("Xaman API error:", error)
    throw new Error(`Xaman API error: ${response.status}`)
  }

  return response.json()
}

export async function cancelXamanPayload(payloadUuid: string): Promise<boolean> {
  const response = await fetch(
    `${XAMAN_API_URL}/platform/payload/${payloadUuid}`,
    {
      method: "DELETE",
      headers: getXamanHeaders(),
    }
  )

  return response.ok
}

// =============================================================================
// Ledger Helpers
// =============================================================================

export function getLedgerFromNetworkId(networkId: number | null): Ledger | null {
  if (networkId === null) return null
  return NETWORK_ID_TO_LEDGER[networkId] || null
}

export function verifyLedgerMatch(
  expectedLedger: Ledger,
  actualNetworkId: number | null
): { valid: boolean; actualLedger: Ledger | null; message: string } {
  const actualLedger = getLedgerFromNetworkId(actualNetworkId)
  
  if (actualLedger === null) {
    return {
      valid: false,
      actualLedger: null,
      message: `Unknown network ID: ${actualNetworkId}`,
    }
  }

  if (actualLedger !== expectedLedger) {
    return {
      valid: false,
      actualLedger,
      message: `Ledger mismatch: expected ${expectedLedger}, got ${actualLedger}`,
    }
  }

  return {
    valid: true,
    actualLedger,
    message: "Ledger verified",
  }
}

export function getLedgerConfig(ledger: Ledger): LedgerConfig {
  return LEDGER_CONFIGS[ledger]
}

export function getExplorerUrl(ledger: Ledger, txHash: string): string {
  const config = LEDGER_CONFIGS[ledger]
  return `${config.explorerUrl}/transactions/${txHash}`
}
