import { useState } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { GOOGLE_CLIENT_ID } from './googleConfig';

export default function App() {
  const [idToken, setIdToken] = useState(null);
  const [claims, setClaims] = useState(null);
  const [error, setError] = useState(null);

  const onSuccess = (credentialResponse) => {
    // credentialResponse.credential is the ID token: a JWT signed by Google
    const jwt = credentialResponse.credential;
    setIdToken(jwt);
    setClaims(jwtDecode(jwt));
    setError(null);
  };

  const onLogout = () => {
    googleLogout();
    setIdToken(null);
    setClaims(null);
  };

  const authenticated = Boolean(claims);
  const audMatches = claims?.aud === GOOGLE_CLIENT_ID;

  return (
    <>
      {/* Hero */}
      <div className="hero mb-4">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="h3 mb-1">React + Google Sign-In</h1>
              <p className="mb-0 text-white-50">
                Direct to Google &mdash; no Keycloak, no realm, no broker
              </p>
            </div>
            <div>
              {error && <span className="badge bg-danger fs-6">{error}</span>}
              {!error && authenticated && (
                <span className="badge bg-success fs-6">Signed in</span>
              )}
              {!error && !authenticated && (
                <span className="badge bg-secondary fs-6">Signed out</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Public Section */}
        <div className="mb-4">
          <div className="card p-4">
            <h5 className="card-title">Public Area</h5>
            <p className="text-muted">
              This section is visible to everyone, signed in or not.
            </p>
            {!authenticated && (
              <div>
                <GoogleLogin
                  onSuccess={onSuccess}
                  onError={() => setError('Google sign-in failed')}
                />
              </div>
            )}
            {authenticated && (
              <div>
                <button className="btn btn-outline-danger" onClick={onLogout}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Protected Section */}
        {authenticated && (
          <div className="mb-4">
            <div className="card p-4">
              <h5 className="card-title text-success">
                Protected Area &mdash; User Profile
              </h5>
              <table className="table table-borderless mb-0">
                <tbody>
                  <tr>
                    <th style={{ width: 160 }}>Name</th>
                    <td>{claims.name}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>
                      {claims.email}{' '}
                      {claims.email_verified && (
                        <span className="badge bg-success">verified</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>Subject (sub)</th>
                    <td className="text-monospace small">{claims.sub}</td>
                  </tr>
                  <tr>
                    <th>Issuer (iss)</th>
                    <td className="text-monospace small">{claims.iss}</td>
                  </tr>
                  <tr>
                    <th>Audience (aud)</th>
                    <td className="text-monospace small">
                      {claims.aud}
                      {audMatches && (
                        <span className="badge bg-success ms-2">
                          minted for this app
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>Expires (exp)</th>
                    <td className="text-monospace small">
                      {new Date(claims.exp * 1000).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Token Section */}
        {authenticated && (
          <div className="mb-4">
            <div className="card p-4">
              <h5 className="card-title">ID Token</h5>
              <p className="text-muted small mb-2">
                A JWT signed by Google. There is no access token here &mdash;
                this app only authenticates the user, it does not call Google
                APIs on their behalf.
              </p>
              <pre style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                {idToken}
              </pre>
              <h6 className="mt-3">Decoded Claims</h6>
              <pre style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(claims, null, 2)}
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
                href="https://www.npmjs.com/package/@react-oauth/google"
                target="_blank"
                rel="noreferrer"
              >
                @react-oauth/google
              </a>{' '}
              (Google Identity Services) + React
            </li>
            <li>
              <strong>Issuer:</strong> <code>https://accounts.google.com</code>{' '}
              &mdash; Google signs the token itself
            </li>
            <li>
              <strong>Client:</strong> Public (no secret; the ID token is
              returned straight to the browser)
            </li>
            <li>
              <strong>No Keycloak.</strong> Compare with{' '}
              <code>../react</code>, where the app speaks only to Keycloak and
              never sees Google. Here Google is the identity provider, the user
              store, and the token issuer all at once &mdash; there is no realm,
              no roles, and no way to add a second provider without new code.
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
