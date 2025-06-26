package com.focusapp

import android.Manifest
import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Process
import android.provider.Settings
import androidx.appcompat.app.AlertDialog
import androidx.core.content.ContextCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {
  private val USAGE_STATS_REQUEST = 123
  private val NOTIF_REQUEST       = 456

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // 1) Usage-stats permission
    if (!hasUsageStatsPermission()) {
      startActivityForResult(
        Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS),
        USAGE_STATS_REQUEST
      )
    }

    // 2) Overlay permission
    ensureOverlayPermission()

    // 3) Notification permission on Android 13+
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      if (ContextCompat.checkSelfPermission(
          this,
          Manifest.permission.POST_NOTIFICATIONS
        ) != PackageManager.PERMISSION_GRANTED
      ) {
        requestPermissions(
          arrayOf(Manifest.permission.POST_NOTIFICATIONS),
          NOTIF_REQUEST
        )
      } else {
        // Already have notifications permission
        startMonitorService()
      }
    } else {
      // No runtime notification permission needed
      startMonitorService()
    }
  }

  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    super.onActivityResult(requestCode, resultCode, data)
    if (requestCode == USAGE_STATS_REQUEST) {
      // Re-check the usage-stats permission, you could re-prompt if still not granted
      if (!hasUsageStatsPermission()) {
        AlertDialog.Builder(this)
          .setTitle("Usage Access Required")
          .setMessage("Please grant Usage Access so we can monitor foreground apps.")
          .setPositiveButton("Open Settings") { _, _ ->
            startActivityForResult(
              Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS),
              USAGE_STATS_REQUEST
            )
          }
          .setCancelable(false)
          .show()
      }
    }
  }

  override fun onRequestPermissionsResult(
    requestCode: Int,
    permissions: Array<out String>,
    grantResults: IntArray
  ) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    if (requestCode == NOTIF_REQUEST) {
      if (grantResults.firstOrNull() == PackageManager.PERMISSION_GRANTED) {
        startMonitorService()
      } else {
        // User denied notifications: you can show a rationale or disable features
      }
    }
  }

  private fun hasUsageStatsPermission(): Boolean {
    val appOps = getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = appOps.checkOpNoThrow(
      AppOpsManager.OPSTR_GET_USAGE_STATS,
      Process.myUid(),
      packageName
    )
    return mode == AppOpsManager.MODE_ALLOWED
  }

  private fun ensureOverlayPermission() {
    if (!Settings.canDrawOverlays(this)) {
      AlertDialog.Builder(this)
        .setTitle("Overlay Permission Required")
        .setMessage("Please allow this app to draw over other apps so we can show the lock screen.")
        .setPositiveButton("Grant") { _, _ ->
          startActivity(
            Intent(
              Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
              Uri.parse("package:$packageName")
            )
          )
        }
        .setCancelable(false)
        .show()
    }
  }

  private fun startMonitorService() {
    val svcIntent = Intent(this, AppMonitorService::class.java)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      startForegroundService(svcIntent)
    } else {
      startService(svcIntent)
    }
  }

  override fun getMainComponentName(): String = "FocusApp"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
