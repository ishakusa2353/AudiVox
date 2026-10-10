package com.audivox.admin

import android.app.Application

class AudiVoxAdminApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        instance = this
    }

    companion object {
        lateinit var instance: AudiVoxAdminApplication
            private set
    }
}
