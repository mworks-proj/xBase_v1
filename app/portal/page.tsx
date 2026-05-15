import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { taxPortalConfig, caseStatuses, documentCategories } from "@/lib/config"
import Link from "next/link"
import { 
  FileText, 
  Upload, 
  CreditCard, 
  ClipboardList,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight
} from "lucide-react"

// Mock data for demo - will be replaced with real data
const mockCase = {
  id: "case-001",
  status: "new_intake" as const,
  intake_path: "w2" as const,
  tax_year: 2025,
  total_amount: 149,
  amount_paid: 0,
  created_at: new Date().toISOString(),
}

const mockDocuments = [
  { id: "1", category: "w2", uploaded: false },
  { id: "2", category: "government_id", uploaded: false },
]

export default async function PortalDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const fullName = user?.user_metadata?.full_name || "Client"
  const firstName = fullName.split(" ")[0]

  // Calculate progress
  const intakeComplete = false // Mock
  const documentsUploaded = mockDocuments.filter(d => d.uploaded).length
  const documentsRequired = mockDocuments.length
  const paymentComplete = mockCase.amount_paid >= (mockCase.total_amount || 0)

  const statusInfo = caseStatuses[mockCase.status]

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Welcome back, {firstName}
          </h1>
          <p className="text-muted-foreground">
            {"Here's an overview of your tax preparation status with"} {taxPortalConfig.providerDisplayName}
          </p>
        </div>

        {/* Status Banner */}
        <Card className="mb-8 border-accent/30 bg-accent/5">
          <CardContent className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${statusInfo.color}`} />
              <div>
                <p className="font-medium">Current Status: {statusInfo.label}</p>
                <p className="text-sm text-muted-foreground">Tax Year {mockCase.tax_year}</p>
              </div>
            </div>
            <Link href="/portal/status">
              <Button variant="outline" size="sm" className="gap-2">
                View Details
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Intake Status */}
          <Card className="bg-card/50 border-border hover:border-accent/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <ClipboardList className="w-5 h-5 text-muted-foreground" />
                {intakeComplete ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <CardTitle className="text-base">Tax Intake</CardTitle>
              <CardDescription>
                {intakeComplete ? "Completed" : "Not started"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/portal/intake">
                <Button size="sm" className="w-full" variant={intakeComplete ? "outline" : "default"}>
                  {intakeComplete ? "Review" : "Start Intake"}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Documents Status */}
          <Card className="bg-card/50 border-border hover:border-accent/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Upload className="w-5 h-5 text-muted-foreground" />
                {documentsUploaded === documentsRequired ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <Clock className="w-5 h-5 text-orange-500" />
                )}
              </div>
              <CardTitle className="text-base">Documents</CardTitle>
              <CardDescription>
                {documentsUploaded} of {documentsRequired} uploaded
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/portal/documents">
                <Button size="sm" className="w-full" variant={documentsUploaded === documentsRequired ? "outline" : "default"}>
                  Upload Documents
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card className="bg-card/50 border-border hover:border-accent/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                {paymentComplete ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <Clock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <CardTitle className="text-base">Payment</CardTitle>
              <CardDescription>
                {paymentComplete ? "Paid in full" : `$${mockCase.amount_paid} of $${mockCase.total_amount}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/portal/payments">
                <Button size="sm" className="w-full" variant={paymentComplete ? "outline" : "default"}>
                  {paymentComplete ? "View Receipt" : "Make Payment"}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Case Status */}
          <Card className="bg-card/50 border-border hover:border-accent/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
              </div>
              <CardTitle className="text-base">Case Status</CardTitle>
              <CardDescription>{statusInfo.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/portal/status">
                <Button size="sm" className="w-full" variant="outline">
                  View Status
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps Section */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Complete these steps to proceed with your tax preparation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!intakeComplete && (
                <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-secondary/30">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <span className="text-accent-foreground font-bold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Complete Tax Intake Form</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Provide your personal information and tax details so your preparer can begin working on your return.
                    </p>
                    <Link href="/portal/intake">
                      <Button size="sm" className="gap-2">
                        Start Intake
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {documentsUploaded < documentsRequired && (
                <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-secondary/30">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <span className="text-accent-foreground font-bold text-sm">{intakeComplete ? "1" : "2"}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Upload Required Documents</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Upload your W-2s, 1099s, and other tax documents securely through the portal.
                    </p>
                    <Link href="/portal/documents">
                      <Button size="sm" variant="outline" className="gap-2">
                        Upload Documents
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {intakeComplete && documentsUploaded === documentsRequired && (
                <div className="flex items-center gap-4 p-4 rounded-lg border border-success/30 bg-success/5">
                  <CheckCircle className="w-6 h-6 text-success" />
                  <div>
                    <h4 className="font-medium">All set!</h4>
                    <p className="text-sm text-muted-foreground">
                      Your tax preparer will review your information and prepare your return. {"You'll"} be notified when {"it's"} ready for review.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preparer Note Placeholder */}
        <Card className="mt-6 bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-base">Notes from Your Preparer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground italic">
              No notes yet. Your preparer will leave updates here as they work on your return.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
