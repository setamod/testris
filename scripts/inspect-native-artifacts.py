"""Inspect actual unsigned AAB and iOS archive; never signs or uploads anything.

Uses the installed Android Gradle dependency cache for bundletool. Run after native
builds, before `npm run verify:publication`. Evidence stays in ignored directories.
"""
import hashlib
import json
import os
import plistlib
from pathlib import Path
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / "publication"
EVIDENCE = PUB / "evidence"
EVIDENCE.mkdir(parents=True, exist_ok=True)
VERSION = json.loads((ROOT / "package.json").read_text())["version"]
LEGAL = ["chakrapetch-OFL.txt", "ibmplexmono-OFL.txt", "pico-MIT.txt",
         "music-NOTICE.txt", "SOURCES.md", "ASSET-INVENTORY.json"]


def sha(data):
    return hashlib.sha256(data).hexdigest()


def write_json(name, value):
    (EVIDENCE / name).write_text(json.dumps(value, indent=2) + "\n")


aab = ROOT / "android/app/build/outputs/bundle/release/app-release.aab"
apk = ROOT / "android/app/build/outputs/apk/debug/app-debug.apk"
game = (ROOT / "android/app/src/main/assets/game/index.html").read_bytes()
with zipfile.ZipFile(aab) as bundle:
    files = bundle.namelist()
    assert bundle.read("base/assets/game/index.html") == game
    legal_matches = []
    for name in LEGAL:
        assert bundle.read("base/assets/legal/" + name) == (ROOT / "vendor" / name).read_bytes()
        legal_matches.append(name)
    assert not any(name.endswith((".storekit", ".jks", ".keystore", ".p12", ".mobileprovision")) for name in files)
    assert not any("androidTest" in name or "PremiumStoreTests" in name for name in files)
    for name in files:
        if name.startswith("base/dex/") and name.endswith(".dex"):
            dex = bundle.read(name)
            assert b"Lcom/mertbekisoglu/bulusko/AdMobSDKProbe;" not in dex
            assert b"Lcom/mertbekisoglu/bulusko/SmokeInstrumentation;" not in dex
    signed = any(name.upper().startswith("META-INF/") and name.upper().endswith((".RSA", ".DSA", ".EC")) for name in files)
    assert not signed, "This preparation artifact must remain unsigned"
    write_json("android-package-contents.json", {
        "version": VERSION, "aab_sha256": sha(aab.read_bytes()), "bytes": aab.stat().st_size,
        "game_matches_current_source": True, "game_sha256": sha(game),
        "legal_files_match": legal_matches, "signed": signed,
        "assets": [name for name in files if name.startswith("base/assets/")],
        "no_test_catalog_or_signing_files": True,
        "native_sdks": ["Google Mobile Ads 25.5.0", "UMP 4.0.0", "Play Billing 9.1.0"],
    })

cache = ROOT / ".tooling/gradle-home/caches/modules-2/files-2.1"
# Several Gradle versions may share this cache. Prefer the newest version of
# each module so an old Guava does not shadow bundletool's Java 8 APIs.
import re
modules = {}
for candidate in cache.rglob("*.jar"):
    relative = candidate.relative_to(cache)
    module = relative.parts[:2]
    version = tuple(int(v) for v in re.findall(r"[0-9]+", relative.parts[2]))
    if module not in modules or version > modules[module][0]:
        modules[module] = (version, candidate)
jars = [value[1] for value in sorted(modules.values(), key=lambda item: str(item[1]))]
assert any("bundletool-1.18.3.jar" == p.name for p in jars)
javas = list((ROOT / ".tooling/jdk").glob("jdk-17*/Contents/Home/bin/java"))
assert javas
base = [str(javas[0]), "-cp", os.pathsep.join(str(p) for p in jars),
        "com.android.tools.build.bundletool.BundleToolMain", "dump"]
def dump(kind):
    result = subprocess.run(base + [kind, "--bundle=" + str(aab)], text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError("bundletool " + kind + ": " + result.stderr[-2000:])
    return result.stdout

manifest = dump("manifest")
(EVIDENCE / "android-release-manifest.xml").write_text(manifest)
bundle_config = dump("config")
write_json("android-bundle-config.json", json.loads(bundle_config))

archive = PUB / "artifacts" / f"Popzuno-{VERSION}-unsigned.xcarchive" / "Products/Applications/Bulusko.app"
assert (archive / "Game/index.html").read_bytes() == (ROOT / "ios/Bulusko/Resources/Game/index.html").read_bytes()
for name in LEGAL:
    assert (archive / "Legal" / name).read_bytes() == (ROOT / "vendor" / name).read_bytes()
assert not list(archive.rglob("*.storekit")) and not list(archive.rglob("*.xctest"))
assert not (archive / "embedded.mobileprovision").exists()
with (archive / "Info.plist").open("rb") as stream:
    info = plistlib.load(stream)
assert info["CFBundleShortVersionString"] == VERSION
assert info["GADApplicationIdentifier"] == "ca-app-pub-0000000000000000~0000000000"
assert "NSUserTrackingUsageDescription" not in info
write_json("native-artifacts.json", {
    "version": VERSION, "build": info["CFBundleVersion"],
    "ios_unsigned_archive_game_matches_source": True,
    "ios_no_test_catalog_or_provisioning_profile": True,
    "ios_no_tracking_permission": True,
    "android_debug_apk_sha256": sha(apk.read_bytes()),
    "android_unsigned_aab_sha256": sha(aab.read_bytes()),
    "android_unsigned_aab_bytes": aab.stat().st_size,
    "release_commerce": "disabled; no production IDs, products or store publication",
})
print(json.dumps({"inspection": "passed", "version": VERSION, "legal_files": len(LEGAL)}))
