package com.audivox.app.service

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.app.NotificationCompat
import coil.load
import coil.transform.CircleCropTransformation
import com.audivox.app.AudiVoxApplication
import com.audivox.app.MainActivity
import com.audivox.app.R

class FloatingBubbleService : Service() {

    private var windowManager: WindowManager? = null
    private var bubbleView: View? = null
    private var quickPanelView: View? = null
    private lateinit var prefs: SharedPreferences
    private lateinit var audioManager: AudioPlaybackManager

    private var isPanelOpen = false

    override fun onCreate() {
        super.onCreate()
        prefs = getSharedPreferences("audivox_bubble_prefs", Context.MODE_PRIVATE)
        audioManager = AudioPlaybackManager(this)
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        startForeground(NOTIFICATION_ID, createForegroundNotification())
        createFloatingBubble()
    }

    private fun createForegroundNotification(): Notification {
        val launchIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, launchIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val stopIntent = Intent(this, FloatingBubbleService::class.java).apply {
            action = ACTION_STOP_SERVICE
        }
        val stopPendingIntent = PendingIntent.getService(
            this, 1, stopIntent,
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, AudiVoxApplication.CHANNEL_ID)
            .setContentTitle("AudiVox Sound Bubble Active")
            .setContentText("Draggable overlay ready. Tap to trigger gaming sounds.")
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(pendingIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Close Bubble", stopPendingIntent)
            .setOngoing(true)
            .build()
    }

    private fun createFloatingBubble() {
        val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        // Restore saved position
        val savedX = prefs.getInt("bubble_x", 100)
        val savedY = prefs.getInt("bubble_y", 300)

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = savedX
            y = savedY
        }

        // Create bubble container programmatically
        val container = FrameLayout(this).apply {
            layoutParams = FrameLayout.LayoutParams(160, 160)
            setBackgroundResource(android.R.drawable.dialog_holo_dark_frame)
            setPadding(12, 12, 12, 12)
        }

        val iconView = ImageView(this).apply {
            layoutParams = FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT)
            contentDescription = "AudiVox Floating Sound Bubble"
            load(BUBBLE_LOGO_URL) {
                crossfade(true)
                transformations(CircleCropTransformation())
                error(android.R.drawable.ic_media_play)
            }
        }
        container.addView(iconView)
        bubbleView = container

        // Touch listener for dragging & click detection
        container.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f
            private var isDragging = false

            override fun onTouch(v: View?, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = params.x
                        initialY = params.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        isDragging = false
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        val dx = (event.rawX - initialTouchX).toInt()
                        val dy = (event.rawY - initialTouchY).toInt()
                        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                            isDragging = true
                        }
                        if (isDragging) {
                            params.x = initialX + dx
                            params.y = initialY + dy
                            windowManager?.updateViewLayout(bubbleView, params)
                        }
                        return true
                    }
                    MotionEvent.ACTION_UP -> {
                        if (isDragging) {
                            // Save coordinates
                            prefs.edit().putInt("bubble_x", params.x).putInt("bubble_y", params.y).apply()
                        } else {
                            // Tap: Toggle Quick Sound Panel
                            toggleQuickPanel(params.x, params.y)
                        }
                        return true
                    }
                }
                return false
            }
        })

        try {
            windowManager?.addView(bubbleView, params)
        } catch (e: Exception) {
            e.printStackTrace()
            stopSelf()
        }
    }

    private fun toggleQuickPanel(bubbleX: Int, bubbleY: Int) {
        if (isPanelOpen) {
            closeQuickPanel()
        } else {
            openQuickPanel(bubbleX, bubbleY)
        }
    }

    private fun openQuickPanel(bubbleX: Int, bubbleY: Int) {
        if (quickPanelView != null) return

        val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val panelParams = WindowManager.LayoutParams(
            700,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = Math.max(20, bubbleX - 100)
            y = bubbleY + 180
        }

        val panel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(0xF0111827.toInt())
            setPadding(28, 28, 28, 28)
        }

        val title = TextView(this).apply {
            text = "AudiVox Quick Soundboard"
            textSize = 15f
            setTextColor(0xFF00F5FF.toInt())
        }
        panel.addView(title)

        val disclaimer = TextView(this).apply {
            text = "Device speaker playback active. (Android isolates external game mics)"
            textSize = 10f
            setTextColor(0xFF9CA3AF.toInt())
            setPadding(0, 6, 0, 16)
        }
        panel.addView(disclaimer)

        // Quick Sound 1: Headshot
        val btn1 = TextView(this).apply {
            text = "▶ 1. Headshot Strike"
            setTextColor(0xFFFFFFFF.toInt())
            textSize = 14f
            setPadding(16, 16, 16, 16)
            setBackgroundColor(0xFF1F2937.toInt())
            setOnClickListener {
                audioManager.playSound("https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3")
            }
        }
        panel.addView(btn1)

        // Quick Sound 2: Victory Horn
        val btn2 = TextView(this).apply {
            text = "▶ 2. Victory Horn"
            setTextColor(0xFFFFFFFF.toInt())
            textSize = 14f
            setPadding(16, 16, 16, 16)
            setBackgroundColor(0xFF1F2937.toInt())
            setOnClickListener {
                audioManager.playSound("https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3")
            }
        }
        panel.addView(btn2)

        // Stop All Controls
        val btnStop = TextView(this).apply {
            text = "⏹ Stop All Playback"
            setTextColor(0xFFEF4444.toInt())
            textSize = 13f
            setPadding(16, 16, 16, 16)
            setOnClickListener {
                audioManager.stopAll()
            }
        }
        panel.addView(btnStop)

        // Close Panel Button
        val btnClose = TextView(this).apply {
            text = "✕ Close Panel"
            setTextColor(0xFF9CA3AF.toInt())
            textSize = 12f
            setPadding(16, 12, 16, 12)
            setOnClickListener {
                closeQuickPanel()
            }
        }
        panel.addView(btnClose)

        quickPanelView = panel
        try {
            windowManager?.addView(quickPanelView, panelParams)
            isPanelOpen = true
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun closeQuickPanel() {
        quickPanelView?.let {
            try {
                windowManager?.removeView(it)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        quickPanelView = null
        isPanelOpen = false
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP_SERVICE) {
            stopSelf()
            return START_NOT_STICKY
        }
        return START_STICKY
    }

    override fun onDestroy() {
        closeQuickPanel()
        bubbleView?.let {
            try {
                windowManager?.removeView(it)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        audioManager.release()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        const val NOTIFICATION_ID = 4041
        const val ACTION_STOP_SERVICE = "com.audivox.action.STOP_BUBBLE"
        const val BUBBLE_LOGO_URL = "https://i.ibb.co/N62j1SLh/file-426.jpg"
    }
}
