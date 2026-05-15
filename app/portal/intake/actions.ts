"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { FilingStatus, IntakePath } from "@/types/tax"

interface IntakeFormData {
  intakePath: IntakePath
  fullName: string
  email: string
  phone: string
  filingStatus: FilingStatus | ""
  isReturningClient: boolean
  hasDependents: boolean
  dependentCount: string
  businessType: string
  mileageTracked: boolean
  homeOffice: boolean
  businessName: string
  entityType: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  hasPayroll: boolean
  issued1099s: boolean
  consultationRequired: boolean
}

export async function submitIntake(formData: IntakeFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const currentYear = new Date().getFullYear()

  // Check if a tax return already exists for this year
  const { data: existingReturn } = await supabase
    .from("tax_returns")
    .select("id")
    .eq("user_id", user.id)
    .eq("tax_year", currentYear)
    .single()

  let taxReturnId: string

  if (existingReturn) {
    taxReturnId = existingReturn.id
    
    // Update the existing return
    const { error: updateError } = await supabase
      .from("tax_returns")
      .update({
        filing_status: formData.filingStatus || "single",
        status: "documents_pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", taxReturnId)

    if (updateError) {
      console.error("Error updating tax return:", updateError)
      return { error: "Failed to update tax return" }
    }
  } else {
    // Create a new tax return
    const { data: newReturn, error: createError } = await supabase
      .from("tax_returns")
      .insert({
        user_id: user.id,
        tax_year: currentYear,
        filing_status: formData.filingStatus || "single",
        status: "documents_pending",
        prep_fee: formData.intakePath === "business" ? null : formData.intakePath === "1099" ? 299 : 149,
      })
      .select("id")
      .single()

    if (createError || !newReturn) {
      console.error("Error creating tax return:", createError)
      return { error: "Failed to create tax return" }
    }

    taxReturnId = newReturn.id
  }

  // Parse dependents
  const dependents = formData.hasDependents && formData.dependentCount
    ? Array.from({ length: parseInt(formData.dependentCount) || 0 }, (_, i) => ({
        index: i + 1,
        name: "",
        relationship: "",
      }))
    : []

  // Upsert intake data
  const { error: intakeError } = await supabase
    .from("intake_data")
    .upsert({
      tax_return_id: taxReturnId,
      user_id: user.id,
      occupation: formData.businessType || formData.entityType || null,
      dependents: JSON.stringify(dependents),
      has_w2_income: formData.intakePath === "w2",
      has_1099_income: formData.intakePath === "1099",
      has_self_employment: formData.intakePath === "1099" || formData.intakePath === "business",
      has_business_expenses: formData.mileageTracked || formData.homeOffice,
      additional_notes: [
        formData.isReturningClient ? "Returning client" : null,
        formData.mileageTracked ? "Tracks business mileage" : null,
        formData.homeOffice ? "Uses home office" : null,
        formData.hasPayroll ? "Has employees/payroll" : null,
        formData.issued1099s ? "Issued 1099s to contractors" : null,
        formData.consultationRequired ? "Requests consultation call" : null,
        formData.businessName ? `Business: ${formData.businessName}` : null,
      ].filter(Boolean).join(". "),
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "tax_return_id",
    })

  if (intakeError) {
    console.error("Error saving intake data:", intakeError)
    return { error: "Failed to save intake data" }
  }

  // Update profile with contact info
  const nameParts = formData.fullName.split(" ")
  const firstName = nameParts[0] || null
  const lastName = nameParts.slice(1).join(" ") || null

  await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      phone: formData.phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  revalidatePath("/portal", "layout")

  return { success: true, taxReturnId }
}
