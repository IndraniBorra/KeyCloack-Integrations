using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

var keycloakConfig = builder.Configuration.GetSection("Keycloak");

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
})
.AddCookie(options =>
{
    options.Cookie.Name = "KeycloakDemo";
    options.ExpireTimeSpan = TimeSpan.FromHours(1);
})
.AddOpenIdConnect(options =>
{
    options.Authority = keycloakConfig["Authority"];
    options.ClientId = keycloakConfig["ClientId"];
    options.ClientSecret = keycloakConfig["ClientSecret"];
    options.ResponseType = OpenIdConnectResponseType.Code;
    options.SaveTokens = true;
    options.GetClaimsFromUserInfoEndpoint = true;
    options.Scope.Add("openid");
    options.Scope.Add("profile");
    options.Scope.Add("email");

    // Map Keycloak realm roles to ClaimsIdentity roles
    options.Events = new OpenIdConnectEvents
    {
        OnTokenValidated = ctx =>
        {
            var accessToken = ctx.TokenEndpointResponse?.AccessToken;
            if (!string.IsNullOrEmpty(accessToken))
            {
                var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                var jwt = handler.ReadJwtToken(accessToken);
                var realmAccess = jwt.Claims
                    .FirstOrDefault(c => c.Type == "realm_access")?.Value;
                if (realmAccess != null)
                {
                    var doc = System.Text.Json.JsonDocument.Parse(realmAccess);
                    if (doc.RootElement.TryGetProperty("roles", out var rolesEl))
                    {
                        var identity = (ClaimsIdentity)ctx.Principal!.Identity!;
                        foreach (var role in rolesEl.EnumerateArray())
                        {
                            identity.AddClaim(new Claim(ClaimTypes.Role, role.GetString()!));
                        }
                    }
                }
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();
builder.Services.AddRazorPages();

var app = builder.Build();

app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

// --- Routes ---

app.MapGet("/", (HttpContext ctx) =>
{
    var user = ctx.User;
    var name = user.FindFirst("preferred_username")?.Value
            ?? user.FindFirst(ClaimTypes.Name)?.Value
            ?? "Unknown";
    var isAuth = user.Identity?.IsAuthenticated ?? false;

    return Results.Content(RenderPage("Home (Public)", isAuth
        ? $"""
           <div class="alert alert-success">Welcome, <strong>{name}</strong>!</div>
           <a href="/profile" class="btn btn-primary me-2">Profile</a>
           <a href="/admin" class="btn btn-warning me-2">Admin</a>
           <a href="/logout" class="btn btn-outline-danger">Logout</a>
           """
        : """
           <div class="alert alert-secondary">You are not logged in.</div>
           <a href="/login" class="btn btn-primary">Login with Keycloak</a>
           """), "text/html");
});

app.MapGet("/login", () => Results.Challenge(
    new AuthenticationProperties { RedirectUri = "/profile" },
    new[] { OpenIdConnectDefaults.AuthenticationScheme }
));

app.MapGet("/profile", [Authorize] async (HttpContext ctx) =>
{
    var user = ctx.User;
    var claims = user.Claims.ToList();
    var name     = user.FindFirst("preferred_username")?.Value ?? user.FindFirst(ClaimTypes.Name)?.Value ?? "N/A";
    var email    = user.FindFirst("email")?.Value ?? "N/A";
    var fullName = user.FindFirst("name")?.Value ?? "N/A";
    var sub      = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "N/A";
    var roles    = user.Claims.Where(c => c.Type == ClaimTypes.Role && !c.Value.StartsWith("default-"))
                              .Select(c => c.Value);

    var accessToken = await ctx.GetTokenAsync("access_token") ?? "N/A";
    var idToken     = await ctx.GetTokenAsync("id_token") ?? "N/A";

    return Results.Content(RenderPage("Profile (Protected)", $"""
        <div class="alert alert-success">Authenticated via Keycloak OIDC</div>
        <table class="table table-bordered">
          <tr><th>Username</th><td>{name}</td></tr>
          <tr><th>Email</th><td>{email}</td></tr>
          <tr><th>Full Name</th><td>{fullName}</td></tr>
          <tr><th>Roles</th><td>{string.Join(", ", roles)}</td></tr>
          <tr><th>Subject</th><td><code>{sub}</code></td></tr>
        </table>
        <h5 class="mt-4">Tokens</h5>
        <h6>Access Token</h6>
        <pre style="word-wrap:break-word;white-space:pre-wrap;background:#f1f3f5;padding:1rem;border-radius:8px;font-size:.85rem;">{accessToken}</pre>
        <h6>ID Token</h6>
        <pre style="word-wrap:break-word;white-space:pre-wrap;background:#f1f3f5;padding:1rem;border-radius:8px;font-size:.85rem;">{idToken}</pre>
        <a href="/" class="btn btn-secondary me-2">Home</a>
        <a href="/logout" class="btn btn-outline-danger">Logout</a>
        """), "text/html");
});

app.MapGet("/admin", [Authorize(Roles = "admin")] (HttpContext ctx) =>
{
    var name = ctx.User.FindFirst("preferred_username")?.Value ?? "User";
    return Results.Content(RenderPage("Admin (Protected)", $"""
        <div class="alert alert-danger">Admin Area — <code>admin</code> role required.</div>
        <p>Welcome, <strong>{name}</strong>!</p>
        <a href="/" class="btn btn-secondary me-2">Home</a>
        <a href="/logout" class="btn btn-outline-danger">Logout</a>
        """), "text/html");
});

app.MapGet("/logout", async (HttpContext ctx) =>
{
    await ctx.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    await ctx.SignOutAsync(OpenIdConnectDefaults.AuthenticationScheme,
        new AuthenticationProperties { RedirectUri = "/" });
});

app.Run();

static string RenderPage(string title, string body) => $"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"/>
      <title>{title} — Keycloak C# Demo</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"/>
    </head>
    <body class="bg-light">
      <nav class="navbar navbar-dark bg-dark mb-4">
        <div class="container">
          <span class="navbar-brand">Keycloak C# OWIN Demo</span>
          <span class="text-white-50 small">Realm: utdallas-cs</span>
        </div>
      </nav>
      <div class="container">
        <h2>{title}</h2>
        {body}
      </div>
    </body>
    </html>
    """;
