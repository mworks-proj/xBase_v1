// XRP utility functions (client-safe, no "use server")

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

// Format XRP price for display
export function formatXrpPrice(xrp: number): string {
  return xrp.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 6 
  })
}
