# Java WildFly — Elytron OIDC Subsystem

Jakarta EE servlet secured using WildFly's built-in Elytron OIDC subsystem (no extra Keycloak adapter needed).

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
