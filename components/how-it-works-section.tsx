import { UserPlus, FileUp, CreditCard, CheckCircle } from "lucide-react"

const steps = [
  {
    num: "1",
    icon: UserPlus,
    title: "Create Account",
    description: "Register with your email to access the secure client portal",
  },
  {
    num: "2",
    icon: FileUp,
    title: "Upload Documents",
    description: "Securely upload your W-2s, 1099s, and other tax documents",
  },
  {
    num: "3",
    icon: CreditCard,
    title: "Make Payment",
    description: "Pay with card or crypto when your return is ready",
  },
  {
    num: "4",
    icon: CheckCircle,
    title: "Get Filed",
    description: "Your tax preparer files your return and you receive confirmation",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-success/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="animate-fade-in-up text-2xl sm:text-3xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="animate-fade-in-up delay-100 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            A simple, secure process from start to finish
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={step.num}
                className={`animate-fade-in-up delay-${(index + 2) * 100} group flex flex-col items-center text-center p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 hover:border-accent/30 transition-all duration-300`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-success flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-accent-foreground" />
                </div>
                <div className="text-xs font-medium text-accent mb-2">Step {step.num}</div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
