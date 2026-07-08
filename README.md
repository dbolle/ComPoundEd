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
- **Adopt-a-dog collection** — 13 original SVG dogs, one per mastered table.
- **Progress map** — a 13×13 mastery heatmap of every fact.
- **Pet sitting** — once a kid has a baseline of solid facts, a daily guest
  pup visits with a confidence-first round: mostly mastered quick wins, a few
  firm facts to reinforce, and 1–2 weak facts tucked in the middle.
- **Multiple players** — sibling-friendly profiles on one device.
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
