package com.audivox.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.audivox.app.service.AudioPlaybackManager
import com.audivox.app.ui.theme.CyanAccent
import com.audivox.app.ui.theme.DarkBackground
import com.audivox.app.ui.theme.DarkSurface
import com.audivox.app.ui.theme.PurpleAccent

@Composable
fun MixerScreen(audioManager: AudioPlaybackManager) {
    var masterVolume by remember { mutableFloatStateOf(0.85f) }
    var track1Active by remember { mutableStateOf(false) }
    var track2Active by remember { mutableStateOf(false) }

    val track1Url = "https://assets.mixkit.co/active_storage/sfx/2704/2704-preview.mp3" // Aura energy loop
    val track2Url = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" // Squad call

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp)
    ) {
        Text(
            text = "মাল্টি-চ্যানেল অডিও মিক্সার",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )
        Text(
            text = "একসাথে একাধিক সাউন্ড প্লে এবং ভলিউম নিয়ন্ত্রণ করুন",
            fontSize = 12.sp,
            color = Color.Gray,
            modifier = Modifier.padding(top = 4.dp, bottom = 20.dp)
        )

        // Master Volume Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(14.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(text = "মাস্টার ভলিউম (Master Volume)", fontSize = 14.sp, color = Color.White, fontWeight = FontWeight.Medium)
                    Text(text = "${(masterVolume * 100).toInt()}%", fontSize = 14.sp, color = CyanAccent, fontWeight = FontWeight.Bold)
                }

                Slider(
                    value = masterVolume,
                    onValueChange = {
                        masterVolume = it
                        audioManager.setVolume(it)
                    },
                    colors = SliderDefaults.colors(
                        thumbColor = CyanAccent,
                        activeTrackColor = CyanAccent,
                        inactiveTrackColor = Color(0xFF374151)
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Channel 1: Background Aura Ambience
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(14.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(text = "চ্যানেল ১: Aura Energy SFX", fontSize = 14.sp, color = Color.White)
                    Text(text = "Energy loop track", fontSize = 11.sp, color = Color.Gray)
                }

                Button(
                    onClick = {
                        track1Active = !track1Active
                        if (track1Active) {
                            audioManager.playSound(track1Url)
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (track1Active) Color(0xFF10B981) else PurpleAccent
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(text = if (track1Active) "সক্রিয়" else "প্লে করুন", fontSize = 12.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Channel 2: Squad Callout
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(14.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(text = "চ্যানেল ২: Team Rush Callout", fontSize = 14.sp, color = Color.White)
                    Text(text = "Voice overlay channel", fontSize = 11.sp, color = Color.Gray)
                }

                Button(
                    onClick = {
                        track2Active = !track2Active
                        if (track2Active) {
                            audioManager.playSound(track2Url)
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (track2Active) Color(0xFF10B981) else CyanAccent
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(text = if (track2Active) "সক্রিয়" else "প্লে করুন", color = Color.Black, fontSize = 12.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Stop All Button
        Button(
            onClick = {
                track1Active = false
                track2Active = false
                audioManager.stopAll()
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
        ) {
            Text(text = "সব অডিও বন্ধ করুন (Stop All Channels)", fontWeight = FontWeight.Bold, color = Color.White)
        }
    }
}
