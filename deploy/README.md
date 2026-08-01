# Deploying Compounded's home server

nginx serves the built app (`dist/`) and proxies `/sync/profiles/` to the
**sync sidecar** (`sync-server.mjs`) — a tiny dependency-free Node service
providing real conditional writes (content-hash ETags, If-Match CAS),
lifecycle envelopes, and family-key authentication. The sidecar is never
host-exposed; only nginx reaches it.

Note on exposure: `ports: "8091:80"` binds every host interface. On a
home LAN that is the point — but if this host has a public interface,
bind `127.0.0.1:8091:80` and serve only through your TLS proxy. Never
port-forward the app or `/sync/` to the internet.

## v1.38 sidecar cutover (one-time)

The cutover has a deliberate, honest window: after step 3, devices show
"backup is locked 🔑" until the key is entered. Local play is unaffected
and nothing is lost — after key entry, the client merges and uploads
everything accumulated locally.

1. **Back up the sync directory first** (human checkpoint):
   `tar czf sync-backup-$(date +%F).tar.gz deploy/sync-data/` — keep it
   off-container.
2. **Confirm every kid device runs ≥ v1.38.0** (Grown-Ups footer). Older
   installed clients are safely write-blocked (HTTP 428, data untouched)
   until the PWA self-updates (hourly service-worker check).
3. Configure and cut over:
   - `cp deploy/.env.example deploy/.env`; set `SYNC_KEY`
     (`openssl rand -base64 24`).
   - `docker compose up -d` (starts the sidecar, reloads nginx config).
   - The sidecar wraps existing raw profile files into lifecycle
     envelopes lazily and zero-loss (originals kept as `.premigration`
     until each wrap read-back verifies).
4. **Enter the family key once per device/origin** (Grown-Ups → backup
   card, or the profiles screen on a fresh device). On `http://…:8091`
   the first send asks for an explicit acknowledgement — the key is
   observable on your LAN there; `https://compounded.lan` is preferred.

## Rollback

Static DAV is **not** a rollback target (envelope files are not
raw-client compatible). Instead:

- Keep the previous known-good `sync-server.mjs` + compose config (git
  history) — rolling back the sidecar version preserves envelopes and
  lifecycle protections.
- Emergency raw export (inspection / worst case):
  `node deploy/export-live.mjs deploy/sync-data/profiles /tmp/export` —
  writes validated raw LIVE docs to a separate directory without
  touching envelopes. Deleted/purged lifecycle state stays protected.
- Full restore: stop the stack, restore the step-1 tarball, start the
  previous config.

## Running the sync service unprivileged (one-time)

`docker-compose.yml` sets `user: "1000:1000"` so the sidecar does not run
as root. Existing installs must hand the data directory over once, or the
service will start and then fail to read the family's backups:

```
sudo chown -R 1000:1000 deploy/sync-data
docker compose up -d

# WAIT for the service to come up before checking — nginx returns 502
# while the sidecar is still starting, which is not a failure:
sleep 5
docker compose logs --tail=3 sync          # expect "... key set"
KEY=$(grep '^SYNC_KEY=' .env | cut -d= -f2)
curl -s -o /dev/null -w '%{http_code}\n' -H "X-Sync-Key: $KEY" \
  http://localhost:8091/sync/profiles/     # expect 200 (403 = wrong key)
```

Reading the result:
- **200** — done, backups are flowing.
- **502** — the sidecar isn't answering *yet*. Wait a few seconds and
  retry; if it persists, `docker compose logs sync` will say why.
- **403** — the service is fine, the key in the header doesn't match
  `.env`.

If 502 persists, comment out the `user:` line and restart — backups keep
working as before while you sort the ownership out.

## Operational notes

- Single sidecar replica only (per-profile writes serialize in-process).
- The key check hashes both sides (constant-time compare); failed
  attempts are throttled per CLIENT (the proxy's forwarded address, so
  one bad device can't lock out the family) and a correct key is never
  throttled; the key and profile bodies are never logged.
- Limits: profile docs ≤ 4MB, requests ≤ 4.5MB, listings paginated
  (100/page).
- Test profiles: remove with the janitor only on the hermetic test
  server; on the live server use the app's delete flow (v1.39+) or
  curl with the key.
- The deleted-player listing returns each archived player's NAME (the
  restore UI needs it to tell them apart). It is behind the family key,
  like everything else under /sync/profiles/.
