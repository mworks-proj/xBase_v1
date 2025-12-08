"use client"

import { useEffect, useState } from "react"

interface Donation {
  id: string
  network: "xrpl" | "xahau"
  amount: number
  currency: string
  sender_address: string
  memo?: string | null
  created_at: string
}

function truncateAddress(address: string) {
  if (!address) return "Anonymous"
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function getDonationTier(amount: number, currency: string) {
  // Only apply tiers to XAH donations
  if (currency !== "XAH") return null

  if (amount >= 9000) {
    return { label: "Legendary", color: "bg-gradient-to-r from-yellow-400 to-amber-500", icon: "🏆" }
  }
  if (amount >= 3000) {
    return { label: "Elite", color: "bg-gradient-to-r from-purple-500 to-pink-500", icon: "💎" }
  }
  if (amount >= 1000) {
    return { label: "Premium", color: "bg-gradient-to-r from-blue-500 to-cyan-500", icon: "⭐" }
  }
  return null
}

export function DonationFeed() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDonations() {
      try {
        const response = await fetch("/api/donations")
        if (response.ok) {
          const data = await response.json()
          setDonations(data)
        }
      } catch (error) {
        console.error("Failed to fetch donations:", error)
      }
      setIsLoading(false)
    }

    fetchDonations()

    const interval = setInterval(() => {
      // Only poll if tab is visible
      if (document.visibilityState === "visible") {
        fetchDonations()
      }
    }, 30000) // 30 seconds instead of 5 seconds

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground" />
      </div>
    )
  }

  if (donations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No donations yet. Be the first!</p>
      </div>
    )
  }

  // Transform to horizontal scrolling carousel with scale effect
  return (
    <div className="relative w-full overflow-hidden">
      {/* Gradient overlays for fade effect on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      {/* Horizontal scrolling container */}
      <div className="overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
        <div className="flex gap-4 px-4 py-6 min-w-max justify-center">
          {donations.map((donation, index) => {
            const tier = getDonationTier(donation.amount, donation.currency)

            return (
              <div
                key={donation.id}
                className="flex-shrink-0 w-72 sm:w-80 transition-all duration-300 hover:scale-105 snap-center"
              >
                <div className="p-4 rounded-xl bg-muted/30 border border-border/30 backdrop-blur-sm h-full flex flex-col gap-3 relative overflow-hidden group">
                  {/* Header: Address and Network */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${donation.network === "xahau" ? "bg-[#FFBA00]" : "bg-[#A855F7]"}`}
                      />
                      <span className="font-medium truncate text-sm">{truncateAddress(donation.sender_address)}</span>
                    </div>
                    {tier && (
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium text-white ${tier.color} flex items-center gap-1 whitespace-nowrap flex-shrink-0`}
                      >
                        <span>{tier.icon}</span>
                        <span>{tier.label}</span>
                      </span>
                    )}
                  </div>

                  {/* Memo */}
                  {donation.memo ? (
                    <p className="text-muted-foreground italic line-clamp-2 text-xs">"{donation.memo}"</p>
                  ) : (
                    <p className="text-muted-foreground text-xs">donated</p>
                  )}

                  {/* Amount and Time */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/20">
                    <span className="font-mono font-bold text-base">
                      {donation.amount} {donation.currency}
                    </span>
                    <span className="text-xs text-muted-foreground">{timeAgo(donation.created_at)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
