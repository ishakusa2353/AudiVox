package com.audivox.app.data.remote

import android.content.Context
import android.os.Build
import android.provider.Settings
import com.audivox.app.BuildConfig
import com.audivox.app.data.model.AppPolicyResponse
import com.audivox.app.data.model.LicenseStatusResponse
import com.audivox.app.data.model.UserProfile
import com.google.gson.Gson
import com.google.gson.JsonObject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.security.MessageDigest
import java.util.concurrent.TimeUnit

class SupabaseClient(private val context: Context) {

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    private val baseUrl = BuildConfig.SUPABASE_URL
    private val anonKey = BuildConfig.SUPABASE_ANON_KEY

    private val prefs = context.getSharedPreferences("audivox_auth_prefs", Context.MODE_PRIVATE)

    var authToken: String?
        get() = prefs.getString("auth_token", null)
        set(value) = prefs.edit().putString("auth_token", value).apply()

    var currentUserId: String?
        get() = prefs.getString("user_id", null)
        set(value) = prefs.edit().putString("user_id", value).apply()

    // 1. Generate stable device fingerprint without invasive device identifiers
    fun getDeviceFingerprint(): String {
        val androidId = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID) ?: "unknown_device"
        val raw = "${Build.MANUFACTURER}_${Build.MODEL}_${androidId}_${context.packageName}"
        val digest = MessageDigest.getInstance("SHA-256").digest(raw.toByteArray())
        return digest.joinToString("") { "%02x".format(it) }.take(32)
    }

    // 2. Register Account via secure Edge Function (generates 8-digit profile ID)
    suspend fun registerUser(
        fullName: String,
        phone: String,
        password: String,
        confirmPass: String
    ): Result<UserProfile> = withContext(Dispatchers.IO) {
        try {
            val payload = JsonObject().apply {
                addProperty("fullName", fullName)
                addProperty("phoneNumber", phone)
                addProperty("password", password)
                addProperty("confirmPassword", confirmPass)
            }

            val request = Request.Builder()
                .url("$baseUrl/functions/v1/register-user")
                .header("apikey", anonKey)
                .header("Authorization", "Bearer $anonKey")
                .post(payload.toString().toRequestBody(jsonMediaType))
                .build()

            val response = client.newCall(request).execute()
            val bodyStr = response.body?.string().orEmpty()

            if (!response.isSuccessful) {
                val errObj = gson.fromJson(bodyStr, JsonObject::class.java)
                val msg = errObj?.get("message")?.asString ?: "Registration failed (${response.code})"
                return@withContext Result.failure(IOException(msg))
            }

            val obj = gson.fromJson(bodyStr, JsonObject::class.java)
            val profile = UserProfile(
                id = obj.get("user_id").asString,
                profileId = obj.get("profile_id").asString,
                fullName = obj.get("full_name").asString,
                phoneNumber = obj.get("phone_number").asString
            )
            Result.success(profile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // 3. Login using phone + password
    suspend fun login(phone: String, pass: String): Result<String> = withContext(Dispatchers.IO) {
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
                return@withContext Result.failure(IOException("লগইন ব্যর্থ হয়েছে। ফোন নম্বর বা পাসওয়ার্ড ভুল।"))
            }

            val obj = gson.fromJson(bodyStr, JsonObject::class.java)
            val token = obj.get("access_token").asString
            val user = obj.getAsJsonObject("user")
            val uid = user?.get("id")?.asString

            authToken = token
            currentUserId = uid
            Result.success(token)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // 4. Activate License
    suspend fun activateLicense(licenseKey: String): Result<JsonObject> = withContext(Dispatchers.IO) {
        val token = authToken ?: return@withContext Result.failure(IllegalStateException("Not logged in"))
        try {
            val payload = JsonObject().apply {
                addProperty("licenseKey", licenseKey.trim().uppercase())
                addProperty("deviceFingerprint", getDeviceFingerprint())
                addProperty("deviceModel", "${Build.MANUFACTURER} ${Build.MODEL}")
                addProperty("osVersion", "Android ${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT})")
                addProperty("appVersion", BuildConfig.VERSION_NAME)
            }

            val request = Request.Builder()
                .url("$baseUrl/functions/v1/activate-license")
                .header("apikey", anonKey)
                .header("Authorization", "Bearer $token")
                .post(payload.toString().toRequestBody(jsonMediaType))
                .build()

            val response = client.newCall(request).execute()
            val bodyStr = response.body?.string().orEmpty()
            val obj = gson.fromJson(bodyStr, JsonObject::class.java)

            if (!response.isSuccessful || obj.get("success")?.asBoolean != true) {
                val msg = obj?.get("message")?.asString ?: "License activation failed"
                return@withContext Result.failure(IOException(msg))
            }

            Result.success(obj)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // 5. Get User License Status & Expiration countdown
    suspend fun getLicenseStatus(): Result<LicenseStatusResponse> = withContext(Dispatchers.IO) {
        val token = authToken ?: return@withContext Result.failure(IllegalStateException("Not logged in"))
        try {
            val request = Request.Builder()
                .url("$baseUrl/functions/v1/validate-license")
                .header("apikey", anonKey)
                .header("Authorization", "Bearer $token")
                .get()
                .build()

            val response = client.newCall(request).execute()
            val bodyStr = response.body?.string().orEmpty()

            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Failed to validate license"))
            }

            val statusResp = gson.fromJson(bodyStr, LicenseStatusResponse::class.java)
            Result.success(statusResp)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // 6. Check App Policy & Mandatory Updates
    suspend fun checkPolicy(versionCode: Int): Result<AppPolicyResponse> = withContext(Dispatchers.IO) {
        try {
            val payload = JsonObject().apply {
                addProperty("appTarget", "USER")
                addProperty("versionCode", versionCode)
            }

            val request = Request.Builder()
                .url("$baseUrl/functions/v1/check-app-policy")
                .header("apikey", anonKey)
                .post(payload.toString().toRequestBody(jsonMediaType))
                .build()

            val response = client.newCall(request).execute()
            val bodyStr = response.body?.string().orEmpty()

            val policyResp = gson.fromJson(bodyStr, AppPolicyResponse::class.java)
            Result.success(policyResp)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun logout() {
        prefs.edit().clear().apply()
    }
}
