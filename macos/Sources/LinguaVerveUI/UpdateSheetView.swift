import SwiftUI
import LinguaVerveCore

public struct UpdateNotificationBanner: View {
    @Bindable var store: CurriculumStore
    let update: AvailableAppUpdate

    public init(store: CurriculumStore, update: AvailableAppUpdate) {
        self.store = store
        self.update = update
    }

    public var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "arrow.down.circle.fill")
                .scaledFont(size: 14)
                .foregroundStyle(BrandTheme.emeraldMint)

            Text("New release: **LinguaVerve v\(update.latestVersion)** (installed: v\(store.currentAppVersion))")
                .scaledFont(size: 12)
                .lineLimit(1)

            statusAccessory

            Spacer()

            #if os(macOS)
            if case .ready = store.updateDownloadState {
                Button {
                    store.installReadyUpdate()
                } label: {
                    Label("Close App & Install", systemImage: "arrow.triangle.2.circlepath")
                }
                .buttonStyle(.borderedProminent)
                .tint(BrandTheme.emeraldMint)
                .controlSize(.small)
            } else {
                Button {
                    Task { await store.downloadAndInstallUpdate() }
                } label: {
                    Label("Download & Update", systemImage: "arrow.down.to.line")
                }
                .buttonStyle(.borderedProminent)
                .tint(BrandTheme.celestialSky)
                .controlSize(.small)
                .disabled(isBusy)
            }
            #else
            Button {
                store.openReleasePage()
            } label: {
                Label("Get Release", systemImage: "arrow.up.right.square")
            }
            .buttonStyle(.borderedProminent)
            .tint(BrandTheme.celestialSky)
            .controlSize(.small)
            #endif

            Button("Notes…") {
                store.isUpdateSheetPresented = true
            }
            .controlSize(.small)

            Button("Later") {
                store.dismissUpdateBanner()
            }
            .controlSize(.small)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(BrandTheme.celestialSky.opacity(0.12))
    }

    @ViewBuilder
    private var statusAccessory: some View {
        switch store.updateDownloadState {
        case .downloading(let progress):
            ProgressView(value: progress, total: 1.0)
                .frame(width: 96)
            Text("\(Int(progress * 100))%")
                .scaledFont(size: 11, design: .monospaced)
                .foregroundStyle(.secondary)
        case .verifying:
            ProgressView().controlSize(.small)
            Text("Verifying SHA-256…")
                .scaledFont(size: 11)
                .foregroundStyle(.secondary)
        case .installing:
            ProgressView().controlSize(.small)
            Text("Closing app to update…")
                .scaledFont(size: 11, weight: .semibold)
                .foregroundStyle(BrandTheme.emeraldMint)
        default:
            EmptyView()
        }
    }

    private var isBusy: Bool {
        switch store.updateDownloadState {
        case .downloading, .verifying, .installing:
            return true
        default:
            return false
        }
    }
}

public struct UpdateSheetView: View {
    @Bindable var store: CurriculumStore
    @Environment(\.dismiss) private var dismiss

    public init(store: CurriculumStore) {
        self.store = store
    }

    public var body: some View {
        let hasUpdate = store.isUpdateAvailable
        let latestVersion = store.availableUpdate?.latestVersion ?? store.latestKnownVersion
        let asset = store.availableUpdate?.asset ?? store.latestReleaseAsset
        let hasChecksums = (store.availableUpdate?.checksumsAsset ?? store.latestChecksumsAsset) != nil
        let releaseName = store.availableUpdate?.releaseName ?? store.latestReleaseName ?? "Release Notes"
        let releaseNotes = store.availableUpdate?.releaseNotes ?? store.latestReleaseNotes

        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 12) {
                BrandCrestView(size: 38)

                VStack(alignment: .leading, spacing: 2) {
                    Text(hasUpdate ? "New Version Available" : "LinguaVerve Software Update")
                        .scaledFont(size: 17, weight: .bold, design: .serif)
                    Text("Source: GitHub Releases (\(UpdateService.repoOwner)/\(UpdateService.repoName))")
                        .scaledFont(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Button {
                    Task { await store.checkForUpdates(manual: true) }
                } label: {
                    if store.isCheckingForUpdates {
                        ProgressView().controlSize(.small)
                    } else {
                        Label("Check Now", systemImage: "arrow.triangle.2.circlepath")
                    }
                }
                .controlSize(.small)
                .disabled(store.isCheckingForUpdates || isBusy)
            }

            Divider()

            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("INSTALLED VERSION")
                        .scaledFont(.caption2, weight: .semibold)
                        .foregroundStyle(.secondary)
                    Text("v\(store.currentAppVersion)")
                        .scaledFont(size: 15, weight: .bold, design: .monospaced)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(10)
                .background(Color.secondary.opacity(0.08), in: RoundedRectangle(cornerRadius: 8))

                Image(systemName: "arrow.right")
                    .foregroundStyle(.secondary)

                VStack(alignment: .leading, spacing: 4) {
                    Text("LATEST GITHUB RELEASE")
                        .scaledFont(.caption2, weight: .semibold)
                        .foregroundStyle(.secondary)
                    Text(latestVersion.map { "v\($0)" } ?? (store.isCheckingForUpdates ? "Checking…" : "v\(store.currentAppVersion)"))
                        .scaledFont(size: 15, weight: .bold, design: .monospaced)
                        .foregroundStyle(hasUpdate ? BrandTheme.emeraldMint : .primary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(10)
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(hasUpdate ? BrandTheme.emeraldMint.opacity(0.14) : Color.secondary.opacity(0.08))
                )
            }

            if let err = store.updateCheckError {
                Label(err, systemImage: "exclamationmark.triangle.fill")
                    .scaledFont(.caption)
                    .foregroundStyle(.red)
            }

            if let asset {
                HStack(spacing: 6) {
                    Image(systemName: "shippingbox.fill")
                        .scaledFont(.caption)
                        .foregroundStyle(.secondary)
                    Text("Asset: \(asset.name)")
                        .scaledFont(size: 11, design: .monospaced)
                        .lineLimit(1)
                    if asset.size > 0 {
                        Text("(\(ByteCountFormatter.string(fromByteCount: asset.size, countStyle: .file)))")
                            .scaledFont(.caption)
                            .foregroundStyle(.secondary)
                    }
                    if hasChecksums {
                        Label("SHA-256", systemImage: "checkmark.shield.fill")
                            .scaledFont(.caption2, weight: .semibold)
                            .foregroundStyle(BrandTheme.emeraldMint)
                    }
                    Spacer()
                    if let checkedAt = store.lastUpdateCheckDate {
                        Text("Checked \(checkedAt, style: .relative) ago")
                            .scaledFont(.caption2)
                            .foregroundStyle(.tertiary)
                    }
                }
            }

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(releaseName)
                        .scaledFont(.subheadline, weight: .semibold)
                    Spacer()
                    Button("View on GitHub ↗") {
                        store.openReleasePage()
                    }
                    #if os(macOS)
                    .buttonStyle(.link)
                    #endif
                    .scaledFont(.caption)
                }

                ScrollView {
                    Text(
                        (releaseNotes?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty == false)
                            ? releaseNotes!
                            : (hasUpdate
                                ? "A new release of LinguaVerve is available on GitHub Releases."
                                : "You are running the latest version of LinguaVerve (v\(store.currentAppVersion)).")
                    )
                    .scaledFont(size: 11.5, design: .monospaced)
                    .textSelection(.enabled)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(10)
                }
                .frame(minHeight: 130, maxHeight: 200)
                .background(Color.secondary.opacity(0.07), in: RoundedRectangle(cornerRadius: 8))
            }

            Toggle("Automatically check GitHub Releases for updates on launch & every 6 hours", isOn: $store.autoCheckForUpdates)
                .scaledFont(.caption)

            switch store.updateDownloadState {
            case .idle:
                EmptyView()
            case .downloading(let progress):
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("Downloading release from GitHub Releases…")
                            .scaledFont(.caption, weight: .medium)
                        Spacer()
                        Text("\(Int(progress * 100))%")
                            .scaledFont(size: 11, weight: .semibold, design: .monospaced)
                    }
                    ProgressView(value: progress, total: 1.0)
                }
            case .verifying:
                HStack(spacing: 8) {
                    ProgressView().controlSize(.small)
                    Text("Verifying SHA-256 checksum against GitHub Release…")
                        .scaledFont(.caption, weight: .medium)
                }
            case .ready(let fileURL):
                Label("Verified \(fileURL.lastPathComponent) — closing current app to install & relaunch!", systemImage: "checkmark.circle.fill")
                    .scaledFont(.caption, weight: .semibold)
                    .foregroundStyle(BrandTheme.emeraldMint)
            case .installing:
                HStack(spacing: 8) {
                    ProgressView().controlSize(.small)
                    Text("Closing current LinguaVerve app to install update and relaunch…")
                        .scaledFont(.caption, weight: .semibold)
                        .foregroundStyle(BrandTheme.emeraldMint)
                }
            case .failed(let msg):
                Label(msg, systemImage: "xmark.octagon.fill")
                    .scaledFont(.caption)
                    .foregroundStyle(.red)
            }

            Divider()

            HStack(spacing: 8) {
                if hasUpdate {
                    Button("Remind Me Later") {
                        store.dismissUpdateBanner()
                        dismiss()
                    }
                    .controlSize(.small)
                    .disabled(isBusy)
                }

                Spacer()

                Button("Close") {
                    dismiss()
                }
                .keyboardShortcut(.cancelAction)

                if hasUpdate {
                    #if os(macOS)
                    if case .ready = store.updateDownloadState {
                        Button {
                            store.installReadyUpdate()
                        } label: {
                            Label("Close App & Install Now", systemImage: "arrow.triangle.2.circlepath")
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(BrandTheme.emeraldMint)
                        .keyboardShortcut(.defaultAction)
                    } else {
                        Button {
                            Task { await store.downloadAndInstallUpdate() }
                        } label: {
                            Label("Download, Close & Update", systemImage: "arrow.down.to.line")
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(BrandTheme.celestialSky)
                        .disabled(isBusy)
                        .keyboardShortcut(.defaultAction)
                    }
                    #else
                    Button {
                        store.openReleasePage()
                    } label: {
                        Label("Download Release on GitHub ↗", systemImage: "arrow.up.right.square")
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(BrandTheme.celestialSky)
                    #endif
                }
            }
        }
        .padding(18)
        #if os(macOS)
        .frame(width: 580)
        #else
        .frame(maxWidth: 580)
        #endif
    }

    private var isBusy: Bool {
        switch store.updateDownloadState {
        case .downloading, .verifying, .installing:
            return true
        default:
            return false
        }
    }
}
