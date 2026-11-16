import SwiftUI
import LinguaVerveCore

@main
struct LinguaVerveApp: App {
    @State private var store = CurriculumStore()
    @State private var showDiagnosticSheet = false
    @State private var showFalseFriendsSheet = false

    var body: some Scene {
        WindowGroup("LinguaVerve", id: "main") {
            MainSplitView(
                store: store,
                showDiagnosticSheet: $showDiagnosticSheet,
                showFalseFriendsSheet: $showFalseFriendsSheet
            )
            .frame(minWidth: 640, minHeight: 500)
        }
        .defaultSize(width: 1240, height: 800)
        .commands {
            CommandMenu("Polyglot Tools") {
                Button("Random Tactical Blueprint") {
                    if let rnd = store.randomTip() {
                        store.selectedTipId = rnd.id
                    }
                }
                .keyboardShortcut("r", modifiers: [.command])

                Button("CEFR Diagnostic Level Finder...") {
                    showDiagnosticSheet = true
                }
                .keyboardShortcut("d", modifiers: [.command])

                Button("False Friends & Deceptive Cognates...") {
                    showFalseFriendsSheet = true
                }
                .keyboardShortcut("f", modifiers: [.command, .shift])

                Divider()

                Button("Reset All Filters") {
                    store.resetFilters()
                    store.selectedTipId = store.filteredTips.first?.id
                }
                .keyboardShortcut("0", modifiers: [.command])
            }
        }

        MenuBarExtra("LinguaVerve", systemImage: "globe.europe.africa.fill") {
            MenuBarPopoverView(store: store)
        }
        .menuBarExtraStyle(.window)
    }
}
