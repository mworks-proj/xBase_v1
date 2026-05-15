// xTax Type Definitions
// Suggested data models for the tax portal

import type { CaseStatus, DocumentCategory, IntakePath, PaymentTiming } from "@/lib/config"

// Profile - extends Supabase auth.users
export interface Profile {
  id: string // UUID from auth.users
  email: string
  full_name: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

// Tax Client - linked to profile
export interface TaxClient {
  id: string
  profile_id: string // References profiles.id
  filing_status: FilingStatus | null
  has_dependents: boolean
  is_returning_client: boolean
  wallet_address: string | null // Optional XRPL/Xahau wallet
  stripe_customer_id: string | null // Optional Stripe customer
  xaman_user_token: string | null // Optional Xaman token
  created_at: string
  updated_at: string
}

// Tax Case - a single tax filing request
export interface TaxCase {
  id: string
  client_id: string // References tax_clients.id
  intake_path: IntakePath
  status: CaseStatus
  tax_year: number
  service_id: string | null
  total_amount: number | null
  amount_paid: number | null
  preparer_notes: string | null
  created_at: string
  updated_at: string
  filed_at: string | null
  completed_at: string | null
}

// Tax Document - uploaded files
export interface TaxDocument {
  id: string
  case_id: string // References tax_cases.id
  client_id: string // References tax_clients.id
  category: DocumentCategory
  file_name: string
  file_url: string
  file_size: number
  mime_type: string
  uploaded_at: string
  verified: boolean
  verified_at: string | null
}

// Tax Intake Answer - form responses
export interface TaxIntakeAnswer {
  id: string
  case_id: string // References tax_cases.id
  question_key: string
  answer_value: string
  created_at: string
  updated_at: string
}

// Payment Method
export interface PaymentMethod {
  id: string
  client_id: string // References tax_clients.id
  type: "stripe" | "xrpl" | "xahau"
  stripe_payment_method_id: string | null
  wallet_address: string | null
  is_default: boolean
  created_at: string
}

// Payment Record
export interface PaymentRecord {
  id: string
  case_id: string // References tax_cases.id
  client_id: string // References tax_clients.id
  amount: number
  currency: "USD" | "XRP" | "XAH"
  payment_method: "stripe" | "xrpl" | "xahau"
  status: PaymentStatus
  stripe_payment_intent_id: string | null
  tx_hash: string | null
  payment_timing: PaymentTiming
  created_at: string
  completed_at: string | null
}

// Admin User
export interface AdminUser {
  id: string
  profile_id: string // References profiles.id
  role: AdminRole
  permissions: string[]
  created_at: string
}

// Enums
export type FilingStatus = 
  | "single"
  | "married_filing_jointly"
  | "married_filing_separately"
  | "head_of_household"
  | "qualifying_widow"

export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded"

export type AdminRole = "admin" | "preparer" | "reviewer"

// Form Data Types for Intake
export interface W2IntakeData {
  full_name: string
  email: string
  phone: string
  filing_status: FilingStatus
  is_returning_client: boolean
  has_dependents: boolean
  dependent_count?: number
  direct_deposit_note?: string
}

export interface SelfEmployedIntakeData {
  full_name: string
  email: string
  phone: string
  business_type: string
  income_summary?: string
  expense_categories?: string[]
  mileage_tracked: boolean
  home_office: boolean
}

export interface BusinessIntakeData {
  business_name: string
  entity_type: BusinessEntityType
  ein_placeholder?: string
  owner_name: string
  owner_email: string
  owner_phone: string
  bookkeeping_status: BookkeepingStatus
  has_payroll: boolean
  issued_1099s: boolean
  consultation_required: boolean
}

export type BusinessEntityType = 
  | "sole_proprietor"
  | "llc_single"
  | "llc_multi"
  | "s_corp"
  | "c_corp"
  | "partnership"

export type BookkeepingStatus = 
  | "up_to_date"
  | "partial"
  | "needs_work"
  | "none"
