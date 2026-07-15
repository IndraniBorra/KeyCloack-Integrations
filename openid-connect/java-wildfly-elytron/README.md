# Java WildFly — Elytron OIDC Subsystem  ✅ WORKING

Jakarta EE servlet secured using WildFly's built-in Elytron OIDC subsystem (no extra Keycloak
adapter needed). Verified end-to-end on WildFly 40 against realm `utdallas-cs` as `testuser`:
redirect to Keycloak → login → back to `/protected/profile` showing the username + access/ID tokens.

## Run (WildFly 40, JDK 21)
1. Put the real client secret in `src/main/webapp/WEB-INF/oidc.json` (`credentials.secret`).
   `oidc.json` also sets `"principal-attribute": "preferred_username"` so the page shows the
   username instead of the `sub` UUID.
2. Build and deploy:
```bash
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.9/libexec/openjdk.jdk/Contents/Home
mvn clean package
cp target/demo-oidc.war $WILDFLY_HOME/standalone/deployments/
$WILDFLY_HOME/bin/standalone.sh -Djboss.socket.binding.port-offset=2   # -> http://localhost:8082
```
Open http://localhost:8082/demo-oidc/protected/profile and log in as `testuser` / `Test@1234`.

> **Running it alongside the WildFly SAML app?** They use different ports (8082 vs 8084), so run a
> second WildFly instance from the same install with its own base dir:
> `cp -r $WILDFLY_HOME/standalone $WILDFLY_HOME/standalone-oidc` then start with
> `-Djboss.server.base.dir=$WILDFLY_HOME/standalone-oidc -Djboss.socket.binding.port-offset=2`.

## Note: role gate
`/protected/*` is set to `**` (any authenticated user), matching the other OIDC demo apps. To
demo role-based access instead, add realm roles and list them in `web.xml`'s `<auth-constraint>`.


## Keycloak Client Setup

Create client `wildfly-elytron-client` in the `utdallas-cs` realm:

| Setting | Value |
|---|---|
| Client type | OpenID Connect |
| Client authentication | ON (confidential) |
| Standard flow | ON |
| Valid redirect URIs | `http://localhost:8082/*` |
| Web origins | `http://localhost:8082` |

Copy the **Client Secret** from **Credentials** tab and update `src/main/webapp/WEB-INF/oidc.json`.

## Configure

Edit `src/main/webapp/WEB-INF/oidc.json`:
```json
{
  "credentials": {
    "secret": "YOUR_ACTUAL_CLIENT_SECRET"
  }
}
```

## Build & Deploy

```bash
# Build WAR
mvn clean package

# Deploy to WildFly (WildFly 27+ required)
cp target/demo-oidc.war $WILDFLY_HOME/standalone/deployments/

# Start WildFly
$WILDFLY_HOME/bin/standalone.sh
```

Then open http://localhost:8082/demo-oidc/

## How It Works

- WildFly Elytron OIDC subsystem reads `WEB-INF/oidc.json`
- `web.xml` sets `auth-method` to `OIDC` and declares security constraints
- Accessing `/protected/*` triggers redirect to Keycloak login
- After login, `req.getUserPrincipal()` and `req.isUserInRole()` work natively
- No extra libraries needed — it's built into WildFly 27+

## Note on WildFly Elytron vs Legacy Keycloak Adapter

WildFly 27+ has native OIDC support via the Elytron subsystem. The old `keycloak-wildfly-adapter` is deprecated. This demo uses the modern approach.
