import { getStripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import type Stripe from "stripe"

// Lazy initialization of admin Supabase client for webhook (bypasses RLS)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  const stripe = getStripe()

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.payment_status === "paid") {
        await handleSuccessfulPayment(session)
      }
      break
    }

    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session
      await handleSuccessfulPayment(session)
      break
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session
      await handleFailedPayment(session)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const taxReturnId = session.metadata?.tax_return_id
  const serviceName = session.metadata?.service_name
  const serviceId = session.metadata?.service_id

  if (!userId) {
    console.error("No user_id in session metadata")
    return
  }

  // Create payment record
  const paymentData: Record<string, unknown> = {
    user_id: userId,
    amount: (session.amount_total || 0) / 100, // Convert cents to dollars
    payment_method: "card",
    status: "completed",
    provider: "stripe",
    currency: session.currency || "usd",
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: session.payment_intent as string,
    description: serviceName || "Tax Preparation Service",
    transaction_id: session.payment_intent as string,
  }

  if (taxReturnId) {
    paymentData.tax_return_id = taxReturnId
  }

  const supabaseAdmin = getSupabaseAdmin()

  const { error: paymentError } = await supabaseAdmin
    .from("payments")
    .insert(paymentData)

  if (paymentError) {
    console.error("Error creating payment record:", paymentError)
  }

  // If there's a tax return, update its payment status
  if (taxReturnId) {
    const { error: updateError } = await supabaseAdmin
      .from("tax_returns")
      .update({
        payment_status: "paid",
        payment_method: "card",
        prep_fee: (session.amount_total || 0) / 100,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taxReturnId)

    if (updateError) {
      console.error("Error updating tax return:", updateError)
    }
  }

  console.log(`Payment processed successfully for user ${userId}`)
}

async function handleFailedPayment(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const taxReturnId = session.metadata?.tax_return_id

  if (!userId) {
    console.error("No user_id in session metadata")
    return
  }

  // Create failed payment record
  const paymentData: Record<string, unknown> = {
    user_id: userId,
    amount: (session.amount_total || 0) / 100,
    payment_method: "card",
    status: "failed",
    provider: "stripe",
    currency: session.currency || "usd",
    stripe_checkout_session_id: session.id,
    description: session.metadata?.service_name || "Tax Preparation Service",
  }

  if (taxReturnId) {
    paymentData.tax_return_id = taxReturnId
  }

  const supabaseAdmin = getSupabaseAdmin()

  const { error } = await supabaseAdmin
    .from("payments")
    .insert(paymentData)

  if (error) {
    console.error("Error creating failed payment record:", error)
  }

  console.log(`Payment failed for user ${userId}`)
}
