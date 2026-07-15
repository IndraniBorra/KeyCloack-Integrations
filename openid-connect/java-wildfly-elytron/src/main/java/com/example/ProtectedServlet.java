package com.example;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.wildfly.security.http.oidc.OidcSecurityContext;

import java.io.IOException;
import java.io.PrintWriter;
import java.security.Principal;

@WebServlet("/protected/profile")
public class ProtectedServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("text/html;charset=UTF-8");
        Principal principal = req.getUserPrincipal();
        PrintWriter out = resp.getWriter();

        boolean isAdmin = req.isUserInRole("admin");

        // Get tokens from Elytron OIDC context
        String accessToken = "N/A";
        String idToken = "N/A";
        OidcSecurityContext oidcCtx = (OidcSecurityContext) req.getAttribute(OidcSecurityContext.class.getName());
        if (oidcCtx != null) {
            accessToken = oidcCtx.getTokenString() != null ? oidcCtx.getTokenString() : "N/A";
            idToken = oidcCtx.getIDTokenString() != null ? oidcCtx.getIDTokenString() : "N/A";
        }

        out.println("<!DOCTYPE html>"
            + "<html><head>"
            + "<title>Profile — WildFly Elytron OIDC Demo</title>"
            + "<link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css\" rel=\"stylesheet\"/>"
            + "</head><body class=\"bg-light\">"
            + "<nav class=\"navbar navbar-dark bg-dark mb-4\">"
            + "<div class=\"container\">"
            + "<span class=\"navbar-brand\">WildFly Elytron OIDC Demo</span>"
            + "<span class=\"text-white-50 small\">Realm: utdallas-cs</span>"
            + "</div></nav>"
            + "<div class=\"container\">"
            + "<h2>Protected Profile</h2>"
            + "<div class=\"alert alert-success\">Authenticated via Elytron OIDC</div>"
            + "<table class=\"table table-bordered\">"
            + "<tr><th>Username</th><td>" + principal.getName() + "</td></tr>"
            + "<tr><th>Is Admin</th><td>" + isAdmin + "</td></tr>"
            + "</table>"
            + "<h5 class=\"mt-4\">Tokens</h5>"
            + "<h6>Access Token</h6>"
            + "<pre style=\"word-wrap:break-word;white-space:pre-wrap;background:#f1f3f5;padding:1rem;border-radius:8px;font-size:.85rem;\">" + accessToken + "</pre>"
            + "<h6>ID Token</h6>"
            + "<pre style=\"word-wrap:break-word;white-space:pre-wrap;background:#f1f3f5;padding:1rem;border-radius:8px;font-size:.85rem;\">" + idToken + "</pre>"
            + "<a href=\"../../\" class=\"btn btn-secondary me-2\">Home</a>"
            + "<a href=\"../../j_oidc_logout\" class=\"btn btn-outline-danger\">Logout</a>"
            + "</div></body></html>");
    }
}
