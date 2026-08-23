#!/usr/bin/env bash
# Set up an isolated worktree for one coin-face specialist round.
#
# Two traps this exists to avoid:
#  1. The Agent tool's `isolation: "worktree"` checks out a STALE commit
#     (observed: be6cb73 / v1.54.0, 25 commits behind). Rounds must branch
#     from the commit the judge dispatched.
#  2. `coloringbook/ref/` and `node_modules/` are gitignored, so a fresh
#     worktree has neither — no references to measure and no toolchain.
#     Both are linked, not copied: ref/ is ~15 MB of third-party photographs
#     that must exist in exactly one place, and node_modules is 400 MB.
#
# Directories are symlinked; .mjs files are NEVER symlinked (a symlinked
# module resolves its relative imports against the MAIN checkout, silently
# measuring the wrong coins.js).
#
# usage: scripts/round-setup.sh <round-name> [base-commit]
set -euo pipefail
NAME="${1:?usage: round-setup.sh <round-name> [base-commit]}"
BASE="${2:-HEAD}"
ROOT="$(git -C "$(dirname "$0")/.." rev-parse --show-toplevel)"
DEST="$ROOT/.claude/worktrees/round-$NAME"

[ -e "$DEST" ] && { echo "already exists: $DEST" >&2; exit 1; }
git -C "$ROOT" worktree add -b "round-$NAME" "$DEST" "$BASE" >/dev/null
ln -s "$ROOT/node_modules" "$DEST/node_modules"
mkdir -p "$DEST/coloringbook"
ln -s "$ROOT/coloringbook/ref" "$DEST/coloringbook/ref"

echo "$DEST"
echo "base $(git -C "$DEST" rev-parse --short HEAD)  refs $(ls "$DEST/coloringbook/ref" | wc -l)"
