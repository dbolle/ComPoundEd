// Compounded family-backup sidecar: a tiny, dependency-free conditional-
// write store for /sync/profiles/. nginx proxies to it; it is never
// host-exposed directly. Native nginx DAV cannot provide a trustworthy
// compare-and-swap, and read-back verification is unsafe — so profile
// writes here are real CAS: content-hash ETags, If-Match / If-None-Match,
// 412 on mismatch, 428 when conditions are missing (which safely blocks
// pre-v1.38 clients' blind PUTs without touching data).
//
// Storage model: one JSON file per profile id — a lifecycle ENVELOPE:
//   { gen, state: 'live'|'deleted'|'purged', lifecycleId, tombstoneId?,
//     doc | archive | (purged: neither) }
// gen increments on every accepted transition, serialized per-profile in
// process — lifecycle order never depends on client clocks.
//
// Legacy migration: pre-envelope files hold raw profile docs. On first
// touch each valid raw doc is preserved as <id>.json.premigration,
// wrapped as {gen:1, state:'live', doc}, atomically written, read-back
// verified, and only then is the backup dropped. Idempotent and
// restart-safe; a valid old profile is never quarantined. Unparseable
// files rename to .bad and the listing continues.
//
// Config via env:
//   SYNC_DIR   data directory (default /sync/profiles)
//   SYNC_KEY   family key; EMPTY MEANS REFUSE EVERYTHING (secure by
//              default). Generate with: openssl rand -base64 24
//   SYNC_ALLOW_ANONYMOUS=1  TEMPORARY rollout escape hatch — remove it.
//   PORT       internal listen port (default 8092, loopback of the
//              container network only; never publish it in compose).

import { createServer } from 'node:http';
import { createHash, timingSafeEqual } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { openSync, closeSync, fsyncSync, writeFileSync, unlinkSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

const DIR = process.env.SYNC_DIR ?? '/sync/profiles';
const KEY = process.env.SYNC_KEY ?? '';
const ALLOW_ANON = process.env.SYNC_ALLOW_ANONYMOUS === '1';
const PORT = Number(process.env.PORT ?? 8092);

export const LIMITS = {
  doc: 4 * 1024 * 1024, // matches the historical nginx client_max_body_size
  request: 4.5 * 1024 * 1024, // doc + envelope overhead
  page: 100, // listing entries per page
};

const ID_RE = /^[A-Za-z0-9-]{1,64}$/;

// ---- key auth (constant time over equal-length digests) -------------------
const keyDigest = KEY ? createHash('sha256').update(KEY).digest() : null;
const authFailures = new Map(); // ip -> { count, until }
// The real client address: nginx proxies every request, so the socket
// address is always the proxy's. Without this one bad device jailed the
// WHOLE family (audit M2).
export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.socket.remoteAddress ?? '?';
}

function authorized(req, ip) {
  if (!keyDigest) return ALLOW_ANON; // empty key: refuse (unless explicit rollout toggle)
  const now = Date.now();
  const given = req.headers['x-sync-key'];
  const ok =
    typeof given === 'string' &&
    given.length > 0 &&
    timingSafeEqual(createHash('sha256').update(given).digest(), keyDigest);
  // A CORRECT key is never throttled — the jail must not lock out the
  // family because someone else guessed wrong.
  if (ok) {
    authFailures.delete(ip);
    return true;
  }
  const jail = authFailures.get(ip);
  if (jail && jail.until > now && jail.count >= 20) return 'throttled';
  return recordFail(ip, now);
}
function recordFail(ip, now) {
  const jail = authFailures.get(ip) ?? { count: 0, until: 0 };
  jail.count += 1;
  jail.until = now + 60_000;
  authFailures.set(ip, jail);
  return false; // never log the key or the attempt body
}

// ---- storage helpers -------------------------------------------------------
// Per-profile serialization. The map is pruned when a chain settles so
// a client touching many ids can't grow it without bound.
const chains = new Map();
function locked(id, fn) {
  const prev = chains.get(id) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  const tracked = next.catch(() => {});
  chains.set(id, tracked);
  tracked.then(() => {
    if (chains.get(id) === tracked) chains.delete(id);
  });
  return next;
}

const canonical = (value) => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return `{${Object.keys(value)
    .sort()
    .filter((k) => value[k] !== undefined)
    .map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`)
    .join(',')}}`;
};
const etagOf = (env) => `"${createHash('sha256').update(canonical(env)).digest('hex')}"`;

function fsyncFile(path) {
  try {
    const fd = openSync(path, 'r');
    fsyncSync(fd);
    closeSync(fd);
  } catch {
    /* fsync best effort (some filesystems refuse) */
  }
}

async function atomicWrite(id, env) {
  const file = join(DIR, `${id}.json`);
  const tmp = join(DIR, `${id}.json.tmp-${randomUUID()}`);
  await fs.writeFile(tmp, JSON.stringify(env), { mode: 0o600 });
  fsyncFile(tmp);
  await fs.rename(tmp, file);
  fsyncFile(DIR); // directory entry durability, where supported
}

function looksLikeEnvelope(x) {
  return x && typeof x === 'object' && typeof x.gen === 'number' && typeof x.state === 'string';
}
function looksLikeRawProfile(x) {
  return x && typeof x === 'object' && typeof x.id === 'string' && typeof x.name === 'string' && !looksLikeEnvelope(x);
}

// Read (and lazily migrate) the envelope for an id. Returns null if absent.
async function readEnvelope(id) {
  const file = join(DIR, `${id}.json`);
  let text;
  try {
    text = await fs.readFile(file, 'utf8');
  } catch {
    // interrupted migration? a .premigration backup without a main file
    // resumes from the backup
    try {
      text = await fs.readFile(`${file}.premigration`, 'utf8');
    } catch {
      return null;
    }
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    await fs.rename(file, `${file}.bad`).catch(() => {});
    return null; // quarantined; listing continues
  }
  if (looksLikeEnvelope(parsed)) return parsed;
  if (looksLikeRawProfile(parsed)) {
    // legacy migration: keep original bytes until the wrap verifies
    const backup = `${file}.premigration`;
    await fs.writeFile(backup, text, { mode: 0o600 }).catch(() => {});
    const env = { gen: 1, state: 'live', lifecycleId: randomUUID(), doc: parsed };
    await atomicWrite(id, env);
    const verify = JSON.parse(await fs.readFile(file, 'utf8'));
    if (looksLikeEnvelope(verify) && verify.doc?.id === parsed.id) {
      await fs.unlink(backup).catch(() => {});
      return verify;
    }
    return null; // verification failed: backup stays, next read retries
  }
  await fs.rename(file, `${file}.bad`).catch(() => {});
  return null;
}

async function listIds() {
  const names = await fs.readdir(DIR).catch(() => []);
  return names
    .filter((n) => n.endsWith('.json'))
    .map((n) => n.slice(0, -5))
    .filter((id) => ID_RE.test(id))
    .sort();
}

// ---- request handling ------------------------------------------------------
async function readBody(req, cap) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > cap) return null;
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

const json = (res, code, body, headers = {}) =>
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers }).end(JSON.stringify(body));

export async function handleSync(req, res) {
  const url = new URL(req.url, 'http://x');
  const ip = clientIp(req);
  const auth = authorized(req, ip);
  if (auth === 'throttled') return json(res, 429, { error: 'slow down' });
  if (auth !== true) return json(res, keyDigest ? 403 : 403, { error: 'family key required' });

  const rest = url.pathname.replace(/^\/sync\/profiles\/?/, '');
  const [head, tail] = rest.split('/');

  // listings ---------------------------------------------------------------
  if ((head === '' || head === 'deleted') && req.method === 'GET') {
    const wantDeleted = head === 'deleted';
    const cursor = url.searchParams.get('cursor') ?? '';
    const ids = (await listIds()).filter((id) => id > cursor);
    const page = [];
    let nextCursor = null;
    for (const id of ids) {
      let env = null;
      try {
        env = await locked(id, () => readEnvelope(id));
      } catch {
        continue; // one unreadable file must never 500 the whole listing
      }
      if (!env) continue;
      if (wantDeleted ? env.state !== 'deleted' : env.state !== 'live') continue;
      page.push(
        wantDeleted
          ? {
              id,
              gen: env.gen,
              tombstoneId: env.tombstoneId ?? null,
              name: env.archive?.name ?? null,
              size: JSON.stringify(env.archive ?? {}).length,
            }
          : { id, gen: env.gen }
      );
      if (page.length >= LIMITS.page) {
        nextCursor = id;
        break;
      }
    }
    return json(res, 200, { entries: page, nextCursor });
  }

  const id = head?.replace(/\.json$/, '');
  if (!id || !ID_RE.test(id)) return json(res, 400, { error: 'bad id' });

  return locked(id, async () => {
    const env = await readEnvelope(id);

    if (req.method === 'GET' && !tail) {
      if (!env) return json(res, 404, { error: 'not found' });
      if (env.state === 'live') return json(res, 200, env.doc, { ETag: etagOf(env), 'X-Gen': String(env.gen) });
      return json(res, 410, { state: env.state, gen: env.gen, tombstoneId: env.tombstoneId ?? null }, { ETag: etagOf(env) });
    }

    if (req.method === 'GET' && tail === 'archive') {
      if (!env || env.state !== 'deleted') return json(res, 404, { error: 'no archive' });
      return json(res, 200, env.archive, { ETag: etagOf(env) });
    }

    if (req.method === 'PUT' && !tail) {
      const ifMatch = req.headers['if-match'];
      const ifNoneMatch = req.headers['if-none-match'];
      if (!ifMatch && ifNoneMatch !== '*') return json(res, 428, { error: 'conditional required' });
      const body = await readBody(req, LIMITS.request);
      if (body === null) return json(res, 413, { error: `too large (limit ${LIMITS.doc} bytes per profile)` });
      let doc;
      try {
        doc = JSON.parse(body);
      } catch {
        return json(res, 400, { error: 'invalid json' });
      }
      if (body.length > LIMITS.doc) return json(res, 413, { error: 'profile too large' });
      if (ifNoneMatch === '*') {
        if (env) return json(res, env.state === 'purged' ? 410 : 412, { error: 'exists', state: env?.state });
        const fresh = { gen: 1, state: 'live', lifecycleId: randomUUID(), doc };
        await atomicWrite(id, fresh);
        return json(res, 201, { gen: 1 }, { ETag: etagOf(fresh) });
      }
      if (!env) return json(res, 412, { error: 'gone' });
      if (env.state !== 'live') return json(res, 410, { state: env.state, gen: env.gen, tombstoneId: env.tombstoneId ?? null });
      if (ifMatch !== etagOf(env)) return json(res, 412, { error: 'etag mismatch' });
      const next = { ...env, gen: env.gen + 1, doc };
      await atomicWrite(id, next);
      return json(res, 200, { gen: next.gen }, { ETag: etagOf(next) });
    }

    if (req.method === 'POST' && ['delete', 'restore', 'purge'].includes(tail)) {
      const ifMatch = req.headers['if-match'];
      if (!ifMatch) return json(res, 428, { error: 'conditional required' });
      if (!env) return json(res, 404, { error: 'not found' });
      if (ifMatch !== etagOf(env)) return json(res, 412, { error: 'etag mismatch', state: env.state, gen: env.gen, tombstoneId: env.tombstoneId ?? null });
      const body = await readBody(req, LIMITS.request);
      let payload = {};
      try {
        payload = body ? JSON.parse(body) : {};
      } catch {
        return json(res, 400, { error: 'invalid json' });
      }
      if (tail === 'delete') {
        if (env.state !== 'live') return json(res, 410, { state: env.state });
        const tombstoneId = typeof payload.tombstoneId === 'string' ? payload.tombstoneId : randomUUID();
        const next = { gen: env.gen + 1, state: 'deleted', lifecycleId: env.lifecycleId, tombstoneId, archive: env.doc };
        await atomicWrite(id, next);
        return json(res, 200, { gen: next.gen, tombstoneId }, { ETag: etagOf(next) });
      }
      if (tail === 'restore') {
        if (env.state !== 'deleted') return json(res, 410, { state: env.state });
        const next = { gen: env.gen + 1, state: 'live', lifecycleId: env.lifecycleId, doc: env.archive };
        await atomicWrite(id, next);
        return json(res, 200, { gen: next.gen }, { ETag: etagOf(next) });
      }
      // purge: keep only the resurrection-proof marker — no names, no data
      const next = { gen: env.gen + 1, state: 'purged', lifecycleId: env.lifecycleId };
      await atomicWrite(id, next);
      return json(res, 200, { gen: next.gen }, { ETag: etagOf(next) });
    }

    return json(res, 405, { error: 'method not allowed' });
  });
}

// Single-replica guard: an OS advisory lock on a lockfile inside the
// data dir. It is released automatically when the process dies (no
// stale-lock recovery needed), and a second instance exits rather than
// sweeping tmp files a live instance is mid-write on.
// Single-replica guard. An O_EXCL marker holding the owner's pid: a live
// owner means refuse; a dead owner's marker is taken over (a killed
// container leaves one behind). Released on exit — no stale lock to
// clear by hand. MUST run before startupSweep, which deletes tmp files a
// live instance could be mid-write on.
export function acquireSingleInstanceLock() {
  const marker = join(DIR, '.sidecar.running');
  const take = () => {
    const mfd = openSync(marker, 'wx', 0o600);
    writeFileSync(marker, String(process.pid), { mode: 0o600 });
    closeSync(mfd);
    const release = () => {
      try {
        unlinkSync(marker);
      } catch {
        /* already gone */
      }
    };
    process.on('exit', release);
    for (const sig of ['SIGINT', 'SIGTERM'])
      process.on(sig, () => {
        release();
        process.exit(0);
      });
    return true;
  };
  try {
    return take();
  } catch {
    // marker exists — is its owner alive?
    let owner = 0;
    try {
      owner = Number(readFileSync(marker, 'utf8').trim());
    } catch {
      /* unreadable: treat as dead */
    }
    if (owner && owner !== process.pid) {
      try {
        process.kill(owner, 0); // throws if the pid is gone
        return false; // a live instance owns the directory
      } catch {
        /* dead owner: fall through and take over */
      }
    }
    try {
      unlinkSync(marker);
      return take();
    } catch {
      return false;
    }
  }
}

// Startup: ensure the dir, drop the previous run's marker, clean
// abandoned tmp files (safe: we hold the single-instance marker).
export async function startupSweep() {
  await fs.mkdir(DIR, { recursive: true, mode: 0o700 }).catch(() => {});
  await fs.chmod(DIR, 0o700).catch(() => {}); // bind mounts pre-exist mkdir
  const names = await fs.readdir(DIR).catch(() => []);
  for (const n of names) {
    if (n.includes('.json.tmp-')) await fs.unlink(join(DIR, n)).catch(() => {});
  }
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop());
if (isMain) {
  await fs.mkdir(DIR, { recursive: true, mode: 0o700 }).catch(() => {});
  if (!acquireSingleInstanceLock()) {
    console.error('another sync sidecar instance is running — refusing to start');
    process.exit(1);
  }
  await startupSweep(); // safe now: we own the directory
  createServer((req, res) => {
    handleSync(req, res).catch(() => {
      try {
        res.writeHead(500).end();
      } catch {
        /* already responded */
      }
    });
  }).listen(PORT, '0.0.0.0', () => {
    console.log(`compounded sync sidecar on :${PORT} (dir ${DIR}, key ${keyDigest ? 'set' : ALLOW_ANON ? 'ANONYMOUS-ROLLOUT' : 'MISSING: refusing all'})`);
  });
}
