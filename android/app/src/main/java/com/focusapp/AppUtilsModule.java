package com.focusapp;

import android.app.Activity;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.ComponentName;
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
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.util.Base64;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import org.json.JSONArray;
import com.focusapp.TransparentActivity; // Make sure the package name is correct
import android.app.TaskStackBuilder;

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
        Activity currentActivity = getReactApplicationContext().getCurrentActivity();
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

    @ReactMethod
    public void showOverlay(String packageName, String type) {
        Log.d(TAG, "[DEBUG][AppUtilsModule] showOverlay packageName - " + packageName + " and type - "+ type);
        try {
            Context context = reactContext.getApplicationContext();
            Log.d(TAG, "[DEBUG][AppUtilsModule] showOverlay context - " + context);

            Intent intent = new Intent(context, TransparentActivity.class);
            intent.putExtra("type", type);
            intent.putExtra("packageName", packageName);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK |
                    Intent.FLAG_ACTIVITY_CLEAR_TASK |
                    Intent.FLAG_ACTIVITY_NO_ANIMATION);

            // Use TaskStackBuilder to properly start activity from background
            try {
                // Try starting activity normally
                Log.d(TAG, "[DEBUG][AppUtilsModule] showOverlay Inside try - " + context);
                TaskStackBuilder stackBuilder = TaskStackBuilder.create(context);
                stackBuilder.addNextIntentWithParentStack(intent);
                stackBuilder.startActivities();
            } catch (SecurityException e) {
                Log.w(TAG, "Failed to start activity directly, using broadcast fallback");
                // Use broadcast receiver as fallback
                Intent broadcastIntent = new Intent("com.focusapp.SHOW_OVERLAY");
                broadcastIntent.putExtra("packageName", packageName);
                broadcastIntent.putExtra("type", type);
                // *** FIX FOR THE ERROR: Make the intent explicit ***
                broadcastIntent.setComponent(new ComponentName(context.getPackageName(), OverlayBroadcastReceiver.class.getName()));
                context.sendBroadcast(broadcastIntent);
            }
            Log.d(TAG, "[DEBUG][AppUtilsModule] Activity started successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error starting TransparentActivity", e);
        }
    }

    // Replace the showOverlay method with this:
//    @ReactMethod
//    public void showOverlay(String packageName, String type) {
//        Log.d(TAG, "[DEBUG][AppUtilsModule] showOverlay packageName - " + packageName + " and type - "+ type);
//        try {
//            // Use application context instead of activity context
//            Context context = reactContext.getApplicationContext();
//            Log.d(TAG, "[DEBUG][AppUtilsModule] showOverlay context - " + context);
//            Intent intent = new Intent(context, TransparentActivity.class);
//            Log.d(TAG, "[DEBUG][AppUtilsModule] showOverlay intent - " + intent);
//            intent.putExtra("type", type);
//            intent.putExtra("packageName", packageName);
//            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK |
//                    Intent.FLAG_ACTIVITY_CLEAR_TASK |
//                    Intent.FLAG_ACTIVITY_NO_ANIMATION);
//            context.startActivity(intent);
//        } catch (Exception e) {
//            Log.e(TAG, "Error starting TransparentActivity", e);
//        }
//    }

//    @ReactMethod
//    public void showOverlay(String packageName, String type) {
//        Log.d(TAG, "showOverlay: packageName - " + packageName + ", type=" + type);
//        Intent intent = new Intent(getReactApplicationContext(), TransparentActivity.class);
//        intent.setAction(Intent.ACTION_MAIN);             // mark as a main entry
//        intent.addCategory(Intent.CATEGORY_LAUNCHER);     // so Android treats it like a launch
//        intent.putExtra("type", type);
//        intent.putExtra("packageName", packageName);
//        intent.addFlags(
//                Intent.FLAG_ACTIVITY_NEW_TASK |
//                        Intent.FLAG_ACTIVITY_CLEAR_TOP |
//                        Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS
//        );
//        getReactApplicationContext().startActivity(intent);
//    }



    @ReactMethod
    public void finishOverlay() {
        Activity currentActivity = getReactApplicationContext().getCurrentActivity();
        if (currentActivity != null) {
            currentActivity.finish();
        }
    }
}