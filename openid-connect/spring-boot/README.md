# Spring Boot — Spring Security OAuth2 Client (OIDC)

Spring Boot 3 integration using `spring-boot-starter-oauth2-client`.

## Keycloak Client Setup

Create client `springboot-client` in the `utdallas-cs` realm:

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client authentication | ON (confidential) |
| Standard flow | ON |
| Valid redirect URIs | `http://localhost:8081/login/oauth2/code/keycloak` |
| Valid post logout redirect URIs | `http://localhost:8081/*` |
| Web origins | `http://localhost:8081` |

Copy the **Client Secret** from the **Credentials** tab.

## Configure

Edit `src/main/resources/application.yml`:
```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          keycloak:
            client-secret: YOUR_ACTUAL_CLIENT_SECRET
```

## Run

```bash
./mvnw spring-boot:run
```

Then open http://localhost:8081

## Routes

| Route | Access |
|---|---|
| `/` | Public (shows login/logout based on state) |
| `/public` | Public |
| `/profile` | Any authenticated user |
| `/admin` | `admin` realm role required |
| `/logout` | Clears session + Keycloak logout |

## How It Works

1. Spring Security auto-registers Keycloak as an OAuth2 provider using `issuer-uri` discovery
2. `/oauth2/authorization/keycloak` triggers the login flow
3. Keycloak realm roles are extracted from `realm_access.roles` in the ID token and mapped to Spring `ROLE_` authorities
4. `@PreAuthorize("hasRole('admin')")` enforces role-based access
