# Apache HTTP Server — mod_auth_openidc (OIDC)  ✅ WORKING

Apache httpd with `mod_auth_openidc` acting as an OIDC Relying Party (RP) in front of Keycloak.
Verified end-to-end: `/secure/` redirects to Keycloak, login as `testuser` returns to the
protected page (mod_auth_openidc sets `REMOTE_USER` + `OIDC_CLAIM_*` headers).

## Docker daemon
If Docker Desktop's engine won't start (it was broken on the build machine — 500 on `_ping`),
use **Colima** as the daemon instead:
```bash
brew install colima docker-compose
colima start --cpu 2 --memory 2
docker context use colima
```

## Run
1. Put the client secret in `oidc.conf` (`OIDCClientSecret`) and a random 32-char
   `OIDCCryptoPassphrase`.
2. `docker compose up --build -d`  (serves on http://localhost:8083)
3. Public: http://localhost:8083/public/  ·  Protected: http://localhost:8083/secure/

## Fixes applied (were missing / needed)
- **`Listen 8083`** added to `oidc.conf` — Debian's `ports.conf` only has `Listen 80`, so the
  `<VirtualHost *:8083>` never bound without it (connection refused on 8083).
- **`ca-certificates`** added to the `Dockerfile` — `debian:bookworm-slim` ships without it, so
  mod_auth_openidc's HTTPS call to Keycloak's discovery URL failed (`error setting certificate
  file`), returning 500 on `/secure/`.


## Keycloak Client Setup

Create client `apache-oidc-client` in the `utdallas-cs` realm:

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client authentication | ON (confidential) |
| Standard flow | ON |
| Valid redirect URIs | `http://localhost:8083/redirect_uri` |
| Valid post logout redirect URIs | `http://localhost:8083/public/` |
| Web origins | `http://localhost:8083` |

Copy the **Client Secret** from **Credentials** tab.

## Configure

Edit `oidc.conf` — replace `REPLACE_WITH_YOUR_CLIENT_SECRET` with the actual secret.

Also update `OIDCCryptoPassphrase` to a random 32-char string.

## Run

```bash
docker-compose up --build
```

Then visit:
- Public page: http://localhost:8083/public/
- Protected page: http://localhost:8083/secure/ (triggers Keycloak login)

## How It Works

1. Apache loads `mod_auth_openidc`
2. `OIDCProviderMetadataURL` auto-discovers Keycloak endpoints
3. On request to `/secure`, module checks for valid OIDC session
4. If none → redirect to Keycloak login (`OIDCRedirectURI` handles callback)
5. After login → OIDC claims exposed as `OIDC_CLAIM_*` env vars and response headers
6. `REMOTE_USER` is set to `preferred_username`

## Files

| File | Purpose |
|---|---|
| `oidc.conf` | Apache + mod_auth_openidc configuration |
| `Dockerfile` | Apache image with mod_auth_openidc |
| `public/` | Public HTML served without auth |
| `secure/` | Protected HTML — requires Keycloak login |
