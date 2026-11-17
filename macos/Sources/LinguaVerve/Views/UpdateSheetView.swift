import AppKit
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
                .font(.system(size: 14))
                .foregroundStyle(BrandTheme.emeraldMint)

            Text("New release available: **LinguaVerve v\(update.latestVersion)** (installed: v\(store.currentAppVersion))")
                .font(.system(size: 12))
                .lineLimit(1)

            if case .downloading(let progress) = store.updateDownloadState {
                ProgressView(value: progress, total: 1.0)
                    .frame(width: 110)
                Text("\(Int(progress * 100))%")
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(.secondary)
            }

            Spacer()

            if case .ready = store.updateDownloadState {
                Button {
                    store.installReadyUpdate()
                } label: {
                    Label("Install & Relaunch", systemImage: "arrow.triangle.2.circlepath")
                }
                .buttonStyle(.borderedProminent)
                .tint(BrandTheme.emeraldMint)
                .controlSize(.small)
            } else {
                Button {
                    Task { await store.downloadAndInstallUpdate() }
                } label: {
                    Label("Update Now", systemImage: "arrow.down.to.line")
                }
                .buttonStyle(.borderedProminent)
                .tint(BrandTheme.celestialSky)
                .controlSize(.small)
                .disabled(isDownloading)
            }

            Button("Release Notes…") {
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

    private var isDownloading: Bool {
        if case .downloading = store.updateDownloadState { return true }
        return false
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
        let releaseName = store.availableUpdate?.releaseName ?? store.latestReleaseName ?? "Release Notes"
        let releaseNotes = store.availableUpdate?.releaseNotes ?? store.latestReleaseNotes

        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 12) {
                BrandCrestView(size: 38)

                VStack(alignment: .leading, spacing: 2) {
                    Text(hasUpdate ? "New Version Available" : "LinguaVerve Software Update")
                        .font(.system(size: 17, weight: .bold, design: .serif))
                    Text("Source: GitHub Releases (kobenguyent/lingua-verve)")
                        .font(.caption)
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
                .disabled(store.isCheckingForUpdates)
            }

            Divider()

            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("INSTALLED VERSION")
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(.secondary)
                    Text("v\(store.currentAppVersion)")
                        .font(.system(size: 15, weight: .bold, design: .monospaced))
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(10)
                .background(Color.secondary.opacity(0.08), in: RoundedRectangle(cornerRadius: 8))

                Image(systemName: "arrow.right")
                    .foregroundStyle(.secondary)

                VStack(alignment: .leading, spacing: 4) {
                    Text("LATEST GITHUB RELEASE")
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(.secondary)
                    Text(latestVersion.map { "v\($0)" } ?? (store.isCheckingForUpdates ? "Checking…" : "v\(store.currentAppVersion)"))
                        .font(.system(size: 15, weight: .bold, design: .monospaced))
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
                    .font(.caption)
                    .foregroundStyle(.red)
            }

            if let asset {
                HStack(spacing: 6) {
                    Image(systemName: "shippingbox.fill")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Text("Asset: \(asset.name)")
                        .font(.system(size: 11, design: .monospaced))
                    if asset.size > 0 {
                        Text("(\(ByteCountFormatter.string(fromByteCount: asset.size, countStyle: .file)))")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    if let checkedAt = store.lastUpdateCheckDate {
                        Text("Checked \(checkedAt, style: .relative) ago")
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }
                }
            }

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(releaseName)
                        .font(.subheadline.weight(.semibold))
                    Spacer()
                    Button("View on GitHub ↗") {
                        store.openReleasePage()
                    }
                    .buttonStyle(.link)
                    .font(.caption)
                }

                ScrollView {
                    Text(
                        (releaseNotes?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty == false)
                            ? releaseNotes!
                            : (hasUpdate
                                ? "A new release of LinguaVerve is available on GitHub Releases."
                                : "You are running the latest version of LinguaVerve (v\(store.currentAppVersion)).")
                    )
                    .font(.system(size: 11.5, design: .monospaced))
                    .textSelection(.enabled)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(10)
                }
                .frame(minHeight: 130, maxHeight: 200)
                .background(Color.secondary.opacity(0.07), in: RoundedRectangle(cornerRadius: 8))
            }

            Toggle("Automatically check GitHub Releases for updates on launch", isOn: $store.autoCheckForUpdates)
                .font(.caption)

            switch store.updateDownloadState {
            case .idle:
                EmptyView()
            case .downloading(let progress):
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("Downloading update from GitHub Releases…")
                            .font(.caption.weight(.medium))
                        Spacer()
                        Text("\(Int(progress * 100))%")
                            .font(.system(size: 11, weight: .semibold, design: .monospaced))
                    }
                    ProgressView(value: progress, total: 1.0)
                }
            case .ready(let fileURL):
                Label("Downloaded \(fileURL.lastPathComponent) — ready to install & relaunch!", systemImage: "checkmark.circle.fill")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(BrandTheme.emeraldMint)
            case .failed(let msg):
                Label(msg, systemImage: "xmark.octagon.fill")
                    .font(.caption)
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
                }

                Spacer()

                Button("Close") {
                    dismiss()
                }
                .keyboardShortcut(.cancelAction)

                if hasUpdate {
                    if case .ready = store.updateDownloadState {
                        Button {
                            store.installReadyUpdate()
                        } label: {
                            Label("Install & Relaunch Now", systemImage: "arrow.triangle.2.circlepath")
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(BrandTheme.emeraldMint)
                        .keyboardShortcut(.defaultAction)
                    } else {
                        Button {
                            Task { await store.downloadAndInstallUpdate() }
                        } label: {
                            Label("Download & Install Update", systemImage: "arrow.down.to.line")
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(BrandTheme.celestialSky)
                        .disabled(isDownloading)
                        .keyboardShortcut(.defaultAction)
                    }
                }
            }
        }
        .padding(18)
        .frame(width: 560)
    }

    private var isDownloading: Bool {
        if case .downloading = store.updateDownloadState { return true }
        return false
    }
}
