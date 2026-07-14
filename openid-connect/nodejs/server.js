const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');

const app = express();
const PORT = process.env.PORT || 4000;

// Session store (required by keycloak-connect)
const memoryStore = new session.MemoryStore();
app.use(session({
  secret: 'some-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

// Initialize Keycloak — reads keycloak.json from same directory
const keycloak = new Keycloak({ store: memoryStore });
app.use(keycloak.middleware({
  logout: '/logout',
  admin: '/'
}));

// --- Routes ---

// Public route
app.get('/', (req, res) => {
  const user = req.kauth?.grant?.access_token?.content;
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

// Protected route — requires any authenticated user
app.get('/protected', keycloak.protect(), (req, res) => {
  const token = req.kauth.grant.access_token.content;
  const roles = token.realm_access?.roles?.filter(r => !r.startsWith('default-')) || [];
  res.send(renderPage({
    title: 'Protected Page',
    body: `
      <div class="alert alert-success">You are authenticated!</div>
      <table class="table table-bordered">
        <tr><th>Username</th><td>${token.preferred_username}</td></tr>
        <tr><th>Email</th><td>${token.email || 'N/A'}</td></tr>
        <tr><th>Full Name</th><td>${token.name || 'N/A'}</td></tr>
        <tr><th>Roles</th><td>${roles.join(', ') || 'none'}</td></tr>
        <tr><th>Subject (sub)</th><td><code>${token.sub}</code></td></tr>
      </table>
      <h5 class="mt-4">Tokens</h5>
      <h6>Access Token</h6>
      <pre style="word-wrap:break-word;white-space:pre-wrap;background:#f1f3f5;padding:1rem;border-radius:8px;font-size:.85rem;">${req.kauth.grant.access_token.token}</pre>
      <h6>ID Token</h6>
      <pre style="word-wrap:break-word;white-space:pre-wrap;background:#f1f3f5;padding:1rem;border-radius:8px;font-size:.85rem;">${req.kauth.grant.id_token?.token || 'N/A'}</pre>
      <a href="/admin" class="btn btn-warning me-2">Try Admin Page</a>
      <a href="/logout" class="btn btn-outline-danger">Logout</a>
    `
  }));
});

// Admin route — requires 'admin' realm role
app.get('/admin', keycloak.protect('realm:admin'), (req, res) => {
  const token = req.kauth.grant.access_token.content;
  res.send(renderPage({
    title: 'Admin Page',
    body: `
      <div class="alert alert-danger">Admin Area — restricted to <code>admin</code> role.</div>
      <p>Welcome, <strong>${token.preferred_username}</strong>! You have admin access.</p>
      <h5 class="mt-4">Tokens</h5>
      <h6>Access Token</h6>
      <pre style="word-wrap:break-word;white-space:pre-wrap;background:#f1f3f5;padding:1rem;border-radius:8px;font-size:.85rem;">${req.kauth.grant.access_token.token}</pre>
      <h6>ID Token</h6>
      <pre style="word-wrap:break-word;white-space:pre-wrap;background:#f1f3f5;padding:1rem;border-radius:8px;font-size:.85rem;">${req.kauth.grant.id_token?.token || 'N/A'}</pre>
      <a href="/" class="btn btn-secondary">Home</a>
      <a href="/logout" class="btn btn-outline-danger ms-2">Logout</a>
    `
  }));
});

// Access denied handler
app.use((req, res, next) => {
  if (res.statusCode === 403) {
    return res.send(renderPage({
      title: 'Access Denied',
      body: '<div class="alert alert-danger">You do not have the required role to access this page.</div><a href="/">Home</a>'
    }));
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Keycloak Node.js demo running at http://localhost:${PORT}`);
  console.log(`Realm: utdallas-cs | Keycloak: https://auth.savvytechies.com`);
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
