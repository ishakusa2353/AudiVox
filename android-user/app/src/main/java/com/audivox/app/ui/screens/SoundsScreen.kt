package com.audivox.app.ui.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.audivox.app.AudiVoxApplication
import com.audivox.app.data.local.LocalSoundEntity
import com.audivox.app.data.model.SoundItem
import com.audivox.app.service.AudioPlaybackManager
import com.audivox.app.ui.theme.CyanAccent
import com.audivox.app.ui.theme.DarkBackground
import com.audivox.app.ui.theme.DarkSurface
import com.audivox.app.ui.theme.PurpleAccent
import kotlinx.coroutines.launch
import java.util.UUID

@Composable
fun SoundsScreen(
    audioManager: AudioPlaybackManager
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val dao = AudiVoxApplication.instance.database.localSoundDao()

    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("All") }
    var currentlyPlayingUrl by remember { mutableStateOf<String?>(null) }

    val categories = listOf("All", "Gaming FX", "Voice Lines", "Memes", "Anime", "Local Imports")

    // Default built-in sounds
    val cloudSounds = remember {
        mutableStateListOf(
            SoundItem("1", "Gaming FX", "Headshot Strike", "https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3", 1200, "mp3"),
            SoundItem("2", "Gaming FX", "Victory Horn", "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3", 3400, "mp3"),
            SoundItem("3", "Voice Lines", "RUSH NOW! Squad", "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3", 2100, "mp3"),
            SoundItem("4", "Memes", "Sad Wah-Wah", "https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3", 2800, "mp3"),
            SoundItem("5", "Anime", "Power Surge Aura", "https://assets.mixkit.co/active_storage/sfx/2704/2704-preview.mp3", 4200, "mp3")
        )
    }

    // Local sounds from Room
    val localSounds by dao.getAllLocalSounds().collectAsState(initial = emptyList())

    // File picker for device MP3/WAV/OGG files
    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            coroutineScope.launch {
                val soundEntity = LocalSoundEntity(
                    id = UUID.randomUUID().toString(),
                    title = uri.lastPathSegment?.substringAfterLast("/") ?: "Custom Sound",
                    localUri = uri.toString(),
                    durationMs = 0,
                    fileSizeBytes = 0,
                    fileFormat = "audio"
                )
                dao.insertSound(soundEntity)
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp)
    ) {
        // Top Bar & Local Audio Import Button
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "সাউন্ড লাইব্রেরি",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Button(
                onClick = { filePickerLauncher.launch("audio/*") },
                colors = ButtonDefaults.buttonColors(containerColor = PurpleAccent),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = "Add", tint = Color.White, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("অডিও যোগ করুন", fontSize = 12.sp, color = Color.White)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("সাউন্ড খুঁজুন...", color = Color.Gray) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Color.Gray) },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = CyanAccent,
                unfocusedBorderColor = Color(0xFF374151)
            ),
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Category Filter Chips
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(categories) { cat ->
                val isSelected = selectedCategory == cat
                Surface(
                    color = if (isSelected) CyanAccent else DarkSurface,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.clickable { selectedCategory = cat }
                ) {
                    Text(
                        text = cat,
                        color = if (isSelected) Color.Black else Color.White,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Combined Sounds List (Cloud + Local Room)
        val allSounds = remember(cloudSounds, localSounds, selectedCategory, searchQuery) {
            val list = mutableListOf<SoundItem>()
            if (selectedCategory != "Local Imports") {
                list.addAll(cloudSounds.filter {
                    (selectedCategory == "All" || it.categoryId == selectedCategory) &&
                            (searchQuery.isBlank() || it.title.contains(searchQuery, ignoreCase = true))
                })
            }
            if (selectedCategory == "All" || selectedCategory == "Local Imports") {
                list.addAll(localSounds.map {
                    SoundItem(
                        id = it.id,
                        categoryId = "Local Imports",
                        title = it.title,
                        audioUrl = it.localUri,
                        isLocal = true,
                        isFavorite = it.isFavorite
                    )
                }.filter {
                    searchQuery.isBlank() || it.title.contains(searchQuery, ignoreCase = true)
                })
            }
            list
        }

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(allSounds, key = { it.id }) { sound ->
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
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = sound.title,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color.White
                            )
                            Text(
                                text = if (sound.isLocal) "ডিভাইস স্টোরেজ (Room)" else sound.categoryId ?: "Cloud",
                                fontSize = 11.sp,
                                color = if (sound.isLocal) CyanAccent else Color.Gray
                            )
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(
                                onClick = {
                                    if (currentlyPlayingUrl == sound.audioUrl) {
                                        audioManager.stopAll()
                                        currentlyPlayingUrl = null
                                    } else {
                                        audioManager.stopAll()
                                        currentlyPlayingUrl = sound.audioUrl
                                        audioManager.playSound(sound.audioUrl) {
                                            currentlyPlayingUrl = null
                                        }
                                    }
                                }
                            ) {
                                Icon(
                                    imageVector = if (currentlyPlayingUrl == sound.audioUrl) Icons.Default.Stop else Icons.Default.PlayArrow,
                                    contentDescription = "Play/Stop",
                                    tint = if (currentlyPlayingUrl == sound.audioUrl) Color(0xFFEF4444) else CyanAccent
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
