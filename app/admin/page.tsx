import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { caseStatuses } from "@/lib/config"
import { redirect } from "next/navigation"
import { 
  Users, 
  FileText, 
  AlertCircle, 
  CreditCard, 
  Clock,
  CheckCircle,
  Upload,
  DollarSign
} from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Verify admin status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin) {
    redirect("/portal")
  }

  // Fetch stats
  const currentYear = new Date().getFullYear()

  // Total clients (profiles that are not admins)
  const { count: totalClients } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_admin", false)

  // Tax returns by status
  const { data: taxReturns } = await supabase
    .from("tax_returns")
    .select(`
      id,
      user_id,
      tax_year,
      filing_status,
      status,
      prep_fee,
      payment_status,
      created_at,
      updated_at,
      profiles!tax_returns_user_id_fkey (
        first_name,
        last_name,
        email
      )
    `)
    .eq("tax_year", currentYear)
    .order("updated_at", { ascending: false })

  // Calculate stats from tax returns
  const returns = taxReturns || []
  const newIntakes = returns.filter(r => r.status === "intake").length
  const documentsPending = returns.filter(r => r.status === "documents_pending").length
  const inReview = returns.filter(r => r.status === "in_review").length
  const awaitingPayment = returns.filter(r => r.payment_status === "pending" && r.status !== "intake").length
  const filed = returns.filter(r => r.status === "filed" || r.status === "completed").length

  // Recent documents (last 24 hours)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const { count: recentUploads } = await supabase
    .from("tax_documents")
    .select("*", { count: "exact", head: true })
    .gte("created_at", yesterday.toISOString())

  // Total revenue from completed payments
  const { data: completedPayments } = await supabase
    .from("payments")
    .select("amount")
    .eq("status", "completed")

  const totalRevenue = completedPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  // Recent payments count
  const { count: recentPayments } = await supabase
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")
    .gte("created_at", yesterday.toISOString())

  const stats = {
    totalClients: totalClients || 0,
    newIntakes,
    documentsPending,
    awaitingPayment,
    inReview,
    filed,
    recentUploads: recentUploads || 0,
    recentPayments: recentPayments || 0,
    totalRevenue,
  }

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Tax Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of all client cases and activity for {currentYear}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Clients</p>
                  <p className="text-2xl font-bold">{stats.totalClients}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New Intakes</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.newIntakes}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Docs</p>
                  <p className="text-2xl font-bold text-orange-500">{stats.documentsPending}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Awaiting Payment</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.awaitingPayment}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Review</p>
                  <p className="text-2xl font-bold text-indigo-500">{stats.inReview}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-indigo-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Filed / Complete</p>
                  <p className="text-2xl font-bold text-success">{stats.filed}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recent Uploads</p>
                  <p className="text-2xl font-bold">{stats.recentUploads}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-success">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Cases Table */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle>Recent Cases</CardTitle>
            <CardDescription>Latest client activity and case status for {currentYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Client</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Filing Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Prep Fee</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Payment</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No tax returns found for {currentYear}
                      </td>
                    </tr>
                  ) : (
                    returns.slice(0, 10).map((taxReturn) => {
                      const statusKey = taxReturn.status as keyof typeof caseStatuses
                      const statusInfo = caseStatuses[statusKey] || caseStatuses.intake
                      const clientProfile = taxReturn.profiles as unknown as { first_name: string | null; last_name: string | null; email: string | null }
                      const clientName = [clientProfile?.first_name, clientProfile?.last_name].filter(Boolean).join(" ") || "Unknown"
                      const clientEmail = clientProfile?.email || "No email"

                      return (
                        <tr key={taxReturn.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-sm">{clientName}</p>
                              <p className="text-xs text-muted-foreground">{clientEmail}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm hidden sm:table-cell capitalize">
                            {taxReturn.filing_status?.replace(/_/g, " ") || "N/A"}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                              statusKey === "intake" ? "bg-blue-500/10 text-blue-500 border-blue-500/30" :
                              statusKey === "documents_pending" ? "bg-orange-500/10 text-orange-500 border-orange-500/30" :
                              statusKey === "in_review" ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/30" :
                              statusKey === "ready_for_review" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" :
                              statusKey === "approved" ? "bg-teal-500/10 text-teal-500 border-teal-500/30" :
                              statusKey === "filed" ? "bg-success/10 text-success border-success/30" :
                              statusKey === "completed" ? "bg-success/10 text-success border-success/30" :
                              "bg-muted/10 text-muted-foreground border-border"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.color}`} />
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm hidden md:table-cell">
                            ${taxReturn.prep_fee || 0}
                          </td>
                          <td className="py-3 px-4 text-sm hidden md:table-cell">
                            <span className={
                              taxReturn.payment_status === "paid" ? "text-success" :
                              taxReturn.payment_status === "partial" ? "text-yellow-500" :
                              "text-muted-foreground"
                            }>
                              {taxReturn.payment_status === "paid" ? "Paid" :
                               taxReturn.payment_status === "partial" ? "Partial" :
                               "Pending"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">
                            {new Date(taxReturn.updated_at).toLocaleDateString()}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
