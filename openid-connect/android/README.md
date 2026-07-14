# Android — AppAuth SDK (OIDC)

Native Android app (Kotlin) using the `AppAuth-Android` library for Keycloak OIDC login.

## Keycloak Client Setup

Create client `android-client` in the `utdallas-cs` realm:

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client authentication | OFF (public) |
| Standard flow | ON |
| PKCE | S256 (Advanced tab) |
| Valid redirect URIs | `com.example.keycloakdemo:/oauth2redirect` |

No client secret needed (public client with PKCE).

## Run

1. Open `openid-connect/android/` in Android Studio
2. Sync Gradle
3. Run on emulator or device (API 24+)
4. Tap **Login with Keycloak** → browser opens Keycloak login
5. After login → browser redirects back to app via custom URI scheme
6. User info fetched from `/userinfo` endpoint and displayed

## How It Works

1. `AppAuth` fetches OIDC config from discovery URL
2. `AuthorizationRequest` built with PKCE code challenge (S256)
3. `AuthorizationService.getAuthorizationRequestIntent()` opens Custom Tabs (browser)
4. Keycloak login → redirect to `com.example.keycloakdemo:/oauth2redirect`
5. `RedirectUriReceiverActivity` (registered in AppAuth) catches the redirect
6. Code exchanged for tokens → access token used to call `/userinfo`

## Files

| File | Purpose |
|---|---|
| `MainActivity.kt` | Login/logout logic + AppAuth flow |
| `auth_config.json` | AppAuth configuration (discovery URL, client ID, redirect URI) |
| `AndroidManifest.xml` | App manifest + redirect URI intent filter |
| `app/build.gradle` | AppAuth dependency |
