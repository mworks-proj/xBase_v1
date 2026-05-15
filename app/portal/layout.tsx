import { PortalHeader } from "@/components/portal-header"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <PortalHeader />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}
