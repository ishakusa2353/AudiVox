package com.audivox.admin

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.audivox.admin.data.remote.AdminRepository
import com.audivox.admin.ui.screens.*
import kotlinx.coroutines.launch
import java.util.UUID

class AdminMainActivity : ComponentActivity() {

    private lateinit var adminRepo: AdminRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        adminRepo = AdminRepository(this)

        setContent {
            AdminAppRoot(adminRepo = adminRepo)
        }
    }
}

enum class AdminRoute {
    LOGIN, DASHBOARD, LICENSES, MAINTENANCE
}

@Composable
fun AdminAppRoot(adminRepo: AdminRepository) {
    var currentRoute by remember {
        mutableStateOf(if (adminRepo.adminToken != null) AdminRoute.DASHBOARD else AdminRoute.LOGIN)
    }

    when (currentRoute) {
        AdminRoute.LOGIN -> {
            AdminLoginScreen(
                adminRepo = adminRepo,
                onLoginSuccess = { currentRoute = AdminRoute.DASHBOARD }
            )
        }
        AdminRoute.DASHBOARD -> {
            AdminDashboardScreen(
                adminRepo = adminRepo,
                onNavigateToLicenses = { currentRoute = AdminRoute.LICENSES },
                onNavigateToMaintenance = { currentRoute = AdminRoute.MAINTENANCE },
                onLogout = {
                    adminRepo.logout()
                    currentRoute = AdminRoute.LOGIN
                }
            )
        }
        AdminRoute.LICENSES -> {
            AdminLicenseGeneratorScreen(
                adminRepo = adminRepo,
                onBack = { currentRoute = AdminRoute.DASHBOARD }
            )
        }
        AdminRoute.MAINTENANCE -> {
            AdminMaintenanceControlScreen(
                adminRepo = adminRepo,
                onBack = { currentRoute = AdminRoute.DASHBOARD }
            )
        }
    }
}

@Composable
fun AdminLicenseGeneratorScreen(adminRepo: AdminRepository, onBack: () -> Unit) {
    var licenseType by remember { mutableStateOf("CUSTOM") }
    var isLifetime by remember { mutableStateOf(false) }
    var daysText by remember { mutableStateOf("2") }
    var hoursText by remember { mutableStateOf("4") }
    var minutesText by remember { mutableStateOf("30") }
    var secondsText by remember { mutableStateOf("20") }
    var maxDevices by remember { mutableIntStateOf(1) }
    var generatedKey by remember { mutableStateOf("") }
    var statusMessage by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }

    val coroutineScope = rememberCoroutineScope()
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp)
            .verticalScroll(scrollState)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Text("লাইসেন্স জেনারেটর (License System)", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(14.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text("লাইসেন্স মোড ও মেয়াদ", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = CyanAccent)

                Spacer(modifier = Modifier.height(12.dp))

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(
                        checked = isLifetime,
                        onCheckedChange = { isLifetime = it },
                        colors = CheckboxDefaults.colors(checkedColor = CyanAccent)
                    )
                    Text("আজীবন লাইসেন্স (Lifetime Master License)", color = Color.White, fontSize = 13.sp)
                }

                if (!isLifetime) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Text("কাস্টম মেয়াদ (দিন, ঘণ্টা, মিনিট ও সেকেন্ড):", fontSize = 12.sp, color = Color.Gray)
                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = daysText,
                            onValueChange = { daysText = it },
                            label = { Text("দিন (D)") },
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = hoursText,
                            onValueChange = { hoursText = it },
                            label = { Text("ঘণ্টা (H)") },
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = minutesText,
                            onValueChange = { minutesText = it },
                            label = { Text("মিনিট (M)") },
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = secondsText,
                            onValueChange = { secondsText = it },
                            label = { Text("সেকেন্ড (S)") },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text("সর্বোচ্চ অনুমোদিত ডিভাইস সীমা: $maxDevices টি", fontSize = 12.sp, color = Color.White)
                Slider(
                    value = maxDevices.toFloat(),
                    onValueChange = { maxDevices = it.toInt() },
                    valueRange = 1f..10f,
                    steps = 8,
                    colors = SliderDefaults.colors(thumbColor = CyanAccent, activeTrackColor = CyanAccent)
                )

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        val d = daysText.toLongOrNull() ?: 0L
                        val h = hoursText.toLongOrNull() ?: 0L
                        val m = minutesText.toLongOrNull() ?: 0L
                        val s = secondsText.toLongOrNull() ?: 0L
                        val totalSeconds = (d * 86400) + (h * 3600) + (m * 60) + s

                        val prefix = if (isLifetime) "LIFE" else "PRO"
                        val randomSuffix = UUID.randomUUID().toString().take(8).uppercase()
                        val newKey = "AVX-$prefix-${randomSuffix.take(4)}-${randomSuffix.takeLast(4)}"

                        isLoading = true
                        statusMessage = null
                        coroutineScope.launch {
                            val result = adminRepo.createLicense(
                                key = newKey,
                                type = if (isLifetime) "LIFETIME" else "CUSTOM",
                                durationSeconds = totalSeconds,
                                isLifetime = isLifetime,
                                maxDevices = maxDevices,
                                notes = "Generated from Admin Android APK"
                            )
                            isLoading = false
                            result.onSuccess {
                                generatedKey = newKey
                                statusMessage = "লাইসেন্স তৈরি হয়েছে: $newKey"
                            }.onFailure { err ->
                                statusMessage = err.message ?: "Failed to generate key"
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = CyanAccent),
                    enabled = !isLoading
                ) {
                    Text("নতুন লাইসেন্স কি তৈরি করুন", color = Color.Black, fontWeight = FontWeight.Bold)
                }

                statusMessage?.let { msg ->
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(text = msg, color = if (generatedKey.isNotEmpty()) Color(0xFF10B981) else Color(0xFFEF4444), fontSize = 13.sp)
                }
            }
        }
    }
}

@Composable
fun AdminMaintenanceControlScreen(adminRepo: AdminRepository, onBack: () -> Unit) {
    var isEnabled by remember { mutableStateOf(false) }
    var broadcastMsg by remember { mutableStateOf("AudiVox সার্ভার রক্ষণাবেক্ষণ চলছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।") }
    var statusText by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Text("রক্ষণাবেক্ষণ নিয়ন্ত্রণ", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(14.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("সার্ভার মেইন্টেন্যান্স মোড", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                        Text("চালু করলে সাধারণ ইউজাররা নোটিশ দেখতে পাবে", fontSize = 11.sp, color = Color.Gray)
                    }
                    Switch(checked = isEnabled, onCheckedChange = { isEnabled = it })
                }

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = broadcastMsg,
                    onValueChange = { broadcastMsg = it },
                    label = { Text("ব্যবহারকারীদের জন্য নোটিশ বার্তা") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3
                )

                Spacer(modifier = Modifier.height(20.dp))

                Button(
                    onClick = {
                        coroutineScope.launch {
                            val res = adminRepo.setMaintenanceMode(isEnabled, broadcastMsg)
                            statusText = if (res.isSuccess) "রক্ষণাবেক্ষণ মোড সফলভাবে হালনাগাদ করা হয়েছে।" else "ব্যর্থ হয়েছে।"
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = CyanAccent)
                ) {
                    Text("সেটিংস সংরক্ষণ করুন", color = Color.Black, fontWeight = FontWeight.Bold)
                }

                statusText?.let {
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(text = it, color = CyanAccent, fontSize = 12.sp)
                }
            }
        }
    }
}
