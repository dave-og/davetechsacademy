// Supabase Edge Function: verify-payment
// Description: Verifies Paystack transaction server-side and invokes atomic fulfillment RPC in PostgreSQL.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY") ?? "";

    if (!paystackSecretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured on the server.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { reference } = await req.json();

    if (!reference) {
      return new Response(
        JSON.stringify({ success: false, error: "Payment reference is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Call Paystack Verify API
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      return new Response(
        JSON.stringify({ success: false, error: paystackData.message || "Payment verification failed." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tx = paystackData.data;

    // Check transaction status
    if (tx.status !== "success") {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Payment status is ${tx.status}: ${tx.gateway_response || "Payment not completed."}`,
          status: tx.status,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Invoke atomic database RPC to fulfill enrollment
    const { data: fulfillment, error: rpcError } = await supabase.rpc("fulfill_enrollment_on_payment", {
      p_payment_reference: reference,
      p_paystack_tx_id: String(tx.id),
      p_channel: tx.channel || "card",
    });

    if (rpcError) {
      console.error("Database fulfillment RPC error:", rpcError);
      throw new Error(`Fulfillment error: ${rpcError.message}`);
    }

    // 3. Log payment event
    await supabase.from("payment_events").insert({
      reference: reference,
      event_type: "verification_success",
      payload: tx,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified and enrollment confirmed.",
        data: {
          reference: reference,
          amount: tx.amount / 100,
          currency: tx.currency,
          channel: tx.channel,
          paid_at: tx.paid_at,
          fulfillment: fulfillment,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Internal server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
