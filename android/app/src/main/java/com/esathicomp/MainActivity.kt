package com.esathicomp

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.location.LocationManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.widget.Toast
import androidx.activity.result.IntentSenderRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.facebook.react.ReactActivity

import com.google.android.gms.common.api.ResolvableApiException
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.LocationSettingsRequest
import com.google.android.gms.location.Priority
import com.google.android.gms.location.SettingsClient

import com.esathicomp.R

class MainActivity : ReactActivity() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationRequest: LocationRequest
    private lateinit var locationSettingsClient: SettingsClient
    override fun getMainComponentName(): String {
        return "eSathiComp"  // Must match app name in JS 'index.js' / 'app.json'
    }
    // Requests Notification permission on Android 13+
    private val requestNotificationPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            if (!granted) {
                Toast.makeText(this, "Notification permission required!", Toast.LENGTH_SHORT).show()
            } else {
                checkAndStartService()
            }
        }

    // Requests Location permission (ACCESS_FINE_LOCATION)
    private val requestLocationPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            if (granted) {
                checkAndStartService()
            } else {
                Toast.makeText(this, "Location permission required!", Toast.LENGTH_SHORT).show()
            }
        }

    // Launcher for GPS enable dialog
    private val resolutionForResult =
        registerForActivityResult(ActivityResultContracts.StartIntentSenderForResult()) { result ->
            if (result.resultCode == RESULT_OK) {
                checkAndStartService()
            } else {
                Toast.makeText(this, "GPS is required for this app", Toast.LENGTH_SHORT).show()
            }
        }

    // BroadcastReceiver to listen for GPS ON/OFF events
    private val gpsReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == LocationManager.PROVIDERS_CHANGED_ACTION) {
                checkLocationEnabled()
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        locationSettingsClient = LocationServices.getSettingsClient(this)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requestNotificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
        } else {
            checkAndStartService()
        }

        requestBatteryOptimizationIgnore()
    }

    private fun checkAndStartService() {
        val locationPermissionGranted = ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        // Foreground Service Location permission is a normal permission but still we check it explicitly
        val fgServiceLocationGranted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContextCompat.checkSelfPermission(
                this,
                "android.permission.FOREGROUND_SERVICE_LOCATION"
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true // below Android 10 no runtime permission for FOREGROUND_SERVICE_LOCATION
        }

        if (!locationPermissionGranted) {
            requestLocationPermission.launch(Manifest.permission.ACCESS_FINE_LOCATION)
            return
        }

        if (!fgServiceLocationGranted && Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // Normally this permission is granted if location permission is granted,
            // but we check anyway. For some OEM/ROMs, user action might be needed.
            Toast.makeText(this, "Foreground service location permission required!", Toast.LENGTH_LONG).show()
            // You can show custom UI or direct user to settings here if needed
            return
        }

        checkLocationEnabled()
    }

    private fun requestBatteryOptimizationIgnore() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
            if (!pm.isIgnoringBatteryOptimizations(packageName)) {
                try {
                    val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
                    intent.data = Uri.parse("package:$packageName")
                    startActivity(intent)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
    }

    private fun startMyService() {
        val serviceIntent = Intent(this, MyForegroundService::class.java)
        ContextCompat.startForegroundService(this, serviceIntent)
    }

    private fun checkLocationEnabled() {
        locationRequest = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY, 1000L
        ).build()

        val builder = LocationSettingsRequest.Builder()
            .addLocationRequest(locationRequest)
            .setAlwaysShow(true)

        val task = locationSettingsClient.checkLocationSettings(builder.build())
        task.addOnSuccessListener {
            startMyService()
        }
        task.addOnFailureListener { exception ->
            if (exception is ResolvableApiException) {
                try {
                    val intentSender = exception.resolution.intentSender
                    resolutionForResult.launch(IntentSenderRequest.Builder(intentSender).build())
                } catch (ex: Exception) {
                    ex.printStackTrace()
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        registerReceiver(gpsReceiver, IntentFilter(LocationManager.PROVIDERS_CHANGED_ACTION))
        checkAndStartService()
    }

    override fun onPause() {
        super.onPause()
        unregisterReceiver(gpsReceiver)
    }
}
