# Apache HTTP Server — mod_auth_mellon (SAML)

Apache httpd with `mod_auth_mellon` acting as a SAML Service Provider (SP) against Keycloak as IdP.

## Step 1 — Download Keycloak IdP Metadata

```bash
curl -o idp-metadata.xml \
  https://auth.savvytechies.com/realms/utdallas-cs/protocol/saml/descriptor
```

## Step 2 — Keycloak Client Setup

Create a **SAML** client in the `utdallas-cs` realm:

| Setting | Value |
|---|---|
| Client type | SAML |
| Client ID | `http://localhost:8085/secure/` |
| Name ID format | email |
| Valid redirect URIs | `http://localhost:8085/*` |
| Master SAML Processing URL | `http://localhost:8085/secure/postResponse` |
| Sign assertions | ON |
| Attribute mappers | Add: `preferred_username`, `email`, `Role` (realm roles) |

## Step 3 — Upload SP Metadata to Keycloak

After building the Docker image, get the SP metadata:
```bash
# The SP metadata is auto-generated at runtime by mod_auth_mellon
# Access after container starts:
curl http://localhost:8085/secure/?metadata
```
Upload the SP metadata XML to Keycloak Admin → Clients → Import.

## Run

```bash
docker-compose up --build
```

Then visit:
- Public: http://localhost:8085/public/
- Protected (SAML login): http://localhost:8085/secure/

## How It Works

1. Docker build generates SP keypair (`sp.key`, `sp.crt`) with `openssl`
2. `mellon.conf` configures SP entityID, keypair, IdP metadata, protected paths
3. Accessing `/secure` → mod_auth_mellon generates SAML AuthnRequest → POST to Keycloak
4. Keycloak validates credentials → POST SAML Response to `/secure/postResponse`
5. mod_auth_mellon validates signature → sets `MELLON_*` env vars + `REMOTE_USER`
6. Static HTML in `/secure/` is served; a real app would read env vars for user info

## Files

| File | Purpose |
|---|---|
| `mellon.conf` | Apache + mod_auth_mellon configuration |
| `Dockerfile` | Apache image + auto-generates SP keys |
| `idp-metadata.xml` | Keycloak IdP SAML metadata (replace with real one) |
| `public/` | Public HTML |
| `secure/` | Protected HTML — SAML login required |
