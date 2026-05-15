"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { taxPortalConfig } from "@/lib/config"
import { CreditCard, Smartphone, Check, ArrowRight, Loader2, History, FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

type TaxReturn = {
  id: string
  taxYear: number
  filingStatus: string
  prepFee: number | null
  paymentStatus: string
  estimatedRefund: number | null
}

type Payment = {
  id: string
  amount: number
  paymentMethod: string
  status: string
  createdAt: string
}

export default function PaymentsPage() {
  const [selectedMethod, setSelectedMethod] = useState<"stripe" | "xaman" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [taxReturn, setTaxReturn] = useState<TaxReturn | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get the most recent tax return
      const currentYear = new Date().getFullYear()
      const { data: taxReturnData } = await supabase
        .from("tax_returns")
        .select("*")
        .eq("user_id", user.id)
        .eq("tax_year", currentYear)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (taxReturnData) {
        setTaxReturn({
          id: taxReturnData.id,
          taxYear: taxReturnData.tax_year,
          filingStatus: taxReturnData.filing_status,
          prepFee: taxReturnData.prep_fee,
          paymentStatus: taxReturnData.payment_status,
          estimatedRefund: taxReturnData.estimated_refund,
        })

        // Get payment history
        const { data: paymentsData } = await supabase
          .from("payments")
          .select("*")
          .eq("tax_return_id", taxReturnData.id)
          .order("created_at", { ascending: false })

        if (paymentsData) {
          setPayments(paymentsData.map(p => ({
            id: p.id,
            amount: Number(p.amount),
            paymentMethod: p.payment_method,
            status: p.status,
            createdAt: p.created_at,
          })))
        }
      }
      
      setIsLoading(false)
    }

    loadData()
  }, [])

  const totalPaid = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0)
  const totalDue = taxReturn?.prepFee || taxPortalConfig.pricing.individual
  const balance = totalDue - totalPaid
  const isPaid = balance <= 0

  const handlePayment = async () => {
    if (!selectedMethod || !taxReturn) return
    
    setIsProcessing(true)
    
    // In a real app, this would integrate with Stripe or Xaman
    // For now, simulate a successful payment
    setTimeout(async () => {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Create payment record
      const { data: newPayment } = await supabase
        .from("payments")
        .insert({
          tax_return_id: taxReturn.id,
          user_id: user.id,
          amount: balance,
          payment_method: selectedMethod,
          status: "completed",
        })
        .select()
        .single()

      // Update tax return payment status
      await supabase
        .from("tax_returns")
        .update({ payment_status: "paid" })
        .eq("id", taxReturn.id)

      if (newPayment) {
        setPayments([{
          id: newPayment.id,
          amount: Number(newPayment.amount),
          paymentMethod: newPayment.payment_method,
          status: newPayment.status,
          createdAt: newPayment.created_at,
        }, ...payments])
        
        setTaxReturn({ ...taxReturn, paymentStatus: "paid" })
      }
      
      setIsProcessing(false)
      setSelectedMethod(null)
    }, 2000)
  }

  if (isLoading) {
    return (
      <div className="py-8 px-4 sm:px-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!taxReturn) {
    return (
      <div className="py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">No Tax Return Found</h1>
          <p className="text-muted-foreground mb-6">
            Please complete the tax intake form first.
          </p>
          <Button asChild>
            <Link href="/portal/intake">Start Tax Intake</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Payments
          </h1>
          <p className="text-muted-foreground">
            Manage your tax preparation payment for {taxReturn.taxYear}
          </p>
        </div>

        {/* Payment Summary */}
        <Card className="mb-8 border-accent/30 bg-accent/5">
          <CardContent className="py-6">
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Due</p>
                <p className="text-2xl font-bold">${totalDue}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount Paid</p>
                <p className="text-2xl font-bold text-success">${totalPaid}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Balance</p>
                <p className={`text-2xl font-bold ${isPaid ? "text-success" : "text-foreground"}`}>
                  ${Math.max(0, balance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isPaid ? (
          <Card className="bg-success/5 border-success/30">
            <CardContent className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Payment Complete</h3>
              <p className="text-muted-foreground">
                Thank you for your payment. Your tax preparation is in progress.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Payment Methods */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Select Payment Method</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Card Payment */}
                {taxPortalConfig.enableStripe && (
                  <Card
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedMethod === "stripe"
                        ? "border-accent bg-accent/10"
                        : "bg-card/50 border-border hover:border-accent/50"
                    }`}
                    onClick={() => !isProcessing && setSelectedMethod("stripe")}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        {selectedMethod === "stripe" && (
                          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                            <Check className="w-4 h-4 text-accent-foreground" />
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg">Card Payment</CardTitle>
                      <CardDescription>Pay with Visa, Mastercard, or other cards</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Secure checkout powered by Stripe
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Instant payment confirmation
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Crypto Payment */}
                {taxPortalConfig.enableXaman && (
                  <Card
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedMethod === "xaman"
                        ? "border-accent bg-accent/10"
                        : "bg-card/50 border-border hover:border-accent/50"
                    }`}
                    onClick={() => !isProcessing && setSelectedMethod("xaman")}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-white" />
                        </div>
                        {selectedMethod === "xaman" && (
                          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                            <Check className="w-4 h-4 text-accent-foreground" />
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg">Crypto Payment</CardTitle>
                      <CardDescription>Pay with XRP or XAH via Xaman wallet</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          XRPL and Xahau supported
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Fast on-ledger settlement
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Payment Button */}
            {selectedMethod && (
              <Card className="bg-card/50 border-border">
                <CardContent className="py-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        Pay ${balance} via {selectedMethod === "stripe" ? "Card" : "Crypto"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {taxPortalConfig.paymentLabel}
                      </p>
                    </div>
                    <Button 
                      size="lg" 
                      className="gap-2 w-full sm:w-auto"
                      onClick={handlePayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {selectedMethod === "stripe" ? "Pay with Card" : "Open Xaman"}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <p className="text-xs text-muted-foreground text-center mt-6">
              Payment timing: {taxPortalConfig.paymentTiming === "after_review" 
                ? "Payment due after document review"
                : taxPortalConfig.paymentTiming === "before_intake"
                ? "Payment due before starting intake"
                : taxPortalConfig.paymentTiming === "before_filing"
                ? "Payment due before filing"
                : "Deposit required, balance due at filing"}
            </p>
          </>
        )}

        {/* Payment History */}
        {payments.length > 0 && (
          <Card className="mt-8 bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div 
                    key={payment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                  >
                    <div>
                      <p className="font-medium">${payment.amount}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.paymentMethod === "stripe" ? "Card Payment" : "Crypto Payment"} - {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      payment.status === "completed" 
                        ? "bg-success/10 text-success" 
                        : payment.status === "pending"
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" asChild>
            <Link href="/portal/documents">Back to Documents</Link>
          </Button>
          <Button asChild>
            <Link href="/portal">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
