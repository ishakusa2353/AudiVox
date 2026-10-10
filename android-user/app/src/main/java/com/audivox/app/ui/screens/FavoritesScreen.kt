package com.audivox.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Star
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

@Composable
fun FavoritesScreen(audioManager: AudioPlaybackManager) {
    val favoriteSounds = remember {
        listOf(
            Pair("Headshot Strike", "https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3"),
            Pair("Victory Horn", "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3"),
            Pair("RUSH NOW! Team Call", "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3")
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Star, contentDescription = null, tint = CyanAccent)
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "প্রিয় সাউন্ডসমূহ (Favorites)",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(favoriteSounds.size) { index ->
                val (title, url) = favoriteSounds[index]
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
                            onClick = { audioManager.playSound(url) }
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = "Play", tint = CyanAccent)
                        }
                    }
                }
            }
        }
    }
}
