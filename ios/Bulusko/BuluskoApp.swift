import SwiftUI
import AVFAudio
import UIKit
import Combine

@main
struct BuluskoApp: App {
    init() { GameAudioSession.restorePlayback() }
    var body: some Scene { WindowGroup { BuluskoScreen().preferredColorScheme(.dark) } }
}

private struct BuluskoScreen: View {
    @StateObject private var game = BuluskoController()
    private let background = Color(red: 16/255, green: 18/255, blue: 29/255)
    var body: some View {
        ZStack {
            background.ignoresSafeArea()
            GameWebView(controller: game)
            if let error = game.loadError {
                VStack(spacing: 20) {
                    Image(systemName: "person.3.fill").font(.largeTitle).foregroundStyle(.orange)
                    Text("Popzuno").font(.title.bold())
                    Text(error).multilineTextAlignment(.center)
                    Button(game.text("Tekrar dene", "Try again")) { game.reload() }.buttonStyle(.borderedProminent)
                }.padding(28).background(background)
            }
        }
        .sheet(isPresented: $game.showSettings) { BuluskoSettings(game: game) }
        .onReceive(NotificationCenter.default.publisher(for: UIApplication.willResignActiveNotification)) { _ in game.pauseForBackground() }
        .onReceive(NotificationCenter.default.publisher(for: UIApplication.didBecomeActiveNotification)) { _ in game.restoreAfterInterruption() }
        .onReceive(NotificationCenter.default.publisher(for: AVAudioSession.interruptionNotification)) { note in
            if (note.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt) == AVAudioSession.InterruptionType.began.rawValue { game.pauseForBackground() }
            else if (note.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt) == AVAudioSession.InterruptionType.ended.rawValue { game.restoreAfterInterruption() }
        }
    }
}

private struct BuluskoSettings: View {
    private var appVersion: String { Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "—" }
    @ObservedObject var game: BuluskoController
    @Environment(\.dismiss) private var dismiss
    var body: some View {
        NavigationStack {
            Form {
                Section(game.text("Dokunsal geri bildirim", "Haptic feedback")) {
                    Toggle(game.text("Titreşim", "Haptics"), isOn: $game.hapticsEnabled)
                    Button(game.text("Titreşimi dene", "Test haptics")) { game.testHaptics() }.disabled(!game.hapticsEnabled)
                    Text(game.text("Büyük eşleşmeler, Bomb, Rocket, Cross ve Nova farklı güçte titreşimler verir.", "Larger matches, Bomb, Rocket, Cross and Nova produce different strengths of haptic feedback.")).font(.footnote).foregroundStyle(.secondary)
                }
                Section(game.text("Gizlilik", "Privacy")) {
                    Text(game.text("Seçtiğin fotoğraflar cihazda işlenir. Yüzler, isimler, etaplar, rekorlar ve tercihler yalnızca Popzuno’ün bu cihazdaki alanında saklanır.", "Selected photos are processed on your device. Faces, names, stages, records and preferences stay in this app's local storage."))
                    Text(game.text("Sevdiklerim ekranından fotoğrafları silebilirsin. Hesap, reklam, analiz veya sunucuya veri aktarımı yoktur.", "Delete photos in Your people. There are no accounts, ads, analytics or uploads."))
                    Text(game.text("İşletim sistemi yedekleri ayarlarına göre uygulama verilerini içerebilir. Silme ayrıntıları gizlilik politikasında açıklanır.", "Operating-system backups may include app data according to your settings. Deletion details are explained in the privacy policy."))
                }
                Section(game.text("Kaynaklar", "Credits")) {
                    Button(game.text("Gizlilik politikası ve tüm lisanslar", "Privacy policy and all licenses")) { game.openPrivacy() }
                    NavigationLink("Circuit Bloom") { BuluskoLicense(title: "Circuit Bloom", file: "music-NOTICE", ext: "txt") }
                    NavigationLink("Chakra Petch") { BuluskoLicense(title: "Chakra Petch", file: "chakrapetch-OFL", ext: "txt") }
                    NavigationLink("IBM Plex Mono") { BuluskoLicense(title: "IBM Plex Mono", file: "ibmplexmono-OFL", ext: "txt") }
                    NavigationLink("pico") { BuluskoLicense(title: "pico", file: "pico-MIT", ext: "txt") }
                }
                Section { Text("Popzuno · \(appVersion)\n\(game.text("SWIPE. MATCH. UNLEASH.", "SWIPE. MATCH. UNLEASH."))").font(.footnote).foregroundStyle(.secondary) }
            }
            .navigationTitle(game.text("Popzuno ayarları", "Popzuno settings"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button(game.text("Bitti", "Done")) { dismiss() } } }
            .tint(Color(red: 0.9, green: 0.65, blue: 0.6))
        }
    }
}

private struct BuluskoLicense: View {
    let title: String
    let file: String
    let ext: String
    private var contents: String { guard let url = Bundle.main.url(forResource: file, withExtension: ext, subdirectory: "Legal") else { return "—" }; return (try? String(contentsOf: url, encoding: .utf8)) ?? "—" }
    var body: some View { ScrollView { Text(contents).font(.system(.footnote, design: .monospaced)).textSelection(.enabled).frame(maxWidth: .infinity, alignment: .leading).padding() }.navigationTitle(title) }
}
