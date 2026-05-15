// xTax Portal Configuration
// This file contains all customizable settings for the tax portal template

export const taxPortalConfig = {
  // Template branding
  templateName: "xTax",
  
  // Provider/firm branding (customize for each deployment)
  providerName: "Heavy Weight LLC",
  providerDisplayName: "Heavy Weight Tax Services",
  supportEmail: "support@heavyweighttax.com",
  supportPhone: "(555) 123-4567",
  
  // Payment settings
  paymentLabel: "Heavy Weight LLC Tax Payment",
  enableStripe: true,
  enableXaman: true,
  paymentTiming: "after_review" as const, // "before_intake" | "after_review" | "before_filing" | "deposit"
  
  // Features
  enableClientLogin: true,
  enableDocumentUpload: true,
  enableAdminDashboard: true,
  
  // Built by attribution
  builtBy: "MWorks Design LLC",
  
  // Links
  links: {
    github: "https://github.com/mworks-proj/xBase",
    npm: "https://www.npmjs.com/package/xmerch",
    xrpl: "https://xrpl.org",
    xahau: "https://xahau.network",
  },
} as const

// Service pricing (editable template data)
export const services = [
  {
    id: "w2-simple",
    name: "Simple W-2 Return",
    description: "Perfect for straightforward employment income filing",
    price: 149,
    priceLabel: "Starting at $149",
    features: [
      "Single W-2 processing",
      "Standard deductions",
      "E-file included",
      "Direct deposit setup",
    ],
    intakePath: "w2",
  },
  {
    id: "w2-dependents",
    name: "W-2 + Dependents",
    description: "Ideal for families with dependents and child tax credits",
    price: 199,
    priceLabel: "Starting at $199",
    features: [
      "Multiple W-2s",
      "Dependent credits",
      "Education credits",
      "Child tax credit",
    ],
    intakePath: "w2",
  },
  {
    id: "self-employed",
    name: "1099 / Self-Employed",
    description: "For freelancers, contractors, and gig workers",
    price: 299,
    priceLabel: "Starting at $299",
    features: [
      "1099-NEC/K/MISC",
      "Business deductions",
      "Mileage tracking",
      "Home office deduction",
    ],
    intakePath: "1099",
  },
  {
    id: "small-business",
    name: "Small Business Tax Prep",
    description: "Comprehensive preparation for small business owners",
    price: null,
    priceLabel: "Custom Quote",
    features: [
      "Business entity returns",
      "Payroll processing",
      "Quarterly estimates",
      "Dedicated support",
    ],
    intakePath: "business",
  },
] as const

// Tax case statuses (match database status field values)
export const caseStatuses = {
  intake: { label: "New Intake", color: "bg-blue-500" },
  documents_pending: { label: "Documents Pending", color: "bg-orange-500" },
  in_review: { label: "In Review", color: "bg-indigo-500" },
  ready_for_review: { label: "Ready for Client Review", color: "bg-purple-500" },
  approved: { label: "Approved", color: "bg-teal-500" },
  filed: { label: "Filed", color: "bg-green-500" },
  completed: { label: "Completed", color: "bg-emerald-500" },
} as const

// Document categories
export const documentCategories = [
  { id: "w2", label: "W-2", required: true, intakePaths: ["w2"] },
  { id: "1099", label: "1099 Forms", required: true, intakePaths: ["1099", "business"] },
  { id: "government_id", label: "Government ID", required: true, intakePaths: ["w2", "1099", "business"] },
  { id: "prior_return", label: "Prior Year Return", required: false, intakePaths: ["w2", "1099", "business"] },
  { id: "dependent_info", label: "Dependent Information", required: false, intakePaths: ["w2"] },
  { id: "business_income", label: "Business Income Records", required: true, intakePaths: ["1099", "business"] },
  { id: "business_expenses", label: "Business Expense Records", required: true, intakePaths: ["1099", "business"] },
  { id: "receipts", label: "Receipts", required: false, intakePaths: ["1099", "business"] },
  { id: "bank_statements", label: "Bank Statements", required: true, intakePaths: ["business"] },
  { id: "payroll_docs", label: "Payroll Documents", required: false, intakePaths: ["business"] },
  { id: "other", label: "Other Supporting Documents", required: false, intakePaths: ["w2", "1099", "business"] },
] as const

// Tech stack logos for marquee
export const techLogos = [
  { src: "https://assets.vercel.com/image/upload/v1607554385/repositories/next-js/next-logo.png", alt: "Next.js" },
  { src: "/images/supabase-logo-wordmark-dark.png", alt: "Supabase" },
  { src: "https://tailwindcss.com/_next/static/media/tailwindcss-logotype-white.830c8e49.svg", alt: "Tailwind CSS" },
  { src: "/images/xrpl-logo.png", alt: "XRPL" },
  { src: "https://raw.githubusercontent.com/Xahau/Graphics/main/xahau-logo-white.svg", alt: "Xahau" },
  { src: "https://raw.githubusercontent.com/XRPL-Labs/Xaman-Branding/main/Logo/xaman-logo-white.svg", alt: "Xaman" },
]

export type ServiceId = typeof services[number]["id"]
export type IntakePath = "w2" | "1099" | "business"
export type CaseStatus = keyof typeof caseStatuses
export type PaymentTiming = "before_intake" | "after_review" | "before_filing" | "deposit"
export type DocumentCategory = typeof documentCategories[number]["id"]
