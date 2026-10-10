package com.audivox.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.audivox.app.BuildConfig
import com.audivox.app.data.remote.SupabaseClient
import com.audivox.app.ui.theme.CyanAccent
import com.audivox.app.ui.theme.DarkBackground
import com.audivox.app.ui.theme.DarkSurface
import com.audivox.app.ui.theme.PurpleAccent
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    supabaseClient: SupabaseClient,
    onNavigateToRegister: () -> Unit,
    onNavigateToLicense: () -> Unit,
    onLoginSuccess: () -> Unit,
    onMandatoryUpdateRequired: () -> Unit
) {
    var phoneNumber by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

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
            AsyncImage(
                model = "https://i.ibb.co/TMG8b3Pb/file-425.jpg",
                contentDescription = "AudiVox Logo",
                modifier = Modifier
                    .size(90.dp)
                    .clip(RoundedCornerShape(16.dp)),
                contentScale = ContentScale.Crop
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "AudiVox",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Text(
                text = "Your Sound. Your Game.",
                fontSize = 14.sp,
                color = CyanAccent,
                fontWeight = FontWeight.Medium
            )

            Spacer(modifier = Modifier.height(32.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        text = "লগইন করুন",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White
                    )

                    Spacer(modifier = Modifier.height(14.dp))

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

                    OutlinedTextField(
                        value = phoneNumber,
                        onValueChange = { phoneNumber = it },
                        label = { Text("ফোন নম্বর (Phone Number)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = CyanAccent,
                            unfocusedBorderColor = Color(0xFF374151)
                        )
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("পাসওয়ার্ড (Password)") },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = CyanAccent,
                            unfocusedBorderColor = Color(0xFF374151)
                        )
                    )

                    Spacer(modifier = Modifier.height(22.dp))

                    Button(
                        onClick = {
                            if (phoneNumber.isBlank() || password.isBlank()) {
                                errorMessage = "ফোন নম্বর এবং পাসওয়ার্ড প্রদান করুন।"
                                return@Button
                            }

                            isLoading = true
                            errorMessage = null
                            coroutineScope.launch {
                                // 1. Check App Policy & Mandatory Updates first
                                val policyResult = supabaseClient.checkPolicy(BuildConfig.VERSION_CODE)
                                policyResult.getOrNull()?.let { policy ->
                                    if (policy.isMaintenance) {
                                        isLoading = false
                                        errorMessage = policy.maintenanceMessage
                                        return@launch
                                    }
                                    if (policy.updateRequired && policy.isMandatory) {
                                        isLoading = false
                                        onMandatoryUpdateRequired()
                                        return@launch
                                    }
                                }

                                // 2. Sign In
                                val loginResult = supabaseClient.login(phoneNumber, password)
                                if (loginResult.isFailure) {
                                    isLoading = false
                                    errorMessage = "লগইন ব্যর্থ হয়েছে। সঠিক ফোন নম্বর ও পাসওয়ার্ড লিখুন।"
                                    return@launch
                                }

                                // 3. Verify License
                                val licenseResult = supabaseClient.getLicenseStatus()
                                isLoading = false
                                licenseResult.onSuccess { status ->
                                    if (status.hasLicense && status.status == "ACTIVE") {
                                        onLoginSuccess()
                                    } else {
                                        onNavigateToLicense()
                                    }
                                }.onFailure {
                                    // Go to license screen by default if no active license
                                    onNavigateToLicense()
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
                            Text("প্রবেশ করুন", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            TextButton(onClick = onNavigateToRegister) {
                Text(
                    text = "নতুন ব্যবহারকারী? অ্যাকাউন্ট তৈরি করুন",
                    color = PurpleAccent,
                    fontSize = 14.sp
                )
            }
        }
    }
}
