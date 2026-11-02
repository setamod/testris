import Foundation
import StoreKit

@MainActor final class PremiumStore {
    private(set) var entitled = false
    private(set) var product: Product?
    private let enabled: Bool
    private var updates: Task<Void,Never>?
    var changed: (() -> Void)?
    init(enabled: Bool = CommerceConfig.storeEnabled) {
        self.enabled = enabled
        updates = Task { [weak self] in
            for await update in Transaction.updates {
                guard let self else { return }
                if case .verified(let transaction) = update, transaction.productID == CommerceConfig.productID {
                    await self.refresh(); await transaction.finish()
                }
            }
        }
    }
    deinit { updates?.cancel() }
    func refresh() async {
        var active = false
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result, transaction.productID == CommerceConfig.productID, transaction.revocationDate == nil, !transaction.isUpgraded { active = true }
        }
        entitled = active
        if enabled { product = try? await Product.products(for:[CommerceConfig.productID]).first }
        changed?()
    }
    func buy() async -> String {
        guard enabled, let product, product.type == .nonConsumable else { return "unavailable" }
        do {
            switch try await product.purchase() {
            case .success(.verified(let transaction)):
                guard transaction.productID == CommerceConfig.productID, transaction.revocationDate == nil else { return "error" }
                await refresh(); await transaction.finish(); return entitled ? "purchased" : "error"
            case .success(.unverified): return "error"
            case .userCancelled: return "cancelled"
            case .pending: return "pending"
            @unknown default: return "error"
            }
        } catch { return Self.purchaseFailure(error) }
    }
    static func purchaseFailure(_ error: Error) -> String {
        if case StoreKitError.userCancelled = error { return "cancelled" }
        if let error = error as? SKError, error.code == .paymentCancelled { return "cancelled" }
        return "error"
    }
    func restore() async -> String {
        guard enabled else { return "unavailable" }
        do { try await AppStore.sync(); await refresh(); return entitled ? "restored" : "unavailable" }
        catch { return "error" }
    }
}
