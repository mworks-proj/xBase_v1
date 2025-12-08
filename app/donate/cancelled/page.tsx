import { XCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DonateCancelledPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Donation Cancelled</CardTitle>
          <CardDescription>The transaction was not signed. No XAH has been sent.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">You can try again whenever you're ready.</p>

          <div className="flex gap-3 pt-4">
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/#donate">Try Again</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
