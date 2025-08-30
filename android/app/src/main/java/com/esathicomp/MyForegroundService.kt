//package com.esathicomp
//
//import android.app.Notification
//import android.app.NotificationChannel
//import android.app.NotificationManager
//import android.app.Service
//import android.content.Intent
//import android.os.Build
//import android.os.IBinder
//
//class MyForegroundService : Service() {
//
//    private val CHANNEL_ID = "ForegroundServiceChannel"
//
//    override fun onCreate() {
//        super.onCreate()
//        createNotificationChannel()
//    }
//
//    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
//
//        val notification: Notification = Notification.Builder(this, CHANNEL_ID)
//            .setContentTitle("eSathi Companion Service")
//            .setContentText("Service is running in foreground")
//            .setSmallIcon(R.mipmap.ic_launcher) // uses mipmap folder for launcher icons
//            .build()
//
//        startForeground(1, notification)
//
//        // TODO: Add your background task code here
//
//        return START_STICKY
//    }
//
//    override fun onBind(intent: Intent?): IBinder? {
//        return null
//    }
//
//    private fun createNotificationChannel() {
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
//            val serviceChannel = NotificationChannel(
//                CHANNEL_ID,
//                "Foreground Service Channel",
//                NotificationManager.IMPORTANCE_DEFAULT
//            )
//            val manager = getSystemService(NotificationManager::class.java)
//            manager.createNotificationChannel(serviceChannel)
//        }
//    }
//}



package com.esathicomp

import android.app.*
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat

class MyForegroundService : Service() {

    private val CHANNEL_ID = "ForegroundServiceChannel"
    private val NOTIFICATION_ID = 1
    private var isRunning = false

    override fun onCreate() {
        super.onCreate()
        Log.d("MyForegroundService", "Service Created")
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("MyForegroundService", "Service Started")

        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("eSathi Running")
            .setContentText("The service is running in the background")
            .setSmallIcon(R.mipmap.ic_launcher) // Ensure this icon exists in mipmap folder
            .setContentIntent(pendingIntent)
            .setOngoing(true) // Make notification persistent
            .build()

        startForeground(NOTIFICATION_ID, notification)

        isRunning = true
        Thread {
            while (isRunning) {
                Log.d("MyForegroundService", "Service is alive... logging every 2 seconds")
                try {
                    Thread.sleep(2000) // Changed to 2 seconds for frequent logging
                } catch (e: InterruptedException) {
                    Thread.currentThread().interrupt()
                }
            }
        }.start()

        return START_STICKY // ensures service will be restarted if killed
    }

    override fun onDestroy() {
        isRunning = false
        Log.d("MyForegroundService", "Service Destroyed")
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Foreground Service Channel",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }
}
