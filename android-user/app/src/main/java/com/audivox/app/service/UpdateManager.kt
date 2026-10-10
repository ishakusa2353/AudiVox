package com.audivox.app.service

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.content.FileProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.security.MessageDigest

class UpdateManager(private val context: Context) {

    private val httpClient = OkHttpClient()

    // Download verified APK, compute cryptographic SHA-256, and trigger Android Package Installer
    suspend fun downloadAndInstallApk(
        downloadUrl: String,
        expectedSha256: String?,
        expectedSizeBytes: Long?,
        onProgress: (percent: Int) -> Unit
    ): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder().url(downloadUrl).build()
            val response = httpClient.newCall(request).execute()

            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Failed to download APK: HTTP ${response.code}"))
            }

            val body = response.body ?: return@withContext Result.failure(IOException("Empty APK response"))
            val totalBytes = body.contentLength().takeIf { it > 0 } ?: (expectedSizeBytes ?: -1L)

            val destinationDir = File(context.cacheDir, "updates")
            if (!destinationDir.exists()) destinationDir.mkdirs()
            val apkFile = File(destinationDir, "audivox_update.apk")
            if (apkFile.exists()) apkFile.delete()

            val digest = MessageDigest.getInstance("SHA-256")
            val inputStream = body.byteStream()
            val outputStream = FileOutputStream(apkFile)

            val buffer = ByteArray(8192)
            var bytesRead: Int
            var totalRead = 0L

            while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                outputStream.write(buffer, 0, bytesRead)
                digest.update(buffer, 0, bytesRead)
                totalRead += bytesRead
                if (totalBytes > 0) {
                    val percent = ((totalRead * 100) / totalBytes).toInt().coerceIn(0, 100)
                    withContext(Dispatchers.Main) { onProgress(percent) }
                }
            }

            outputStream.flush()
            outputStream.close()
            inputStream.close()

            // Verify SHA-256 if provided
            val computedHash = digest.digest().joinToString("") { "%02x".format(it) }
            if (!expectedSha256.isNullOrBlank() && !computedHash.equals(expectedSha256, ignoreCase = true)) {
                apkFile.delete()
                return@withContext Result.failure(SecurityException("APK Checksum Verification Failed. Corrupt or untrusted download."))
            }

            // Handoff to Android Package Installer via FileProvider
            withContext(Dispatchers.Main) {
                launchPackageInstaller(apkFile)
            }

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun launchPackageInstaller(apkFile: File) {
        val apkUri: Uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.provider",
            apkFile
        )

        val installIntent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(apkUri, "application/vnd.android.package-archive")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION
        }

        context.startActivity(installIntent)
    }

    // "পরে করবো" action: Return safely to Android Launcher
    fun exitToHomeLauncher(activity: Activity) {
        val homeIntent = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_HOME)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        activity.startActivity(homeIntent)
        activity.finishAffinity()
    }
}
