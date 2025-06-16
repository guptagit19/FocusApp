package com.focusapp

import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.IBinder
import android.util.Log
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceManager
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule

class AppMonitorService : Service() {
    private lateinit var usageStatsManager: UsageStatsManager

    override fun onCreate() {
        super.onCreate()
        usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        startMonitoring()
    }

    private fun startMonitoring() {
        Thread {
            while (true) {
                val currentApp = getForegroundApp()
                currentApp?.let {
                    sendAppEvent(it)
                }
                Thread.sleep(1000)
            }
        }.start()
    }

    private fun getForegroundApp(): String? {
        val endTime = System.currentTimeMillis()
        val startTime = endTime - 1000 * 60 // 1 minute
        val events = usageStatsManager.queryEvents(startTime, endTime)
        val event = UsageEvents.Event()
        var foregroundApp: String? = null
        
        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                foregroundApp = event.packageName
            }
        }
        
        return foregroundApp
    }

    private fun sendAppEvent(packageName: String) {
        val reactInstanceManager: ReactInstanceManager? = 
            (application as ReactApplication).reactNativeHost.reactInstanceManager
        val reactContext: ReactContext? = reactInstanceManager?.currentReactContext
        
        reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit("APP_IN_FOREGROUND", packageName)
    }

    override fun onBind(intent: Intent?): IBinder? = null
}