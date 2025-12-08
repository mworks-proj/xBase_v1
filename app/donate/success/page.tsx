import { CheckCircle, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SuccessPageProps {
  searchParams: Promise<{ txid?: string; payloadId?: string; network?: string }>
}

export default async function DonateSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const txid = params.txid
  const payloadId = params.payloadId
  const network = params.network || "xahau"
  const explorerNetwork = network === "xrpl" ? "mainnet" : network

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Donation Successful!</CardTitle>
          <CardDescription>Thank you for your donation. Your transaction has been confirmed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {txid && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
              <p className="font-mono text-xs break-all">{txid}</p>
            </div>
          )}

          {txid && (
            <a
              href={`https://xumm.app/explorer/${explorerNetwork}/${txid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
            >
              View on Explorer <ExternalLink className="h-4 w-4" />
            </a>
          )}

          <div className="pt-4">
            <Button asChild className="w-full">
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
