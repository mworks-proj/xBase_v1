// Utility functions for Xaman integration

/**
 * Convert a string to hex encoding
 */
export function stringToHex(str: string): string {
  return Array.from(new TextEncoder().encode(str))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()
}

/**
 * Convert hex to string
 */
export function hexToString(hex: string): string {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) || [])
  return new TextDecoder().decode(bytes)
}

/**
 * Convert XAH to drops (1 XAH = 1,000,000 drops)
 */
export function xahToDrops(xah: number): string {
  return Math.floor(xah * 1_000_000).toString()
}

/**
 * Convert drops to XAH
 */
export function dropsToXah(drops: string | number): number {
  return Number(drops) / 1_000_000
}

/**
 * Validate an XRPL/Xahau r-address
 */
export function isValidAddress(address: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address)
}

/**
 * Detect if user is on mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

/**
 * Open Xaman wallet with the given URL
 * - Mobile: redirects to the app
 * - Desktop: opens in new window
 */
export function openXamanWallet(url: string): void {
  if (isMobileDevice()) {
    window.location.href = url
  } else {
    window.open(url, "_blank", "noopener,noreferrer")
  }
}

/**
 * Format XAH amount for display
 */
export function formatXah(amount: number | string): string {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(num)
}

/**
 * Xahau NetworkID
 */
export const XAHAU_NETWORK_ID = 21337

/**
 * Transaction result codes
 */
export const TX_SUCCESS = "tesSUCCESS"
