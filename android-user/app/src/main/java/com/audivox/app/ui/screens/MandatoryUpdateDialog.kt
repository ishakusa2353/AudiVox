package com.audivox.app.ui.screens

import android.app.Activity
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.audivox.app.data.model.AppPolicyResponse
import com.audivox.app.service.UpdateManager
import com.audivox.app.ui.theme.CyanAccent
import com.audivox.app.ui.theme.DarkSurface
import kotlinx.coroutines.launch

@Composable
fun MandatoryUpdateDialog(
    policy: AppPolicyResponse,
    updateManager: UpdateManager
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var isDownloading by remember { mutableStateOf(false) }
    var downloadProgress by remember { mutableIntStateOf(0) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Dialog(
        onDismissRequest = { /* Cannot dismiss without clicking either button */ },
        properties = DialogProperties(dismissOnBackPress = false, dismissOnClickOutside = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(18.dp)
        ) {
            Column(
                modifier = Modifier.padding(22.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = policy.updateTitle.ifBlank { "বাধ্যতামূলক আপডেট প্রয়োজন" },
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = policy.updateNotes.ifBlank {
                        "AudiVox এর সর্বশেষ সংস্করণ (v${policy.latestVersionName}) ইনস্টল করতে হবে। পুরানো সংস্করণের নিরাপত্তা মেয়াদ শেষ হয়েছে।"
                    },
                    fontSize = 13.sp,
                    color = Color.LightGray,
                    lineHeight = 18.sp
                )

                if (isDownloading) {
                    Spacer(modifier = Modifier.height(18.dp))
                    LinearProgressIndicator(
                        progress = { downloadProgress / 100f },
                        modifier = Modifier.fillMaxWidth(),
                        color = CyanAccent,
                        trackColor = Color(0xFF374151),
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "ডাউনলোড ও ক্রিপ্টোগ্রাফিক চেকসাম যাচাই হচ্ছে: $downloadProgress%",
                        fontSize = 12.sp,
                        color = CyanAccent
                    )
                }

                errorMessage?.let { err ->
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(text = err, color = Color(0xFFEF4444), fontSize = 12.sp)
                }

                Spacer(modifier = Modifier.height(24.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // "পরে করবো" Button: Closes the application safely
                    OutlinedButton(
                        onClick = {
                            if (context is Activity) {
                                updateManager.exitToHomeLauncher(context)
                            }
                        },
                        modifier = Modifier
                            .weight(1f)
                            .height(46.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.LightGray)
                    ) {
                        Text(text = "পরে করবো", fontSize = 13.sp)
                    }

                    // "আপডেট করুন" Button: Downloads APK and initiates Android package installer
                    Button(
                        onClick = {
                            isDownloading = true
                            errorMessage = null
                            coroutineScope.launch {
                                val result = updateManager.downloadAndInstallApk(
                                    downloadUrl = policy.apkDownloadUrl,
                                    expectedSha256 = policy.apkSha256,
                                    expectedSizeBytes = policy.apkFileSizeBytes,
                                    onProgress = { percent ->
                                        downloadProgress = percent
                                    }
                                )
                                isDownloading = false
                                result.onFailure { error ->
                                    errorMessage = error.message ?: "ডাউনলোড বা যাচাইকরণ ব্যর্থ হয়েছে।"
                                }
                            }
                        },
                        enabled = !isDownloading,
                        modifier = Modifier
                            .weight(1f)
                            .height(46.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = CyanAccent)
                    ) {
                        Text(text = "আপডেট করুন", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }
        }
    }
}
