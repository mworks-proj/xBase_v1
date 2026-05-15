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

// Map network IDs to ledger types
const NETWORK_ID_TO_LEDGER: Record<number, string> = {
  0: "xrpl",      // XRPL Mainnet
  1: "xrpl",      // XRPL Testnet
  2: "xrpl",      // XRPL Devnet
  21337: "xahau", // Xahau Mainnet
  21338: "xahau", // Xahau Testnet
};

function getLedgerFromNetworkId(networkId: number | null): string | null {
  if (networkId === null) return null;
  return NETWORK_ID_TO_LEDGER[networkId] || null;
}

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
      expected_ledger?: string;
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
    account?: string;
    environment_networkid?: number;
    environment_nodeuri?: string;
  };
  userToken: {
    user_token: string | null;
    token_issued: string | null;
    token_expiration: string | null;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: XamanWebhookPayload = await req.json();
    
    console.log("Xaman webhook received:", JSON.stringify(payload, null, 2));

    const payloadUuid = payload.meta.payload_uuidv4;
    const signed = payload.payloadResponse.signed;
    const txid = payload.payloadResponse.txid;
    const account = payload.payloadResponse.account;
    const networkId = payload.payloadResponse.environment_networkid;
    const nodeUri = payload.payloadResponse.environment_nodeuri;

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

    // Idempotency check
    if (payment.status === "completed" && payment.tx_hash) {
      console.log(`Payment ${payment.id} already completed, skipping`);
      return new Response(JSON.stringify({ received: true, status: "already_processed" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (signed && txid) {
      // Determine actual ledger from network ID
      const actualLedger = networkId !== undefined ? getLedgerFromNetworkId(networkId) : null;
      const expectedLedger = payment.expected_ledger;

      // Log ledger verification
      if (expectedLedger && actualLedger && expectedLedger !== actualLedger) {
        console.warn(`Ledger mismatch for payment ${payment.id}: expected ${expectedLedger}, got ${actualLedger}`);
      }

      console.log(`Payment ${payment.id} signed with tx: ${txid} on ${actualLedger || 'unknown'} network`);

      // Update payment record with all ledger info
      const { error: updateError } = await supabaseAdmin
        .from("payments")
        .update({
          status: "completed",
          tx_hash: txid,
          source_address: account,
          ledger: actualLedger,
          network_id: networkId?.toString(),
          network_endpoint: nodeUri,
          xaman_signed: true,
          xaman_resolved: true,
          xaman_payload_status: "signed",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      if (updateError) {
        console.error("Error updating payment:", updateError);
        throw updateError;
      }

      // Update tax return if linked
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

      console.log(`Payment ${payment.id} completed successfully on ${actualLedger || 'unknown'} ledger`);
    } else {
      // Payment was rejected/cancelled/expired
      console.log(`Payment ${payment.id} was not signed`);

      const { error: updateError } = await supabaseAdmin
        .from("payments")
        .update({
          status: "failed",
          xaman_signed: false,
          xaman_resolved: true,
          xaman_payload_status: "rejected",
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
