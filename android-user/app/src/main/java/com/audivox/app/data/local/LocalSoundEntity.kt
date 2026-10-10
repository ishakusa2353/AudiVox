package com.audivox.app.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "local_sounds")
data class LocalSoundEntity(
    @PrimaryKey val id: String,
    val title: String,
    val localUri: String,
    val durationMs: Long,
    val fileSizeBytes: Long,
    val fileFormat: String,
    val dateAdded: Long = System.currentTimeMillis(),
    val isFavorite: Boolean = false
)
