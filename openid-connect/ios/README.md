# iOS — AppAuth SDK (OIDC)

Native iOS app (Swift/SwiftUI) using `AppAuth-iOS` for Keycloak OIDC login.

## Keycloak Client Setup

Create client `ios-client` in the `utdallas-cs` realm:

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client authentication | OFF (public) |
| Standard flow | ON |
| PKCE | S256 (Advanced tab) |
| Valid redirect URIs | `com.example.keycloakdemo:/oauth2redirect` |

No client secret needed (public client with PKCE).

## Run

> **Note:** `Package.swift` is only for declaring the AppAuth SPM dependency. You cannot run an iOS app from a Swift Package alone — you need an Xcode project (`.xcodeproj`).

1. **Create a new Xcode project** → iOS → App (SwiftUI), bundle ID: `com.example.keycloakdemo`
2. Copy the Swift files from `KeycloakDemo/` into your Xcode project
3. Add **AppAuth-iOS** via SPM: File → Add Package Dependencies → `https://github.com/openid/AppAuth-iOS`
4. Configure URL scheme in **Info.plist** (see below)
5. Run on iOS simulator (iOS 16+) or device
6. Tap **Login with Keycloak** → SFSafariViewController opens Keycloak
7. After login → redirect back to app, user info + tokens displayed

## Info.plist URL Scheme

Add this to your `Info.plist` to handle the redirect:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.example.keycloakdemo</string>
    </array>
  </dict>
</array>
```

## How It Works

1. `OIDAuthorizationService.discoverConfiguration` fetches OIDC endpoints from discovery URL
2. `OIDAuthorizationRequest` built with PKCE (automatic in AppAuth-iOS)
3. `OIDAuthState.authState(byPresenting:)` opens SFSafariViewController for Keycloak login
4. After login → Keycloak redirects to `com.example.keycloakdemo:/oauth2redirect`
5. App handles URL via `onOpenURL` → `AppAuthManager.handleRedirectURL`
6. Code exchanged for tokens → `/userinfo` endpoint called to get profile

## Files

| File | Purpose |
|---|---|
| `AppAuthManager.swift` | OIDC login/logout/userinfo logic |
| `ContentView.swift` | SwiftUI UI |
| `KeycloakDemoApp.swift` | App entry + redirect URL handler |
| `Package.swift` | SPM dependency (AppAuth-iOS) |
