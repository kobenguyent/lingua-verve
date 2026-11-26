#if os(macOS)
import Foundation
import XCTest

final class SelectXcodeScriptTests: XCTestCase {
    private struct FakeXcodeSpec {
        let name: String
        let xcodeVersion: String
        let macOSVersion: String
        let iOSVersion: String
        let iOSSimulatorVersion: String
    }

    private var repoRoot: URL {
        URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent() // LinguaVerveTests
            .deletingLastPathComponent() // Tests
            .deletingLastPathComponent() // macos
            .deletingLastPathComponent() // repo root
    }

    private var selectXcodeScriptURL: URL {
        repoRoot.appendingPathComponent("scripts/select-xcode.sh")
    }

    private func makeTempDirectory() throws -> URL {
        let dir = FileManager.default.temporaryDirectory
            .appendingPathComponent("SelectXcodeScriptTests-\(UUID().uuidString)", isDirectory: true)
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        if let resolvedPtr = realpath(dir.path, nil) {
            defer { free(resolvedPtr) }
            return URL(fileURLWithPath: String(cString: resolvedPtr), isDirectory: true)
        }
        return dir.resolvingSymlinksInPath()
    }

    private func plistData(key: String, value: String) -> Data {
        let xml = """
        <?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
        <plist version="1.0">
        <dict>
            <key>\(key)</key>
            <string>\(value)</string>
        </dict>
        </plist>
        """
        return Data(xml.utf8)
    }

    private func createFakeXcode(_ spec: FakeXcodeSpec, in root: URL) throws {
        let fm = FileManager.default
        let appURL = root.appendingPathComponent(spec.name, isDirectory: true)
        let contentsURL = appURL.appendingPathComponent("Contents", isDirectory: true)
        let devURL = contentsURL.appendingPathComponent("Developer", isDirectory: true)

        try fm.createDirectory(at: devURL, withIntermediateDirectories: true)
        try plistData(key: "CFBundleShortVersionString", value: spec.xcodeVersion)
            .write(to: contentsURL.appendingPathComponent("Info.plist"))

        let sdks: [(platform: String, sdk: String, version: String)] = [
            ("MacOSX.platform", "MacOSX.sdk", spec.macOSVersion),
            ("iPhoneOS.platform", "iPhoneOS.sdk", spec.iOSVersion),
            ("iPhoneSimulator.platform", "iPhoneSimulator.sdk", spec.iOSSimulatorVersion),
        ]

        for entry in sdks {
            let sdkDir = devURL
                .appendingPathComponent("Platforms", isDirectory: true)
                .appendingPathComponent(entry.platform, isDirectory: true)
                .appendingPathComponent("Developer/SDKs", isDirectory: true)
                .appendingPathComponent(entry.sdk, isDirectory: true)
            try fm.createDirectory(at: sdkDir, withIntermediateDirectories: true)
            try plistData(key: "Version", value: entry.version)
                .write(to: sdkDir.appendingPathComponent("SDKSettings.plist"))
        }
    }

    private func createRunnerFixture(in root: URL) throws {
        let specs = [
            FakeXcodeSpec(name: "Xcode_26.0.1.app", xcodeVersion: "26.0.1", macOSVersion: "26.0", iOSVersion: "26.0", iOSSimulatorVersion: "26.0"),
            FakeXcodeSpec(name: "Xcode_26.1.1.app", xcodeVersion: "26.1.1", macOSVersion: "26.1", iOSVersion: "26.1", iOSSimulatorVersion: "26.1"),
            FakeXcodeSpec(name: "Xcode_26.2.app", xcodeVersion: "26.2", macOSVersion: "26.2", iOSVersion: "26.2", iOSSimulatorVersion: "26.2"),
            FakeXcodeSpec(name: "Xcode_26.5.app", xcodeVersion: "26.5", macOSVersion: "26.5", iOSVersion: "26.5", iOSSimulatorVersion: "26.5"),
            FakeXcodeSpec(name: "Xcode_26.6.app", xcodeVersion: "26.6", macOSVersion: "26.5", iOSVersion: "26.5", iOSSimulatorVersion: "26.5"),
        ]
        for spec in specs {
            try createFakeXcode(spec, in: root)
        }
        try FileManager.default.createSymbolicLink(
            at: root.appendingPathComponent("Xcode.app"),
            withDestinationURL: URL(fileURLWithPath: "Xcode_26.6.app")
        )
    }

    private func runSelectXcode(
        arguments: [String] = [],
        environmentOverrides: [String: String?]
    ) throws -> (status: Int32, stdout: String, stderr: String) {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/bin/bash")
        process.arguments = [selectXcodeScriptURL.path] + arguments

        var env = ProcessInfo.processInfo.environment
        for (key, value) in environmentOverrides {
            if let value {
                env[key] = value
            } else {
                env.removeValue(forKey: key)
            }
        }
        process.environment = env

        let stdoutPipe = Pipe()
        let stderrPipe = Pipe()
        process.standardOutput = stdoutPipe
        process.standardError = stderrPipe

        try process.run()
        process.waitUntilExit()

        let stdoutData = stdoutPipe.fileHandleForReading.readDataToEndOfFile()
        let stderrData = stderrPipe.fileHandleForReading.readDataToEndOfFile()
        let stdout = String(decoding: stdoutData, as: UTF8.self).trimmingCharacters(in: .whitespacesAndNewlines)
        let stderr = String(decoding: stderrData, as: UTF8.self).trimmingCharacters(in: .whitespacesAndNewlines)
        return (process.terminationStatus, stdout, stderr)
    }

    func testSelectsNewestXcodeWithInstalledIOSSimulatorRuntimeUnderUTF8Locale() throws {
        let tempDir = try makeTempDirectory()
        defer { try? FileManager.default.removeItem(at: tempDir) }
        try createRunnerFixture(in: tempDir)

        let result = try runSelectXcode(
            arguments: ["--require-ios-simulator"],
            environmentOverrides: [
                "LC_ALL": "en_US.UTF-8",
                "XCODE_SEARCH_DIR": tempDir.path,
                "AVAILABLE_IOS_SIM_RUNTIMES": "26.2\n26.4\n26.5",
                "DEVELOPER_DIR": nil,
            ]
        )

        XCTAssertEqual(result.status, 0, "stderr: \(result.stderr)")
        XCTAssertEqual(
            result.stdout,
            tempDir.appendingPathComponent("Xcode_26.6.app/Contents/Developer").path
        )
    }

    func testPrefersXcodeMatchingInstalledSimulatorRuntimeOverNewerXcodeWithoutRuntime() throws {
        let tempDir = try makeTempDirectory()
        defer { try? FileManager.default.removeItem(at: tempDir) }
        try createRunnerFixture(in: tempDir)
        try createFakeXcode(
            FakeXcodeSpec(name: "Xcode_27.0.app", xcodeVersion: "27.0", macOSVersion: "27.0", iOSVersion: "27.0", iOSSimulatorVersion: "27.0"),
            in: tempDir
        )

        let iosResult = try runSelectXcode(
            arguments: ["--require-ios-simulator"],
            environmentOverrides: [
                "LC_ALL": "en_US.UTF-8",
                "XCODE_SEARCH_DIR": tempDir.path,
                "AVAILABLE_IOS_SIM_RUNTIMES": "26.5",
                "DEVELOPER_DIR": nil,
            ]
        )
        XCTAssertEqual(iosResult.status, 0, "stderr: \(iosResult.stderr)")
        XCTAssertEqual(
            iosResult.stdout,
            tempDir.appendingPathComponent("Xcode_26.6.app/Contents/Developer").path
        )

        let macOSResult = try runSelectXcode(
            arguments: [],
            environmentOverrides: [
                "LC_ALL": "en_US.UTF-8",
                "XCODE_SEARCH_DIR": tempDir.path,
                "AVAILABLE_IOS_SIM_RUNTIMES": "26.5",
                "DEVELOPER_DIR": nil,
            ]
        )
        XCTAssertEqual(macOSResult.status, 0, "stderr: \(macOSResult.stderr)")
        XCTAssertEqual(
            macOSResult.stdout,
            tempDir.appendingPathComponent("Xcode_27.0.app/Contents/Developer").path
        )
    }

    func testRespectsExplicitDeveloperDirOverride() throws {
        let customPath = "/custom/Xcode.app/Contents/Developer"
        let result = try runSelectXcode(
            arguments: ["--require-ios-simulator"],
            environmentOverrides: [
                "DEVELOPER_DIR": customPath,
            ]
        )

        XCTAssertEqual(result.status, 0, "stderr: \(result.stderr)")
        XCTAssertEqual(result.stdout, customPath)
    }

    func testBuildScriptsUseSharedSelectXcodeHelper() throws {
        let appleScript = try String(contentsOf: repoRoot.appendingPathComponent("scripts/build-apple-apps.sh"), encoding: .utf8)
        let macosScript = try String(contentsOf: repoRoot.appendingPathComponent("scripts/build-macos-app.sh"), encoding: .utf8)

        XCTAssertTrue(appleScript.contains("scripts/select-xcode.sh"))
        XCTAssertTrue(appleScript.contains("select_best_xcode --require-ios-simulator"))
        XCTAssertFalse(appleScript.contains("BEST_SDK_MAJOR"))

        XCTAssertTrue(macosScript.contains("scripts/select-xcode.sh"))
        XCTAssertTrue(macosScript.contains("select_best_xcode"))
        XCTAssertFalse(macosScript.contains("BEST_SDK_MAJOR"))
    }
}
#endif
