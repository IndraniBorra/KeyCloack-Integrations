// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "KeycloakDemo",
    platforms: [.iOS(.v16)],
    dependencies: [
        .package(
            url: "https://github.com/openid/AppAuth-iOS.git",
            from: "1.7.5"
        )
    ],
    targets: [
        .target(
            name: "KeycloakDemo",
            dependencies: [
                .product(name: "AppAuth", package: "AppAuth-iOS")
            ],
            path: "KeycloakDemo"
        )
    ]
)
