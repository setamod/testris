import Foundation
@main enum AlignmentTests {
    static func main() throws {
        let folder = URL(fileURLWithPath:CommandLine.arguments[1])
        var results: [String: [String: Any]] = [:]
        for name in ["face-0.jpg","face-8.jpg","face--8.jpg","blank.jpg"] {
            results[name] = PhotoAlignment.analyze(try Data(contentsOf:folder.appendingPathComponent(name)))
        }
        for name in ["face-0.jpg","face-8.jpg","face--8.jpg"] {
            precondition(results[name]!["faces"] as? Int == 1)
            precondition((results[name]!["confidence"] as? Float ?? 0) >= 0.7)
            let distance = results[name]!["eyeDistance"] as! CGFloat
            precondition((0.15...0.65).contains(distance))
        }
        let baseline = results["face-0.jpg"]!["angle"] as! CGFloat
        let plus = results["face-8.jpg"]!["angle"] as! CGFloat
        let minus = results["face--8.jpg"]!["angle"] as! CGFloat
        precondition(abs((plus-baseline)-8) < 3 && abs((minus-baseline)+8) < 3)
        precondition(results["blank.jpg"]!["faces"] as? Int == 0)
        let report: [String:Any] = ["passed":true,"fixture":"NASA public-domain astronaut portrait; test-only; no personal photos", "correctionDirectionVerified":true,"results":results]
        let data = try JSONSerialization.data(withJSONObject:report,options:[.prettyPrinted,.sortedKeys])
        try data.write(to:URL(fileURLWithPath:CommandLine.arguments[2]))
        print("PHOTO_ALIGNMENT_NATIVE_PASS: eye-line direction, single-face confidence, blank fallback")
    }
}
