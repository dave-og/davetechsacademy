// Supabase Edge Function: payment-webhook
// Description: Secure Paystack webhook listener with HMAC SHA-512 signature verification and idempotent fulfillment.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
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

    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // 1. Verify HMAC SHA-512 signature
    if (paystackSecretKey && signature) {
      const keyBuf = new TextEncoder().encode(paystackSecretKey);
      const dataBuf = new TextEncoder().encode(rawBody);

      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBuf,
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["verify", "sign"]
      );

      const computedSig = await crypto.subtle.sign("HMAC", cryptoKey, dataBuf);
      const computedHex = Array.from(new Uint8Array(computedSig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (computedHex !== signature) {
        return new Response("Invalid signature", { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Handle event
    if (payload.event === "charge.success") {
      const data = payload.data;
      const reference = data.reference;

      // Call database fulfillment procedure (idempotent)
      const { data: fulfillment, error: rpcError } = await supabase.rpc("fulfill_enrollment_on_payment", {
        p_payment_reference: reference,
        p_paystack_tx_id: String(data.id),
        p_channel: data.channel || "card",
      });

      if (rpcError) {
        console.error("Webhook fulfillment error:", rpcError);
      }

      // Log webhook event
      await supabase.from("payment_events").insert({
        reference: reference,
        event_type: "webhook_charge_success",
        payload: payload,
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
