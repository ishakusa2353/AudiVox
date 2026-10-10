package com.audivox.app.data.local

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(entities = [LocalSoundEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun localSoundDao(): LocalSoundDao
}
