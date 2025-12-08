import { DonateXahForm } from "@/components/donate-xah-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { TypingCommand } from "@/components/typing-command"
import { DonationFeed } from "@/components/donation-feed"
import { HackathonBadge } from "@/components/hackathon-badge"
import { LogoScroller } from "@/components/logo-scroller"
import { Button } from "@/components/ui/button"
import { ArrowRight, Terminal, Github, Package } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const techLogos = [
    { src: "https://assets.vercel.com/image/upload/v1607554385/repositories/next-js/next-logo.png", alt: "Next.js" },
    { src: "/images/supabase-logo-wordmark-dark.png", alt: "Supabase" },
    { src: "https://tailwindcss.com/_next/static/media/tailwindcss-logotype-white.830c8e49.svg", alt: "Tailwind CSS" },
    { src: "/images/xrpl-logo.png", alt: "XRPL" },
    { src: "https://raw.githubusercontent.com/Xahau/Graphics/main/xahau-logo-white.svg", alt: "Xahau" },
    { src: "https://raw.githubusercontent.com/XRPL-Labs/Xaman-Branding/main/Logo/xaman-logo-white.svg", alt: "Xaman" },
    {
      src: "https://images.squarespace-cdn.com/content/v1/662b45807aa9ac648742aab8/667e78fb-b42d-4ffc-acc0-f0724c57a878/evernode-logo.png?format=1500w",
      alt: "Evernode",
    },
  ]

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="aurora-bg fixed inset-0 -z-10" />
      <div className="grid-pattern fixed inset-0 -z-10" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 animate-fade-in-up">
            <img src="/xmerch-icon.svg" alt="xBase" className="w-8 h-8" />
            <span className="font-semibold">xBase</span>
          </div>
          <div className="flex items-center gap-4 animate-fade-in-up delay-100">
            <Link
              href="https://www.npmjs.com/package/xmerch"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              npm
            </Link>
            <Link
              href="https://github.com/mworks-proj/xBase"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              GitHub
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[300px] sm:h-[400px] glow rounded-full -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up mb-4">
            <HackathonBadge />
          </div>

          {/* Badge */}
          <Link
            href="https://www.npmjs.com/package/xmerch"
            target="_blank"
            className="animate-fade-in-up delay-100 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary/50 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all mb-6 sm:mb-8"
          >
            <Package className="w-4 h-4" />
            <span>Part of xMerch CLI</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <h1 className="animate-fade-in-up delay-200 text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-4 sm:mb-6 text-balance px-2">
            Build on <span className="text-[#A855F7] text-glow-purple">XRPL</span> &{" "}
            <span className="text-[#F5D327] text-glow-yellow">Xahau</span>
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>in minutes, not months.
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-in-up delay-300 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 text-pretty px-2">
            Production-ready template for building secure XRPL and Xahau blockchain payment apps. Secrets in Supabase
            Vault, deployable to trustless Evernode infrastructure.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up delay-400 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-4">
            <Button size="lg" className="gap-2 w-full sm:w-auto relative overflow-hidden group" asChild>
              <Link href="https://www.npmjs.com/package/xmerch" target="_blank">
                <span className="shimmer absolute inset-0 pointer-events-none" />
                <Terminal className="w-4 h-4" />
                Get Started
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 w-full sm:w-auto bg-transparent hover:bg-secondary/50"
              asChild
            >
              <Link href="https://github.com/mworks-proj/xBase" target="_blank">
                <Github className="w-4 h-4" />
                View on GitHub
              </Link>
            </Button>
          </div>

          <div className="animate-fade-in-up delay-500">
            <TypingCommand />
          </div>
        </div>
      </section>

      {/* LogoScroller */}
      <LogoScroller
        logos={techLogos}
        logoHeight={32}
        speed={1.2}
        gap={64}
        className="py-8 border-y border-border/30 bg-background/50 backdrop-blur-sm"
      />

      {/* Features Grid */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="animate-fade-in-up text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Everything you need to ship
            </h2>
            <p className="animate-fade-in-up delay-100 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              Built with security-first architecture for trustless deployments
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                title: "Secure by Design",
                description: "API secrets stored in Supabase Vault, never exposed in Docker containers",
                icon: "🔐",
                delay: "delay-200",
              },
              {
                title: "Xaman Integration",
                description: "Native wallet signing with QR codes and deep links for seamless UX",
                icon: "📱",
                delay: "delay-300",
              },
              {
                title: "Edge Functions",
                description: "Serverless Supabase functions for secure Xaman API communication",
                icon: "⚡",
                delay: "delay-400",
              },
              {
                title: "Evernode Ready",
                description: "Docker-first architecture for trustless decentralized hosting",
                icon: "🌐",
                delay: "delay-500",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`animate-fade-in-up ${feature.delay} p-5 sm:p-6 rounded-xl border border-border bg-card/50 backdrop-blur hover:border-foreground/20 hover:bg-card/80 transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="text-2xl mb-3 sm:mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col justify-center relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-secondary/30 backdrop-blur-sm text-xs font-medium text-muted-foreground mb-3 w-fit animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                Live Demo
              </div>

              <h2 className="animate-fade-in-up text-xl sm:text-2xl font-bold text-foreground mb-3 text-balance leading-tight">
                Support xMerch CLI Development
              </h2>

              <p className="animate-fade-in-up delay-100 text-sm text-muted-foreground mb-4 leading-relaxed text-pretty">
                We're building xMerch CLI to help developers create production-ready templates for Xahau and XRPL. Your
                donations support the development of tools, templates, and documentation that make blockchain
                development accessible to everyone.
              </p>

              <div className="space-y-2 mb-5">
                {[
                  {
                    num: "1",
                    title: "Select network & amount",
                    description: "Choose XRPL or Xahau and enter your donation amount",
                    delay: "delay-200",
                  },
                  {
                    num: "2",
                    title: "Scan QR code",
                    description: "Open your Xaman wallet and scan the generated QR code",
                    delay: "delay-300",
                  },
                  {
                    num: "3",
                    title: "Sign transaction",
                    description: "Review and confirm the transaction on your chosen network",
                    delay: "delay-400",
                  },
                ].map((step) => (
                  <div
                    key={step.num}
                    className={`animate-fade-in-up ${step.delay} group flex items-start gap-2.5 p-3 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 hover:border-border transition-all duration-300`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-foreground to-foreground/80 text-background flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {step.num}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <h4 className="font-semibold text-foreground mb-0.5 text-xs">{step.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fade-in-up delay-300 w-full relative z-10">
              <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/20 to-yellow-500/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <DonateXahForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Donation Feed Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2 flex items-center justify-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              Live Donation Feed
            </h3>
            <p className="text-sm text-muted-foreground">Recent contributions from the community</p>
          </div>
          <DonationFeed />
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="animate-fade-in-up text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Security architecture
          </h2>
          <p className="animate-fade-in-up delay-100 text-muted-foreground mb-8 sm:mb-12 max-w-xl mx-auto text-sm sm:text-base">
            Your Xaman API keys never touch the Docker container
          </p>

          <div className="animate-fade-in-up delay-200 grid sm:grid-cols-3 gap-4 text-sm">
            <div
              className="p-5 sm:p-6 rounded-xl border border-border bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300 animate-float"
              style={{ animationDelay: "0s" }}
            >
              <div className="font-mono text-xs text-muted-foreground mb-2">EVERNODE</div>
              <div className="font-semibold text-base sm:text-lg">Docker Container</div>
              <div className="text-muted-foreground text-xs mt-2">No secrets exposed</div>
            </div>
            <div className="flex items-center justify-center text-muted-foreground py-4 sm:py-0">
              <div className="animate-fade-in-up delay-300 flex sm:flex-row flex-col items-center gap-2">
                <div className="sm:h-px sm:w-8 h-8 w-px bg-gradient-to-b sm:bg-gradient-to-r from-transparent to-border" />
                <ArrowRight className="w-5 h-5 animate-pulse sm:rotate-0 rotate-90" />
                <div className="sm:h-px sm:w-8 h-8 w-px bg-gradient-to-t sm:bg-gradient-to-l from-transparent to-border" />
              </div>
            </div>
            <div
              className="p-5 sm:p-6 rounded-xl border border-border bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300 animate-float"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="font-mono text-xs text-muted-foreground mb-2">SUPABASE</div>
              <div className="font-semibold text-base sm:text-lg">Edge Functions + Vault</div>
              <div className="text-muted-foreground text-xs mt-2">Secrets secured</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 border-t border-border relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] h-[200px] sm:h-[300px] glow rounded-full -z-10 opacity-50" />

        <div className="max-w-4xl mx-auto text-center">
          <h2 className="animate-fade-in-up text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Start building today
          </h2>
          <p className="animate-fade-in-up delay-100 text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">
            One command to scaffold your XRPL & Xahau payment app
          </p>

          <div className="animate-fade-in-up delay-200 inline-flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-lg bg-foreground text-background font-mono text-xs sm:text-sm mb-6 sm:mb-8 relative overflow-hidden">
            <span className="shimmer absolute inset-0 pointer-events-none opacity-20" />
            <span className="opacity-60">$</span>
            <code>pnpm dlx xmerch create my-app</code>
          </div>

          <div className="animate-fade-in-up delay-300 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
            <Link
              href="https://www.npmjs.com/package/xmerch"
              target="_blank"
              className="hover:text-foreground transition-colors"
            >
              npm
            </Link>
            <Link
              href="https://github.com/mworks-proj/xBase"
              target="_blank"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
            <Link href="https://xrpl.org" target="_blank" className="hover:text-foreground transition-colors">
              XRPL
            </Link>
            <Link href="https://xahau.network" target="_blank" className="hover:text-foreground transition-colors">
              Xahau
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-border bg-background/50 backdrop-blur">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src="/xmerch-icon.svg" alt="xBase" className="w-6 h-6" />
            <span>xBase by xMerch CLI</span>
          </div>
          <div className="text-center sm:text-right">Built for the XRPL & Xahau ecosystem</div>
        </div>
      </footer>
    </main>
  )
}
