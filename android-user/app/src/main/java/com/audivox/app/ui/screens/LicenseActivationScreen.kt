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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.audivox.app.data.remote.SupabaseClient
import com.audivox.app.ui.theme.CyanAccent
import com.audivox.app.ui.theme.DarkBackground
import com.audivox.app.ui.theme.DarkSurface
import com.audivox.app.ui.theme.PurpleAccent
import kotlinx.coroutines.launch

@Composable
fun LicenseActivationScreen(
    supabaseClient: SupabaseClient,
    onActivationSuccess: () -> Unit,
    onLogout: () -> Unit
) {
    var licenseKeyInput by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var successMessage by remember { mutableStateOf<String?>(null) }

    val coroutineScope = rememberCoroutineScope()
    val scrollState = rememberScrollState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "লাইসেন্স অ্যাক্টিভেশন",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Text(
                text = "AudiVox ব্যবহার করতে আপনার অ্যাডমিন থেকে প্রাপ্ত লাইসেন্স কি প্রবেশ করান",
                fontSize = 13.sp,
                color = Color.Gray,
                modifier = Modifier.padding(top = 6.dp, bottom = 24.dp)
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        text = "লাইসেন্স কি (License Key)",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Medium,
                        color = CyanAccent
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    errorMessage?.let { msg ->
                        Surface(
                            color = Color(0x33EF4444),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 12.dp)
                        ) {
                            Text(
                                text = msg,
                                color = Color(0xFFEF4444),
                                fontSize = 13.sp,
                                modifier = Modifier.padding(10.dp)
                            )
                        }
                    }

                    successMessage?.let { msg ->
                        Surface(
                            color = Color(0x3310B981),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 12.dp)
                        ) {
                            Text(
                                text = msg,
                                color = Color(0xFF10B981),
                                fontSize = 13.sp,
                                modifier = Modifier.padding(10.dp)
                            )
                        }
                    }

                    OutlinedTextField(
                        value = licenseKeyInput,
                        onValueChange = { licenseKeyInput = it.uppercase() },
                        placeholder = { Text("AVX-XXXX-XXXX-XXXX") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = CyanAccent,
                            unfocusedBorderColor = Color(0xFF374151)
                        )
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = {
                            if (licenseKeyInput.isBlank()) {
                                errorMessage = "দয়া করে লাইসেন্স কি প্রবেশ করান।"
                                return@Button
                            }

                            isLoading = true
                            errorMessage = null
                            coroutineScope.launch {
                                val result = supabaseClient.activateLicense(licenseKeyInput)
                                isLoading = false
                                result.onSuccess { data ->
                                    successMessage = "লাইসেন্স সফলভাবে সক্রিয় হয়েছে!"
                                    onActivationSuccess()
                                }.onFailure { err ->
                                    errorMessage = err.message ?: "লাইসেন্স অ্যাক্টিভেশন ব্যর্থ হয়েছে।"
                                }
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        enabled = !isLoading,
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = CyanAccent)
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(color = Color.Black, modifier = Modifier.size(24.dp))
                        } else {
                            Text("সক্রিয় করুন (Activate Now)", color = Color.Black, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Surface(
                color = Color(0x1A00F5FF),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "সার্ভার যাচাইকরণ নিরাপত্তা:",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = CyanAccent
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "• লাইসেন্স মেয়াদ ডিভাইসের ঘড়ি নয়, সার্ভারের নির্ভরযোগ্য সময় দ্বারা নির্ধারিত হয়।\n• প্রতিটি লাইসেন্সের অনুমোদিত ডিভাইসের সংখ্যা নির্দিষ্ট থাকে।",
                        fontSize = 12.sp,
                        color = Color.LightGray
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            TextButton(onClick = onLogout) {
                Text(
                    text = "সাইন আউট করুন",
                    color = Color.Gray,
                    fontSize = 14.sp
                )
            }
        }
    }
}
