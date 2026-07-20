package com.dtech.ambassador;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.format.Formatter;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private ApkServer server;
    private static final int PORT = 8080;
    private static final String AMBASSADOR_URL = "https://books.dtech-services.co.za/ambassadors.html";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        swipeRefresh = findViewById(R.id.swipeRefresh);

        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                swipeRefresh.setRefreshing(false);
            }
        });

        webView.setWebChromeClient(new WebChromeClient());
        webView.addJavascriptInterface(new WebAppInterface(this), "AndroidApp");

        swipeRefresh.setOnRefreshListener(() -> webView.reload());

        webView.loadUrl(AMBASSADOR_URL);
    }

    public class WebAppInterface {
        Context mContext;

        WebAppInterface(Context c) {
            mContext = c;
        }

        @JavascriptInterface
        public void startOfflineShare(String ambassadorId) {
            runOnUiThread(() -> showShareDialog(ambassadorId));
        }
    }

    private void showShareDialog(String ambassadorId) {
        String ipAddress = getLocalIpAddress();

        if (ipAddress == null || ipAddress.equals("0.0.0.0")) {
            AlertDialog.Builder builder = new AlertDialog.Builder(this);
            builder.setTitle("Network Required");
            builder.setMessage("To share offline, please turn on your Mobile Hotspot first.");
            builder.setPositiveButton("OK", null);
            builder.show();
            return;
        }

        if (server != null) {
            server.stop();
        }

        server = new ApkServer(this, PORT);
        server.setAmbassadorId(ambassadorId);

        try {
            server.start();
            String url = "http://" + ipAddress + ":" + PORT + "/";

            AlertDialog.Builder builder = new AlertDialog.Builder(this);
            builder.setTitle("QR Offline Share Active");
            builder.setMessage("1. Ask receiver to connect to your Wi-Fi or Hotspot.\n2. Have them type this URL in their browser: \n\n" + url + "\n\n(A real implementation would generate a visual QR code here)");
            builder.setPositiveButton("Stop Sharing", (dialog, which) -> {
                if(server != null) server.stop();
            });
            builder.setCancelable(false);
            builder.show();

        } catch (IOException e) {
            Toast.makeText(this, "Failed to start local server: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private String getLocalIpAddress() {
        try {
            WifiManager wm = (WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE);
            return Formatter.formatIpAddress(wm.getConnectionInfo().getIpAddress());
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (server != null) {
            server.stop();
        }
    }
}
