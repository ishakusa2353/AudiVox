package com.audivox.app.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Splash : Screen("splash", "Splash")
    object Welcome : Screen("welcome", "Welcome")
    object Register : Screen("register", "Registration")
    object Login : Screen("login", "Login")
    object LicenseActivation : Screen("license_activation", "License Activation")
    
    // Bottom Navigation Screens
    object Home : Screen("home", "Home")
    object Sounds : Screen("sounds", "Sounds")
    object Favorites : Screen("favorites", "Favorites")
    object Mixer : Screen("mixer", "Mixer")
    object Settings : Screen("settings", "Settings")

    // Overlay & Modal Screens
    object Profile : Screen("profile", "Profile")
    object AddCustomSound : Screen("add_custom_sound", "Add Sound")
    object AfterUpdate : Screen("after_update", "Update Complete")
    object Maintenance : Screen("maintenance", "Maintenance")
    object Offline : Screen("offline", "Offline")
}
