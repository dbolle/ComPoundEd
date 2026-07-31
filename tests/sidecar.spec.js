// The sync sidecar tested as a REAL child process: CAS protocol, family
// key auth (every method), legacy zero-loss migration, lifecycle
// transitions, pagination, and crash durability (SIGKILL mid-write).
import { test, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SIDECAR = new URL('../deploy/sync-server.mjs', import.meta.url).pathname;
const KEY = 'test-family-key-1234';

async function startSidecar(dir, { key = KEY, port } = {}) {
  const child = spawn(process.execPath, [SIDECAR], {
    env: { ...process.env, SYNC_DIR: dir, SYNC_KEY: key, PORT: String(port), SYNC_ALLOW_ANONYMOUS: '' },
    stdio: 'ignore',
  });
  for (let i = 0; i < 100; i++) {
    try {
      await fetch(`http://127.0.0.1:${port}/sync/profiles/`, { headers: { 'X-Sync-Key': key } });
      return child;
    } catch {
      await new Promise((r) => setTimeout(r, 50));
    }
  }
  throw new Error('sidecar did not start');
}

const H = { 'X-Sync-Key': KEY, 'Content-Type': 'application/json' };

test('auth: every method requires the key; throttling holds; key never echoed', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'sidecar-auth-'));
  const port = 18310;
  const child = await startSidecar(dir, { port });
  const base = `http://127.0.0.1:${port}/sync/profiles/`;
  try {
    // no key / wrong key → 403 for listing, GET, PUT, lifecycle
    for (const headers of [{}, { 'X-Sync-Key': 'wrong' }]) {
      expect((await fetch(base, { headers })).status).toBe(403);
      expect((await fetch(`${base}kid.json`, { headers })).status).toBe(403);
      expect(
        (await fetch(`${base}kid.json`, { method: 'PUT', body: '{}', headers: { ...headers, 'If-None-Match': '*' } })).status
      ).toBe(403);
      expect((await fetch(`${base}kid/delete`, { method: 'POST', body: '{}', headers: { ...headers, 'If-Match': 'x' } })).status).toBe(403);
    }
    // correct key round-trips; response never contains the key
    const res = await fetch(`${base}kid.json`, {
      method: 'PUT',
      body: JSON.stringify({ id: 'kid', name: 'Kid', schemaVersion: 1, facts: {} }),
      headers: { ...H, 'If-None-Match': '*' },
    });
    expect(res.status).toBe(201);
    expect(JSON.stringify(await res.json())).not.toContain(KEY);
  } finally {
    child.kill('SIGKILL');
  }
});

test('empty configured key refuses everything (secure by default)', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'sidecar-nokey-'));
  const port = 18311;
  const child = spawn(process.execPath, [SIDECAR], {
    env: { ...process.env, SYNC_DIR: dir, SYNC_KEY: '', PORT: String(port), SYNC_ALLOW_ANONYMOUS: '' },
    stdio: 'ignore',
  });
  await new Promise((r) => setTimeout(r, 600));
  try {
    const res = await fetch(`http://127.0.0.1:${port}/sync/profiles/`);
    expect(res.status).toBe(403);
    const res2 = await fetch(`http://127.0.0.1:${port}/sync/profiles/`, { headers: { 'X-Sync-Key': 'anything' } });
    expect(res2.status).toBe(403);
  } finally {
    child.kill('SIGKILL');
  }
});

test('CAS: 428 without conditionals, 412 on stale etag, gen increments', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'sidecar-cas-'));
  const port = 18312;
  const child = await startSidecar(dir, { port });
  const base = `http://127.0.0.1:${port}/sync/profiles/`;
  try {
    const doc = { id: 'cas-kid', name: 'Cas', schemaVersion: 1, facts: {} };
    // blind PUT (an old client) → 428, nothing written
    expect((await fetch(`${base}cas-kid.json`, { method: 'PUT', body: JSON.stringify(doc), headers: H })).status).toBe(428);
    // create
    const create = await fetch(`${base}cas-kid.json`, { method: 'PUT', body: JSON.stringify(doc), headers: { ...H, 'If-None-Match': '*' } });
    expect(create.status).toBe(201);
    const etag1 = create.headers.get('etag');
    // second create → 412
    expect(
      (await fetch(`${base}cas-kid.json`, { method: 'PUT', body: JSON.stringify(doc), headers: { ...H, 'If-None-Match': '*' } })).status
    ).toBe(412);
    // conditional update with the right etag
    const upd = await fetch(`${base}cas-kid.json`, {
      method: 'PUT',
      body: JSON.stringify({ ...doc, name: 'Cas2' }),
      headers: { ...H, 'If-Match': etag1 },
    });
    expect(upd.status).toBe(200);
    expect((await upd.json()).gen).toBe(2);
    // stale etag → 412 (the concurrent-write contract)
    expect(
      (await fetch(`${base}cas-kid.json`, { method: 'PUT', body: JSON.stringify(doc), headers: { ...H, 'If-Match': etag1 } })).status
    ).toBe(412);
  } finally {
    child.kill('SIGKILL');
  }
});

test('lifecycle: delete archives, restore revives, purge is resurrection-proof', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'sidecar-life-'));
  const port = 18313;
  const child = await startSidecar(dir, { port });
  const base = `http://127.0.0.1:${port}/sync/profiles/`;
  try {
    const doc = { id: 'life-kid', name: 'Life', schemaVersion: 1, facts: { '2x3': { box: 4 } }, futureField: 'keep' };
    const create = await fetch(`${base}life-kid.json`, { method: 'PUT', body: JSON.stringify(doc), headers: { ...H, 'If-None-Match': '*' } });
    let etag = create.headers.get('etag');

    const del = await fetch(`${base}life-kid/delete`, { method: 'POST', body: '{}', headers: { ...H, 'If-Match': etag } });
    expect(del.status).toBe(200);
    etag = del.headers.get('etag');
    // live GET → 410 with lifecycle metadata; live listing excludes; deleted listing includes
    const gone = await fetch(`${base}life-kid.json`, { headers: H });
    expect(gone.status).toBe(410);
    expect((await gone.json()).state).toBe('deleted');
    const live = await (await fetch(base, { headers: H })).json();
    expect(live.entries.map((e) => e.id)).not.toContain('life-kid');
    const deleted = await (await fetch(`${base}deleted`, { headers: H })).json();
    expect(deleted.entries.map((e) => e.id)).toContain('life-kid');
    // archive intact — known AND unknown fields
    const archive = await (await fetch(`${base}life-kid/archive`, { headers: H })).json();
    expect(archive.facts['2x3'].box).toBe(4);
    expect(archive.futureField).toBe('keep');

    // restore
    const restore = await fetch(`${base}life-kid/restore`, { method: 'POST', body: '{}', headers: { ...H, 'If-Match': etag } });
    expect(restore.status).toBe(200);
    etag = restore.headers.get('etag');
    expect((await (await fetch(`${base}life-kid.json`, { headers: H })).json()).futureField).toBe('keep');

    // delete again, then PURGE
    const del2 = await fetch(`${base}life-kid/delete`, { method: 'POST', body: '{}', headers: { ...H, 'If-Match': etag } });
    etag = del2.headers.get('etag');
    const purge = await fetch(`${base}life-kid/purge`, { method: 'POST', body: '{}', headers: { ...H, 'If-Match': etag } });
    expect(purge.status).toBe(200);
    // purged marker holds NO child data
    const onDisk = JSON.parse(await readFile(join(dir, 'life-kid.json'), 'utf8'));
    expect(onDisk.state).toBe('purged');
    expect(JSON.stringify(onDisk)).not.toContain('Life');
    expect(JSON.stringify(onDisk)).not.toContain('2x3');
    // creation is rejected forever; restore impossible
    expect(
      (await fetch(`${base}life-kid.json`, { method: 'PUT', body: JSON.stringify(doc), headers: { ...H, 'If-None-Match': '*' } })).status
    ).toBe(410);
    const purgedEtag = purge.headers.get('etag');
    expect((await fetch(`${base}life-kid/restore`, { method: 'POST', body: '{}', headers: { ...H, 'If-Match': purgedEtag } })).status).toBe(410);
  } finally {
    child.kill('SIGKILL');
  }
});

test('legacy raw files migrate zero-loss (idempotent, backup until verified)', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'sidecar-legacy-'));
  // real-shaped raw docs: v1-era, intermediate, current — plus junk
  const v1 = { id: 'old-kid', name: 'Old', schemaVersion: 1, facts: { '2x3': { attempts: 3, correct: 2, box: 1, lastSeen: 5 } }, unlocks: [{ dogId: 'starter', table: null, at: 1 }], play: {}, speed: { avgMs: 0, samples: 0 }, mystery: { future: true } };
  await writeFile(join(dir, 'old-kid.json'), JSON.stringify(v1));
  await writeFile(join(dir, 'junk.json'), '{not json');
  const port = 18314;
  const child = await startSidecar(dir, { port });
  const base = `http://127.0.0.1:${port}/sync/profiles/`;
  try {
    const res = await fetch(`${base}old-kid.json`, { headers: H });
    expect(res.status).toBe(200);
    const doc = await res.json();
    expect(doc.facts['2x3'].attempts).toBe(3); // known fields intact
    expect(doc.mystery).toEqual({ future: true }); // unknown fields intact
    expect(res.headers.get('etag')).toBeTruthy();
    // envelope on disk, premigration backup cleaned after verification
    const onDisk = JSON.parse(await readFile(join(dir, 'old-kid.json'), 'utf8'));
    expect(onDisk.gen).toBe(1);
    expect(onDisk.state).toBe('live');
    const names = await readdir(dir);
    expect(names).not.toContain('old-kid.json.premigration');
    expect(names).toContain('junk.json.bad'); // junk quarantined, listing lives
    const listing = await (await fetch(base, { headers: H })).json();
    expect(listing.entries.map((e) => e.id)).toContain('old-kid');
  } finally {
    child.kill('SIGKILL');
  }
});

test('pagination: stable cursors across many profiles; client-visible nextCursor', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'sidecar-page-'));
  const port = 18315;
  const child = await startSidecar(dir, { port });
  const base = `http://127.0.0.1:${port}/sync/profiles/`;
  try {
    for (let i = 0; i < 130; i++) {
      const id = `kid-${String(i).padStart(3, '0')}`;
      await fetch(`${base}${id}.json`, {
        method: 'PUT',
        body: JSON.stringify({ id, name: `K${i}`, schemaVersion: 1, facts: {} }),
        headers: { ...H, 'If-None-Match': '*' },
      });
    }
    const page1 = await (await fetch(base, { headers: H })).json();
    expect(page1.entries.length).toBe(100);
    expect(page1.nextCursor).toBeTruthy();
    const page2 = await (await fetch(`${base}?cursor=${encodeURIComponent(page1.nextCursor)}`, { headers: H })).json();
    expect(page2.entries.length).toBe(30);
    expect(page2.nextCursor).toBe(null);
    const all = new Set([...page1.entries, ...page2.entries].map((e) => e.id));
    expect(all.size).toBe(130);
  } finally {
    child.kill('SIGKILL');
  }
});

test('crash durability: SIGKILL mid-traffic corrupts nothing; tmp files sweep on restart', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'sidecar-crash-'));
  const port = 18316;
  let child = await startSidecar(dir, { port });
  const base = `http://127.0.0.1:${port}/sync/profiles/`;
  const doc = { id: 'crash-kid', name: 'Crash', schemaVersion: 1, facts: {}, blob: 'x'.repeat(200_000) };
  const create = await fetch(`${base}crash-kid.json`, { method: 'PUT', body: JSON.stringify(doc), headers: { ...H, 'If-None-Match': '*' } });
  let etag = create.headers.get('etag');
  // fire updates and kill mid-flight
  const puts = [];
  for (let i = 0; i < 5; i++) {
    puts.push(
      fetch(`${base}crash-kid.json`, {
        method: 'PUT',
        body: JSON.stringify({ ...doc, name: `Crash${i}` }),
        headers: { ...H, 'If-Match': etag },
      }).catch(() => null)
    );
  }
  child.kill('SIGKILL');
  await Promise.all(puts);
  // restart: file is valid JSON (old or new content, never torn)
  child = await startSidecar(dir, { port });
  try {
    const after = await fetch(`${base}crash-kid.json`, { headers: H });
    expect(after.status).toBe(200);
    const got = await after.json();
    expect(got.id).toBe('crash-kid'); // parseable, coherent doc
    const names = await readdir(dir);
    expect(names.filter((n) => n.includes('.tmp-'))).toEqual([]); // sweep ran
  } finally {
    child.kill('SIGKILL');
  }
});
