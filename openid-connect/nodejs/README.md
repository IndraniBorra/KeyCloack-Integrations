# Node.js — Keycloak Connect (OIDC)

Server-side Express.js integration using the official `keycloak-connect` adapter.

## Keycloak Client Setup

Create client `nodejs-client` in the `utdallas-cs` realm:

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client authentication | ON (confidential) |
| Standard flow | ON |
| Valid redirect URIs | `http://localhost:4000/*` |
| Web origins | `http://localhost:4000` |

Copy the **Client Secret** from the **Credentials** tab and paste it into `keycloak.json`.

## Configure

Edit `keycloak.json`:
```json
{
  "credentials": {
    "secret": "YOUR_ACTUAL_CLIENT_SECRET_HERE"
  }
}
```

## Run

```bash
npm install
npm start
```

Then open http://localhost:4000

## Routes

| Route | Access |
|---|---|
| `/` | Public |
| `/protected` | Any authenticated user |
| `/admin` | Users with `admin` realm role only |
| `/logout` | Clears session and redirects to Keycloak logout |

## How It Works

1. `keycloak-connect` middleware intercepts protected routes
2. If not authenticated → redirected to Keycloak login
3. After login → token stored in server-side session
4. `keycloak.protect()` validates session on each request
5. `keycloak.protect('realm:admin')` additionally checks realm roles
