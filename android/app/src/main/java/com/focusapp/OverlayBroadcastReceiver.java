package com.focusapp;


import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class OverlayBroadcastReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String packageName = intent.getStringExtra("packageName");
        String type = intent.getStringExtra("type");
        
        Intent activityIntent = new Intent(context, TransparentActivity.class);
        activityIntent.putExtra("type", type);
        activityIntent.putExtra("packageName", packageName);
        activityIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        
        context.startActivity(activityIntent);
    }
}