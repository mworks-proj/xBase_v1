import { taxPortalConfig } from "@/lib/config"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, FileText, CheckCircle } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[300px] sm:h-[400px] glow rounded-full -z-10" />

      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary/50 text-sm text-muted-foreground mb-6 sm:mb-8">
          <Shield className="w-4 h-4 text-accent" />
          <span>Secure Tax Services Portal</span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-100 text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-4 sm:mb-6 text-balance px-2">
          Professional Tax Preparation,{" "}
          <span className="text-accent text-glow-accent">Simplified</span>
        </h1>

        {/* Subheadline */}
        <p className="animate-fade-in-up delay-200 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 text-pretty px-2">
          Submit your documents securely, track your return status, and pay with card or crypto.
          Your tax preparer will review your information and handle the rest.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 px-4">
          <Button size="lg" className="gap-2 w-full sm:w-auto relative overflow-hidden group" asChild>
            <Link href="/get-started">
              <span className="shimmer absolute inset-0 pointer-events-none" />
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 w-full sm:w-auto bg-transparent hover:bg-secondary/50"
            asChild
          >
            <Link href="/login">
              Client Login
            </Link>
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="animate-fade-in-up delay-400 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>Bank-Level Security</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-success" />
            <span>E-File Included</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-success" />
            <span>Data Protected</span>
          </div>
        </div>
      </div>
    </section>
  )
}
