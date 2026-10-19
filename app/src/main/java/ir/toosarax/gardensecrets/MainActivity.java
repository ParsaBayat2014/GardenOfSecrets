package ir.toosarax.gardensecrets;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.IOException;

public final class MainActivity extends Activity {
    private WebView web;
    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        web = new WebView(this);
        web.setBackgroundColor(0xff102d2b);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) { return true; }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (!"https".equals(request.getUrl().getScheme()) || !"garden.local".equals(request.getUrl().getHost())) return new WebResourceResponse("text/plain", "UTF-8", null);
                String path = request.getUrl().getPath();
                if (path == null || path.contains("..")) return new WebResourceResponse("text/plain", "UTF-8", null);
                if (path.equals("/")) path = "/index.html";
                String mime = path.endsWith(".js") ? "application/javascript" : path.endsWith(".css") ? "text/css" : path.endsWith(".webp") ? "image/webp" : path.endsWith(".png") ? "image/png" : path.endsWith(".ttf") ? "font/ttf" : "text/html";
                try { return new WebResourceResponse(mime, "UTF-8", getAssets().open(path.substring(1))); }
                catch (IOException e) { return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", java.util.Collections.emptyMap(), null); }
            }
        });
        setContentView(web);
        web.loadUrl("https://garden.local/index.html");
    }
    @Override public void onBackPressed() { web.evaluateJavascript("window.Game && Game.back()", null); }
    @Override protected void onPause() { web.evaluateJavascript("window.Game && Game.pause()", null); web.onPause(); super.onPause(); }
    @Override protected void onResume() { super.onResume(); if (web != null) web.onResume(); }
    @Override public void onWindowFocusChanged(boolean focus) { super.onWindowFocusChanged(focus); if(focus) getWindow().getDecorView().setSystemUiVisibility(5894); }
}
