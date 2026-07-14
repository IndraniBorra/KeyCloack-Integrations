# C# — ASP.NET Core OIDC (OWIN-style)

ASP.NET Core 8 integration using `Microsoft.AspNetCore.Authentication.OpenIdConnect`.

> Note: "OWIN" refers to the middleware pipeline concept. In .NET Core, this is implemented via `AddOpenIdConnect` middleware — the modern equivalent of the classic OWIN OIDC middleware.

## Keycloak Client Setup

Create client `csharp-client` in the `utdallas-cs` realm:

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client authentication | ON (confidential) |
| Standard flow | ON |
| Valid redirect URIs | `http://localhost:5001/signin-oidc` |
| Valid post logout redirect URIs | `http://localhost:5001/signout-callback-oidc` |
| Web origins | `http://localhost:5001` |

Copy the **Client Secret** from **Credentials** tab.

## Configure

Edit `appsettings.json`:
```json
{
  "Keycloak": {
    "ClientSecret": "YOUR_ACTUAL_CLIENT_SECRET"
  }
}
```

## Run

```bash
dotnet run --urls http://localhost:5001
```

Then open http://localhost:5001

## Routes

| Route | Access |
|---|---|
| `/` | Public |
| `/login` | Triggers OIDC challenge |
| `/profile` | Any authenticated user (`[Authorize]`) |
| `/admin` | `admin` role required (`[Authorize(Roles = "admin")]`) |
| `/logout` | Cookie + OIDC logout |

## How It Works

1. `AddOpenIdConnect` middleware auto-discovers endpoints via `Authority/.well-known/openid-configuration`
2. Login flow: `/login` → Keycloak → `/signin-oidc` (callback) → cookie issued
3. Keycloak `realm_access.roles` are extracted from the access token JWT and added as `ClaimTypes.Role` claims
4. `[Authorize(Roles = "admin")]` checks role claims on the principal
