import os
from functools import wraps
from dotenv import load_dotenv
from flask import Flask, redirect, url_for, session, request, render_template_string
from authlib.integrations.flask_client import OAuth

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev-secret-change-me')

KEYCLOAK_BASE_URL = os.getenv('KEYCLOAK_BASE_URL', 'https://auth.savvytechies.com')
KEYCLOAK_REALM    = os.getenv('KEYCLOAK_REALM', 'utdallas-cs')
ISSUER            = f"{KEYCLOAK_BASE_URL}/realms/{KEYCLOAK_REALM}"
DISCOVERY_URL     = f"{ISSUER}/.well-known/openid-configuration"

oauth = OAuth(app)
oauth.register(
    name='keycloak',
    client_id=os.getenv('KEYCLOAK_CLIENT_ID', 'python-client'),
    client_secret=os.getenv('KEYCLOAK_CLIENT_SECRET'),
    server_metadata_url=DISCOVERY_URL,
    client_kwargs={
        'scope': 'openid email profile',
        'code_challenge_method': None,
    }
)


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated


def role_required(role):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if 'user' not in session:
                return redirect(url_for('login'))
            roles = session.get('roles', [])
            if role not in roles:
                return render_page('Access Denied',
                    '<div class="alert alert-danger">You need the <strong>{}</strong> role.</div>'
                    '<a href="/">Home</a>'.format(role)), 403
            return f(*args, **kwargs)
        return decorated
    return decorator


# --- Routes ---

@app.route('/')
def index():
    user = session.get('user')
    if user:
        body = f'''
        <div class="alert alert-info">You are logged in as <strong>{user.get("preferred_username")}</strong>.
        <a href="/logout">Logout</a></div>
        <a href="/profile" class="btn btn-primary me-2">View Profile</a>
        <a href="/admin" class="btn btn-warning">Admin Page</a>
        '''
    else:
        body = '''
        <div class="alert alert-secondary">You are not logged in.</div>
        <a href="/login" class="btn btn-primary">Login with Keycloak</a>
        '''
    return render_page('Home (Public)', body)


@app.route('/login')
def login():
    redirect_uri = url_for('callback', _external=True)
    return oauth.keycloak.authorize_redirect(redirect_uri)


@app.route('/callback')
def callback():
    token = oauth.keycloak.authorize_access_token()
    user_info = token.get('userinfo') or oauth.keycloak.userinfo()
    session['user'] = user_info
    session['access_token'] = token.get('access_token')
    session['id_token'] = token.get('id_token')
    # Extract realm roles from the access token claims
    import json, base64
    try:
        payload = token['access_token'].split('.')[1]
        payload += '=' * (4 - len(payload) % 4)
        claims = json.loads(base64.urlsafe_b64decode(payload))
        session['roles'] = claims.get('realm_access', {}).get('roles', [])
    except Exception:
        session['roles'] = []
    return redirect(url_for('profile'))


@app.route('/profile')
@login_required
def profile():
    user = session['user']
    roles = [r for r in session.get('roles', []) if not r.startswith('default-')]
    rows = ''.join(f'<tr><th>{k}</th><td><code>{v}</code></td></tr>'
                   for k, v in [
                       ('Username', user.get('preferred_username')),
                       ('Email', user.get('email', 'N/A')),
                       ('Full Name', user.get('name', 'N/A')),
                       ('Roles', ', '.join(roles) or 'none'),
                       ('Subject', user.get('sub')),
                   ])
    access_token = session.get('access_token', 'N/A')
    id_token = session.get('id_token', 'N/A')
    body = f'''
    <div class="alert alert-success">Authenticated via Keycloak (utdallas-cs)</div>
    <table class="table table-bordered">{rows}</table>
    <h5 class="mt-4">Tokens</h5>
    <h6>Access Token</h6>
    <pre style="word-wrap:break-word;white-space:pre-wrap;background:#f1f3f5;padding:1rem;border-radius:8px;font-size:.85rem;">{access_token}</pre>
    <h6>ID Token</h6>
    <pre style="word-wrap:break-word;white-space:pre-wrap;background:#f1f3f5;padding:1rem;border-radius:8px;font-size:.85rem;">{id_token}</pre>
    <a href="/admin" class="btn btn-warning me-2">Admin Page</a>
    <a href="/logout" class="btn btn-outline-danger">Logout</a>
    '''
    return render_page('Profile (Protected)', body)


@app.route('/admin')
@role_required('admin')
def admin():
    user = session['user']
    body = f'''
    <div class="alert alert-danger">Admin Area — <code>admin</code> role required.</div>
    <p>Welcome, <strong>{user.get("preferred_username")}</strong>!</p>
    <a href="/" class="btn btn-secondary">Home</a>
    <a href="/logout" class="btn btn-outline-danger ms-2">Logout</a>
    '''
    return render_page('Admin (Protected)', body)


@app.route('/logout')
def logout():
    id_token = session.get('user', {}).get('_id_token')
    session.clear()
    logout_url = (
        f"{ISSUER}/protocol/openid-connect/logout"
        f"?post_logout_redirect_uri={url_for('index', _external=True)}"
        f"&client_id={os.getenv('KEYCLOAK_CLIENT_ID', 'python-client')}"
    )
    return redirect(logout_url)


def render_page(title, body):
    return render_template_string('''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>{{ title }} — Keycloak Python Demo</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"/>
</head>
<body class="bg-light">
  <nav class="navbar navbar-dark bg-dark mb-4">
    <div class="container">
      <span class="navbar-brand">Keycloak Python (Flask) Demo</span>
      <span class="text-white-50 small">Realm: utdallas-cs</span>
    </div>
  </nav>
  <div class="container">
    <h2 class="mb-4">{{ title }}</h2>
    {{ body|safe }}
  </div>
</body>
</html>''', title=title, body=body)


if __name__ == '__main__':
    app.run(port=5000, debug=True)
