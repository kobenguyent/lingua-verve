// swift-tools-version: 5.10
import PackageDescription

let package = Package(
    name: "LinguaVerve",
    platforms: [
        .macOS(.v14),
        .iOS(.v17)
    ],
    products: [
        .executable(name: "LinguaVerve", targets: ["LinguaVerve"]),
        .library(name: "LinguaVerveCore", targets: ["LinguaVerveCore"]),
        .library(name: "LinguaVerveUI", targets: ["LinguaVerveUI"])
    ],
    targets: [
        .target(
            name: "LinguaVerveCore",
            path: "Sources/LinguaVerveCore",
            resources: [
                .copy("Resources/curriculum.json")
            ]
        ),
        .target(
            name: "LinguaVerveUI",
            dependencies: ["LinguaVerveCore"],
            path: "Sources/LinguaVerveUI"
        ),
        .executableTarget(
            name: "LinguaVerve",
            dependencies: ["LinguaVerveCore", "LinguaVerveUI"],
            path: "Sources/LinguaVerve"
        ),
        .testTarget(
            name: "LinguaVerveTests",
            dependencies: ["LinguaVerveCore", "LinguaVerveUI"],
            path: "Tests/LinguaVerveTests"
        )
    ]
)
