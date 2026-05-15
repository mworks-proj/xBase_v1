import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { caseStatuses } from "@/lib/config"
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

// Mock data for admin dashboard
const mockStats = {
  totalClients: 47,
  newIntakes: 8,
  missingDocuments: 5,
  awaitingPayment: 12,
  inProgress: 15,
  filedComplete: 7,
  recentUploads: 3,
  recentPayments: 2,
  totalRevenue: 12450,
}

const mockClients = [
  {
    id: "1",
    name: "John Smith",
    email: "john@example.com",
    caseType: "W-2 Simple",
    status: "in_progress" as const,
    documentStatus: "Complete",
    paymentStatus: "Paid",
    lastUpdated: "2025-01-15",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    caseType: "1099 / Self-Employed",
    status: "missing_documents" as const,
    documentStatus: "2 Missing",
    paymentStatus: "Pending",
    lastUpdated: "2025-01-14",
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mike@example.com",
    caseType: "Small Business",
    status: "awaiting_payment" as const,
    documentStatus: "Complete",
    paymentStatus: "Due",
    lastUpdated: "2025-01-13",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@example.com",
    caseType: "W-2 + Dependents",
    status: "new_intake" as const,
    documentStatus: "Not Started",
    paymentStatus: "Not Due",
    lastUpdated: "2025-01-12",
  },
  {
    id: "5",
    name: "Robert Wilson",
    email: "robert@example.com",
    caseType: "W-2 Simple",
    status: "filed" as const,
    documentStatus: "Complete",
    paymentStatus: "Paid",
    lastUpdated: "2025-01-11",
  },
]

export default function AdminDashboard() {
  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Tax Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of all client cases and activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Clients</p>
                  <p className="text-2xl font-bold">{mockStats.totalClients}</p>
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
                  <p className="text-2xl font-bold text-blue-500">{mockStats.newIntakes}</p>
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
                  <p className="text-sm text-muted-foreground">Missing Docs</p>
                  <p className="text-2xl font-bold text-orange-500">{mockStats.missingDocuments}</p>
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
                  <p className="text-2xl font-bold text-yellow-500">{mockStats.awaitingPayment}</p>
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
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-indigo-500">{mockStats.inProgress}</p>
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
                  <p className="text-2xl font-bold text-success">{mockStats.filedComplete}</p>
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
                  <p className="text-2xl font-bold">{mockStats.recentUploads}</p>
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
                  <p className="text-2xl font-bold text-success">${mockStats.totalRevenue.toLocaleString()}</p>
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
            <CardDescription>Latest client activity and case status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Client</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Case Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Documents</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Payment</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {mockClients.map((client) => {
                    const statusInfo = caseStatuses[client.status]
                    return (
                      <tr key={client.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-sm">{client.name}</p>
                            <p className="text-xs text-muted-foreground">{client.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm hidden sm:table-cell">{client.caseType}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            client.status === "new_intake" ? "status-new-intake" :
                            client.status === "awaiting_payment" ? "status-awaiting-payment" :
                            client.status === "missing_documents" ? "status-missing-documents" :
                            client.status === "in_progress" ? "status-in-progress" :
                            client.status === "filed" ? "status-filed" :
                            "status-complete"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.color}`} />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm hidden md:table-cell">
                          <span className={client.documentStatus === "Complete" ? "text-success" : client.documentStatus.includes("Missing") ? "text-orange-500" : "text-muted-foreground"}>
                            {client.documentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm hidden md:table-cell">
                          <span className={client.paymentStatus === "Paid" ? "text-success" : client.paymentStatus === "Due" ? "text-yellow-500" : "text-muted-foreground"}>
                            {client.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">
                          {new Date(client.lastUpdated).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
