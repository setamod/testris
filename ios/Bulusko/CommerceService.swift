import Foundation
import UIKit
import GoogleMobileAds
import UserMessagingPlatform

@MainActor final class CommerceService: NSObject, FullScreenContentDelegate {
    var emit: (([String:Any]) -> Void)?
    var presenter: (() -> UIViewController?)?
    private let premium = PremiumStore()
    private let ledger = CommerceLedger.device()
    private var ad: RewardedAd?
    private var loadedAt: TimeInterval = 0
    private var initialized = false
    private var adGeneration = 0
    private var loading = false
    private var busy = false
    private var activeID: String?
    private var activeRun = ""
    private var earned = false
    private var optedIn = false
    private var age = UserDefaults.standard.string(forKey:"popzuno-commerce.audience") ?? "unknown"
    override init() {
        super.init(); premium.changed = { [weak self] in self?.state() }
    }
    func state() {
        if ProcessInfo.processInfo.systemUptime - loadedAt > 3500 { ad = nil }
        emit?(["kind":"state","supported":true,"age":age,"ready":age == "adult" && ad != nil && !busy,"remaining":ledger.remaining,"premium":premium.entitled,"canPurchase":premium.product != nil && CommerceConfig.storeEnabled && age == "adult","price":premium.product?.displayPrice ?? "","privacyRequired":ConsentInformation.shared.privacyOptionsRequirementStatus == .required])
    }
    func handle(_ body: [String:Any]) {
        let op = body["op"] as? String ?? ""
        if op == "status" { state(); Task { await premium.refresh() }; return }
        guard let id = body["id"] as? String, id.range(of:"^[a-zA-Z0-9-]{1,96}$",options:.regularExpression) != nil else { return }
        guard !busy else { result(id,"unavailable"); return }
        if op == "audience" {
            guard let band=body["age"] as? String,["unknown","child","teen","adult"].contains(band) else { result(id,"error");return }
            adGeneration += 1;ad=nil;age=band;UserDefaults.standard.set(band,forKey:"popzuno-commerce.audience");result(id,"closed");state();return
        }
        if op == "show" {
            guard age == "adult", let run = body["run"] as? String, run.range(of:"^[a-zA-Z0-9-]{1,96}$",options:.regularExpression) != nil,
                  let placement = body["placement"] as? String, ["rows","time","stage"].contains(placement),ledger.remaining > 0,
                  ProcessInfo.processInfo.systemUptime-loadedAt < 3500, let ad, let controller=presenter?(), UIApplication.shared.applicationState == .active else { result(id,"unavailable"); return }
            busy = true; activeID = id; activeRun = run; earned = false; self.ad = nil; state()
            ad.present(from:controller) { [weak self] in self?.earned = true }
            return
        }
        guard ["prepare","privacy","buy","restore"].contains(op) else { result(id,"error"); return }
        busy = true
        Task {
            var code = "error"
            switch op {
            case "prepare": code = await prepare()
            case "privacy":
                adGeneration += 1;ad = nil
                do { try await ConsentForm.presentPrivacyOptionsForm(from:presenter?()); code = "closed" }
                catch { code = "error" }
                // Revoking consent discards cached ads; explicit prepare must recheck before reloading.
            case "buy": code = age == "adult" ? await premium.buy() : "unavailable"
            case "restore": code = await premium.restore()
            default: break
            }
            busy = false; result(id,code); state()
        }
    }
    static func initializeAdvertisingSDK() async {
        MobileAds.shared.requestConfiguration.ageRestrictedTreatment = .unspecified
        MobileAds.shared.requestConfiguration.maxAdContentRating = .general
        MobileAds.shared.requestConfiguration.publisherPrivacyPersonalizationState = .disabled
        await MobileAds.shared.start()
        MobileAds.shared.requestConfiguration.setPublisherFirstPartyIDEnabled(false)
    }
    private func prepare() async -> String {
        guard age == "adult", CommerceConfig.adsEnabled else { return "unavailable" }
        adGeneration += 1;ad = nil; optedIn = true
        let parameters = RequestParameters(); parameters.isTaggedForUnderAgeOfConsent = false
        do {
            try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void,Error>) in
                ConsentInformation.shared.requestConsentInfoUpdate(with:parameters) { error in
                    if let error { continuation.resume(throwing:error) } else { continuation.resume() }
                }
            }
            guard UIApplication.shared.applicationState == .active else { return "unavailable" }
            try await ConsentForm.loadAndPresentIfRequired(from:presenter?())
            guard ConsentInformation.shared.canRequestAds else { return "unavailable" }
            if !initialized {
                await Self.initializeAdvertisingSDK(); initialized = true
            }
            return await loadAd() ? "closed" : "unavailable"
        } catch { return "unavailable" }
    }
    private func loadAd() async -> Bool {
        guard age == "adult", !loading, optedIn, ConsentInformation.shared.canRequestAds, ledger.remaining > 0 else { return false }
        let generation = adGeneration
        loading = true; defer { loading = false }
        do { let next = try await RewardedAd.load(with:CommerceConfig.rewardedID,request:Request());guard generation == adGeneration, age == "adult", ConsentInformation.shared.canRequestAds else { return false };next.fullScreenContentDelegate = self;ad = next;loadedAt = ProcessInfo.processInfo.systemUptime;return true }
        catch { ad = nil;return false }
    }
    private func result(_ id: String,_ code: String) { emit?(["kind":"result","id":id,"code":code]) }
    func adDidDismissFullScreenContent(_ ad: FullScreenPresentingAd) {
        guard let id=activeID else { return }; activeID = nil
        if UIApplication.shared.applicationState == .active { GameAudioSession.restorePlayback(activate:true) }
        let rewarded = earned && ledger.consume(run:activeRun,receipt:id); earned = false;busy = false
        result(id,rewarded ? "earned" : "closed");state()
        Task { _ = await loadAd();state() }
    }
    func ad(_ ad: FullScreenPresentingAd,didFailToPresentFullScreenContentWithError error: Error) {
        guard let id=activeID else { return };activeID = nil;earned = false;busy = false;result(id,"error");state()
    }
}
