import SwiftUI
import AVFAudio
import UIKit
import Combine

@main
struct BlokApp: App {
    init() {
        // Game sounds respect the iPhone's silent switch and mix with music.
        try? AVAudioSession.sharedInstance().setCategory(.ambient, mode: .default)
    }

    var body: some Scene {
        WindowGroup {
            GameScreen()
                .preferredColorScheme(.dark)
        }
    }
}

struct GameScreen: View {
    @StateObject private var game = GameController()
    private let background = Color(red: 8 / 255, green: 11 / 255, blue: 20 / 255)

    var body: some View {
        ZStack {
            background.ignoresSafeArea()
            GameWebView(controller: game)
            if let error = game.loadError {
                VStack(spacing: 18) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.largeTitle)
                        .foregroundStyle(.cyan)
                    Text("Oyun açılamadı").font(.title2)
                    Text(error).font(.callout).multilineTextAlignment(.center)
                    Button("Tekrar dene") { game.reload() }
                        .buttonStyle(.borderedProminent)
                        .tint(.cyan)
                }
                .padding(28)
                .background(background)
            }
        }
        .sheet(isPresented: $game.showSettings) {
            GameSettings(controller: game)
        }
        .onReceive(NotificationCenter.default.publisher(for: UIApplication.willResignActiveNotification)) { _ in
            game.pauseForBackground()
        }
        .onReceive(NotificationCenter.default.publisher(for: AVAudioSession.interruptionNotification)) { _ in
            game.pauseForBackground()
        }
    }
}

private struct GameSettings: View {
    @ObservedObject var controller: GameController
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section("Oyun") {
                    Toggle("Dokunsal geri bildirim", isOn: $controller.hapticsEnabled)
                    Text("Döndürme, bırakma ve satır temizleme sırasında hafif titreşimler.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
                Section("Gizlilik") {
                    Text("Familytris fotoğraflarını, rekorunu ve oyun tercihlerini yalnızca bu cihazda saklar. Fotoğraflar bir sunucuya gönderilmez.")
                    Text("Ailem bölümündeki Sil düğmesiyle seçtiğin fotoğrafları aile kaydından kaldırabilirsin.")
                    Text("Hesap, reklam, analiz, takip ve internet bağlantısı gerekmez.")
                }
                Section("Lisanslar") {
                    NavigationLink("Chakra Petch yazı tipi") {
                        LicensePage(title: "Chakra Petch", name: "chakrapetch-OFL")
                    }
                    NavigationLink("IBM Plex Mono yazı tipi") {
                        LicensePage(title: "IBM Plex Mono", name: "ibmplexmono-OFL")
                    }
                    NavigationLink("pico yüz algılayıcı") {
                        LicensePage(title: "pico", name: "pico-MIT")
                    }
                }
                Section {
                    Text("Familytris · Neon Arcade\nSürüm \(Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "1.0.0")")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Uygulama ayarları")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Bitti") { dismiss() }
                }
            }
            .tint(.cyan)
        }
    }
}

private struct LicensePage: View {
    let title: String
    let name: String

    var text: String {
        guard let url = Bundle.main.url(forResource: name, withExtension: "txt", subdirectory: "Legal"),
              let text = try? String(contentsOf: url, encoding: .utf8) else {
            return "Lisans dosyası bulunamadı."
        }
        return text
    }

    var body: some View {
        ScrollView {
            Text(text)
                .font(.system(.footnote, design: .monospaced))
                .textSelection(.enabled)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
        }
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
    }
}
