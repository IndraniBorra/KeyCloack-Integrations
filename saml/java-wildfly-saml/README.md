# Java WildFly — Keycloak SAML  ✅ WORKING

Jakarta EE servlet secured via **SAML** using the Keycloak SAML adapter installed on WildFly 40
as a Galleon layer. Verified end-to-end against realm `utdallas-cs` with user `testuser`.

## Status / what it demonstrates
- Full SAML browser SSO: AuthnRequest → Keycloak login → **signed** SAML Response → session.
- The protected page renders the SAML equivalents of OIDC tokens:
  **NameID**, **NameID format**, **roles/attributes**, **SAML SessionIndex** (the session handle),
  **JSESSIONID**, and the complete **signed `<saml:Assertion>` XML** (the "ID token" equivalent —
  SAML issues no JWT bearer tokens).

## Keycloak client (SAML)
| Setting | Value |
|---|---|
| Client type / protocol | SAML |
| Client ID (entityID) | `http://localhost:8084/demo-saml/sp` |
| Master SAML Processing URL | `http://localhost:8084/demo-saml/saml` |
| Valid redirect URIs | `http://localhost:8084/*` |
| Name ID format | username |
| Sign assertions / documents | ON |
| Client signature required | OFF |
| Force POST binding | ON |

The IdP signing certificate is in the realm's **public** SAML metadata (no admin console needed).
Fetch it and paste the base64 into `keycloak-saml.xml` under `<CertificatePem>`:
```bash
curl -s https://auth.savvytechies.com/realms/utdallas-cs/protocol/saml/descriptor
# copy the <ds:X509Certificate> under KeyDescriptor use="signing"
```

## Generate the SP keystore
```bash
keytool -genkeypair -alias demo-saml -keyalg RSA -keysize 2048 \
  -keystore src/main/webapp/WEB-INF/keystore.jks \
  -storepass password -keypass password -validity 3650 \
  -dname "CN=demo-saml, OU=Demo, O=Example, L=City, ST=State, C=US"
```

## Install the Keycloak SAML adapter layer on WildFly 40
WildFly 40's `jboss-cli.sh` no longer has `feature-pack install`; use the standalone **Galleon CLI**
(https://github.com/wildfly/galleon/releases, e.g. 7.0.8.Final). The correct artifact is
`keycloak-saml-adapter-galleon-pack` (NOT `keycloak-saml-wildfly-galleon-pack`), version **26.7.0**
(24.0.3 is too old for WildFly 40).
```bash
galleon.sh install \
  org.keycloak:keycloak-saml-adapter-galleon-pack:26.7.0 \
  --layers=keycloak-client-saml \
  --dir=$WILDFLY_HOME
```
Adds the `keycloak-saml` subsystem + the Elytron `KEYCLOAK-SAML` HTTP mechanism. Use JDK 17–21.

## Build & deploy
```bash
mvn clean package
cp target/demo-saml.war $WILDFLY_HOME/standalone/deployments/
# port-offset 4 -> HTTP 8084 (matches the SP URLs)
$WILDFLY_HOME/bin/standalone.sh -Djboss.socket.binding.port-offset=4
```
Open http://localhost:8084/demo-saml/protected/profile and log in as `testuser` / `Test@1234`.

## Gotchas learned in practice (all fixed here)
- **Master SAML Processing URL must end in `/saml`** — the adapter's assertion-consumer endpoint is
  `<context>/saml`, and it rejects a Response whose `Destination` != request URI. Pointing it at the
  context root causes a 405 / "does not match SAML request destination" error.
- **`keyAlias` attribute on `<KeyStore>` fails on adapter 26.x** (NPE: "alias is null"). Use nested
  `<PrivateKey alias="…"/>` + `<Certificate alias="…"/>` instead (see `keycloak-saml.xml`).
- **Client signature required = OFF** so the SP can send unsigned AuthnRequests (`signRequest="false"`);
  we can't upload the SP cert without admin console. Response signing stays ON and is validated via
  the IdP cert.
- **`keepDOMAssertion="true"`** on the `<SP>` element is required for `SamlPrincipal.getAssertionDocument()`
  to return the raw assertion XML (used by the profile page). The IDE may warn it's not in the 1_10
  XSD — the runtime adapter accepts it.
- **Authorization:** `/protected/*` is set to `**` (any authenticated user), matching the OIDC demo
  apps. If you want role-gated access instead, add realm roles and list them in `web.xml`.

## How it works
1. Galleon installs the Keycloak SAML adapter as a WildFly subsystem.
2. `web.xml` sets `auth-method` = `KEYCLOAK-SAML`.
3. `WEB-INF/keycloak-saml.xml` configures the SP (this app) and the IdP (Keycloak), incl. the IdP cert.
4. Hitting `/protected/*` triggers a SAML AuthnRequest POST to Keycloak.
5. Keycloak authenticates and POSTs a signed SAML Response to `/demo-saml/saml`.
6. The adapter validates the signature, establishes the session, and `req.getUserPrincipal()`
   returns a `SamlPrincipal` (assertion, attributes, NameID).
