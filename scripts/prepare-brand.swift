// Build platform sizes from the approved Popzuno master. No generation/network at runtime.
import AppKit
import Foundation
import ImageIO
import UniformTypeIdentifiers

let root = URL(fileURLWithPath: CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : FileManager.default.currentDirectoryPath)
let fm = FileManager.default
guard let master = NSImage(contentsOf: root.appendingPathComponent("branding/popzuno-master.png")) else { fatalError("Missing brand master") }
func color(_ hex: Int) -> NSColor { NSColor(srgbRed: CGFloat((hex >> 16) & 255)/255, green: CGFloat((hex >> 8) & 255)/255, blue: CGFloat(hex & 255)/255, alpha: 1) }
func png(_ path: String, _ width: Int, _ height: Int, _ draw: (NSRect) -> Void) throws {
    let bitmap = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: width * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(cgContext: bitmap, flipped: false)
    NSGraphicsContext.current?.imageInterpolation = .high
    let rect = NSRect(x: 0, y: 0, width: width, height: height)
    color(0x151226).setFill(); rect.fill()
    draw(rect)
    NSGraphicsContext.restoreGraphicsState()
    let url = root.appendingPathComponent(path)
    try fm.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
    let destination = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(destination, bitmap.makeImage()!, nil)
    guard CGImageDestinationFinalize(destination) else { fatalError("PNG export failed") }
}
func icon(_ path: String, _ size: Int) throws { try png(path, size, size) { master.draw(in: $0, from: .zero, operation: .sourceOver, fraction: 1) } }
func text(_ value: String, x: CGFloat, y: CGFloat, size: CGFloat, hex: Int, weight: NSFont.Weight = .bold) {
    let base = NSFont.systemFont(ofSize: size, weight: weight)
    let font = base.fontDescriptor.withDesign(.rounded).flatMap { NSFont(descriptor: $0, size: size) } ?? base
    (value as NSString).draw(at: NSPoint(x: x, y: y), withAttributes: [.font: font, .foregroundColor: color(hex), .kern: -size * 0.025])
}
try icon("dist/assets/popzuno-mark.png", 256)
try icon("branding/popzuno-icon-1024.png", 1024)
try icon("branding/popzuno-favicon.png", 96)
for size in [40, 58, 60, 80, 87, 120, 180, 1024] {
    try icon("ios/Bulusko/Assets.xcassets/AppIcon.appiconset/icon-\(size).png", size)
}
try icon("android/app/src/main/res/drawable-nodpi/popzuno_icon.png", 512)
try png("publication/store/assets/google-feature-1024x500.png", 1024, 500) { _ in
    master.draw(in: NSRect(x: 35, y: 68, width: 365, height: 365), from: .zero, operation: .sourceOver, fraction: 1)
    text("Popzuno", x: 425, y: 258, size: 103, hex: 0xFFF4ED, weight: .heavy)
    text("Your faces. Epic combos.", x: 430, y: 206, size: 30, hex: 0xD5FF54)
    text("SWIPE · MATCH · BLAST", x: 432, y: 148, size: 21, hex: 0xB9B0CA, weight: .medium)
}
try png("branding/popzuno-logo.png", 1400, 480) { _ in
    master.draw(in: NSRect(x: 25, y: 28, width: 424, height: 424), from: .zero, operation: .sourceOver, fraction: 1)
    text("Popzuno", x: 475, y: 208, size: 176, hex: 0xFFF4ED, weight: .heavy)
    text("Your faces. Epic combos.", x: 488, y: 143, size: 45, hex: 0xD5FF54)
}
print("Popzuno: generated RGB icons, in-game mark, feature graphic and logo lockup.")
