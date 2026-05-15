"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, QrCode, Smartphone, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createXamanPayment, checkXamanPaymentStatus } from "@/app/actions/xaman"
import { getServiceById } from "@/lib/products"
import { formatXrp } from "@/lib/xaman"

function XamanCheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const serviceId = searchParams.get("service")
  const taxReturnId = searchParams.get("taxReturnId") || undefined

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
  } | null>(null)
  const [status, setStatus] = useState<"pending" | "signed" | "cancelled" | "expired" | "failed">("pending")
  const [txHash, setTxHash] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  const service = serviceId ? getServiceById(serviceId) : null

  // Create payment on mount
  useEffect(() => {
    async function initPayment() {
      if (!serviceId) {
        setError("No service selected")
        setLoading(false)
        return
      }

      const result = await createXamanPayment(serviceId, taxReturnId)
      
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
      })
      setLoading(false)
    }

    initPayment()
  }, [serviceId, taxReturnId])

  // Poll for payment status
  useEffect(() => {
    if (!paymentData?.payloadUuid || status !== "pending") return

    const interval = setInterval(async () => {
      const result = await checkXamanPaymentStatus(paymentData.payloadUuid)
      
      if (result.success) {
        setStatus(result.status)
        if (result.txHash) {
          setTxHash(result.txHash)
        }
        if (result.status === "signed") {
          // Redirect to success page
          router.push(`/portal/payments/xaman-success?id=${paymentData.paymentId}&tx=${result.txHash}`)
        }
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [paymentData?.payloadUuid, status, router])

  // Countdown timer
  useEffect(() => {
    if (!paymentData?.expiresAt) return

    const updateTimer = () => {
      const now = Date.now()
      const expires = new Date(paymentData.expiresAt).getTime()
      const remaining = Math.max(0, Math.floor((expires - now) / 1000))
      setTimeLeft(remaining)
      
      if (remaining === 0) {
        setStatus("expired")
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [paymentData?.expiresAt])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Creating payment request...</p>
        </div>
      </div>
    )
  }

  if (error || !service || !paymentData) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Payment Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error || "Unable to create payment"}</p>
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
            <Link href={`/portal/payments/xaman-checkout?service=${serviceId}`}>
              <Button className="w-full mb-2">Try Again</Button>
            </Link>
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

  if (status === "cancelled") {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Payment Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You cancelled this payment request.
            </p>
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
            <span className="text-muted-foreground">XRP Amount</span>
            <span className="font-medium">{paymentData.xrpAmount.toFixed(2)} XRP</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Time Remaining</span>
            <span className={`font-mono font-medium ${timeLeft < 60 ? "text-destructive" : ""}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* QR Code */}
      <Card>
        <CardContent className="pt-6">
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

            <div className="w-full space-y-2">
              <a href={paymentData.deepLink} target="_blank" rel="noopener noreferrer">
                <Button className="w-full" variant="outline">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Open in Xaman App
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-3">
            {status === "pending" && (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-muted-foreground">Waiting for payment...</span>
              </>
            )}
            {status === "signed" && (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-600 font-medium">Payment confirmed!</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

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
