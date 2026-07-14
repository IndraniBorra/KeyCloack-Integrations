# Apache HTTP Server — mod_auth_openidc (OIDC)

Apache httpd with `mod_auth_openidc` acting as an OIDC Relying Party (RP) in front of Keycloak.

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
