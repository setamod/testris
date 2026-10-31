import Foundation

final class MemoryDefaults: UserDefaults {
    var values = [String: Any]()
    override func string(forKey key: String) -> String? { values[key] as? String }
    override func set(_ value: Any?, forKey key: String) { values[key] = value }
    override func dictionaryRepresentation() -> [String: Any] { values }
    override func removeObject(forKey key: String) { values.removeValue(forKey: key) }
}

@main
struct NativeStoreTests {
    static func main() throws {
        let defaults = MemoryDefaults()
        func save(_ suffix: String, _ value: String) -> Bool { NativeStore.save(key: NativeStore.prefix + suffix, value: value, preferences: defaults) }
        assert(save("stage", "3"))
        assert(!save("stage", "13"))
        assert(!NativeStore.save(key: "familytris-family", value: "[]", preferences: defaults))
        assert(save("settings", "{\"language\":\"tr\",\"mode\":\"journey\",\"sound\":true,\"music\":true,\"volume\":0.5}"))
        assert(!save("settings", "{\"language\":\"tr\",\"mode\":\"journey\",\"sound\":true,\"music\":true,\"volume\":2}"))
        assert(save("settings", "{\"language\":\"tr\",\"mode\":\"ascend\",\"homeRevision\":1,\"cheerVolume\":0.35,\"cheers\":false,\"sound\":true,\"music\":true,\"volume\":0.5}"))
        let migratedSettings = try JSONSerialization.jsonObject(with: Data(defaults.string(forKey: NativeStore.prefix + "settings")!.utf8)) as! [String: Any]
        assert(migratedSettings["homeRevision"] as? Int == 1)
        assert(migratedSettings["cheers"] as? Bool == false)
        assert(migratedSettings["cheerVolume"] as? Double == 0.35)
        assert(save("best-free", "500"))
        assert(save("best-free", "100"))
        assert(Double(defaults.string(forKey: NativeStore.prefix + "best-free")!) == 500)
        assert(save("best-tide", "1250"))
        assert(save("best-tide", "50"))
        assert(Double(defaults.string(forKey: NativeStore.prefix + "best-tide")!) == 1250)
        assert(save("tide-daily", "{\"day\":\"2026-10-26\",\"score\":2500}"))
        assert(save("tide-daily", "{\"day\":\"2026-10-26\",\"score\":100}"))
        assert(defaults.string(forKey: NativeStore.prefix + "tide-daily")!.contains("2500"))
        assert(save("tide-daily", "{\"day\":\"2026-10-27\",\"score\":200}"))
        assert(save("tide-daily", "{\"day\":\"2026-10-26\",\"score\":9999}"))
        assert(defaults.string(forKey: NativeStore.prefix + "tide-daily")!.contains("2026-10-27"))
        assert(!save("tide-daily", "{\"day\":\"bad\",\"score\":99}"))
        assert(save("best-swipe", "1200"))
        assert(save("best-swipe", "80"))
        assert(Double(defaults.string(forKey: NativeStore.prefix + "best-swipe")!) == 1200)
        assert(save("swipe-daily", "{\"day\":\"2026-10-26\",\"score\":900}"))
        assert(save("swipe-daily", "{\"day\":\"2026-10-26\",\"score\":200}"))
        assert(defaults.string(forKey: NativeStore.prefix + "swipe-daily")!.contains("900"))
        for mode in ["survival", "blitz", "ascend", "daily"] {
            assert(save("settings", "{\"language\":\"tr\",\"mode\":\"\(mode)\",\"sound\":true,\"music\":true,\"volume\":0.5}"))
        }
        for mode in ["survival", "blitz", "ascend"] {
            assert(save("best-grid2-\(mode)", "1800"))
            assert(save("best-grid2-\(mode)", "30"))
            assert(Double(defaults.string(forKey: NativeStore.prefix + "best-grid2-\(mode)")!) == 1800)
        }
        assert(save("grid2-daily", "{\"day\":\"2026-10-26\",\"score\":2400}"))
        assert(save("grid2-daily", "{\"day\":\"2026-10-26\",\"score\":20}"))
        assert(defaults.string(forKey: NativeStore.prefix + "grid2-daily")!.contains("2400"))
        assert(save("ascend-top-stage", "5"))
        assert(save("ascend-top-stage", "2"))
        assert(defaults.string(forKey: NativeStore.prefix + "ascend-top-stage") == "5")
        assert(!save("ascend-top-stage", "10000"))
        for mode in ["survival", "blitz", "ascend"] {
            assert(save("best-shapes1-\(mode)", "2800"))
            assert(save("best-shapes1-\(mode)", "50"))
            assert(Double(defaults.string(forKey: NativeStore.prefix + "best-shapes1-\(mode)")!) == 2800)
        }
        assert(save("shapes1-daily", "{\"day\":\"2026-10-27\",\"score\":3400}"))
        assert(save("shapes1-daily", "{\"day\":\"2026-10-27\",\"score\":30}"))
        assert(defaults.string(forKey: NativeStore.prefix + "shapes1-daily")!.contains("3400"))
        assert(save("shapes1-top-stage", "4"))
        assert(save("shapes1-top-stage", "2"))
        assert(defaults.string(forKey: NativeStore.prefix + "shapes1-top-stage") == "4")
        assert(!save("shapes1-top-stage", "10000"))
        for language in ["tr", "en", "it", "es", "de", "ru"] {
            assert(save("settings", "{\"language\":\"\(language)\",\"mode\":\"blitz\",\"sound\":true,\"music\":true,\"volume\":0.5}"))
        }
        assert(!save("settings", "{\"language\":\"xx\",\"mode\":\"blitz\",\"sound\":true,\"music\":true,\"volume\":0.5}"))
        assert(save("settings", "{\"language\":\"tr\",\"mode\":\"timeRush\",\"sound\":true,\"music\":true,\"volume\":0.5}"))
        assert(save("best-shapes1-timeRush", "6200"))
        assert(save("best-shapes1-timeRush", "99"))
        assert(Double(defaults.string(forKey: NativeStore.prefix + "best-shapes1-timeRush")!) == 6200)
        let people: [[String: Any]] = (0..<7).map { _ in ["name": "Ada", "photo": NSNull(), "zoom": 1.0, "x": 0.5, "y": 0.5] }
        let peopleJSON = String(data: try JSONSerialization.data(withJSONObject: people), encoding: .utf8)!
        assert(save("people", peopleJSON))
        for angle: Any in [8.0, NSNull()] {
            var adjusted = people
            adjusted[0]["rotation"] = angle
            let value = String(data: try JSONSerialization.data(withJSONObject: adjusted), encoding: .utf8)!
            assert(save("people", value))
            let stored = try JSONSerialization.jsonObject(with: Data(defaults.string(forKey: NativeStore.prefix + "people")!.utf8)) as! [[String: Any]]
            if let degrees = angle as? Double { assert(stored[0]["rotation"] as? Double == degrees) }
            else { assert(stored[0]["rotation"] is NSNull) }
        }
        var invalid = people
        invalid[0]["photo"] = "https://example.com/photo.jpg"
        let invalidJSON = String(data: try JSONSerialization.data(withJSONObject: invalid), encoding: .utf8)!
        assert(!save("people", invalidJSON))
        func progress(_ stars: Int, _ score: Int) throws -> String {
            var rows = Array(repeating: ["stars": 0, "score": 0], count: 12)
            rows[0] = ["stars": stars, "score": score]
            return String(data: try JSONSerialization.data(withJSONObject: ["version": 1, "results": rows]), encoding: .utf8)!
        }
        let completed = try progress(3, 900)
        let older = try progress(1, 100)
        assert(save("progress", completed))
        assert(save("progress", older))
        let merged = defaults.string(forKey: NativeStore.prefix + "progress")!
        let object = try JSONSerialization.jsonObject(with: merged.data(using: .utf8)!) as! [String: Any]
        let results = object["results"] as! [[String: Any]]
        assert(results[0]["stars"] as! Int == 3)
        assert(results[0]["score"] as! Int == 900)
        let snapshot = NativeStore.snapshot(defaults)
        assert(snapshot.contains("bulusko-v1:people"))
        assert(!snapshot.contains("familytris"))
        defaults.set("keep", forKey: "familytris-family")
        defaults.set("private", forKey: "aile-akisi-v1:people")
        NativeStore.reset(defaults)
        assert(NativeStore.snapshot(defaults) == "{}")
        assert(defaults.string(forKey: "aile-akisi-v1:people") == nil)
        assert(defaults.string(forKey: "familytris-family") == "keep")
        print("Native preference bounds, photo validation, monotonic records/progress and isolated storage passed.")
    }
}
