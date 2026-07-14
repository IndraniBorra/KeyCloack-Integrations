# React — Keycloak OIDC Integration

Client-side React SPA using the official `keycloak-js` adapter with Vite.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3001

## Keycloak Client Settings

| Setting | Value |
|---|---|
| Client ID | `react-client` |
| Client type | OpenID Connect |
| Client authentication | OFF (public) |
| Standard flow | ON |
| Direct access grants | OFF |
| Valid redirect URIs | `http://localhost:3001/*` |
| Post logout redirect URIs | `http://localhost:3001/*` |
| Web origins | `http://localhost:3001` |
| PKCE | S256 |

## How It Works

1. Page loads → `keycloak.init({ onLoad: 'check-sso' })` checks for existing session silently
2. Click Login → redirected to Keycloak login page
3. After login → redirected back with authorization code
4. `keycloak-js` exchanges code for tokens automatically (PKCE S256)
5. Token parsed → user name, email, roles displayed in React state
6. Token auto-refreshed before expiry via `onTokenExpired` hook
