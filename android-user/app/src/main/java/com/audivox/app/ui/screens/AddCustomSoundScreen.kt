package com.audivox.app.ui.screens

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.AudioFile
import androidx.compose.material.icons.filled.Upload
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.audivox.app.ui.theme.CyanAccent
import com.audivox.app.ui.theme.DarkBackground
import com.audivox.app.ui.theme.DarkSurface
import com.audivox.app.ui.theme.PurpleAccent

@Composable
fun AddCustomSoundScreen(
    onBack: () -> Unit,
    onSoundAdded: (String, String) -> Unit
) {
    val context = LocalContext.current
    var title by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("Gaming FX") }
    var selectedFile by remember { mutableStateOf<String?>("victory_sfx.wav") }
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp)
            .verticalScroll(scrollState)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "কাস্টম সাউন্ড যোগ (Add Custom Sound)",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text("অডিও ফাইল নির্বাচন", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                Text("MP3, WAV বা ভিডিও ফাইল আপলোড বা এক্সট্র্যাক্ট করুন", fontSize = 11.sp, color = Color.Gray)

                Spacer(modifier = Modifier.height(14.dp))

                OutlinedButton(
                    onClick = {
                        Toast.makeText(context, "অডিও ফাইল সিলেক্ট করা হয়েছে!", Toast.LENGTH_SHORT).show()
                        selectedFile = "custom_gameplay_kill.wav"
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Upload, contentDescription = "Upload", tint = CyanAccent)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(selectedFile ?: "স্টোরেজ থেকে ফাইল বাছুন", color = CyanAccent)
                }

                Spacer(modifier = Modifier.height(18.dp))

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("সাউন্ডের নাম (Title)") },
                    placeholder = { Text("যেমন: Rampage Kill SFX") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(14.dp))

                Text("ক্যাটাগরি", fontSize = 12.sp, color = Color.Gray)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("Gaming FX", "Memes", "Voice").forEach { cat ->
                        FilterChip(
                            selected = category == cat,
                            onClick = { category = cat },
                            label = { Text(cat) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = {
                        if (title.isBlank()) {
                            Toast.makeText(context, "সাউন্ডের নাম দিন", Toast.LENGTH_SHORT).show()
                            return@Button
                        }
                        onSoundAdded(title, category)
                        Toast.makeText(context, "সাউন্ডবোর্ডে যুক্ত করা হয়েছে!", Toast.LENGTH_SHORT).show()
                        onBack()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = CyanAccent)
                ) {
                    Text("সংরক্ষণ করুন (Save Sound)", color = Color.Black, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
