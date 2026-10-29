import Foundation

enum NativeStore {
    static let prefix = "bulusko-v1:"
    static func reset(_ preferences: UserDefaults) {
        for key in preferences.dictionaryRepresentation().keys where key.hasPrefix(prefix) || key.hasPrefix("aile-akisi-v1:") || key == "bulusko.haptics" { preferences.removeObject(forKey: key) }
    }
    static let keys = ["settings", "people", "progress", "stage", "best-journey", "best-free", "best-rush", "best-tide", "tide-daily", "best-swipe", "swipe-daily", "best-grid2-survival", "best-grid2-blitz", "best-grid2-ascend", "grid2-daily", "ascend-top-stage", "best-shapes1-survival", "best-shapes1-blitz", "best-shapes1-ascend", "best-shapes1-timeRush", "shapes1-daily", "shapes1-top-stage"].map { prefix + $0 }

    static func snapshot(_ preferences: UserDefaults) -> String {
        let values = Dictionary(uniqueKeysWithValues: keys.compactMap { key in preferences.string(forKey: key).map { (key, $0) } })
        let data = (try? JSONSerialization.data(withJSONObject: values, options: [.sortedKeys])) ?? Data("{}".utf8)
        return String(data: data, encoding: .utf8) ?? "{}"
    }

    static func save(key: String, value: String, preferences: UserDefaults) -> Bool {
        guard keys.contains(key), value.utf8.count <= 1_300_000,
              let data = value.data(using: .utf8),
              let object = try? JSONSerialization.jsonObject(with: data, options: [.fragmentsAllowed]) else { return false }
        let suffix = String(key.dropFirst(prefix.count))
        switch suffix {
        case "settings":
            guard let settings = object as? [String: Any],
                  let language = settings["language"] as? String, ["tr", "en", "it", "es", "de", "ru"].contains(language),
                  let mode = settings["mode"] as? String, ["journey", "free", "rush", "survival", "blitz", "timeRush", "ascend", "daily"].contains(mode),
                  settings["sound"] is Bool, settings["music"] is Bool,
                  let volume = settings["volume"] as? Double, volume.isFinite, (0...1).contains(volume) else { return false }
        case "people":
            guard let people = object as? [[String: Any]], people.count == 7 else { return false }
            for person in people {
                guard let name = person["name"] as? String, name.count <= 24,
                      let zoom = person["zoom"] as? Double, zoom.isFinite, (1...3).contains(zoom),
                      let x = person["x"] as? Double, x.isFinite, (0...1).contains(x),
                      let y = person["y"] as? Double, y.isFinite, (0...1).contains(y) else { return false }
                if let photo = person["photo"] as? String {
                    let header = "data:image/jpeg;base64,"
                    guard photo.utf8.count <= 160_000, photo.hasPrefix(header),
                          Data(base64Encoded: String(photo.dropFirst(header.count))) != nil else { return false }
                } else if !(person["photo"] is NSNull) { return false }
            }
        case "progress":
            guard let merged = mergeProgress(previous: preferences.string(forKey: key), incoming: value) else { return false }
            preferences.set(merged, forKey: key)
            return true
        case "stage":
            guard let number = object as? Int, (1...12).contains(number) else { return false }
        case "ascend-top-stage", "shapes1-top-stage":
            guard let number = object as? Int, (1...9999).contains(number) else { return false }
            let old = Int(preferences.string(forKey: key) ?? "1") ?? 1
            preferences.set(String(max(old, number)), forKey: key)
            return true
        case "tide-daily", "swipe-daily", "grid2-daily", "shapes1-daily":
            guard let result = object as? [String: Any],
                  let day = result["day"] as? String,
                  day.range(of: "^20[0-9]{2}-[0-9]{2}-[0-9]{2}$", options: .regularExpression) != nil,
                  let score = result["score"] as? Double, score.isFinite, (0...9_000_000_000_000).contains(score) else { return false }
            if let oldValue = preferences.string(forKey: key), let oldData = oldValue.data(using: .utf8),
               let old = try? JSONSerialization.jsonObject(with: oldData) as? [String: Any],
               let oldDay = old["day"] as? String {
                if oldDay > day { return true }
                if oldDay == day, let oldScore = old["score"] as? Double, oldScore >= score { return true }
            }
        case "best-journey", "best-free", "best-rush", "best-tide", "best-swipe", "best-grid2-survival", "best-grid2-blitz", "best-grid2-ascend", "best-shapes1-survival", "best-shapes1-blitz", "best-shapes1-ascend", "best-shapes1-timeRush":
            guard let number = object as? Double, number.isFinite, (0...9_000_000_000_000).contains(number) else { return false }
            let old = Double(preferences.string(forKey: key) ?? "0") ?? 0
            preferences.set(String(max(old, number).rounded(.down)), forKey: key)
            return true
        default: return false
        }
        preferences.set(value, forKey: key)
        return true
    }

    private static func results(_ value: String?) -> [(stars: Int, score: Double)]? {
        guard let value, value.utf8.count < 6000, let data = value.data(using: .utf8),
              let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              object["version"] as? Int == 1, let rows = object["results"] as? [[String: Any]], rows.count == 12 else { return nil }
        var output: [(Int, Double)] = []
        var previousComplete = true
        for row in rows {
            guard let stars = row["stars"] as? Int, (0...3).contains(stars),
                  let score = row["score"] as? Double, score.isFinite, (0...9_000_000_000_000).contains(score) else { return nil }
            let earned = previousComplete ? stars : 0
            output.append((earned, score.rounded(.down)))
            previousComplete = earned > 0
        }
        return output
    }

    static func mergeProgress(previous: String?, incoming: String) -> String? {
        guard let fresh = results(incoming) else { return nil }
        let old = results(previous) ?? Array(repeating: (stars: 0, score: 0.0), count: 12)
        let rows = zip(old, fresh).map { a, b in ["stars": max(a.stars, b.stars), "score": max(a.score, b.score)] as [String: Any] }
        guard let data = try? JSONSerialization.data(withJSONObject: ["version": 1, "results": rows]) else { return nil }
        return String(data: data, encoding: .utf8)
    }
}
