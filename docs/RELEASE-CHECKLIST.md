# Real-device release checklist (hardening wave and beyond)

Chromium emulation cannot establish these — a human runs this list on
real hardware before declaring a wave-final release done.

## Devices & install
- [ ] **Every device trusts the mkcert CA** — installed AND enabled
      (iOS: Settings → General → About → Certificate Trust Settings).
      Without this a device silently cannot reach `/sync/` and cannot
      self-update; an installed PWA shows no certificate prompt. Verify
      per device by loading `https://compounded.lan` in Safari with no
      warning. (See deploy/README.md troubleshooting.)
- [ ] iPhone/iPad Safari: install to Home Screen; relaunch; profiles
      intact (IndexedDB survives); play one round per kid mode.
- [ ] Insecure-origin smoke: load `http://<server>:8091`, create a
      profile, play — no secure-context API errors.
- [ ] Lighthouse PWA audit passes on the deployed origin.

## Sync platform (post-cutover)
- [ ] `deploy/README.md` cutover done: sync-data tarball stored
      off-machine; every device ≥ the platform version; `SYNC_KEY`
      set; devices show 🔑 until the key is entered, then sync.
- [ ] `curl` without the key → 403 for listing, GET, PUT; with the
      key → 200.
- [ ] Two physical devices: play on A, check-in on B shows the
      progress; change a Grown-Ups setting on B, verify it survives a
      later save from A.
- [ ] Delete a (test) player on A while OFFLINE → reconnect → B's copy
      disappears; Grown-Ups → Deleted players → restore → back on both.
      Purge a test player → cannot restore, stale device cannot bring
      it back.
- [ ] http origin: first key entry shows the unencrypted-LAN
      acknowledgement; https://compounded.lan does not.

## Update pipeline
- [ ] Bump a version; devices pick it up within ~an hour (or on
      foreground) via the service worker; Grown-Ups footer confirms.
- [ ] Offline: airplane-mode a device, relaunch from Home Screen — the
      app loads and a round plays.

## Data safety drill (yearly or before risky changes)
- [ ] Restore the sync-data tarball to a scratch directory; run
      `node deploy/export-live.mjs <dir> /tmp/export`; confirm every
      live kid profile exports as valid JSON.
