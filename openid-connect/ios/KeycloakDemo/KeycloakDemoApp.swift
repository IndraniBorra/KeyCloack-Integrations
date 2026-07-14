import SwiftUI
import AppAuth

@main
struct KeycloakDemoApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    // Handle AppAuth redirect URL
                    AppAuthManager.shared.handleRedirectURL(url)
                }
        }
    }
}
