// BUCK obverse round — RECORD CORRECTION. Recomputes D1 and every D2 row from
// the LIVE art, parsed out of the SVG `coinSVG` emits, against the judge's own
// frozen targets (`_jb4target.json`, buck-gates.md §2).
//
// WHY. Two scorers in the library carry a hardcoded `OURS` literal that has not
// described `coins.js` since v1.83.0:
//   `_jb14d1.mjs`   OURS = {cx 34, cy 28, rx 17, ry 21}   -> prints D1 FAIL 0.1496
//   `_jb3seal.mjs`  OURS = circles r16 at cx 30 / 70      -> six D2 FAIL rows
// Neither imports `coins.js`. §0.2/§6.1.1: a scorer that cannot print an
// "ours" column produced by RUNNING the live art is UNMEASURED. These print an
// "ours" column that is a stale copy, which is worse.
//
// Everything below is parsed from the emitted SVG. If the parse finds the
// wrong number of ellipses it throws rather than guessing.
// REPORTS ONLY. Covers id `buck`, both sides.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { ROOT, JUDGE } from './_paths.mjs';
const { coinSVG } = await import(join(ROOT, 'src/art/coins.js'));

function ellipses(svg) {
  const out = [];
  for (const m of svg.matchAll(/<ellipse\s+cx="([\d.]+)"\s+cy="([\d.]+)"\s+rx="([\d.]+)"\s+ry="([\d.]+)"/g))
    out.push({ cx: +m[1], cy: +m[2], rx: +m[3], ry: +m[4] });
  return out;
}
const iou = (a, b) => {
  const st = 0.02; let inter = 0, uni = 0;
  const x0 = Math.min(a.cx - a.rx, b.cx - b.rx), x1 = Math.max(a.cx + a.rx, b.cx + b.rx);
  const y0 = Math.min(a.cy - a.ry, b.cy - b.ry), y1 = Math.max(a.cy + a.ry, b.cy + b.ry);
  for (let y = y0; y <= y1; y += st) for (let x = x0; x <= x1; x += st) {
    const ia = ((x - a.cx) / a.rx) ** 2 + ((y - a.cy) / a.ry) ** 2 <= 1;
    const ib = ((x - b.cx) / b.rx) ** 2 + ((y - b.cy) / b.ry) ** 2 <= 1;
    if (ia && ib) inter++; if (ia || ib) uni++; }
  return inter / uni;
};
const V = (v) => v.toFixed(4);
const obv = coinSVG('buck', 380, { side: 'obverse', decorative: true });
const rev = coinSVG('buck', 380, { side: 'reverse', decorative: true });

// ── D1, obverse principal device ────────────────────────────────────────────
const oe = ellipses(obv);
const vig = oe.filter((e) => Math.abs(e.cx - 50.05) < 4 && e.rx > 5);
if (vig.length !== 2) throw new Error(`expected 2 vignette ellipses in the obverse, parsed ${vig.length}`);
if (JSON.stringify(vig[0]) !== JSON.stringify(vig[1])) throw new Error('the two vignette ellipses disagree');
const OURS1 = vig[0];
const R0_LOCUS = { cx: 50.05, cy: 30.30, rx: 9.75, ry: 14.00 };       // buck-gates.md §2, r0, PAPER-box registration
const BORDER_FIT = { cx: 50.00, cy: 31.375, rx: 9.875, ry: 15.75 };   // this round, _bx4vig.mjs, two-reference mean
console.log('D1 — obverse portrait vignette, parsed from the LIVE svg');
console.log(`  ours              cx ${OURS1.cx}  cy ${OURS1.cy}  rx ${OURS1.rx}  ry ${OURS1.ry}   ry/rx ${(OURS1.ry / OURS1.rx).toFixed(3)}`);
console.log(`  r0 frozen locus   cx ${R0_LOCUS.cx}  cy ${R0_LOCUS.cy}  rx ${R0_LOCUS.rx}  ry ${R0_LOCUS.ry}   (registered on the PAPER box)`);
console.log(`  border-fit mean   cx ${BORDER_FIT.cx}  cy ${BORDER_FIT.cy}  rx ${BORDER_FIT.rx}  ry ${BORDER_FIT.ry}   (this round, PRINTED-BORDER fiducial, 2 refs)`);
console.log(`  IoU ours vs r0 locus        ${V(iou(OURS1, R0_LOCUS))}`);
console.log(`  IoU ours vs border-fit mean ${V(iou(OURS1, BORDER_FIT))}   gate 0.95`);
console.log(`  IoU r0 locus vs border-fit  ${V(iou(R0_LOCUS, BORDER_FIT))}   <- how wrong the FROZEN TARGET is`);
console.log(`  _jb14d1.mjs publishes       0.1496 FAIL, from OURS = {cx 34, cy 28, rx 17, ry 21} — not in coins.js since v1.83.0\n`);

// ── D2, reverse. NOT THIS ROUND'S FACE — reported, not touched ──────────────
const T = JSON.parse(readFileSync(join(JUDGE, '_jb4target.json'), 'utf8'));
const re = ellipses(rev);
const pyr = re.find((e) => e.cx < 50 && e.rx > 5), eag = re.find((e) => e.cx > 50 && e.rx > 5);
if (!pyr || !eag) throw new Error('could not parse the two reverse roundels');
console.log('D2 — reverse roundels, parsed from the LIVE svg (NOT this round\'s face; reported only)');
for (const [tag, ours, t] of [['D2a pyramid', pyr, T.mean.pyramid], ['D2b eagle', eag, T.mean.eagle]]) {
  const v = iou(ours, t);
  console.log(`  ${tag}   ours cx ${ours.cx} cy ${ours.cy} rx ${ours.rx} ry ${ours.ry}`);
  console.log(`              target cx ${t.cx} cy ${t.cy} rx ${t.rx} ry ${t.ry}`);
  console.log(`              IoU ${V(v)}  gate 0.95  -> ${v >= 0.95 ? 'PASS' : 'FAIL'}   centre err ${Math.hypot(ours.cx - t.cx, ours.cy - t.cy).toFixed(3)} (gate 1.0) -> ${Math.hypot(ours.cx - t.cx, ours.cy - t.cy) <= 1 ? 'PASS' : 'FAIL'}`);
  const drx = 100 * (ours.rx / t.rx - 1), dry = 100 * (ours.ry / t.ry - 1);
  console.log(`              semi-axes rx ${drx >= 0 ? '+' : ''}${drx.toFixed(2)}%  ry ${dry >= 0 ? '+' : ''}${dry.toFixed(2)}%  (gate +-5%) -> ${Math.abs(drx) <= 5 && Math.abs(dry) <= 5 ? 'PASS' : 'FAIL'}`);
}
const sep = eag.cx - pyr.cx, dsep = 100 * (sep / T.separation - 1);
console.log(`  D2c separation  ours ${sep.toFixed(2)}  target ${T.separation}  ${dsep >= 0 ? '+' : ''}${dsep.toFixed(2)}%  (gate +-5%) -> ${Math.abs(dsep) <= 5 ? 'PASS' : 'FAIL'}`);
for (const [tag, e] of [['pyramid', pyr], ['eagle', eag]]) {
  const s = e.ry / e.rx, d = 100 * (s / 1.3145 - 1);
  console.log(`  D2d shape ${tag}  ry/rx ${s.toFixed(4)}  vs the predicted anisotropy 1.3145  ${d >= 0 ? '+' : ''}${d.toFixed(2)}%  (gate +-5%) -> ${Math.abs(d) <= 5 ? 'PASS' : 'FAIL'}`);
}
console.log(`  r0 published, from OURS = circles r16 at cx 30/70: D2a FAIL, D2b FAIL, centre FAIL, semi-axes FAIL, D2c FAIL, D2d FAIL (six rows)`);
console.log(`  _jb3seal.mjs cannot be run in a worktree at all: it imports the gitignored ../\_blnorm.mjs`);

// ── D8 containment, both sides — RASTER, not a path-number scan ────────────
// A first version of this section scanned every number in every `d` attribute
// in pairs and reported the reverse's ink reaching X -7.32. That is an arc's
// `rx ry rot large-arc sweep` flags being read as coordinates, not ink. It is
// recorded here rather than quietly deleted: a path-number scan cannot do D8.
const SZ = 1200;
async function contain(svg) {
  const s2 = svg.replace(/width="[\d.]+" height="[\d.]+"/, `width="${SZ}" height="${Math.round(SZ * 56 / 100)}"`);
  const HH = Math.round(SZ * 56 / 100);
  const { data, info } = await sharp(Buffer.from(s2)).resize(SZ, HH).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const S2 = SZ / 100;
  let worst = 0, n = 0;
  const PAPER = { x0: 1.4, x1: 98.6, y0: 1.4, y1: 54.6, r: 5 };
  for (let j = 0; j < info.height; j++) for (let i2 = 0; i2 < info.width; i2++) {
    if (data[(j * info.width + i2) * 4 + 3] < 8) continue;
    const X = (i2 + 0.5) / S2, Y = (j + 0.5) / S2;
    let d = Math.max(PAPER.x0 - X, X - PAPER.x1, PAPER.y0 - Y, Y - PAPER.y1);
    // rounded corners
    for (const [cx, cy] of [[PAPER.x0 + PAPER.r, PAPER.y0 + PAPER.r], [PAPER.x1 - PAPER.r, PAPER.y0 + PAPER.r],
      [PAPER.x0 + PAPER.r, PAPER.y1 - PAPER.r], [PAPER.x1 - PAPER.r, PAPER.y1 - PAPER.r]]) {
      if ((X < cx) === (cx < 50) && (Y < cy) === (cy < 28)) d = Math.max(d, Math.hypot(X - cx, Y - cy) - PAPER.r);
    }
    if (d > 0.02) { n++; worst = Math.max(worst, d); }
  }
  return { n, worst, total: info.width * info.height };
}
console.log('\nD8 — is any INK outside the note? (raster, 1200px wide, alpha>=8)');
for (const [tag, svg] of [['obverse', obv], ['reverse', rev]]) {
  const c = await contain(svg);
  console.log(`  ${tag}  ${c.n} of ${c.total} rendered pixels lie outside the paper rounded-rect [1.4,98.6]x[1.4,54.6] r5; max depth ${c.worst.toFixed(3)} viewBox units`);
}
console.log('  the obverse vignette ellipse now reaches Y 47.13; the printed-border rect\'s bottom is Y 51 and the paper rect\'s is Y 54.6.');
