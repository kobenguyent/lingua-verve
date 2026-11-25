#!/usr/bin/env bash
# scripts/launch-macos-app.sh
# Cleanly stops any running LinguaVerve instance, waits for LaunchServices to
# clear the old PID (avoiding error -600 procNotFound), refreshes bundle registration,
# and launches dist-macos/LinguaVerve.app.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_BUNDLE="${REPO_ROOT}/dist-macos/LinguaVerve.app"

if [ ! -d "${APP_BUNDLE}" ]; then
  echo "Error: ${APP_BUNDLE} not found. Run 'npm run macos:app' first." >&2
  exit 1
fi

if pgrep -x LinguaVerve >/dev/null 2>&1; then
  killall LinguaVerve 2>/dev/null || true
  for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
    pgrep -x LinguaVerve >/dev/null 2>&1 || break
    sleep 0.2
  done
  if pgrep -x LinguaVerve >/dev/null 2>&1; then
    killall -9 LinguaVerve 2>/dev/null || true
    sleep 0.3
  fi
fi

/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "${APP_BUNDLE}" >/dev/null 2>&1 || true

if ! open -n "${APP_BUNDLE}" 2>/dev/null; then
  sleep 0.5
  open -n "${APP_BUNDLE}"
fi
