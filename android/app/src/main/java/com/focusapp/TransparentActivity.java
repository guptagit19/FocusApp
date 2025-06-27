package com.focusapp;

import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.Nullable;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;

import android.util.Log;
import android.view.WindowManager;

public class TransparentActivity extends ReactActivity {
    private static final String TAG = "[DEBUG][TransparentActivity]";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Add these flags to make sure the activity appears
        getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
                        WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
        );

        Log.d(TAG, " onCreate - Extras: " + getIntent().getExtras());
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        Log.d(TAG, " onNewIntent - Extras: " + intent.getExtras());
    }

    @Override
    protected String getMainComponentName() {
        Log.d(TAG, "TransparentActivity getMainComponentName...");
        return "OverlayComponent";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        Log.d(TAG, "TransparentActivity ReactActivityDelegate...");
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Nullable
            @Override
            protected Bundle getLaunchOptions() {
                return getIntent().getExtras();
            }
        };
    }

    @Override
    public void onBackPressed() {
        // Disable back button
    }

    @Override
    protected void onStart() {
        super.onStart();
        Log.d(TAG, "TransparentActivity onStart");
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.d(TAG, "TransparentActivity onResume");
    }
}