"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { caseStatuses, CaseStatus } from "@/lib/config"
import { CheckCircle, Circle, Loader2, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type TaxReturn = {
  id: string
  status: CaseStatus
  taxYear: number
  createdAt: string
  filedAt: string | null
}

const statusOrder: CaseStatus[] = [
  "intake",
  "documents_pending",
  "in_review",
  "ready_for_review",
  "approved",
  "filed",
  "completed",
]

export default function StatusPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [taxReturn, setTaxReturn] = useState<TaxReturn | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const currentYear = new Date().getFullYear()
      const { data } = await supabase
        .from("tax_returns")
        .select("*")
        .eq("user_id", user.id)
        .eq("tax_year", currentYear)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setTaxReturn({
          id: data.id,
          status: data.status as CaseStatus,
          taxYear: data.tax_year,
          createdAt: data.created_at,
          filedAt: data.filed_at || null,
        })
      }
      
      setIsLoading(false)
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="py-8 px-4 sm:px-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!taxReturn) {
    return (
      <div className="py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">No Tax Return Found</h1>
          <p className="text-muted-foreground mb-6">
            Start a new tax intake to track your progress.
          </p>
          <Button asChild>
            <Link href="/portal/intake">Start Tax Intake</Link>
          </Button>
        </div>
      </div>
    )
  }

  const currentStatusIndex = statusOrder.indexOf(taxReturn.status)
  const currentStatusInfo = caseStatuses[taxReturn.status] || { label: "Unknown", color: "bg-gray-500" }

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Case Status
          </h1>
          <p className="text-muted-foreground">
            Track the progress of your {taxReturn.taxYear} tax return
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
              {statusOrder.map((status, index) => {
                const statusInfo = caseStatuses[status]
                const isComplete = index < currentStatusIndex
                const isCurrent = index === currentStatusIndex
                const isPending = index > currentStatusIndex

                return (
                  <div key={status} className="flex gap-4">
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
                      {index < statusOrder.length - 1 && (
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
                          {getStatusDescription(status)}
                        </p>
                        {status === "intake" && taxReturn.createdAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(taxReturn.createdAt).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        )}
                        {status === "filed" && taxReturn.filedAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(taxReturn.filedAt).toLocaleDateString("en-US", {
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

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" asChild>
            <Link href="/portal">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function getStatusDescription(status: CaseStatus): string {
  const descriptions: Record<CaseStatus, string> = {
    intake: "Your intake form has been submitted and is being processed.",
    documents_pending: "Additional documents are needed. Please upload required documents.",
    in_review: "Your tax preparer is actively reviewing your documents.",
    ready_for_review: "Your return is ready for your review before filing.",
    approved: "You have approved your return and it is ready to be filed.",
    filed: "Your tax return has been filed with the IRS.",
    completed: "Your tax return is complete. Thank you for choosing us!",
  }
  return descriptions[status] || "Processing..."
}
