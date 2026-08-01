// Hermetic test server: serves the built app from dist/ and mounts the
// REAL production sync sidecar (deploy/sync-server.mjs) for
// /sync/profiles/ — CI exercises the actual CAS protocol, not a fake
// with stronger semantics. Data lives in a temp dir per server run.
//
// Env:
//   TEST_SYNC_KEY  when set, the sidecar enforces it (auth specs);
//                  otherwise the rollout anonymous toggle is on so the
//                  broad suite runs without keys.
//
// One TEST-ONLY extension (not part of the production handler): DELETE
// /sync/profiles/<id>.json removes the file directly, as a janitor for
// spec cleanup. The app itself never uses it.
import { createServer } from 'node:http';
import { readFile, rm, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.argv[2] ?? 4180);
const DIST = new URL('../dist/', import.meta.url).pathname;

process.env.SYNC_DIR = await mkdtemp(join(tmpdir(), 'compounded-sync-'));
if (process.env.TEST_SYNC_KEY) {
  process.env.SYNC_KEY = process.env.TEST_SYNC_KEY;
} else {
  process.env.SYNC_KEY = '';
  process.env.SYNC_ALLOW_ANONYMOUS = '1';
}
const { handleSync, startupSweep } = await import('../deploy/sync-server.mjs');
await startupSweep();

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  const path = new URL(req.url, 'http://x').pathname;

  if (path.startsWith('/sync/profiles')) {
    if (req.method === 'DELETE') {
      // test janitor only — still validated: an unvalidated join() here
      // is a path traversal in a repo-committed server
      const name = decodeURIComponent(path.slice('/sync/profiles/'.length)).replace(/\.json$/, '');
      if (!/^[A-Za-z0-9-]{1,64}$/.test(name)) {
        res.writeHead(400).end();
        return;
      }
      await rm(join(process.env.SYNC_DIR, `${name}.json`), { force: true });
      await rm(join(process.env.SYNC_DIR, `${name}.json.premigration`), { force: true });
      res.writeHead(204).end();
      return;
    }
    await handleSync(req, res).catch(() => {
      try {
        res.writeHead(500).end();
      } catch {
        /* responded */
      }
    });
    return;
  }

  const file = path === '/' ? '/index.html' : path;
  try {
    const data = await readFile(join(DIST, normalize(file)));
    res
      .writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' })
      .end(data);
  } catch {
    res.writeHead(404).end();
  }
}).listen(PORT, '0.0.0.0', () => console.log(`test server on :${PORT} (sync dir ${process.env.SYNC_DIR})`));
