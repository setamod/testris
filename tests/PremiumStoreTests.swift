import XCTest
import StoreKit
import StoreKitTest
@testable import Bulusko

final class PremiumStoreTests: XCTestCase {
    @MainActor private func prepare() throws -> SKTestSession {
        let url=try XCTUnwrap(Bundle(for:Self.self).url(forResource:"PopzunoPremium",withExtension:"storekit"))
        let session=try SKTestSession(contentsOf:url)
        session.resetToDefaultState();session.disableDialogs=true;session.clearTransactions()
        XCTAssertFalse(CommerceConfig.storeEnabled,"The production configuration stays disabled during local tests")
        return session
    }
    @MainActor func testVerifiedPurchaseReloadRestoreAndRefund() async throws {
        let session=try prepare(),store=PremiumStore(enabled:true)
        await store.refresh();XCTAssertNotNil(store.product);XCTAssertFalse(store.entitled)
        let purchased=await store.buy();XCTAssertEqual(purchased,"purchased");XCTAssertTrue(store.entitled)
        let reopened=PremiumStore(enabled:true);await reopened.refresh();XCTAssertTrue(reopened.entitled)
        let restored=await reopened.restore();XCTAssertEqual(restored,"restored")
        let transaction=try XCTUnwrap(session.allTransactions().first)
        try session.refundTransaction(identifier:transaction.identifier)
        for _ in 0..<30 { await reopened.refresh();if !reopened.entitled { break };try await Task.sleep(nanoseconds:100_000_000) }
        XCTAssertFalse(reopened.entitled,"A revoked transaction cannot retain Premium")
        session.clearTransactions()
    }
    @MainActor func testPendingPurchaseDoesNotUnlock() async throws {
        let session=try prepare();session.askToBuyEnabled=true
        let store=PremiumStore(enabled:true);await store.refresh()
        let result=await store.buy();XCTAssertEqual(result,"pending");XCTAssertFalse(store.entitled)
        session.clearTransactions()
    }
    @MainActor func testNativeAdSDKConfigurationAndInitialization() async {
        // Actual SDK calls on a simulator, no ad request and no account/consent bypass in the app flow.
        await CommerceService.initializeAdvertisingSDK()
    }
    @MainActor func testSimulatedCancellationNeverUnlocks() async throws {
        let session=try prepare(),store=PremiumStore(enabled:true);await store.refresh()
        try await session.setSimulatedError(.generic(.userCancelled),forAPI:.purchase)
        let result=await store.buy()
        // iOS 27.0's test daemon can surface this injection as undocumented ASD error 907.
        // Both outcomes must fail closed; actual store-sheet cancellation still needs a device test.
        XCTAssertTrue(["cancelled","error"].contains(result));XCTAssertFalse(store.entitled)
        print("STOREKIT_SIMULATED_CANCELLATION_RESULT=\(result)")
        session.clearTransactions()
    }
    @MainActor func testDocumentedCancellationAndFailureClassification() {
        XCTAssertEqual(PremiumStore.purchaseFailure(StoreKitError.userCancelled),"cancelled")
        XCTAssertEqual(PremiumStore.purchaseFailure(SKError(.paymentCancelled)),"cancelled")
        XCTAssertEqual(PremiumStore.purchaseFailure(StoreKitError.networkError(URLError(.notConnectedToInternet))),"error")
        XCTAssertEqual(PremiumStore.purchaseFailure(NSError(domain:"UnknownStoreError",code:907)),"error")
    }
    @MainActor func testInvalidSignatureDoesNotUnlock() async throws {
        let session=try prepare(),store=PremiumStore(enabled:true);await store.refresh()
        try await session.setSimulatedError(.verification(.invalidSignature),forAPI:.verification)
        let result=await store.buy();XCTAssertEqual(result,"error");XCTAssertFalse(store.entitled)
        session.clearTransactions()
    }
    @MainActor func testUnconfiguredStoreDoesNotStartPurchasesOrRestore() async throws {
        let session=try prepare();let store=PremiumStore(enabled:false)
        await store.refresh();XCTAssertNil(store.product)
        let bought=await store.buy(),restored=await store.restore()
        XCTAssertEqual(bought,"unavailable");XCTAssertEqual(restored,"unavailable");XCTAssertFalse(store.entitled)
        session.clearTransactions()
    }
    @MainActor func testNetworkFailureDoesNotUnlock() async throws {
        let session=try prepare();let store=PremiumStore(enabled:true);await store.refresh()
        try await session.setSimulatedError(.generic(.networkError(URLError(.notConnectedToInternet))),forAPI:.purchase)
        let result=await store.buy();XCTAssertEqual(result,"error");XCTAssertFalse(store.entitled)
        session.clearTransactions()
    }
}
