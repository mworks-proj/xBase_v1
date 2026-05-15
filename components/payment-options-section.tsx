import { CreditCard, Smartphone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function PaymentOptionsSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="animate-fade-in-up text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Flexible Payment Options
          </h2>
          <p className="animate-fade-in-up delay-100 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Pay for your tax preparation the way that works best for you
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Card Payment */}
          <Card className="animate-fade-in-up delay-200 bg-card/50 backdrop-blur border-border hover:border-accent/50 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Card Payment</CardTitle>
              <CardDescription>Pay securely with Visa, Mastercard, or other cards via Stripe</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  All major credit and debit cards accepted
                </li>
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

          {/* Crypto Payment */}
          <Card className="animate-fade-in-up delay-300 bg-card/50 backdrop-blur border-border hover:border-accent/50 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Crypto Payment</CardTitle>
              <CardDescription>Pay with XRP or XAH using the Xaman wallet app</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  XRPL and Xahau networks supported
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Scan QR code with Xaman wallet
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Fast on-ledger settlement
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
