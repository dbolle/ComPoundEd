// SPECIALIST (buck obverse) — the D12 artefact: control, before, after,
// and the reference, all at the sizes the app actually draws.
//
// The CONTROL is rendered FIRST and into its own file (§3 D12, Q5, R6): the
// quarter obverse, which this round did not touch. It is a stronger control
// than an eye, because `_sw9ident.mjs` proves 0 of its 12 renders changed.
//
// BEFORE is materialised from the dispatch commit into a temp dir and
// imported from there — NOT symlinked, because a symlinked .mjs resolves its
// relative imports against the main checkout and would render another tree.
//
//   node coloringbook/judge/_swCd12.mjs <baseCommit>
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const BASE = process.argv[2] || 'd2353ca';
const SIZES = [26, 38, 48, 54, 84, 190];

const tmp = mkdtempSync(join(tmpdir(), 'swC-'));
cpSync(join(ROOT, 'src'), join(tmp, 'src'), { recursive: true });
for (const f of ['coins.js', 'pawcoins.js']) {
  writeFileSync(join(tmp, 'src', 'art', f), execFileSync('git', ['show', `${BASE}:src/art/${f}`], { cwd: ROOT, maxBuffer: 1 << 28 }));
}
const before = await import(pathToFileURL(join(tmp, 'src', 'art', 'coins.js')).href);
const after = await import(pathToFileURL(join(ROOT, 'src/art/coins.js')).href);

async function tile(mod, id, side, size, target = 300) {
  const box = mod.coinPx(id, size);
  const w = Math.round(box.w), h = Math.round(box.h);
  const svg = mod.coinSVG(id, size, { side });
  if (/undefined|NaN/.test(svg)) throw new Error(`${id}/${side}/${size}: undefined/NaN`);
  const png = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).resize(w, h, { fit: 'fill' }).png().toBuffer();
  const k = Math.max(1, Math.round(target / w));
  return { buf: await sharp(png).resize(w * k, h * k, { kernel: 'nearest' }).png().toBuffer(), w: w * k, h: h * k,
    label: `${size} -> ${w}x${h}px  x${k}` };
}

async function sheet(rows, out, caption) {
  const W = Math.max(...rows.map((r) => r.tiles.reduce((s, t) => s + t.w + 12, 150)));
  let y = 44; const comp = []; let labels = '';
  for (const r of rows) {
    let x = 150; const hh = Math.max(...r.tiles.map((t) => t.h));
    labels += `<text x="10" y="${y + hh / 2}" fill="#ffe000" font-size="17" font-family="monospace">${r.name}</text>`;
    for (const t of r.tiles) {
      comp.push({ input: t.buf, left: x, top: y });
      labels += `<text x="${x}" y="${y + hh + 15}" fill="#9ad" font-size="13" font-family="monospace">${t.label}</text>`;
      x += t.w + 12;
    }
    y += hh + 42;
  }
  const H = y + 8;
  labels = `<text x="10" y="26" fill="#fff" font-size="17" font-family="monospace">${caption}</text>` + labels;
  const base = await sharp({ create: { width: W, height: H, channels: 3, background: '#101010' } }).png().toBuffer();
  await sharp(base).composite([...comp, { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${labels}</svg>`), top: 0, left: 0 }]).png().toFile(out);
  console.log(out);
}

// CONTROL FIRST, and into its own file.
await sheet([
  { name: 'quarter obv BEFORE', tiles: await Promise.all(SIZES.map((s) => tile(before, 'quarter', 'obverse', s, 240))) },
  { name: 'quarter obv AFTER ', tiles: await Promise.all(SIZES.map((s) => tile(after, 'quarter', 'obverse', s, 240))) },
], 'coloringbook/judge/_swout/_swC-control.png',
`CONTROL — the quarter obverse, untouched. _sw9ident.mjs: 0 of 12 renders changed. base ${BASE}`);

await sheet([
  { name: 'buck obv BEFORE', tiles: await Promise.all(SIZES.map((s) => tile(before, 'buck', 'obverse', s, 260))) },
  { name: 'buck obv AFTER ', tiles: await Promise.all(SIZES.map((s) => tile(after, 'buck', 'obverse', s, 260))) },
  { name: 'buck REV (control)', tiles: await Promise.all(SIZES.map((s) => tile(after, 'buck', 'reverse', s, 260))) },
], 'coloringbook/judge/_swout/_swC-buck-obverse.png',
`SUBJECT — buck obverse. The note's REVERSE is a second control: 0 of 12 changed. base ${BASE}`);
