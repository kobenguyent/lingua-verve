import Foundation
import XCTest
@testable import LinguaVerveCore

private final class MockUpdateHTTPTransport: UpdateHTTPTransport, @unchecked Sendable {
    struct RecordedRequest: Sendable {
        let url: URL?
        let method: String?
        let headers: [String: String]
    }

    private let lock = NSLock()
    private var _requests: [RecordedRequest] = []
    private let handler: @Sendable (URLRequest) throws -> (Data, HTTPURLResponse)

    init(handler: @escaping @Sendable (URLRequest) throws -> (Data, HTTPURLResponse)) {
        self.handler = handler
    }

    var requests: [RecordedRequest] {
        lock.withLock { _requests }
    }

    func data(for request: URLRequest) async throws -> (Data, URLResponse) {
        let recorded = RecordedRequest(
            url: request.url,
            method: request.httpMethod,
            headers: request.allHTTPHeaderFields ?? [:]
        )
        lock.withLock { _requests.append(recorded) }
        return try handler(request)
    }
}

private final class MockUpdateService: UpdateServiceProtocol, @unchecked Sendable {
    var outcome: Result<UpdateCheckOutcome, any Error>
    var checksumValid: Bool = true
    private let lock = NSLock()
    private var _calls: [(currentVersion: String, etag: String?, force: Bool)] = []
    private var _installCalls: [(fileURL: URL, bundlePath: String, parentPID: Int32)] = []
    private var _verifyCalls: [(fileURL: URL, assetName: String)] = []

    init(outcome: Result<UpdateCheckOutcome, any Error>) {
        self.outcome = outcome
    }

    var calls: [(currentVersion: String, etag: String?, force: Bool)] {
        lock.withLock { _calls }
    }

    var installCalls: [(fileURL: URL, bundlePath: String, parentPID: Int32)] {
        lock.withLock { _installCalls }
    }

    var verifyCalls: [(fileURL: URL, assetName: String)] {
        lock.withLock { _verifyCalls }
    }

    func checkForUpdates(
        currentVersion: String,
        etag: String?,
        force: Bool
    ) async throws -> UpdateCheckOutcome {
        lock.withLock {
            _calls.append((currentVersion: currentVersion, etag: etag, force: force))
        }
        return try outcome.get()
    }

    func downloadAsset(
        from urlString: String,
        assetName: String?,
        onProgress: @escaping @Sendable (Double) -> Void
    ) async throws -> URL {
        onProgress(0.5)
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(assetName ?? "LinguaVerve.zip")
        try Data("mock-archive".utf8).write(to: url)
        onProgress(1.0)
        return url
    }

    func verifyChecksum(
        of downloadedFile: URL,
        assetName: String,
        checksumsAsset: GitHubReleaseAsset?
    ) async throws -> Bool {
        lock.withLock {
            _verifyCalls.append((fileURL: downloadedFile, assetName: assetName))
        }
        if !checksumValid {
            throw UpdateServiceError.checksumMismatch(expected: "aaaa", actual: "bbbb")
        }
        return true
    }

    func installAndRelaunch(
        downloadedFile: URL,
        currentBundlePath: String,
        parentPID: Int32
    ) throws {
        lock.withLock {
            _installCalls.append((fileURL: downloadedFile, bundlePath: currentBundlePath, parentPID: parentPID))
        }
    }
}

final class UpdateServiceTests: XCTestCase {

    func testSemanticVersionNormalizesAndComparesAccurately() {
        XCTAssertEqual(SemanticVersion.normalize("v1.0.0"), "1.0.0")
        XCTAssertEqual(SemanticVersion.normalize("  V2.1.4 "), "2.1.4")
        XCTAssertEqual(SemanticVersion.compare("1.1.0", "1.0.0"), 1)
        XCTAssertEqual(SemanticVersion.compare("1.0.0", "1.0.0"), 0)
        XCTAssertEqual(SemanticVersion.compare("0.9.9", "1.0.0"), -1)
        XCTAssertEqual(SemanticVersion.compare("1.0.0", "1.0.0-beta.1"), 1)
        XCTAssertEqual(SemanticVersion.compare("1.0.0-beta.1", "1.0.0"), -1)
        XCTAssertTrue(SemanticVersion.isNewerVersion("v1.2.0", than: "1.0.0"))
        XCTAssertFalse(SemanticVersion.isNewerVersion("v1.0.0", than: "1.0.0"))
    }

    func testPickBestNativeAssetPrioritizesMacOSZipAndUniversalAndExcludesIOSAndUntrusted() {
        let assets = [
            GitHubReleaseAsset(
                name: "LinguaVerve-1.2.0-iOS-iPadOS-unsigned.ipa",
                browser_download_url: "https://github.com/kobenguyent/lingua-verve/releases/download/v1.2.0/LinguaVerve-1.2.0-iOS-iPadOS-unsigned.ipa",
                size: 6_000_000
            ),
            GitHubReleaseAsset(
                name: "LinguaVerve-1.2.0-iOS-simulator.zip",
                browser_download_url: "https://github.com/kobenguyent/lingua-verve/releases/download/v1.2.0/LinguaVerve-1.2.0-iOS-simulator.zip",
                size: 6_100_000
            ),
            GitHubReleaseAsset(
                name: "LinguaVerve.dmg",
                browser_download_url: "https://github.com/kobenguyent/lingua-verve/releases/download/v1.2.0/LinguaVerve.dmg",
                size: 8_200_000
            ),
            GitHubReleaseAsset(
                name: "LinguaVerve-1.2.0-macOS-universal.zip",
                browser_download_url: "https://github.com/kobenguyent/lingua-verve/releases/download/v1.2.0/LinguaVerve-1.2.0-macOS-universal.zip",
                size: 7_900_000
            ),
            GitHubReleaseAsset(
                name: "SHA256SUMS.txt",
                browser_download_url: "https://github.com/kobenguyent/lingua-verve/releases/download/v1.2.0/SHA256SUMS.txt",
                size: 512
            )
        ]

        let picked = UpdateService.pickBestNativeAsset(from: assets, arch: "arm64")
        XCTAssertEqual(picked?.name, "LinguaVerve-1.2.0-macOS-universal.zip")
        XCTAssertEqual(UpdateService.pickChecksumsAsset(from: assets)?.name, "SHA256SUMS.txt")

        let untrusted = [
            GitHubReleaseAsset(
                name: "LinguaVerve.dmg",
                browser_download_url: "https://evil.example.com/LinguaVerve.dmg",
                size: 8_200_000
            ),
            GitHubReleaseAsset(
                name: "LinguaVerve.zip",
                browser_download_url: "http://github.com/kobenguyent/lingua-verve/releases/download/v1.1.0/LinguaVerve.zip",
                size: 7_400_000
            ),
        ]
        XCTAssertNil(UpdateService.pickBestNativeAsset(from: untrusted))
    }

    func testCheckForUpdatesDetectsNewerGitHubReleaseAndChecksumsAsset() async throws {
        let payload = """
        {
          "tag_name": "v1.2.0",
          "name": "LinguaVerve v1.2.0",
          "body": "### What's New\\n- Universal macOS & iOS/iPadOS release artifacts\\n- Verified SHA-256 auto-updater",
          "html_url": "https://github.com/kobenguyent/lingua-verve/releases/tag/v1.2.0",
          "published_at": "2026-11-25T12:00:00Z",
          "assets": [
            {
              "name": "LinguaVerve-1.2.0-macOS-universal.zip",
              "browser_download_url": "https://github.com/kobenguyent/lingua-verve/releases/download/v1.2.0/LinguaVerve-1.2.0-macOS-universal.zip",
              "size": 8388608
            },
            {
              "name": "SHA256SUMS.txt",
              "browser_download_url": "https://github.com/kobenguyent/lingua-verve/releases/download/v1.2.0/SHA256SUMS.txt",
              "size": 256
            }
          ]
        }
        """

        let transport = MockUpdateHTTPTransport { request in
            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 200,
                httpVersion: "HTTP/1.1",
                headerFields: ["ETag": "\"etag-120\""]
            )!
            return (Data(payload.utf8), response)
        }

        let service = UpdateService(transport: transport)
        let outcome = try await service.checkForUpdates(currentVersion: "1.0.0", etag: nil, force: false)

        guard case .updateAvailable(let update) = outcome else {
            XCTFail("Expected .updateAvailable, got \(outcome)")
            return
        }

        XCTAssertEqual(update.currentVersion, "1.0.0")
        XCTAssertEqual(update.latestVersion, "1.2.0")
        XCTAssertEqual(update.releaseName, "LinguaVerve v1.2.0")
        XCTAssertEqual(update.asset?.name, "LinguaVerve-1.2.0-macOS-universal.zip")
        XCTAssertEqual(update.checksumsAsset?.name, "SHA256SUMS.txt")
        XCTAssertEqual(update.etag, "\"etag-120\"")
    }

    func testCheckForUpdatesHandlesUpToDateAnd404NoReleaseGracefully() async throws {
        let transport404 = MockUpdateHTTPTransport { request in
            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 404,
                httpVersion: "HTTP/1.1",
                headerFields: nil
            )!
            return (Data(), response)
        }

        let service = UpdateService(transport: transport404)
        let outcome = try await service.checkForUpdates(currentVersion: "1.0.0", etag: nil, force: false)
        guard case .upToDate(let current, let latest, _, _, _, _, _, _) = outcome else {
            XCTFail("Expected .upToDate on 404, got \(outcome)")
            return
        }
        XCTAssertEqual(current, "1.0.0")
        XCTAssertEqual(latest, "1.0.0")
    }

    func testSHA256ChecksumParsingAndVerificationAcceptsMatchAndRejectsTampering() async throws {
        let tmpFile = FileManager.default.temporaryDirectory
            .appendingPathComponent("linguaverve-sha-test-\(UUID().uuidString).zip")
        try Data("LinguaVerve release payload".utf8).write(to: tmpFile)
        defer { try? FileManager.default.removeItem(at: tmpFile) }

        let realDigest = try UpdateService.sha256Hex(of: tmpFile)
        XCTAssertEqual(realDigest.count, 64)

        let sumsBody = """
        \(realDigest)  \(tmpFile.lastPathComponent)
        0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef  other.dmg
        """
        let parsed = UpdateService.parseSHA256Sums(sumsBody)
        XCTAssertEqual(parsed[tmpFile.lastPathComponent], realDigest)
        XCTAssertEqual(parsed["other.dmg"], "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef")

        let goodTransport = MockUpdateHTTPTransport { request in
            let response = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: nil)!
            return (Data(sumsBody.utf8), response)
        }
        let checksumAsset = GitHubReleaseAsset(
            name: "SHA256SUMS.txt",
            browser_download_url: "https://github.com/kobenguyent/lingua-verve/releases/download/v1.2.0/SHA256SUMS.txt",
            size: 128
        )
        let goodService = UpdateService(transport: goodTransport)
        let verified = try await goodService.verifyChecksum(
            of: tmpFile,
            assetName: tmpFile.lastPathComponent,
            checksumsAsset: checksumAsset
        )
        XCTAssertTrue(verified)

        let badSums = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff  \(tmpFile.lastPathComponent)\n"
        let badTransport = MockUpdateHTTPTransport { request in
            let response = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: nil)!
            return (Data(badSums.utf8), response)
        }
        let badService = UpdateService(transport: badTransport)
        do {
            _ = try await badService.verifyChecksum(
                of: tmpFile,
                assetName: tmpFile.lastPathComponent,
                checksumsAsset: checksumAsset
            )
            XCTFail("Expected checksumMismatch error for tampered digest")
        } catch let err as UpdateServiceError {
            guard case .checksumMismatch = err else {
                XCTFail("Unexpected UpdateServiceError: \(err)")
                return
            }
        }
    }

    func testInstallerScriptWaitsForAppExitPerformsAtomicSwapAndRelaunches() {
        let script = UpdateService.buildInstallerScript(
            downloadedFile: "/tmp/LinguaVerve.zip",
            targetAppPath: "/Applications/LinguaVerve.app",
            workDir: "/tmp",
            parentPID: 4242
        )
        XCTAssertTrue(script.contains("APP_PID=4242"))
        XCTAssertTrue(script.contains("while kill -0 \"$APP_PID\""))
        XCTAssertTrue(script.contains("NEW_STAGE=\"${TARGET_APP}.new\""))
        XCTAssertTrue(script.contains("BACKUP_APP=\"${TARGET_APP}.backup\""))
        XCTAssertTrue(script.contains("mv \"$TARGET_APP\" \"$BACKUP_APP\""))
        XCTAssertTrue(script.contains("xattr -cr \"$TARGET_APP\""))
        XCTAssertTrue(script.contains("codesign --force --deep --sign - \"$TARGET_APP\""))
        XCTAssertTrue(script.contains("hdiutil attach"))
        XCTAssertTrue(script.contains("ditto -x -k"))
        XCTAssertTrue(script.contains("open -n \"$TARGET_APP\""))
    }

    @MainActor
    func testCurriculumStoreDownloadAndInstallVerifiesChecksumLaunchesUpdaterAndClosesCurrentApp() async {
        let suiteName = "LinguaVerveUpdateTests.\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: suiteName)!
        let checksumAsset = GitHubReleaseAsset(
            name: "SHA256SUMS.txt",
            browser_download_url: "https://github.com/kobenguyent/lingua-verve/releases/download/v1.2.0/SHA256SUMS.txt",
            size: 128
        )
        let update = AvailableAppUpdate(
            currentVersion: "1.0.0",
            latestVersion: "1.2.0",
            releaseName: "LinguaVerve v1.2.0",
            releaseNotes: "New curriculum and native updates",
            releaseURL: "https://github.com/kobenguyent/lingua-verve/releases/tag/v1.2.0",
            asset: GitHubReleaseAsset(
                name: "LinguaVerve-1.2.0-macOS-universal.zip",
                browser_download_url: "https://github.com/kobenguyent/lingua-verve/releases/download/v1.2.0/LinguaVerve-1.2.0-macOS-universal.zip",
                size: 4096
            ),
            checksumsAsset: checksumAsset
        )
        let mockService = MockUpdateService(outcome: .success(.updateAvailable(update)))
        var didCloseCurrentApp = false
        let store = CurriculumStore(
            defaults: defaults,
            updateService: mockService,
            currentAppVersion: "1.0.0",
            terminationDelayMs: 0,
            terminateAppHandler: {
                didCloseCurrentApp = true
            }
        )

        // Default autoCheckForUpdates is true
        XCTAssertTrue(store.autoCheckForUpdates)

        // When disabled, automatic check is skipped
        store.autoCheckForUpdates = false
        await store.checkForUpdates(manual: false)
        XCTAssertTrue(mockService.calls.isEmpty)

        // Manual check always runs and presents update sheet
        await store.checkForUpdates(manual: true)
        XCTAssertEqual(mockService.calls.count, 1)
        XCTAssertEqual(store.availableUpdate?.latestVersion, "1.2.0")
        XCTAssertTrue(store.isUpdateSheetPresented)
        XCTAssertTrue(store.shouldShowUpdateBanner)

        // Download & install verifies checksum, starts updater with current PID, and closes current app
        await store.downloadAndInstallUpdate()
        XCTAssertEqual(mockService.verifyCalls.count, 1)
        XCTAssertEqual(mockService.verifyCalls.first?.assetName, "LinguaVerve-1.2.0-macOS-universal.zip")
        #if os(macOS)
        XCTAssertEqual(mockService.installCalls.count, 1)
        XCTAssertEqual(mockService.installCalls.first?.parentPID, ProcessInfo.processInfo.processIdentifier)
        XCTAssertEqual(store.updateDownloadState, .installing)
        XCTAssertTrue(didCloseCurrentApp, "Current app must terminate immediately after scheduling detached updater")
        #endif

        store.dismissUpdateBanner()
        XCTAssertFalse(store.shouldShowUpdateBanner)
    }
}
