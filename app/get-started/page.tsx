"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { services } from "@/lib/config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, FileText, Briefcase, Building2, ChevronLeft } from "lucide-react"
import Link from "next/link"

const intakePaths = [
  {
    id: "w2",
    title: "W-2 Employee",
    description: "I receive a W-2 from my employer",
    icon: FileText,
    examples: "Full-time employees, part-time workers, multiple W-2s",
  },
  {
    id: "1099",
    title: "Self-Employed / 1099",
    description: "I receive 1099 forms as a freelancer or contractor",
    icon: Briefcase,
    examples: "Freelancers, gig workers, independent contractors",
  },
  {
    id: "business",
    title: "Small Business",
    description: "I own a small business or LLC",
    icon: Building2,
    examples: "LLCs, S-Corps, sole proprietors with employees",
  },
]

export default function GetStartedPage() {
  const searchParams = useSearchParams()
  const preSelectedService = searchParams.get("service")
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

  // Find the pre-selected service if any
  const serviceInfo = preSelectedService 
    ? services.find(s => s.id === preSelectedService) 
    : null

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="aurora-bg fixed inset-0 -z-10" />
      <div className="grid-pattern fixed inset-0 -z-10" />

      <Header />

      <section className="pt-28 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="animate-fade-in-up text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {selectedPath ? "Choose Your Path" : "Get Started"}
            </h1>
            <p className="animate-fade-in-up delay-100 text-muted-foreground max-w-xl mx-auto">
              {serviceInfo 
                ? `You selected: ${serviceInfo.name}. Tell us more about your tax situation.`
                : "Select the option that best describes your tax situation to begin."}
            </p>
          </div>

          {/* Client Type Selection */}
          <div className="mb-12">
            <h2 className="text-lg font-semibold mb-6 text-center">Are you a new or returning client?</h2>
            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Card className="animate-fade-in-up delay-200 bg-card/50 backdrop-blur border-border hover:border-accent/50 transition-all duration-300 cursor-pointer group">
                <Link href="/register">
                  <CardHeader className="text-center">
                    <CardTitle className="group-hover:text-accent transition-colors">New Client</CardTitle>
                    <CardDescription>Create a new account to get started</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <Button variant="outline" className="gap-2 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                      Register
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Link>
              </Card>

              <Card className="animate-fade-in-up delay-300 bg-card/50 backdrop-blur border-border hover:border-accent/50 transition-all duration-300 cursor-pointer group">
                <Link href="/login">
                  <CardHeader className="text-center">
                    <CardTitle className="group-hover:text-accent transition-colors">Returning Client</CardTitle>
                    <CardDescription>Sign in to your existing account</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <Button variant="outline" className="gap-2 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                      Login
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            </div>
          </div>

          {/* Tax Situation Selection */}
          <div>
            <h2 className="text-lg font-semibold mb-6 text-center">What type of taxes are you filing?</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {intakePaths.map((path, index) => {
                const Icon = path.icon
                const isSelected = selectedPath === path.id
                return (
                  <Card
                    key={path.id}
                    className={`animate-fade-in-up delay-${(index + 4) * 100} bg-card/50 backdrop-blur transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                    onClick={() => setSelectedPath(path.id)}
                  >
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                        isSelected 
                          ? "bg-accent text-accent-foreground" 
                          : "bg-secondary text-foreground"
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg">{path.title}</CardTitle>
                      <CardDescription>{path.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Examples: {path.examples}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {selectedPath && (
              <div className="mt-8 text-center animate-fade-in-up">
                <Button size="lg" className="gap-2" asChild>
                  <Link href={`/register?path=${selectedPath}${preSelectedService ? `&service=${preSelectedService}` : ""}`}>
                    Continue to Registration
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
