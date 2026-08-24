// T1'S REFERENCE POOL, AUDITED — every file, every within-group pair, with a
// duplicate check that CANNOT be defeated by a registration disagreement.
//
// WHY THIS EXISTS. The findings ledger records A2 and A3: T1's dime-reverse
// pool lists `dime-rev.jpg` AND `dime-rev-2.jpg`, which are one photograph, so
// every dime-reverse T1 figure published as n=3 was n=2; and
// `dime-rev-proofbright.png` — the best shape reference on that face — is not
// in the pool at all. Both were found by ACCIDENT, during work on something
// else. Nothing had ever swept the pool.
//
// THE DUPLICATE CHECK MUST NOT USE A DISC FIT. `_jrefintake.mjs`'s header
// records why: the pool's duplicate detector once compared two BYTE-IDENTICAL
// files and printed `raw 0.3726 INDEPENDENT`, because the two disc fits
// disagreed by 4.0 % of R and the images were therefore correlated
// misregistered. A registration-defeated duplicate detector is worse than
// none, because it certifies the duplicate. So the primary evidence here is
// four statistics that never fit anything:
//
//   sha256      exact bytes. Free, decisive, and the check that was skipped.
//   MADframe    64x64 fill-resized, greyscale, normalised, mean |difference|.
//               `_jrefintake.mjs`'s own statistic, reproduced unchanged so a
//               number here is comparable with a number it printed.
//   MADbox      the same, but each image is first cropped to its CONTENT BOX
//               (border-median background, |grey - bg| > 25), which makes it
//               tolerant of crop and of empty margin. MADframe alone calls two
//               crops of one photograph different; MADbox does not. The box is
//               a bounding box, not a fit: it has no centre, no radius and no
//               shape assumption, so it works on a rectangle too.
//   dHam        64-bit difference hash on the content box, Hamming distance.
//               A hash of the SIGN of horizontal gradient, so exposure, white
//               point and JPEG level cannot move it. Independent of MADbox in
//               kind: MADbox is a magnitude, dHam is a sign pattern.
//
// Two statistics of different kinds agreeing is the point. A pair that is near
// zero on MADbox and near zero on dHam is one image; the ledger's A2 pair is
// exactly that, and so is every other pair this sweep found.
//
// SECOND QUESTION, and it does need registration: same photograph vs same
// design vs DIFFERENT DESIGN. `quarter-rev-6.jpg` is a Nebraska state quarter
// and `quarter-obv-4.jpg` is the 1999+ obverse — those are not duplicates, they
// are wrong coins, and no registration-free statistic can tell you that. So the
// registered design-NCC of `_jq20indep.mjs` is reported BESIDE the free ones,
// clearly labelled, and is never the duplicate evidence.
//
// THIRD QUESTION: what is in `coloringbook/ref/` for a face that T1 does not
// use? A3 is that question, and it had never been asked either.
//
// REPORTS ONLY. Writes nothing (WRITERS.md).
//
// Run: node coloringbook/judge/_jt4pool.mjs            (the whole sweep)
//      node coloringbook/judge/_jt4pool.mjs dime rev   (one group)
import sharp from 'sharp';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { REF } from './_paths.mjs';
import { POOL_BY_SIDE } from './_jt1transfer.mjs';

// The disc fitter `discOf()` falls back to, used here ONLY to report whether the
// design column's registration can be trusted. Gitignored, like the rest of the
// `energyGrid` chain this file already depends on for that column; absent is
// handled rather than fatal.
const rvCache = new Map();
async function rvfit(f) {
  if (!rvCache.has(f)) {
    let r = null;
    try { const { fit } = await import('../_rvdisc.mjs'); r = await fit(f); } catch { r = null; }
    rvCache.set(f, r);
  }
  return rvCache.get(f);
}

const IMG = /\.(jpe?g|png|webp)$/i;

// ── which face is a file a reference FOR?
//
// Derived from the filename, then every unmatched file is printed under
// UNCLASSIFIED so nothing is silently dropped — the failure mode of a
// hand-written list is the file nobody added to it.
//
// `pair` files show both faces side by side and cannot be registered as either;
// they are named, excluded, and the exclusion is printed.
const PAIR = /(-pair|proof-?both|^quarter-1995d|^_jn-proofboth)/i;
const DEN = [
  [/^penny|^cent/i, 'penny'], [/^nickel/i, 'nickel'], [/^dime/i, 'dime'],
  [/^quarter|^q(p19|cand|gimg|1995)/i, 'quarter'], [/^bill|^buck|^note/i, 'buck'],
];
function classify(f) {
  if (PAIR.test(f)) return { den: null, side: null, why: 'both faces in one image' };
  const d = DEN.find(([re]) => re.test(f));
  if (!d) return { den: null, side: null, why: 'filename matches no denomination' };
  const side = /(^|[-_])(rev)/i.test(f) ? 'reverse' : /(^|[-_])(obv)/i.test(f) ? 'obverse' : null;
  if (!side) return { den: d[1], side: null, why: 'filename names no face' };
  return { den: d[1], side };
}

// ── registration-free descriptors
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

/** intake's statistic, unchanged: 64x64 fill over the WHOLE frame. */
async function thumbFrame(p) {
  const { data } = await sharp(p).flatten({ background: '#808080' }).greyscale()
    .resize(64, 64, { fit: 'fill' }).normalise().raw().toBuffer({ resolveWithObject: true });
  return data;
}

/** content box: border-median background, then the bbox of everything unlike it. */
async function contentBox(p) {
  const { data, info } = await sharp(p).flatten({ background: '#808080' }).greyscale()
    .resize(256, 256, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, at = (x, y) => data[y * W + x];
  const b = [];
  for (let x = 0; x < W; x++) b.push(at(x, 0), at(x, H - 1));
  for (let y = 0; y < H; y++) b.push(at(0, y), at(W - 1, y));
  b.sort((u, v) => u - v);
  const bg = b[b.length >> 1];
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (Math.abs(at(x, y) - bg) <= 25) continue;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  if (x1 < 0) return null;                         // nothing separates from bg
  const m = await sharp(p).metadata();
  const left = Math.min(m.width - 1, Math.round(x0 / W * m.width));
  const top = Math.min(m.height - 1, Math.round(y0 / H * m.height));
  return {
    left, top,
    width: Math.max(1, Math.min(m.width - left, Math.round((x1 - x0 + 1) / W * m.width))),
    height: Math.max(1, Math.min(m.height - top, Math.round((y1 - y0 + 1) / H * m.height))),
  };
}

async function thumbBox(p, box) {
  let s = sharp(p).flatten({ background: '#808080' }).greyscale();
  if (box) s = s.extract(box);
  const { data } = await s.resize(64, 64, { fit: 'fill' }).normalise().raw().toBuffer({ resolveWithObject: true });
  return data;
}

const mad = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s / a.length; };
const nccT = (a, b) => {
  let ma = 0, mb = 0; for (let i = 0; i < a.length; i++) { ma += a[i]; mb += b[i]; }
  ma /= a.length; mb /= b.length;
  let sa = 0, sb = 0, sab = 0;
  for (let i = 0; i < a.length; i++) { const u = a[i] - ma, v = b[i] - mb; sa += u * u; sb += v * v; sab += u * v; }
  return sab / Math.sqrt(sa * sb);
};
/** 64-bit dHash: sign of the horizontal gradient on a 9x8 grid of the box. */
async function dhash(p, box) {
  let s = sharp(p).flatten({ background: '#808080' }).greyscale();
  if (box) s = s.extract(box);
  const { data } = await s.resize(9, 8, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  const bits = [];
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits.push(data[y * 9 + x] < data[y * 9 + x + 1] ? 1 : 0);
  return bits;
}
const ham = (a, b) => { let n = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++; return n; };

// ── the run
const only = process.argv[2] ? { den: process.argv[2], side: (process.argv[3] || '').startsWith('rev') ? 'reverse' : 'obverse' } : null;
const files = readdirSync(REF).filter((f) => IMG.test(f)).sort();

const groups = new Map();
const unclassified = [];
for (const f of files) {
  const c = classify(f);
  if (!c.den || !c.side) { unclassified.push([f, c.why]); continue; }
  const k = `${c.den}-${c.side}`;
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(f);
}

console.log(`REFERENCE POOL AUDIT — ${files.length} images in coloringbook/ref/`);
console.log('primary duplicate evidence is REGISTRATION-FREE (no disc fit, no border fit):');
console.log('  MADframe  64x64 fill over the whole frame, normalised, mean |diff|   (intake\'s own statistic)');
console.log('  MADbox    the same after cropping each image to its CONTENT BOX      (crop-tolerant)');
console.log('  dHam      Hamming distance of a 64-bit difference hash of that box   (a sign pattern, not a magnitude)');
console.log('  designNCC registered NCC on blurred gradient energy — NOT duplicate evidence.');
console.log('            It answers "same DESIGN?", which no free statistic can: a state quarter');
console.log('            is not a duplicate, it is the wrong coin.\n');
console.log('calls: SAME IMAGE requires MADbox < 6 AND dHam <= 6 — two statistics of different kinds.');
console.log('       Anything else is reported with its numbers and no call.\n');

// cache
const shaC = new Map(), tfC = new Map(), tbC = new Map(), dhC = new Map(), boxC = new Map();
async function prep(f) {
  const p = join(REF, f);
  if (!shaC.has(f)) {
    shaC.set(f, sha(p));
    const box = await contentBox(p);
    boxC.set(f, box);
    tfC.set(f, await thumbFrame(p));
    tbC.set(f, await thumbBox(p, box));
    dhC.set(f, await dhash(p, box));
  }
}

let energyGrid, discOf, bestReg, DESIGN_MASK, ROT, TR;
async function design(a, b) {
  if (!energyGrid) {
    ({ bestReg, energyGrid } = await import('./_jq20indep.mjs'));
    ({ discOf } = await import('./_jq42indep.mjs'));
    const { N, SPAN } = await import('../_rvnorm.mjs');
    DESIGN_MASK = new Uint8Array(N * N);
    for (let j = 0; j < N; j++) { const v = -SPAN + 2 * SPAN * j / (N - 1);
      for (let i = 0; i < N; i++) { const u = -SPAN + 2 * SPAN * i / (N - 1);
        DESIGN_MASK[j * N + i] = Math.hypot(u, v) <= 0.86 ? 1 : 0; } }
    ROT = []; for (let d = -8; d <= 8; d += 2) ROT.push(d);
    TR = []; for (let t = -0.03; t <= 0.0301; t += 0.015) TR.push(+t.toFixed(3));
  }
  const g = async (f) => {
    if (!featC.has(f)) {
      try { featC.set(f, await energyGrid(f, await discOf(f), 0.02)); }
      catch (e) { featC.set(f, null); }
    }
    return featC.get(f);
  };
  const ga = await g(a), gb = await g(b);
  if (!ga || !gb) return null;
  return bestReg(ga, gb, DESIGN_MASK, ROT, TR).ncc;
}
const featC = new Map();

const inPool = (den, side, f) => (POOL_BY_SIDE[side]?.[den] || []).includes(f);

for (const [k, list] of [...groups].sort()) {
  const [den, side] = k.split('-');
  if (only && (only.den !== den || only.side !== side)) continue;
  const pool = POOL_BY_SIDE[side]?.[den];
  console.log('='.repeat(78));
  console.log(`${k.toUpperCase()}   ${list.length} images in ref/   T1 pool: ${pool ? `${pool.length} of them` : 'NO ROW IN T1 AT ALL'}`);
  console.log('='.repeat(78));
  for (const f of list) await prep(f);
  const badFit = new Set();
  const m = [];
  for (const f of list) {
    const md = await sharp(join(REF, f)).metadata();
    const b = boxC.get(f);
    // Fit quality OF THE REGISTRATION THE DESIGN COLUMN ACTUALLY USES.
    //
    // The design column needs a registration, and when the registration is bad
    // it reads "different design" for two copies of one image
    // (`qp1964-obv-pad.png` vs `qp1964-obv.png`: identical, design NCC 0.019).
    // So this measures `_rvdisc.fit` — the fitter `discOf()` falls back to — and
    // NOT some second opinion of our own: a p95 from a different fitter would
    // say nothing about whether the design number can be trusted.
    // p95 is the 95th-percentile boundary residual as a % of R. The project's
    // own threshold for "NOT SQUARE-ON" is 1.0 % (`_jq20indep.mjs`).
    let fq = '';
    if (den !== 'buck') {
      const r = await rvfit(f);
      if (r === null) { badFit.add(f); fq = '  disc fit FAILED'; }
      else {
        const p = 100 * r.p95 / r.R;
        if (p > 5) badFit.add(f);
        fq = `  disc p95 ${p.toFixed(1).padStart(5)}%${p > 5 ? ' <- FIT UNUSABLE' : p > 1 ? ' <- not square-on' : ''}`;
      }
    }
    m.push(`  ${inPool(den, side, f) ? 'POOL' : '    '}  ${f.padEnd(26)} ${String(md.width).padStart(5)}x${String(md.height).padEnd(5)}` +
      (b ? `  box ${String(b.width).padStart(5)}x${String(b.height).padEnd(5)} aspect ${(b.width / b.height).toFixed(3)}` : '  box: NONE (does not separate from background)') + fq);
  }
  console.log(m.join('\n'));
  if (badFit.size) console.log(`  !! designNCC is NOT EVIDENCE for any pair involving: ${[...badFit].join(', ')}`);

  console.log('\n  pair'.padEnd(56) + 'sha  MADframe   MADbox  dHam  designNCC   call');
  const dups = [];
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = list[i], b = list[j];
    const same = shaC.get(a) === shaC.get(b);
    const mf = mad(tfC.get(a), tfC.get(b));
    const mb = mad(tbC.get(a), tbC.get(b));
    const dh = ham(dhC.get(a), dhC.get(b));
    const dn = den === 'buck' ? null : await design(a, b);
    const suspect = badFit.has(a) || badFit.has(b);
    const call = same ? 'BYTE-IDENTICAL'
      : (mb < 6 && dh <= 6) ? 'SAME IMAGE'
        : (mb < 12 && dh <= 12) ? '? same shoot — look'
          : (dn !== null && dn < 0.25) ? (suspect ? 'low designNCC — but a FIT is unreliable here' : 'different design?')
            : '';
    if (call) dups.push([a, b, call, mb, dh, dn]);
    console.log(`  ${(a + ' | ' + b).padEnd(54)}${same ? 'DUP' : ' - '}${mf.toFixed(1).padStart(10)}${mb.toFixed(1).padStart(9)}${String(dh).padStart(6)}${(dn === null ? '   n/a' : dn.toFixed(3).padStart(11))}   ${call}`);
  }

  // what T1 could be using and is not
  if (pool) {
    const missing = list.filter((f) => !pool.includes(f));
    const poolDups = dups.filter(([a, b]) => pool.includes(a) && pool.includes(b));
    console.log('');
    if (poolDups.length) {
      console.log('  !! T1 COUNTS ONE IMAGE TWICE:');
      for (const [a, b, c, mb, dh] of poolDups) console.log(`     ${a} + ${b}  (${c}: MADbox ${mb.toFixed(1)}, dHam ${dh})`);
      console.log(`     T1 publishes n=${pool.length} for this face; the true n is ${pool.length - poolDups.length}.`);
    } else console.log('  no duplicate inside the T1 pool for this face.');
    if (missing.length) {
      console.log('  IN ref/ AND NOT IN THE T1 POOL:');
      for (const f of missing) {
        const near = dups.find(([a, b]) => (a === f && pool.includes(b)) || (b === f && pool.includes(a)));
        console.log(`     ${f.padEnd(26)} ${near ? `(${near[2]} as ${near[0] === f ? near[1] : near[0]} — adding it would double-count)` : '(independent of everything in the pool)'}`);
      }
    }
  } else {
    console.log('\n  !! T1 HAS NO ROW FOR THIS SUBJECT. Nothing here has ever been scored by the primary gate.');
  }
  console.log('');
}

if (unclassified.length) {
  console.log('='.repeat(78));
  console.log('UNCLASSIFIED — named, never silently dropped');
  console.log('='.repeat(78));
  for (const [f, why] of unclassified) console.log(`  ${f.padEnd(28)} ${why}`);
}
