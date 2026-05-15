import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } }
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface XamanWebhookPayload {
  meta: {
    url: string;
    application_uuidv4: string;
    payload_uuidv4: string;
    opened_by_deeplink: boolean;
  };
  custom_meta: {
    identifier: string | null;
    blob: {
      user_id?: string;
      tax_return_id?: string;
      service_id?: string;
      service_name?: string;
      usd_amount?: number;
      xrp_price?: number;
    } | null;
    instruction: string | null;
  };
  payloadResponse: {
    payload_uuidv4: string;
    reference_call_uuidv4: string;
    signed: boolean;
    user_token: boolean;
    return_url: {
      app: string | null;
      web: string | null;
    };
    txid: string | null;
  };
  userToken: {
    user_token: string | null;
    token_issued: string | null;
    token_expiration: string | null;
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: XamanWebhookPayload = await req.json();
    
    console.log("Xaman webhook received:", JSON.stringify(payload, null, 2));

    const payloadUuid = payload.meta.payload_uuidv4;
    const signed = payload.payloadResponse.signed;
    const txid = payload.payloadResponse.txid;

    if (!payloadUuid) {
      console.error("No payload UUID in webhook");
      return new Response(JSON.stringify({ error: "Missing payload UUID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find the pending payment by payload UUID
    const { data: payment, error: findError } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("xaman_payload_uuid", payloadUuid)
      .single();

    if (findError || !payment) {
      console.error("Payment not found for payload:", payloadUuid);
      return new Response(JSON.stringify({ error: "Payment not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotency check: if already completed, skip
    if (payment.status === "completed" && payment.xrpl_tx_hash) {
      console.log(`Payment ${payment.id} already completed, skipping`);
      return new Response(JSON.stringify({ received: true, status: "already_processed" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (signed && txid) {
      // Payment was signed and submitted
      console.log(`Payment ${payment.id} signed with tx: ${txid}`);

      // Update payment record
      const { error: updateError } = await supabaseAdmin
        .from("payments")
        .update({
          status: "completed",
          xrpl_tx_hash: txid,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      if (updateError) {
        console.error("Error updating payment:", updateError);
        throw updateError;
      }

      // If linked to a tax return, update its payment status
      if (payment.tax_return_id) {
        const { error: taxUpdateError } = await supabaseAdmin
          .from("tax_returns")
          .update({
            payment_status: "paid",
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.tax_return_id);

        if (taxUpdateError) {
          console.error("Error updating tax return:", taxUpdateError);
        }
      }

      console.log(`Payment ${payment.id} completed successfully`);
    } else {
      // Payment was rejected/cancelled
      console.log(`Payment ${payment.id} was not signed (rejected or expired)`);

      const { error: updateError } = await supabaseAdmin
        .from("payments")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      if (updateError) {
        console.error("Error updating failed payment:", updateError);
      }
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
