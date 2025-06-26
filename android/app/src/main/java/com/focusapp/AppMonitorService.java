package com.focusapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.os.Process;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import java.util.List;
import java.util.SortedMap;
import java.util.TreeMap;

public class AppMonitorService extends Service {
    private static final String TAG = "AppMonitorService";
    private static final String CHANNEL_ID = "monitor_channel";
    private static final int NOTIFICATION_ID = 1;

    private volatile boolean isRunning = false;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "onStartCommand: service starting…");

        // 1) Build and post the foreground notification
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("App Monitor")
                .setContentText("Monitoring foreground apps…")
                .setSmallIcon(R.drawable.ic_lock)     // replace with your drawable
                .setOngoing(true)
                .build();

        startForeground(NOTIFICATION_ID, notification);

        // 2) Start the monitoring thread if not already running
        if (!isRunning) {
            isRunning = true;
            startMonitoringLoop();
        }

        // If killed, restart with the last Intent
        return START_STICKY;
    }

    private void startMonitoringLoop() {
        new Thread(() -> {
            UsageStatsManager usm = (UsageStatsManager) getSystemService(Context.USAGE_STATS_SERVICE);
            while (isRunning) {
                try {
                    Thread.sleep(1000);

                long currentTime = System.currentTimeMillis();

                List<UsageStats> stats = usageStatsManager.queryUsageStats(
                    UsageStatsManager.INTERVAL_DAILY,
                    currentTime - 1000 * 1000,
                    currentTime);

                    if (stats != null && !stats.isEmpty()) {
                        SortedMap<Long, UsageStats> sorted = new TreeMap<>();
                        for (UsageStats entry : stats) {
                            sorted.put(entry.getLastTimeUsed(), entry);
                        }
                        String topPackage = sorted.get(sorted.lastKey()).getPackageName();
                        Log.d(TAG, "Foreground app: " + topPackage);

                        // TODO: if topPackage is in your “blocked” list,
                        //       launch your lock-screen activity here
                        //
                        // Intent lockIntent = new Intent(this, LockScreenActivity.class);
                        // lockIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                        // startActivity(lockIntent);
                    }
                } catch (InterruptedException e) {
                    Log.e(TAG, "Monitoring thread interrupted", e);
                }
            }
        }).start();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isRunning = false;
        Log.d(TAG, "onDestroy: service stopped");
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        // We don't support binding
        return null;
    }

    // --- Helper to create the notification channel on Android O+ ---
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "App Monitor";
            String description = "Channel for foreground app-monitoring service";
            int importance = NotificationManager.IMPORTANCE_LOW;

            NotificationChannel channel =
                    new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);

            NotificationManager nm =
                    (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            nm.createNotificationChannel(channel);
        }
    }
}
