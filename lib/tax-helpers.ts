import { createClient } from '@/lib/supabase/server'
import type { TaxReturn, TaxDocument, IntakeData, Payment, Message, Profile } from '@/types/tax'

// Tax Return helpers
export async function getTaxReturns(userId: string): Promise<TaxReturn[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tax_returns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching tax returns:', error)
    return []
  }
  
  return data as TaxReturn[]
}

export async function getTaxReturn(returnId: string): Promise<TaxReturn | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tax_returns')
    .select('*')
    .eq('id', returnId)
    .single()
  
  if (error) {
    console.error('Error fetching tax return:', error)
    return null
  }
  
  return data as TaxReturn
}

export async function createTaxReturn(
  userId: string, 
  taxYear: number, 
  filingStatus: string
): Promise<TaxReturn | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tax_returns')
    .insert({
      user_id: userId,
      tax_year: taxYear,
      filing_status: filingStatus,
      status: 'intake'
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating tax return:', error)
    return null
  }
  
  return data as TaxReturn
}

export async function updateTaxReturn(
  returnId: string, 
  updates: Partial<TaxReturn>
): Promise<TaxReturn | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tax_returns')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', returnId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating tax return:', error)
    return null
  }
  
  return data as TaxReturn
}

// Document helpers
export async function getDocuments(returnId: string): Promise<TaxDocument[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tax_documents')
    .select('*')
    .eq('tax_return_id', returnId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching documents:', error)
    return []
  }
  
  return data as TaxDocument[]
}

export async function createDocument(
  returnId: string,
  userId: string,
  documentType: string,
  fileName: string,
  fileUrl: string,
  fileSize?: number
): Promise<TaxDocument | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tax_documents')
    .insert({
      tax_return_id: returnId,
      user_id: userId,
      document_type: documentType,
      file_name: fileName,
      file_url: fileUrl,
      file_size: fileSize
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating document:', error)
    return null
  }
  
  return data as TaxDocument
}

export async function deleteDocument(documentId: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tax_documents')
    .delete()
    .eq('id', documentId)
  
  if (error) {
    console.error('Error deleting document:', error)
    return false
  }
  
  return true
}

// Intake helpers
export async function getIntakeData(returnId: string): Promise<IntakeData | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('intake_data')
    .select('*')
    .eq('tax_return_id', returnId)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching intake data:', error)
    return null
  }
  
  return data as IntakeData | null
}

export async function saveIntakeData(
  returnId: string,
  userId: string,
  intakeData: Partial<IntakeData>
): Promise<IntakeData | null> {
  const supabase = await createClient()
  
  // Check if intake data exists
  const existing = await getIntakeData(returnId)
  
  if (existing) {
    const { data, error } = await supabase
      .from('intake_data')
      .update({ ...intakeData, updated_at: new Date().toISOString() })
      .eq('tax_return_id', returnId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating intake data:', error)
      return null
    }
    
    return data as IntakeData
  } else {
    const { data, error } = await supabase
      .from('intake_data')
      .insert({
        tax_return_id: returnId,
        user_id: userId,
        ...intakeData
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating intake data:', error)
      return null
    }
    
    return data as IntakeData
  }
}

// Payment helpers
export async function getPayments(returnId: string): Promise<Payment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('tax_return_id', returnId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching payments:', error)
    return []
  }
  
  return data as Payment[]
}

export async function getUserPayments(userId: string): Promise<Payment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user payments:', error)
    return []
  }
  
  return data as Payment[]
}

export async function createPayment(
  returnId: string,
  userId: string,
  amount: number,
  paymentMethod: string
): Promise<Payment | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payments')
    .insert({
      tax_return_id: returnId,
      user_id: userId,
      amount,
      payment_method: paymentMethod,
      status: 'pending'
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating payment:', error)
    return null
  }
  
  return data as Payment
}

// Message helpers
export async function getMessages(returnId: string): Promise<Message[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('tax_return_id', returnId)
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }
  
  return data as Message[]
}

export async function sendMessage(
  returnId: string,
  senderId: string,
  message: string
): Promise<Message | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('messages')
    .insert({
      tax_return_id: returnId,
      sender_id: senderId,
      message
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error sending message:', error)
    return null
  }
  
  return data as Message
}

// Admin helpers
export async function getAllTaxReturns(): Promise<(TaxReturn & { profile?: Profile })[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tax_returns')
    .select(`
      *,
      profile:profiles!tax_returns_user_id_fkey(*)
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching all tax returns:', error)
    return []
  }
  
  return data as (TaxReturn & { profile?: Profile })[]
}

export async function getAllClients(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_admin', false)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }
  
  return data as Profile[]
}

export async function getAdminStats() {
  const supabase = await createClient()
  
  const [
    { count: totalClients },
    { count: pendingReturns },
    { count: completedReturns },
    { data: payments }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_admin', false),
    supabase.from('tax_returns').select('*', { count: 'exact', head: true }).in('status', ['intake', 'documents_pending', 'in_review']),
    supabase.from('tax_returns').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('payments').select('amount').eq('status', 'completed')
  ])
  
  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
  
  return {
    totalClients: totalClients || 0,
    pendingReturns: pendingReturns || 0,
    completedReturns: completedReturns || 0,
    totalRevenue
  }
}

// Status helpers
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    intake: 'Intake Started',
    documents_pending: 'Documents Needed',
    in_review: 'Under Review',
    ready_for_review: 'Ready for Your Review',
    approved: 'Approved',
    filed: 'Filed with IRS',
    completed: 'Completed'
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    intake: 'bg-blue-500/20 text-blue-400',
    documents_pending: 'bg-yellow-500/20 text-yellow-400',
    in_review: 'bg-purple-500/20 text-purple-400',
    ready_for_review: 'bg-orange-500/20 text-orange-400',
    approved: 'bg-green-500/20 text-green-400',
    filed: 'bg-emerald-500/20 text-emerald-400',
    completed: 'bg-gold/20 text-gold'
  }
  return colors[status] || 'bg-gray-500/20 text-gray-400'
}

export function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Payment Pending',
    partial: 'Partially Paid',
    paid: 'Paid in Full'
  }
  return labels[status] || status
}
