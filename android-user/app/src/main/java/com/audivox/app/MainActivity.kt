package com.audivox.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.audivox.app.data.model.AppPolicyResponse
import com.audivox.app.data.remote.SupabaseClient
import com.audivox.app.service.AudioPlaybackManager
import com.audivox.app.service.UpdateManager
import com.audivox.app.ui.navigation.Screen
import com.audivox.app.ui.screens.*
import com.audivox.app.ui.theme.AudiVoxTheme
import com.audivox.app.ui.theme.CyanAccent
import com.audivox.app.ui.theme.DarkBackground
import com.audivox.app.ui.theme.DarkSurface
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private lateinit var supabaseClient: SupabaseClient
    private lateinit var audioManager: AudioPlaybackManager
    private lateinit var updateManager: UpdateManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        supabaseClient = SupabaseClient(this)
        audioManager = AudioPlaybackManager(this)
        updateManager = UpdateManager(this)

        setContent {
            AudiVoxTheme {
                MainAppContainer(
                    supabaseClient = supabaseClient,
                    audioManager = audioManager,
                    updateManager = updateManager
                )
            }
        }
    }

    override fun onDestroy() {
        audioManager.release()
        super.onDestroy()
    }
}

data class BottomNavItem(val screen: Screen, val icon: ImageVector)

@Composable
fun MainAppContainer(
    supabaseClient: SupabaseClient,
    audioManager: AudioPlaybackManager,
    updateManager: UpdateManager
) {
    val navController = rememberNavController()
    val coroutineScope = rememberCoroutineScope()
    var mandatoryUpdatePolicy by remember { mutableStateOf<AppPolicyResponse?>(null) }

    val context = androidx.compose.ui.platform.LocalContext.current
    var hasAllPermissions by remember {
        mutableStateOf(
            (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.M || android.provider.Settings.canDrawOverlays(context)) &&
            (androidx.core.content.ContextCompat.checkSelfPermission(context, android.Manifest.permission.RECORD_AUDIO) == android.content.pm.PackageManager.PERMISSION_GRANTED)
        )
    }

    if (!hasAllPermissions) {
        MandatoryPermissionScreen(
            onAllPermissionsGranted = {
                hasAllPermissions = true
            }
        )
        return
    }

    val startDestination = if (supabaseClient.authToken != null) {
        Screen.Home.route
    } else {
        Screen.Login.route
    }

    // Check policy on app launch
    LaunchedEffect(Unit) {
        val result = supabaseClient.checkPolicy(BuildConfig.VERSION_CODE)
        result.onSuccess { policy ->
            if (policy.updateRequired && policy.isMandatory) {
                mandatoryUpdatePolicy = policy
            }
        }
    }

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val bottomNavItems = listOf(
        BottomNavItem(Screen.Home, Icons.Default.Home),
        BottomNavItem(Screen.Sounds, Icons.Default.MusicNote),
        BottomNavItem(Screen.Favorites, Icons.Default.Star),
        BottomNavItem(Screen.Mixer, Icons.Default.Tune),
        BottomNavItem(Screen.Settings, Icons.Default.Settings)
    )

    val showBottomBar = currentRoute in bottomNavItems.map { it.screen.route }

    Scaffold(
        containerColor = DarkBackground,
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = DarkSurface,
                    contentColor = Color.White
                ) {
                    bottomNavItems.forEach { item ->
                        val selected = currentRoute == item.screen.route
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                if (currentRoute != item.screen.route) {
                                    navController.navigate(item.screen.route) {
                                        popUpTo(Screen.Home.route) { saveState = true }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            },
                            icon = {
                                Icon(
                                    imageVector = item.icon,
                                    contentDescription = item.screen.title,
                                    tint = if (selected) CyanAccent else Color.Gray
                                )
                            },
                            label = {
                                Text(
                                    text = item.screen.title,
                                    color = if (selected) CyanAccent else Color.Gray
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                indicatorColor = Color(0x2200F5FF)
                            )
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = startDestination,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Login.route) {
                LoginScreen(
                    supabaseClient = supabaseClient,
                    onNavigateToRegister = { navController.navigate(Screen.Register.route) },
                    onNavigateToLicense = { navController.navigate(Screen.LicenseActivation.route) },
                    onLoginSuccess = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    },
                    onMandatoryUpdateRequired = {
                        coroutineScope.launch {
                            val pol = supabaseClient.checkPolicy(BuildConfig.VERSION_CODE).getOrNull()
                            mandatoryUpdatePolicy = pol
                        }
                    }
                )
            }

            composable(Screen.Register.route) {
                RegisterScreen(
                    supabaseClient = supabaseClient,
                    onNavigateToLogin = { navController.popBackStack() },
                    onRegistrationSuccess = {
                        // After registration, immediately open License Activation
                        navController.navigate(Screen.LicenseActivation.route) {
                            popUpTo(Screen.Register.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.LicenseActivation.route) {
                LicenseActivationScreen(
                    supabaseClient = supabaseClient,
                    onActivationSuccess = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.LicenseActivation.route) { inclusive = true }
                        }
                    },
                    onLogout = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Home.route) {
                HomeScreen(
                    supabaseClient = supabaseClient,
                    audioManager = audioManager,
                    onNavigateToSounds = { navController.navigate(Screen.Sounds.route) },
                    onNavigateToMixer = { navController.navigate(Screen.Mixer.route) }
                )
            }

            composable(Screen.Sounds.route) {
                SoundsScreen(audioManager = audioManager)
            }

            composable(Screen.Favorites.route) {
                FavoritesScreen(audioManager = audioManager)
            }

            composable(Screen.Mixer.route) {
                MixerScreen(audioManager = audioManager)
            }

            composable(Screen.Settings.route) {
                SettingsScreen(
                    supabaseClient = supabaseClient,
                    onLogout = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }
        }

        // Mandatory Update Modal
        mandatoryUpdatePolicy?.let { policy ->
            MandatoryUpdateDialog(
                policy = policy,
                updateManager = updateManager
            )
        }
    }
}
