// ====================================================================
// AudiVox Edge Function: activate-license
// Server-authoritative license activation, custom duration calculation,
// server clock comparison, and device limit enforcement.
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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "UNAUTHORIZED", message: "সাইন ইন করা আবশ্যক।" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { licenseKey, deviceFingerprint, deviceModel, osVersion, appVersion } = await req.json();

    if (!licenseKey || !deviceFingerprint) {
      return new Response(
        JSON.stringify({ error: "MISSING_DATA", message: "লাইসেন্স কি এবং ডিভাইস তথ্য প্রয়োজন।" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call authoritative PostgreSQL function
    const { data, error } = await supabase.rpc("fn_activate_license", {
      p_license_key: licenseKey.trim().toUpperCase(),
      p_device_fingerprint: deviceFingerprint.trim(),
      p_device_model: deviceModel || "Android Device",
      p_os_version: osVersion || "Android 14",
      p_app_version: appVersion || "1.0.0",
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: "RPC_ERROR", message: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: data.success ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "INTERNAL_ERROR", message: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
