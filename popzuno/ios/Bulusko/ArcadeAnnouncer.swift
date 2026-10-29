import AVFAudio
import UIKit

/// Fixed arcade phrases, generated on-device and kept in a bounded RAM cache.
/// No recordings, voice uploads or audio-session deactivation.
final class ArcadeAnnouncer {
    private let synth = AVSpeechSynthesizer()
    private let engine = AVAudioEngine()
    private let player = AVAudioPlayerNode()
    private let eq = AVAudioUnitEQ(numberOfBands: 2)
    private let room = AVAudioUnitReverb()
    private let phrases = ["four": "Nice move!", "five": "Awesome!", "cross": "Excellent!", "combo3": "Triple combo!", "combo4": "Monster combo!", "nova": "Oh yeah!", "novaReady": "Nova ready!"]
    private var cache = [String: AVAudioPCMBuffer]()
    private var work = [String]()
    private var chunks = [AVAudioPCMBuffer]()
    private var rendering = false
    private var connected = false
    private var pending: (kind: String, volume: Float, until: CFTimeInterval)?
    private var activePriority = 0
    private func priority(_ kind: String) -> Int { ["four": 10, "five": 30, "cross": 35, "combo3": 50, "combo4": 60, "nova": 100, "novaReady": 70][kind] ?? 0 }
    private var generation = 0

    func prepare() {
        guard work.isEmpty, !rendering, cache.isEmpty else { return }
        work = ["nova", "novaReady", "five", "four", "cross", "combo3", "combo4"]
        renderNext()
    }
    func stop() {
        pending = nil; generation += 1; player.stop(); engine.pause()
    }
    func play(_ kind: String, volume: Float) {
        let now = CACurrentMediaTime()
        guard phrases[kind] != nil, volume.isFinite, volume > 0,
              UIApplication.shared.applicationState == .active,
              !UIAccessibility.isVoiceOverRunning else { return }
        if player.isPlaying && activePriority > priority(kind) { return }
        if let request = pending, priority(request.kind) > priority(kind) { return }
        // Never append spoken phrases to a queue. An uncached request may expire.
        pending = (kind, min(1, volume), now + 3.5)
        if let buffer = cache[kind] { pending = nil; playBuffer(buffer, kind: kind, volume: volume); return }
        if !work.contains(kind) { work.insert(kind, at: 0) }
        renderNext()
    }
    private func renderNext() {
        guard !rendering, !work.isEmpty else { return }
        let kind = work.removeFirst()
        if cache[kind] != nil { renderNext(); return }
        let voices = AVSpeechSynthesisVoice.speechVoices().filter { voice in
            guard voice.language.hasPrefix("en-") else { return false }
            if #available(iOS 17.0, *), voice.voiceTraits.contains(.isNoveltyVoice) || voice.voiceTraits.contains(.isPersonalVoice) { return false }
            return !["Fred", "Zarvox", "Trinoids", "Whisper", "Bubbles", "Boing", "Bad News", "Good News", "Bells"].contains(voice.name)
        }
        func rank(_ voice: AVSpeechSynthesisVoice) -> Int {
            (voice.language == "en-US" ? 1000 : 0) + voice.quality.rawValue * 200 + (voice.gender == .male ? 250 : 0) + (["Aaron", "Evan", "Alex"].contains(voice.name) ? 30 : 0)
        }
        guard let voice = voices.sorted(by: { rank($0) > rank($1) }).first,
              let text = phrases[kind] else { work = []; pending = nil; return }
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = voice; utterance.rate = AVSpeechUtteranceDefaultSpeechRate * (kind == "nova" || kind == "combo4" ? 1.08 : 1.02)
        utterance.pitchMultiplier = 1; utterance.volume = 1
        rendering = true; chunks = []
        synth.write(utterance) { [weak self] audio in
            guard let pcm = audio as? AVAudioPCMBuffer else { return }
            var copy: AVAudioPCMBuffer?
            if pcm.frameLength > 0, let own = AVAudioPCMBuffer(pcmFormat: pcm.format, frameCapacity: pcm.frameLength) {
                own.frameLength = pcm.frameLength
                let source = UnsafeMutableAudioBufferListPointer(pcm.mutableAudioBufferList)
                let dest = UnsafeMutableAudioBufferListPointer(own.mutableAudioBufferList)
                for index in 0..<min(source.count, dest.count) {
                    if let from = source[index].mData, let to = dest[index].mData { memcpy(to, from, Int(source[index].mDataByteSize)) }
                }
                copy = own
            }
            let finished = pcm.frameLength == 0
            DispatchQueue.main.async {
                guard let self else { return }
                if let copy, self.chunks.reduce(0, { $0 + Int($1.frameLength) }) < Int(copy.format.sampleRate * 2.5) { self.chunks.append(copy) }
                if finished { self.finishRender(kind) }
            }
        }
    }
    private func finishRender(_ kind: String) {
        rendering = false
        defer { chunks = []; renderNext() }
        guard let first = chunks.first else { pending = nil; return }
        let total = chunks.reduce(0) { $0 + $1.frameLength }
        guard let joined = AVAudioPCMBuffer(pcmFormat: first.format, frameCapacity: total) else { pending = nil; return }
        joined.frameLength = total
        let dest = UnsafeMutableAudioBufferListPointer(joined.mutableAudioBufferList)
        var offset = 0
        for chunk in chunks {
            let source = UnsafeMutableAudioBufferListPointer(chunk.mutableAudioBufferList)
            for channel in 0..<min(dest.count, source.count) {
                if let to = dest[channel].mData, let from = source[channel].mData { memcpy(to.advanced(by: offset), from, Int(source[channel].mDataByteSize)) }
            }
            offset += Int(source[0].mDataByteSize)
        }
        // Preserve natural articulation. Only normalize, never distort or pitch-shift.
        if joined.format.commonFormat == .pcmFormatFloat32 {
            for buffer in dest {
                guard let data = buffer.mData else { continue }
                let samples = data.assumingMemoryBound(to: Float.self), count = Int(buffer.mDataByteSize) / MemoryLayout<Float>.size
                var peak: Float = 0
                for i in 0..<count { peak = max(peak, abs(samples[i])) }
                let gain: Float = peak > 0.01 ? min(1.8, 0.88 / peak) : 1
                for i in 0..<count { samples[i] *= gain }
            }
        }
        cache[kind] = joined
        if let request = pending, request.kind == kind {
            pending = nil
            if CACurrentMediaTime() <= request.until { playBuffer(joined, kind: kind, volume: request.volume) }
        }
    }
    private func playBuffer(_ buffer: AVAudioPCMBuffer, kind: String, volume: Float) {
        guard UIApplication.shared.applicationState == .active, !UIAccessibility.isVoiceOverRunning else { return }
        if !connected {
            for node in [player, eq, room] as [AVAudioNode] { engine.attach(node) }
            eq.bands[0].filterType = .highPass; eq.bands[0].frequency = 85; eq.bands[0].bypass = false
            eq.bands[1].filterType = .parametric; eq.bands[1].frequency = 2300; eq.bands[1].gain = 1.5; eq.bands[1].bandwidth = 1.2; eq.bands[1].bypass = false
            room.loadFactoryPreset(.mediumHall); room.wetDryMix = 4
            let nodes = [player, eq, room, engine.mainMixerNode] as [AVAudioNode]
            for i in 0..<(nodes.count - 1) { engine.connect(nodes[i], to: nodes[i + 1], format: buffer.format) }
            connected = true
        }
        player.stop(); activePriority = priority(kind); generation += 1; let token = generation
        player.volume = min(0.85, max(0, volume * 0.9))
        player.scheduleBuffer(buffer, completionCallbackType: .dataPlayedBack) { [weak self] _ in
            DispatchQueue.main.async { if let self, self.generation == token { self.engine.pause() } }
        }
        do { try engine.start(); player.play() } catch { stop() }
    }
}
