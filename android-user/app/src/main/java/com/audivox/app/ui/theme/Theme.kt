package com.audivox.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val CyanAccent = Color(0xFF00F5FF)
val PurpleAccent = Color(0xFF8B5CF6)
val DarkBackground = Color(0xFF0B0F19)
val DarkSurface = Color(0xFF111827)
val DarkSurfaceBorder = Color(0xFF1F2937)
val TextPrimary = Color(0xFFF9FAFB)
val TextSecondary = Color(0xFF9CA3AF)
val CrimsonError = Color(0xFFEF4444)
val EmeraldSuccess = Color(0xFF10B981)

private val DarkColorScheme = darkColorScheme(
    primary = CyanAccent,
    secondary = PurpleAccent,
    background = DarkBackground,
    surface = DarkSurface,
    onPrimary = Color.Black,
    onSecondary = Color.White,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    error = CrimsonError
)

val GlassBackground = Color(0xF00B0F19)
val GlassSurface = Color(0x99111827) // 60% opacity dark frosted surface
val GlassSurfaceElevated = Color(0xB31F2937) // 70% opacity elevated frost
val GlassBorder = Color(0x2E00F5FF) // subtle cyan glass hairline border
val GlassBorderPurple = Color(0x2E8B5CF6) // subtle purple glass hairline border
val GlassBorderWhite = Color(0x1AFFFFFF) // specular reflection edge

@Composable
fun AudiVoxTheme(
    darkTheme: Boolean = true,
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
