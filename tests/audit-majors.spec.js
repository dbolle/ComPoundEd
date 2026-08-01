// Audit majors (v1.42.0): the promises that shipped without tests, plus
// property coverage for the ledger union that let M3 through.
import { test, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mergeTxns, replayLedger, validEvent } from '../src/engine/ledger.js';
import { newProfile, mergeProfiles, validProfileDoc, structurallySane } from '../src/data/schema.js';
import { profileSignature } from '../src/data/canonical.js';
import { selectProfile, holdGrownupsGate } from './helpers.mjs';

const SIDECAR = new URL('../deploy/sync-server.mjs', import.meta.url).pathname;
const KEY = 'audit-key-abcdefgh';
const H = { 'X-Sync-Key': KEY, 'Content-Type': 'application/json' };

async function startSidecar(dir, port, env = {}) {
  const child = spawn(process.execPath, [SIDECAR], {
    env: { ...process.env, SYNC_DIR: dir, SYNC_KEY: KEY, PORT: String(port), SYNC_ALLOW_ANONYMOUS: '', ...env },
    stdio: 'ignore',
  });
  for (let i = 0; i < 100; i++) {
    try {
      await fetch(`http://127.0.0.1:${port}/sync/profiles/`, { headers: H });
      return child;
    } catch {
      await new Promise((r) => setTimeout(r, 50));
    }
  }
  throw new Error('sidecar did not start');
}

// ---------- M3: ledger union properties (randomized) ----------

const rndEvent = (i) => {
  const denoms = ['buck', 'quarter', 'dime', 'nickel', 'penny'];
  const cents = [100, 25, 10, 5, 1];
  const d = Math.floor(Math.random() * 5);
  const buy = Math.random() < 0.35;
  return buy
    ? { id: `buy-item${i % 7}`, at: 1000 + Math.floor(Math.random() * 50), cents: -[10, 25, 100][i % 3], count: 1, reason: 'buy' }
    : { id: `e${i}`, at: 1000 + Math.floor(Math.random() * 50), cents: cents[d], denom: denoms[d], count: 1, reason: 'sitting' };
};

test('property: mergeTxns is commutative, associative and idempotent (100 random cases)', () => {
  const eq = (x, y) => JSON.stringify(x) === JSON.stringify(y);
  for (let n = 0; n < 100; n++) {
    const mk = (k) => Array.from({ length: 1 + Math.floor(Math.random() * 6) }, (_, i) => rndEvent(i + k));
    const a = mk(0);
    const b = mk(3); // deliberate id overlap with a
    const c = mk(5);
    // legacy vs upgraded twins of the same event (the M3 case)
    if (Math.random() < 0.5) {
      const legacy = { id: 'swap-z-a', at: 900, cents: -100, denom: 'buck', count: -1, reason: 'swap' };
      a.push(legacy);
      b.push({ ...legacy, at: 950, group: 'swap-z' });
    }
    expect(eq(mergeTxns(a, b), mergeTxns(b, a))).toBe(true); // commutative
    expect(eq(mergeTxns(mergeTxns(a, b), c), mergeTxns(a, mergeTxns(b, c)))).toBe(true); // associative
    const ab = mergeTxns(a, b);
    expect(eq(mergeTxns(ab, ab), ab)).toBe(true); // idempotent
    // and the DERIVED state agrees in both orders
    const r1 = replayLedger(mergeTxns(a, b));
    const r2 = replayLedger(mergeTxns(b, a));
    expect(r1.balance).toBe(r2.balance);
    expect(r1.counts).toEqual(r2.counts);
    expect([...r1.accepted].sort()).toEqual([...r2.accepted].sort());
  }
});

test('a legacy event and its upgraded twin no longer heal-loop', () => {
  const legacy = { id: 'swap-x-a', at: 100, cents: -100, denom: 'buck', count: -1, reason: 'swap' };
  const upgraded = { ...legacy, at: 100, group: 'swap-x' };
  const A = newProfile('A');
  A.id = 'k';
  A.pawBucks.txns = [legacy];
  const B = newProfile('A');
  B.id = 'k';
  B.pawBucks.txns = [upgraded];
  // identical content ⇒ identical signature ⇒ no endless healing pushes
  expect(profileSignature(mergeProfiles(A, B))).toBe(profileSignature(mergeProfiles(B, A)));
});

test('a non-numeric `at` is quarantined, not left to poison the sort', () => {
  expect(validEvent({ id: 'x', at: 'yesterday', cents: 10, reason: 'sitting' })).toBe(false);
  const r = replayLedger([
    { id: 'ok', at: 1, cents: 10, denom: 'dime', count: 1, reason: 'sitting' },
    { id: 'bad', at: 'yesterday', cents: 10, denom: 'dime', count: 1, reason: 'sitting' },
  ]);
  expect(r.balance).toBe(10);
  expect(r.quarantined.has('bad')).toBe(true);
});

test('replay memo notices same-length in-place edits', () => {
  const txns = [{ id: 'a', at: 1, cents: 100, denom: 'buck', count: 1, reason: 'sitting' }];
  expect(replayLedger(txns).balance).toBe(100);
  txns[0] = { id: 'a', at: 1, cents: 5, denom: 'nickel', count: 1, reason: 'sitting' };
  expect(replayLedger(txns).balance).toBe(5); // not the stale 100
});

// ---------- M6 / ingest limits ----------

test('merges keep unknown fields from BOTH sides', () => {
  const A = newProfile('K');
  A.id = 'k';
  A.updatedAt = 1000;
  A.fromDeviceA = { keep: 'a' };
  const B = newProfile('K');
  B.id = 'k';
  B.updatedAt = 2000;
  B.fromDeviceB = { keep: 'b' };
  for (const m of [mergeProfiles(A, B), mergeProfiles(B, A)]) {
    expect(m.fromDeviceA).toEqual({ keep: 'a' });
    expect(m.fromDeviceB).toEqual({ keep: 'b' });
  }
});

test('structurally absurd documents are rejected before serialization', () => {
  let deep = { v: 1 };
  for (let i = 0; i < 400; i++) deep = { nested: deep };
  const doc = { ...newProfile('Bomb'), id: 'bomb', deep };
  expect(structurallySane(deep)).toBe(false);
  expect(validProfileDoc(doc)).toBe(false); // never reaches stableStringify
  const wide = { ...newProfile('Wide'), id: 'wide', blob: Array.from({ length: 250_000 }, () => 1) };
  expect(validProfileDoc(wide)).toBe(false);
});

// ---------- M2 throttling ----------

test('sidecar: a correct key is never throttled, and the jail is per client', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'audit-throttle-'));
  const port = 18420;
  const child = await startSidecar(dir, port);
  const base = `http://127.0.0.1:${port}/sync/profiles/`;
  try {
    // one bad device burns through the jail using a forwarded address
    for (let i = 0; i < 25; i++) {
      await fetch(base, { headers: { 'X-Sync-Key': 'wrong', 'X-Forwarded-For': '10.0.0.9' } });
    }
    expect((await fetch(base, { headers: { 'X-Sync-Key': 'wrong', 'X-Forwarded-For': '10.0.0.9' } })).status).toBe(429);
    // a DIFFERENT device is unaffected…
    expect((await fetch(base, { headers: { 'X-Sync-Key': 'wrong', 'X-Forwarded-For': '10.0.0.10' } })).status).toBe(403);
    // …and the correct key still works, even from the jailed address
    expect((await fetch(base, { headers: { ...H, 'X-Forwarded-For': '10.0.0.9' } })).status).toBe(200);
  } finally {
    child.kill('SIGKILL');
  }
});

// ---------- M5 test debt ----------

test('sidecar: deleted-listing paginates too', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'audit-delpage-'));
  const port = 18421;
  const child = await startSidecar(dir, port);
  const base = `http://127.0.0.1:${port}/sync/profiles/`;
  try {
    for (let i = 0; i < 105; i++) {
      const id = `del-${String(i).padStart(3, '0')}`;
      const c = await fetch(`${base}${id}.json`, {
        method: 'PUT',
        body: JSON.stringify({ id, name: `D${i}`, schemaVersion: 1, facts: {} }),
        headers: { ...H, 'If-None-Match': '*' },
      });
      await fetch(`${base}${id}/delete`, { method: 'POST', body: '{}', headers: { ...H, 'If-Match': c.headers.get('etag') } });
    }
    const p1 = await (await fetch(`${base}deleted`, { headers: H })).json();
    expect(p1.entries.length).toBe(100);
    expect(p1.nextCursor).toBeTruthy();
    const p2 = await (await fetch(`${base}deleted?cursor=${encodeURIComponent(p1.nextCursor)}`, { headers: H })).json();
    expect(p2.entries.length).toBe(5);
    expect(new Set([...p1.entries, ...p2.entries].map((e) => e.id)).size).toBe(105);
  } finally {
    child.kill('SIGKILL');
  }
});

test('sidecar: a near-4MB profile syncs, deletes, restores and purges', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'audit-big-'));
  const port = 18422;
  const child = await startSidecar(dir, port);
  const base = `http://127.0.0.1:${port}/sync/profiles/`;
  try {
    const big = { id: 'big-kid', name: 'Big', schemaVersion: 1, facts: {}, unknownBlob: 'x'.repeat(3_600_000) };
    const c = await fetch(`${base}big-kid.json`, { method: 'PUT', body: JSON.stringify(big), headers: { ...H, 'If-None-Match': '*' } });
    expect(c.status).toBe(201);
    const got = await (await fetch(`${base}big-kid.json`, { headers: H })).json();
    expect(got.unknownBlob.length).toBe(3_600_000);
    const cur = await fetch(`${base}big-kid.json`, { headers: H });
    const del = await fetch(`${base}big-kid/delete`, { method: 'POST', body: '{}', headers: { ...H, 'If-Match': cur.headers.get('etag') } });
    expect(del.status).toBe(200);
    const arch = await (await fetch(`${base}big-kid/archive`, { headers: H })).json();
    expect(arch.unknownBlob.length).toBe(3_600_000);
    const res = await fetch(`${base}big-kid/restore`, { method: 'POST', body: '{}', headers: { ...H, 'If-Match': del.headers.get('etag') } });
    expect(res.status).toBe(200);
    // oversized (beyond the request cap) is refused with an actionable error
    const huge = { id: 'huge-kid', name: 'Huge', schemaVersion: 1, facts: {}, blob: 'y'.repeat(5_000_000) };
    const rej = await fetch(`${base}huge-kid.json`, { method: 'PUT', body: JSON.stringify(huge), headers: { ...H, 'If-None-Match': '*' } });
    expect(rej.status).toBe(413);
  } finally {
    child.kill('SIGKILL');
  }
});

test('sidecar: a kill mid-migration leaves the original recoverable', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'audit-mig-'));
  const raw = { id: 'mig-kid', name: 'Mig', schemaVersion: 1, facts: { '2x3': { box: 3 } }, mystery: 'keep' };
  await writeFile(join(dir, 'mig-kid.json'), JSON.stringify(raw));
  // simulate an interrupted migration: backup written, wrap never landed
  await writeFile(join(dir, 'mig-kid.json.premigration'), JSON.stringify(raw));
  const port = 18423;
  const child = await startSidecar(dir, port);
  try {
    const got = await (await fetch(`http://127.0.0.1:${port}/sync/profiles/mig-kid.json`, { headers: H })).json();
    expect(got.facts['2x3'].box).toBe(3);
    expect(got.mystery).toBe('keep'); // nothing lost by the interruption
    const names = await readdir(dir);
    expect(names).not.toContain('mig-kid.json.bad'); // a valid profile is never quarantined
  } finally {
    child.kill('SIGKILL');
  }
});

test('sidecar: a second instance refuses to start (single replica)', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'audit-lock-'));
  const port = 18424;
  const first = await startSidecar(dir, port);
  try {
    const second = spawn(process.execPath, [SIDECAR], {
      env: { ...process.env, SYNC_DIR: dir, SYNC_KEY: KEY, PORT: String(port + 1), SYNC_ALLOW_ANONYMOUS: '' },
      stdio: 'ignore',
    });
    const code = await new Promise((res) => second.on('exit', res));
    expect(code).toBe(1); // refused rather than sweeping a live instance's tmp files
  } finally {
    first.kill('SIGKILL');
  }
});

test('e2e: a meta conflict is surfaced with BOTH values and resolvable', async ({ page }) => {
  const { newProfile: np } = await import('../src/data/schema.js');
  const doc = np('ConflictKid');
  doc.id = 'mc-kid';
  await page.goto('/', { waitUntil: 'networkidle' });
  // fallback and IDB disagree at the SAME change-sequence (the corruption
  // case the plan said must never be auto-resolved)
  await page.evaluate(async (d) => {
    localStorage.setItem('compounded:meta:soundEnabled', JSON.stringify({ __seq: 7, at: 1, v: false }));
    const db = await new Promise((res) => { const r = indexedDB.open('compounded', 1); r.onupgradeneeded = () => { const x = r.result; if (!x.objectStoreNames.contains('profiles')) x.createObjectStore('profiles', { keyPath: 'id' }); if (!x.objectStoreNames.contains('meta')) x.createObjectStore('meta'); }; r.onsuccess = () => res(r.result); });
    await new Promise((res) => {
      const tx = db.transaction(['profiles', 'meta'], 'readwrite');
      tx.objectStore('profiles').put(d);
      tx.objectStore('meta').put({ __seq: 7, at: 2, v: true }, 'soundEnabled');
      tx.oncomplete = res;
    });
  }, doc);
  await page.reload({ waitUntil: 'networkidle' });
  await selectProfile(page, doc.name);
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await page.waitForSelector('[data-mc-row="soundEnabled"]');
  await expect(page.locator('[data-mc-keep="soundEnabled"]')).toBeVisible();
  await expect(page.locator('[data-mc-other="soundEnabled"]')).toBeVisible(); // losing value preserved
  await page.tap('[data-mc-other="soundEnabled"]');
  await expect(page.locator('[data-mc-row="soundEnabled"]')).toHaveCount(0);
});
