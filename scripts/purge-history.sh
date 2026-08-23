#!/usr/bin/env bash
# ONE-OFF: purge private data from ALL of this repository's history.
#
# Authorised by the owner 2026-08-23: "Purge the history. Breaking clones is
# fine." Read this file before running it. It rewrites every commit.
#
# WHAT IS BEING REMOVED, and how each got in:
#
#  1. .claude/settings.local.json.tmp.<pid>.<hash> — a stray Claude settings
#     temp file committed 2026-07-12 and deleted a commit later. 100 permission
#     rules carrying the home server's RFC1918 address and the username. Public
#     for ~6 weeks. No credentials, no kid names.
#
#  2. A `node_modules` SYMLINK blob whose target is an absolute home path,
#     added in the instrument-retirement commit and deleted in the next one.
#     This one is the instructive failure: `grep -r` will not read a symlink
#     and `git grep` skips them, so the tree scan never saw it; and the push
#     gate compared only the NET diff, in which a file added and removed inside
#     the range does not appear at all. It went public in the 2026-08-23 push.
#
#  3. A private term as a WHOLE WORD in historical BACKLOG.md text.
#
#  4. Text in tracked files and commit messages that CHARACTERISES a private
#     term — its length, its occurrence count, the word family containing it.
#     The secret itself was never committed; this description was precise
#     enough to enumerate candidates from a public checkout and confirm one by
#     hit count, which is nearly as good.
#
# WHAT THIS CANNOT DO. It cannot recall what has already been cloned. GitHub
# reports 0 forks, which is what makes the purge worth doing at all, but
# unreachable objects can remain fetchable by SHA on the remote until GitHub
# garbage-collects; ask GitHub Support to run GC on the repo if that matters.
# Traffic data only covers 14 days, so the earlier exposure is unmeasurable.
#
# usage: scripts/purge-history.sh check     # report only, changes nothing
#        scripts/purge-history.sh purge     # rewrite local history
#        scripts/purge-history.sh publish   # force-push + drop backups
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

MODE="${1:-check}"
TERMS_FILE="$HOME/.config/compounded/private-terms"
STRAY='.claude/settings.local.json.tmp.1811386.6829d06a5907'
[ -f "$TERMS_FILE" ] || { echo "no private-terms file; refusing to run blind." >&2; exit 1; }

# Terms are read into a temp file the filter can see. Never printed.
TMPT=$(mktemp); trap 'rm -f "$TMPT"' EXIT
cut -d'|' -f1 < "$TERMS_FILE" | sed '/^[[:space:]]*$/d' > "$TMPT"

# SCOPE IS `main`, NOT `--all`. The `local-history` branch predates publication
# and is SUPPOSED to contain private network details; it is never pushed, and
# rewriting it would destroy an archive the owner keeps deliberately. Only what
# can reach the public remote is purged. `git rev-list main` is therefore the
# universe for both the scan and the rewrite.
scan() { # report which commits still carry something, by CATEGORY only
  local bad=0 n
  n=$(git rev-list main --objects | awk '{print $2}' | grep -cxF "$STRAY" || true)
  [ "$n" -gt 0 ] && { echo "  stray settings temp file: present"; bad=1; }
  n=$(git rev-list main | while read -r c; do
        git ls-tree -r "$c" 2>/dev/null | awk '$1=="120000"{print $3}'
      done | sort -u | while read -r s; do git cat-file blob "$s"; done | grep -c '^/' || true)
  [ "${n:-0}" -gt 0 ] && { echo "  absolute symlink targets in history: $n"; bad=1; }
  # NEVER `| grep -q` HERE. Under `set -o pipefail`, grep -q exits on its first
  # match, the upstream writer takes SIGPIPE, and the pipeline reports non-zero
  # — which reads as "no match" and makes this verifier claim CLEAN while the
  # data is still there. That is not hypothetical: this function did exactly
  # that on its first run, reporting no term hits while 7 blobs carried one.
  # It is the same defect that was just fixed in .githooks/pre-push. `grep -c`
  # drains its input, so there is no SIGPIPE and the count is trustworthy.
  local i=0 hits
  while IFS= read -r t; do
    i=$((i+1)); [ -z "$t" ] && continue
    hits=$(git rev-list main --objects | awk '{print $1}' | while read -r sha; do
             [ "$(git cat-file -t "$sha" 2>/dev/null)" = blob ] && git cat-file blob "$sha" 2>/dev/null
           done | grep -icwF -- "$t" || true)
    if [ "${hits:-0}" -gt 0 ]; then
      echo "  term #$i: still present as a whole word in $hits blob(s)"; bad=1
    fi
  done < "$TMPT"
  [ "$bad" = 0 ] && echo "  clean"
  return 0
}

if [ "$MODE" = check ]; then
  echo "BEFORE:"; scan; exit 0
fi

if [ "$MODE" = purge ]; then
  git tag -f "purge-backup-$(date +%s)" HEAD >/dev/null
  export PURGE_TERMS="$TMPT" PURGE_STRAY="$STRAY"

  FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f --prune-empty \
    --tree-filter '
      rm -f "$PURGE_STRAY"
      # a symlink whose target is absolute is unreadable to text scans
      find . -type l | while IFS= read -r l; do
        case "$(readlink "$l")" in /*) rm -f "$l";; esac
      done
      while IFS= read -r t; do
        [ -z "$t" ] && continue
        grep -rlI --binary-files=without-match -i -e "$t" . 2>/dev/null \
          | while IFS= read -r f; do sed -i -E "s/\b${t}\b/REDACTED/gI" "$f"; done
      done < "$PURGE_TERMS"
      true
    ' \
    --msg-filter '
      body=$(cat)
      while IFS= read -r t; do
        [ -z "$t" ] && continue
        body=$(printf "%s" "$body" | sed -E "s/\b${t}\b/REDACTED/gI")
      done < "$PURGE_TERMS"
      # Strip sentences that characterise a term without naming it. The
      # patterns use character classes rather than spelling the phrases out --
      # a script that quotes the sentence it removes reintroduces exactly the
      # description it exists to delete, and tests/privacy.spec.js catches that.
      printf "%s" "$body" | sed -E \
        -e "s/[Oo]ne (private )?term is [a-z0-9]+[- ]char[a-z]*( long)?[^.]*\./A term needed different matching./g" \
        -e "s/[0-9]+ occurrence[a-z]* across [0-9]+ file[a-z]*[^.]*\./(details omitted)./g" \
        -e "s/private-term[s]?-allow/the private terms file/g"
    ' \
    -- main 2>&1 | tail -2

  echo "AFTER:"; scan
  echo
  echo "Local history rewritten. Nothing has been published yet."
  echo "Review, then: scripts/purge-history.sh publish"
  exit 0
fi

if [ "$MODE" = publish ]; then
  echo "verifying before publishing…"; scan
  git push --force origin main
  # The backups hold the pre-purge objects; keeping them would resurrect the
  # leak on any later --tags push and keeps the blobs alive locally.
  git tag | grep -E '^(purge-backup|backup-pre)' | xargs -r git tag -d
  git reflog expire --expire=now --all
  git gc --prune=now --aggressive --quiet
  echo "published and local backups dropped."
  echo "NOTE: ask GitHub Support to garbage-collect the remote — unreachable"
  echo "objects can stay fetchable by SHA until they do."
  exit 0
fi

echo "usage: scripts/purge-history.sh [check|purge|publish]" >&2
exit 2
