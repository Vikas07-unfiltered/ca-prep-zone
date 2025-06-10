
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHmac } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-RAZORPAY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type, itemName, amount } = await req.json();
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing required payment verification fields");
    }

    logStep("Verifying payment", { orderId: razorpay_order_id, paymentId: razorpay_payment_id });

    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeySecret) {
      throw new Error("Razorpay secret key not configured");
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = await createHmac("sha256", razorpayKeySecret).update(body).digest("hex");

    if (expectedSignature !== razorpay_signature) {
      logStep("Payment verification failed - invalid signature");
      throw new Error("Payment verification failed");
    }

    logStep("Payment signature verified successfully");

    // Store payment record in database
    const paymentRecord = {
      user_id: user.id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: amount / 100, // Convert back from paise to rupees
      payment_type: type,
      item_name: itemName,
      status: 'success',
      created_at: new Date().toISOString()
    };

    const { error: insertError } = await supabaseClient
      .from('payments')
      .insert(paymentRecord);

    if (insertError) {
      logStep("Error storing payment record", { error: insertError });
      throw new Error(`Failed to store payment record: ${insertError.message}`);
    }

    logStep("Payment record stored successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment verified and recorded successfully",
        paymentId: razorpay_payment_id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-razorpay-payment", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
