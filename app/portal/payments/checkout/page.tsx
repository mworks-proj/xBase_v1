"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StripeCheckout, CheckoutLoading } from "@/components/stripe-checkout"
import { ArrowLeft, Shield } from "lucide-react"
import { getServiceById, formatPrice } from "@/lib/products"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const serviceId = searchParams.get("service")
  const taxReturnId = searchParams.get("return")

  if (!serviceId) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>No Service Selected</CardTitle>
              <CardDescription>
                Please select a service to proceed with payment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/portal/payments">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Payments
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const service = getServiceById(serviceId)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Link */}
        <Link 
          href="/portal/payments" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Payments
        </Link>

        {/* Order Summary */}
        {service && (
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold">{formatPrice(service.priceInCents)}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(service.priceInCents)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checkout Form */}
        <Card>
          <CardHeader>
            <CardTitle>Secure Payment</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Your payment is secured with 256-bit SSL encryption
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<CheckoutLoading />}>
              <StripeCheckout 
                serviceId={serviceId} 
                taxReturnId={taxReturnId || undefined} 
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  )
}
