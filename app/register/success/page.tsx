import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Mail } from "lucide-react"
import { taxPortalConfig } from "@/lib/config"

export default function RegisterSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="aurora-bg fixed inset-0 -z-10" />
      <div className="grid-pattern fixed inset-0 -z-10" />
      
      <div className="w-full max-w-md">
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription className="text-base mt-2">
              {"We've sent a confirmation link to your email address."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/50 rounded-lg p-4 flex items-start gap-3">
              <Mail className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="text-sm font-medium">Verify your email</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click the link in the email to verify your account and access the {taxPortalConfig.providerDisplayName} client portal.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/login">Go to Login</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">Return Home</Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {"Didn't receive the email? Check your spam folder or contact "}
              <a href={`mailto:${taxPortalConfig.supportEmail}`} className="text-accent hover:underline">
                {taxPortalConfig.supportEmail}
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
