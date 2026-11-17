#!/usr/bin/env bash
# scripts/build-macos-app.sh
# Synchronizes src/data/ -> curriculum.json, generates AppIcon.icns, compiles the
# release SwiftUI binary, signs dist-macos/LinguaVerve.app, and packages
# distribution .dmg, .zip, and SHA256SUMS.txt installers.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MACOS_DIR="${REPO_ROOT}/macos"
OUT_DIR="${REPO_ROOT}/dist-macos"
APP_NAME="LinguaVerve"
APP_BUNDLE="${OUT_DIR}/${APP_NAME}.app"
ICON_FILE="${MACOS_DIR}/AppIcon.icns"
ARCH="$(uname -m)"

FAST_MODE=false
for arg in "$@"; do
  case "$arg" in
    --fast)
      FAST_MODE=true
      ;;
  esac
done

if [ -n "${VERSION:-}" ]; then
  RAW_VERSION="${VERSION}"
elif command -v node >/dev/null 2>&1 && [ -f "${REPO_ROOT}/package.json" ]; then
  RAW_VERSION="$(node -p "require('${REPO_ROOT}/package.json').version" 2>/dev/null || echo "1.0.0")"
else
  RAW_VERSION="1.0.0"
fi
CLEAN_VERSION="${RAW_VERSION#v}"
CLEAN_VERSION="${CLEAN_VERSION#V}"

if [ -d "/Applications/Xcode.app/Contents/Developer" ]; then
  export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"
fi

echo "==> [1/5] Syncing web curriculum (src/data/) to macOS curriculum.json..."
node "${REPO_ROOT}/scripts/export-curriculum.mjs"

echo "==> [2/5] Generating official LinguaVerve AppIcon.icns..."
swift "${REPO_ROOT}/scripts/generate-macos-icon.swift" "${ICON_FILE}"

echo "==> [3/5] Building native macOS release binary (SwiftUI, v${CLEAN_VERSION})..."
cd "${MACOS_DIR}"
swift build -c release
BIN_PATH="$(swift build -c release --show-bin-path)"

echo "==> [4/5] Packaging & ad-hoc signing standalone macOS app bundle: ${APP_BUNDLE}..."
rm -rf "${APP_BUNDLE}"
mkdir -p "${APP_BUNDLE}/Contents/MacOS" "${APP_BUNDLE}/Contents/Resources"

cp "${BIN_PATH}/LinguaVerve" "${APP_BUNDLE}/Contents/MacOS/LinguaVerve"
chmod +x "${APP_BUNDLE}/Contents/MacOS/LinguaVerve"
cp "${ICON_FILE}" "${APP_BUNDLE}/Contents/Resources/AppIcon.icns"
cp "${MACOS_DIR}/Sources/LinguaVerveCore/Resources/curriculum.json" "${APP_BUNDLE}/Contents/Resources/curriculum.json"

# Copy SwiftPM resource bundle(s) into Contents/Resources
for bundle in "${BIN_PATH}"/*.bundle; do
  if [[ -d "${bundle}" ]]; then
    cp -R "${bundle}" "${APP_BUNDLE}/Contents/Resources/"
  fi
done

cat > "${APP_BUNDLE}/Contents/Info.plist" <<PLIST
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
    <string>${CLEAN_VERSION}</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>14.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
PLIST

printf "APPL????" > "${APP_BUNDLE}/Contents/PkgInfo"

# Strip quarantine attributes & apply ad-hoc code signature (no Apple Developer account required)
xattr -cr "${APP_BUNDLE}" 2>/dev/null || true
codesign --force --deep --sign - "${APP_BUNDLE}"
codesign --verify --deep --strict --verbose=2 "${APP_BUNDLE}"

# Touch bundle & register with LaunchServices so macOS Dock/Finder refresh the icon immediately
touch "${APP_BUNDLE}"
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "${APP_BUNDLE}" >/dev/null 2>&1 || true

if [ "${FAST_MODE}" = "false" ]; then
  echo "==> [5/5] Generating distribution installers (.dmg, .zip, SHA256SUMS.txt)..."
  ZIP_LATEST="${OUT_DIR}/${APP_NAME}.zip"
  ZIP_VERSIONED="${OUT_DIR}/${APP_NAME}-${CLEAN_VERSION}-macOS-${ARCH}.zip"
  DMG_LATEST="${OUT_DIR}/${APP_NAME}.dmg"
  DMG_VERSIONED="${OUT_DIR}/${APP_NAME}-${CLEAN_VERSION}-macOS-${ARCH}.dmg"
  DMG_STAGING="${OUT_DIR}/dmg-staging"

  rm -f "${ZIP_LATEST}" "${ZIP_VERSIONED}" "${DMG_LATEST}" "${DMG_VERSIONED}" "${OUT_DIR}/SHA256SUMS.txt"
  rm -rf "${DMG_STAGING}"

  ditto -c -k --sequesterRsrc --keepParent "${APP_BUNDLE}" "${ZIP_LATEST}"
  cp "${ZIP_LATEST}" "${ZIP_VERSIONED}"

  mkdir -p "${DMG_STAGING}"
  cp -R "${APP_BUNDLE}" "${DMG_STAGING}/${APP_NAME}.app"
  ln -s /Applications "${DMG_STAGING}/Applications"

  cat > "${DMG_STAGING}/Install LinguaVerve (No Apple Dev Account).command" <<'INSTALLER_EOF'
#!/usr/bin/env bash
set -euo pipefail
SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_SRC="${SRC_DIR}/LinguaVerve.app"
if [ -w "/Applications" ]; then
  DEST_DIR="/Applications"
else
  DEST_DIR="${HOME}/Applications"
  mkdir -p "${DEST_DIR}"
fi
DEST_APP="${DEST_DIR}/LinguaVerve.app"
echo "==> Installing LinguaVerve to ${DEST_APP}"
rm -rf "${DEST_APP}"
ditto "${APP_SRC}" "${DEST_APP}"
echo "==> Removing browser quarantine attribute & applying local ad-hoc signature"
xattr -cr "${DEST_APP}" 2>/dev/null || true
codesign --force --deep --sign - "${DEST_APP}" 2>/dev/null || true
echo "==> Installed! Launching LinguaVerve..."
open "${DEST_APP}"
INSTALLER_EOF
  chmod +x "${DMG_STAGING}/Install LinguaVerve (No Apple Dev Account).command"

  hdiutil create \
    -volname "LinguaVerve" \
    -srcfolder "${DMG_STAGING}" \
    -ov -format UDZO \
    "${DMG_LATEST}" >/dev/null

  cp "${DMG_LATEST}" "${DMG_VERSIONED}"
  rm -rf "${DMG_STAGING}"

  (
    cd "${OUT_DIR}"
    shasum -a 256 "${APP_NAME}.dmg" "${APP_NAME}.zip" "$(basename "${DMG_VERSIONED}")" "$(basename "${ZIP_VERSIONED}")" > SHA256SUMS.txt
  )

  echo "==> [ok] Native macOS App & Release Installers built in: ${OUT_DIR}"
  echo "    App Bundle : ${APP_BUNDLE}"
  echo "    DMG        : ${DMG_LATEST} (${DMG_VERSIONED})"
  echo "    ZIP        : ${ZIP_LATEST} (${ZIP_VERSIONED})"
  echo "    Checksums  : ${OUT_DIR}/SHA256SUMS.txt"
else
  echo "==> [5/5] Skipping .dmg/.zip generation (--fast mode active)"
  echo "==> [ok] Native macOS App built with official AppIcon at: ${APP_BUNDLE}"
fi
