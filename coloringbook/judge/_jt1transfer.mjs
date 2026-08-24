// THE TRANSFER TEST — the metric the owner's definition of "done" actually implies.
//
// Owner, 2026-08-22, asked what "done" means:
//   "a child can identify a photo based on only learning about the denominations
//    from our pictures. DISTINGUISHING OUR RENDERINGS FROM EACH OTHER IS NOT THE
//    POINT, learning to identify real currency is."
//
// That invalidates D11's OBJECTIVE. D11 measures our-art against our-art — how
// far apart our dime and our nickel are. A set of drawings could be maximally
// distinct from one another and still teach a child nothing about the coins in
// their pocket. The question is TRANSFER: our drawing -> the real object.
//
// D11 is also measured in the wrong PLACE. `_x6lib.mjs:16` declares
// `ICON_SIZE = 26 // the quarter diameter the app's icon tier draws`. The app
// draws at 38, 48 and 84 (`src/screens/money.js`: coinRow(...,38),
// coinRow(...,48), coinRow(...,84)). 26 is a size the app never renders, and no
// D11 number has ever been computed at 84 — the naming stage, where a child is
// asked which coin this is. Wrong quantity, wrong locus.
//
// WHAT THIS FILE MEASURES INSTEAD. For each denomination, at each size the app
// really draws: render our art, render every reference photograph the same way,
// and ask whether ours is nearer to the RIGHT denomination's photographs than to
// any other denomination's. That is a confusion matrix, and its diagonal is the
// thing the owner asked for.
//
// WHY NEAREST-NEIGHBOUR AND NOT A THRESHOLD. There is no absolute similarity a
// drawing "should" reach — an SVG is not a photograph and never will be. What
// matters is RANK: at 38px, is our dime more dime-like than nickel-like? A child
// does not need our dime to look like a photograph, only to be sorted correctly
// against the alternatives.
//
// HONEST LIMITS, stated before any number:
//   * This scores the SILHOUETTE-AND-TONE gestalt at small sizes, which is what
//     a small render carries. It says nothing about whether the portrait is the
//     right president.
//   * Reference photographs differ in crop, lighting and preservation. Every
//     comparison is disc-normalised and greyscale, so absolute colour is out —
//     the same normalisation D3 uses.
//   * A denomination with one usable reference gets a weaker verdict than one
//     with four, and the count is printed beside every row.
//
// WHAT THIS FILE STILL CANNOT DO, stated where a reader will see it:
//
//   * IT SCORES FOUR DENOMINATIONS, NOT FIVE. `POOL_BY_SIDE` has no `buck` row,
//     so "T1 32/32" is 4 denominations x 2 faces x 4 sizes and the $1 note —
//     one fifth of the set, and the only subject that is not round — is not in
//     it. That is not a missing row: this file's registration is `discOf()` and
//     it samples a DISC. `_jt5note.mjs` is the same method with a per-subject
//     registration (disc for a coin, printed border for a note) and it scores
//     all five. **Quote T1 with T5 or quote neither.**
//   * IT COULD NOT RUN IN A WORKTREE, AND NOW IT CAN (ledger A25). The count
//     above was wrong: not three modules but EIGHT. The full transitive closure
//     of this file's imports below `coloringbook/` is `_rvnorm`, `_rvdisc`,
//     `_qtdisc`, `_qtedge`, `_qtseg`, `_nkdisc`, `_pyellipse`, `_pyseg` — 638
//     lines that `coloringbook/*` in .gitignore kept out of the repository, so
//     the primary gate did not exist in any clone or worktree.
//
//     Fixed by TRACKING them rather than moving them: eight `!` lines in
//     .gitignore, no import path touched, so not one instrument's hash moved.
//     The bytes now tracked are the exact bytes already hashed in
//     `_jd0hashes.json`, `_jp0hashes.json` and three scorecards, so nothing any
//     round published changes. Moving them into `judge/` — the fix considered
//     and declined here — would have rewritten 34 import statements and voided
//     34 hashes to achieve the same thing.
//
//     WHAT IS STILL NOT IN THE REPOSITORY, and cannot be: `coloringbook/ref/`,
//     the reference photographs. They are third-party, 15 MB, and
//     `PROVENANCE-dime-proofs.md` promises they are never redistributed from a
//     public repo — so this half of A25 is a WONTFIX with a reason, not an
//     omission. `scripts/round-setup.sh` already links them into a worktree,
//     and the preflight below names it instead of dying on a raw ENOENT sixty
//     seconds into a run.
//
// Run: node coloringbook/judge/_jt1transfer.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync, unlinkSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { coinSVG } from '../../src/art/coins.js';
// v2, NOT `_jq20indep.mjs` (ledger A24). The old `bestReg` rebuilds its refine
// neighbourhood inside the loop that reassigns the answer, so the search crawls
// outside the bounds it declares: 148 of the 231 pairs below (64.1 %) finished
// past ±0.035 R, the worst at 0.075 R, and the NCC it returned was inflated by
// up to 0.0537. Because the walk is greedy it only ever RAISES a similarity,
// and the similarities it raised are the off-diagonal ones — so it understated
// every margin in the table below. The old file is left byte-identical at its
// published hash and superseded beside; the corrected table is published in the
// round report next to the one it replaces. T1 is 32/32 under both.
import { ncc, bestReg, energyGrid } from './_jq20indep-v2.mjs';
import { discOf } from './_jq42indep.mjs';
import { N as GN, SPAN } from '../_rvnorm.mjs';

// V1 OF THIS FILE FAILED ITS OWN CONTROL, 3/12 — real dime photographs did not
// even sort as dimes. Cause: it correlated RAW GREYSCALE, and raw pixel
// correlation on photographs records LIGHTING, not design. That is the lesson
// this project already paid for once, in _jq42indep.mjs's own header. The fix
// is to compare on the same descriptor the independence instruments use:
// REGISTERED NCC ON BLURRED GRADIENT ENERGY, which is a statement about where
// the relief is, not about how it was lit. v1's numbers are discarded, not
// filed — they measured nothing.
const TEMPS = [];
const DESIGN_MASK = (() => {
  const m = new Uint8Array(GN * GN);
  for (let j = 0; j < GN; j++) {
    const v = -SPAN + 2 * SPAN * j / (GN - 1);
    for (let i = 0; i < GN; i++) {
      const u = -SPAN + 2 * SPAN * i / (GN - 1);
      m[j * GN + i] = Math.hypot(u, v) <= 0.86 ? 1 : 0;
    }
  }
  return m;
})();
const ROT = []; for (let d = -8; d <= 8; d += 2) ROT.push(d);
const TR = []; for (let t = -0.03; t <= 0.0301; t += 0.015) TR.push(+t.toFixed(3));
const featCache = new Map();
export async function featOfRef(file) {
  if (!featCache.has(file)) featCache.set(file, await energyGrid(file, await discOf(file), 0.02));
  return featCache.get(file);
}
export async function featOfOurs(id, px) {
  const key = `OURS:${SIDE}:${id}:${px}`;
  if (featCache.has(key)) return featCache.get(key);
  // Render at the app's size, then upsample with NEAREST so the descriptor sees
  // exactly the device pixels a child sees — no invented detail.
  const png = await sharp(Buffer.from(coinSVG(id, px, { side: SIDE })))
    .resize(px, px, { fit: 'contain', background: '#ffffff' })
    .resize(900, 900, { kernel: 'nearest' }).flatten({ background: '#ffffff' }).png().toBuffer();
  // WRITING INTO ref/ WAS A FAULT AND THE IMAGE REVIEW CAUGHT IT MID-RUN.
  // energyGrid resolves names relative to coloringbook/ref/, so v2 wrote its
  // renders there — polluting the shared reference pool that other rounds read,
  // which is the exact `_x6mat.mjs` fault this project already documents. A
  // crashed run leaves them behind. Own subdirectory instead: still resolvable,
  // never mistaken for a reference.
  const name = `_scratch/${SIDE}-${id}-${px}.png`;
  mkdirSync(new URL('../ref/_scratch/', import.meta.url).pathname, { recursive: true });
  writeFileSync(new URL('../ref/' + name, import.meta.url).pathname, png);
  TEMPS.push(name);
  // SCALE MUST BE REGISTERED, and it was not. This hard-coded
  // `R = 450 * 0.94 = 423` while the REFERENCE path calls `discOf(file)`, which
  // FITS the disc — and `bestReg` searches rotation and translation only, never
  // scale. Measured on our own renders, `discOf` returns 423.9-438.1: the art
  // was presented 0.2%-3.6% larger than assumed, BY A DIFFERENT AMOUNT PER COIN
  // (nickel +3.2, penny +3.6, quarter +0.2, dime +0.4). So every "ours" number
  // was depressed and the between-coin comparison was not apples to apples.
  // The control is unaffected — photo-vs-photo is fitted on both sides — which
  // is why the verdicts stood while the numbers did not.
  // Fitting our render the same way the reference is fitted removes it.
  // Found by the nickel round; fourth fault in this file, third found by
  // someone other than its author.
  const g = await energyGrid(name, await discOf(name), 0.02);
  featCache.set(key, g);
  return g;
}
// A BOUNDED REGISTRATION IS A LOWER BOUND, NOT A VALUE (§4.1, ledger A29).
// `bestReg` searches rotation and translation over a declared box. When the
// answer lands on the wall of that box, the true optimum is somewhere outside
// it and the NCC returned is a FLOOR. Quoting a floor as a similarity is safe
// when the margin is wide and unsafe when it is thin, and until now nothing in
// this file could tell the two apart. Every call is counted, and the counts are
// printed beside the verdict so no future round quotes one unknowingly.
export const REG = { n: 0, bounded: 0, thin: [] };
export const designSim = (a, b) => {
  const r = bestReg(a, b, DESIGN_MASK, ROT, TR);
  REG.n++; if (r.atBound) REG.bounded++;
  return r.ncc;
};
export const designSimReg = (a, b) => bestReg(a, b, DESIGN_MASK, ROT, TR);

export const N = 128;                       // comparison grid; small on purpose
// FOUR sizes, not three. src/screens/money.js:51 declares
// `const coinRow = (ids, size = 54)` and line 122 calls it bare, so 54 is a
// size the app draws and this instrument never tested it. Caught by the
// quarter-obverse round. Third locus gap found in this file: it also tested
// obverses only, and D11 before it was scored at 26px which the app never
// draws at all.
export const SIZES = [38, 48, 54, 84];          // what src/screens/money.js actually draws
const DISCS = JSON.parse(readFileSync(new URL('./_jp1discs.json', import.meta.url).pathname, 'utf8'));
const REF = new URL('../ref/', import.meta.url).pathname;

// PREFLIGHT (ledger A25). The primary gate used to die on a bare ENOENT for a
// photograph, sixty seconds into a run, in a checkout that simply had not been
// given the reference pool. Say what is missing and how to supply it.
if (!existsSync(REF)) {
  console.error('T1 cannot run: coloringbook/ref/ is not present in this checkout.');
  console.error('  The reference photographs are third-party and deliberately not tracked');
  console.error('  (PROVENANCE-dime-proofs.md: never redistributed). Link them with');
  console.error('    scripts/round-setup.sh <name>        (for a new round worktree), or');
  console.error('    ln -s <main-checkout>/coloringbook/ref coloringbook/ref');
  console.error('  Everything else T1 needs — all eight eval modules under coloringbook/ —');
  console.error('  IS tracked as of this change, so nothing but the photographs is missing.');
  process.exit(2);
}

// Reference photographs per denomination, PER FACE.
//
// v2 OF THIS FILE TESTED OBVERSES ONLY, and it was made the primary gate in
// §0 while structurally incapable of seeing five of the ten faces. The motif
// round on the dime and nickel REVERSES found it: T1 was byte-identical before
// and after a 163-line redraw, which looks like a pass and is a blind spot.
// That is the same locus fault this project has now documented in D11
// (measured at a size the app never draws), _jb14d1 (never imports the art)
// and _jb3seal — committed by the judge, in the instrument the judge had just
// promoted to primary.
//
// A child sees both faces. Both are tested.
//
// ── THE POOL WAS NEVER AUDITED UNTIL 2026-08-24, and it was counting one
// photograph twice. `_jt4pool.mjs` now sweeps every file in
// `coloringbook/ref/` and every within-denomination pair, with a duplicate check that uses NO DISC FIT
// (`_jrefintake.mjs`'s header says why: a registration disagreement once made
// two BYTE-IDENTICAL files score `INDEPENDENT`). What it found, and what
// changed here:
//
//   REMOVED  dime-rev.jpg
//            `dime-rev.jpg` and `dime-rev-2.jpg` are ONE photograph —
//            registration-free MADbox 1.4 and dHash Hamming 1 of 64, two
//            statistics of different kinds; design NCC 0.995. Every
//            dime-reverse T1 figure ever published as n=3 was n=2, and the
//            CONTROL row for the dime reverse was a photograph sorted against
//            ITSELF at 0.995. The higher-resolution of the two is kept.
//
//   ADDED    dime-rev-proofbright.png
//            The best shape reference on that face — 2000x2000, deep relief,
//            the file `_dr9branch.mjs` measures its erosion bias against — and
//            it had never been in the pool at all.
//
//   KEPT — and the near-miss is worth more than the change would have been.
//            `nickel-obv-4.jpg` was REMOVED from this pool and then PUT BACK.
//
//            It was dropped because `_jt5note.mjs`'s disc fitter disagreed with
//            `_rvdisc.fit` by 14.8 % of R and 19.1 % of R on the centre, because
//            `_jn1discs.json` records the nickel round's own chroma fit at
//            `p95resid_pctR: 62.13, ambiguous: true`, and because held out and
//            re-sorted under `_jt5note`'s registration it came back **dime**.
//            Looking at it: low-contrast silver on pale ground, coin near the
//            frame edge, content box aspect 1.045 where every other coin file
//            in the pool is 0.99-1.02.
//
//            THE DECISIVE TEST WAS THEN RUN, WHICH SHOULD HAVE BEEN RUN FIRST:
//            leave-one-out under **the registration T1 itself uses**. It sorts
//            **nickel, 0.671**, comfortably. And chasing that discrepancy found
//            the actual bug — in the NEW fitter, not the reference. It took the
//            last pixel unlike the background along each ray, so one stray light
//            pixel out in the surround set the radius. Flooding the background
//            in from the frame and keeping the largest component instead:
//            dR 14.78 % -> **3.13 %**, centre 19.12 % -> **3.82 %**, p95
//            12.22 % -> **2.59 %**, and `nickel-rev-proof.png` came along with
//            it (3.16 % -> 0.15 %, p95 13.05 % -> 0.81 %).
//
//            What survives as a finding: this is still the least well registered
//            file in the pool — 3.1 % against under 1 % for every other — and
//            `_jn1disc.mjs`'s chroma route cannot fit it at all. That is
//            recorded (ledger A21). It is not a reason to change a published
//            number, and it very nearly was.
//
// Excluded with reasons: penny-rev-artwork.jpg is a plaster model with no
// fittable disc (the project's own EXCLUDED list); quarter-rev-6.jpg is a 2006
// Nebraska state quarter; quarter-rev-5.jpg is the same photograph as
// quarter-rev.jpg (MADbox 1.3, dHash 1, design 0.995); quarter-obv-2.jpg is the
// same photograph as quarter-obv.jpg (MADbox 2.5, dHash 2, design 0.996);
// nickel-obv-unc2004.jpg is the same photograph as nickel-obv.jpg (MADbox 5.0,
// dHash 3, design 0.997 — found by this sweep, not previously recorded);
// nickel-obv-3.png is an engraved LINE DRAWING of Jefferson, not a coin.
//
// THE NET EFFECT ON THIS FILE'S NUMBERS, so nobody has to diff two runs:
// exactly ONE cell of the transfer table moved, by 0.001 (penny reverse, dime
// column, 54 px, 0.290 -> 0.289), because the file removed was a duplicate of
// one that stayed. T1 is 32/32 before and after. What moved is the CONTROL,
// which is the point: the dime-reverse control was 0.995 and is now
// 0.647 / 0.776 / 0.779, and it now runs 11 tests per face instead of 4.
//
// STILL AVAILABLE AND NOT ADDED — `_jt4pool.mjs` prints the full list with its
// numbers. Thirteen vetted, independent, same-design files sit unused while
// three rows carry n=2 (dime obverse, quarter obverse, quarter reverse). Adding a reference changes what this gate MEANS, so it is a
// deliberate act for the judge, not a side effect of a bug fix. The evidence is
// published; the decision is not taken here.
export const POOL_BY_SIDE = {
  obverse: {
    penny: ['penny-obv.jpg', 'penny-obv-2.jpg', 'penny-obv-3.jpg', 'penny-obv-4.png'],
    nickel: ['nickel-obv.jpg', 'nickel-obv-4.jpg', 'nickel-obv-5.JPG'],
    dime: ['dime-obv-2.jpg', 'dime-obv-3.jpg'],
    quarter: ['quarter-obv.jpg', 'quarter-obv-3.png'],
  },
  reverse: {
    penny: ['penny-rev.jpg', 'penny-rev-2.png', 'penny-rev-1991d.png'],
    nickel: ['nickel-rev.jpg', 'nickel-rev-2.png', 'nickel-rev-proof.png'],
    dime: ['dime-rev-2.jpg', 'dime-rev-unc2005.png', 'dime-rev-proofbright.png'],
    quarter: ['quarter-rev-2.png', 'quarter-rev-3.jpg'],
  },
};
export let SIDE = 'obverse';
export const setSide = (s) => { SIDE = s; };
export const POOL = new Proxy({}, {
  get: (_, k) => POOL_BY_SIDE[SIDE][k],
  ownKeys: () => Reflect.ownKeys(POOL_BY_SIDE[SIDE]),
  getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
});
export const IDS = Object.keys(POOL_BY_SIDE.obverse);

const grey = async (buf) => {
  const { data, info } = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
};

// Sample a disc onto the N x N grid, normalised to zero mean and unit variance
// so overall brightness and contrast cannot decide the answer.
function sampleDisc(g, cx, cy, R) {
  const v = new Float64Array(N * N).fill(NaN);
  let s = 0, s2 = 0, n = 0;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const u = (2 * (i + 0.5)) / N - 1, w = (2 * (j + 0.5)) / N - 1;
    if (Math.hypot(u, w) > 0.92) continue;
    const x = Math.round(cx + u * R), y = Math.round(cy + w * R);
    if (x < 0 || y < 0 || x >= g.w || y >= g.h) continue;
    const val = g.d[y * g.w + x];
    v[j * N + i] = val; s += val; s2 += val * val; n++;
  }
  const mean = s / n, sd = Math.sqrt(s2 / n - mean * mean) || 1;
  for (let k = 0; k < N * N; k++) if (!Number.isNaN(v[k])) v[k] = (v[k] - mean) / sd;
  return v;
}

const corr = (a, b) => {
  let s = 0, n = 0;
  for (let k = 0; k < a.length; k++) {
    if (Number.isNaN(a[k]) || Number.isNaN(b[k])) continue;
    s += a[k] * b[k]; n++;
  }
  return n ? s / n : 0;
};

// fit a disc on a rendered SVG: it is centred by construction
async function oursAt(id, px) {
  const g = await grey(Buffer.from(coinSVG(id, px, { side: SIDE })));
  return sampleDisc(g, g.w / 2, g.h / 2, Math.min(g.w, g.h) / 2 * 0.94);
}

// a reference, downsampled to the SAME device size first — this is the whole
// point: a child sees 38 device pixels, so the comparison must too.
async function refAt(file, px) {
  const disc = DISCS[file];
  const raw = await sharp(REF + file).greyscale().toBuffer();
  const m = await sharp(raw).metadata();
  let cx, cy, R;
  if (disc) { cx = disc.cx; cy = disc.cy; R = disc.R; }
  else { cx = m.width / 2; cy = m.height / 2; R = Math.min(m.width, m.height) / 2 * 0.95; }
  // crop to the disc, resize to the app's size, then sample
  const L = Math.max(0, Math.round(cx - R)), T = Math.max(0, Math.round(cy - R));
  const S = Math.round(Math.min(2 * R, m.width - L, m.height - T));
  const small = await sharp(REF + file).extract({ left: L, top: T, width: S, height: S })
    .resize(px, px, { fit: 'fill' }).greyscale().toBuffer();
  const g = await grey(small);
  return sampleDisc(g, g.w / 2, g.h / 2, g.w / 2 * 0.94);
}

// Only run the report when invoked directly; _jt2floor.mjs imports the
// validated pieces above and must not re-run it.
if (process.argv[1] && process.argv[1].endsWith('_jt1transfer.mjs')) {
  // BOTH FACES. v2 tested obverses only while being the primary gate.
  let grandPass = 0, grandTotal = 0;
  for (const side of ['obverse', 'reverse']) {
    setSide(side);
    console.log(`\n${'='.repeat(64)}\n${side.toUpperCase()}\n${'='.repeat(64)}`);

    // ── CONTROL FIRST. v1 ran the control last and published a headline number
    // that its own control then invalidated. The control now gates everything: if
    // the test cannot sort real PHOTOGRAPHS by denomination, it reports that and
    // exits without saying anything about our art.
    console.log('CONTROL FIRST — can the test sort real PHOTOGRAPHS by denomination?');
    console.log('descriptor: registered NCC on blurred gradient energy (the same one');
    console.log('_jq42indep.mjs uses), not raw greyscale — v1 used raw greyscale and');
    console.log('scored 3/12 on this control.\n');
    // EVERY photograph is held out, not just the first. Until 2026-08-24 this
    // loop held out `POOL[id][0]` only, so the control was 4 tests where the
    // pool supports 22 — and the untested files included `nickel-obv-4.jpg`,
    // which this repository's own `_jn1discs.json` records as unfittable
    // (p95 62 % of R, `ambiguous: true`) and which sorts as a DIME when it is
    // held out. A control that samples one file per class is a control that
    // cannot find a bad file.
    let cpass = 0, ctot = 0;
    for (const id of IDS) {
      if (POOL[id].length < 2) { console.log(`${id.padEnd(9)} only ${POOL[id].length} reference — cannot hold one out`); continue; }
      for (const held of POOL[id]) {
        const h = await featOfRef(held);
        const sc = [];
        for (const t of IDS) {
          const others = POOL[t].filter((f) => f !== held);
          const vs = [];
          for (const f of others) vs.push(designSim(h, await featOfRef(f)));
          sc.push(vs.length ? Math.max(...vs) : -2);
        }
        const best = IDS[sc.indexOf(Math.max(...sc))];
        const ok = best === id; ctot++; if (ok) cpass++;
        console.log(`${(id + ' ' + held).padEnd(34)} ` + sc.map((v) => v.toFixed(3).padStart(9)).join('') + `   ${ok ? 'OK' : '!! sorted as ' + best}`);
      }
    }
    console.log(`\nCONTROL: ${cpass}/${ctot} photographs sorted correctly (leave-one-out over EVERY reference).`);
    if (cpass < ctot) {
      console.log('  !! THE TEST CANNOT SORT REAL COINS. Reporting nothing about our art —');
      console.log('     that would be a measurement of the instrument, not of the drawing.');
      process.exit(1);
    }
    console.log('  The test can sort real coins, so a failure below is about our ART.\n');

    console.log('TRANSFER TEST — is our drawing nearer the RIGHT coin than any other?');
    console.log('at the sizes src/screens/money.js actually draws: ' + SIZES.join(', ') + ' px');
    console.log('(D11 is scored at 26px, a size the app never renders)\n');

    let pass = 0, total = 0;
    for (const px of SIZES) {
      console.log(`=== ${px}px ===`);
      console.log('our art  ->  ' + IDS.map((i) => i.padStart(9)).join('') + '     verdict');
      for (const id of IDS) {
        const o = await featOfOurs(id, px);
        const sc = [];
        for (const t of IDS) {
          const vs = [];
          for (const f of POOL[t]) vs.push(designSim(o, await featOfRef(f)));
          sc.push(Math.max(...vs));
        }
        const best = IDS[sc.indexOf(Math.max(...sc))];
        const ok = best === id; total++; if (ok) pass++;
        const margin = Math.max(...sc) - Math.max(...sc.filter((_, k) => IDS[k] !== id));
        console.log(`${id.padEnd(9)}    ` + sc.map((v) => v.toFixed(3).padStart(9)).join('')
          + `     ${ok ? `OK   margin ${margin.toFixed(3)}` : '!! CONFUSED WITH ' + best}   n=${POOL[id].length}`);
      }
      console.log('');
    }
    console.log(`TRANSFER: ${pass}/${total} correct across ${SIZES.length} sizes.`);
    console.log(pass === total
      ? '  Every denomination is nearer its own photographs than any other, at every size the app draws.\n  That is the owner\'s definition of done, met.'
      : '  A confusion at a size the app draws is a REAL defect against the owner\'s definition of done.');
    grandPass += pass; grandTotal += total;
  }
  console.log(`\n${'='.repeat(64)}`);
  console.log(`REGISTRATION QUALITY (§4.1): ${REG.bounded} of ${REG.n} registrations (${(100 * REG.bounded / REG.n).toFixed(1)} %)`);
  console.log('  finished ON a search bound. Those NCCs are LOWER BOUNDS, not values.');
  console.log('  A verdict resting on one is only as safe as its margin — read the margin column.');
  console.log(`\nT1 OVERALL: ${grandPass}/${grandTotal} across both faces and ${SIZES.length} sizes.`);
  console.log(grandPass === grandTotal
    ? '  Every face is nearer its own denomination than any other, at every size the app draws.'
    : '  A confusion at a size the app draws is a real defect against the objective.');
}

// Clean up the renders written into ref/. THIS MUST RUN ON IMPORT TOO: it used
// to sit only in the direct-run block, so any instrument that IMPORTED this one
// left renders in the shared reference tree — the exact fault this file's own
// header documents about _x6mat.mjs.
export function cleanup() {
  for (const t of TEMPS.splice(0)) { try { unlinkSync(new URL('../ref/' + t, import.meta.url).pathname); } catch {} }
}
process.on('exit', cleanup);
cleanup();
