# React — Google Sign-In, direct (no Keycloak)

A React SPA that authenticates users straight against Google, using Google Identity Services via `@react-oauth/google`.

> **This is the odd one out in this repo.** Every other demo here authenticates against `https://auth.savvytechies.com`. This one does not use Keycloak at all — Google is the identity provider, the user store, and the token issuer. See [Comparison](#comparison-with-the-keycloak-demos) below.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3003

## Google Cloud Settings

Project `keycloak-sso-demo`, OAuth client `react-sso-user1`.

| Setting | Value |
|---|---|
| Client ID | `141199993343-pqdlj9d17blsgudrcgguvp5jg4odg4q2.apps.googleusercontent.com` |
| Application type | Web application |
| Authorized JavaScript origins | `http://localhost:3003` |
| Authorized redirect URIs | *(not used by this app)* |
| Client secret | *(not used by this app)* |

**Origins, not redirects.** Google Identity Services signs the user in via a popup and hands the ID token back to the page through JavaScript. There is no redirect back to the app, so the *Authorized redirect URIs* field is irrelevant here — only the origin matters. It must be the bare origin: no trailing slash, no path.

If sign-in fails with `origin_mismatch`, the origin above is missing or misspelled. Google warns changes can take "5 minutes to a few hours" to apply.

While the consent screen is in **testing** mode, only accounts listed under *Audience → Test users* can sign in.

## How It Works

1. `<GoogleOAuthProvider clientId={...}>` loads Google's Identity Services script
2. `<GoogleLogin>` renders Google's own button — its look is controlled by Google, not by this app
3. Click → popup → user picks a Google account and consents
4. `onSuccess(credentialResponse)` fires; `credentialResponse.credential` is the **ID token**, a JWT signed by Google
5. `jwt-decode` reads the claims — name, email, `iss`, `aud`, `exp` — which are rendered along with the raw JWT

There is **no access token** and no client secret. This app authenticates the user; it does not call Google APIs on their behalf, so it never needs one.

## Verifying the token

The app displays two claims worth understanding:

- **`iss`** is `https://accounts.google.com` — Google issued this token.
- **`aud`** is this app's Client ID. This is the one that matters: it proves the token was minted **for this app**. A token with a different `aud` is somebody else's and must be rejected.

In a real system a backend would verify the JWT's signature against Google's public keys before trusting any of it. This demo decodes without verifying, which is fine for displaying claims in the browser but is **not** authentication of a request — never trust a decoded JWT server-side without checking the signature, `aud`, and `exp`.

## Comparison with the Keycloak demos

| | This app | [`../react`](../react) |
|---|---|---|
| App talks to | Google | Keycloak only |
| Token `iss` | `accounts.google.com` | the Keycloak realm |
| User store | Google | Keycloak realm |
| Roles | none | realm roles |
| Add Microsoft/SAML/LDAP later | write a new integration | realm config change, no code |
| Setup | one JS origin | realm + client + IdP |

Neither is "correct" — they answer different questions. This app is the shortest path to "sign in with Google." The Keycloak version is the shortest path to "sign in with anything, and let me manage users centrally."
