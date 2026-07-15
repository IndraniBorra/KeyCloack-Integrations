# Session Handoff — Keycloak Integrations

Working notes for picking this project back up. See [`README.md`](README.md) for the
project overview and per-app run commands.

> **This file is committed to a public repo.** Don't put passwords, client secrets,
> or tokens here. Test-user passwords live in `keycloak-setup/clients-guide.md`
> and the Keycloak console — not in git.

## Server

| | |
| --- | --- |
| Keycloak | `https://auth.savvytechies.com` |
| Main realm | `utdallas-cs` |
| Second realm | `utdallas-eng` (has client `react-client-sso`) |
| Test users | `testuser` (role `user`), `adminuser` (role `admin`) |
| Admin access | No direct Keycloak admin console. Managed via the SavvyTechies console / MCP server. |

## Status

Everything is done except two apps. See the Status table in `README.md` for the
authoritative list.

| App | State |
| --- | --- |
| `java-wildfly-elytron` | **Blocked** — 403 because realm roles `user`/`admin` don't exist yet |
| `apache-mod_auth_mellon` | **Blocked** — needs a SAML client created in `utdallas-cs` |
| `react-google-direct` | **Done, untested end-to-end** — waiting on a Google Cloud JavaScript origin |

## The SavvyTechies MCP server

The thing this handoff previously called "the Keycloak cluster tool" is an **MCP
server** at `https://mcp.savvytechies.com/`. Verified working:
`savvytechies-control-plane v0.1.0`, **41 tools**.

**The old note that it "can create OIDC clients but NOT SAML clients" is wrong.**
`propose_register_saml_client` exists. `apache-mod_auth_mellon` is *not* blocked on
admin console access — it can be unblocked with one call.

Useful tools: `create_realm`, `propose_register_client`, `propose_register_saml_client`,
`propose_add_identity_provider`, `set_client_redirect_uris`, `create_role`,
`assign_user_roles`, `list_users`, `analyze_realm` (free security audit),
`set_realm_branding`, `list_skills` / `read_skill` (built-in playbooks, including
`federation`).

Design notes worth knowing:

- **Mutations stage a dry-run first** and require an explicit `apply_change(proposalId)`.
  Only `create_realm` mutates directly.
- **Secrets never pass through the tools.** `propose_add_identity_provider` takes a
  `secretRef`, not a secret — the value is populated via the console's secure field.
  `reset_user_password` refuses passwords outright.
- **Realm names are auto-uniquified**, so create the realm first and read back its
  real name before depending on it.

**Access tokens live 300 seconds.** They expire during a Claude Code restart, so
`.mcp.json` can never load one — a config file is committed (gitignored) waiting for a
**service account**, which is the real fix. Ask SavvyTechies for one. Until then, the
console's own assistant is the practical way to drive it.

## Open items

**1. Create the realm roles** — unblocks `java-wildfly-elytron`. Via the console assistant:

```text
List realm roles in utdallas-cs
Create realm role user in utdallas-cs   (description: Standard access role for the demo apps)
Create realm role admin in utdallas-cs
Assign role user to user testuser in utdallas-cs
Assign role admin to user adminuser in utdallas-cs
```

**2. Create the SAML client** — unblocks `apache-mod_auth_mellon`. Use
`propose_register_saml_client` (this is newly possible; see above).

**3. Finish `react-google-direct`** — add `http://localhost:3003` to *Authorized
JavaScript origins* on Google OAuth client `react-sso-user1` (project
`keycloak-sso-demo`). Google Identity Services uses a popup, so it authorizes the
**origin**, not a redirect URI. Currently fails with `no registered origin / 401
invalid_client`. No code change needed — the app builds, serves, and its client ID is
verified correct.

**4. Decide on `openid-connect/react-google-sso/`** — the Keycloak-brokered version
(port 3002, realm `utdallas-eng`, client `react-client-sso`). It builds and runs, but
its Google button silently falls back to the Keycloak login page because the realm has
no `google` identity provider. Either finish it (one console prompt:
`propose_add_identity_provider`, alias `google`, Client ID
`141199993343-pqdlj9d17blsgudrcgguvp5jg4odg4q2.apps.googleusercontent.com`, secret via
the secure field) or delete it. A half-working demo in a demo repo is the worst option.

**5. Device authorization grant (shell)** — not started.

## Security debt

- **`openid-connect/nodejs/keycloak.json` has a client secret in plaintext and is
  committed to a public repo.** Gitignoring won't help; it's in history. **Rotate it
  in Keycloak.**
- `saml/java-wildfly-saml/.../keystore.jks` holds a private key. Now gitignored —
  regenerate with `keytool` on a fresh clone.
- This handoff previously contained test-user passwords. Removed; the repo is public.

## Gotcha: working on a borrowed laptop

This clone lives on a machine signed into GitHub as a **different account**
(`gprathi`), which causes two silent failures:

1. **Push 403.** macOS Keychain stores credentials per *account*, and a bare
   `github.com` URL matches the machine owner's entry. Pin the username so the lookup
   misses and git prompts:
   `git remote set-url origin https://IndraniBorra@github.com/IndraniBorra/KeyCloack-Integrations.git`
   Authenticate with a **fine-grained token**, not a password (GitHub dropped password
   auth in 2021). Revoke the token when done.
2. **Wrong commit author.** Git inherits the machine's global identity. This repo now
   sets `user.name` / `user.email` via `--local` (in `.git/config`) — **never** change
   the global config on someone else's machine.

## Machine notes

`.gitignore` covers build artifacts, `local.properties` (hardcodes this machine's
Android SDK path), the XcodeGen-generated `.xcodeproj`, keystores, and `.mcp.json`.
`cspell.json` and `.markdownlint.json` hold the project vocabulary and lint config.
