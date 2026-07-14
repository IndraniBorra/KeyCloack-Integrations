# Keycloak Integrations

Live Keycloak server: `https://auth.savvytechies.com` | Realm: `utdallas-cs`

## Project Structure

```
KeyCloack/
├── keycloak-setup/               # Client config guide for all 12 integrations
│
├── openid-connect/
│   ├── javascript/               # Vanilla JS + keycloak-js adapter     → port 3000
│   ├── react/                    # React + keycloak-js (Vite)           → port 3001
│   ├── nodejs/                   # Express.js + keycloak-connect         → port 4000
│   ├── python/                   # Flask + Authlib OIDC                  → port 5000
│   ├── spring-boot/              # Spring Boot 3 + spring-security       → port 8081
│   ├── java-wildfly-elytron/     # Jakarta EE + WildFly Elytron OIDC    → port 8082
│   ├── csharp-owin/              # ASP.NET Core + OIDC middleware        → port 5001
│   ├── apache-mod_auth_openidc/  # Apache httpd + mod_auth_openidc      → port 8083
│   ├── android/                  # Android Kotlin + AppAuth SDK
│   └── ios/                      # iOS Swift/SwiftUI + AppAuth SDK
│
└── saml/
    ├── java-wildfly-saml/        # WildFly + Keycloak SAML Galleon      → port 8084
    └── apache-mod_auth_mellon/   # Apache httpd + mod_auth_mellon       → port 8085
```

## Quick Start

### 1. Create Keycloak Clients
See [`keycloak-setup/clients-guide.md`](keycloak-setup/clients-guide.md) for exact settings.

### 2. Run Each App

| App | Command | URL |
|---|---|---|
| JavaScript | `npx http-server . -p 3000` | http://localhost:3000 |
| React | `npm install && npm run dev` | http://localhost:3001 |
| Node.js | `npm install && npm start` | http://localhost:4000 |
| Python | `pip install -r requirements.txt && python app.py` | http://localhost:5000 |
| Spring Boot | `./mvnw spring-boot:run` | http://localhost:8081 |
| WildFly Elytron | Deploy WAR to WildFly | http://localhost:8082/demo-oidc |
| C# OWIN | `dotnet run --urls http://localhost:5001` | http://localhost:5001 |
| Apache OIDC | `docker-compose up --build` | http://localhost:8083 |
| Android | Open in Android Studio, run | Emulator/Device |
| iOS | Open in Xcode, run | Simulator/Device |
| WildFly SAML | Deploy WAR to WildFly | http://localhost:8084/demo-saml |
| Apache SAML | `docker-compose up --build` | http://localhost:8085 |

## OIDC Discovery URL
```
https://auth.savvytechies.com/realms/utdallas-cs/.well-known/openid-configuration
```

## SAML Metadata URL
```
https://auth.savvytechies.com/realms/utdallas-cs/protocol/saml/descriptor
```



  1. javascript/ — Vanilla JS (keycloak-js) ← done
  2. react/ — React + keycloak-js (Vite) ← done
  3. nodejs/ — Express.js (keycloak-connect) ← need to regenerate the client secret.
  4. python/ — Flask (Authlib) ← done
  5. spring-boot/ — Spring Security ← done
  6. java-wildfly-elytron/ — WildFly Elytron ← need to create roles: user and admin
  7. csharp-owin/ — ASP.NET Core ← done
  8. apache-mod_auth_openidc/ — Apache ← cant find secret, need to install docker, client is created.
  9. android/ — Kotlin (AppAuth) ← needs Android Studio installed 2gb, client is created
  10. ios/ — Swift (AppAuth) ← need to install XBOX 12gb

  1. apache-mod-auth_mellon/ ← needs keyclaock admin console access
  2. java-wildfly-saml/ ← needs docker
  




  ask mavaya tmrw:
  - NodeJS: i need to regenerate the client secret for nodejs things to chekc wheather its working or not.
  - Java Wildfly-eletyron: The issue is that your testuser needs the user realm role in Keycloak. The servlet requires either user or admin role.
    ```
        Two things to check:

        1. Do the realm roles user and admin exist? In your Keycloak cluster:
        ▎ List realm roles in utdallas-cs
        2. Is testuser assigned the user role?
        ▎ Show role mappings for user testuser in realm utdallas-cs

        If the roles don't exist yet, create them:
        ▎ Create realm role user in utdallas-cs
        ▎ Create realm role admin in utdallas-cs
        ▎ Assign role user to user testuser in utdallas-cs
        ▎ Assign role admin to user adminuser in utdallas-cs

        The clients-guide.md mentions these test users and roles at the bottom — they need to be set up for role-based access to work across
        all apps.

    ```

  - IOS: need to install XBOX of 12GB
  - Apache: tHERE IS NO SECRET KEY avaliable in client's tab, need to install Docker, client is created already.
  - Android: need to download android studio installed, 2gb, client created
  - Apache Mod Auth Mellon: needs access to keycloack admin console page
  - Java Wildfly SAML: needs docker
