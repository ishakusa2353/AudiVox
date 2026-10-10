package com.audivox.app.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Register : Screen("register", "Registration")
    object Login : Screen("login", "Login")
    object LicenseActivation : Screen("license_activation", "License Activation")
    
    // Bottom Navigation Screens
    object Home : Screen("home", "Home")
    object Sounds : Screen("sounds", "Sounds")
    object Favorites : Screen("favorites", "Favorites")
    object Mixer : Screen("mixer", "Mixer")
    object Settings : Screen("settings", "Settings")
}
