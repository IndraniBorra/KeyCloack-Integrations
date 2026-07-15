package com.example;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.keycloak.adapters.saml.SamlPrincipal;
import org.keycloak.adapters.saml.SamlSession;
import org.w3c.dom.Document;

import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.security.Principal;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;

@WebServlet("/protected/profile")
public class SamlProtectedServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        Principal principal = req.getUserPrincipal();
        SamlPrincipal saml = (principal instanceof SamlPrincipal sp) ? sp : null;
        SamlSession samlSession = findSamlSession(req);

        String nameId       = saml != null ? saml.getSamlSubject() : principal.getName();
        String nameIdFormat = saml != null ? saml.getNameIDFormat() : "(unknown)";
        String sessionIndex = samlSession != null ? samlSession.getSessionIndex() : "(none)";
        String jsessionId    = req.getSession().getId();
        String notOnOrAfter  = samlSession != null && samlSession.getSessionNotOnOrAfter() != null
                ? samlSession.getSessionNotOnOrAfter().toString() : "(none)";

        StringBuilder sb = new StringBuilder();
        sb.append("""
            <!DOCTYPE html>
            <html>
            <head>
              <title>Protected Page — Keycloak WildFly SAML</title>
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"/>
            </head>
            <body class="bg-light">
              <nav class="navbar navbar-dark bg-dark mb-4">
                <div class="container">
                  <span class="navbar-brand">Keycloak WildFly SAML Demo</span>
                  <span class="text-white-50 small">Realm: utdallas-cs | Protocol: SAML</span>
                </div>
              </nav>
              <div class="container">
                <h2>Protected Page (SAML)</h2>
                <div class="alert alert-success">You are authenticated!</div>
                <table class="table table-bordered bg-white">
            """);
        row(sb, "NameID (Username)", nameId);
        row(sb, "NameID Format", nameIdFormat);
        row(sb, "Roles / Attributes", attributesSummary(saml));
        row(sb, "SAML SessionIndex", sessionIndex);
        row(sb, "Session Not-On-Or-After", notOnOrAfter);
        row(sb, "JSESSIONID (server session)", jsessionId);
        sb.append("""
                </table>

                <h5 class="mt-4">SAML Assertion</h5>
                <p class="text-muted small">SAML has no JWT id_token/access_token. The credential is this
                signed <strong>assertion</strong> (the SAML equivalent of an ID token). Keycloak validates and
                consumes it server-side; the browser holds only the JSESSIONID cookie above, which is bound to
                the SAML SessionIndex for single logout.</p>

                <h6>Assertion (XML)</h6>
                <pre style="max-height:420px;overflow:auto;white-space:pre-wrap;word-wrap:break-word;background:#f1f3f5;padding:1rem;border-radius:8px;font-size:.8rem;">""");
        sb.append(htmlEscape(assertionXml(saml)));
        sb.append("""
                </pre>

                <a href="../../" class="btn btn-secondary me-2">Home</a>
                <a href="../../saml?GLO=true" class="btn btn-outline-danger">SAML Logout</a>
              </div>
            </body>
            </html>
            """);

        out.println(sb.toString());
    }

    /** The Keycloak SAML adapter stores its SamlSession in the HTTP session; find it by type. */
    private static SamlSession findSamlSession(HttpServletRequest req) {
        var session = req.getSession(false);
        if (session == null) return null;
        Enumeration<String> names = session.getAttributeNames();
        while (names.hasMoreElements()) {
            Object v = session.getAttribute(names.nextElement());
            if (v instanceof SamlSession ss) return ss;
        }
        return null;
    }

    private static String attributesSummary(SamlPrincipal saml) {
        if (saml == null) return "(unavailable)";
        Map<String, List<String>> attrs = saml.getAttributes();
        if (attrs == null || attrs.isEmpty()) return "(none)";
        StringBuilder s = new StringBuilder();
        attrs.forEach((k, v) -> s.append(k).append(" = ").append(String.join(", ", v)).append("<br/>"));
        return s.toString();
    }

    private static String assertionXml(SamlPrincipal saml) {
        if (saml == null) return "(no SAML principal on this request)";
        Document doc = saml.getAssertionDocument();
        if (doc == null) return "(assertion DOM not retained by the adapter)";
        try {
            Transformer t = TransformerFactory.newInstance().newTransformer();
            t.setOutputProperty(OutputKeys.INDENT, "yes");
            t.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");
            StringWriter sw = new StringWriter();
            t.transform(new DOMSource(doc), new StreamResult(sw));
            return sw.toString();
        } catch (Exception e) {
            return "(could not serialize assertion: " + e.getMessage() + ")";
        }
    }

    private static void row(StringBuilder sb, String label, String valueHtml) {
        sb.append("<tr><th style=\"width:260px\">").append(htmlEscape(label))
          .append("</th><td>").append(valueHtml == null ? "" : valueHtml).append("</td></tr>");
    }

    private static String htmlEscape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
