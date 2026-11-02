import Foundation
import Security

// Rolling 24 hours measured in uptime, never civil time. A reboot can extend, not shorten, the wait.
final class CommerceLedger {
    struct State: Codable { var last: Double; var ages: [Double]; var runs: [String]; var receipts: [String] }
    private var value: State
    private let clock: () -> Double
    private let save: (Data) -> Bool
    init(load: () -> Data?, save: @escaping (Data) -> Bool, clock: @escaping () -> Double = { ProcessInfo.processInfo.systemUptime }) {
        self.clock = clock; self.save = save
        self.value = load().flatMap { try? JSONDecoder().decode(State.self, from: $0) } ?? State(last: clock(), ages: [], runs: [], receipts: [])
    }
    private func advance() {
        let now = clock(), delta = max(0, now - value.last)
        value.ages = value.ages.map { $0 + delta }.filter { $0 < 86400 }
        value.last = now
    }
    var remaining: Int { advance(); guard let data = try? JSONEncoder().encode(value), save(data) else { return 0 }; return max(0,3-value.ages.count) }
    func consume(run: String, receipt: String) -> Bool {
        advance()
        guard value.ages.count < 3, !value.runs.contains(run), !value.receipts.contains(receipt) else { return false }
        let before = value
        value.ages.append(0); value.runs = Array((value.runs+[run]).suffix(256)); value.receipts = Array((value.receipts+[receipt]).suffix(256))
        guard let data = try? JSONEncoder().encode(value), save(data) else { value = before; return false }
        return true
    }
    static func device() -> CommerceLedger {
        let query: [String:Any] = [kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:"popzuno.reward-quota.v1",kSecAttrAccount as String:"device"]
        return CommerceLedger(load: {
            var q = query; q[kSecReturnData as String] = true; q[kSecMatchLimit as String] = kSecMatchLimitOne
            var item: CFTypeRef?; return SecItemCopyMatching(q as CFDictionary,&item) == errSecSuccess ? item as? Data : nil
        }, save: { data in
            let changes: [String:Any] = [kSecValueData as String:data]
            let status = SecItemUpdate(query as CFDictionary,changes as CFDictionary)
            if status == errSecSuccess { return true }
            guard status == errSecItemNotFound else { return false }
            var q = query; q[kSecValueData as String] = data; q[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
            return SecItemAdd(q as CFDictionary,nil) == errSecSuccess
        })
    }
}
