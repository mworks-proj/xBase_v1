"use server"

import { stripe } from "@/lib/stripe"
import { getServiceById, TAX_SERVICES } from "@/lib/products"
import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

export interface CheckoutResult {
  clientSecret?: string
  error?: string
}

export async function createCheckoutSession(
  serviceId: string,
  taxReturnId?: string
): Promise<CheckoutResult> {
  try {
    // Get the service from our products array (server-side price validation)
    const service = getServiceById(serviceId)
    if (!service) {
      return { error: "Invalid service selected" }
    }

    // Get the authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: "You must be logged in to make a payment" }
    }

    // Get user profile for email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", user.id)
      .single()

    // Determine the return URL
    const headersList = await headers()
    const origin = headersList.get("origin") || "http://localhost:3000"

    // Create metadata for the checkout session
    const metadata: Record<string, string> = {
      user_id: user.id,
      service_id: service.id,
      service_name: service.name,
    }

    if (taxReturnId) {
      metadata.tax_return_id = taxReturnId
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      customer_email: profile?.email || user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: service.name,
              description: service.description,
            },
            unit_amount: service.priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      return_url: `${origin}/portal/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      metadata,
    })

    if (!session.client_secret) {
      return { error: "Failed to create checkout session" }
    }

    return { clientSecret: session.client_secret }
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return { error: "Failed to create checkout session" }
  }
}

export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return { session }
  } catch (error) {
    console.error("Error retrieving checkout session:", error)
    return { error: "Failed to retrieve checkout session" }
  }
}

export async function getAvailableServices() {
  return TAX_SERVICES
}
