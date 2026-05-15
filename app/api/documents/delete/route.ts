import { del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json({ error: "No document ID provided" }, { status: 400 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    const isAdmin = profile?.is_admin === true

    // Get document and verify ownership
    const { data: document, error: docError } = await supabase
      .from("tax_documents")
      .select("id, user_id, file_url")
      .eq("id", documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Only allow deletion if user owns the document or is admin
    if (document.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete from Vercel Blob
    if (document.file_url) {
      try {
        await del(document.file_url)
      } catch (blobError) {
        console.error("Blob deletion error:", blobError)
        // Continue with database deletion even if blob deletion fails
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("tax_documents")
      .delete()
      .eq("id", documentId)

    if (deleteError) {
      console.error("Database deletion error:", deleteError)
      return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
