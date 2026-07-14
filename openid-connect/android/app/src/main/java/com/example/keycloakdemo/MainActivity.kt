package com.example.keycloakdemo

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import net.openid.appauth.*
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class MainActivity : AppCompatActivity() {

    private lateinit var authService: AuthorizationService
    private var authState: AuthState? = null

    private lateinit var btnLogin: Button
    private lateinit var btnLogout: Button
    private lateinit var tvStatus: TextView
    private lateinit var tvUserInfo: TextView
    private lateinit var tvTokens: TextView
    private lateinit var cardProfile: View
    private lateinit var cardTokens: View

    companion object {
        private const val TAG = "KeycloakDemo"
        private const val RC_AUTH = 100
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        authService = AuthorizationService(this)

        btnLogin    = findViewById(R.id.btn_login)
        btnLogout   = findViewById(R.id.btn_logout)
        tvStatus    = findViewById(R.id.tv_status)
        tvUserInfo  = findViewById(R.id.tv_user_info)
        tvTokens    = findViewById(R.id.tv_tokens)
        cardProfile = findViewById(R.id.card_profile)
        cardTokens  = findViewById(R.id.card_tokens)

        btnLogin.setOnClickListener { startLogin() }
        btnLogout.setOnClickListener { logout() }
    }

    private fun startLogin() {
        val config = AuthorizationServiceConfiguration.fetchFromIssuer(
            android.net.Uri.parse("https://auth.savvytechies.com/realms/utdallas-cs")
        ) { serviceConfig, ex ->
            if (serviceConfig == null) {
                Log.e(TAG, "Failed to fetch config: ${ex?.message}")
                tvStatus.text = "Error: ${ex?.message}"
                return@fetchFromIssuer
            }
            authState = AuthState(serviceConfig)

            val authRequest = AuthorizationRequest.Builder(
                serviceConfig,
                "android-client",
                ResponseTypeValues.CODE,
                android.net.Uri.parse("com.example.keycloakdemo:/oauth2redirect")
            )
                .setScopes("openid", "profile", "email")
                .setCodeVerifier(CodeVerifierUtil.generateRandomCodeVerifier()) // PKCE
                .build()

            val intent = authService.getAuthorizationRequestIntent(authRequest)
            startActivityForResult(intent, RC_AUTH)
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != RC_AUTH) return

        val response = AuthorizationResponse.fromIntent(data!!)
        val ex = AuthorizationException.fromIntent(data)

        authState?.update(response, ex)

        if (response != null) {
            exchangeCodeForToken(response)
        } else {
            Log.e(TAG, "Auth failed: ${ex?.message}")
            tvStatus.text = "Login failed: ${ex?.message}"
        }
    }

    private fun exchangeCodeForToken(response: AuthorizationResponse) {
        val tokenRequest = response.createTokenExchangeRequest()
        authService.performTokenRequest(tokenRequest) { tokenResponse, ex ->
            authState?.update(tokenResponse, ex)
            if (tokenResponse != null) {
                val at = tokenResponse.accessToken ?: "N/A"
                val idt = tokenResponse.idToken ?: "N/A"
                runOnUiThread {
                    tvStatus.text = "Authenticated"
                    btnLogin.visibility = View.GONE
                    btnLogout.visibility = View.VISIBLE
                    tvTokens.text = "Access Token:\n$at\n\nID Token:\n$idt"
                    cardTokens.visibility = View.VISIBLE
                }
                fetchUserInfo(at)
            } else {
                Log.e(TAG, "Token exchange failed: ${ex?.message}")
                runOnUiThread { tvStatus.text = "Token error: ${ex?.message}" }
            }
        }
    }

    private fun fetchUserInfo(accessToken: String) {
        thread {
            try {
                val url = URL("https://auth.savvytechies.com/realms/utdallas-cs/protocol/openid-connect/userinfo")
                val conn = url.openConnection() as HttpURLConnection
                conn.setRequestProperty("Authorization", "Bearer $accessToken")
                val body = conn.inputStream.bufferedReader().readText()
                val json = JSONObject(body)

                val info = buildString {
                    appendLine("Username: ${json.optString("preferred_username")}")
                    appendLine("Email:    ${json.optString("email", "N/A")}")
                    appendLine("Name:     ${json.optString("name", "N/A")}")
                    appendLine("Subject:  ${json.optString("sub")}")
                }

                runOnUiThread {
                    tvUserInfo.text = info
                    cardProfile.visibility = View.VISIBLE
                }
            } catch (e: Exception) {
                Log.e(TAG, "UserInfo failed: ${e.message}")
                runOnUiThread { tvUserInfo.text = "Failed to load profile: ${e.message}" }
            }
        }
    }

    private fun logout() {
        authState = null
        runOnUiThread {
            tvStatus.text = "Logged out"
            btnLogin.visibility = View.VISIBLE
            btnLogout.visibility = View.GONE
            cardProfile.visibility = View.GONE
            cardTokens.visibility = View.GONE
            tvUserInfo.text = ""
            tvTokens.text = ""
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        authService.dispose()
    }
}
