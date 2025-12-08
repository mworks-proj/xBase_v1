"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react"

type Network = "xahau" | "xrpl"
type PayloadStatus = "idle" | "creating" | "pending" | "signed" | "rejected" | "expired" | "error"

const PRESET_AMOUNTS: Record<Network, number[]> = {
  xahau: [10, 50, 100],
  xrpl: [5, 25, 50],
}

const NETWORK_CONFIG: Record<Network, { label: string; symbol: string; description: string; explorerNetwork: string }> =
  {
    xahau: { label: "Xahau", symbol: "XAH", description: "Xahau Network", explorerNetwork: "xahau" },
    xrpl: { label: "XRPL", symbol: "XRP", description: "XRP Ledger", explorerNetwork: "mainnet" },
  }

export function DonateXahForm() {
  const [network, setNetwork] = useState<Network>("xahau")
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [memo, setMemo] = useState("")
  const [payloadStatus, setPayloadStatus] = useState<PayloadStatus>("idle")
  const [payloadId, setPayloadId] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const finalAmount = selectedAmount ?? (customAmount ? Number.parseFloat(customAmount) : 0)
  const config = NETWORK_CONFIG[network]

  const checkPayloadStatus = async (uuid: string) => {
    try {
      const response = await fetch(`/api/auth/xaman/status/${uuid}`)
      const data = await response.json()

      console.log("[xbase] Payload status:", data)

      if (data.signed && data.txid) {
        setPayloadStatus("signed")
        setTxHash(data.txid)
        return true // Stop polling
      } else if (data.rejected) {
        setPayloadStatus("rejected")
        return true // Stop polling
      } else if (data.expired) {
        setPayloadStatus("expired")
        return true // Stop polling
      }

      return false // Continue polling
    } catch (err) {
      console.error("[xbase] Status check failed:", err)
      return false
    }
  }

  const handleDonate = async () => {
    if (!finalAmount || finalAmount <= 0) {
      setError("Please select or enter an amount")
      return
    }

    setPayloadStatus("creating")
    setError(null)
    setTxHash(null)

    try {
      const endpoint =
        network === "xahau"
          ? "/api/auth/xaman/create-payload/xahau-payload"
          : "/api/auth/xaman/create-payload/xrpl-payload"

      const returnUrl = `${window.location.origin}/?donation=processing`

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          memo: memo || undefined,
          returnUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment request")
      }

      if (data.ok && data.uuid && data.nextUrl) {
        setPayloadId(data.uuid)
        setPayloadStatus("pending")

        const pollInterval = setInterval(async () => {
          const shouldStop = await checkPayloadStatus(data.uuid)
          if (shouldStop) {
            clearInterval(pollInterval)
          }
        }, 2000) // Poll every 2 seconds

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        if (isMobile) {
          window.location.href = data.nextUrl
        } else {
          window.open(data.nextUrl, "_blank", "noopener,noreferrer")
        }

        setTimeout(() => {
          clearInterval(pollInterval)
          if (payloadStatus === "pending") {
            setPayloadStatus("expired")
          }
        }, 300000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setPayloadStatus("error")
    }
  }

  const resetForm = () => {
    setPayloadStatus("idle")
    setPayloadId(null)
    setTxHash(null)
    setError(null)
    setSelectedAmount(null)
    setCustomAmount("")
    setMemo("")
  }

  if (payloadStatus === "signed" && txHash) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-2 pb-4">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-center text-xl">Donation Successful!</CardTitle>
          <CardDescription className="text-center text-sm">
            Thank you for supporting xMerch CLI and Xahau development
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="rounded-lg bg-muted p-2">
            <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
            <p className="font-mono text-xs break-all">{txHash}</p>
          </div>
          <a
            href={`https://xumm.app/explorer/${config.explorerNetwork}/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
          >
            View on Explorer <ExternalLink className="h-4 w-4" />
          </a>
          <Button onClick={resetForm} variant="outline" className="w-full bg-transparent">
            Make Another Donation
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (payloadStatus === "rejected" || payloadStatus === "expired" || payloadStatus === "error") {
    const statusConfig = {
      rejected: { title: "Transaction Rejected", description: "You declined the transaction in Xaman wallet" },
      expired: { title: "Request Expired", description: "The payment request timed out" },
      error: { title: "Error Occurred", description: error || "Something went wrong" },
    }
    const config = statusConfig[payloadStatus as "rejected" | "expired" | "error"]

    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-2 pb-4">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-center text-xl">{config.title}</CardTitle>
          <CardDescription className="text-center text-sm">{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button onClick={resetForm} variant="outline" className="w-full bg-transparent">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (payloadStatus === "pending") {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-2 pb-4">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <CardTitle className="text-center text-xl">Waiting for Signature</CardTitle>
          <CardDescription className="text-center text-sm">
            Please sign the transaction in your Xaman wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button onClick={resetForm} variant="outline" className="w-full bg-transparent">
            Cancel
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="text-xl">Donate</CardTitle>
        <CardDescription className="text-sm">Support the project with XAH or XRP via Xaman wallet</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Select Network</Label>
          <div className="flex gap-2">
            {(Object.keys(NETWORK_CONFIG) as Network[]).map((net) => (
              <Button
                key={net}
                type="button"
                variant={network === net ? "default" : "outline"}
                className={cn(
                  "flex-1 h-9 transition-all duration-300",
                  network === net && "ring-2 ring-primary ring-offset-2 shadow-lg scale-105",
                )}
                onClick={() => {
                  setNetwork(net)
                  setSelectedAmount(null)
                  setCustomAmount("")
                }}
                disabled={payloadStatus === "creating"}
              >
                {NETWORK_CONFIG[net].label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">Select Amount ({config.symbol})</Label>
          <div className="flex gap-2">
            {PRESET_AMOUNTS[network].map((amount) => (
              <Button
                key={amount}
                type="button"
                variant={selectedAmount === amount ? "default" : "outline"}
                className={cn(
                  "flex-1 h-9 transition-all duration-300",
                  selectedAmount === amount && "ring-2 ring-primary ring-offset-2 shadow-lg scale-105",
                )}
                onClick={() => {
                  setSelectedAmount(amount)
                  setCustomAmount("")
                }}
                disabled={payloadStatus === "creating"}
              >
                <span className="font-semibold">{amount}</span>
                <span className="text-xs ml-1 opacity-70">{config.symbol}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-amount" className="text-sm font-semibold">
            Or enter custom amount
          </Label>
          <Input
            id="custom-amount"
            type="number"
            placeholder={`Enter amount in ${config.symbol}`}
            min="0.000001"
            step="0.000001"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value)
              setSelectedAmount(null)
            }}
            disabled={payloadStatus === "creating"}
            className="h-9 bg-background/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="memo" className="text-sm font-semibold">
            Memo (optional)
          </Label>
          <Input
            id="memo"
            type="text"
            placeholder="Add a message to your donation"
            maxLength={140}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            disabled={payloadStatus === "creating"}
            className="h-9 bg-background/50"
          />
          <p className="text-xs text-muted-foreground">{memo.length}/140 characters</p>
        </div>

        {error && (
          <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button
          className="w-full h-10 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
          onClick={handleDonate}
          disabled={payloadStatus === "creating" || !finalAmount}
        >
          {payloadStatus === "creating" ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Payment...
            </>
          ) : (
            `Donate ${finalAmount || 0} ${config.symbol}`
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">Opens Xaman wallet to complete the transaction</p>
      </CardContent>
    </Card>
  )
}
