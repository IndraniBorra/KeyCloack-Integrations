# Java WildFly — Keycloak SAML (Galleon Feature Pack)

Jakarta EE servlet secured via SAML using the Keycloak SAML adapter installed as a WildFly Galleon feature pack.

## Keycloak Client Setup

Create a **SAML** client in the `utdallas-cs` realm:

| Setting | Value |
|---|---|
| Client type | SAML |
| Client ID | `http://localhost:8084/demo-saml/` |
| Name ID format | username |
| Valid redirect URIs | `http://localhost:8084/*` |
| Master SAML Processing URL | `http://localhost:8084/demo-saml/` |
| Sign assertions | ON |

After creating, go to **Keys** tab → copy the **IdP Certificate** (PEM) and paste it into `keycloak-saml.xml` under `<CertificatePem>`.

## Generate SP Keystore

```bash
keytool -genkey -alias demo-saml -keyalg RSA -keystore src/main/webapp/WEB-INF/keystore.jks \
  -storepass password -keypass password -validity 3650 \
  -dname "CN=demo-saml, OU=Demo, O=Example, L=City, ST=State, C=US"
```

## Install Keycloak SAML Galleon Feature Pack on WildFly

```bash
# In WildFly CLI
$WILDFLY_HOME/bin/jboss-cli.sh --connect
[standalone@localhost:9990] feature-pack install \
  org.keycloak:keycloak-saml-wildfly-galleon-pack:24.0.3 \
  --layers=keycloak-client-saml
```

## Build & Deploy

```bash
mvn clean package
cp target/demo-saml.war $WILDFLY_HOME/standalone/deployments/
$WILDFLY_HOME/bin/standalone.sh
```

Then open http://localhost:8084/demo-saml/protected/profile

## How It Works

1. WildFly Galleon installs Keycloak SAML adapter as a server subsystem
2. `web.xml` declares `auth-method` as `KEYCLOAK-SAML`
3. `WEB-INF/keycloak-saml.xml` configures SP (this app) and IdP (Keycloak)
4. Accessing `/protected/*` triggers SAML AuthnRequest → POST to Keycloak
5. Keycloak validates credentials → POST SAML Response back to SP
6. `req.getUserPrincipal()` and `req.isUserInRole()` work natively
