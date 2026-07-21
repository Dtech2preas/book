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

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Collections;
import java.util.List;

import android.graphics.Bitmap;
import android.graphics.Color;
import android.view.Gravity;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;



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

            LinearLayout layout = new LinearLayout(this);
            layout.setOrientation(LinearLayout.VERTICAL);
            layout.setPadding(50, 40, 50, 10);

            TextView instructions = new TextView(this);
            instructions.setText("1. Ask receiver to connect to your Wi-Fi or Hotspot.\n2. Have them scan this QR code or go to:\n" + url);
            instructions.setTextSize(16);
            layout.addView(instructions);

            Bitmap qrBitmap = generateQRCode(url);
            if (qrBitmap != null) {
                ImageView qrImage = new ImageView(this);
                qrImage.setImageBitmap(qrBitmap);
                LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        600); // adjust height as needed
                params.setMargins(0, 30, 0, 0);
                params.gravity = Gravity.CENTER;
                qrImage.setLayoutParams(params);
                layout.addView(qrImage);
            }

            builder.setView(layout);
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
            // First try WifiManager for normal wifi connection
            WifiManager wm = (WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE);
            if (wm != null && wm.getConnectionInfo() != null && wm.getConnectionInfo().getIpAddress() != 0) {
                String ip = Formatter.formatIpAddress(wm.getConnectionInfo().getIpAddress());
                if (ip != null && !ip.equals("0.0.0.0")) {
                    return ip;
                }
            }

            // If WifiManager fails (e.g. Mobile Hotspot is on), check network interfaces
            List<NetworkInterface> interfaces = Collections.list(NetworkInterface.getNetworkInterfaces());
            for (NetworkInterface intf : interfaces) {
                // Ignore loopback and inactive interfaces
                if (!intf.isUp() || intf.isLoopback()) {
                    continue;
                }

                // Hotspot interfaces are often named ap0, wlan0, etc.
                List<InetAddress> addrs = Collections.list(intf.getInetAddresses());
                for (InetAddress addr : addrs) {
                    if (!addr.isLoopbackAddress() && addr.getAddress().length == 4) { // IPv4
                        String ip = addr.getHostAddress();
                        if (ip != null && !ip.equals("0.0.0.0")) {
                            return ip;
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }



    private Bitmap generateQRCode(String text) {
        QRCodeWriter writer = new QRCodeWriter();
        try {
            BitMatrix bitMatrix = writer.encode(text, BarcodeFormat.QR_CODE, 512, 512);
            int width = bitMatrix.getWidth();
            int height = bitMatrix.getHeight();
            Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565);
            for (int x = 0; x < width; x++) {
                for (int y = 0; y < height; y++) {
                    bitmap.setPixel(x, y, bitMatrix.get(x, y) ? Color.BLACK : Color.WHITE);
                }
            }
            return bitmap;
        } catch (WriterException e) {
            e.printStackTrace();
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
