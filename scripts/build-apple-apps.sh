#!/usr/bin/env bash
# scripts/build-apple-apps.sh
# Builds and verifies the Universal Apple Multiplatform App (iPhone, iPad, MacBook):
# 1. Syncs web src/data/ -> curriculum.json
# 2. Generates official AppIcon (.icns + 1024x1024 universal PNG)
# 3. Generates apple/LinguaVerve.xcodeproj via xcodegen
# 4. Runs full Swift XCTest suite (LinguaVerveCore)
# 5. Compiles native iOS/iPadOS Simulator & macOS targets via xcodebuild

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -d "/Applications/Xcode.app/Contents/Developer" ]; then
  export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"
fi

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
  -scheme LinguaVerve \
  -sdk iphonesimulator \
  -destination "generic/platform=iOS Simulator" \
  -configuration Debug \
  CODE_SIGNING_ALLOWED=NO \
  -quiet \
  build

echo "==> [6/6] Compiling Universal macOS target via xcodebuild..."
xcodebuild \
  -project LinguaVerve.xcodeproj \
  -scheme LinguaVerve \
  -sdk macosx \
  -destination "generic/platform=macOS" \
  -configuration Debug \
  CODE_SIGNING_ALLOWED=NO \
  -quiet \
  build

echo "==> [ok] Universal Native Apple App verified for MacBook (macOS), iPad (iPadOS), and iPhone (iOS)!"
echo "    Open in Xcode: open ${REPO_ROOT}/apple/LinguaVerve.xcodeproj"
