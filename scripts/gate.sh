#!/usr/bin/env bash
# The ship gate. Exists because "npm test | tail -1" once printed
# "325 passed" while a "4 failed" line sat directly above it, and v1.49.0
# shipped with four red tests. Never judge a run by its last line: this
# checks the EXIT CODE, then refuses if any failure marker is present.
set -uo pipefail
LOG="${1:-/tmp/compounded-gate.log}"

run() {
  local name="$1"; shift
  echo "── $name ──"
  "$@" > "$LOG.$name" 2>&1
  local code=$?
  local failed
  failed=$(grep -cE '^  ✘|^  [0-9]+ failed' "$LOG.$name" || true)
  grep -E "^  [0-9]+ (passed|failed)" "$LOG.$name" || true
  if [ "$code" -ne 0 ] || [ "$failed" -ne 0 ]; then
    echo "RED: $name (exit $code, $failed failure markers)"
    grep -E '^  ✘' "$LOG.$name" | head -20
    return 1
  fi
  echo "green: $name"
}

run build npm run build || exit 1
run insecure npm test || exit 1
run secure env TEST_HOST=127.0.0.1 ONLY_SECURE=1 npx playwright test || exit 1
echo "ALL GREEN"
