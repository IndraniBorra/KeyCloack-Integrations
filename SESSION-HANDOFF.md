# Session Handoff — Keycloak Integrations Project

## Project Overview
Building 12 Keycloak integration demo apps (9 OIDC + 2 SAML + 1 React) across multiple frameworks. All apps authenticate against a live Keycloak server.

## Server Details
- **Keycloak URL**: https://auth.savvytechies.com
- **Realm**: `utdallas-cs`
- **OIDC Discovery**: https://auth.savvytechies.com/realms/utdallas-cs/.well-known/openid-configuration
- **Test Users**: `testuser` / `Test@1234` (role: user), `adminuser` / `Admin@1234` (role: admin)
- **Keycloak management**: via a Keycloak cluster tool (not direct admin console access) — it can create OIDC clients but NOT SAML clients

## Project Location
`/Users/indraniborra/KeyCloack/` (git repo, pushed to GitHub)

---

## Integration Status

### DONE (5 apps — fully working)
| App | Client ID | Port | Type | Notes |
|-----|-----------|------|------|-------|
| JavaScript | `js-client` | 3000 | Public | keycloak-js, PKCE S256 |
| React | `react-client` | 3001 | Public | keycloak-js + Vite, PKCE S256 |
| Python | `python-client` | 5000 | Confidential | Flask + Authlib, secret in `.env` |
| Spring Boot | `springboot-client` | 8081 | Confidential | Spring Security oauth2-client |
| C# ASP.NET | `csharp-client` | 5001 | Confidential | .NET 8 + OpenIdConnect middleware |

### IN PROGRESS — Needs Fixes
| App | Client ID | Port | Issue |
|-----|-----------|------|-------|
| **Node.js** | `nodejs-client-2` | 4000 | Rewrote to use `openid-client` (replaced deprecated `keycloak-connect`). Need to add `http://localhost:4000/callback` as redirect URI in Keycloak, then test. Secret: `jwUI1L2w2h6rlrpIjkREu1ZbLK2ObvD1` |
| **WildFly Elytron** | `wildfly-elytron-client` | 8082 | App deploys and runs on WildFly 40. Shows "Forbidden" because `testuser` lacks `user` realm role. Need to create realm roles `user` and `admin` and assign them to test users. WildFly installed at `~/wildfly-40.0.1.Final/` |

### BLOCKED — Needs Software Install or Access
| App | Client ID | Port | Blocker |
|-----|-----------|------|---------|
| **Apache OIDC** | `apache-oidc-client` | 8083 | Need Docker installed + can't find client secret (try regenerating) |
| **Android** | `android-client` | mobile | Need Android Studio (~2GB download) |
| **iOS** | `ios-client` | mobile | Need Xcode (~12GB download) |
| **WildFly SAML** | `wildfly-saml-client` | 8084 | Need Keycloak Admin Console access (cluster tool can't create SAML clients) |
| **Apache Mellon** | `apache-mellon-client` | 8085 | Need Docker + Keycloak Admin Console access for SAML client |

---

## Key Decisions Made
1. **All apps display raw Access Token + ID Token** after login (standard pattern)
2. **Node.js app was rewritten** from `keycloak-connect` (deprecated, caused 403 on token exchange) to `openid-client` library
3. **React app was added** (not in original plan) — uses Vite + keycloak-js on port 3001
4. **.gitignore added** to exclude node_modules, target/, .gradle/, .env, .DS_Store, bin/Debug/

## Key Files
- `keycloak-setup/clients-guide.md` — all 12 client configurations with exact Keycloak settings
- Each app has its own `README.md` with run instructions
- `openid-connect/nodejs/keycloak.json` — contains client secret (not gitignored, but should be)
- `openid-connect/python/.env` — contains client secret (gitignored)

## Installed Tools on This Machine
- **Node.js** + npm
- **Python 3** + pip + venv
- **Java** (JDK 17+) + Maven
- **.NET 8 SDK** (just installed)
- **WildFly 40.0.1.Final** at `~/wildfly-40.0.1.Final/`
- **NOT installed**: Docker, Xcode, Android Studio

## Next Steps (Priority Order)
1. **Node.js**: Add `http://localhost:4000/callback` redirect URI to `nodejs-client-2` in Keycloak, then test
2. **WildFly Elytron**: Create realm roles `user`/`admin`, assign to `testuser`/`adminuser`
3. **Apache OIDC**: Install Docker, regenerate client secret
4. **SAML clients**: Get admin console access to create SAML-type clients
5. **Mobile apps**: Install Xcode/Android Studio when ready

## How to Run Each Working App
```bash
# JavaScript
cd openid-connect/javascript && npx http-server . -p 3000 --cors

# React
cd openid-connect/react && npm run dev

# Python
cd openid-connect/python && source venv/bin/activate && python app.py

# Spring Boot
cd openid-connect/spring-boot && ./mvnw spring-boot:run

# C# ASP.NET Core
cd openid-connect/csharp-owin && dotnet run --urls http://localhost:5001

# Node.js (after fixing redirect URI)
cd openid-connect/nodejs && npm start

# WildFly Elytron (after fixing roles)
cp openid-connect/java-wildfly-elytron/target/demo-oidc.war ~/wildfly-40.0.1.Final/standalone/deployments/
~/wildfly-40.0.1.Final/bin/standalone.sh -Djboss.socket.binding.port-offset=2
```
