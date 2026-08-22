// _jn15ours — the SAME structure tensor as _jn15strand.mjs, run on OUR OWN
// render of the nickel obverse, so that "which way do our ridges run" and
// "which way do the coin's strands run" are the SAME measurement on the same
// grid and may legitimately be subtracted (brief-common standing rule 1).
//
// The render is rasterised at 1400 px, which puts 13.30 px on a local unit
// against nickel-obv-unc2004.jpg's 14.19 — the two are within 7%, so the
// tensor sees comparable spatial frequencies on both sides.
//
// A revision is pinned by PATH and its sha256 is printed, as every before/after
// artefact in this process must be.
//
// Run: node coloringbook/judge/_jn15ours.mjs <coins.js> [tag]
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { dHair, dOutline } from './_jn15locus.mjs';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const [, , SRC = new URL('../../src/art/coins.js', import.meta.url).pathname, TAG = 'ours'] = process.argv;
const CFLOOR = 0.15;
const R_LOCAL = +(process.env.RAD || 3.0);
const PX = 1400;
const FRAME = { CX: -6.4, CY: 43.7, s: 0.95, dir: -1 }; // OBVERSE.nickel, full tier

// the same frozen, target-derived screens _jn15strand.mjs uses
const distToHairline = dHair;

async function load(p) {
  const raw = readFileSync(p, 'utf8');
  const MONEY = new URL('../../src/engine/money.js', import.meta.url).pathname;
  if (!raw.includes("from '../engine/money.js'")) return import(p);
  const f = join(mkdtempSync(join(tmpdir(), 'jn15-')), 'coins.js');
  writeFileSync(f, raw.split("from '../engine/money.js'").join(`from '${MONEY}'`));
  return import(f);
}
const mod = await load(SRC);
console.log(`ours ${SRC}  sha256:${createHash('sha256').update(readFileSync(SRC)).digest('hex').slice(0, 16)}`);

const svg = mod.coinSVG('nickel', PX, { side: 'obverse' });
const { data, info } = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
  .greyscale().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const K = W / 100; // px per viewBox unit
const ppl = K * FRAME.s;
const at = (x, y) => data[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))];
const P = (lx, ly) => [K * (50 + FRAME.CX + FRAME.dir * FRAME.s * lx), K * (FRAME.CY + FRAME.s * ly)];

const GRID = [];
for (let x = 0; x >= -32; x -= 4) for (let y = -26; y <= 10; y += 4) GRID.push([x, y]);
const fold = (d) => { let a = d; while (a <= -90) a += 180; while (a > 90) a -= 180; return a; };

console.log(`render ${W}x${H}   ${ppl.toFixed(2)} px/local   disc r ${R_LOCAL} local   coherence floor ${CFLOOR}`);
console.log('     lx    ly   |  local angle  |  coherence  | d(hair) d(edge)');
const out = {};
for (const [lx, ly] of GRID) {
  const st = 0.5;
  let Jxx = 0, Jyy = 0, Jxy = 0, n = 0;
  const N = Math.round(R_LOCAL / st);
  const val = (u, v) => { const p = P(lx + u, ly + v); return at(Math.round(p[0]), Math.round(p[1])); };
  for (let i = -N; i <= N; i++) for (let j = -N; j <= N; j++) {
    const u = i * st, v = j * st;
    if (u * u + v * v > R_LOCAL * R_LOCAL) continue;
    const gx = (val(u + st, v) - val(u - st, v)) / (2 * st);
    const gy = (val(u, v + st) - val(u, v - st)) / (2 * st);
    Jxx += gx * gx; Jyy += gy * gy; Jxy += gx * gy; n++;
  }
  Jxx /= n; Jyy /= n; Jxy /= n;
  const tr = Jxx + Jyy, det = Jxx * Jyy - Jxy * Jxy;
  const disc = Math.sqrt(Math.max(0, tr * tr / 4 - det));
  const l1 = tr / 2 + disc, l2 = tr / 2 - disc;
  const C = l1 + l2 > 0 ? (l1 - l2) / (l1 + l2) : 0;
  let ang = Math.abs(Jxy) > 1e-9 ? Math.atan2(l2 - Jxx, Jxy) * 180 / Math.PI : (Jxx <= Jyy ? 0 : 90);
  ang = fold(ang);
  const dh = distToHairline(lx, ly);
  const dO = dOutline(lx, ly);
  const bad = dh < R_LOCAL || dO < R_LOCAL;
  if (!bad && C >= CFLOOR) out[`${lx},${ly}`] = ang;
  console.log(`  ${String(lx).padStart(5)} ${String(ly).padStart(5)}   |  ${(bad || C < CFLOOR ? '   --' : ang.toFixed(1).padStart(6))} deg   |   ${C.toFixed(3)}     | ${dh.toFixed(1).padStart(5)} ${dO.toFixed(1).padStart(5)}${dh < R_LOCAL ? '  CONTAMINATED by the hairline' : dO < R_LOCAL ? '  CONTAMINATED by the silhouette edge' : C < CFLOOR ? '  NO-ORIENTATION (flat: no line work here)' : ''}`);
}
writeFileSync(HERE(`_jn15ours-${TAG}.json`), JSON.stringify(out, null, 1));
console.log(`-> _jn15ours-${TAG}.json`);
