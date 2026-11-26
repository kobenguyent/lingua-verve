#!/usr/bin/env bash
# scripts/build-apple-apps.sh
# Builds and verifies the Universal Apple Multiplatform App (iPhone, iPad, MacBook):
# 1. Syncs web src/data/ -> curriculum.json
# 2. Generates official AppIcon (.icns + 1024x1024 universal PNG)
# 3. Generates apple/LinguaVerve.xcodeproj via xcodegen
# 4. Runs full Swift XCTest suite (LinguaVerveCore)
# 5. Compiles native iOS/iPadOS Simulator & macOS targets via xcodebuild
# 6. Optional (--package-ipa): Packages unsigned iPhone/iPad .ipa into dist-macos/

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${REPO_ROOT}/dist-macos"

PACKAGE_IPA=false
for arg in "$@"; do
  case "$arg" in
    --package-ipa)
      PACKAGE_IPA=true
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

# shellcheck source=scripts/select-xcode.sh
source "${REPO_ROOT}/scripts/select-xcode.sh"
select_best_xcode --require-ios-simulator
echo "==> Using Xcode DEVELOPER_DIR=${DEVELOPER_DIR:-$(xcode-select -p)} (macOS SDK $(xcrun --show-sdk-version 2>/dev/null || echo unknown))"

echo "==> [1/6] Syncing web curriculum (src/data/) -> curriculum.json..."
node "${REPO_ROOT}/scripts/export-curriculum.mjs"

echo "==> [2/6] Generating Universal AppIcon (.icns + 1024x1024 PNG)..."
mkdir -p "${REPO_ROOT}/apple/Resources/Assets.xcassets/AppIcon.appiconset"
swift "${REPO_ROOT}/scripts/generate-macos-icon.swift" \
  "${REPO_ROOT}/macos/AppIcon.icns" \
  "${REPO_ROOT}/apple/Resources/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png"

echo "==> [3/6] Generating Universal Xcode project (iPhone, iPad, MacBook) via xcodegen..."
cd "${REPO_ROOT}/apple"
xcodegen generate

echo "==> [4/6] Running Swift XCTest suite (LinguaVerveCore)..."
cd "${REPO_ROOT}/macos"
swift test

echo "==> [5/6] Compiling Universal iOS / iPadOS Simulator build via xcodebuild..."
cd "${REPO_ROOT}/apple"
xcodebuild \
  -project LinguaVerve.xcodeproj \
  -scheme LinguaVerveApp \
  -sdk iphonesimulator \
  -destination "generic/platform=iOS Simulator" \
  -configuration Debug \
  MARKETING_VERSION="${CLEAN_VERSION}" \
  CODE_SIGNING_ALLOWED=NO \
  -quiet \
  build

echo "==> [6/6] Compiling Universal macOS target via xcodebuild..."
xcodebuild \
  -project LinguaVerve.xcodeproj \
  -scheme LinguaVerveApp \
  -sdk macosx \
  -destination "generic/platform=macOS" \
  -configuration Debug \
  MARKETING_VERSION="${CLEAN_VERSION}" \
  CODE_SIGNING_ALLOWED=NO \
  -quiet \
  build

if [ "${PACKAGE_IPA}" = "true" ]; then
  echo "==> [+] Packaging unsigned iPhone & iPad .ipa (v${CLEAN_VERSION})..."
  mkdir -p "${OUT_DIR}"
  IOS_STAGE="${OUT_DIR}/ios-ipa-staging"
  IOS_BUILD_DIR="${IOS_STAGE}/build"
  rm -rf "${IOS_STAGE}"
  mkdir -p "${IOS_STAGE}/Payload"

  xcodebuild \
    -project LinguaVerve.xcodeproj \
    -scheme LinguaVerveApp \
    -sdk iphoneos \
    -destination "generic/platform=iOS" \
    -configuration Release \
    -derivedDataPath "${IOS_BUILD_DIR}" \
    MARKETING_VERSION="${CLEAN_VERSION}" \
    CODE_SIGNING_ALLOWED=NO \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGN_IDENTITY="" \
    -quiet \
    build

  IOS_APP_PATH="${IOS_BUILD_DIR}/Build/Products/Release-iphoneos/LinguaVerve.app"
  if [ ! -d "${IOS_APP_PATH}" ]; then
    IOS_APP_PATH="$(find "${IOS_BUILD_DIR}" -maxdepth 5 -name "LinguaVerve.app" -type d | head -n 1)"
  fi
  cp -R "${IOS_APP_PATH}" "${IOS_STAGE}/Payload/LinguaVerve.app"

  IPA_LATEST="${OUT_DIR}/LinguaVerve-iOS-iPadOS-unsigned.ipa"
  IPA_VERSIONED="${OUT_DIR}/LinguaVerve-${CLEAN_VERSION}-iOS-iPadOS-unsigned.ipa"
  rm -f "${OUT_DIR}/LinguaVerve"*.ipa
  (
    cd "${IOS_STAGE}"
    zip -qry "${IPA_LATEST}" Payload
  )
  cp "${IPA_LATEST}" "${IPA_VERSIONED}"
  rm -rf "${IOS_STAGE}"

  echo "    iOS/iPadOS IPA: ${IPA_LATEST} (${IPA_VERSIONED})"
fi

echo "==> [ok] Universal Native Apple App verified for MacBook (macOS), iPad (iPadOS), and iPhone (iOS)!"
echo "    Open in Xcode: open ${REPO_ROOT}/apple/LinguaVerve.xcodeproj"
