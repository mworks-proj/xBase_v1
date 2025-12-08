"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Status = "pending" | "signed" | "rejected" | "expired" | "error"

export default function DonateStatusPage() {
  const searchParams = useSearchParams()
  const payloadId = searchParams.get("payloadId")
  const network = searchParams.get("network") || "xahau"
  const [status, setStatus] = useState<Status>("pending")
  const [txid, setTxid] = useState<string | null>(null)

  useEffect(() => {
    if (!payloadId) {
      setStatus("error")
      return
    }

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/auth/xaman/status/${payloadId}`)
        const data = await response.json()

        if (data.signed && data.txid) {
          setStatus("signed")
          setTxid(data.txid)
        } else if (data.rejected) {
          setStatus("rejected")
        } else if (data.expired) {
          setStatus("expired")
        }
      } catch (error) {
        console.error("Status check failed:", error)
      }
    }

    const interval = setInterval(checkStatus, 3000)
    checkStatus()

    return () => clearInterval(interval)
  }, [payloadId])

  const statusConfig = {
    pending: {
      icon: <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />,
      bgColor: "bg-blue-100",
      title: "Waiting for Signature",
      description: "Please sign the transaction in your Xaman wallet.",
    },
    signed: {
      icon: <CheckCircle className="h-10 w-10 text-green-600" />,
      bgColor: "bg-green-100",
      title: "Transaction Signed!",
      description: "Your donation has been successfully processed.",
    },
    rejected: {
      icon: <XCircle className="h-10 w-10 text-red-600" />,
      bgColor: "bg-red-100",
      title: "Transaction Rejected",
      description: "The transaction was not signed.",
    },
    expired: {
      icon: <Clock className="h-10 w-10 text-amber-600" />,
      bgColor: "bg-amber-100",
      title: "Transaction Expired",
      description: "The signing request has expired. Please try again.",
    },
    error: {
      icon: <XCircle className="h-10 w-10 text-red-600" />,
      bgColor: "bg-red-100",
      title: "Error",
      description: "Something went wrong. Please try again.",
    },
  }

  const config = statusConfig[status]
  const explorerNetwork = network === "xrpl" ? "mainnet" : network

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${config.bgColor}`}>
            {config.icon}
          </div>
          <CardTitle className="text-2xl">{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "signed" && txid && (
            <>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                <p className="font-mono text-xs break-all">{txid}</p>
              </div>
              <a
                href={`https://xumm.app/explorer/${explorerNetwork}/${txid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
              >
                View on Explorer <ExternalLink className="h-4 w-4" />
              </a>
            </>
          )}

          <div className="pt-4">
            <Button asChild className="w-full">
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
