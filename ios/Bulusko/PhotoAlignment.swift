import Foundation
import Vision
import ImageIO

// A temporary, on-device eye-line measurement. No image or landmarks are persisted.
enum PhotoAlignment {
    static func analyze(_ data: Data) -> [String: Any] {
        let empty: [String: Any] = ["angle": 0, "confidence": 0, "faces": 0, "eyeDistance": 0]
        guard data.count <= 120_000,
              let source = CGImageSourceCreateWithData(data as CFData, nil),
              let properties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any],
              let width = properties[kCGImagePropertyPixelWidth] as? Int,
              let height = properties[kCGImagePropertyPixelHeight] as? Int,
              (64...512).contains(width), (64...512).contains(height) else { return empty }
        let request = VNDetectFaceLandmarksRequest()
        do { try VNImageRequestHandler(data: data, options: [:]).perform([request]) }
        catch { return empty }
        guard let faces = request.results, faces.count == 1, let face = faces.first,
              face.confidence >= 0.7,
              let left = face.landmarks?.leftEye, left.pointCount >= 4,
              let right = face.landmarks?.rightEye, right.pointCount >= 4 else { return empty }
        func center(_ eye: VNFaceLandmarkRegion2D) -> CGPoint {
            let points = eye.normalizedPoints
            let x = points.reduce(0) { $0 + $1.x } / CGFloat(points.count)
            let y = points.reduce(0) { $0 + $1.y } / CGFloat(points.count)
            return CGPoint(x: (face.boundingBox.minX + x * face.boundingBox.width) * CGFloat(width),
                           y: (face.boundingBox.minY + y * face.boundingBox.height) * CGFloat(height))
        }
        let eyes = [center(left), center(right)].sorted { $0.x < $1.x }
        let dx = eyes[1].x - eyes[0].x, dy = eyes[1].y - eyes[0].y
        // Vision's Y axis points up; Canvas's points down. This is the correction angle.
        let angle = atan2(dy, dx) * 180 / .pi
        return ["angle": angle, "confidence": face.confidence, "faces": 1,
                "eyeDistance": hypot(dx, dy) / CGFloat(width)]
    }
}
