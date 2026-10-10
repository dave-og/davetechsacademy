// Supabase Edge Function: initialize-payment
// Description: Secure server-side Paystack transaction initialization with database-authoritative pricing.

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

    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request payload
    const { application_id, callback_url } = await req.json();

    if (!application_id) {
      return new Response(
        JSON.stringify({ success: false, error: "application_id is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch application details with authoritative price
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("*, courses(*)")
      .eq("id", application_id)
      .single();

    if (appError || !application) {
      return new Response(
        JSON.stringify({ success: false, error: "Application not found." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authoritative amount in Naira and kobo
    const authoritativeAmount = Number(application.total_amount || application.courses?.price || 120000);
    const amountInKobo = Math.round(authoritativeAmount * 100);

    // 2. Generate unique DTA reference: DTA_PAY_[TIMESTAMP]_[HEX]
    const timestamp = Math.floor(Date.now() / 1000);
    const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
    const reference = `DTA_PAY_${timestamp}_${randomHex}`;

    // 3. Call Paystack Initialize Transaction API
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: application.email,
        amount: amountInKobo,
        reference: reference,
        callback_url: callback_url || "https://davetechs.com/payment/callback",
        metadata: {
          application_id: application.id,
          application_number: application.application_number,
          course_id: application.course_id,
          course_title: application.courses?.title,
          student_name: `${application.first_name} ${application.last_name}`,
          user_id: application.user_id,
          referral_code: application.referral_code,
          custom_fields: [
            {
              display_name: "Application Number",
              variable_name: "application_number",
              value: application.application_number,
            },
            {
              display_name: "Course Title",
              variable_name: "course_title",
              value: application.courses?.title || "Tech Course",
            },
          ],
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      throw new Error(paystackData.message || "Failed to initialize Paystack transaction.");
    }

    // 4. Create pending payment record in PostgreSQL
    const { error: paymentError } = await supabase.from("payments").insert({
      payment_reference: reference,
      application_id: application.id,
      user_id: application.user_id,
      course_id: application.course_id,
      amount: authoritativeAmount,
      original_amount: authoritativeAmount,
      currency: "NGN",
      gateway: "paystack",
      status: "pending",
      metadata: paystackData.data,
    });

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
    }

    // 5. Update application payment_status to 'payment_processing'
    await supabase
      .from("applications")
      .update({ status: "payment_processing", payment_status: "processing" })
      .eq("id", application.id);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          authorization_url: paystackData.data.authorization_url,
          access_code: paystackData.data.access_code,
          reference: reference,
          amount: authoritativeAmount,
          currency: "NGN",
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
