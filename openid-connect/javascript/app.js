import Keycloak from 'https://cdn.jsdelivr.net/npm/keycloak-js@24.0.3/+esm';

const keycloak = new Keycloak('/keycloak.json');

keycloak.init({
  onLoad: 'check-sso',
  silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  pkceMethod: 'S256'
}).then(authenticated => {
  renderPage(authenticated);
}).catch(err => {
  console.error('Keycloak init failed', err);
  document.getElementById('status').textContent = 'Keycloak init failed: ' + err;
});

function renderPage(authenticated) {
  const status = document.getElementById('status');
  const publicSection = document.getElementById('public-section');
  const protectedSection = document.getElementById('protected-section');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');

  if (authenticated) {
    status.textContent = 'Authenticated';
    status.className = 'badge bg-success';
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    protectedSection.style.display = 'block';

    const token = keycloak.tokenParsed;
    document.getElementById('user-name').textContent = token.name || token.preferred_username;
    document.getElementById('user-email').textContent = token.email || 'N/A';
    document.getElementById('user-roles').textContent =
      (token.realm_access?.roles || []).filter(r => !r.startsWith('default-')).join(', ') || 'none';
    document.getElementById('user-subject').textContent = token.sub;

    document.getElementById('tokens-section').style.display = 'block';
    document.getElementById('access-token').textContent = keycloak.token;
    document.getElementById('id-token').textContent = keycloak.idToken;
  } else {
    status.textContent = 'Not authenticated';
    status.className = 'badge bg-secondary';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    protectedSection.style.display = 'none';
    document.getElementById('tokens-section').style.display = 'none';
  }

  publicSection.style.display = 'block';
}

// Expose to global scope for onclick handlers (ES modules don't auto-expose)
window.login = function() {
  keycloak.login();
};

window.logout = function() {
  keycloak.logout({ redirectUri: window.location.origin });
};

// Auto-refresh token before expiry
keycloak.onTokenExpired = () => {
  keycloak.updateToken(30).catch(() => keycloak.login());
};
