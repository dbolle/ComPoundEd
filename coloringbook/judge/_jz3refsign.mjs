// C2, THE OTHER HALF — WHAT SIGN THE REAL COINS HAVE.
//
// `_jz1hairtone.mjs` says how LOUD each branch of `hairFill` is. It cannot say
// which one is RIGHT, and §0 is explicit that the test is transfer to real
// currency, not internal consistency. So: on real photographs, is the hair mass
// brighter or darker than the cheek?
//
// NOTHING HERE IS PLACED BY THIS ROUND. Every patch comes from the FROZEN,
// audited tone-patch sets four earlier rounds wrote and refused to overwrite —
// `coloringbook/_tonepatches.json` (dime), `-nickel`, `-penny`, `-quarter` —
// in disc-normalised (u, v, r), with `cheek` as the declared normaliser in all
// four. This instrument only reads them and divides.
//
// WHY THE CHEEK IS THE NORMALISER AND NOT AN ABSOLUTE LEVEL. A photograph
// records the lighting, not the die. The cheek is the largest open plane on
// every one of these four portraits, so hair/cheek is a statement about the
// RELIEF that survives a change of lamp; an absolute luminance is not. This is
// the same normalisation `_jq3tone.mjs`, `_jn6*` and `_do8mean.mjs` already use,
// so the numbers below are comparable with the ones already published.
//
// WHAT IT CANNOT DO, stated before any number:
//   * Patch coordinates are a DISC fit — centre and scale, no rotation. Applied
//     to a photograph other than the one they were placed on, a rotated coin
//     puts every patch in the wrong place. The frame photograph (the one named
//     in `placedOn`, where placement was audited by eye against the silhouette)
//     is the primary read; the others are corroboration and are labelled.
//   * PROOFS ARE PHOTOMETRIC OUTLIERS. A cameo proof has a mirror field and a
//     frosted device, so device-over-field is meaningless on one — but
//     hair-over-CHEEK is device-over-device and survives. They are included and
//     flagged, never silently mixed.
//   * The nickel set names three references it EXCLUDES by name (a proof, an
//     ambiguous disc fit, and a plaster model that is a shape target and must
//     never be a tone target). Those exclusions are honoured here.
//
// Run: node coloringbook/judge/_jz3refsign.mjs
import sharp from 'sharp';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, REF } from './_paths.mjs';
import { discOf } from './_jq42indep.mjs';

// Which patches are the hair mass, per set. Names are the sets' own.
const SETS = {
  penny: {
    file: '_tonepatches-penny.json',
    hair: ['hairCrown', 'hairMid', 'hairBack', 'hairOverEar'],
    frame: 'penny-obv-3.jpg',
    photos: ['penny-obv-3.jpg', 'penny-obv.jpg', 'penny-obv-2.jpg', 'penny-obv-4.png'],
  },
  nickel: {
    file: '_tonepatches-nickel.json',
    hair: ['hairFront', 'hairCrown', 'hairMid', 'hairBack'],
    frame: 'nickel-obv-unc2004.jpg',
    // nickel-obv.jpg is the SAME photograph as the frame at another resolution
    // (the set says so); nickel-obv-5.JPG is the one genuinely independent
    // struck reference this face has. -3/-4/-proof are excluded by the set.
    photos: ['nickel-obv-unc2004.jpg', 'nickel-obv-5.JPG'],
  },
  dime: {
    file: '_tonepatches.json',
    hair: ['hairTop', 'hairBack', 'hairOverEar', 'hairFront'],
    frame: 'dime-obv-2.jpg',
    photos: ['dime-obv-2.jpg', 'dime-obv-3.jpg', 'dime-obv-4.jpg'],
  },
  quarter: {
    file: '_tonepatches-quarter.json',
    hair: ['wigCrown', 'wigMid', 'wigBack'],
    frame: 'quarter-obv-2.jpg',
    photos: ['quarter-obv-2.jpg', 'quarter-obv.jpg', 'quarter-obv-4.jpg'],
  },
};

const PRE = join(ROOT, 'coloringbook');
for (const s of Object.values(SETS)) {
  if (!existsSync(join(PRE, s.file))) {
    console.error(`_jz3 cannot run: ${s.file} is not in this checkout.`);
    console.error('  The frozen tone-patch sets live under coloringbook/, which .gitignore keeps');
    console.error('  out of the repository (only the eight eval modules are un-ignored). Copy them');
    console.error('  in from a checkout that has them, or re-derive with the _*freezetone.mjs pair.');
    process.exit(2);
  }
}

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[s.length >> 1] : NaN; };

const cache = new Map();
async function greyOf(f) {
  if (!cache.has(f)) {
    const { data, info } = await sharp(join(REF, f)).greyscale().raw().toBuffer({ resolveWithObject: true });
    cache.set(f, { g: data, w: info.width, h: info.height });
  }
  return cache.get(f);
}

// median grey inside a disc-normalised patch
function patchMedian(img, d, p) {
  const cx = d.cx + p.u * d.R, cy = d.cy + p.v * d.R, rr = p.r * d.R;
  const vals = [];
  for (let y = Math.floor(cy - rr); y <= Math.ceil(cy + rr); y++) {
    for (let x = Math.floor(cx - rr); x <= Math.ceil(cx + rr); x++) {
      if (x < 0 || y < 0 || x >= img.w || y >= img.h) continue;
      if ((x - cx) ** 2 + (y - cy) ** 2 > rr * rr) continue;
      vals.push(img.g[y * img.w + x]);
    }
  }
  return { m: median(vals), n: vals.length };
}

console.log('C2 — the sign the REAL coins have: hair mass over cheek, on photographs.');
console.log('');
console.log('Patch positions are the FROZEN sets from earlier rounds; nothing is placed here.');
console.log('Ratio > 1.00 means the hair is BRIGHTER than the cheek on that photograph, which');
console.log('is what `hairLit: true` draws. < 1.00 means darker, which is what `hairLit` off draws.');
console.log('');

const verdicts = [];
for (const [id, S] of Object.entries(SETS)) {
  const set = JSON.parse(readFileSync(join(PRE, S.file), 'utf8'));
  const byName = Object.fromEntries(set.patches.map((p) => [p.name, p]));
  const missing = [...S.hair, 'cheek'].filter((n) => !byName[n]);
  if (missing.length) throw new Error(`_jz3: ${S.file} has no patch named ${missing.join(', ')}`);
  console.log(`\n=== ${id} — hair patches ${S.hair.join(', ')} over cheek ===`);
  console.log(`    photograph                          cheek   ${S.hair.map((n) => n.padStart(10)).join(' ')}    hair/cheek`);
  const ratios = [];
  for (const f of S.photos) {
    if (!existsSync(join(REF, f))) { console.log(`    ${f.padEnd(34)}  ABSENT`); continue; }
    const img = await greyOf(f);
    const d = await discOf(f);
    const ch = patchMedian(img, d, byName.cheek);
    const hs = S.hair.map((n) => patchMedian(img, d, byName[n]));
    const rs = hs.map((h) => h.m / ch.m);
    const agg = median(rs);
    const tag = f === S.frame ? ' FRAME' : '';
    console.log(`    ${f.padEnd(34)} ${ch.m.toFixed(1).padStart(6)}   ` +
      hs.map((h, i) => `${h.m.toFixed(0).padStart(4)}/${rs[i].toFixed(2)}`.padStart(10)).join(' ') +
      `    ${agg.toFixed(3).padStart(6)}${tag}`);
    ratios.push({ f, agg, frame: f === S.frame, rs });
  }
  const frame = ratios.find((r) => r.frame);
  const all = ratios.map((r) => r.agg);
  const allUp = all.every((v) => v > 1), allDown = all.every((v) => v < 1);
  const v = { id, frame: frame ? frame.agg : NaN, min: Math.min(...all), max: Math.max(...all), unanimous: allUp ? 'BRIGHTER' : allDown ? 'DARKER' : 'SPLIT' };
  verdicts.push(v);
  console.log(`    -> frame ${v.frame.toFixed(3)}, range ${v.min.toFixed(3)}-${v.max.toFixed(3)}, ${v.unanimous}`);
}

// OVERLAY — the placement audit. A patch coordinate applied to a photograph it
// was not placed on can land on the field and still return a plausible number,
// which is exactly the class of error this project keeps finding by looking.
// `--overlay` draws every sampled patch on every photograph so it can be
// checked by eye before any of the numbers above is believed.
if (process.argv.includes('--overlay')) {
  const { mkdirSync } = await import('node:fs');
  const OUT = join((await import('./_paths.mjs')).SCRATCH, '_jz1');
  mkdirSync(OUT, { recursive: true });
  for (const [id, S] of Object.entries(SETS)) {
    const set = JSON.parse(readFileSync(join(PRE, S.file), 'utf8'));
    const byName = Object.fromEntries(set.patches.map((p) => [p.name, p]));
    for (const f of S.photos) {
      if (!existsSync(join(REF, f))) continue;
      const img = await greyOf(f);
      const d = await discOf(f);
      const K = 900 / (2 * d.R);
      const circ = (n, col) => {
        const p = byName[n];
        return `<circle cx="${((d.cx + p.u * d.R) - (d.cx - d.R)) * K}" cy="${((d.cy + p.v * d.R) - (d.cy - d.R)) * K}" r="${p.r * d.R * K}" fill="none" stroke="${col}" stroke-width="3"/>` +
          `<text x="${((d.cx + p.u * d.R) - (d.cx - d.R)) * K + p.r * d.R * K + 4}" y="${((d.cy + p.v * d.R) - (d.cy - d.R)) * K}" font-family="monospace" font-size="18" fill="${col}">${n}</text>`;
      };
      const marks = S.hair.map((n) => circ(n, '#ff2d2d')).join('') + circ('cheek', '#00b0ff');
      const L = Math.round(Math.max(0, d.cx - d.R)), T = Math.round(Math.max(0, d.cy - d.R));
      const W = Math.round(Math.min(2 * d.R, img.w - L)), H = Math.round(Math.min(2 * d.R, img.h - T));
      const base = await sharp(join(REF, f)).extract({ left: L, top: T, width: W, height: H }).resize(900, 900, { fit: 'fill' }).png().toBuffer();
      await sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900">${marks}</svg>`) }])
        .png().toFile(join(OUT, `_jz3-patches-${id}-${f.replace(/[^\w]/g, '_')}.png`));
    }
  }
  console.log('\noverlays written to', OUT);
}

console.log('\n\nVERDICT — what the photographs say the sign should be');
console.log('  coin      frame   range           photographs say   coins.js draws   agree?');
const SHIPPED = { penny: 'DARKER', nickel: 'BRIGHTER', dime: 'BRIGHTER', quarter: 'BRIGHTER' };
for (const v of verdicts) {
  const want = v.unanimous === 'BRIGHTER' ? 'BRIGHTER' : v.unanimous === 'DARKER' ? 'DARKER' : 'SPLIT';
  console.log(`  ${v.id.padEnd(8)} ${v.frame.toFixed(3)}   ${v.min.toFixed(3)}-${v.max.toFixed(3)}   ${want.padStart(15)}   ${SHIPPED[v.id].padStart(14)}   ${want === SHIPPED[v.id] ? 'yes' : want === 'SPLIT' ? 'undetermined' : 'NO'}`);
}
