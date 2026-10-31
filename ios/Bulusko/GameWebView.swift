import AVFAudio
import SwiftUI
import WebKit
import UIKit
import Combine

private let nativeCopy: [String: [String: String]] = [
    "it": [
        "Privacy policy and all licenses": "Informativa sulla privacy e tutte le licenze",
        "Operating-system backups may include app data according to your settings. Deletion details are explained in the privacy policy.": "I backup del sistema possono includere dati dell’app secondo le impostazioni. I dettagli sulla cancellazione sono nell’informativa.",
        "Try again": "Riprova",
        "Haptic feedback": "Feedback aptico",
        "Haptics": "Vibrazioni",
        "Test haptics": "Prova le vibrazioni",
        "Larger matches, Bomb, Rocket, Cross and Nova produce different strengths of haptic feedback.": "Abbinamenti grandi, Bomb, Rocket, Cross e Nova producono vibrazioni di diversa intensità.",
        "Privacy": "Privacy",
        "Selected photos are processed on your device. Faces, names, stages, records and preferences stay in this app's local storage.": "Le foto scelte vengono elaborate sul dispositivo. Volti, nomi, livelli, record e preferenze restano nella memoria locale dell’app.",
        "Delete photos in Your people. There are no accounts, ads, analytics or uploads.": "Puoi eliminare le foto in I miei cari. Non ci sono account, pubblicità, analisi o caricamenti.",
        "Credits": "Riconoscimenti",
        "Popzuno settings": "Impostazioni Popzuno",
        "Done": "Fatto",
        "The bundled game file is missing.": "Il file del gioco non è disponibile.",
        "The game could not load. Please try again.": "Impossibile caricare il gioco. Riprova.",
        "The game stopped. You can reopen it.": "Il gioco si è fermato. Puoi riaprirlo.",
    ],
    "es": [
        "Privacy policy and all licenses": "Política de privacidad y todas las licencias",
        "Operating-system backups may include app data according to your settings. Deletion details are explained in the privacy policy.": "Las copias del sistema pueden incluir datos de la app según tus ajustes. La política explica los detalles del borrado.",
        "Try again": "Reintentar",
        "Haptic feedback": "Respuesta háptica",
        "Haptics": "Vibración",
        "Test haptics": "Probar vibración",
        "Larger matches, Bomb, Rocket, Cross and Nova produce different strengths of haptic feedback.": "Las combinaciones grandes, Bomb, Rocket, Cross y Nova producen vibraciones de distinta intensidad.",
        "Privacy": "Privacidad",
        "Selected photos are processed on your device. Faces, names, stages, records and preferences stay in this app's local storage.": "Las fotos elegidas se procesan en tu dispositivo. Las caras, los nombres, las etapas, los récords y las preferencias se guardan localmente en esta app.",
        "Delete photos in Your people. There are no accounts, ads, analytics or uploads.": "Puedes eliminar las fotos en Mi gente. No hay cuentas, anuncios, analítica ni subidas de datos.",
        "Credits": "Créditos",
        "Popzuno settings": "Ajustes de Popzuno",
        "Done": "Listo",
        "The bundled game file is missing.": "Falta el archivo del juego.",
        "The game could not load. Please try again.": "No se pudo cargar el juego. Inténtalo de nuevo.",
        "The game stopped. You can reopen it.": "El juego se ha detenido. Puedes volver a abrirlo.",
    ],
    "de": [
        "Privacy policy and all licenses": "Datenschutz und alle Lizenzen",
        "Operating-system backups may include app data according to your settings. Deletion details are explained in the privacy policy.": "Systembackups können je nach Einstellungen App-Daten enthalten. Einzelheiten zur Löschung stehen in der Datenschutzerklärung.",
        "Try again": "Erneut versuchen",
        "Haptic feedback": "Haptisches Feedback",
        "Haptics": "Vibration",
        "Test haptics": "Vibration testen",
        "Larger matches, Bomb, Rocket, Cross and Nova produce different strengths of haptic feedback.": "Große Kombinationen, Bomb, Rocket, Cross und Nova erzeugen unterschiedlich starke Vibrationen.",
        "Privacy": "Datenschutz",
        "Selected photos are processed on your device. Faces, names, stages, records and preferences stay in this app's local storage.": "Ausgewählte Fotos werden auf deinem Gerät verarbeitet. Gesichter, Namen, Stufen, Rekorde und Einstellungen bleiben im lokalen Speicher dieser App.",
        "Delete photos in Your people. There are no accounts, ads, analytics or uploads.": "Lösche Fotos unter Meine Liebsten. Es gibt keine Konten, Werbung, Analysen oder Uploads.",
        "Credits": "Mitwirkende",
        "Popzuno settings": "Popzuno-Einstellungen",
        "Done": "Fertig",
        "The bundled game file is missing.": "Die Spieldatei fehlt.",
        "The game could not load. Please try again.": "Das Spiel konnte nicht geladen werden. Versuche es erneut.",
        "The game stopped. You can reopen it.": "Das Spiel wurde angehalten. Du kannst es erneut öffnen.",
    ],
    "ru": [
        "Privacy policy and all licenses": "Политика и все лицензии",
        "Operating-system backups may include app data according to your settings. Deletion details are explained in the privacy policy.": "Резервные копии системы могут содержать данные приложения в зависимости от настроек. Подробности удаления описаны в политике.",
        "Try again": "Попробовать снова",
        "Haptic feedback": "Тактильный отклик",
        "Haptics": "Вибрация",
        "Test haptics": "Проверить вибрацию",
        "Larger matches, Bomb, Rocket, Cross and Nova produce different strengths of haptic feedback.": "Большие комбинации, Bomb, Rocket, Cross и Nova дают вибрацию разной силы.",
        "Privacy": "Конфиденциальность",
        "Selected photos are processed on your device. Faces, names, stages, records and preferences stay in this app's local storage.": "Выбранные фото обрабатываются на устройстве. Лица, имена, этапы, рекорды и настройки хранятся только в локальном хранилище приложения.",
        "Delete photos in Your people. There are no accounts, ads, analytics or uploads.": "Фото можно удалить в разделе «Близкие». Здесь нет аккаунтов, рекламы, аналитики или загрузки данных на сервер.",
        "Credits": "Авторы и ресурсы",
        "Popzuno settings": "Настройки Popzuno",
        "Done": "Готово",
        "The bundled game file is missing.": "Файл игры не найден.",
        "The game could not load. Please try again.": "Не удалось загрузить игру. Попробуй ещё раз.",
        "The game stopped. You can reopen it.": "Игра остановилась. Можно открыть её снова.",
    ],
]


struct GameWebView: UIViewRepresentable {
    let controller: BuluskoController
    func makeUIView(context: Context) -> WKWebView { controller.makeWebView() }
    func updateUIView(_ view: WKWebView, context: Context) {}
    static func dismantleUIView(_ view: WKWebView, coordinator: ()) {
        view.configuration.userContentController.removeScriptMessageHandler(forName: "bulusko")
        view.stopLoading()
        UIApplication.shared.isIdleTimerDisabled = false
    }
}

final class BuluskoController: NSObject, ObservableObject, WKScriptMessageHandler, WKNavigationDelegate {
    @Published var showSettings = false
    @Published var loadError: String?
    @Published var language: String
    @Published var hapticsEnabled: Bool {
        didSet { preferences.set(hapticsEnabled, forKey: "bulusko.haptics"); if !hapticsEnabled { haptics.stop() } }
    }
    private let preferences: UserDefaults
    private weak var webView: WKWebView?
    private let haptics = GatheringHaptics()
    private var announcer: ArcadeAnnouncer?
    private let impact = UIImpactFeedbackGenerator(style: .light)
    private let selection = UISelectionFeedbackGenerator()
    private let notice = UINotificationFeedbackGenerator()
    private var lastFeedback: CFTimeInterval = 0
    private let photoAlignmentQueue = DispatchQueue(label: "popzuno.photo-alignment", qos: .userInitiated)
    private var resetting = false
    private var url: URL? { Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Game") }

    init(preferences: UserDefaults = .standard) {
        self.preferences = preferences
        let raw = preferences.string(forKey: NativeStore.prefix + "settings") ?? "{}"
        let data = raw.data(using: .utf8) ?? Data()
        let object = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any]
        let savedLanguage = object?["language"] as? String ?? "tr"
        language = ["tr", "en", "it", "es", "de", "ru"].contains(savedLanguage) ? savedLanguage : "tr"
        hapticsEnabled = preferences.object(forKey: "bulusko.haptics") as? Bool ?? true
        super.init()
    }

    func text(_ tr: String, _ en: String) -> String { language == "tr" ? tr : nativeCopy[language]?[en] ?? en }
    private var bootstrap: String { "window.__POPZUNO_PHOTO_ALIGNMENT__ = true; window.__BULUSKO_STORAGE__ = \(NativeStore.snapshot(preferences));" }

    func makeWebView() -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.allowsInlineMediaPlayback = true
        #if DEBUG && targetEnvironment(simulator)
        if ProcessInfo.processInfo.arguments.contains("--audio-lifecycle-check") { configuration.mediaTypesRequiringUserActionForPlayback = [] }
        #endif
        configuration.ignoresViewportScaleLimits = false
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = false
        configuration.userContentController.add(self, name: "bulusko")
        configuration.userContentController.addUserScript(WKUserScript(source: bootstrap, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        let view = WKWebView(frame: .zero, configuration: configuration)
        view.isOpaque = false
        view.backgroundColor = UIColor(red: 16/255, green: 18/255, blue: 29/255, alpha: 1)
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
        guard let url else { loadError = text("Oyun dosyası bulunamadı.", "The bundled game file is missing."); return }
        loadError = nil
        webView?.configuration.userContentController.removeAllUserScripts()
        webView?.configuration.userContentController.addUserScript(WKUserScript(source: bootstrap, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        #if DEBUG && targetEnvironment(simulator)
        if ProcessInfo.processInfo.arguments.contains("--audio-lifecycle-check") {
            let probe = "window.__qaAudioContexts=[];const OriginalAudioContext=window.AudioContext||window.webkitAudioContext;window.AudioContext=class extends OriginalAudioContext{constructor(...args){super(...args);window.__qaAudioContexts.push(this);}};"
            webView?.configuration.userContentController.addUserScript(WKUserScript(source: probe, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        }
        #endif
        webView?.loadFileURL(url, allowingReadAccessTo: url)
    }

    func pauseForBackground() {
        announcer?.stop()
        haptics.stop()
        UIApplication.shared.isIdleTimerDisabled = false
        webView?.evaluateJavaScript("window.dispatchEvent(new Event('blur'));")
    }

    func restoreAfterInterruption() {
        guard UIApplication.shared.applicationState == .active else { return }
        webView?.evaluateJavaScript("window.dispatchEvent(new Event('kynburst:audio-resume'));" )
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let url, message.frameInfo.isMainFrame,
              message.webView?.url?.standardizedFileURL == url.standardizedFileURL,
              let body = message.body as? [String: Any], let type = body["type"] as? String else { return }
        switch type {
        case "photoAlign":
            guard !resetting, let id = body["id"] as? String,
                  id.range(of: "^[a-zA-Z0-9-]{1,64}$", options: .regularExpression) != nil,
                  let photo = body["photo"] as? String, photo.count <= 160_000,
                  photo.hasPrefix("data:image/jpeg;base64,"),
                  let data = Data(base64Encoded: String(photo.dropFirst(23))) else { return }
            photoAlignmentQueue.async { [weak self] in
                var result = PhotoAlignment.analyze(data); result["id"] = id
                guard let encoded = try? JSONSerialization.data(withJSONObject: result),
                      let json = String(data: encoded, encoding: .utf8) else { return }
                DispatchQueue.main.async { [weak self] in
                    guard let self, !self.resetting, self.webView?.url?.standardizedFileURL == self.url?.standardizedFileURL else { return }
                    self.webView?.evaluateJavaScript("window.dispatchEvent(new CustomEvent('popzuno:photo-alignment',{detail:" + json + "}));")
                }
            }
        case "reset":
            resetting = true
            pauseForBackground()
            NativeStore.reset(preferences)
            hapticsEnabled = true
            language = "tr"
            WKWebsiteDataStore.default().removeData(ofTypes: WKWebsiteDataStore.allWebsiteDataTypes(), modifiedSince: .distantPast) { [weak self] in self?.reload() }
        case "preference":
            guard !resetting else { return }
            if let key = body["key"] as? String, let value = body["value"] as? String,
               NativeStore.save(key: key, value: value, preferences: preferences), key == NativeStore.prefix + "settings",
               let data = value.data(using: .utf8), let settings = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] {
                let savedLanguage = settings["language"] as? String ?? "tr"
                language = ["tr", "en", "it", "es", "de", "ru"].contains(savedLanguage) ? savedLanguage : "tr"
            }
        case "state":
            let playing = body["playing"] as? Bool == true
            if playing && UIApplication.shared.applicationState == .active { GameAudioSession.restorePlayback(activate: true) }
            UIApplication.shared.isIdleTimerDisabled = playing && UIApplication.shared.applicationState == .active
            if !playing { haptics.stop(); announcer?.stop() }
        case "audioResume":
            if UIApplication.shared.applicationState == .active { GameAudioSession.restorePlayback(activate: true) }
        case "prepareCheers":
            if UIApplication.shared.applicationState == .active { if announcer == nil { announcer = ArcadeAnnouncer() }; announcer?.prepare() }
        case "cheer":
            if let kind = body["kind"] as? String, let volume = body["volume"] as? Double, volume.isFinite { if announcer == nil { announcer = ArcadeAnnouncer() }; announcer?.play(kind, volume: Float(min(1, max(0, volume)))) }
        case "stopCheer": announcer?.stop()
        case "feedback":
            if let event = body["event"] as? String { feedback(event, count: body["count"] as? Int ?? 1, reason: body["reason"] as? String ?? "") }
        case "support":
            if let contact = URL(string: "mailto:mertbek@gmail.com?subject=Popzuno") { UIApplication.shared.open(contact) }
        case "settings":
            pauseForBackground()
            showSettings = true
        #if DEBUG && targetEnvironment(simulator)
        case "qaAudioInterrupt":
            guard ProcessInfo.processInfo.arguments.contains("--audio-lifecycle-check") else { return }
            NotificationCenter.default.post(name: UIApplication.willResignActiveNotification, object: nil)
            NotificationCenter.default.post(name: AVAudioSession.interruptionNotification, object: AVAudioSession.sharedInstance(), userInfo: [AVAudioSessionInterruptionTypeKey: AVAudioSession.InterruptionType.began.rawValue])
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
                NotificationCenter.default.post(name: AVAudioSession.interruptionNotification, object: AVAudioSession.sharedInstance(), userInfo: [AVAudioSessionInterruptionTypeKey: AVAudioSession.InterruptionType.ended.rawValue])
                NotificationCenter.default.post(name: UIApplication.didBecomeActiveNotification, object: nil)
            }
        case "qaAudioResult":
            guard ProcessInfo.processInfo.arguments.contains("--audio-lifecycle-check"), let result = body["result"] as? [String: Any], let data = try? JSONSerialization.data(withJSONObject: result, options: [.prettyPrinted, .sortedKeys]), let directory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else { return }
            try? data.write(to: directory.appendingPathComponent("audio-recovery.json"), options: .atomic)
        #endif
        default: break
        }
    }

    private func feedback(_ event: String, count: Int, reason: String) {
        guard hapticsEnabled, UIApplication.shared.applicationState == .active else { return }
        let now = CACurrentMediaTime()
        guard now-lastFeedback > 0.055 || ["clear", "pulse", "over"].contains(event) else { return }
        lastFeedback = now
        switch event {
        case "start": selection.prepare(); impact.prepare(); notice.prepare(); haptics.prepare()
        case "rotate": selection.selectionChanged()
        case "place": impact.impactOccurred(intensity: 0.55)
        case "clear": haptics.clear(count)
        case "pulse": haptics.clear(2)
        case "over": notice.notificationOccurred(reason == "complete" || reason == "timeout" ? .success : .warning)
        default: break
        }
    }

    func testHaptics() { if hapticsEnabled { haptics.clear(2) } }
    func openPrivacy() { showSettings = false; webView?.evaluateJavaScript("window.dispatchEvent(new Event('kynburst:privacy'));") }

    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        decisionHandler(action.request.url?.standardizedFileURL == url?.standardizedFileURL ? .allow : .cancel)
    }
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        resetting = false; loadError = nil
        #if DEBUG && targetEnvironment(simulator)
        // Deterministic visual fixture for safe-area/layout checks. Excluded from
        // every Release build and every physical-device build; never resets data.
        if ProcessInfo.processInfo.arguments.contains("--audio-lifecycle-check") {
            // Native notifications and actual WKWebView audio graph; simulator only.
            webView.evaluateJavaScript("""
            (async()=>{const send=(type,extra={})=>webkit.messageHandlers.bulusko.postMessage({type,...extra});const wait=async(test)=>{for(let i=0;i<120;i++){if(test())return;await new Promise(r=>setTimeout(r,50));}throw Error('Audio lifecycle timeout');};try{
            document.querySelector('#home-play').click();document.querySelector('[data-tide-mode=relax]').click();document.querySelector('#home-start').click();
            await wait(()=>window.__qaAudioContexts.at(-1)?.state==='running');
            const before=window.__qaAudioContexts.at(-1),count=window.__qaAudioContexts.length;
            const foreground=new Promise(r=>window.addEventListener('kynburst:audio-resume',r,{once:true}));send('qaAudioInterrupt');await foreground;
            const paused=!document.querySelector('#tide-arena').classList.contains('is-playing');document.querySelector('#tide-start').click();
            await wait(()=>window.__qaAudioContexts.length>count&&window.__qaAudioContexts.at(-1).state==='running');
            const current=window.__qaAudioContexts.at(-1),time=current.currentTime;await new Promise(r=>setTimeout(r,400));
            const result={platform:'ios-wkwebview-simulator',nativeNotifications:true,paused,oldState:before.state,state:current.state,clockAdvances:current.currentTime>time,contextsCreated:window.__qaAudioContexts.length};result.passed=paused&&before.state==='closed'&&current.state==='running'&&result.clockAdvances;send('qaAudioResult',{result});
            }catch(error){send('qaAudioResult',{result:{passed:false,error:String(error)}});}})();true;
            """)
        }
        if ProcessInfo.processInfo.arguments.contains("--layout-check") {
            let mode = ProcessInfo.processInfo.arguments.first(where: { $0.hasPrefix("--layout-mode=") })?.replacingOccurrences(of: "--layout-mode=", with: "") ?? "ascend"
            if ["ascend", "survival", "timeRush", "daily", "relax"].contains(mode) {
                webView.evaluateJavaScript("document.querySelector('#home-play').click();document.querySelector('[data-tide-mode=\(mode)]').click();document.querySelector('#home-start').click();")
            }
        }
        #endif
    }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) { loadError = text("Oyun açılamadı. Tekrar deneyebilirsin.", "The game could not load. Please try again.") }
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) { pauseForBackground(); loadError = text("Oyun durdu. Yeniden açabilirsin.", "The game stopped. You can reopen it.") }
}
