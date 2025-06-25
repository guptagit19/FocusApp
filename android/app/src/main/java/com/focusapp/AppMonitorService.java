package com.focusapp;

import android.app.Service;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;

import java.util.List;
import java.util.SortedMap;
import java.util.TreeMap;

public class AppMonitorService extends Service {
    private static final String TAG = "AppMonitorService";
    private volatile boolean isRunning = false;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "Foreground app: " + "startMonitoring Started 1 ");
        if (!isRunning) {
            isRunning = true;
            Log.d(TAG, "Foreground app: " + "startMonitoring Started 2 ");
            startMonitoring();
        }
        return START_STICKY;
    }

    private void startMonitoring() {
        new Thread(() -> {
            while (isRunning) {
                try {
                    Thread.sleep(1000); // Check every second
                    String packageName = getForegroundApp();
                    if (packageName != null) {
                        // Logic to check if app should be blocked
                        Log.d(TAG, "Foreground app: " + packageName);
                    }
                } catch (InterruptedException e) {
                    Log.e(TAG, "Monitoring interrupted", e);
                }
            }
        }).start();
    }

    private String getForegroundApp() {
        UsageStatsManager usageStatsManager = (UsageStatsManager) getSystemService(USAGE_STATS_SERVICE);
        long currentTime = System.currentTimeMillis();
        
        List<UsageStats> stats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY, 
            currentTime - 1000 * 1000, 
            currentTime
        );
        
        if (stats == null) return null;

        SortedMap<Long, UsageStats> sortedStats = new TreeMap<>();
        for (UsageStats usageStats : stats) {
            sortedStats.put(usageStats.getLastTimeUsed(), usageStats);
        }
        
        if (!sortedStats.isEmpty()) {
            return sortedStats.get(sortedStats.lastKey()).getPackageName();
        }
        return null;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isRunning = false;
    }
}