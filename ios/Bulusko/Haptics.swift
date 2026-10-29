import AVFAudio
import CoreHaptics
import UIKit
import AudioToolbox


struct GatheringFeedback {
    let intensity: Float
    let sharpness: Float
    let duration: TimeInterval
    let echoes: Int

    init(lines: Int) {
        let index = min(4, max(1, lines)) - 1
        intensity = [0.38, 0.60, 0.82, 1.0][index]
        sharpness = [0.35, 0.45, 0.60, 0.75][index]
        duration = [0.14, 0.26, 0.39, 0.54][index]
        echoes = index
    }
}

enum GameAudioSession {
    static func restorePlayback() {
        let session = AVAudioSession.sharedInstance()
        try? session.setCategory(.ambient, mode: .default)
        try? session.setAllowHapticsAndSystemSoundsDuringRecording(true)
    }
}

final class GatheringHaptics {
    private var engine: CHHapticEngine?
    private var player: CHHapticPatternPlayer?

    // Stop the current pattern immediately; let auto-shutdown release idle hardware.
    // Avoid racing an asynchronous engine stop against the next line clear.
    func stop() { try? player?.stop(atTime: 0); player = nil }

    private func readyEngine() throws -> CHHapticEngine {
        if let engine { try engine.start(); return engine }
        let created = try CHHapticEngine(audioSession: AVAudioSession.sharedInstance())
        created.playsHapticsOnly = true
        created.isMutedForAudio = true
        created.isAutoShutdownEnabled = true
        created.resetHandler = { [weak self, weak created] in
            DispatchQueue.main.async {
                guard let self, self.engine === created else { return }
                self.player = nil
            }
        }
        created.stoppedHandler = { [weak self, weak created] reason in
            #if DEBUG
            if ProcessInfo.processInfo.arguments.contains("--bulusko-haptics-check") { print("BULUSKO_QA haptic_stopped=\(reason.rawValue)") }
            #endif
            DispatchQueue.main.async {
                guard let self, self.engine === created else { return }
                self.player = nil
            }
        }
        try created.start()
        engine = created
        return created
    }

    func prepare() { if CHHapticEngine.capabilitiesForHardware().supportsHaptics { _ = try? readyEngine() } }

    @discardableResult func clear(_ count: Int) -> Bool {
        let profile = GatheringFeedback(lines: count)
        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { systemTest(); return false }
        for attempt in 0...1 {
            do {
                let active = try readyEngine()
                try? player?.stop(atTime: 0)
                var events = [CHHapticEvent(eventType: .hapticTransient, parameters: [
                    CHHapticEventParameter(parameterID: .hapticIntensity, value: profile.intensity),
                    CHHapticEventParameter(parameterID: .hapticSharpness, value: profile.sharpness)
                ], relativeTime: 0)]
                events.append(CHHapticEvent(eventType: .hapticContinuous, parameters: [
                    CHHapticEventParameter(parameterID: .hapticIntensity, value: profile.intensity * 0.7),
                    CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.2),
                    CHHapticEventParameter(parameterID: .releaseTime, value: Float(profile.duration * 0.5))
                ], relativeTime: 0.015, duration: profile.duration))
                for echo in 0..<profile.echoes {
                    events.append(CHHapticEvent(eventType: .hapticTransient, parameters: [
                        CHHapticEventParameter(parameterID: .hapticIntensity, value: profile.intensity * (0.75 - Float(echo) * 0.12)),
                        CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.3)
                    ], relativeTime: 0.10 + Double(echo) * 0.11))
                }
                let next = try active.makePlayer(with: CHHapticPattern(events: events, parameters: []))
                player = next
                try next.start(atTime: 0)
                #if DEBUG
                if ProcessInfo.processInfo.arguments.contains("--bulusko-haptics-check") { print("BULUSKO_QA haptic_start=success count=\(count) hapticsOnly=\(active.playsHapticsOnly) muted=\(active.isMutedForHaptics)") }
                #endif
                return true
            } catch {
                #if DEBUG
                if ProcessInfo.processInfo.arguments.contains("--bulusko-haptics-check") { print("BULUSKO_QA haptic_error=\(error) retry=\(attempt)") }
                #endif
                player = nil
                engine = nil
            }
        }
        systemTest()
        return false
    }

    func systemTest() { AudioServicesPlaySystemSound(kSystemSoundID_Vibrate) }
}
