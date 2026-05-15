import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const taxReturnId = formData.get("taxReturnId") as string
    const documentType = formData.get("documentType") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!taxReturnId) {
      return NextResponse.json({ error: "No tax return ID provided" }, { status: 400 })
    }

    // Verify user owns this tax return
    const { data: taxReturn, error: taxReturnError } = await supabase
      .from("tax_returns")
      .select("id")
      .eq("id", taxReturnId)
      .eq("user_id", user.id)
      .single()

    if (taxReturnError || !taxReturn) {
      return NextResponse.json({ error: "Tax return not found" }, { status: 404 })
    }

    // Upload to Vercel Blob (private storage)
    const blob = await put(`tax-documents/${user.id}/${taxReturnId}/${file.name}`, file, {
      access: "private",
    })

    // Save document record to database
    const { data: document, error: docError } = await supabase
      .from("tax_documents")
      .insert({
        tax_return_id: taxReturnId,
        user_id: user.id,
        document_type: documentType || "other",
        file_name: file.name,
        file_url: blob.pathname, // Store pathname for private access
        file_size: file.size,
        status: "uploaded",
      })
      .select()
      .single()

    if (docError) {
      console.error("Database error:", docError)
      return NextResponse.json({ error: "Failed to save document record" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      document: {
        id: document.id,
        fileName: document.file_name,
        documentType: document.document_type,
        status: document.status,
        createdAt: document.created_at,
      }
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
