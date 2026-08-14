// DIME r0, TASK 6 — DID THE TONE-BUG FIX ACTUALLY MOVE THE PUBLISHED PHASE-2
// NUMBERS, AND BY HOW MUCH?
//
// `_p2lib.ourRaster` used `sharp.composite()`, which is not tone-preserving; it
// was fixed on 2026-08-13 and `TOOLS.md` records that "the dime's phase-2 /
// phase-2b RATIO VECTORS were measured through this". The dime's published
// conclusions were never re-derived. This does both halves of the check:
//
//   NEW  — `_p2score.mjs` at HEAD, through the FIXED `ourRaster` (hashed).
//   OLD  — the SAME frozen patches, the SAME reference, the SAME normaliser,
//          through a re-implementation of the composite path, so the published
//          0.0443 can be reproduced rather than assumed.
//
// `_p2lib.mjs` is NOT edited (§1). The old path is re-implemented here, and the
// test of the re-implementation is that it reproduces the published number.
//
// §20.1a FLAT-SWATCH ROUND TRIP is run first on both paths: push a flat patch
// of every dime palette colour through each and check the grey that comes back
// is that colour's own. One line, and it is the whole diagnosis.
//
// Run: node coloringbook/judge/_jd8p2old.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { grey, fitDisc, REF, ourRaster, ratioVector, score, loadJSON } from '../_p2lib.mjs';

const PAL = { rim: '#8b939b', body: '#c1c6cc', field: '#cfd5da', motif: '#8e969e',
  deep: '#6b737b', hair: '#777f87', cloth: '#a4acb4', ink: '#242c33' };

// ── §20.1a: flat swatch through both placement paths ───────────────────────
console.log('=== §20.1a flat-swatch round trip, dime palette ===');
console.log('colour     direct  via flatten+extract+extend (FIXED)  via composite (OLD)   old error');
for (const [name, hex] of Object.entries(PAL)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="${hex}"/></svg>`;
  const direct = (await sharp(Buffer.from(svg)).greyscale().raw().toBuffer())[0];
  const fixed = (await sharp(Buffer.from(svg)).flatten({ background: '#000000' })
    .extract({ left: 0, top: 0, width: 60, height: 60 })
    .extend({ top: 10, left: 10, bottom: 10, right: 10, background: '#000000' })
    .greyscale().raw().toBuffer({ resolveWithObject: true })).data[80 * 30 + 30];
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const comp = (await sharp({ create: { width: 80, height: 80, channels: 3, background: '#000000' } })
    .composite([{ input: png, left: 10, top: 10 }]).greyscale().raw().toBuffer({ resolveWithObject: true })).data[80 * 30 + 30];
  console.log(`${name.padEnd(9)} ${String(direct).padStart(6)} ${String(fixed).padStart(34)} ${String(comp).padStart(20)} ${String(comp - direct).padStart(11)}`);
}

// ── the two ratio vectors ──────────────────────────────────────────────────
const mod = await import('../../src/art/coins.js');
const patches = loadJSON(new URL('../_tonepatches.json', import.meta.url).pathname).patches;
const refG = await grey(REF);
const disc = fitDisc(refG);
const ref = ratioVector(refG, disc, patches);

async function oldRaster(coinSVG, d, frameW, frameH) {
  const OURW = Math.round(100 * d.R / 47);
  let svg = coinSVG('dime', 600, { side: 'obverse' });
  svg = svg.replace(/ width="[0-9.]+" height="[0-9.]+"/, ` width="${OURW}" height="${OURW}"`);
  // Same PLACEMENT arithmetic as the fixed path (so only the tone path differs),
  // finished with sharp.composite() onto a black canvas — the operation
  // `_p2lib.mjs`'s own comment names as the bug. `coloringbook/` is not tracked,
  // so the original line cannot be recovered from git; the test that this
  // reproduces it is that it reproduces the PUBLISHED number.
  const left = Math.round(d.cx - OURW / 2), top = Math.round(d.cy - OURW / 2);
  const sx = Math.max(0, -left), sy = Math.max(0, -top);
  const w = Math.min(OURW - sx, frameW - Math.max(0, left));
  const h = Math.min(OURW - sy, frameH - Math.max(0, top));
  const dx = Math.max(0, left), dy = Math.max(0, top);
  const png = await sharp(Buffer.from(svg)).extract({ left: sx, top: sy, width: w, height: h }).png().toBuffer();
  const out = await sharp({ create: { width: frameW, height: frameH, channels: 3, background: '#000000' } })
    .composite([{ input: png, left: dx, top: dy }])
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: out.data, w: out.info.width, h: out.info.height };
}

const newG = await ourRaster(mod.coinSVG, disc, refG.w, refG.h);
const oldG = await oldRaster(mod.coinSVG, disc, refG.w, refG.h);
const nOur = ratioVector(newG, disc, patches);
const oOur = ratioVector(oldG, disc, patches);

console.log('\n=== the dime phase-2 ratio vector, OLD vs NEW, same art, same patches ===');
console.log('patch          ref rat   OLD our rat  NEW our rat   OLD |d|   NEW |d|   move');
let sO = 0, sN = 0, n = 0, worstO = 0, worstN = 0, wN = '';
for (const p of patches) {
  if (p.name === 'cheek') continue;
  const dO = Math.abs(oOur.rat[p.name] - ref.rat[p.name]);
  const dN = Math.abs(nOur.rat[p.name] - ref.rat[p.name]);
  sO += dO; sN += dN; n++;
  if (dO > worstO) worstO = dO;
  if (dN > worstN) { worstN = dN; wN = p.name; }
  console.log(`${p.name.padEnd(14)} ${ref.rat[p.name].toFixed(3).padStart(7)} ${oOur.rat[p.name].toFixed(3).padStart(12)} ${nOur.rat[p.name].toFixed(3).padStart(12)} ${dO.toFixed(4).padStart(9)} ${dN.toFixed(4).padStart(9)} ${(dN - dO >= 0 ? '+' : '') + (dN - dO).toFixed(4)}`);
}
console.log(`\nmean |Dratio| : OLD ${(sO / n).toFixed(4)}   NEW ${(sN / n).toFixed(4)}   change ${((sN - sO) / (sO || 1) * 100).toFixed(1)}%`);
console.log(`worst         : OLD ${worstO.toFixed(4)}   NEW ${worstN.toFixed(4)} (${wN})`);
const pub = JSON.parse(readFileSync(new URL('../_p2res-FINAL-p2b.json', import.meta.url).pathname, 'utf8'));
console.log(`PUBLISHED (_p2res-FINAL-p2b.json, phase 2b): mean ${pub.mean.toFixed(4)} worst ${pub.worst.toFixed(4)} (${pub.worstName})`);
console.log(`OLD-path reproduction of the published number: ${Math.abs(sO / n - pub.mean) < 0.0005 ? 'REPRODUCED to 5e-4 — the published vector WAS measured through the composite path' : `DOES NOT reproduce (${(sO / n).toFixed(4)} vs ${pub.mean.toFixed(4)})`}`);
