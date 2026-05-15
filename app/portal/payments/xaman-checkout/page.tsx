"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, QrCode, Smartphone, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createXamanPayment, checkXamanPaymentStatus } from "@/app/actions/xaman"
import { getServiceById } from "@/lib/products"
import { formatXrp } from "@/lib/xrp-utils"

type Ledger = "xrpl" | "xahau"
type PaymentStatus = "pending" | "signed" | "rejected" | "cancelled" | "expired" | "failed"

const LEDGER_INFO: Record<Ledger, { name: string; currency: string; description: string }> = {
  xrpl: {
    name: "XRP Ledger",
    currency: "XRP",
    description: "Pay with XRP on the XRP Ledger mainnet",
  },
  xahau: {
    name: "Xahau",
    currency: "XAH",
    description: "Pay with XAH on the Xahau network",
  },
}

function XamanCheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const serviceId = searchParams.get("service")
  const taxReturnId = searchParams.get("return") || undefined
  const initialLedger = (searchParams.get("ledger") as Ledger) || "xrpl"

  const [selectedLedger, setSelectedLedger] = useState<Ledger>(initialLedger)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState<{
    paymentId: string
    payloadUuid: string
    qrCodeUrl: string
    deepLink: string
    websocketUrl: string
    xrpAmount: number
    expiresAt: string
    ledger: Ledger
  } | null>(null)
  const [status, setStatus] = useState<PaymentStatus>("pending")
  const [txHash, setTxHash] = useState<string | null>(null)
  const [actualLedger, setActualLedger] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  const service = serviceId ? getServiceById(serviceId) : null

  // Create payment
  const initPayment = useCallback(async (ledger: Ledger) => {
    if (!serviceId) {
      setError("No service selected")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setPaymentData(null)
    setStatus("pending")
    setTxHash(null)

    const result = await createXamanPayment(serviceId, taxReturnId, ledger)
    
    if (!result.success || !result.payloadUuid) {
      setError(result.error || "Failed to create payment")
      setLoading(false)
      return
    }

    setPaymentData({
      paymentId: result.paymentId!,
      payloadUuid: result.payloadUuid,
      qrCodeUrl: result.qrCodeUrl!,
      deepLink: result.deepLink!,
      websocketUrl: result.websocketUrl!,
      xrpAmount: result.xrpAmount!,
      expiresAt: result.expiresAt!,
      ledger: result.ledger || ledger,
    })
    setLoading(false)
  }, [serviceId, taxReturnId])

  // Initialize payment on mount
  useEffect(() => {
    initPayment(selectedLedger)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle ledger change
  const handleLedgerChange = (ledger: string) => {
    if (ledger !== selectedLedger && !loading && status === "pending") {
      setSelectedLedger(ledger as Ledger)
      initPayment(ledger as Ledger)
    }
  }

  // Poll for payment status
  useEffect(() => {
    if (!paymentData?.payloadUuid || status !== "pending") return

    const interval = setInterval(async () => {
      const result = await checkXamanPaymentStatus(paymentData.payloadUuid)
      
      if (result.success) {
        if (result.status === "signed" && result.txHash) {
          setStatus("signed")
          setTxHash(result.txHash)
          if (result.ledger) {
            setActualLedger(result.ledger)
          }
          // Redirect to success page
          router.push(`/portal/payments/xaman-success?id=${paymentData.paymentId}`)
        } else if (result.status === "rejected") {
          setStatus("rejected")
        } else if (result.status === "expired") {
          setStatus("expired")
        } else if (result.status === "cancelled") {
          setStatus("cancelled")
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [paymentData?.payloadUuid, paymentData?.paymentId, status, router])

  // Countdown timer
  useEffect(() => {
    if (!paymentData?.expiresAt) return

    const updateTimer = () => {
      const now = Date.now()
      const expires = new Date(paymentData.expiresAt).getTime()
      const remaining = Math.max(0, Math.floor((expires - now) / 1000))
      setTimeLeft(remaining)
      
      if (remaining === 0 && status === "pending") {
        setStatus("expired")
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [paymentData?.expiresAt, status])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const ledgerInfo = LEDGER_INFO[selectedLedger]

  if (!service) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Invalid Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">No service selected or service not found.</p>
            <Link href="/portal/payments">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Payments
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "expired") {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border-yellow-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <Clock className="w-5 h-5" />
              Payment Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This payment request has expired. Please create a new payment.
            </p>
            <Button className="w-full mb-2" onClick={() => initPayment(selectedLedger)}>
              Try Again
            </Button>
            <Link href="/portal/payments">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Payments
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "cancelled" || status === "rejected") {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Payment {status === "cancelled" ? "Cancelled" : "Rejected"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {status === "cancelled" 
                ? "You cancelled this payment request." 
                : "The transaction was not signed."}
            </p>
            <Button className="w-full mb-2" onClick={() => initPayment(selectedLedger)}>
              Try Again
            </Button>
            <Link href="/portal/payments">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Payments
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/portal/payments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Pay with Xaman</h1>
          <p className="text-muted-foreground">Scan QR code or open in Xaman wallet</p>
        </div>
      </div>

      {/* Ledger Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Network</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedLedger} onValueChange={handleLedgerChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="xrpl" disabled={loading || status === "signed"}>
                XRP Ledger
              </TabsTrigger>
              <TabsTrigger value="xahau" disabled={loading || status === "signed"}>
                Xahau
              </TabsTrigger>
            </TabsList>
            <TabsContent value="xrpl" className="mt-3">
              <p className="text-sm text-muted-foreground">{LEDGER_INFO.xrpl.description}</p>
            </TabsContent>
            <TabsContent value="xahau" className="mt-3">
              <p className="text-sm text-muted-foreground">{LEDGER_INFO.xahau.description}</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle>{service.name}</CardTitle>
          <CardDescription>{service.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">USD Amount</span>
            <span className="font-medium">${(service.priceInCents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">{ledgerInfo.currency} Amount</span>
            <span className="font-medium">
              {loading ? "..." : paymentData ? `${paymentData.xrpAmount.toFixed(2)} ${ledgerInfo.currency}` : "-"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Time Remaining</span>
            <span className={`font-mono font-medium ${timeLeft < 60 ? "text-destructive" : ""}`}>
              {loading ? "..." : formatTime(timeLeft)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* QR Code / Loading / Error */}
      <Card>
        <CardContent className="pt-6">
          {loading && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Creating payment request...</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center py-8">
              <XCircle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-destructive font-medium mb-2">Payment Error</p>
              <p className="text-muted-foreground text-sm text-center mb-4">{error}</p>
              <Button onClick={() => initPayment(selectedLedger)}>Try Again</Button>
            </div>
          )}

          {!loading && !error && paymentData && status === "pending" && (
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg mb-4">
                <Image
                  src={paymentData.qrCodeUrl}
                  alt="Scan with Xaman"
                  width={256}
                  height={256}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <QrCode className="w-4 h-4" />
                <span>Scan with Xaman wallet</span>
              </div>

              <a href={paymentData.deepLink} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button className="w-full" variant="outline">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Open in Xaman App
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </a>
            </div>
          )}

          {status === "signed" && (
            <div className="flex flex-col items-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
              <p className="text-green-600 font-medium mb-2">Payment Confirmed!</p>
              <p className="text-muted-foreground text-sm">Redirecting...</p>
              {txHash && (
                <p className="text-xs font-mono text-muted-foreground mt-2">
                  TX: {txHash.slice(0, 8)}...{txHash.slice(-8)}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status */}
      {!loading && !error && paymentData && status === "pending" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-muted-foreground">Waiting for payment...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <div className="text-sm text-muted-foreground space-y-2">
        <p className="font-medium">How to pay:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Open your Xaman wallet app</li>
          <li>Scan the QR code above</li>
          <li>Review and approve the payment</li>
          <li>Wait for confirmation</li>
        </ol>
      </div>
    </div>
  )
}

export default function XamanCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <XamanCheckoutContent />
    </Suspense>
  )
}
