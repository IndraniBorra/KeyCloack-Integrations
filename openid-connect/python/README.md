# Python — Flask + Authlib (OIDC)

Server-side Flask integration using `Authlib` as the OIDC client.

## Keycloak Client Setup

Create client `python-client` in the `utdallas-cs` realm:

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client authentication | ON (confidential) |
| Standard flow | ON |
| Valid redirect URIs | `http://localhost:5000/callback` |
| Valid post logout redirect URIs | `http://localhost:5000/` |
| Web origins | `http://localhost:5000` |

Copy the **Client Secret** from the **Credentials** tab.

## Configure

```bash
cp .env.example .env
# Edit .env and set KEYCLOAK_CLIENT_SECRET to your actual secret
```

## Run

```bash
python3 -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Then open http://localhost:5000

## Routes

| Route | Access |
|---|---|
| `/` | Public |
| `/login` | Redirects to Keycloak |
| `/callback` | OAuth2 callback, stores token in session |
| `/profile` | Login required |
| `/admin` | `admin` realm role required |
| `/logout` | Clears session + Keycloak logout |

## How It Works

1. `/login` → `authlib` builds authorization URL and redirects to Keycloak
2. User authenticates on Keycloak
3. Keycloak redirects to `/callback` with authorization code
4. `authlib` exchanges code for tokens, fetches userinfo
5. User info + roles stored in Flask session
6. `@login_required` / `@role_required` decorators protect routes
