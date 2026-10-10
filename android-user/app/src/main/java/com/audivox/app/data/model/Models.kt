package com.audivox.app.data.model

data class UserProfile(
    val id: String,
    val profileId: String, // 8-digit server generated code
    val fullName: String,
    val phoneNumber: String,
    val isAdmin: Boolean = false,
    val isSuspended: Boolean = false
)

data class LicenseStatusResponse(
    val hasLicense: Boolean,
    val status: String, // ACTIVE, EXPIRED, REVOKED_OR_SUSPENDED, NO_LICENSE
    val isLifetime: Boolean = false,
    val licenseType: String = "",
    val licenseKeyMasked: String = "",
    val expiresAt: String? = null,
    val remainingSeconds: Long = 0,
    val remainingFormatted: RemainingDuration? = null,
    val devicesRegistered: Int = 0,
    val maxDevices: Int = 1,
    val serverTime: String = ""
)

data class RemainingDuration(
    val days: Long = 0,
    val hours: Long = 0,
    val minutes: Long = 0,
    val seconds: Long = 0
)

data class AppPolicyResponse(
    val allowed: Boolean,
    val isMaintenance: Boolean = false,
    val maintenanceMessage: String = "",
    val updateRequired: Boolean = false,
    val isMandatory: Boolean = false,
    val latestVersionName: String = "",
    val latestVersionCode: Int = 0,
    val updateTitle: String = "",
    val updateNotes: String = "",
    val apkDownloadUrl: String = "",
    val apkFileSizeBytes: Long = 0,
    val apkSha256: String = ""
)

data class SoundCategory(
    val id: String,
    val name: String,
    val slug: String,
    val iconName: String
)

data class SoundItem(
    val id: String,
    val categoryId: String?,
    val title: String,
    val audioUrl: String,
    val durationMs: Int = 0,
    val fileFormat: String = "mp3",
    val isFavorite: Boolean = false,
    val isLocal: Boolean = false,
    val localUri: String? = null
)
