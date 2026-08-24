// DIME r0 — D1 RESPONSE TEST (§4). Shift OBVERSE.dime.cx by +1 viewBox unit in
// a GENERATED COPY of coins.js and re-run `_p2iou.mjs`'s own computation; the
// IoU against the frozen mask must fall by 0.01-0.05. src/art/coins.js is not
// touched (§1).
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
const ROOT = new URL('../../', import.meta.url).pathname;
const G = 1024;
const poly = JSON.parse(readFileSync(ROOT + 'coloringbook/_headmask.json', 'utf8')).polygon;
const d = poly.map(([u, v], i) => `${i ? 'L' : 'M'} ${(50 + 47 * u).toFixed(3)} ${(50 + 47 * v).toFixed(3)}`).join(' ') + ' Z';
const raster = async (svg) => Uint8Array.from(await sharp(Buffer.from(svg)).flatten({ background: '#000' }).greyscale().raw().toBuffer(), (v) => (v >= 128 ? 1 : 0));
const ref = await raster(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${G}" height="${G}"><path d="${d}" fill="#fff"/></svg>`);
const iou = (a, b) => { let i = 0, u = 0; for (let k = 0; k < a.length; k++) { if (a[k] & b[k]) i++; if (a[k] | b[k]) u++; } return i / u; };
async function score(srcPath) {
  const mod = await import(`file://${srcPath}?t=${Math.random()}`);
  const svg = mod.coinSVG('dime', 600, { side: 'obverse' });
  const g = svg.match(/transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\)">/);
  const hd = svg.slice(g.index + g[0].length).match(/<path d="([^"]+)"/)[1];
  return iou(await raster(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${G}" height="${G}"><g transform="translate(${g[1]} ${g[2]}) scale(${g[3]} ${g[4]})"><path d="${hd}" fill="#fff"/></g></svg>`), ref);
}
// ── THE ANCHOR WENT STALE AND THE TEST STOPPED RUNNING (ledger A30).
//
// This file was written at dime round 0 against
//   `s: 0.97, cy: 45.3, cx: -2.7, iconS: 0.97, iconCy: 45.3, iconCx: -2.7,`
// which was the live text then. v1.93.0 removed `iconS / iconCy / iconCx`, so
// from that release the anchor matched nothing. The guard below DID fire — it
// is not a fail-open — but the effect is the same defect by another route:
// **D1's response test has not run since v1.93.0, and D1 verdicts kept
// shipping.** An instrument nobody executes is indistinguishable from one that
// passes. That is why the check now lives in `tests/judge-anchors.spec.js`,
// which runs in `npm test`, instead of waiting for someone to run this file.
//
// The three defences added here, so this cannot recur silently:
//   1. the anchor must occur EXACTLY ONCE (a second occurrence would perturb
//      two coins and the number would be a blend of both);
//   2. the rewritten source must actually DIFFER from the original, and the
//      module it produces must emit a DIFFERENT SVG — the substitution has to
//      be shown to reach the render, not merely to have matched;
//   3. a NULL TEST: the same machinery run with a no-op substitution must give
//      a fall of exactly 0. A response test that "moves" under a no-op is
//      measuring rebuild noise, and would report PASS for any edit at all.
const COINS = ROOT + 'src/art/coins.js';
const base = await score(COINS);
const txt = readFileSync(COINS, 'utf8');
const anchor = 's: 0.97, cy: 45.3, cx: -2.7,';
const hits = txt.split(anchor).length - 1;
if (hits !== 1) {
  console.log(`RESPONSE anchor occurs ${hits} times in src/art/coins.js, expected exactly 1.`);
  console.log('  D1 is UNVERIFIED until this test is re-anchored — do not quote a D1 verdict.');
  process.exit(1);
}
const MONEY = "from '../engine/money.js'";
const dir = mkdtempSync(join(tmpdir(), 'jd1-'));

// Build a perturbed copy of coins.js and PROVE the perturbation landed.
function variant(from, to, label) {
  const swapped = txt.replace(from, to);
  if ((from !== to) && swapped === txt) throw new Error(`${label}: the substitution did not change the source`);
  if ((from === to) && swapped !== txt) throw new Error(`${label}: a no-op substitution changed the source`);
  if (txt.split(MONEY).length - 1 !== 1) throw new Error('money.js import anchor is not unique — the generated copy would not resolve');
  const out = swapped.replace(MONEY, `from '${ROOT}src/engine/money.js'`);
  const p = join(dir, `coins-${label}.js`);
  writeFileSync(p, out);
  return p;
}

// NULL TEST FIRST — the same path, with nothing changed. Must be a flat 0.
const nullPath = variant(anchor, anchor, 'null');
const nulled = await score(nullPath);
console.log('NULL TEST: identical substitution through the same generate-and-rerender path');
console.log(`  IoU ${base.toFixed(5)} -> ${nulled.toFixed(5)}   fall ${(base - nulled).toFixed(5)}   ${Math.abs(base - nulled) < 1e-12 ? 'PASS (exactly zero — the rig adds no motion of its own)' : 'FAIL — the rig moves the number without an edit; every response number below is noise'}`);
if (Math.abs(base - nulled) >= 1e-12) process.exit(1);

const movedPath = variant(anchor, 's: 0.97, cy: 45.3, cx: -1.7,', 'cx+1');
// The substitution must reach the RENDER, not merely the text.
const svgBase = (await import(`file://${COINS}?t=${Math.random()}`)).coinSVG('dime', 600, { side: 'obverse' });
const svgMoved = (await import(`file://${movedPath}?t=${Math.random()}`)).coinSVG('dime', 600, { side: 'obverse' });
if (svgBase === svgMoved) { console.log('RESPONSE FAILED: the edited source emits a byte-identical SVG — the perturbation never reached the drawing.'); process.exit(1); }

const moved = await score(movedPath);
console.log(`\nD1 RESPONSE TEST: OBVERSE.dime.cx -2.7 -> -1.7 (+1 unit)`);
console.log(`  substitution reached the render: SVG differs (${svgBase.length} -> ${svgMoved.length} bytes)`);
console.log(`  IoU vs _headmask.json: ${base.toFixed(5)} -> ${moved.toFixed(5)}   fall ${(base - moved).toFixed(5)}`);
console.log(`  gate: falls by 0.01-0.05.  ${(base - moved) >= 0.01 && (base - moved) <= 0.05 ? 'PASS' : 'OUT OF THE EXPECTED BAND — reported, not hidden'}`);

// §1 / WRITERS.md: running this must leave the repository byte-identical.
if (readFileSync(COINS, 'utf8') !== txt) throw new Error('src/art/coins.js was modified — an instrument reports, it does not write');
console.log('  src/art/coins.js unchanged on disk (all editing happened in a temp copy).');
