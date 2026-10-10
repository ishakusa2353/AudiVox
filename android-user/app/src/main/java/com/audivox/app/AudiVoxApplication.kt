package com.audivox.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import androidx.room.Room
import com.audivox.app.data.local.AppDatabase

class AudiVoxApplication : Application() {

    lateinit var database: AppDatabase
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        // Initialize local Room DB for imported device audio files (safe local storage)
        database = Room.databaseBuilder(
            applicationContext,
            AppDatabase::class.java,
            "audivox_local.db"
        ).fallbackToDestructiveMigration().build()

        // Create Foreground Notification Channel for the Floating Bubble Service
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                getString(R.string.floating_service_channel_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = getString(R.string.floating_service_channel_desc)
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    companion object {
        const val CHANNEL_ID = "audivox_floating_service_channel"
        lateinit var instance: AudiVoxApplication
            private set
    }
}
