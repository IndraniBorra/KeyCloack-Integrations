# Keycloak Client Configuration Guide

**Keycloak Admin URL:** https://auth.savvytechies.com
**Realm:** `utdallas-cs`
**OIDC Discovery:** https://auth.savvytechies.com/realms/utdallas-cs/.well-known/openid-configuration

---

## How to Create a Client

1. Log in to https://auth.savvytechies.com/admin
2. Select realm **utdallas-cs**
3. Go to **Clients** → **Create client**
4. Follow the settings below for each integration

---

## OIDC Clients

### 1. `js-client` — JavaScript (Keycloak JS Adapter)

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client ID | `js-client` |
| Client authentication | OFF (public) |
| Standard flow | ON |
| Direct access grants | OFF |
| Valid redirect URIs | `http://localhost:3000/*` |
| Valid post logout redirect URIs | `http://localhost:3000/*` |
| Web origins | `http://localhost:3000` |
| PKCE | S256 (set in Advanced → Proof Key for Code Exchange) |

---

### 2. `react-client` — React (keycloak-js + Vite)

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client ID | `react-client` |
| Client authentication | OFF (public) |
| Standard flow | ON |
| Direct access grants | OFF |
| Valid redirect URIs | `http://localhost:3001/*` |
| Valid post logout redirect URIs | `http://localhost:3001/*` |
| Web origins | `http://localhost:3001` |
| PKCE | S256 (set in Advanced → Proof Key for Code Exchange) |

---

### 3. `nodejs-client-2` — Node.js (keycloak-connect)

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client ID | `nodejs-client-2` |
| Client authentication | ON (confidential) |
| Standard flow | ON |
| Valid redirect URIs | `http://localhost:4000/*` |
| Valid post logout redirect URIs | `http://localhost:4000/*` |
| Web origins | `http://localhost:4000` |

After saving, copy the **Client Secret** from the **Credentials** tab.

---

### 4. `springboot-client` — Spring Boot

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client ID | `springboot-client` |
| Client authentication | ON (confidential) |
| Standard flow | ON |
| Valid redirect URIs | `http://localhost:8081/login/oauth2/code/keycloak` |
| Valid post logout redirect URIs | `http://localhost:8081/*` |
| Web origins | `http://localhost:8081` |

---

### 5. `wildfly-elytron-client` — Java WildFly Elytron

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client ID | `wildfly-elytron-client` |
| Client authentication | ON (confidential) |
| Standard flow | ON |
| Valid redirect URIs | `http://localhost:8082/*` |
| Valid post logout redirect URIs | `http://localhost:8082/*` |
| Web origins | `http://localhost:8082` |

---

### 6. `python-client` — Python Flask

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client ID | `python-client` |
| Client authentication | ON (confidential) |
| Standard flow | ON |
| Valid redirect URIs | `http://localhost:5000/callback` |
| Valid post logout redirect URIs | `http://localhost:5000/` |
| Web origins | `http://localhost:5000` |

---

### 7. `csharp-client` — C# ASP.NET Core (OWIN)

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client ID | `csharp-client` |
| Client authentication | ON (confidential) |
| Standard flow | ON |
| Valid redirect URIs | `http://localhost:5001/signin-oidc` |
| Valid post logout redirect URIs | `http://localhost:5001/signout-callback-oidc` |
| Web origins | `http://localhost:5001` |

---

### 8. `android-client` — Android (AppAuth)

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client ID | `android-client` |
| Client authentication | OFF (public) |
| Standard flow | ON |
| Valid redirect URIs | `com.example.keycloakdemo:/oauth2redirect` |
| PKCE | S256 |

---

### 9. `ios-client` — iOS (AppAuth)

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client ID | `ios-client` |
| Client authentication | OFF (public) |
| Standard flow | ON |
| Valid redirect URIs | `com.example.keycloakdemo:/oauth2redirect` |
| PKCE | S256 |

---

### 10. `apache-oidc-client` — Apache mod_auth_openidc

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client ID | `apache-oidc-client` |
| Client authentication | ON (confidential) |
| Standard flow | ON |
| Valid redirect URIs | `http://localhost:8083/redirect_uri` |
| Valid post logout redirect URIs | `http://localhost:8083/` |
| Web origins | `http://localhost:8083` |

---

## SAML Clients

### 11. `wildfly-saml-client` — Java WildFly SAML

| Setting | Value |
|---|---|
| Client type | SAML |
| Client ID | `http://localhost:8084/demo-saml/` |
| Name ID format | username |
| Valid redirect URIs | `http://localhost:8084/*` |
| Master SAML Processing URL | `http://localhost:8084/demo-saml/` |
| Sign assertions | ON |
| Encrypt assertions | OFF |

After saving, go to **Keys** tab → export the **IdP certificate** (needed for `keycloak-saml.xml`).

---

### 12. `apache-mellon-client` — Apache mod_auth_mellon

| Setting | Value |
|---|---|
| Client type | SAML |
| Client ID | `http://localhost:8085/secure/` |
| Name ID format | email |
| Valid redirect URIs | `http://localhost:8085/*` |
| Master SAML Processing URL | `http://localhost:8085/secure/postResponse` |
| Sign assertions | ON |

---

## Test Users

Create these users in **utdallas-cs** realm under **Users**:

| Username | Password | Role |
|---|---|---|
| `testuser` | `Test@1234` | `user` |
| `adminuser` | `Admin@1234` | `admin` |

To create roles: **Realm roles** → **Create role** → `user` and `admin`.
Then assign roles: **Users** → select user → **Role mapping** → **Assign role**.
