// ====================================================================
// AudiVox Edge Function: register-user
// Handles secure registration, phone normalization, duplicate checks,
// and 8-digit server-generated Profile ID.
// ====================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "SERVER_CONFIG_MISSING", message: "Server configuration missing." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { fullName, phoneNumber, password, confirmPassword } = await req.json();

    // 1. Basic validation
    if (!fullName || !phoneNumber || !password) {
      return new Response(
        JSON.stringify({ error: "MISSING_FIELDS", message: "নাম, ফোন নম্বর এবং পাসওয়ার্ড আবশ্যক।" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (password !== confirmPassword) {
      return new Response(
        JSON.stringify({ error: "PASSWORD_MISMATCH", message: "পাসওয়ার্ড দুটি মেলেনি।" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "PASSWORD_TOO_SHORT", message: "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Normalize phone number (E.164-like clean digits)
    const cleanedPhone = phoneNumber.replace(/[^0-9+]/g, "");
    if (cleanedPhone.length < 10) {
      return new Response(
        JSON.stringify({ error: "INVALID_PHONE", message: "সঠিক ফোন নম্বর প্রদান করুন।" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Check duplicate phone in profiles
    const { data: existingUser } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("phone_number", cleanedPhone)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "PHONE_ALREADY_REGISTERED", message: "এই ফোন নম্বরটি ইতিমধ্যে নিবন্ধিত।" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Create user in Supabase Auth (using phone as email-alias for reliable password auth)
    // Format: user_<digits>@audivox.local
    const phoneEmail = `${cleanedPhone.replace("+", "")}@audivox.local`;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: phoneEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName.trim(),
        phone_number: cleanedPhone,
      },
    });

    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({ error: "AUTH_ERROR", message: authError?.message || "অ্যাকাউন্ট তৈরি করতে ব্যর্থ হয়েছে।" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = authData.user.id;

    // 5. Generate secure 8-digit random Profile ID via RPC
    const { data: profileIdData, error: rpcError } = await supabaseAdmin.rpc("fn_generate_profile_id");
    const profileId = profileIdData || Math.floor(10000000 + Math.random() * 90000000).toString();

    // 6. Insert Profile record
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      profile_id: profileId,
      full_name: fullName.trim(),
      phone_number: cleanedPhone,
      is_admin: false,
      is_suspended: false,
    });

    if (profileError) {
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: "PROFILE_CREATE_FAILED", message: profileError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return success with Profile ID
    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        profile_id: profileId,
        full_name: fullName.trim(),
        phone_number: cleanedPhone,
        message: "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। এখন লাইসেন্স কি সক্রিয় করুন।",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "INTERNAL_SERVER_ERROR", message: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
