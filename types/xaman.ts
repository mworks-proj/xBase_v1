// Xaman/XUMM API types for xBase

export interface XamanPayloadRequest {
  amount: number
  memo?: string
}

export interface XamanPayloadResponse {
  ok: boolean
  uuid?: string
  nextUrl?: string
  qrPng?: string
  websocketUrl?: string
  error?: string
}

export interface XamanTxJson {
  TransactionType: "Payment" | "TrustSet" | "NFTokenMint" | string
  Destination?: string
  Amount?:
    | string
    | {
        currency: string
        issuer: string
        value: string
      }
  NetworkID?: number
  Memos?: Array<{
    Memo: {
      MemoType?: string
      MemoData?: string
      MemoFormat?: string
    }
  }>
  Flags?: number
  Fee?: string
  Sequence?: number
  LastLedgerSequence?: number
}

export interface XamanPayload {
  txjson: XamanTxJson
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
    instruction?: string
    identifier?: string
    blob?: Record<string, unknown>
  }
  user_token?: string
}

export interface XamanWebhookMeta {
  url: string
  application: {
    name: string
    description: string
    disabled: number
    uuidv4: string
    icon_url: string
    issued_user_token: string | null
  }
  payload_uuidv4: string
  custom_identifier?: string
}

export interface XamanWebhookPayloadResponse {
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

export interface XamanWebhookData {
  meta: XamanWebhookMeta
  custom_meta?: {
    identifier?: string
    instruction?: string
    blob?: Record<string, unknown>
  }
  payloadResponse?: XamanWebhookPayloadResponse
  userToken?: {
    user_token: string
    token_issued: number
    token_expiration: number
  }
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
    request_json: {
      TransactionType: string
      Destination?: string
      Amount?: string
      NetworkID?: number
      Memos?: Array<{
        Memo: {
          MemoType?: string
          MemoData?: string
        }
      }>
    }
    origintype: string
    signmethod: string | null
    created_at: string
    expires_at: string
    expires_in_seconds: number
    computed?: {
      Destination?: {
        name?: string
        domain?: string
        kycapproved?: boolean
      }
    }
  }
  response?: {
    hex?: string
    txid?: string
    resolved_at?: string
    dispatched_to?: string
    dispatched_nodetype?: string
    dispatched_result?: string
    dispatched_to_node?: boolean
    environment_nodeuri?: string
    environment_nodetype?: string
    multisign_account?: string
    account?: string
    signer?: string
    user?: string
    destination?: string
    resolved?: boolean
    networkId?: number
  }
  custom_meta?: {
    identifier?: string
    instruction?: string
    blob?: Record<string, unknown>
  }
}

// Transaction verification result
export interface TxVerificationResult {
  verified: boolean
  txHash?: string
  txResult?: string
  signerAccount?: string
  destination?: string
  networkId?: number
  amount?: string
  memo?: string
  reason?: string
}
