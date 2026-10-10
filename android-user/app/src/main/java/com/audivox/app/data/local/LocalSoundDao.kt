package com.audivox.app.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface LocalSoundDao {
    @Query("SELECT * FROM local_sounds ORDER BY dateAdded DESC")
    fun getAllLocalSounds(): Flow<List<LocalSoundEntity>>

    @Query("SELECT * FROM local_sounds WHERE isFavorite = 1 ORDER BY dateAdded DESC")
    fun getFavoriteLocalSounds(): Flow<List<LocalSoundEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSound(sound: LocalSoundEntity)

    @Query("UPDATE local_sounds SET isFavorite = :isFav WHERE id = :id")
    suspend fun updateFavorite(id: String, isFav: Boolean)

    @Delete
    suspend fun deleteSound(sound: LocalSoundEntity)

    @Query("SELECT COUNT(*) FROM local_sounds")
    suspend fun getCount(): Int
}
