package com.focusapp

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceManager
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule

class AppMonitorService : Service() {
    private lateinit var usageStatsManager: UsageStatsManager
    private var monitoringThread: Thread? = null
    private var shouldMonitor = true

    override fun onCreate() {
        super.onCreate()
        usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        startForegroundService()
    }

    private fun startForegroundService() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Create a notification and start as foreground service
            val notification = createNotification()
            startForeground(1, notification)
        }
        startMonitoring()
    }

    private fun createNotification(): android.app.Notification {
        // Create a notification for Android O and above
        val channelId = "app_monitor_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = android.app.NotificationChannel(
                channelId,
                "App Monitor",
                android.app.NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(android.app.NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        return android.app.Notification.Builder(this, channelId)
            .setContentTitle("FocusApp Running")
            .setContentText("Monitoring app usage")
            .setSmallIcon(R.mipmap.ic_launcher)
            .build()
    }

    private fun startMonitoring() {
        shouldMonitor = true
        monitoringThread = Thread {
            while (shouldMonitor) {
                try {
                    val foregroundApp = getForegroundApp()
                    foregroundApp?.let { sendAppEvent(it) }
                    Thread.sleep(1000)
                } catch (e: InterruptedException) {
                    Log.e("AppMonitor", "Monitoring interrupted", e)
                }
            }
        }
        monitoringThread?.start()
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
        try {
            val reactInstanceManager: ReactInstanceManager? = 
                (application as ReactApplication).reactNativeHost.reactInstanceManager
            val reactContext: ReactContext? = reactInstanceManager?.currentReactContext
            
            reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("APP_IN_FOREGROUND", packageName)
        } catch (e: Exception) {
            Log.e("AppMonitor", "Error sending app event", e)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        shouldMonitor = false
        monitoringThread?.interrupt()
        super.onDestroy()
    }
}