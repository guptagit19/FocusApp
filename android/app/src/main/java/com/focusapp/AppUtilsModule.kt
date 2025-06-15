package com.focusapp

import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.Drawable
import android.util.Base64
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import java.io.ByteArrayOutputStream

class AppUtilsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AppUtilsModule"
    }

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val packages = pm.getInstalledApplications(PackageManager.GET_META_DATA)
            val appList = WritableNativeArray()

            for (packageInfo in packages) {
                // Skip system apps
                if (packageInfo.flags and ApplicationInfo.FLAG_SYSTEM != 0) {
                    continue
                }

                val appName = packageInfo.loadLabel(pm).toString()
                val packageName = packageInfo.packageName
                val icon = packageInfo.loadIcon(pm)
                
                val iconBase64 = drawableToBase64(icon)

                val appInfo = WritableNativeMap()
                appInfo.putString("appName", appName)
                appInfo.putString("packageName", packageName)
                appInfo.putString("icon", iconBase64)

                appList.pushMap(appInfo)
            }

            promise.resolve(appList)
        } catch (e: Exception) {
            promise.reject("ERROR_GETTING_APPS", e)
        }
    }

private fun drawableToBase64(drawable: Drawable): String {
    val bitmap = if (drawable.intrinsicWidth <= 0 || drawable.intrinsicHeight <= 0) {
        Bitmap.createBitmap(1, 1, Bitmap.Config.ARGB_8888) // Single color bitmap
    } else {
        Bitmap.createBitmap(
            drawable.intrinsicWidth,
            drawable.intrinsicHeight,
            Bitmap.Config.ARGB_8888
        )
    }
    
    val canvas = Canvas(bitmap)
    drawable.setBounds(0, 0, canvas.width, canvas.height)
    drawable.draw(canvas)
    
    val stream = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
    val byteArray = stream.toByteArray()
    
    return Base64.encodeToString(byteArray, Base64.DEFAULT)
}
}