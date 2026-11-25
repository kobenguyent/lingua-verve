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
            VStack(spacing: 0) {
                if store.shouldShowUpdateBanner, let update = store.availableUpdate {
                    UpdateNotificationBanner(store: store, update: update)
                    Divider()
                }
                RootNavigationView(
                    store: store,
                    showDiagnosticSheet: $showDiagnosticSheet,
                    showFalseFriendsSheet: $showFalseFriendsSheet,
                    showAISettingsSheet: $showAISettingsSheet
                )
            }
            #if os(macOS)
            .frame(minWidth: 720, minHeight: 540)
            #endif
            .sheet(isPresented: $store.isUpdateSheetPresented) {
                UpdateSheetView(store: store)
            }
            .task {
                await store.startPeriodicUpdateChecks()
            }
        }
        #if os(macOS)
        .defaultSize(width: 1260, height: 820)
        .commands {
            CommandGroup(after: .appInfo) {
                Button("Check for Updates…") {
                    Task { await store.checkForUpdates(manual: true) }
                }
            }

            CommandMenu("Polyglot Academy") {
                Button("Intensive Courses (A1–C2)") { store.activeWorkspace = .courses }
                    .keyboardShortcut("1", modifiers: [.command])
                Button("Scored Level Pre-Test") { store.activeWorkspace = .pretest }
                    .keyboardShortcut("2", modifiers: [.command])
                Button("4-Skill Exam Simulator") { store.activeWorkspace = .simulator }
                    .keyboardShortcut("3", modifiers: [.command])
                Button("AI 4-Skill Coach") { store.activeWorkspace = .aiCoach }
                    .keyboardShortcut("4", modifiers: [.command])
                Button("Progress & Test History") { store.activeWorkspace = .progress }
                    .keyboardShortcut("5", modifiers: [.command])
                Button("Field Manual (Tips)") { store.activeWorkspace = .manual }
                    .keyboardShortcut("6", modifiers: [.command])

                Divider()

                Button("Connect Local / Cloud AI…") { showAISettingsSheet = true }
                    .keyboardShortcut("a", modifiers: [.command, .shift])
                Button("CEFR Quick Check…") { showDiagnosticSheet = true }
                    .keyboardShortcut("d", modifiers: [.command])
                Button("False Friends & Cognates…") { showFalseFriendsSheet = true }
                    .keyboardShortcut("f", modifiers: [.command, .shift])
            }
        }
        #endif
    }
}
