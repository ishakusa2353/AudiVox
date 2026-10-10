package com.audivox.app.ui.screens

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.PictureInPicture
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import coil.compose.AsyncImage
import com.audivox.app.ui.theme.CyanAccent
import com.audivox.app.ui.theme.DarkBackground
import com.audivox.app.ui.theme.DarkSurface
import com.audivox.app.ui.theme.PurpleAccent

@Composable
fun MandatoryPermissionScreen(
    onAllPermissionsGranted: () -> Unit
) {
    val context = LocalContext.current

    // Helper functions to check permissions
    fun isOverlayGranted(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(context)
        } else {
            true
        }
    }

    fun isMicGranted(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
    }

    fun isNotificationGranted(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }
    }

    var overlayGranted by remember { mutableStateOf(isOverlayGranted()) }
    var micGranted by remember { mutableStateOf(isMicGranted()) }
    var notificationGranted by remember { mutableStateOf(isNotificationGranted()) }

    // Launcher for runtime permissions (Microphone, Notifications, Audio)
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { result ->
        micGranted = result[Manifest.permission.RECORD_AUDIO] ?: isMicGranted()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            notificationGranted = result[Manifest.permission.POST_NOTIFICATIONS] ?: isNotificationGranted()
        }
    }

    // Refresh states on lifecycle or user interaction
    LaunchedEffect(Unit) {
        overlayGranted = isOverlayGranted()
        micGranted = isMicGranted()
        notificationGranted = isNotificationGranted()
        if (overlayGranted && micGranted && notificationGranted) {
            onAllPermissionsGranted()
        } else {
            // Immediately request microphone and notifications on start
            val permsToRequest = mutableListOf(Manifest.permission.RECORD_AUDIO)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                permsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                permsToRequest.add(Manifest.permission.READ_MEDIA_AUDIO)
            }
            permissionLauncher.launch(permsToRequest.toTypedArray())
        }
    }

    val allGranted = overlayGranted && micGranted && notificationGranted

    LaunchedEffect(allGranted) {
        if (allGranted) {
            onAllPermissionsGranted()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            AsyncImage(
                model = "https://i.ibb.co/TMG8b3Pb/file-425.jpg",
                contentDescription = "AudiVox Logo",
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(16.dp)),
                contentScale = ContentScale.Crop
            )

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "বাধ্যতামূলক পারমিশন প্রয়োজন",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Text(
                text = "AudiVox ব্যবহার করতে নিচের ৩টি পারমিশন অনুমোদন করতে হবে। অনুমতি না দিলে অ্যাপ কাজ করবে না!",
                fontSize = 12.sp,
                color = Color.LightGray,
                modifier = Modifier.padding(top = 4.dp, bottom = 24.dp),
                lineHeight = 17.sp
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    // 1. Display Over Other Apps (Overlay Permission)
                    PermissionStatusRow(
                        title = "Display Over Other Apps (ফ্লোটিং বাবল)",
                        subtitle = "গেমিং স্ক্রিনের উপরে বাবল সাউন্ড প্যানেল চালু রাখতে বাধ্যতামূলক",
                        icon = Icons.Default.PictureInPicture,
                        isGranted = overlayGranted,
                        onGrant = {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                val intent = Intent(
                                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                                    Uri.parse("package:${context.packageName}")
                                )
                                context.startActivity(intent)
                            }
                        }
                    )

                    Divider(color = Color(0xFF1F2937))

                    // 2. Microphone Permission
                    PermissionStatusRow(
                        title = "Microphone (মাইক্রোফোন পারমিশন)",
                        subtitle = "ইন-গেম ভয়েস ও অডিও মিক্সার প্রসেসিংয়ের জন্য বাধ্যতামূলক",
                        icon = Icons.Default.Mic,
                        isGranted = micGranted,
                        onGrant = {
                            permissionLauncher.launch(arrayOf(Manifest.permission.RECORD_AUDIO))
                        }
                    )

                    Divider(color = Color(0xFF1F2937))

                    // 3. Notification Permission
                    PermissionStatusRow(
                        title = "Notifications (নোটিফিকেশন পারমিশন)",
                        subtitle = "অ্যান্ড্রয়েড ফোরগ্রাউন্ড সার্ভিস নিরবচ্ছিন্নভাবে চালু রাখতে প্রয়োজনীয়",
                        icon = Icons.Default.Notifications,
                        isGranted = notificationGranted,
                        onGrant = {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                permissionLauncher.launch(arrayOf(Manifest.permission.POST_NOTIFICATIONS))
                            }
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = {
                    // Check and request whichever is missing
                    if (!overlayGranted && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        val intent = Intent(
                            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                            Uri.parse("package:${context.packageName}")
                        )
                        context.startActivity(intent)
                    }

                    val permsToRequest = mutableListOf<String>()
                    if (!micGranted) permsToRequest.add(Manifest.permission.RECORD_AUDIO)
                    if (!notificationGranted && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        permsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
                    }
                    if (permsToRequest.isNotEmpty()) {
                        permissionLauncher.launch(permsToRequest.toTypedArray())
                    }

                    // Re-check
                    overlayGranted = isOverlayGranted()
                    micGranted = isMicGranted()
                    notificationGranted = isNotificationGranted()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = CyanAccent)
            ) {
                Text(
                    text = if (allGranted) "অ্যাপে প্রবেশ করুন (Proceed)" else "সকল পারমিশন অনুমোদন দিন",
                    color = Color.Black,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
            }
        }
    }
}

@Composable
fun PermissionStatusRow(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    isGranted: Boolean,
    onGrant: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = if (isGranted) Color(0xFF10B981) else CyanAccent,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(text = title, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                Text(text = subtitle, fontSize = 10.sp, color = Color.Gray)
            }
        }

        if (isGranted) {
            Surface(
                color = Color(0x2210B981),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = "অনুমোদিত",
                    color = Color(0xFF10B981),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        } else {
            Button(
                onClick = onGrant,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1F2937)),
                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(text = "অনুমতি দিন", fontSize = 11.sp, color = CyanAccent)
            }
        }
    }
}
