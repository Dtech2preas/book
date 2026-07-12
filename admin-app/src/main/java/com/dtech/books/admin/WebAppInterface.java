package com.dtech.books.admin;

import android.content.Context;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import com.google.firebase.messaging.FirebaseMessaging;

public class WebAppInterface {
    Context mContext;
    MainActivity mActivity;

    WebAppInterface(Context c, MainActivity activity) {
        mContext = c;
        mActivity = activity;
    }

    @JavascriptInterface
    public void getFcmToken() {
        FirebaseMessaging.getInstance().getToken()
            .addOnCompleteListener(task -> {
                if (!task.isSuccessful()) {
                    Log.w("WebAppInterface", "Fetching FCM registration token failed", task.getException());
                    return;
                }

                // Get new FCM registration token
                String token = task.getResult();

                // Save it for JS to pick up or push it directly via JS callback
                mActivity.runOnUiThread(() -> {
                    mActivity.sendTokenToWeb(token);
                });
            });
    }
}
