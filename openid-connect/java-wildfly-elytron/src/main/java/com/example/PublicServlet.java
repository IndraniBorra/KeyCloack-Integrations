package com.example;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/")
public class PublicServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        boolean loggedIn = req.getUserPrincipal() != null;
        out.println("""
            <!DOCTYPE html>
            <html>
            <head>
              <title>WildFly Elytron OIDC Demo</title>
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"/>
            </head>
            <body class="bg-light">
              <nav class="navbar navbar-dark bg-dark mb-4">
                <div class="container">
                  <span class="navbar-brand">WildFly Elytron OIDC Demo</span>
                  <span class="text-white-50 small">Realm: utdallas-cs</span>
                </div>
              </nav>
              <div class="container">
                <h2>Home (Public)</h2>
            """ +
            (loggedIn
                ? "<div class=\"alert alert-success\">Logged in as: <strong>" + req.getUserPrincipal().getName() + "</strong></div>"
                  + "<a href=\"protected/profile\" class=\"btn btn-primary me-2\">Protected Profile</a>"
                  + "<a href=\"j_oidc_logout\" class=\"btn btn-outline-danger\">Logout</a>"
                : "<div class=\"alert alert-secondary\">You are not logged in.</div>"
                  + "<a href=\"protected/profile\" class=\"btn btn-primary\">Login via Protected Page</a>")
            + """
              </div>
            </body>
            </html>
            """);
    }
}
