// ====================================================================
// AudiVox Edge Function: manage-release
// Admin-only release publication, APK verification, and policy setup
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
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "UNAUTHORIZED", message: "প্রশাসনিক অনুমোদন প্রয়োজন।" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    // Verify admin calling
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "UNAUTHORIZED", message: "অবৈধ টোকেন।" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return new Response(
        JSON.stringify({ error: "FORBIDDEN", message: "শুধুমাত্র অ্যাডমিনের জন্য অনুমোদিত।" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const {
      appTarget,
      versionName,
      versionCode,
      minSupportedVersionCode,
      isMandatoryUpdate,
      updateTitle,
      updateNotes,
      apkDownloadUrl,
      apkFileSizeBytes,
      apkSha256,
      isPublished,
    } = body;

    const { data: release, error: releaseError } = await supabaseAdmin
      .from("app_releases")
      .upsert({
        app_target: appTarget,
        version_name: versionName,
        version_code: versionCode,
        min_supported_version_code: minSupportedVersionCode || versionCode,
        is_mandatory_update: isMandatoryUpdate || false,
        update_title: updateTitle || "আপডেট উপলভ্য",
        update_notes: updateNotes || "",
        apk_download_url: apkDownloadUrl,
        apk_file_size_bytes: apkFileSizeBytes || 0,
        apk_sha256: apkSha256,
        is_published: isPublished ?? true,
        published_at: isPublished ? new Date().toISOString() : null,
      }, { onConflict: "app_target,version_code" })
      .select()
      .single();

    if (releaseError) {
      return new Response(
        JSON.stringify({ error: releaseError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert audit log
    await supabaseAdmin.from("audit_logs").insert({
      actor_id: user.id,
      action: "RELEASE_PUBLISHED",
      entity_type: "app_releases",
      entity_id: release.id,
      details: {
        app_target: appTarget,
        version_name: versionName,
        version_code: versionCode,
        is_mandatory: isMandatoryUpdate,
      },
    });

    return new Response(JSON.stringify({ success: true, release }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
