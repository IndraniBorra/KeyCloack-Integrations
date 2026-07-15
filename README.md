# Keycloak Integrations

Thirteen demo apps showing how to authenticate against Keycloak from different stacks — OIDC, SAML, web, mobile, and one deliberate counter-example that skips Keycloak entirely.

All apps authenticate against a live hosted Keycloak. There is no local Keycloak server in this repo.

| | |
| --- | --- |
| Keycloak server | `https://auth.savvytechies.com` |
| Realm | `utdallas-cs` |
| OIDC discovery | `https://auth.savvytechies.com/realms/utdallas-cs/.well-known/openid-configuration` |
| SAML metadata | `https://auth.savvytechies.com/realms/utdallas-cs/protocol/saml/descriptor` |

## Project Structure

```text
KeyCloackIntergations/
├── keycloak-setup/                  # Client config guide for every integration
│
├── openid-connect/
│   ├── javascript/                  # Vanilla JS + keycloak-js            → 3000
│   ├── react/                       # React + keycloak-js (Vite)          → 3001
│   ├── react-google-direct/         # React + Google, NO Keycloak         → 3003
│   ├── nodejs/                      # Express + openid-client             → 4000
│   ├── python/                      # Flask + Authlib                     → 5000
│   ├── csharp-owin/                 # ASP.NET Core + OIDC middleware      → 5001
│   ├── spring-boot/                 # Spring Boot 3 + Spring Security     → 8081
│   ├── java-wildfly-elytron/        # Jakarta EE + WildFly Elytron        → 8082
│   ├── apache-mod_auth_openidc/     # Apache httpd + mod_auth_openidc     → 8083
│   ├── android/                     # Kotlin + AppAuth SDK                → device
│   └── ios/                         # Swift/SwiftUI + AppAuth SDK         → simulator
│
└── saml/
    ├── java-wildfly-saml/           # WildFly + Keycloak SAML Galleon     → 8084
    └── apache-mod_auth_mellon/      # Apache httpd + mod_auth_mellon      → 8085
```

## Quick Start

**1. Create the Keycloak clients.** See [`keycloak-setup/clients-guide.md`](keycloak-setup/clients-guide.md) for exact settings per app.

**2. Run an app.** Each has its own README with details.

| App | Command | URL |
| --- | --- | --- |
| JavaScript | `npx http-server . -p 3000 --cors` | `http://localhost:3000` |
| React | `npm install && npm run dev` | `http://localhost:3001` |
| React + Google (direct) | `npm install && npm run dev` | `http://localhost:3003` |
| Node.js | `npm install && npm start` | `http://localhost:4000` |
| Python | `pip install -r requirements.txt && python app.py` | `http://localhost:5000` |
| C# ASP.NET Core | `dotnet run --urls http://localhost:5001` | `http://localhost:5001` |
| Spring Boot | `./mvnw spring-boot:run` | `http://localhost:8081` |
| WildFly Elytron | Deploy WAR to WildFly | `http://localhost:8082/demo-oidc` |
| Apache OIDC | `docker-compose up --build` | `http://localhost:8083` |
| Android | Open in Android Studio, run | Emulator / device |
| iOS | Open in Xcode, run | Simulator / device |
| WildFly SAML | Deploy WAR to WildFly | `http://localhost:8084/demo-saml` |
| Apache SAML | `docker-compose up --build` | `http://localhost:8085` |

## Status

| App | Status |
| --- | --- |
| javascript | Done |
| react | Done |
| react-google-direct | Done — pending a Google Cloud JavaScript origin for `http://localhost:3003` |
| nodejs | Done |
| python | Done |
| csharp-owin | Done |
| spring-boot | Done |
| apache-mod_auth_openidc | Done |
| android | Done |
| ios | Done |
| java-wildfly-saml | Done |
| java-wildfly-elytron | Blocked — realm roles `user` and `admin` don't exist yet (see [Open Items](#open-items)) |
| apache-mod_auth_mellon | Blocked — needs Keycloak admin console access |

## The odd one out: `react-google-direct`

Every other app here authenticates against Keycloak. This one signs in **straight against Google** using `@react-oauth/google`, with no realm, no broker, and no Keycloak at all.

It exists as a deliberate contrast:

| | `react-google-direct` | `react` |
| --- | --- | --- |
| App talks to | Google | Keycloak only |
| Token issuer (`iss`) | `accounts.google.com` | the Keycloak realm |
| User store | Google | Keycloak realm |
| Roles | none | realm roles |
| Add a second provider | write a new integration | realm config change, no code |

Neither is "correct" — they answer different questions. Direct-to-Google is the shortest path to "sign in with Google." Keycloak is the shortest path to "sign in with anything, and manage users centrally." See [`openid-connect/react-google-direct/README.md`](openid-connect/react-google-direct/README.md).

## Concepts: User vs Client vs Role

- **User** — an account that logs in; a person. Here: `testuser`, `adminuser`.
- **Client** — an application registered in Keycloak. Here: one per demo app.
- **Role** — a label attached to a user that says what access they have. Here: `user` (basic) and `admin` (elevated).

The confusing part is an unlucky naming coincidence: this project has a role literally named `user`. That role is **not** the same thing as a user account — it's just a string label meaning "standard access":

- `testuser` (the account) gets the `user` role → basic access
- `adminuser` (the account) gets the `admin` role → elevated access

App code checks `isUserInRole("user")` / `isUserInRole("admin")`, so the role names must be exactly those strings.

## Open Items

**Create the realm roles.** `java-wildfly-elytron` returns 403 because these don't exist yet. Via the Keycloak cluster tool:

```text
List realm roles in utdallas-cs
Show role mappings for user testuser in realm utdallas-cs
```

If they're missing:

```text
Create realm role user in utdallas-cs   (description: Standard access role for the demo apps)
Create realm role admin in utdallas-cs
Assign role user to user testuser in utdallas-cs
Assign role admin to user adminuser in utdallas-cs
```

**Other:**

- `apache-mod_auth_mellon` — needs Keycloak admin console access to create the SAML client.
- Device authorization grant (shell) — not started.
- `openid-connect/nodejs/keycloak.json` contains a client secret in plaintext and is committed. **Rotate it in Keycloak**; gitignoring alone won't remove it from history.
- `saml/java-wildfly-saml/.../keystore.jks` is gitignored (it holds a private key). Regenerate it with `keytool` on a fresh clone.
