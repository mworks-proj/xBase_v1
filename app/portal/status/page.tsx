import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { caseStatuses } from "@/lib/config"
import { CheckCircle, Circle } from "lucide-react"

// Mock data
const mockCase = {
  id: "case-001",
  status: "new_intake" as const,
  tax_year: 2025,
  created_at: new Date().toISOString(),
  filed_at: null,
}

const statusTimeline = [
  { status: "new_intake", date: mockCase.created_at },
  { status: "awaiting_payment", date: null },
  { status: "ready_for_review", date: null },
  { status: "in_progress", date: null },
  { status: "client_review", date: null },
  { status: "filed", date: null },
  { status: "complete", date: null },
] as const

export default function StatusPage() {
  const currentStatusIndex = statusTimeline.findIndex(s => s.status === mockCase.status)
  const currentStatusInfo = caseStatuses[mockCase.status]

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Case Status
          </h1>
          <p className="text-muted-foreground">
            Track the progress of your {mockCase.tax_year} tax return
          </p>
        </div>

        {/* Current Status Banner */}
        <Card className="mb-8 border-accent/30 bg-accent/5">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${currentStatusInfo.color}`} />
              <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                <p className="text-xl font-semibold">{currentStatusInfo.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle>Progress Timeline</CardTitle>
            <CardDescription>Track your return through each stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {statusTimeline.map((item, index) => {
                const statusInfo = caseStatuses[item.status]
                const isComplete = index < currentStatusIndex
                const isCurrent = index === currentStatusIndex
                const isPending = index > currentStatusIndex

                return (
                  <div key={item.status} className="flex gap-4">
                    {/* Timeline Line & Dot */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isComplete
                          ? "bg-success text-success-foreground"
                          : isCurrent
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        {isComplete ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </div>
                      {index < statusTimeline.length - 1 && (
                        <div className={`w-0.5 h-16 ${
                          isComplete ? "bg-success" : "bg-border"
                        }`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className={`p-4 rounded-lg border ${
                        isCurrent
                          ? "border-accent/50 bg-accent/5"
                          : isComplete
                          ? "border-success/30 bg-success/5"
                          : "border-border bg-secondary/30"
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${
                            isPending ? "text-muted-foreground" : "text-foreground"
                          }`}>
                            {statusInfo.label}
                          </h4>
                          {isCurrent && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getStatusDescription(item.status)}
                        </p>
                        {item.date && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(item.date).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    new_intake: "Your intake form has been submitted and is being processed.",
    awaiting_payment: "Payment is required before we can begin preparing your return.",
    missing_documents: "Additional documents are needed. Please check your required documents list.",
    ready_for_review: "Your documents are complete and your return is queued for preparation.",
    in_progress: "Your tax preparer is actively working on your return.",
    client_review: "Your return is ready for your review before filing.",
    filed: "Your tax return has been filed with the IRS.",
    complete: "Your tax return is complete. Thank you for choosing us!",
  }
  return descriptions[status] || "Processing..."
}
