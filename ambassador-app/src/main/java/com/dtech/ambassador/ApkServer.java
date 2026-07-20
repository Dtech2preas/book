package com.dtech.ambassador;

import android.content.Context;
import android.content.res.AssetManager;
import android.util.Log;

import java.io.IOException;
import java.io.InputStream;

import fi.iki.elonen.NanoHTTPD;

public class ApkServer extends NanoHTTPD {
    private Context context;
    private static final String APK_FILE = "marketplace.apk";
    private String ambassadorId;

    public ApkServer(Context context, int port) {
        super(port);
        this.context = context;
    }

    public void setAmbassadorId(String ambassadorId) {
        this.ambassadorId = ambassadorId;
    }

    @Override
    public Response serve(IHTTPSession session) {
        String uri = session.getUri();

        // Return a simple HTML page with instructions and the download link
        if (uri.equals("/")) {
            String html = "<html><head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
                    "<style>body{font-family:sans-serif;text-align:center;padding:20px;background:#121212;color:#fff;}" +
                    ".btn{display:inline-block;padding:15px 30px;background:#00D2FF;color:#000;text-decoration:none;border-radius:25px;font-weight:bold;margin-top:20px;font-size:18px;}</style></head>" +
                    "<body><h2>Welcome to D-TECH</h2><p>You have been invited by Ambassador: " + ambassadorId + "</p>" +
                    "<p>Click the button below to download the app directly to your phone without using data.</p>" +
                    "<a href=\"/download\" class=\"btn\">Download App</a>" +
                    "<p style=\"font-size:12px;margin-top:30px;color:#888;\">You may need to allow 'Install from unknown sources' in your browser settings.</p></body></html>";
            return newFixedLengthResponse(Response.Status.OK, "text/html", html);
        }

        // Serve the APK file
        if (uri.equals("/download")) {
            try {
                AssetManager assetManager = context.getAssets();
                InputStream is = assetManager.open(APK_FILE);
                long size = context.getAssets().openFd(APK_FILE).getLength();

                Response response = newFixedLengthResponse(Response.Status.OK, "application/vnd.android.package-archive", is, size);
                response.addHeader("Content-Disposition", "attachment; filename=\"DTECH-Marketplace.apk\"");
                return response;
            } catch (IOException e) {
                Log.e("ApkServer", "Error serving APK", e);
                return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, MIME_PLAINTEXT, "Error serving file: " + e.getMessage());
            }
        }

        return newFixedLengthResponse(Response.Status.NOT_FOUND, MIME_PLAINTEXT, "Not Found");
    }
}
