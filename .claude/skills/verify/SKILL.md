---
name: verify
description: Build, launch, and drive the Compounded PWA end-to-end in headless Chromium to verify changes against the real UI.
---

# Verifying Compounded

## First: run the suite

`npm test` builds and runs the in-repo Playwright suite (tests/) against a
hermetic server (tests/server.mjs — serves dist/ and fakes /sync/ in memory,
on the LAN IP so the origin is insecure like the real deployment). It covers
the kid flow, schema-migration preservation, pet play/group/sitting, family
backup sync, and touch feedback. Green suite + a manual pass over whatever
the change touched is the normal bar. Add a test when a change adds a flow.

## Build & launch (manual checks beyond the suite)

```bash
npm run build
npm run preview -- --port 4173 --strictPort   # serves dist/ with the service worker
```

Dev server (`npm run dev`) works for quick looks but does NOT register the
production service worker — offline checks must use build+preview.

## Drive it (headless Chromium via playwright-core)

Playwright browsers live in `~/.cache/ms-playwright/` (e.g.
`chromium-1228/chrome-linux64/chrome`). Install `playwright-core` in a scratch
dir (not this repo) and `chromium.launch({ executablePath })`.

Key selectors / flows:

- Profile create: `[data-new]` → `.name-input` → `form[data-create] button[type=submit]` → lands on `.hero`.
- Table quiz: `.table-grid .table-btn:nth-child(N)` (N = table number) → `.question` shows `a × b`; answer via `.numpad .key:text-is("d")` + `.numpad .key.ok`; feedback in `.feedback.good/.bad`; round ends at `.big-score`.
- Nav: `[data-nav="/pack"]`, `[data-nav="/heatmap"]`, `[data-nav="/profiles"]`, `[data-back]`, `[data-home]`, `[data-quit]`.
- Grown-ups gate: pointer down on `[data-hold]` for >2s (use mouse.down/waitForTimeout(2300)/mouse.up), then `.stat-row` appears.
- Offline check: after first networkidle load, wait ~1.5s for precache, `context.setOffline(true)`, reload, expect `.hero`.
- Privacy check: collect `page.on('request')` URLs; everything must be same-origin.

## Gotchas

- **Also drive the deployed insecure origin** (`http://<server-ip>:8091`),
  not just localhost — localhost counts as a secure context, so it masks
  bugs from secure-context-only APIs (this bit us with `crypto.randomUUID`).

- Screens fade in for 0.25s — wait ~600ms before screenshots or they look washed out.
- Confetti (`.confetti`) persists ~5s across navigations after a good round; it photobombs screenshots.
- Wrong answers hold feedback for ~1.9s before the next question; correct ~0.7s.
- Data is per-browser-context (IndexedDB) — a fresh context = fresh app state.

## What "working" looks like

Full kid flow: create profile → play a table round (10 questions) → results with
score + next-pup meter → table meter on home > 0% → pack shows 1 unlocked /
12 locked for a new profile → heatmap 169 cells with the played row+column
colored → second profile starts at zero while the first keeps its progress.
