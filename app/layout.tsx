import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
const ogImageUrl = `${baseUrl}/images/xmerch-cli-og.png`

// Updated metadata for xBase template
export const metadata: Metadata = {
  title: "xBase - Xahau + Xaman Template",
  description: "Free template for Xahau + Xaman wallet integrations, deployable on Evernode",
  generator: "xBase",
  metadataBase: new URL(baseUrl),
  icons: {
    icon: "/xmerch-icon.svg",
    apple: "/xmerch-icon.svg",
  },
  openGraph: {
    title: "xBase - Xahau + Xaman Template",
    description: "Spin up the dApp. Connect with Xaman. Go live on-ledger.",
    url: baseUrl,
    siteName: "xBase",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "xMerch CLI - Spin up the dApp. Connect with Xaman. Go live on-ledger.",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "xBase - Xahau + Xaman Template",
    description: "Spin up the dApp. Connect with Xaman. Go live on-ledger.",
    images: [ogImageUrl],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
