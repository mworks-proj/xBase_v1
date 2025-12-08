import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[xbase] Missing Supabase environment variables")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase
      .from("donations")
      .select("id, network, amount, currency, memo, sender_address, created_at")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("[xbase] Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 })
    }

    return NextResponse.json(data || [], {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
      },
    })
  } catch (error) {
    console.error("[xbase] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
