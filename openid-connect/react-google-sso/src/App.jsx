import { useState, useEffect, useRef } from 'react';
import keycloak from './keycloak';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [initError, setInitError] = useState(null);
  const [ready, setReady] = useState(false);
  const initCalled = useRef(false);

  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;

    keycloak
      .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',
      })
      .then((auth) => {
        setAuthenticated(auth);
        setReady(true);
      })
      .catch((err) => {
        console.error('Keycloak init failed', err);
        setInitError(String(err ?? 'unknown'));
        setReady(true);
      });

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).catch(() => keycloak.login());
    };
  }, []);

  const token = keycloak.tokenParsed;
  const roles = (token?.realm_access?.roles || []).filter(
    (r) => !r.startsWith('default-')
  );

  return (
    <>
      {/* Hero */}
      <div className="hero mb-4">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="h3 mb-1">Keycloak React Demo — Google SSO</h1>
              <p className="mb-0 text-white-50">
                Realm: <code className="text-warning">utdallas-eng</code>
                &nbsp;|&nbsp; Client:{' '}
                <code className="text-warning">react-client-sso</code>
              </p>
            </div>
            <div>
              {!ready && (
                <span className="badge bg-secondary fs-6">Checking...</span>
              )}
              {ready && initError && (
                <span className="badge bg-danger fs-6">
                  Init failed: {initError}
                </span>
              )}
              {ready && !initError && authenticated && (
                <span className="badge bg-success fs-6">Authenticated</span>
              )}
              {ready && !initError && !authenticated && (
                <span className="badge bg-secondary fs-6">
                  Not authenticated
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Public Section */}
        {ready && (
          <div className="mb-4">
            <div className="card p-4">
              <h5 className="card-title">Public Area</h5>
              <p className="text-muted">
                This section is visible to everyone, authenticated or not.
              </p>
              {!authenticated && (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => keycloak.login()}
                  >
                    Login with Keycloak
                  </button>
                  {/* idpHint skips the Keycloak login page and goes straight to Google */}
                  <button
                    className="btn btn-danger"
                    onClick={() => keycloak.login({ idpHint: 'google' })}
                  >
                    Login with Google
                  </button>
                </div>
              )}
              {authenticated && (
                <button
                  className="btn btn-outline-danger"
                  onClick={() =>
                    keycloak.logout({ redirectUri: window.location.origin })
                  }
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}

        {/* Protected Section */}
        {authenticated && token && (
          <div className="mb-4">
            <div className="card p-4">
              <h5 className="card-title text-success">
                Protected Area — User Profile
              </h5>
              <table className="table table-borderless mb-0">
                <tbody>
                  <tr>
                    <th style={{ width: 140 }}>Name</th>
                    <td>{token.name || token.preferred_username}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>{token.email || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th>Roles</th>
                    <td>{roles.join(', ') || 'none'}</td>
                  </tr>
                  <tr>
                    <th>Subject (sub)</th>
                    <td className="text-monospace small">{token.sub}</td>
                  </tr>
                  <tr>
                    <th>Issuer (iss)</th>
                    <td className="text-monospace small">
                      {token.iss}
                      {token.iss?.endsWith('/realms/utdallas-eng') && (
                        <span className="badge bg-success ms-2">
                          Keycloak-issued, not Google
                        </span>
                      )}
                    </td>
                  </tr>
                  {token.identity_provider && (
                    <tr>
                      <th>Logged in via</th>
                      <td className="text-monospace small">
                        {token.identity_provider}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tokens Section */}
        {authenticated && (
          <div className="mb-4">
            <div className="card p-4">
              <h5 className="card-title">Tokens</h5>
              <h6 className="mt-3">Access Token</h6>
              <pre style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                {keycloak.token}
              </pre>
              <h6 className="mt-3">ID Token</h6>
              <pre style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                {keycloak.idToken}
              </pre>
            </div>
          </div>
        )}

        {/* Integration Info */}
        <div className="card p-4 mb-4">
          <h5 className="card-title">Integration Details</h5>
          <ul className="mb-0">
            <li>
              <strong>Library:</strong>{' '}
              <a
                href="https://www.npmjs.com/package/keycloak-js"
                target="_blank"
                rel="noreferrer"
              >
                keycloak-js
              </a>{' '}
              + React
            </li>
            <li>
              <strong>Flow:</strong> Authorization Code + PKCE (S256)
            </li>
            <li>
              <strong>Issuer:</strong>{' '}
              <code>https://auth.savvytechies.com/realms/utdallas-eng</code>
            </li>
            <li>
              <strong>Client:</strong> Public (no secret required)
            </li>
            <li>
              <strong>Identity brokering:</strong> Google is registered as an
              identity provider on the realm. Keycloak delegates the login to
              Google, then issues its <em>own</em> tokens — the app only ever
              speaks to Keycloak.
            </li>
            <li>
              <strong>idpHint:</strong> <code>keycloak.login()</code> shows the
              Keycloak login page; <code>
                keycloak.login({'{'} idpHint: 'google' {'}'})
              </code>{' '}
              jumps straight to Google.
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
