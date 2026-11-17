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
    private let lock = NSLock()
    private var _calls: [(currentVersion: String, etag: String?, force: Bool)] = []

    init(outcome: Result<UpdateCheckOutcome, any Error>) {
        self.outcome = outcome
    }

    var calls: [(currentVersion: String, etag: String?, force: Bool)] {
        lock.withLock { _calls }
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
        onProgress(1.0)
        return FileManager.default.temporaryDirectory.appendingPathComponent(assetName ?? "LinguaVerve.dmg")
    }

    func installAndRelaunch(downloadedFile: URL, currentBundlePath: String) throws {}
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

    func testPickBestNativeAssetPrioritizesMacOSZipAndDmgAndRejectsUntrustedHosts() {
        let assets = [
            GitHubReleaseAsset(
                name: "LinguaVerve.dmg",
                browser_download_url: "https://github.com/kobenguyent/lingua-verve/releases/download/v1.1.0/LinguaVerve.dmg",
                size: 8_200_000
            ),
            GitHubReleaseAsset(
                name: "LinguaVerve-1.1.0-macOS-arm64.zip",
                browser_download_url: "https://github.com/kobenguyent/lingua-verve/releases/download/v1.1.0/LinguaVerve-1.1.0-macOS-arm64.zip",
                size: 7_400_000
            ),
        ]

        let picked = UpdateService.pickBestNativeAsset(from: assets, arch: "arm64")
        XCTAssertEqual(picked?.name, "LinguaVerve-1.1.0-macOS-arm64.zip")

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

    func testCheckForUpdatesDetectsNewerGitHubRelease() async throws {
        let payload = """
        {
          "tag_name": "v1.2.0",
          "name": "LinguaVerve v1.2.0",
          "body": "### What's New\\n- Native macOS GitHub Releases auto-updater",
          "html_url": "https://github.com/kobenguyent/lingua-verve/releases/tag/v1.2.0",
          "published_at": "2026-11-17T12:00:00Z",
          "assets": [
            {
              "name": "LinguaVerve.dmg",
              "browser_download_url": "https://github.com/kobenguyent/lingua-verve/releases/download/v1.2.0/LinguaVerve.dmg",
              "size": 8388608
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
        XCTAssertEqual(update.asset?.name, "LinguaVerve.dmg")
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

    func testInstallerScriptContainsQuarantineAndCodesignCommands() {
        let script = UpdateService.buildInstallerScript(
            downloadedFile: "/tmp/LinguaVerve.dmg",
            targetAppPath: "/Applications/LinguaVerve.app",
            workDir: "/tmp"
        )
        XCTAssertTrue(script.contains("xattr -cr \"$TARGET_APP\""))
        XCTAssertTrue(script.contains("codesign --force --deep --sign - \"$TARGET_APP\""))
        XCTAssertTrue(script.contains("hdiutil attach"))
        XCTAssertTrue(script.contains("ditto -x -k"))
    }

    @MainActor
    func testCurriculumStoreUpdateCheckFlowAndAutoCheckPreference() async {
        let suiteName = "LinguaVerveUpdateTests.\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: suiteName)!
        let update = AvailableAppUpdate(
            currentVersion: "1.0.0",
            latestVersion: "1.2.0",
            releaseName: "LinguaVerve v1.2.0",
            releaseNotes: "New curriculum and native updates",
            releaseURL: "https://github.com/kobenguyent/lingua-verve/releases/tag/v1.2.0",
            asset: GitHubReleaseAsset(
                name: "LinguaVerve.dmg",
                browser_download_url: "https://github.com/kobenguyent/lingua-verve/releases/download/v1.2.0/LinguaVerve.dmg",
                size: 4096
            )
        )
        let mockService = MockUpdateService(outcome: .success(.updateAvailable(update)))
        let store = CurriculumStore(
            defaults: defaults,
            updateService: mockService,
            currentAppVersion: "1.0.0"
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

        store.dismissUpdateBanner()
        XCTAssertFalse(store.shouldShowUpdateBanner)
    }
}
