package com.focusapp;

import android.app.Activity;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.provider.Settings;
import android.util.Log;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import org.json.JSONObject;
import java.util.List;
import java.util.SortedMap;
import java.util.TreeMap;

// Add these new imports
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.util.Base64;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import org.json.JSONArray;



public class AppUtilsModule extends ReactContextBaseJavaModule {
    private static final String TAG = "AppUtilsModule";
    private static final int USAGE_STATS_PERMISSION_REQUEST = 100;
    private static final String EVENT_APP_IN_FOREGROUND = "APP_IN_FOREGROUND";
    private static final String EVENT_ACCESS_SETUP_REQUEST = "SHOW_ACCESS_SETUP";
    private static final String EVENT_LOCK_SCREEN_REQUEST = "SHOW_LOCK_SCREEN";

    private final ReactApplicationContext reactContext;
    private Promise usageStatsPermissionPromise;
    private boolean isMonitoring = false;

    private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (requestCode == USAGE_STATS_PERMISSION_REQUEST) {
                if (usageStatsPermissionPromise != null) {
                    usageStatsPermissionPromise.resolve(hasUsageStatsPermission());
                    usageStatsPermissionPromise = null;
                }
            }
        }
    };

    public AppUtilsModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        reactContext.addActivityEventListener(activityEventListener);
    }

    @Override
    public String getName() {
        return "AppUtilsModule";
    }

    @ReactMethod
    public void checkUsageStatsPermission(Promise promise) {
        promise.resolve(hasUsageStatsPermission());
    }

    @ReactMethod
    public void requestUsageStatsPermission(Promise promise) {
        if (hasUsageStatsPermission()) {
            promise.resolve(true);
            return;
        }

        usageStatsPermissionPromise = promise;
        Activity currentActivity = getCurrentActivity();
        if (currentActivity != null) {
            Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
            currentActivity.startActivityForResult(intent, USAGE_STATS_PERMISSION_REQUEST);
        } else {
            promise.reject("NO_ACTIVITY", "No current activity");
        }
    }

        // Add this method to get installed apps
    @ReactMethod
    public void getInstalledApps(Promise promise) {
        try {
            PackageManager pm = reactContext.getPackageManager();
            List<ApplicationInfo> apps = pm.getInstalledApplications(PackageManager.GET_META_DATA);
            JSONArray appsArray = new JSONArray();
            String selfPackage = reactContext.getPackageName();

            for (ApplicationInfo app : apps) {
                // Skip system apps and our own app
                if ((app.flags & ApplicationInfo.FLAG_SYSTEM) == 0 && 
                    !app.packageName.equals(selfPackage)) {
                    
                    JSONObject appJson = new JSONObject();
                    appJson.put("name", pm.getApplicationLabel(app).toString());
                    appJson.put("packageName", app.packageName);
                    
                    // Convert icon to base64
                    Drawable icon = pm.getApplicationIcon(app);
                    appJson.put("icon", drawableToBase64(icon));
                    
                    appsArray.put(appJson);
                }
            }
            
            promise.resolve(appsArray.toString());
        } catch (Exception e) {
            promise.reject("GET_APPS_FAILED", "Failed to get installed apps", e);
        }
    }

    // Helper method to convert drawable to base64
    private String drawableToBase64(Drawable drawable) {
        try {
            Bitmap bitmap = Bitmap.createBitmap(
                drawable.getIntrinsicWidth(),
                drawable.getIntrinsicHeight(),
                Bitmap.Config.ARGB_8888
            );
            
            Canvas canvas = new Canvas(bitmap);
            drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
            drawable.draw(canvas);
            
            ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteStream);
            byte[] byteArray = byteStream.toByteArray();
            
            return "data:image/png;base64," + Base64.encodeToString(byteArray, Base64.DEFAULT);
        } catch (Exception e) {
            return "";
        }
    }

    // Add this method to get current package name
    @ReactMethod
    public void getPackageName(Promise promise) {
        promise.resolve(reactContext.getPackageName());
    }


    @ReactMethod
    public void initAppMonitor(String accessRulesJson) {
        Log.d(TAG, "Initializing app monitor with rules: " + accessRulesJson);
        isMonitoring = true;
        startAppMonitoring();
    }

    @ReactMethod
    public void updateAccessRules(String accessRulesJson) {
        Log.d(TAG, "Updating access rules: " + accessRulesJson);
    }

    @ReactMethod
    public void stopAppMonitor() {
        Log.d(TAG, "Stopping app monitor");
        isMonitoring = false;
    }

    private boolean hasUsageStatsPermission() {
        Context context = reactContext.getApplicationContext();
        long currentTime = System.currentTimeMillis();
        UsageStatsManager usageStatsManager = (UsageStatsManager) context.getSystemService(Context.USAGE_STATS_SERVICE);
        List<UsageStats> stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                currentTime - 1000 * 1000,
                currentTime);
        return stats != null && !stats.isEmpty();
    }

    private void startAppMonitoring() {
        new Thread(() -> {
            while (isMonitoring) {
                try {
                    Thread.sleep(1000); // Poll every second
                    String packageName = getForegroundApp();
                    if (packageName != null) {
                        sendAppInForegroundEvent(packageName);
                    }
                } catch (InterruptedException e) {
                    Log.e(TAG, "Monitoring interrupted", e);
                }
            }
        }).start();
    }

    private String getForegroundApp() {
        Context context = reactContext.getApplicationContext();
        UsageStatsManager usageStatsManager = (UsageStatsManager) context.getSystemService(Context.USAGE_STATS_SERVICE);
        long currentTime = System.currentTimeMillis();

        List<UsageStats> stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                currentTime - 1000 * 1000,
                currentTime);

        if (stats == null)
            return null;

        SortedMap<Long, UsageStats> sortedStats = new TreeMap<>();
        for (UsageStats usageStats : stats) {
            sortedStats.put(usageStats.getLastTimeUsed(), usageStats);
        }

        if (!sortedStats.isEmpty()) {
            return sortedStats.get(sortedStats.lastKey()).getPackageName();
        }
        return null;
    }

    private void sendAppInForegroundEvent(String packageName) {
        WritableMap params = Arguments.createMap();
        params.putString("packageName", packageName);
        sendEvent(reactContext, EVENT_APP_IN_FOREGROUND, params);
    }

    public void requestAccessSetup(String packageName) {
        WritableMap params = Arguments.createMap();
        params.putString("packageName", packageName);
        sendEvent(reactContext, EVENT_ACCESS_SETUP_REQUEST, params);
    }

        // Fix the event emitter method name (typo in image)
    public void showLockScreen(String packageName) {
        WritableMap params = Arguments.createMap();
        params.putString("packageName", packageName);
        sendEvent(reactContext, EVENT_LOCK_SCREEN_REQUEST, params);
    }

    private void sendEvent(ReactContext reactContext, String eventName, WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }
}