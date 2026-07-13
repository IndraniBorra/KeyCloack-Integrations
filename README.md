# KeyCloack-Integrations

This repository now tracks a complete set of Keycloak integration targets across OpenID Connect (OIDC) and SAML, including the requested adapters and application types.

## OpenID Connect integrations

| Platform | Adapter / Library | Application types to build |
| --- | --- | --- |
| Java | Java OIDC integration | Web app, REST API |
| WildFly Elytron OIDC | WildFly Elytron OIDC | Enterprise web app, service app |
| Spring Boot | Spring Security OAuth2 / OIDC | Web app, REST API, microservice |
| JavaScript (client-side) | Keycloak JS adapter | SPA, browser app |
| Node.js (server-side) | Keycloak Node.js adapter | Backend API, server-rendered app |
| C# | OWIN | ASP.NET app, API |
| Python | `oidc` | Flask/FastAPI web app, API |
| Android | AppAuth | Native mobile app |
| iOS | AppAuth | Native mobile app |
| Apache HTTP Server | `mod_auth_openidc` | Reverse proxy, protected website |

## SAML integrations

| Platform | Adapter / Module | Application types to build |
| --- | --- | --- |
| Java | Keycloak SAML Galleon feature pack for WildFly and EAP | Enterprise Java web app |
| Apache HTTP Server | `mod_auth_mellon` | SAML-protected website, reverse proxy |

## Target coverage checklist

- [x] OpenID Connect
  - [x] Java
  - [x] WildFly Elytron OIDC
  - [x] Spring Boot
  - [x] JavaScript (Keycloak JS adapter)
  - [x] Node.js (Keycloak Node.js adapter)
  - [x] C# (OWIN)
  - [x] Python (`oidc`)
  - [x] Android (AppAuth)
  - [x] iOS (AppAuth)
  - [x] Apache HTTP Server (`mod_auth_openidc`)
- [x] SAML
  - [x] Java (Keycloak SAML Galleon feature pack for WildFly and EAP)
  - [x] Apache HTTP Server (`mod_auth_mellon`)