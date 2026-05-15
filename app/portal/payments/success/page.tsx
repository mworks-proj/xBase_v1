"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, AlertCircle, ArrowRight, FileText, Home } from "lucide-react"
import { getCheckoutSession } from "@/app/actions/stripe"

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [sessionData, setSessionData] = useState<{
    amount: number
    serviceName: string
  } | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setStatus("error")
      return
    }

    async function verifyPayment() {
      const result = await getCheckoutSession(sessionId!)
      if (result.error || !result.session) {
        setStatus("error")
        return
      }

      const session = result.session
      if (session.payment_status === "paid") {
        setStatus("success")
        setSessionData({
          amount: session.amount_total || 0,
          serviceName: session.metadata?.service_name || "Tax Preparation Service",
        })
      } else {
        setStatus("error")
      }
    }

    verifyPayment()
  }, [sessionId])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Verifying your payment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle>Payment Verification Failed</CardTitle>
              <CardDescription>
                We couldn&apos;t verify your payment. If you believe this is an error, 
                please contact our support team.
              </CardDescription>
              <div className="flex gap-3 pt-4">
                <Link href="/portal/payments">
                  <Button variant="outline">Try Again</Button>
                </Link>
                <Link href="/portal">
                  <Button>
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your payment. Your tax preparation service is now active.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {sessionData && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{sessionData.serviceName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(sessionData.amount / 100)}
                </span>
              </div>
            </div>
          )}

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">What&apos;s Next?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>1. Upload your tax documents</li>
              <li>2. Complete your intake questionnaire</li>
              <li>3. Our team will review and prepare your return</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/portal/documents">
              <Button className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Upload Documents
              </Button>
            </Link>
            <Link href="/portal">
              <Button variant="outline" className="w-full">
                <ArrowRight className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
