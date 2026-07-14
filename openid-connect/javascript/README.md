# JavaScript — Keycloak JS Adapter (OIDC)

Client-side vanilla JS integration using the official `keycloak-js` adapter.

## Keycloak Client Setup

Create client `js-client` in the `utdallas-cs` realm:

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client authentication | OFF (public) |
| Standard flow | ON |
| Valid redirect URIs | `http://localhost:3000/*` |
| Valid post logout redirect URIs | `http://localhost:3000/*` |
| Web origins | `http://localhost:3000` |
| PKCE Method | S256 (Advanced tab) |

## Run

```bash
npx http-server . -p 3000 --cors
```

Then open http://localhost:3000

## How It Works

1. Page loads → `keycloak.init({ onLoad: 'check-sso' })` checks for existing session silently
2. Click **Login** → redirected to Keycloak login page
3. After login → redirected back with authorization code
4. `keycloak-js` exchanges code for tokens automatically
5. Token parsed client-side → user name, email, roles displayed
6. Token auto-refreshed before expiry via `onTokenExpired` hook

## Files

| File | Purpose |
|---|---|
| `index.html` | Main UI |
| `app.js` | Keycloak init + token parsing logic |
| `keycloak.json` | Keycloak adapter config |
| `silent-check-sso.html` | Silent SSO iframe page |
