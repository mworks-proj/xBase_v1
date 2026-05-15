"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  ArrowRight,
  Receipt,
  Shield,
  FileText,
  Loader2
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { TAX_SERVICES, formatPrice, type TaxService } from "@/lib/products"

interface Payment {
  id: string
  amount: number
  status: string
  payment_method: string
  description: string | null
  created_at: string
}

interface TaxReturn {
  id: string
  tax_year: number
  filing_status: string
  status: string
  payment_status: string
  prep_fee: number | null
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [taxReturns, setTaxReturns] = useState<TaxReturn[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      
      const [paymentsResult, returnsResult] = await Promise.all([
        supabase
          .from("payments")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("tax_returns")
          .select("id, tax_year, filing_status, status, payment_status, prep_fee")
          .order("created_at", { ascending: false }),
      ])

      if (paymentsResult.data) {
        setPayments(paymentsResult.data)
      }
      if (returnsResult.data) {
        setTaxReturns(returnsResult.data)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  // Calculate totals
  const totalPaid = payments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingAmount = taxReturns
    .filter(r => r.payment_status === "pending" && r.prep_fee)
    .reduce((sum, r) => sum + (r.prep_fee || 0), 0)

  // Get unpaid tax returns
  const unpaidReturns = taxReturns.filter(r => r.payment_status === "pending")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground mt-1">
          Manage your payments and view your billing history
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(totalPaid)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(pendingAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{payments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      {unpaidReturns.length > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Pending Payments
            </CardTitle>
            <CardDescription>
              Complete payment to start your tax preparation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unpaidReturns.map((taxReturn) => (
                <div
                  key={taxReturn.id}
                  className="flex items-center justify-between p-4 bg-background rounded-lg border"
                >
                  <div>
                    <p className="font-medium">
                      {taxReturn.tax_year} Tax Return
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {taxReturn.filing_status.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {taxReturn.prep_fee && (
                      <span className="font-medium">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(taxReturn.prep_fee)}
                      </span>
                    )}
                    <Link href={`/portal/payments/checkout?return=${taxReturn.id}&service=individual-simple`}>
                      <Button size="sm">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Now
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Tax Preparation Services
          </CardTitle>
          <CardDescription>
            Select a service to get started with your tax preparation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TAX_SERVICES.slice(0, 6).map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Payment History
          </CardTitle>
          <CardDescription>
            View all your past transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No payment history yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your transactions will appear here after your first payment
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      payment.status === "completed" 
                        ? "bg-green-500/10" 
                        : payment.status === "failed"
                        ? "bg-red-500/10"
                        : "bg-yellow-500/10"
                    }`}>
                      {payment.status === "completed" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : payment.status === "failed" ? (
                        <DollarSign className="w-5 h-5 text-red-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {payment.description || "Tax Preparation Service"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(payment.amount)}
                    </p>
                    <p className={`text-sm capitalize ${
                      payment.status === "completed" 
                        ? "text-green-500" 
                        : payment.status === "failed"
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}>
                      {payment.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Note */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Shield className="w-4 h-4" />
        <span>All payments are processed securely via Stripe</span>
      </div>
    </div>
  )
}

function ServiceCard({ service }: { service: TaxService }) {
  return (
    <div className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{service.name}</h3>
        <span className="text-lg font-bold text-primary">
          {formatPrice(service.priceInCents)}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
      <ul className="text-xs text-muted-foreground space-y-1 mb-4">
        {service.features.slice(0, 3).map((feature, i) => (
          <li key={i} className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            {feature}
          </li>
        ))}
        {service.features.length > 3 && (
          <li className="text-primary">+{service.features.length - 3} more</li>
        )}
      </ul>
      <Link href={`/portal/payments/checkout?service=${service.id}`}>
        <Button size="sm" className="w-full">
          Select
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  )
}
