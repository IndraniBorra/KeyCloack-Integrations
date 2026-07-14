import SwiftUI
import UIKit

struct ContentView: View {

    @StateObject private var authManager = AppAuthManager.shared

    var body: some View {
        NavigationView {
            VStack(alignment: .leading, spacing: 20) {

                // Header
                VStack(alignment: .leading, spacing: 4) {
                    Text("Keycloak iOS Demo")
                        .font(.title2).bold()
                    Text("Realm: utdallas-cs")
                        .font(.subheadline).foregroundColor(.secondary)
                }
                .padding(.top)

                Divider()

                if authManager.isAuthenticated {
                    // Profile card
                    VStack(alignment: .leading, spacing: 12) {
                        Label("Authenticated", systemImage: "checkmark.shield.fill")
                            .foregroundColor(.green)
                            .font(.headline)

                        ForEach(authManager.userInfo.sorted(by: { $0.key < $1.key }), id: \.key) { key, value in
                            HStack(alignment: .top) {
                                Text(key + ":")
                                    .font(.subheadline).bold()
                                    .frame(width: 90, alignment: .leading)
                                Text(value)
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                Spacer()
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)

                    // Tokens card
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Tokens")
                            .font(.headline)
                        Text("Access Token:")
                            .font(.caption).bold()
                        Text(authManager.accessToken)
                            .font(.system(size: 9, design: .monospaced))
                            .foregroundColor(.secondary)
                            .textSelection(.enabled)
                        Text("ID Token:")
                            .font(.caption).bold()
                            .padding(.top, 4)
                        Text(authManager.idToken)
                            .font(.system(size: 9, design: .monospaced))
                            .foregroundColor(.secondary)
                            .textSelection(.enabled)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)

                    Button(role: .destructive) {
                        authManager.logout()
                    } label: {
                        Label("Logout", systemImage: "arrow.backward.circle")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.red)

                } else {
                    // Login section
                    VStack(alignment: .leading, spacing: 8) {
                        Label("Not authenticated", systemImage: "person.slash")
                            .foregroundColor(.secondary)

                        if let error = authManager.errorMessage {
                            Text(error)
                                .font(.caption)
                                .foregroundColor(.red)
                        }
                    }

                    Button {
                        if let vc = UIApplication.shared.connectedScenes
                            .compactMap({ $0 as? UIWindowScene })
                            .first?.windows.first?.rootViewController {
                            authManager.login(presentingViewController: vc)
                        }
                    } label: {
                        Label("Login with Keycloak", systemImage: "lock.open.fill")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                }

                Spacer()

                // Integration info
                VStack(alignment: .leading, spacing: 4) {
                    Text("Integration Details")
                        .font(.caption).bold().foregroundColor(.secondary)
                    Text("Library: AppAuth-iOS (Swift Package Manager)")
                        .font(.caption2).foregroundColor(.secondary)
                    Text("Flow: Authorization Code + PKCE (S256)")
                        .font(.caption2).foregroundColor(.secondary)
                    Text("Issuer: auth.savvytechies.com/realms/utdallas-cs")
                        .font(.caption2).foregroundColor(.secondary)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(8)
            }
            .padding()
            .navigationTitle("Keycloak Demo")
        }
    }
}

#Preview {
    ContentView()
}
