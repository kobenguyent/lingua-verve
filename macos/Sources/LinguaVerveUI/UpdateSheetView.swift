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
        ViewThatFits(in: .horizontal) {
            HStack(spacing: 12) {
                bannerSummary
                statusAccessory
                Spacer(minLength: 8)
                bannerActions
            }

            VStack(alignment: .leading, spacing: 10) {
                bannerSummary
                if isBusy {
                    HStack(spacing: 8) {
                        statusAccessory
                    }
                }
                FlowLayout(spacing: 8, lineSpacing: 6) {
                    bannerActions
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(BrandTheme.celestialSky.opacity(0.08))
                )
        }
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .strokeBorder(BrandTheme.celestialSky.opacity(0.24), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.14), radius: 10, y: 4)
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
    }

    private var bannerSummary: some View {
        HStack(spacing: 10) {
            ZStack {
                Circle()
                    .fill(BrandTheme.emeraldMint.opacity(0.16))
                    .frame(width: 28, height: 28)
                Image(systemName: "arrow.down.circle.fill")
                    .scaledFont(.callout)
                    .foregroundStyle(BrandTheme.emeraldMint)
            }

            FlowLayout(spacing: 8, lineSpacing: 4) {
                Text("LinguaVerve v\(update.latestVersion) available")
                    .scaledFont(.subheadline, weight: .semibold)
                    .fixedSize(horizontal: false, vertical: true)

                Text("v\(store.currentAppVersion) → v\(update.latestVersion)")
                    .scaledFont(.caption2, weight: .medium, design: .monospaced, monospacedDigit: true)
                    .foregroundStyle(.secondary)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 2.5)
                    .background(Capsule().fill(Color.primary.opacity(0.07)))
            }
        }
    }

    @ViewBuilder
    private var bannerActions: some View {
        HStack(spacing: 8) {
            #if os(macOS)
            if case .ready = store.updateDownloadState {
                Button {
                    store.installReadyUpdate()
                } label: {
                    Label("Install & Relaunch", systemImage: "arrow.triangle.2.circlepath")
                        .scaledFont(.caption, weight: .semibold)
                }
                .buttonStyle(.borderedProminent)
                .tint(BrandTheme.emeraldMint)
                .controlSize(.small)
            } else {
                Button {
                    Task { await store.downloadAndInstallUpdate() }
                } label: {
                    Label("Update", systemImage: "arrow.down.to.line")
                        .scaledFont(.caption, weight: .semibold)
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
                    .scaledFont(.caption, weight: .semibold)
            }
            .buttonStyle(.borderedProminent)
            .tint(BrandTheme.celestialSky)
            .controlSize(.small)
            #endif

            Button {
                store.isUpdateSheetPresented = true
            } label: {
                Text("Notes")
                    .scaledFont(.caption, weight: .medium)
            }
            .buttonStyle(.bordered)
            .controlSize(.small)

            Button {
                store.dismissUpdateBanner()
            } label: {
                Image(systemName: "xmark")
                    .scaledFont(.caption2, weight: .bold)
                    .foregroundStyle(.secondary)
                    .padding(6)
                    .background(Circle().fill(Color.primary.opacity(0.07)))
                    .contentShape(Circle())
            }
            .buttonStyle(.plain)
            .help("Remind me later")
            .accessibilityLabel("Dismiss update banner")
        }
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
        .frame(minWidth: 540, idealWidth: 620, maxWidth: 720)
        #else
        .frame(maxWidth: 620)
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
