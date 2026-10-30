# Popzuno — Swipe. Match. Unleash.

Popzuno 0.9.12 (build 21) is an offline swipe-and-match game with an 8 × 11 board, local photo customization and five selectable modes. It is a beta candidate; the original Familytris app remains separate. Current device and distribution evidence is recorded in publication/VALIDATION.json and publication/TESTFLIGHT-STATUS.json.

## Publication preparation

See `STORE-READINESS.md` for the ordered, evidence-based task list. `publication/VALIDATION.json` and `publication/OWNER-STEPS-TR.md` distinguish completed local checks from owner/account/legal/test-track gates.

- Six-language privacy policy, bundled third-party notices and confirmed full local data deletion are under Settings → Privacy and licenses. Current and legacy prototype data are removed on explicit confirmation; other games' keys and original gallery files are preserved.
- Public support/policy site: https://popzuno.frostytang32768.chatgpt.site . Only support/policy content is hosted there; the game and user photos are not uploaded.
- iOS Release archive and Android test APK/unsigned Release AAB are prepared locally. They are not store submissions. Developer enrollment, production signing, final price/markets/age declarations and professional IP review remain separate gates.
- Android uses the system image picker, native haptics, audio/background handling and safe system-bar insets. It has no Internet, broad gallery, camera or microphone permission. Backups/transfers are disabled. iOS backups are described in the policy rather than promised absent.
- `npm run prepare:publication` regenerates six store metadata files, support/policy pages and icon assets. `npm run prepare:android`, `npm run build:android`, `npm run test:android` prepare/build/test the Android shell. Native smoke tests deliberately require the created emulator and `.debug` app; they never target the physical iPhone or personal photos.
- The isolated `.tooling/` directory, credentials/keys, build outputs and the standalone Sites source checkout are excluded from the main project's Git tracking. The Site ID and deployment evidence are retained in `publication/`.

## Menu, fixed announcer clips and pressure cues

The game always opens on a clean home screen: prominent Play, a real local-record challenge, Your people, Settings and How to play. Play opens the mode picker; only the selected mode's short description is shown. Ascend, Rush, Time Rush, Daily 90 and Relax remain selectable; legacy Blitz keys and engine behavior are retained for old records. Power icons and concise descriptions live in How to play, with separate control and mode tabs. Settings includes privacy/licenses and support contact. Returning home pauses a run; selecting the same mode continues it.

Seven expressive synthetic clips are generated once with Chatterbox (MIT), using a wholly synthetic Kokoro-82M reference (Apache-2.0 weights). Only 415,028 bytes / 8.64 seconds of lossless 24 kHz mono outputs ship, retaining the default PerTh watermark. No speech model or generator is distributed. Normal playback requires no network or on-device inference; an installed offline OS voice is a decoder-unavailable fallback. Provenance and licenses are in `vendor/ANNOUNCER-ASSETS.json` and `vendor/music-NOTICE.txt`.

Ordinary triples and double combos have effects only. Fixed calls are four → Nice Move; five → Awesome; L/T → Excellent; combo ×3/×4+ → Triple/Monster Combo; Nova activation → Oh Yeah; successful Nova acquisition → Nova Ready. The reward call has a 1.8-second spacing guard and does not fire when inventory is full. Bomb/Rocket/Cross/Shuffle activation uses effects only. Calls have 4.5-second spacing (6.5 seconds for fours); stronger combos can escalate after 2.5 seconds. Each combo tier is spoken once in a sustained chain. Nova can preempt lower calls, with repeated activations not restarting a current scream. The four, Monster Combo and Nova recordings were replaced after owner pronunciation feedback. All seven phrases now match unprompted local speech recognition; candidate audio with mismatching words is rejected before embedding. Owner listening remains the final tone/balance review. No spoken queue forms. Stage breaks preserve pending winning calls. Settings previews replace the preceding preview.

The independent announcer slider defaults to 40%. It changes only the voice lane; music/effects gains and sequencer are preserved. A single speech lane cannot be stolen by music/blasts, and ordinary calls cannot interrupt one another. Mute, pause, background and master-volume changes cancel pending speech. The seven short clips are decoded once and cached. Generation tooling and multi-gigabyte models remain local and excluded from packages.

All timed modes use a large countdown in the existing HUD, amber at 15 seconds and a localized red pulse at five seconds. Overflow modes warn at the top edge and pulse its danger zone when the top row is occupied. A usable power gets a brief reminder after inactivity, at most once every eight seconds. No full-screen strobe is used; Reduced Motion disables pulses.

A full-screen result card explains automatic overflow, manual-row overflow, an empty Time Rush clock or completion of the fixed 60/90-second modes. Timed endings snap to exactly zero. The background is inert while the result is open; replay/menu controls remain accessible. All six languages are supported.

## Phone gameplay fit

While playing on phones, the redundant global header, best score, tempo and footer hints are omitted. The menu, score, level/countdown, stage goal, Overdrive/combo and all five powers remain available. The board uses a size-query container in the remaining viewport row, preserving square cells and taking the largest width/height that fits. It does not perform layout measurements during animation. Safe-area padding and 44-pixel touch targets are retained. Menus and dialogs keep normal scrolling. Instructions and pattern badges remain in Help.

## Main game and stage progression

Ascend is the first/default mode on fresh and legacy installs. Later explicit mode choices remain remembered; old Blitz preferences map to Daily 90 without deleting legacy scores. A 3.6-second stage break announces the next target, gift, tempo and difficulty change with a 3–2–1 countdown. Game clocks, Overdrive and rising freeze until the new stage starts; pausing preserves the countdown. The old tempo holds during the break, then the next tempo and arrangement begin together. All six languages and Reduced Motion are supported.

## Play

Open `../releases/Popzuno-Prototip/OYNA.html`, or run `npm start` and visit `http://127.0.0.1:4186`. The portable HTML embeds its runtime and fonts; it needs no server or connection. The previous `Bulusko-Prototip/OYNA.html` bookmark is also updated in place, keeping that file location available.

Swipe a face towards an adjacent cell, or tap two neighbours in sequence. A valid move creates a horizontal/vertical line of at least three matching faces. An invalid move returns. Faces above a match fall; cascades score extra points.

| Opening shape, completed in one swap | Reward |
|---|---|
| Straight line of 3 | Points |
| 2 × 2 square | Bomb: blast a 3 × 3 area around a chosen block |
| Horizontal line of 4 | Rocket: clear a chosen row |
| Vertical line of 4 | Shuffle: rearrange existing faces and open a legal move |
| Two lines of 3 sharing a face (L/T) | Cross: clear a chosen row and column |
| Straight line of at least 5 | Nova: clear the board |

All matches resolve immediately. Squares are matches even without a triple. Powers depend on geometry, rather than the total number of faces cleared. L/T intersections merge; separate triples or a 2 × 3 rectangle do not become a Nova. Only the strongest reward from the player's opening move is granted: Nova > Cross > Rocket > Shuffle > Bomb. Cascades, rising rows and powers do not generate powers. Hold up to two Bombs, two Rockets, two Crosses, two Shuffles and 99 Novas per run. Nova stock carries between Ascend stages and stacks in every mode. Targeted powers use a chosen occupied block; Nova and Shuffle activate immediately. The help and ready screens show diagrams for all five patterns. Keyboard powers: 1/2/3/4/5 (Bomb/Rocket/Cross/Nova/Shuffle).

Consecutive successful moves within 3.2 seconds build a multiplier up to ×5. Resolution animations preserve this input window and pause rising. Matching 30 faces triggers 6 seconds of Overdrive: doubled points and frozen rising. Timed-mode clocks continue during animations and Overdrive; pausing/backgrounding stops active time.

## Shuffle

Shuffle preserves all occupied slots and the count of every face. A constrained assignment tries at most 32 times, accepting only a changed layout with no automatic matches and at least one legal swap. If none is found, the power is retained. Its RNG is separate from rising rows and refills, so Daily row streams remain unchanged. It awards no score or time; existing cells animate to new positions for 280 ms. No new dependencies or images are loaded.

## Five modes

- **Rush:** survive the rising board. Speed increases every 25 active seconds. Call a row manually for +25 points and new matching opportunities.
- **Blitz 60:** 60 active seconds, no rising or overflow. The bottom six rows (48 faces) refill after every resolved move. Refills are generated without free matches, with a fresh board as a fallback if no legal swap remains. New blocks start stacked above the ceiling and slide down their column over 320 ms, staggered by 12 ms per column (404 ms total). Pause freezes/resumes their motion; Reduced Motion shows the final positions. The clock stays fixed at 60 seconds and continues during refill animation.
- **Time Rush:** start with 30 seconds and one Shuffle. No rising; the board refills like Blitz. A player-made triple adds 2 seconds; larger matches add more, up to 7 seconds. Cascades earn half, capped at 8 seconds per initiating move and 60 seconds in the reserve. Power clears and Shuffle add no time. Drain rises by 0.1× every 30 active seconds, capped at 1.8×; the palette grows from four to seven faces every 60 seconds. Zero ends the run immediately. Pause/background freezes active time.
- **Ascend:** clear a face target to advance. The first target is 24; later targets grow by eight up to 120. The board resets safely, inventory carries over, and a gift power is granted if its slot has space. Stages add colors (up to seven) and rising speed. Stage 5 and every fifth stage can gift a Nova. Highest stage is saved. A new run starts at stage 1.
- **Daily 90:** 90 active seconds, deterministic opening and row stream for each UTC day, using the `kynburst-shapes1` ruleset.

Each mode has a separate local score. Enlarged-board records use `best-shapes1-survival`, `best-shapes1-blitz`, `best-shapes1-ascend`, `best-shapes1-timeRush`, `shapes1-daily`; the stage record uses `shapes1-top-stage`. Older records are retained but not compared with the new rules. Records also save on pause and mode change. No account, server leaderboard, ads or analytics are included.

## Photos, audio and effects

My family supports seven local photos/names with automatic face framing and manual crop controls. The iPhone bundle identifier and `bulusko-v1:` storage prefix are retained. Photos and settings are not migrated to a new application or uploaded. Earlier prototype data is kept; the retired puzzle is absent from the interface/runtime.

Circuit Bloom's melody is preserved. Tempo now follows the actual rising interval/stage between 118 and 178 BPM; Blitz uses its countdown. Pressure, chains and the final seconds control the drum/arrangement intensity separately. A BPM label and speed cue make changes visible/audible. Powers use original, pre-rendered stereo impacts with attack, low-end body, debris and short reflections. Each power plays one buffered voice on a separate effects bus and cannot steal music voices. Native haptics are reused.

Earned powers fly towards their inventory slot. Bomb has a shock ring, Rocket a row beam and moving projectile, Cross crossed row/column beams, Nova a radial pulse and sparks; Ascend has stage celebrations. Visual nodes are bounded and removed after their animations. Reduced Motion uses quiet highlights rather than moving particles/shake. No media downloads or new runtime dependencies were added.

## Smooth rendering and natural photos

The 88 buttons/images persist through swaps, clears and refills. Only changed portraits update their source. Status text updates at 10 Hz or immediately for game events; rising and gauges remain frame-synchronous compositor transforms. Record reads and number formatters are cached. Photo cache lookups do not serialize image data. Local match checks reduce repeated full-board scans; seeded gameplay remains identical. The historical 0.7 comparative CPU workload is in `PERFORMANCE.json` (not a current device FPS result).

Photos keep their rendered natural colors, with no luminosity blend, desaturation or fever color filter. Seven more saturated colors, thicker frames, solid lower color bands and numbered badges identify families. Effects use fewer particles, transform/opacity animations and no whole-board impact shake; Reduced Motion remains supported.

## Six languages

Choose Türkçe, English, Italiano, Español, Deutsch or Русский in ? → Dil / Language. Game HUD/results/powers, instructions, family/photo controls, accessibility labels, native app settings and load errors are localized. Preferences preserve the selected language. Number formatting uses the matching locale. Universal mode/power names and branding remain consistent.

## iPhone installation

The previous 0.9.4 (13) menu was confirmed by the owner. Current 0.9.8 (17) installation status is recorded in ios/BUILD_STATUS.json. Photos, settings and 0.6 records retain the same application storage identity. The 0.8 build report is preserved separately.

## Development and verification

- `npm test`: geometry, 500 generated openings, rewards/caps, all five modes, clocks and fractional boundaries, seeded runs, saved data bounds, translations, audio pool separation and removal of the honeycomb UI.
- Native preference tests: `ios/Bulusko/NativeStore.swift` + `tests/NativeStoreTests.swift` (Foundation-only harness).
- `npm run package`: portable HTML/ZIP; legacy file entries are refreshed too.
- `npm run prepare:ios`: embed the portable game and generate the existing iOS project. Internal target/scheme `Bulusko` and bundle ID `com.mertbekisoglu.bulusko` intentionally remain stable. Visible name: Popzuno.
- Current build/install and browser QA evidence: `VALIDATION.json`, `ios/BUILD_STATUS.json`. Real listening, haptic feel and long-term gameplay balance require player feedback.

Previous sources and playable 0.4/0.5/0.6/0.7/0.8 packages are in `backups/`. Third-party notices remain in `vendor/SOURCES.md` and the portable package's `Lisanslar/` directory. Popzuno is a working name; preliminary search is not trademark clearance. No App Store submission has been performed.

## Popzuno identity · 0.9.8 (17)

Approved name and generated three-face game emblem are in `branding/`. iOS/Android display names, six languages, offline packages and public support pages use Popzuno. Bundle/application ID, native preference stores, local browser keys and daily seed stay unchanged so in-place updates preserve user records. Previous names in historical research are retained as evidence. The name has a preliminary exact-name/store scan only; no formal trademark clearance is claimed.

## 0.9.9 (18) · readability and arcade feedback

Larger menu/HUD type with unchanged cell number badges; five colored power slots with larger icons and visible stock counts; whole-row arrivals after a separate countdown; tappable Overdrive explanation; distinct Cross laser and longer Nova warp (850 ms of grace time); risk-driven music that relaxes after recovery; major announcer calls retry one pending cue without overlapping speech or burning a cooldown on a busy lane. Existing photos, local storage identity and all seven approved voice recordings are retained. Settings now include a separate power-effect preview.

## 0.9.10 (19) · unobstructed play

Warnings, notifications and cheer text share a reserved 28 px status lane above the board. Score deltas stay in the score HUD. Idle power reminders pulse their inventory slot without repeating text. Repeated identical notices are rate limited; gameplay, audio and storage remain byte-identical to 0.9.9.

## Audio interruption recovery (0.9.12)

Backgrounding and audio interruptions pause gameplay and stop active voices. On the next foreground interaction, interrupted/closed or previously backgrounded WebAudio graphs are rebuilt. Preferences and decoded clip/impact buffers survive; pending decodes from old contexts cannot corrupt the replacement. iOS reactivates its ambient audio session on actual resume, retaining silent-switch behavior. Android restores its WebView on resume and reacquires normal game audio focus. Actual carrier-call/device listening remains a physical-device check; the simulator exercises native interruption/activation notifications and a real WKWebView graph. Debug-only simulator probes and emulator-only instrumentation do not ship in Release.
