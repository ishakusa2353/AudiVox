package com.audivox.admin.data.remote

import android.content.Context
import com.audivox.admin.BuildConfig
import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.UUID
import java.util.concurrent.TimeUnit

class AdminRepository(context: Context) {

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    private val baseUrl = BuildConfig.SUPABASE_URL
    private val anonKey = BuildConfig.SUPABASE_ANON_KEY

    private val prefs = context.getSharedPreferences("audivox_admin_prefs", Context.MODE_PRIVATE)

    var adminToken: String?
        get() = prefs.getString("admin_token", null)
        set(value) = prefs.edit().putString("admin_token", value).apply()

    // Login and verify admin role via server RLS
    suspend fun loginAdmin(phone: String, pass: String): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val cleaned = phone.replace("+", "")
            val email = "$cleaned@audivox.local"

            val payload = JsonObject().apply {
                addProperty("email", email)
                addProperty("password", pass)
            }

            val request = Request.Builder()
                .url("$baseUrl/auth/v1/token?grant_type=password")
                .header("apikey", anonKey)
                .post(payload.toString().toRequestBody(jsonMediaType))
                .build()

            val response = client.newCall(request).execute()
            val bodyStr = response.body?.string().orEmpty()

            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Admin login failed. Check phone and password."))
            }

            val obj = gson.fromJson(bodyStr, JsonObject::class.java)
            val token = obj.get("access_token").asString

            // Verify admin privileges on server
            val profileReq = Request.Builder()
                .url("$baseUrl/rest/v1/profiles?select=is_admin,is_suspended")
                .header("apikey", anonKey)
                .header("Authorization", "Bearer $token")
                .get()
                .build()

            val profResp = client.newCall(profileReq).execute()
            val profBody = profResp.body?.string().orEmpty()
            val profArr = gson.fromJson(profBody, JsonArray::class.java)

            if (profArr.size() == 0 || !profArr[0].asJsonObject.get("is_admin").asBoolean) {
                return@withContext Result.failure(SecurityException("Access Denied: Account lacks administrative privileges."))
            }

            adminToken = token
            Result.success(true)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Generate License Key with custom duration (days, hours, minutes, seconds)
    suspend fun createLicense(
        key: String,
        type: String,
        durationSeconds: Long,
        isLifetime: Boolean,
        maxDevices: Int,
        notes: String
    ): Result<JsonObject> = withContext(Dispatchers.IO) {
        val token = adminToken ?: return@withContext Result.failure(IllegalStateException("Not authenticated"))
        try {
            val payload = JsonObject().apply {
                addProperty("license_key", key.uppercase())
                addProperty("license_type", type)
                addProperty("duration_seconds", if (isLifetime) 0 else durationSeconds)
                addProperty("is_lifetime", isLifetime)
                addProperty("max_devices", maxDevices)
                addProperty("notes", notes)
            }

            val request = Request.Builder()
                .url("$baseUrl/rest/v1/licenses")
                .header("apikey", anonKey)
                .header("Authorization", "Bearer $token")
                .header("Prefer", "return=representation")
                .post(payload.toString().toRequestBody(jsonMediaType))
                .build()

            val response = client.newCall(request).execute()
            val body = response.body?.string().orEmpty()

            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Failed to create license: $body"))
            }

            // Record audit log
            recordAudit("LICENSE_CREATED", "licenses", key, payload)

            Result.success(payload)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Toggle maintenance mode
    suspend fun setMaintenanceMode(enabled: Boolean, message: String): Result<Boolean> = withContext(Dispatchers.IO) {
        val token = adminToken ?: return@withContext Result.failure(IllegalStateException("Not authenticated"))
        try {
            val configValue = JsonObject().apply {
                addProperty("is_enabled", enabled)
                addProperty("message", message)
            }

            val payload = JsonObject().apply {
                addProperty("key", "maintenance_mode")
                add("value", configValue)
                addProperty("updated_at", "now()")
            }

            val request = Request.Builder()
                .url("$baseUrl/rest/v1/system_config?on_conflict=key")
                .header("apikey", anonKey)
                .header("Authorization", "Bearer $token")
                .header("Prefer", "resolution=merge-duplicates")
                .post(payload.toString().toRequestBody(jsonMediaType))
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Failed to set maintenance mode"))
            }

            recordAudit("MAINTENANCE_TOGGLED", "system_config", "maintenance_mode", configValue)
            Result.success(true)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun recordAudit(action: String, entityType: String, entityId: String, details: JsonObject) {
        val token = adminToken ?: return
        try {
            val payload = JsonObject().apply {
                addProperty("action", action)
                addProperty("entity_type", entityType)
                addProperty("entity_id", entityId)
                add("details", details)
            }

            val request = Request.Builder()
                .url("$baseUrl/rest/v1/audit_logs")
                .header("apikey", anonKey)
                .header("Authorization", "Bearer $token")
                .post(payload.toString().toRequestBody(jsonMediaType))
                .build()

            client.newCall(request).execute()
        } catch (e: Exception) {
            // ignore non-blocking audit failure
        }
    }

    fun logout() {
        prefs.edit().clear().apply()
    }
}
