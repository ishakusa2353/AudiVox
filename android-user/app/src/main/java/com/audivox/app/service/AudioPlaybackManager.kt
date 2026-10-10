package com.audivox.app.service

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.util.Log

class AudioPlaybackManager(private val context: Context) {

    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private val activePlayers = mutableListOf<MediaPlayer>()
    private var playbackVolume = 1.0f

    // Audio focus handling
    private var focusRequest: AudioFocusRequest? = null

    private fun requestAudioFocus(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val playbackAttributes = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_GAME)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build()

            val request = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                .setAudioAttributes(playbackAttributes)
                .setAcceptsDelayedFocusGain(true)
                .setOnAudioFocusChangeListener { focusChange ->
                    if (focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) {
                        setVolume(0.3f)
                    } else if (focusChange == AudioManager.AUDIOFOCUS_GAIN) {
                        setVolume(playbackVolume)
                    }
                }
                .build()

            focusRequest = request
            audioManager.requestAudioFocus(request) == AudioManager.AUDIOFOCUS_REQUEST_GRANTED
        } else {
            @Suppress("DEPRECATION")
            audioManager.requestAudioFocus(
                null,
                AudioManager.STREAM_MUSIC,
                AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK
            ) == AudioManager.AUDIOFOCUS_REQUEST_GRANTED
        }
    }

    // Play sound from remote URL or local content URI
    fun playSound(uriString: String, onComplete: (() -> Unit)? = null) {
        try {
            requestAudioFocus()
            val player = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_GAME)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                if (uriString.startsWith("http://") || uriString.startsWith("https://")) {
                    setDataSource(uriString)
                } else {
                    setDataSource(context, Uri.parse(uriString))
                }
                setVolume(playbackVolume, playbackVolume)
                setOnPreparedListener { mp ->
                    mp.start()
                }
                setOnCompletionListener { mp ->
                    activePlayers.remove(mp)
                    mp.release()
                    onComplete?.invoke()
                }
                setOnErrorListener { mp, what, extra ->
                    Log.e(TAG, "Playback error: what=$what, extra=$extra")
                    activePlayers.remove(mp)
                    mp.release()
                    true
                }
                prepareAsync()
            }
            activePlayers.add(player)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start sound playback: ${e.message}")
        }
    }

    // Simultaneous audio playback for mixer
    fun playSimultaneous(uris: List<String>) {
        uris.forEach { uri ->
            playSound(uri)
        }
    }

    fun setVolume(volume: Float) {
        playbackVolume = volume.coerceIn(0.0f, 1.0f)
        activePlayers.forEach { player ->
            try {
                if (player.isPlaying) {
                    player.setVolume(playbackVolume, playbackVolume)
                }
            } catch (e: Exception) {
                // ignore
            }
        }
    }

    fun stopAll() {
        activePlayers.forEach { player ->
            try {
                if (player.isPlaying) {
                    player.stop()
                }
                player.release()
            } catch (e: Exception) {
                // ignore
            }
        }
        activePlayers.clear()
        abandonAudioFocus()
    }

    private fun abandonAudioFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            focusRequest?.let { audioManager.abandonAudioFocusRequest(it) }
        } else {
            @Suppress("DEPRECATION")
            audioManager.abandonAudioFocus(null)
        }
    }

    fun release() {
        stopAll()
    }

    companion object {
        private const val TAG = "AudioPlaybackManager"
        // Architectural transparency note:
        // Standard Android sandboxing isolates app audio from external game microphone buffers.
        // AudiVox routes audio through standard media output / speakers / earphones.
    }
}
