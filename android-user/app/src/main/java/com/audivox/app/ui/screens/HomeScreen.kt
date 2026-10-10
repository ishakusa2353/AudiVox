package com.audivox.app.ui.screens

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.Widgets
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
import coil.compose.AsyncImage
import com.audivox.app.data.model.LicenseStatusResponse
import com.audivox.app.data.remote.SupabaseClient
import com.audivox.app.service.AudioPlaybackManager
import com.audivox.app.service.FloatingBubbleService
import com.audivox.app.ui.theme.CyanAccent
import com.audivox.app.ui.theme.DarkBackground
import com.audivox.app.ui.theme.DarkSurface
import com.audivox.app.ui.theme.PurpleAccent
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(
    supabaseClient: SupabaseClient,
    audioManager: AudioPlaybackManager,
    onNavigateToSounds: () -> Unit,
    onNavigateToMixer: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var licenseStatus by remember { mutableStateOf<LicenseStatusResponse?>(null) }
    var isBubbleRunning by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        val result = supabaseClient.getLicenseStatus()
        result.onSuccess { licenseStatus = it }
    }

    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp)
            .verticalScroll(scrollState)
    ) {
        // Header with Logo
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                AsyncImage(
                    model = "https://i.ibb.co/TMG8b3Pb/file-425.jpg",
                    contentDescription = "AudiVox Logo",
                    modifier = Modifier
                        .size(44.dp)
                        .clip(RoundedCornerShape(10.dp)),
                    contentScale = ContentScale.Crop
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "AudiVox",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = "Your Sound. Your Game.",
                        fontSize = 11.sp,
                        color = CyanAccent
                    )
                }
            }

            // License Status Pill
            Surface(
                color = Color(0x2210B981),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = if (licenseStatus?.isLifetime == true) "LIFETIME" else "VIP ACTIVE",
                    color = Color(0xFF10B981),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Floating Sound Bubble Launcher Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(16.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    AsyncImage(
                        model = "https://i.ibb.co/N62j1SLh/file-426.jpg",
                        contentDescription = "Bubble Logo",
                        modifier = Modifier
                            .size(48.dp)
                            .clip(RoundedCornerShape(24.dp)),
                        contentScale = ContentScale.Crop
                    )
                    Spacer(modifier = Modifier.width(14.dp))
                    Column {
                        Text(
                            text = "গেম ফ্লোটিং সাউন্ড বাবল",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White
                        )
                        Text(
                            text = "অন্যান্য অ্যাপের উপর সাউন্ডবোর্ড ব্যবহার করুন",
                            fontSize = 11.sp,
                            color = Color.Gray
                        )
                    }
                }

                Button(
                    onClick = {
                        // Check overlay permission
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(context)) {
                            val intent = Intent(
                                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                                Uri.parse("package:${context.packageName}")
                            )
                            context.startActivity(intent)
                        } else {
                            if (isBubbleRunning) {
                                context.stopService(Intent(context, FloatingBubbleService::class.java))
                                isBubbleRunning = false
                            } else {
                                val serviceIntent = Intent(context, FloatingBubbleService::class.java)
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                    context.startForegroundService(serviceIntent)
                                } else {
                                    context.startService(serviceIntent)
                                }
                                isBubbleRunning = true
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isBubbleRunning) Color(0xFFEF4444) else CyanAccent
                    ),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = if (isBubbleRunning) "বন্ধ করুন" else "চালু করুন",
                        color = Color.Black,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Quick Soundboard Shortcuts Section
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "জনপ্রিয় শর্টকাট সাউন্ডস",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.White
            )
            Text(
                text = "সবগুলো দেখুন",
                fontSize = 12.sp,
                color = PurpleAccent,
                modifier = Modifier.clickable { onNavigateToSounds() }
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        val quickSounds = listOf(
            Pair("Headshot Strike", "https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3"),
            Pair("Victory Horn", "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3"),
            Pair("RUSH NOW! Team Call", "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"),
            Pair("Sad Wah-Wah Meme", "https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3")
        )

        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            quickSounds.forEach { (title, url) ->
                Surface(
                    color = DarkSurface,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = title,
                            fontSize = 14.sp,
                            color = Color.White,
                            fontWeight = FontWeight.Medium
                        )
                        IconButton(
                            onClick = { audioManager.playSound(url) },
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.PlayArrow,
                                contentDescription = "Play",
                                tint = CyanAccent
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Audio System Notice / Mic injection transparency
        Surface(
            color = Color(0x1538BDF8),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = "অডিও প্লেব্যাক তথ্য ও স্বচ্ছতা:",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = CyanAccent
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Android সিকিউরিটি ফ্রেমওয়ার্ক কোনো অ্যাপকে সরাসরি অন্য কোনো গেমের (যেমন Free Fire) মাইক্রোফোন বাফারে অডিও প্রবেশ করতে দেয় না। AudiVox আপনার ডিভাইসের মিডিয়া স্পিকারের মাধ্যমে আসল ও স্পষ্ট সাউন্ড প্লে করে।",
                    fontSize = 11.sp,
                    color = Color(0xFFD1D5DB),
                    lineHeight = 16.sp
                )
            }
        }
    }
}
