import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2025-04-30.basil",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } }
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleFailedPayment(session);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook handler failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const taxReturnId = session.metadata?.tax_return_id;
  const serviceName = session.metadata?.service_name;

  if (!userId) {
    console.error("No user_id in session metadata");
    return;
  }

  // Idempotency check: verify this session hasn't already been processed
  const { data: existingPayment } = await supabaseAdmin
    .from("payments")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .single();

  if (existingPayment) {
    console.log(`Payment for session ${session.id} already processed, skipping`);
    return;
  }

  // Create payment record
  const paymentData: Record<string, unknown> = {
    user_id: userId,
    amount: (session.amount_total || 0) / 100, // Convert cents to dollars
    currency: session.currency || "usd",
    payment_method: "card",
    provider: "stripe",
    status: "completed",
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: typeof session.payment_intent === "string" 
      ? session.payment_intent 
      : session.payment_intent?.id,
    description: serviceName || "Tax Service Payment",
  };

  if (taxReturnId) {
    paymentData.tax_return_id = taxReturnId;
  }

  const { error: paymentError } = await supabaseAdmin
    .from("payments")
    .insert(paymentData);

  if (paymentError) {
    console.error("Error creating payment record:", paymentError);
    throw paymentError;
  }

  // If linked to a tax return, update its payment status
  if (taxReturnId) {
    const { error: updateError } = await supabaseAdmin
      .from("tax_returns")
      .update({ 
        payment_status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", taxReturnId);

    if (updateError) {
      console.error("Error updating tax return payment status:", updateError);
    }
  }

  console.log(`Payment completed for user ${userId}, session ${session.id}`);
}

async function handleFailedPayment(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const taxReturnId = session.metadata?.tax_return_id;

  if (!userId) {
    console.error("No user_id in session metadata");
    return;
  }

  // Idempotency check
  const { data: existingPayment } = await supabaseAdmin
    .from("payments")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .single();

  if (existingPayment) {
    console.log(`Failed payment for session ${session.id} already recorded, skipping`);
    return;
  }

  // Create failed payment record
  const paymentData: Record<string, unknown> = {
    user_id: userId,
    amount: (session.amount_total || 0) / 100,
    currency: session.currency || "usd",
    payment_method: "card",
    provider: "stripe",
    status: "failed",
    stripe_checkout_session_id: session.id,
    description: session.metadata?.service_name || "Tax Service Payment (Failed)",
  };

  if (taxReturnId) {
    paymentData.tax_return_id = taxReturnId;
  }

  const { error } = await supabaseAdmin
    .from("payments")
    .insert(paymentData);

  if (error) {
    console.error("Error creating failed payment record:", error);
  }

  console.log(`Payment failed for user ${userId}, session ${session.id}`);
}
