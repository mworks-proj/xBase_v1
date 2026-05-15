import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { taxPortalConfig } from "@/lib/config"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

export const metadata: Metadata = {
  title: `${taxPortalConfig.providerDisplayName} | Secure Tax Services Portal`,
  description: `Professional tax preparation services by ${taxPortalConfig.providerName}. Secure document upload, easy intake process, and flexible payment options including card and crypto.`,
  generator: taxPortalConfig.templateName,
  metadataBase: new URL(baseUrl),
  icons: {
    icon: "/xtax-icon.svg",
    apple: "/xtax-icon.svg",
  },
  openGraph: {
    title: `${taxPortalConfig.providerDisplayName} | Secure Tax Services Portal`,
    description: `Professional tax preparation services. Submit your documents securely and track your return status.`,
    url: baseUrl,
    siteName: taxPortalConfig.providerDisplayName,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${taxPortalConfig.providerDisplayName} | Secure Tax Services Portal`,
    description: `Professional tax preparation services. Submit your documents securely and track your return status.`,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-background">
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
