package com.example.keycloak;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
public class DemoController {

    @GetMapping("/")
    public String home(@AuthenticationPrincipal OidcUser user, Model model) {
        model.addAttribute("user", user);
        return "home";
    }

    @GetMapping("/public")
    public String publicPage(Model model) {
        model.addAttribute("message", "This page is public — no login required.");
        return "public";
    }

    @GetMapping("/profile")
    public String profile(@AuthenticationPrincipal OidcUser user,
                          @RegisteredOAuth2AuthorizedClient("keycloak") OAuth2AuthorizedClient client,
                          Model model) {
        model.addAttribute("user", user);
        List<String> roles = user.getAuthorities().stream()
            .map(a -> a.getAuthority().replace("ROLE_", ""))
            .filter(r -> !r.startsWith("default-"))
            .collect(Collectors.toList());
        model.addAttribute("roles", roles);
        model.addAttribute("accessToken", client.getAccessToken().getTokenValue());
        model.addAttribute("idToken", user.getIdToken().getTokenValue());
        return "profile";
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('admin')")
    public String admin(@AuthenticationPrincipal OidcUser user, Model model) {
        model.addAttribute("user", user);
        return "admin";
    }
}
