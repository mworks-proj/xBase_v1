import { services } from "@/lib/config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ArrowRight } from "lucide-react"
import Link from "next/link"

export function ServicesSection() {
  return (
    <section id="services" className="py-16 sm:py-24 px-4 sm:px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="animate-fade-in-up text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Tax Services
          </h2>
          <p className="animate-fade-in-up delay-100 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Choose the service that fits your tax situation. Our team will review your documents and prepare your return.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {services.map((service, index) => (
            <Card
              key={service.id}
              className={`animate-fade-in-up delay-${(index + 2) * 100} flex flex-col bg-card/50 backdrop-blur border-border hover:border-accent/50 transition-all duration-300 hover:-translate-y-1`}
            >
              <CardHeader>
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <CardDescription className="text-sm">{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-4">
                  <span className="text-2xl font-bold text-foreground">{service.priceLabel}</span>
                </div>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full gap-2" variant={service.price === null ? "outline" : "default"} asChild>
                  <Link href={`/get-started?service=${service.id}`}>
                    {service.price === null ? "Request Quote" : "Select"}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
