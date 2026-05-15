import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { SecuritySection } from "@/components/security-section"
import { PaymentOptionsSection } from "@/components/payment-options-section"
import { CTASection } from "@/components/cta-section"
import { LogoScroller } from "@/components/logo-scroller"
import { techLogos } from "@/lib/config"

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="aurora-bg fixed inset-0 -z-10" />
      <div className="grid-pattern fixed inset-0 -z-10" />

      <Header />

      <HeroSection />

      {/* Tech Stack Marquee */}
      <LogoScroller
        logos={techLogos}
        logoHeight={32}
        speed={1.2}
        gap={64}
        className="py-8 border-y border-border/30 bg-background/50 backdrop-blur-sm"
      />

      <ServicesSection />

      <HowItWorksSection />

      <SecuritySection />

      <PaymentOptionsSection />

      <CTASection />

      <Footer />
    </main>
  )
}
