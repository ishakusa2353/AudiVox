package com.audivox.admin.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.audivox.admin.data.remote.AdminRepository
import kotlinx.coroutines.launch
import java.util.UUID

val CyanAccent = Color(0xFF00F5FF)
val PurpleAccent = Color(0xFF8B5CF6)
val DarkBackground = Color(0xFF0B0F19)
val DarkSurface = Color(0xFF111827)

@Composable
fun AdminLoginScreen(
    adminRepo: AdminRepository,
    onLoginSuccess: () -> Unit
) {
    var phone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()

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

            Text("AudiVox Admin Console", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Text("Authorized Administrators Only", fontSize = 12.sp, color = CyanAccent)

            Spacer(modifier = Modifier.height(28.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    errorMessage?.let { err ->
                        Text(text = err, color = Color(0xFFEF4444), fontSize = 12.sp, modifier = Modifier.padding(bottom = 12.dp))
                    }

                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("অ্যাডমিন ফোন নম্বর") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("অ্যাডমিন পাসওয়ার্ড") },
                        visualTransformation = PasswordVisualTransformation(),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = {
                            if (phone.isBlank() || password.isBlank()) {
                                errorMessage = "ফোন ও পাসওয়ার্ড প্রদান করুন।"
                                return@Button
                            }
                            isLoading = true
                            errorMessage = null
                            coroutineScope.launch {
                                val result = adminRepo.loginAdmin(phone, password)
                                isLoading = false
                                result.onSuccess {
                                    onLoginSuccess()
                                }.onFailure { error ->
                                    errorMessage = error.message ?: "লগইন ব্যর্থ হয়েছে।"
                                }
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        enabled = !isLoading,
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = CyanAccent)
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(color = Color.Black, modifier = Modifier.size(22.dp))
                        } else {
                            Text("অ্যাডমিন প্যানেলে প্রবেশ", color = Color.Black, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AdminDashboardScreen(
    adminRepo: AdminRepository,
    onNavigateToLicenses: () -> Unit,
    onNavigateToMaintenance: () -> Unit,
    onLogout: () -> Unit
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp)
            .verticalScroll(scrollState)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("AudiVox Admin Dashboard", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text("Enterprise System Overview", fontSize = 11.sp, color = CyanAccent)
            }
            IconButton(onClick = onLogout) {
                Icon(Icons.Default.Logout, contentDescription = "Logout", tint = Color.Gray)
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Quick Stats Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            StatCard("সক্রিয় লাইসেন্স", "148", CyanAccent, Modifier.weight(1f))
            StatCard("মোট ইউজার", "320", PurpleAccent, Modifier.weight(1f))
        }

        Spacer(modifier = Modifier.height(10.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            StatCard("অনলাইন ডিভাইস", "142", Color(0xFF10B981), Modifier.weight(1f))
            StatCard("বিল্ড রিলিজ", "v1.0.0", Color(0xFFF59E0B), Modifier.weight(1f))
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text("দ্রুত ব্যবস্থাপনা মেনু", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = Color.White)

        Spacer(modifier = Modifier.height(12.dp))

        AdminActionCard(
            title = "লাইসেন্স জেনারেটর ও মেয়াদ নির্ধারণ",
            subtitle = "দিন, ঘণ্টা, মিনিট ও সেকেন্ড ভিত্তিক কাস্টম লাইসেন্স কি তৈরি করুন",
            icon = Icons.Default.VpnKey,
            onClick = onNavigateToLicenses
        )

        Spacer(modifier = Modifier.height(10.dp))

        AdminActionCard(
            title = "রক্ষণাবেক্ষণ মোড (Maintenance Control)",
            subtitle = "সার্ভার মেইন্টেন্যান্স ও বার্তা সম্প্রচার নিয়ন্ত্রণ",
            icon = Icons.Default.Build,
            onClick = onNavigateToMaintenance
        )
    }
}

@Composable
fun StatCard(label: String, value: String, accentColor: Color, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(label, fontSize = 11.sp, color = Color.Gray)
            Spacer(modifier = Modifier.height(6.dp))
            Text(value, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = accentColor)
        }
    }
}

@Composable
fun AdminActionCard(title: String, subtitle: String, icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        shape = RoundedCornerShape(14.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, contentDescription = null, tint = CyanAccent, modifier = Modifier.size(28.dp))
            Spacer(modifier = Modifier.width(14.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(title, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                Text(subtitle, fontSize = 11.sp, color = Color.Gray)
            }
            Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Color.Gray)
        }
    }
}
