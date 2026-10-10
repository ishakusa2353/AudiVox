package com.audivox.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.audivox.app.BuildConfig
import com.audivox.app.data.model.LicenseStatusResponse
import com.audivox.app.data.remote.SupabaseClient
import com.audivox.app.ui.theme.CyanAccent
import com.audivox.app.ui.theme.DarkBackground
import com.audivox.app.ui.theme.DarkSurface
import com.audivox.app.ui.theme.PurpleAccent
import kotlinx.coroutines.delay

@Composable
fun SettingsScreen(
    supabaseClient: SupabaseClient,
    onLogout: () -> Unit
) {
    var licenseStatus by remember { mutableStateOf<LicenseStatusResponse?>(null) }
    var remainingSeconds by remember { mutableLongStateOf(0L) }

    LaunchedEffect(Unit) {
        val result = supabaseClient.getLicenseStatus()
        result.onSuccess {
            licenseStatus = it
            remainingSeconds = it.remainingSeconds
        }
    }

    // Live countdown timer for custom duration
    LaunchedEffect(remainingSeconds) {
        if (remainingSeconds > 0 && licenseStatus?.isLifetime != true) {
            delay(1000)
            remainingSeconds -= 1
        }
    }

    val days = remainingSeconds / 86400
    val hours = (remainingSeconds % 86400) / 3600
    val minutes = (remainingSeconds % 3600) / 60
    val seconds = remainingSeconds % 60

    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp)
            .verticalScroll(scrollState)
    ) {
        Text(
            text = "প্রোফাইল ও সেটিংস",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Profile & License Information Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text(
                    text = "অ্যাকাউন্ট ও লাইসেন্স তথ্য",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = CyanAccent
                )

                Spacer(modifier = Modifier.height(12.dp))

                ProfileRow("ইউজার আইডি (Profile ID)", "8-Digit Server ID")
                ProfileRow("লাইসেন্স কি (Masked)", licenseStatus?.licenseKeyMasked ?: "AVX-****-****-****")
                ProfileRow("লাইসেন্স টাইপ", licenseStatus?.licenseType ?: "VIP/Custom")
                ProfileRow("স্ট্যাটাস", licenseStatus?.status ?: "ACTIVE")

                if (licenseStatus?.isLifetime == true) {
                    ProfileRow("মেয়াদ", "আজীবন (Lifetime Access)")
                } else {
                    ProfileRow(
                        label = "অবশিষ্ট সময়",
                        value = "${days} দিন ${hours} ঘণ্টা ${minutes} মিনিট ${seconds} সেকেন্ড"
                    )
                }

                ProfileRow(
                    label = "নিবন্ধিত ডিভাইস",
                    value = "${licenseStatus?.devicesRegistered ?: 1} / ${licenseStatus?.maxDevices ?: 1} ডিভাইস"
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Privacy & Hardware Sandboxing Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text(
                    text = "প্রাইভেসি ও লোকাল স্টোরেজ",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = PurpleAccent
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "• আপনার ডিভাইস থেকে ইম্পোর্ট করা সমস্ত অডিও ফাইল শুধুমাত্র আপনার ফোনের লোকাল Room ডাটাবেসে সুরক্ষিত থাকে। কোনো প্রাইভেট ফাইল অনুমতি ছাড়া সার্ভারে আপলোড করা হয় না।\n• ডিভাইস স্পিকার অডিও প্লেব্যাকের জন্য অ্যান্ড্রয়েডের আদর্শ মিডিয়া পাইপলাইন ব্যবহৃত হয়।",
                    fontSize = 12.sp,
                    color = Color.LightGray,
                    lineHeight = 17.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // App Information
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                ProfileRow("অ্যাপ সংস্করণ", "AudiVox v${BuildConfig.VERSION_NAME} (Build ${BuildConfig.VERSION_CODE})")
                ProfileRow("ডেভেলপার ও আর্কিটেকচার", "Enterprise Native Kotlin Suite")
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                supabaseClient.logout()
                onLogout()
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color(0x33EF4444)),
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
        ) {
            Text(text = "অ্যাকাউন্ট থেকে লগআউট করুন", color = Color(0xFFEF4444), fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
fun ProfileRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 5.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, fontSize = 12.sp, color = Color.Gray)
        Text(text = value, fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Medium)
    }
}
