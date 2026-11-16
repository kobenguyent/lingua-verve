#!/usr/bin/env bash
# scripts/build-macos-app.sh
# Synchronizes src/data/ -> curriculum.json, generates AppIcon.icns, compiles the
# release SwiftUI binary, and packages dist-macos/LinguaVerve.app.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MACOS_DIR="${REPO_ROOT}/macos"
OUT_DIR="${REPO_ROOT}/dist-macos"
APP_BUNDLE="${OUT_DIR}/LinguaVerve.app"
ICON_FILE="${MACOS_DIR}/AppIcon.icns"

echo "==> [1/4] Syncing web curriculum (src/data/) to macOS curriculum.json..."
node "${REPO_ROOT}/scripts/export-curriculum.mjs"

echo "==> [2/4] Generating official LinguaVerve AppIcon.icns..."
swift "${REPO_ROOT}/scripts/generate-macos-icon.swift" "${ICON_FILE}"

echo "==> [3/4] Building native macOS release binary (SwiftUI)..."
cd "${MACOS_DIR}"
swift build -c release
BIN_PATH="$(swift build -c release --show-bin-path)"

echo "==> [4/4] Packaging standalone macOS app bundle: ${APP_BUNDLE}..."
rm -rf "${APP_BUNDLE}"
mkdir -p "${APP_BUNDLE}/Contents/MacOS" "${APP_BUNDLE}/Contents/Resources"

cp "${BIN_PATH}/LinguaVerve" "${APP_BUNDLE}/Contents/MacOS/LinguaVerve"
chmod +x "${APP_BUNDLE}/Contents/MacOS/LinguaVerve"
cp "${ICON_FILE}" "${APP_BUNDLE}/Contents/Resources/AppIcon.icns"

# Copy SwiftPM resource bundle(s) into Contents/Resources and root bundle path
for bundle in "${BIN_PATH}"/*.bundle; do
  if [[ -d "${bundle}" ]]; then
    cp -R "${bundle}" "${APP_BUNDLE}/Contents/Resources/"
    cp -R "${bundle}" "${APP_BUNDLE}/"
  fi
done

cat > "${APP_BUNDLE}/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>LinguaVerve</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>com.linguaverve.macos</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>LinguaVerve</string>
    <key>CFBundleDisplayName</key>
    <string>LinguaVerve</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>14.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
PLIST

# Touch bundle & register with LaunchServices so macOS Dock/Finder refresh the icon immediately
touch "${APP_BUNDLE}"
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "${APP_BUNDLE}" >/dev/null 2>&1 || true

echo "==> [ok] Native macOS App built with official AppIcon at: ${APP_BUNDLE}"
echo "    Launch with: open \"${APP_BUNDLE}\""
