package com.example;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.HttpConstraint;
import jakarta.servlet.annotation.ServletSecurity;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.security.Principal;

@WebServlet("/protected/profile")
@ServletSecurity(@HttpConstraint(rolesAllowed = {"user", "admin"}))
public class SamlProtectedServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("text/html;charset=UTF-8");
        Principal principal = req.getUserPrincipal();
        boolean isAdmin = req.isUserInRole("admin");
        PrintWriter out = resp.getWriter();

        StringBuilder sb = new StringBuilder();
        sb.append("""
            <!DOCTYPE html>
            <html>
            <head>
              <title>Profile — WildFly SAML Demo</title>
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"/>
            </head>
            <body class="bg-light">
              <nav class="navbar navbar-dark bg-dark mb-4">
                <div class="container">
                  <span class="navbar-brand">WildFly SAML Demo</span>
                  <span class="text-white-50 small">Realm: utdallas-cs | Protocol: SAML</span>
                </div>
              </nav>
              <div class="container">
                <h2>Protected Profile (SAML)</h2>
                <div class="alert alert-success">Authenticated via Keycloak SAML</div>
                <table class="table table-bordered">
                  <tr><th>NameID (Username)</th><td>")""");
        sb.append(principal.getName());
        sb.append("""
                  </td></tr>
                  <tr><th>Is Admin</th><td>")""");
        sb.append(isAdmin);
        sb.append("""
                  </td></tr>
                </table>
                <h5 class="mt-4">SAML Session Info</h5>
                <p class="text-muted small">Note: SAML uses assertions, not bearer tokens like OIDC. The raw SAML assertion is processed server-side by the Keycloak SAML adapter and is not directly available as a JWT. The session principal and roles above are extracted from the SAML assertion.</p>
                <h6>Principal Class</h6>
                <pre style="word-wrap:break-word;white-space:pre-wrap;background:#f1f3f5;padding:1rem;border-radius:8px;font-size:.85rem;">""");
        sb.append(principal.getClass().getName());
        sb.append("""
                </pre>
                <h6>Session ID</h6>
                <pre style="word-wrap:break-word;white-space:pre-wrap;background:#f1f3f5;padding:1rem;border-radius:8px;font-size:.85rem;">""");
        sb.append(req.getSession().getId());
        sb.append("""
                </pre>
                <a href="../../" class="btn btn-secondary me-2">Home</a>
                <a href="../../j_saml_logout" class="btn btn-outline-danger">SAML Logout</a>
              </div>
            </body>
            </html>
            """);

        out.println(sb.toString());
    }
}
