"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { taxPortalConfig } from "@/lib/config"
import { CreditCard, Smartphone, Check, ArrowRight } from "lucide-react"
import { useState } from "react"

// Mock data
const mockPayment = {
  totalDue: 149,
  amountPaid: 0,
  dueDate: "Before filing",
}

export default function PaymentsPage() {
  const [selectedMethod, setSelectedMethod] = useState<"stripe" | "xaman" | null>(null)
  const balance = mockPayment.totalDue - mockPayment.amountPaid
  const isPaid = balance <= 0

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Payments
          </h1>
          <p className="text-muted-foreground">
            Manage your tax preparation payment
          </p>
        </div>

        {/* Payment Summary */}
        <Card className="mb-8 border-accent/30 bg-accent/5">
          <CardContent className="py-6">
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Due</p>
                <p className="text-2xl font-bold">${mockPayment.totalDue}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount Paid</p>
                <p className="text-2xl font-bold text-success">${mockPayment.amountPaid}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Balance</p>
                <p className={`text-2xl font-bold ${isPaid ? "text-success" : "text-foreground"}`}>
                  ${balance}
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
                    onClick={() => setSelectedMethod("stripe")}
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
                    onClick={() => setSelectedMethod("xaman")}
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
                    <Button size="lg" className="gap-2 w-full sm:w-auto">
                      {selectedMethod === "stripe" ? "Pay with Card" : "Open Xaman"}
                      <ArrowRight className="w-4 h-4" />
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
      </div>
    </div>
  )
}
