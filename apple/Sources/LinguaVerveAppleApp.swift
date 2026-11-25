import SwiftUI
import LinguaVerveCore
import LinguaVerveUI

/// Universal Apple Multiplatform App Entry supporting iPhone (iOS 17+), iPad (iPadOS 17+),
/// and MacBook (macOS 14+) from one single shared SwiftUI codebase.
@main
struct LinguaVerveAppleApp: App {
    @State private var store = CurriculumStore()
    @State private var showDiagnosticSheet = false
    @State private var showFalseFriendsSheet = false
    @State private var showAISettingsSheet = false

    var body: some Scene {
        WindowGroup("LinguaVerve") {
            RootNavigationView(
                store: store,
                showDiagnosticSheet: $showDiagnosticSheet,
                showFalseFriendsSheet: $showFalseFriendsSheet,
                showAISettingsSheet: $showAISettingsSheet
            )
            #if os(macOS)
            .frame(minWidth: 720, minHeight: 540)
            #endif
        }
        #if os(macOS)
        .defaultSize(width: 1260, height: 820)
        #endif
    }
}
