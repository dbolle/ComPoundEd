# Compounded 🐾

A dog-themed PWA a child can follow from pre-K through upper elementary,
building automaticity for math facts: counting → number bonds → addition
and subtraction within 20 → multiplication and division. Master a set,
adopt a companion for your pack.

See [CHARTER.md](CHARTER.md) for the project vision, roadmap, and design
principles, and [src/art/ATTRIBUTION.md](src/art/ATTRIBUTION.md) for art
licensing.

## Highlights

- **Spaced repetition, kid-sized** — Leitner boxes; weak facts come back more
  often. Careful answers (skip counting) climb the early levels; only fast
  recall climbs to mastery, so mastered means memorized.
- **Adopt-a-dog collection** — 25 original SVG dogs: one per mastered times
  table, one per mastered division table, plus a starter pup.
- **Missing number → division** — mastering ×t opens the ÷t track, which
  bridges from "5 × _ = 20" to "20 ÷ 5" as each fact strengthens.
- **The bridge (ages ~4½–7)** — Quick Look subitizing, Number Friends
  (bonds of 5 and 10, pictures first), Teen Numbers, then Adding and
  Taking Away: 66 facts each in seven strategy waves (Step Ups, Doubles,
  Make Ten…), subtraction taught as think-addition.
- **Teach before drill** — brand-new facts introduce themselves (the full
  equation shown, kid types it in — errorless), and every times table has
  an optional, repeatable "Meet the ×7s" lesson: skip-count paw path,
  tap-to-build groups, and anchor tricks, spoken aloud. A skip-count
  warm-up opens barely-tried tables.
- **Paw Bucks (fictitious forever)** — coins follow the learning frontier:
  a nickel when a fact is first mastered, a Paw Buck per completed set,
  capped polish pennies for refreshed rusty facts, sitting dimes — never
  raw volume. Wallet, ledger, piggy bank for little pups; Pet Store
  coming (teaser live).
- **Cozy Corner** — zero-maintenance companion pets adopted at bridge
  milestones, grouped by species habitat; any adopted pet can be picked
  as the kid's buddy/avatar.
- **Dog accessories** — pups earn a bandana/bow/cap (10 walks/meals/fetches)
  and a star tag (40 plays), worn everywhere they appear.
- **Awards** — 14 stacked achievement families climbing Bronze → Silver →
  Gold → Diamond → Royal → Legend; counter families (comebacks, streaks,
  care, rounds) scale endlessly past Legend, so there is always a next tier.
- **Progress map** — a 13×13 mastery heatmap of every fact.
- **Pet sitting** — once a kid has a baseline of solid facts, a daily guest
  pup visits with a confidence-first round: mostly mastered quick wins, a few
  firm facts to reinforce, and 1–2 weak facts tucked in the middle.
- **Multiple players** — sibling-friendly profiles on one device.
- **Little Pup mode (ages 3–5)** — a per-profile preschool experience:
  twelve tap-only games (counting, numerals, comparison, shapes, patterns,
  bonds…) with spoken prompts, guided recounts on misses, per-number
  mastery tracking, a Play-next hero tile, and a goal preview for the next
  unlock. Numbers grow 1–5 → 1–10 as they're genuinely known.
- **Grown-Ups controls** — per-child visibility (little/bridge/tables,
  child-can-switch, hide sitting, limit tables), per-track progress,
  Paw Bucks ledger, speech-voice picker, backup and export.
- **Private by construction** — installable, fully offline PWA; all data stays
  on the device. No accounts, ads, analytics, or network calls.
- **Family backup (opt-in, off by default)** — Grown-Ups area can back
  profiles up to the family's own home server (same-origin `/sync/`, LAN
  only), restore them on new devices, and export/import a backup file.
  Conflicts merge without losing progress from either side.

## Develop

```bash
npm install
npm run dev        # dev server
npm run build      # production build (dist/) + service worker
npm run preview    # serve the production build
node scripts/make-icons.mjs   # regenerate PNG icons after editing icon.svg
```

## Deploy (home server)

Served by `deploy/docker-compose.yml` (nginx:alpine mounting `dist/`):

- **https://compounded.lan** — via your reverse proxy (e.g. Traefik) with a
  locally-trusted cert (mkcert); PWA install + offline need HTTPS, a router
  DNS entry pointing `compounded.lan` at your server, and the mkcert root CA
  installed on each device
- **http://\<server-ip\>:8091** — direct; browser-only (no install/offline,
  since service workers require a secure context)

Set `TRAEFIK_NETWORK` in `deploy/.env` (gitignored) to your proxy's Docker
network name.

Redeploy after changes: `npm run build` (the container mounts `dist/` read-only,
so a rebuild is all it takes).
