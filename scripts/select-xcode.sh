#!/usr/bin/env bash
# scripts/select-xcode.sh
# Selects the best installed Xcode toolchain (Bash 3.2 compatible) and exports DEVELOPER_DIR
# when DEVELOPER_DIR is not already set.
#
# Usage:
#   source scripts/select-xcode.sh
#   select_best_xcode [--require-ios-simulator]
# Or run directly:
#   bash scripts/select-xcode.sh [--require-ios-simulator]

_lv_read_plist_value() {
  local plist_path="$1"
  local key="$2"
  if [ -f "${plist_path}" ] && [ -x /usr/libexec/PlistBuddy ]; then
    /usr/libexec/PlistBuddy -c "Print :${key}" "${plist_path}" 2>/dev/null || true
  fi
}

_lv_ver_pad() {
  local ver="${1:-0}"
  local maj="0" min="0" pat="0"
  local IFS='.'
  set -- ${ver}
  maj="${1:-0}"
  min="${2:-0}"
  pat="${3:-0}"
  case "${maj}" in ''|*[!0-9]*) maj=0 ;; esac
  case "${min}" in ''|*[!0-9]*) min=0 ;; esac
  case "${pat}" in ''|*[!0-9]*) pat=0 ;; esac
  printf '%04d%04d%04d' "$((10#${maj}))" "$((10#${min}))" "$((10#${pat}))"
}

_lv_major_minor() {
  local ver="${1:-}"
  local maj="" min=""
  local IFS='.'
  set -- ${ver}
  maj="${1:-}"
  min="${2:-0}"
  case "${maj}" in ''|*[!0-9]*) return 0 ;; esac
  case "${min}" in ''|*[!0-9]*) min=0 ;; esac
  printf '%d.%d\n' "$((10#${maj}))" "$((10#${min}))"
}

_lv_parse_sim_runtimes() {
  sed -n 's/^[[:space:]]*iOS[[:space:]][[:space:]]*\([0-9][0-9]*\.[0-9][0-9]*\).*/\1/p' | sort -u
}

_lv_list_ios_sim_runtimes() {
  local fallback_dev_dir="${1:-}"
  if [ -n "${AVAILABLE_IOS_SIM_RUNTIMES+x}" ]; then
    printf '%s\n' "${AVAILABLE_IOS_SIM_RUNTIMES}" | sed '/^[[:space:]]*$/d'
    return 0
  fi

  local parsed=""
  parsed="$(xcrun simctl list runtimes available 2>/dev/null | _lv_parse_sim_runtimes || true)"
  if [ -z "${parsed}" ] && [ -n "${fallback_dev_dir}" ]; then
    parsed="$(DEVELOPER_DIR="${fallback_dev_dir}" xcrun simctl list runtimes available 2>/dev/null | _lv_parse_sim_runtimes || true)"
  fi
  printf '%s\n' "${parsed}" | sed '/^[[:space:]]*$/d'
}

select_best_xcode() {
  if [ -n "${DEVELOPER_DIR:-}" ]; then
    return 0
  fi

  local require_ios_sim="false"
  local arg
  for arg in "$@"; do
    case "${arg}" in
      --require-ios-simulator)
        require_ios_sim="true"
        ;;
    esac
  done

  local search_dir="${XCODE_SEARCH_DIR:-/Applications}"
  local seen_paths=""
  local nl=$'\n'
  local runtimes_loaded="false"
  local runtimes=""
  local best_score=""
  local best_xcode_dev=""

  local xapp
  for xapp in "${search_dir}"/Xcode*.app; do
    [ -d "${xapp}/Contents/Developer" ] || continue

    local real_xapp=""
    real_xapp="$(cd "${xapp}" 2>/dev/null && pwd -P)" || continue

    case "${nl}${seen_paths}${nl}" in
      *"${nl}${real_xapp}${nl}"*) continue ;;
    esac
    seen_paths="${seen_paths}${nl}${real_xapp}"

    local dev_dir="${real_xapp}/Contents/Developer"
    if [ "${require_ios_sim}" = "true" ] && [ "${runtimes_loaded}" = "false" ]; then
      runtimes="$(_lv_list_ios_sim_runtimes "${dev_dir}")"
      runtimes_loaded="true"
    fi

    local macos_sdk_plist="${dev_dir}/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/SDKSettings.plist"
    local macos_sdk_ver=""
    macos_sdk_ver="$(_lv_read_plist_value "${macos_sdk_plist}" "Version")"
    if [ -z "${macos_sdk_ver}" ]; then
      macos_sdk_ver="$(DEVELOPER_DIR="${dev_dir}" xcrun --sdk macosx --show-sdk-version 2>/dev/null || echo "0")"
    fi

    local xcode_ver=""
    xcode_ver="$(_lv_read_plist_value "${real_xapp}/Contents/Info.plist" "CFBundleShortVersionString")"
    if [ -z "${xcode_ver}" ]; then
      xcode_ver="0"
    fi

    local has_ios_sdk="0"
    local sim_match="0"
    if [ "${require_ios_sim}" = "true" ]; then
      local ios_dev_sdk_ver=""
      local ios_sim_sdk_ver=""
      ios_dev_sdk_ver="$(_lv_read_plist_value "${dev_dir}/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS.sdk/SDKSettings.plist" "Version")"
      ios_sim_sdk_ver="$(_lv_read_plist_value "${dev_dir}/Platforms/iPhoneSimulator.platform/Developer/SDKs/iPhoneSimulator.sdk/SDKSettings.plist" "Version")"
      if [ -n "${ios_dev_sdk_ver}" ] && [ -n "${ios_sim_sdk_ver}" ]; then
        has_ios_sdk="1"
        if [ -n "${runtimes}" ]; then
          local ios_sim_mm=""
          ios_sim_mm="$(_lv_major_minor "${ios_sim_sdk_ver}")"
          if [ -n "${ios_sim_mm}" ] && printf '%s\n' "${runtimes}" | grep -Fxq "${ios_sim_mm}"; then
            sim_match="1"
          fi
        fi
      fi
    fi

    local score="${sim_match}${has_ios_sdk}$(_lv_ver_pad "${macos_sdk_ver}")$(_lv_ver_pad "${xcode_ver}")"
    if [ -z "${best_score}" ] || [[ "${score}" > "${best_score}" ]]; then
      best_score="${score}"
      best_xcode_dev="${dev_dir}"
    fi
  done

  if [ -n "${best_xcode_dev}" ]; then
    export DEVELOPER_DIR="${best_xcode_dev}"
  fi
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  set -euo pipefail
  select_best_xcode "$@"
  printf '%s\n' "${DEVELOPER_DIR:-}"
fi
