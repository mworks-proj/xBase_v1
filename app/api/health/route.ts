import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  checks: {
    database: { status: "ok" | "error"; message?: string }
    environment: { status: "ok" | "error"; message?: string }
    supabase: { status: "ok" | "error"; message?: string }
  }
  version?: string
}

export async function GET() {
  const timestamp = new Date().toISOString()
  const health: HealthCheck = {
    status: "healthy",
    timestamp,
    checks: {
      database: { status: "ok" },
      environment: { status: "ok" },
      supabase: { status: "ok" },
    },
    version: process.env.npm_package_version || "1.0.0",
  }

  // Check environment variables
  const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_BASE_URL"]

  const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key])

  if (missingEnvVars.length > 0) {
    health.checks.environment = {
      status: "error",
      message: `Missing environment variables: ${missingEnvVars.join(", ")}`,
    }
    health.status = "unhealthy"
  }

  // Check Supabase connection
  try {
    const supabase = await createClient()

    // Test database connection with a simple query
    const { error } = await supabase.from("donations").select("id").limit(1)

    if (error) {
      health.checks.database = {
        status: "error",
        message: `Database query failed: ${error.message}`,
      }
      health.status = "degraded"
    }
  } catch (error) {
    health.checks.supabase = {
      status: "error",
      message: error instanceof Error ? error.message : "Supabase connection failed",
    }
    health.status = "unhealthy"
  }

  // Return appropriate status code
  const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}
