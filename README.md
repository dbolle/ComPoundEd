# Compounded 🐾

A dog-themed PWA that helps kids (ages 7–10) practice and memorize their
multiplication tables. Master a times table, adopt a dog for your pack.

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
  tap-the-answer counting, numeral recognition, and more/fewer games with
  spoken prompts, error-less retries, and the same dogs (they earn
  accessories too). Numbers grow 1–5 → 1–10 with success.
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
