import SwiftUI
import WebKit
import UIKit
import Combine

struct GameWebView: UIViewRepresentable {
    let controller: GameController

    func makeUIView(context: Context) -> WKWebView {
        controller.makeWebView()
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    static func dismantleUIView(_ uiView: WKWebView, coordinator: ()) {
        uiView.configuration.userContentController.removeScriptMessageHandler(forName: "blok")
        uiView.stopLoading()
        UIApplication.shared.isIdleTimerDisabled = false
    }
}

final class GameController: NSObject, ObservableObject, WKScriptMessageHandler, WKNavigationDelegate {
    @Published var showSettings = false
    @Published var loadError: String?
    @Published var hapticsEnabled: Bool {
        didSet { preferences.set(hapticsEnabled, forKey: "blok.haptics") }
    }

    private let preferences: UserDefaults
    private weak var webView: WKWebView?
    private let selection = UISelectionFeedbackGenerator()
    private let impact = UIImpactFeedbackGenerator(style: .medium)
    private let success = UINotificationFeedbackGenerator()
    private var lastFeedback: CFTimeInterval = 0

    init(preferences: UserDefaults = .standard) {
        self.preferences = preferences
        self.hapticsEnabled = preferences.object(forKey: "blok.haptics") as? Bool ?? true
        super.init()
    }

    private var gameURL: URL? {
        Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Game")
    }

    private var storageBootstrap: String {
        let keys = ["blok-best", "blok-sound", "blok-volume", "familytris-family"]
        var snapshot = [String: String]()
        for key in keys {
            if let value = preferences.string(forKey: key) { snapshot[key] = value }
        }
        let data = (try? JSONSerialization.data(withJSONObject: snapshot, options: [.sortedKeys])) ?? Data("{}".utf8)
        let json = String(data: data, encoding: .utf8) ?? "{}"
        return "window.__BLOK_NATIVE_STORAGE__ = \(json);"
    }

    func makeWebView() -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.allowsInlineMediaPlayback = true
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = false
        configuration.userContentController.add(self, name: "blok")
        configuration.userContentController.addUserScript(
            WKUserScript(source: storageBootstrap, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        )
        let view = WKWebView(frame: .zero, configuration: configuration)
        view.isOpaque = false
        view.backgroundColor = UIColor(red: 8 / 255, green: 11 / 255, blue: 20 / 255, alpha: 1)
        view.scrollView.backgroundColor = view.backgroundColor
        view.scrollView.bounces = false
        view.scrollView.contentInsetAdjustmentBehavior = .never
        view.allowsBackForwardNavigationGestures = false
        view.navigationDelegate = self
        webView = view
        reload()
        return view
    }

    func reload() {
        loadError = nil
        guard let url = gameURL else {
            loadError = "Uygulamanın oyun dosyası bulunamadı. Projeyi yeniden paketleyin."
            return
        }
        installStorageBootstrap()
        // The self-contained game only needs access to this single local file.
        webView?.loadFileURL(url, allowingReadAccessTo: url)
    }

    private func installStorageBootstrap() {
        let scripts = webView?.configuration.userContentController
        scripts?.removeAllUserScripts()
        scripts?.addUserScript(WKUserScript(source: storageBootstrap, injectionTime: .atDocumentStart, forMainFrameOnly: true))
    }

    func pauseForBackground() {
        UIApplication.shared.isIdleTimerDisabled = false
        webView?.evaluateJavaScript("window.dispatchEvent(new Event('blur'));")
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let expectedURL = gameURL,
              message.frameInfo.isMainFrame,
              message.webView?.url?.standardizedFileURL == expectedURL.standardizedFileURL,
              let body = message.body as? [String: Any],
              let type = body["type"] as? String else { return }
        switch type {
        case "preference":
            if let key = body["key"] as? String, let value = body["value"] as? String {
                savePreference(key: key, value: value)
            }
        case "feedback":
            if let event = body["event"] as? String {
                feedback(event: event, count: body["count"] as? Int ?? 0, levelUp: body["levelUp"] as? Bool ?? false)
            }
        case "state":
            UIApplication.shared.isIdleTimerDisabled = (body["playing"] as? Bool ?? false) && UIApplication.shared.applicationState == .active
        case "settings":
            pauseForBackground()
            showSettings = true
        default:
            break
        }
    }

    private func savePreference(key: String, value: String) {
        switch key {
        case "blok-best":
            if let score = Double(value), score.isFinite, score >= 0, score <= 9_000_000_000_000 {
                let previous = Int(preferences.string(forKey: key) ?? "0") ?? 0
                preferences.set(String(max(previous, Int(score))), forKey: key)
            }
        case "blok-volume":
            if let volume = Int(value), (0...100).contains(volume) { preferences.set(String(volume), forKey: key) }
        case "blok-sound":
            if value == "true" || value == "false" { preferences.set(value, forKey: key) }
        case "familytris-family":
            guard value.utf8.count <= 1_000_000,
                  let data = value.data(using: .utf8),
                  let family = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  family["version"] as? Int == 1,
                  let people = family["people"] as? [[String: Any]], people.count <= 7,
                  let order = family["order"] as? [Int], order.count == 7,
                  order.allSatisfy({ $0 >= 0 && $0 < max(1, people.count) }),
                  people.allSatisfy({ person in
                      guard let name = person["name"] as? String, name.count <= 24,
                            let photo = person["photo"] as? String, photo.utf8.count <= 120_000 else { return false }
                      return photo.hasPrefix("data:image/jpeg;base64,")
                  }) else { return }
            preferences.set(value, forKey: key)
        default:
            break
        }
    }

    private func feedback(event: String, count: Int, levelUp: Bool) {
        guard hapticsEnabled, UIApplication.shared.applicationState == .active else { return }
        let now = CACurrentMediaTime()
        guard now - lastFeedback >= 0.055 || event == "clear" || event == "over" else { return }
        lastFeedback = now
        switch event {
        case "rotate", "hold": selection.selectionChanged()
        case "drop": impact.impactOccurred(intensity: 0.7)
        case "clear":
            if count == 4 || levelUp { success.notificationOccurred(.success) }
            else { impact.impactOccurred(intensity: 0.45) }
        case "over": success.notificationOccurred(.warning)
        case "start": selection.prepare(); impact.prepare(); success.prepare()
        default: break
        }
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let expectedURL = gameURL else { decisionHandler(.cancel); return }
        let allowed = navigationAction.request.url?.standardizedFileURL == expectedURL.standardizedFileURL
        if allowed { installStorageBootstrap() }
        decisionHandler(allowed ? .allow : .cancel)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        loadError = nil
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        loadError = "Oyun yüklenemedi. Tekrar deneyebilirsin."
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        loadError = "Oyun beklenmedik şekilde durdu. Yeniden başlatabilirsin."
        UIApplication.shared.isIdleTimerDisabled = false
    }
}
