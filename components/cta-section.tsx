import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border relative">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] h-[200px] sm:h-[300px] glow rounded-full -z-10 opacity-50" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="animate-fade-in-up text-2xl sm:text-3xl font-bold text-foreground mb-4">
          Ready to get started?
        </h2>
        <p className="animate-fade-in-up delay-100 text-muted-foreground mb-8 sm:mb-10 max-w-xl mx-auto text-sm sm:text-base">
          Create your account today and experience hassle-free tax preparation with secure document handling and professional review.
        </p>

        <div className="animate-fade-in-up delay-200 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="gap-2 w-full sm:w-auto relative overflow-hidden group" asChild>
            <Link href="/get-started">
              <span className="shimmer absolute inset-0 pointer-events-none" />
              Start Your Return
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
              Returning Client? Login
            </Link>
          </Button>
        </div>

        <p className="animate-fade-in-up delay-300 text-xs text-muted-foreground mt-8">
          This is tax intake and document submission software. Your tax preparer will review your information and prepare your return.
        </p>
      </div>
    </section>
  )
}
