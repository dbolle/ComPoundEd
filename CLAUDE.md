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

## Hard requirement: private data never enters the repo

`github.com/dbolle/ComPoundEd` is PUBLIC. Kid names, the home server's address
and the machine's username must never reach it — not in code, not in a
comment, not in a commit message, and not in a symlink target.

- **Never write an absolute machine path in a tracked file.** Derive it from
  `import.meta.url` — `coloringbook/judge/_paths.mjs` is the only place a path
  comes from. Anything genuinely machine-specific (host, ports, scratch dir)
  goes in **gitignored `judge.local.json`** and is read with `local('key')`.
  `judge.local.example.json` is the tracked template. A value that is not in
  the repo cannot be committed to the repo.
- **Never characterise a private term** — not its length, its shape, how often
  it occurs, which words contain it, or why it needed special handling. The
  secret has never been committed; a description precise enough to enumerate
  candidates is nearly as good, and one was. Explaining the *rule* is fine.
- **Never echo a private term** into output, a commit message, a test failure,
  or an agent report — not even on this machine. Report by index and category.
  Never run `bash -x` on anything that reads the terms file; debug by
  behaviour (exit codes, pass/fail) instead.
- Matching policy lives per-term in the private, never-tracked terms file:
  `<term>` is substring (the default, and the strict one — a term glued into a
  path or identifier is a real leak), `<term>|word` is whole-word only.
- Three gates enforce this and all three must stay green:
  `.githooks/pre-commit` (earliest), `tests/privacy.spec.js` (runs in
  `npm test`, the one gate that cannot be skipped), `.githooks/pre-push`
  (last line). Install hooks with `npm run setup-hooks`.
- The `local-history` branch predates publication and contains private network
  details — **never push it**. Push `main` only, never `--all`, never `--tags`.

## Working on this repo

- BETA EXEMPTION: features gated by `isBeta()` (subjects.beta, Grown-Ups
  🧪 chip) are previews — their schema/data may change or be purged WITHOUT
  migration. Everything else keeps the hard preservation rule above.
- Documentation is part of every change (user directive): update BACKLOG.md
  and CHANGELOG.md (bump `package.json` version — it displays in Grown-Ups)
  in the same commit, plus README.md when user-facing behavior changes.
  Larger designs live in docs/ (e.g. docs/PHASE5.md). Kid-facing strings
  follow docs/VOCABULARY.md (two registers; enforced by tests/vocab.spec.js).
- New features need an entry point an EXPERIENCED profile can reach —
  gates like "never tried" or hover tooltips have hidden features twice
  (wardrobe color needs, Meet lessons). Mechanics are shown, not explained:
  icon + meter + picture of the reward, at the point of action.

- package.json `overrides` pins `brace-expansion` to ^5.0.8
  (2026-07-31): GHSA-mh99-v99m-4gvg marks every release ≤5.0.7
  vulnerable (no 2.x backport), and the vulnerable copies were nested
  under workbox-build > ejs > jake > filelist where `npm audit fix`
  can't reach. It's a cross-major force-pin — if a future dependency
  install fails resolving brace-expansion, or those parents update to
  patched ranges, this override is the first thing to re-check
  (validated by build + full suite at pin time).
- Vanilla JS + Vite PWA; no framework. `npm run build` redeploys (the nginx
  container mounts `dist/`). See README.md for URLs, CHARTER.md for product
  principles (kids 7–10, no dark patterns, local-only data).
- Test on the deployed insecure origin (`http://<server-ip>:8091`), not
  just localhost — secure-context-only APIs differ (crypto.randomUUID bit us).
