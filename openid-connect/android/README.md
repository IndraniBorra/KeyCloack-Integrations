# Android — AppAuth SDK (OIDC)  ✅ WORKING

Native Android app (Kotlin) using the `AppAuth-Android` library for Keycloak OIDC login
(Authorization Code + PKCE). Verified building, installing, launching on an Android 34 emulator,
and reaching the Keycloak login against realm `utdallas-cs`.

## Build & run from the command line (no Android Studio needed)
Requires the Android SDK. If you don't have it:
```bash
brew install --cask android-commandlinetools
export ANDROID_HOME=$HOME/Library/Android/sdk
yes | sdkmanager --sdk_root="$ANDROID_HOME" --licenses
sdkmanager --sdk_root="$ANDROID_HOME" "cmdline-tools;latest" "platform-tools" \
  "platforms;android-34" "build-tools;34.0.0" "emulator" \
  "system-images;android-34;google_apis;arm64-v8a"
```
This project ships `local.properties` (SDK path), `gradle.properties` (AndroidX on, Gradle daemon
pinned to JDK 21 — the system JDK 23 is too new for AGP 8.2.0), and a Gradle 8.7 wrapper.

```bash
cd openid-connect/android
./gradlew :app:assembleDebug                      # -> app/build/outputs/apk/debug/app-debug.apk

# create + boot an emulator
"$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager" create avd -n kc_pixel \
  -k "system-images;android-34;google_apis;arm64-v8a" -d pixel_6 --force
"$ANDROID_HOME/emulator/emulator" -avd kc_pixel -no-snapshot &
adb wait-for-device

# install + launch
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.example.keycloakdemo/.MainActivity
```
Tap **Login with Keycloak** → Chrome Custom Tab opens Keycloak → sign in as `testuser`/`Test@1234`
→ redirects back to the app via `com.example.keycloakdemo:/oauth2redirect` → profile + tokens show.

### Build notes (fixes applied)
- `app/build.gradle` sets `manifestPlaceholders = [appAuthRedirectScheme: 'com.example.keycloakdemo']`
  — **required** by AppAuth-Android (its `RedirectUriReceiverActivity` reads this scheme). Without it
  the manifest merger fails.
- The manual `RedirectUriReceiverActivity` was removed from `AndroidManifest.xml` (the library
  contributes it) along with the deprecated `package=` attribute (namespace lives in build.gradle).



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
