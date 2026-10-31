"""Create a local review bundle from an explicit source/artifact allowlist."""
from pathlib import Path
import hashlib
import json
import zipfile

root = Path(__file__).resolve().parents[1]
version = json.loads((root / "package.json").read_text())["version"]
target = root.parent / "releases" / ("Popzuno-Store-Preparation-" + version + ".zip")
target.parent.mkdir(parents=True, exist_ok=True)
files = set()


def include(path):
    path = root / path
    for item in ([path] if path.is_file() else path.rglob("*")):
        if not item.is_file():
            continue
        relative = item.relative_to(root)
        if any(part in {".git", ".tooling", "private", "node_modules", "xcuserdata", "build", "build-device", "build-store-simulator", "build-store-archive", "__pycache__"} for part in relative.parts):
            continue
        if item.name == ".DS_Store" or item.suffix.lower() in {".keystore", ".jks", ".p12", ".mobileprovision", ".pem", ".key"}:
            continue
        files.add(relative)


for name in [
    "README.md", "STORE-READINESS.md", "VALIDATION.json", "package.json", ".gitignore",
    "dist", "vendor", "scripts", "tests", "branding",
    "ios/Bulusko", "ios/Bulusko.xcodeproj", "ios/BUILD_STATUS.json", "ios/README-TR.md",
    "android/app/src", "android/app/build.gradle", "android/build.gradle",
    "android/settings.gradle", "android/gradle.properties", "android/gradle", "android/gradlew",
    "android/gradlew.bat", "android/README-TR.md",
    "publication/README-TR.md", "publication/OWNER-STEPS-TR.md",
    "publication/release-config.json", "publication/VALIDATION.json",
    "publication/PACKAGE-CHECKS.json", "publication/SITE-PUBLICATION.json",
    "publication/ACCOUNT-STATUS.json", "publication/TESTFLIGHT-STATUS.json",
    "publication/legal", "publication/store", "publication/site/dist", "publication/testing",
]:
    include(name)

# Keep earlier candidates locally, but export only this version's binaries.
for item in (root / "publication/artifacts").iterdir():
    if item.name.startswith("Popzuno-" + version + "-") or item.name == "SHA256SUMS.txt":
        include(item.relative_to(root))

for name in (root / "publication/evidence").iterdir():
    if name.name.startswith(("wipo", "turkpatent", "privacy")) or name.name in {
        "android-smoke.txt", "android-release-manifest.xml", "ios-audio-recovery.json", "android-audio-recovery.json", "android-portrait-check.json", "character-restore-check.json", "subtle-face-check.json", "face-alignment-check.json", "ios-native-alignment.json", "swift-storage-0.9.17.txt", "release-scope-0.9.12.json", "owner-audio-return-0.9.12.json", "testflight-0.9.12-waiting-review.png",
        "android-bundle-config.json", "android-package-contents.json",
        "javascript-tests.txt", "original-game-check.json", "announcer-speech-check.json", "android-layout-fit.json", "ios-fit-air-tr.png",
        "stage-clear-tr.jpg",
        "overflow-tr.jpg", "audio-settings-tr.jpg",
        "main-menu-tr.jpg", "popzuno-ios-gameplay-tr.png", "popzuno-support-live.png", "popzuno-brand-check.json", "arcade-refresh-validation.json", "popzuno-099-ios-gameplay-tr.png", "popzuno-099-ios-ending-tr.png", "popzuno-099-phone-preview.png", "status-lane-validation.json", "popzuno-0910-status-clear-tr.png", "popzuno-0910-status-preview.png",
    }:
        include(name.relative_to(root))

with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as bundle:
    for relative in sorted(files):
        bundle.write(root / relative, "Popzuno-" + version + "/" + relative.as_posix())
with zipfile.ZipFile(target) as bundle:
    assert bundle.testzip() is None
    names = bundle.namelist()
    assert not any("/private/" in name or "/.git/" in name or "/.tooling/" in name for name in names)
result = {
    "file": str(target), "files": len(files), "bytes": target.stat().st_size,
    "sha256": hashlib.sha256(target.read_bytes()).hexdigest(),
    "store_submitted": False,
}
target.with_suffix(".zip.sha256").write_text(result["sha256"] + "  " + target.name + "\n")
print(json.dumps(result, indent=2))
