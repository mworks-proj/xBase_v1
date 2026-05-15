"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ExternalLink, FileText, Home, Loader2 } from "lucide-react"
import Link from "next/link"
import { getXamanPaymentDetails } from "@/app/actions/xaman"

function XamanSuccessContent() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get("id")
  const txHash = searchParams.get("tx")

  const [loading, setLoading] = useState(true)
  const [payment, setPayment] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPayment() {
      if (!paymentId) {
        setError("No payment ID provided")
        setLoading(false)
        return
      }

      const result = await getXamanPaymentDetails(paymentId)
      
      if (result.error) {
        setError(result.error)
      } else if (result.payment) {
        setPayment(result.payment)
      }
      
      setLoading(false)
    }

    fetchPayment()
  }, [paymentId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verifying payment...</p>
        </div>
      </div>
    )
  }

  const isConfirmed = payment?.status === "completed"
  const isPending = payment?.status === "pending"

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Success Header */}
      <div className="text-center pt-8">
        <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
          isConfirmed ? "bg-green-100" : isPending ? "bg-yellow-100" : "bg-gray-100"
        }`}>
          {isConfirmed ? (
            <CheckCircle className="w-10 h-10 text-green-600" />
          ) : isPending ? (
            <Loader2 className="w-10 h-10 text-yellow-600 animate-spin" />
          ) : (
            <CheckCircle className="w-10 h-10 text-gray-400" />
          )}
        </div>
        <h1 className="text-3xl font-bold mb-2">
          {isConfirmed ? "Payment Successful!" : isPending ? "Payment Processing" : "Payment Submitted"}
        </h1>
        <p className="text-muted-foreground">
          {isConfirmed 
            ? "Your XRP payment has been confirmed on the ledger."
            : isPending
            ? "Your payment is being processed. This usually takes a few seconds."
            : "Your payment has been submitted to the XRP Ledger."}
        </p>
      </div>

      {/* Transaction Details */}
      {(payment || txHash) && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>Your XRPL payment information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {payment?.description && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{payment.description as string}</span>
              </div>
            )}
            {payment?.amount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount (USD)</span>
                <span className="font-medium">${(payment.amount as number).toFixed(2)}</span>
              </div>
            )}
            {payment?.xrpl_amount_drops && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount (XRP)</span>
                <span className="font-medium">
                  {(parseInt(payment.xrpl_amount_drops as string, 10) / 1_000_000).toFixed(2)} XRP
                </span>
              </div>
            )}
            {(txHash || payment?.xrpl_tx_hash) && (
              <div className="pt-2 border-t">
                <span className="text-sm text-muted-foreground block mb-1">Transaction Hash</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all flex-1">
                    {txHash || payment?.xrpl_tx_hash as string}
                  </code>
                  <a
                    href={`https://livenet.xrpl.org/transactions/${txHash || payment?.xrpl_tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="text-muted-foreground">Status</span>
              <span className={`font-medium ${
                isConfirmed ? "text-green-600" : isPending ? "text-yellow-600" : "text-gray-600"
              }`}>
                {isConfirmed ? "Confirmed" : isPending ? "Processing" : "Submitted"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">1</span>
            </div>
            <div>
              <p className="font-medium">Complete Your Tax Intake</p>
              <p className="text-sm text-muted-foreground">
                Fill out the questionnaire so we can prepare your return
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">2</span>
            </div>
            <div>
              <p className="font-medium">Upload Your Documents</p>
              <p className="text-sm text-muted-foreground">
                Securely upload your W-2s, 1099s, and other tax documents
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">3</span>
            </div>
            <div>
              <p className="font-medium">Review & Approve</p>
              <p className="text-sm text-muted-foreground">
                Review your completed return before we file it
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Link href="/portal/intake">
          <Button className="w-full" size="lg">
            <FileText className="w-4 h-4 mr-2" />
            Start Tax Intake
          </Button>
        </Link>
        <Link href="/portal">
          <Button variant="outline" className="w-full" size="lg">
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
        </Link>
      </div>

      {/* XRPL Explorer Link */}
      {(txHash || payment?.xrpl_tx_hash) && (
        <p className="text-center text-sm text-muted-foreground">
          View on{" "}
          <a
            href={`https://livenet.xrpl.org/transactions/${txHash || payment?.xrpl_tx_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            XRPL Explorer
          </a>
        </p>
      )}
    </div>
  )
}

export default function XamanSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <XamanSuccessContent />
    </Suspense>
  )
}
