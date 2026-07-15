# React — Keycloak OIDC with Google SSO (identity brokering)

Same `keycloak-js` + Vite setup as the [`react`](../react) demo, but the realm has **Google registered as an identity provider**, so users can sign in with a Google account.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3002

## Keycloak Client Settings

| Setting | Value |
|---|---|
| Realm | `utdallas-eng` |
| Client ID | `react-client-sso` |
| Client type | OpenID Connect |
| Client authentication | OFF (public) |
| Standard flow | ON |
| Direct access grants | OFF |
| Valid redirect URIs | `http://localhost:3002/*` |
| Post logout redirect URIs | `http://localhost:3002/*` |
| Web origins | `http://localhost:3002` |
| PKCE | S256 |

## Google Identity Provider

Registered on the realm with alias `google`. The Google OAuth client lives in Google Cloud Console (project `keycloak-sso-demo`) with this authorized redirect URI:

```
https://auth.savvytechies.com/realms/utdallas-eng/broker/google/endpoint
```

That URI must match verbatim — the realm name is part of the path, and Google rejects any callback not listed exactly.

While the Google consent screen is in **testing** mode, only accounts added under *Audience → Test users* can sign in.

## How It Works

1. Page loads → `keycloak.init({ onLoad: 'check-sso' })` checks for an existing session silently
2. Click **Login with Google** → `keycloak.login({ idpHint: 'google' })` redirects to Keycloak, which immediately forwards to Google
3. User authenticates with Google → Google redirects back to Keycloak's **broker endpoint** (not to this app)
4. Keycloak validates the Google response, creates or links a local user, then redirects here with its own authorization code
5. `keycloak-js` exchanges that code for tokens (PKCE S256)
6. Token parsed → name, email, roles, and issuer displayed

## The point of brokering

The app never talks to Google. It only ever speaks OIDC to Keycloak, exactly as the sibling demos do — Google is swappable for SAML, LDAP, or another OIDC provider without touching this code.

You can see this in the app's **Issuer (iss)** row: it reads `https://auth.savvytechies.com/realms/utdallas-eng`, *not* `accounts.google.com`. Keycloak brokered the Google login and minted its own token.

## Two login buttons

| Button | Call | Behavior |
|---|---|---|
| Login with Keycloak | `keycloak.login()` | Shows the Keycloak login page, with a *Sign in with Google* option on it |
| Login with Google | `keycloak.login({ idpHint: 'google' })` | Skips the Keycloak page, goes straight to Google |

`idpHint` matches the identity provider's alias.
