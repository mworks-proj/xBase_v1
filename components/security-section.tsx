import { Shield, Lock, FileCheck, Server } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Bank-Level Encryption",
    description: "Your data is protected with AES-256 encryption at rest and in transit",
  },
  {
    icon: Lock,
    title: "Secure Authentication",
    description: "Multi-factor authentication and secure session management",
  },
  {
    icon: FileCheck,
    title: "Document Verification",
    description: "All uploads are scanned and verified for integrity",
  },
  {
    icon: Server,
    title: "API Secrets Protected",
    description: "Sensitive keys secured in Supabase Vault, never exposed",
  },
]

export function SecuritySection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 relative border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="animate-fade-in-up text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Security First
          </h2>
          <p className="animate-fade-in-up delay-100 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Your sensitive tax information deserves enterprise-grade protection
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className={`animate-fade-in-up delay-${(index + 2) * 100} p-5 sm:p-6 rounded-xl border border-border bg-card/50 backdrop-blur hover:border-accent/30 hover:bg-card/80 transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
