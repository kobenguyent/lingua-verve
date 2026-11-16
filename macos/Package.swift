// swift-tools-version: 5.10
import PackageDescription

let package = Package(
    name: "LinguaVerve",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(name: "LinguaVerve", targets: ["LinguaVerve"]),
        .library(name: "LinguaVerveCore", targets: ["LinguaVerveCore"])
    ],
    targets: [
        .target(
            name: "LinguaVerveCore",
            path: "Sources/LinguaVerveCore",
            resources: [
                .copy("Resources/curriculum.json")
            ]
        ),
        .executableTarget(
            name: "LinguaVerve",
            dependencies: ["LinguaVerveCore"],
            path: "Sources/LinguaVerve"
        ),
        .testTarget(
            name: "LinguaVerveTests",
            dependencies: ["LinguaVerveCore"],
            path: "Tests/LinguaVerveTests"
        )
    ]
)
