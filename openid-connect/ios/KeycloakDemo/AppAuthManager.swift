import Foundation
import AppAuth

class AppAuthManager: ObservableObject {

    static let shared = AppAuthManager()

    private let issuerURL      = URL(string: "https://auth.savvytechies.com/realms/utdallas-cs")!
    private let clientID       = "ios-client"
    private let redirectURI    = URL(string: "com.example.keycloakdemo:/oauth2redirect")!
    private let scopes         = [OIDScopeOpenID, OIDScopeProfile, "email"]

    @Published var isAuthenticated = false
    @Published var userInfo: [String: String] = [:]
    @Published var accessToken: String = ""
    @Published var idToken: String = ""
    @Published var errorMessage: String?

    private var authState: OIDAuthState?
    private var currentAuthFlow: OIDExternalUserAgentSession?

    // MARK: - Login

    func login(presentingViewController: UIViewController) {
        OIDAuthorizationService.discoverConfiguration(forIssuer: issuerURL) { [weak self] config, error in
            guard let self = self else { return }
            if let error = error {
                DispatchQueue.main.async { self.errorMessage = "Discovery failed: \(error.localizedDescription)" }
                return
            }
            guard let config = config else { return }

            let request = OIDAuthorizationRequest(
                configuration: config,
                clientId: self.clientID,
                clientSecret: nil,
                scopes: self.scopes,
                redirectURL: self.redirectURI,
                responseType: OIDResponseTypeCode,
                additionalParameters: nil
            )

            self.currentAuthFlow = OIDAuthState.authState(
                byPresenting: request,
                presenting: presentingViewController
            ) { authState, error in
                DispatchQueue.main.async {
                    if let authState = authState {
                        self.authState = authState
                        self.isAuthenticated = true
                        self.accessToken = authState.lastTokenResponse?.accessToken ?? "N/A"
                        self.idToken = authState.lastTokenResponse?.idToken ?? "N/A"
                        self.fetchUserInfo()
                    } else {
                        self.errorMessage = error?.localizedDescription ?? "Login failed"
                    }
                }
            }
        }
    }

    // MARK: - Fetch UserInfo

    func fetchUserInfo() {
        guard let accessToken = authState?.lastTokenResponse?.accessToken else { return }

        let userInfoURL = URL(string: "https://auth.savvytechies.com/realms/utdallas-cs/protocol/openid-connect/userinfo")!
        var request = URLRequest(url: userInfoURL)
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")

        URLSession.shared.dataTask(with: request) { [weak self] data, _, error in
            guard let data = data, error == nil,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return }

            DispatchQueue.main.async {
                self?.userInfo = [
                    "Username": json["preferred_username"] as? String ?? "N/A",
                    "Email":    json["email"]              as? String ?? "N/A",
                    "Name":     json["name"]               as? String ?? "N/A",
                    "Subject":  json["sub"]                as? String ?? "N/A",
                ]
            }
        }.resume()
    }

    // MARK: - Handle Redirect URL (called from App.onOpenURL)

    func handleRedirectURL(_ url: URL) {
        currentAuthFlow?.resumeExternalUserAgentFlow(with: url)
    }

    // MARK: - Logout

    func logout() {
        authState = nil
        isAuthenticated = false
        userInfo = [:]
        accessToken = ""
        idToken = ""
    }
}
