# Compounded — notes for coding agents

## Hard requirement: never lose kid progress

Real kids actively use this app; their profiles live in browser IndexedDB on
their devices (DB `compounded`, stores `profiles`/`meta`). Every update MUST
preserve existing profile data:

- Never rename the DB or object stores, and never bump the IndexedDB
  `DB_VERSION` with store-dropping upgrades.
- Any change to the profile document shape bumps `SCHEMA_VERSION` in
  `src/data/schema.js` and adds an **additive** migration step in
  `migrateProfile()` (old docs in, valid new docs out — no field loss).
- Verify before shipping: `npm test` — the suite's migration spec seeds
  old-schema profiles and fails on any progress loss (tests/migration.spec.js
  is the gate; see `.claude/skills/verify/SKILL.md`). Never ship red.
- Family backup sync (`src/data/sync.js`, nginx `/sync/` WebDAV) merges via
  `mergeProfiles()` in schema.js — merges must never lose progress from
  either side (per-fact richer-wins, unlock union, play-counter max).
- After testing sync against the live server, DELETE any test profiles from
  `/sync/profiles/` (host rm fails — the dir is owned by the container user;
  use `curl -X DELETE`). Kids could otherwise restore test data.

## Working on this repo

- Documentation is part of every change (user directive): update BACKLOG.md
  and CHANGELOG.md (bump `package.json` version — it displays in Grown-Ups)
  in the same commit, plus README.md when user-facing behavior changes.
  Larger designs live in docs/ (e.g. docs/PHASE5.md). Kid-facing strings
  follow docs/VOCABULARY.md (two registers; enforced by tests/vocab.spec.js).
- New features need an entry point an EXPERIENCED profile can reach —
  gates like "never tried" or hover tooltips have hidden features twice
  (wardrobe color needs, Meet lessons). Mechanics are shown, not explained:
  icon + meter + picture of the reward, at the point of action.

- Vanilla JS + Vite PWA; no framework. `npm run build` redeploys (the nginx
  container mounts `dist/`). See README.md for URLs, CHARTER.md for product
  principles (kids 7–10, no dark patterns, local-only data).
- Test on the deployed insecure origin (`http://<server-ip>:8091`), not
  just localhost — secure-context-only APIs differ (crypto.randomUUID bit us).
- The `local-history` git branch predates publication and contains private
  network details in commits — never push it to a public remote.
