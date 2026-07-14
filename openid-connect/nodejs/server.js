const express = require('express');
const session = require('express-session');
const { Issuer, generators } = require('openid-client');

const app = express();
const PORT = process.env.PORT || 4000;

// Config
const KEYCLOAK_URL = 'https://auth.savvytechies.com';
const REALM = 'utdallas-cs';
const CLIENT_ID = 'nodejs-client-2';
const CLIENT_SECRET = 'jwUI1L2w2h6rlrpIjkREu1ZbLK2ObvD1';
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const ISSUER_URL = `${KEYCLOAK_URL}/realms/${REALM}`;

let client;

// Discover OIDC endpoints and create client
async function setupOidc() {
  const issuer = await Issuer.discover(ISSUER_URL);
  client = new issuer.Client({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uris: [REDIRECT_URI],
    response_types: ['code'],
  });
}

// Session
app.use(session({
  secret: 'some-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
}));

// --- Routes ---

// Public route
app.get('/', (req, res) => {
  const user = req.session.userInfo;
  res.send(renderPage({
    title: 'Home (Public)',
    body: `
      <div class="alert alert-info">This page is <strong>public</strong> — no login required.</div>
      ${user
        ? `<p>You are logged in as <strong>${user.preferred_username}</strong>. <a href="/logout">Logout</a></p>`
        : `<p><a href="/protected" class="btn btn-primary">Go to Protected Page</a></p>`
      }
    `
  }));
});

// Login trigger
app.get('/login', (req, res) => {
  const nonce = generators.nonce();
  const state = generators.state();
  req.session.oidcNonce = nonce;
  req.session.oidcState = state;
  req.session.returnTo = req.query.returnTo || '/protected';

  const authUrl = client.authorizationUrl({
    scope: 'openid email profile',
    state,
    nonce,
    redirect_uri: REDIRECT_URI,
  });
  res.redirect(authUrl);
});

// OIDC callback
app.get('/callback', async (req, res) => {
  try {
    const params = client.callbackParams(req);
    const tokenSet = await client.callback(REDIRECT_URI, params, {
      nonce: req.session.oidcNonce,
      state: req.session.oidcState,
    });

    const userInfo = await client.userinfo(tokenSet.access_token);

    // Extract realm roles from access token
    let roles = [];
    try {
      const payload = JSON.parse(
        Buffer.from(tokenSet.access_token.split('.')[1], 'base64').toString()
      );
      roles = payload.realm_access?.roles || [];
    } catch (e) { /* ignore */ }

    req.session.userInfo = userInfo;
    req.session.roles = roles;
    req.session.accessToken = tokenSet.access_token;
    req.session.idToken = tokenSet.id_token;

    delete req.session.oidcNonce;
    delete req.session.oidcState;

    res.redirect(req.session.returnTo || '/protected');
  } catch (err) {
    console.error('OIDC callback error:', err);
    res.status(500).send(renderPage({
      title: 'Login Error',
      body: `<div class="alert alert-danger">Login failed: ${err.message}</div><a href="/">Home</a>`
    }));
  }
});

// Auth middleware
function requireLogin(req, res, next) {
  if (!req.session.userInfo) {
    return res.redirect(`/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
  }
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.userInfo) {
      return res.redirect(`/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
    }
    if (!req.session.roles?.includes(role)) {
      return res.status(403).send(renderPage({
        title: 'Access Denied',
        body: `<div class="alert alert-danger">You need the <strong>${role}</strong> role.</div><a href="/">Home</a>`
      }));
    }
    next();
  };
}

// Protected route
app.get('/protected', requireLogin, (req, res) => {
  const user = req.session.userInfo;
  const roles = (req.session.roles || []).filter(r => !r.startsWith('default-'));
  res.send(renderPage({
    title: 'Protected Page',
    body: `
      <div class="alert alert-success">You are authenticated!</div>
      <table class="table table-bordered">
        <tr><th>Username</th><td>${user.preferred_username}</td></tr>
        <tr><th>Email</th><td>${user.email || 'N/A'}</td></tr>
        <tr><th>Full Name</th><td>${user.name || 'N/A'}</td></tr>
        <tr><th>Roles</th><td>${roles.join(', ') || 'none'}</td></tr>
        <tr><th>Subject (sub)</th><td><code>${user.sub}</code></td></tr>
      </table>
      <h5 class="mt-4">Tokens</h5>
      <h6>Access Token</h6>
      <pre style="word-wrap:break-word;white-space:pre-wrap;background:#f1f3f5;padding:1rem;border-radius:8px;font-size:.85rem;">${req.session.accessToken}</pre>
      <h6>ID Token</h6>
      <pre style="word-wrap:break-word;white-space:pre-wrap;background:#f1f3f5;padding:1rem;border-radius:8px;font-size:.85rem;">${req.session.idToken || 'N/A'}</pre>
      <a href="/admin" class="btn btn-warning me-2">Try Admin Page</a>
      <a href="/logout" class="btn btn-outline-danger">Logout</a>
    `
  }));
});

// Admin route
app.get('/admin', requireRole('admin'), (req, res) => {
  const user = req.session.userInfo;
  res.send(renderPage({
    title: 'Admin Page',
    body: `
      <div class="alert alert-danger">Admin Area — restricted to <code>admin</code> role.</div>
      <p>Welcome, <strong>${user.preferred_username}</strong>! You have admin access.</p>
      <h5 class="mt-4">Tokens</h5>
      <h6>Access Token</h6>
      <pre style="word-wrap:break-word;white-space:pre-wrap;background:#f1f3f5;padding:1rem;border-radius:8px;font-size:.85rem;">${req.session.accessToken}</pre>
      <h6>ID Token</h6>
      <pre style="word-wrap:break-word;white-space:pre-wrap;background:#f1f3f5;padding:1rem;border-radius:8px;font-size:.85rem;">${req.session.idToken || 'N/A'}</pre>
      <a href="/" class="btn btn-secondary">Home</a>
      <a href="/logout" class="btn btn-outline-danger ms-2">Logout</a>
    `
  }));
});

// Logout
app.get('/logout', (req, res) => {
  const idToken = req.session.idToken;
  req.session.destroy(() => {
    const logoutUrl = `${ISSUER_URL}/protocol/openid-connect/logout`
      + `?post_logout_redirect_uri=${encodeURIComponent(`http://localhost:${PORT}`)}`
      + `&client_id=${CLIENT_ID}`;
    res.redirect(logoutUrl);
  });
});

// Start
setupOidc().then(() => {
  app.listen(PORT, () => {
    console.log(`Keycloak Node.js demo running at http://localhost:${PORT}`);
    console.log(`Realm: ${REALM} | Keycloak: ${KEYCLOAK_URL}`);
    console.log(`Library: openid-client (replaces deprecated keycloak-connect)`);
  });
}).catch(err => {
  console.error('Failed to discover OIDC endpoints:', err);
  process.exit(1);
});

// Simple HTML template helper
function renderPage({ title, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${title} — Keycloak Node.js Demo</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"/>
</head>
<body class="bg-light">
  <nav class="navbar navbar-dark bg-dark mb-4">
    <div class="container">
      <span class="navbar-brand">Keycloak Node.js Demo</span>
      <span class="text-white-50 small">Realm: utdallas-cs</span>
    </div>
  </nav>
  <div class="container">
    <h2 class="mb-4">${title}</h2>
    ${body}
  </div>
</body>
</html>`;
}
