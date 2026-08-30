// C2 — WHAT `bust()`'s `hairFill` SIGN DOES AT THE SIZES THE APP DRAWS.
//
// `src/art/coins.js`: `const hairFill = o.hairLit ? p.cloth : p.hair;`
// `hairLit` is set on Jefferson, Roosevelt and Washington and NOT on Lincoln,
// so three heads get a hair mass LIGHTER than the face and one gets a mass
// DARKER than it. The ledger's old complaint ("wrong sign at mid") named a
// tier that v1.93.0 deleted, so it could not run. The live question is the one
// nobody asked: at 38 / 48 / 54 / 84 px — the four sizes `src/screens/money.js`
// actually draws — is that tone difference VISIBLE, and how many pixels is it
// being asked to carry?
//
// WHAT IT MEASURES, and why each number is the one it is.
//
//   * THE CONTROLLED MASK. Render the face twice, once with `hairLit` as the
//     repo has it and once with the flag flipped in memory (`OBVERSE` is
//     exported, so a candidate costs a process rather than an edit — the
//     `_nk8probe.mjs` move). The pixels that DIFFER between the two renders
//     are exactly the pixels the sign controls: not the geometric hair
//     silhouette, but the part of it that survives the relief line work,
//     the eye, the ear and the beard drawn on top. A tone decision cannot do
//     anything anywhere else, so this is the honest denominator.
//     Reported as an ABSOLUTE COUNT, because "12 % of the disc" and "31 px"
//     are very different facts about a 38 px coin.
//
//   * THE TWO CONTRASTS. A hair mass abuts two things: the FACE on the inside
//     and the FIELD on the outside. Both are computed on the mask's own
//     one-pixel boundary, split by an independently rendered HEAD silhouette
//     (the bare `<path d="HEAD"/>` inside the scaled head group, re-rendered
//     alone at the same box and the same transform, so registration is exact
//     rather than fitted). Mean Rec.709 luma, 0-255, gamma-encoded — the same
//     quantity `coins.js` quotes when it says "`cloth` renders at 1.148 of
//     `motif`", so the numbers here are comparable with the ones already in
//     the file.
//
//   * WHAT THE CONTRAST COMPETES WITH. A step between hair and face is only a
//     mass boundary if it is bigger than the variation already inside the
//     face. `sd(face)` is the standard deviation of luma over the face region,
//     which at these sizes is mostly the modelling strokes and the antialiased
//     head contour. |dL| < sd(face) means the tone step is quieter than the
//     texture it has to be seen against.
//
//   * LEVELS. How many distinct grey levels the mask actually occupies. One
//     level means the mass is flat and the boundary is all there is.
//
// AN INSTRUMENT REPORTS, IT DOES NOT WRITE. Nothing here touches `src/`, and
// the only files it emits are PNGs under the gitignored scratch path, and only
// with `--png`.
//
// Run: node coloringbook/judge/_jz1hairtone.mjs [--png]
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SCRATCH } from './_paths.mjs';
import { coinSVG, coinPx, OBVERSE } from '../../src/art/coins.js';
import { luma, headOnlySVG, massOnlySVG } from './_jzlib.mjs';

const SIZES = [38, 48, 54, 84];
const IDS = ['penny', 'nickel', 'dime', 'quarter'];
const WANT_PNG = process.argv.includes('--png');
const OUT = join(SCRATCH, '_jz1');
if (WANT_PNG) mkdirSync(OUT, { recursive: true });

async function raster(svg, w, h) {
  const { data } = await sharp(Buffer.from(svg))
    .resize(w, h, { fit: 'fill' })
    .flatten({ background: '#ffffff' })
    .raw().toBuffer({ resolveWithObject: true });
  const L = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) L[i] = luma(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]);
  return { rgb: data, L };
}

async function maskOf(svg, w, h) {
  const { L } = await raster(svg, w, h);
  const m = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) m[i] = L[i] < 128 ? 1 : 0;   // ink on white
  return m;
}

const stats = (L, mask, w, h) => {
  let n = 0, s = 0, s2 = 0; const lev = new Set();
  for (let i = 0; i < w * h; i++) if (mask[i]) { n++; s += L[i]; s2 += L[i] * L[i]; lev.add(Math.round(L[i])); }
  return n ? { n, mean: s / n, sd: Math.sqrt(Math.max(0, s2 / n - (s / n) ** 2)), levels: lev.size } : { n: 0, mean: NaN, sd: NaN, levels: 0 };
};

const f2 = (x) => (Number.isFinite(x) ? x.toFixed(2).padStart(7) : '     --');
const f3 = (x) => (Number.isFinite(x) ? x.toFixed(3).padStart(7) : '     --');

console.log('C2 — the hairFill sign at the four sizes src/screens/money.js draws');
console.log('');
console.log('`size` is the QUARTER\'s diameter; every other coin is drawn at its true');
console.log('relative diameter, so the device pixels a face really gets are printed as');
console.log('"px" below and are smaller than the nominal size for three of the four.');
console.log('');
console.log('LIT   = hair mass filled `p.cloth`  (lighter than the face)');
console.log('DARK  = hair mass filled `p.hair`   (darker than the face)');
console.log('The repo ships LIT on Jefferson/Roosevelt/Washington, DARK on Lincoln.');
console.log('');

const rows = [];
for (const id of IDS) {
  const shipped = OBVERSE[id].hairLit === true;
  console.log(`\n=== ${id}  (${OBVERSE[id].who}) — ships ${shipped ? 'LIT' : 'DARK'} ===`);
  console.log('           disc   ctrl-mask        geom     LIT-mass  DARK-mass    face    field   sd(face)  |dL|face  |dL|field  lev');
  console.log('   px       px²      px²   %disc    px²         luma       luma     luma     luma       luma       luma       luma  L/D');
  for (const S of SIZES) {
    const box = coinPx(id, S);
    const w = Math.round(box.w), h = Math.round(box.h);

    OBVERSE[id].hairLit = true;
    const svgLit = coinSVG(id, S, { side: 'obverse' });
    OBVERSE[id].hairLit = false;
    const svgDark = coinSVG(id, S, { side: 'obverse' });
    OBVERSE[id].hairLit = shipped;                 // restore immediately

    const A = await raster(svgLit, w, h);
    const B = await raster(svgDark, w, h);
    const headM = await maskOf(headOnlySVG(svgLit), w, h);
    const hairM = await maskOf(massOnlySVG(svgLit, 0), w, h);
    const beardSvg = massOnlySVG(svgLit, 1);
    const beardM = beardSvg ? await maskOf(beardSvg, w, h) : new Uint8Array(w * h);

    // The controlled mask: every pixel whose colour the sign moves.
    const ctrl = new Uint8Array(w * h);
    let nCtrl = 0;
    for (let i = 0; i < w * h; i++) {
      const d = Math.abs(A.rgb[i * 3] - B.rgb[i * 3]) + Math.abs(A.rgb[i * 3 + 1] - B.rgb[i * 3 + 1]) + Math.abs(A.rgb[i * 3 + 2] - B.rgb[i * 3 + 2]);
      if (d > 0) { ctrl[i] = 1; nCtrl++; }
    }

    // One-pixel boundary of the controlled mask, split by the head silhouette.
    const faceN = new Uint8Array(w * h), fieldN = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (ctrl[i]) continue;
      let touch = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const yy = y + dy, xx = x + dx;
        if (yy < 0 || xx < 0 || yy >= h || xx >= w) continue;
        if (ctrl[yy * w + xx]) touch = 1;
      }
      if (!touch) continue;
      if (headM[i] && !hairM[i] && !beardM[i]) faceN[i] = 1;
      else if (!headM[i] && !beardM[i]) fieldN[i] = 1;
    }
    // Whole face region (head minus the geometric hair and beard) — the texture floor.
    const faceR = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) if (headM[i] && !hairM[i] && !beardM[i]) faceR[i] = 1;

    const sLit = stats(A.L, ctrl, w, h);
    const sDark = stats(B.L, ctrl, w, h);
    const sFaceN = stats(A.L, faceN, w, h);
    const sFieldN = stats(A.L, fieldN, w, h);
    const sFaceR = stats(A.L, faceR, w, h);
    const nHair = stats(A.L, hairM, w, h).n;
    const discPx = Math.PI * (w / 2) * (h / 2);

    const dFaceLit = Math.abs(sLit.mean - sFaceN.mean), dFaceDark = Math.abs(sDark.mean - sFaceN.mean);
    const dFieldLit = Math.abs(sLit.mean - sFieldN.mean), dFieldDark = Math.abs(sDark.mean - sFieldN.mean);

    console.log(
      `  ${String(S).padStart(3)} ${String(w).padStart(4)}px ${String(Math.round(discPx)).padStart(6)} ${String(nCtrl).padStart(7)} ` +
      `${((100 * nCtrl) / discPx).toFixed(1).padStart(5)}% ${String(nHair).padStart(6)}  ` +
      `${f2(sLit.mean)} ${f2(sDark.mean)}  ${f2(sFaceN.mean)}/${String(sFaceN.n).padStart(3)} ${f2(sFieldN.mean)}/${String(sFieldN.n).padStart(3)}   ${f2(sFaceR.sd)}  ` +
      `L${f2(dFaceLit)} D${f2(dFaceDark)}  L${f2(dFieldLit)} D${f2(dFieldDark)}  ${sLit.levels}/${sDark.levels}`);

    rows.push({ id, S, w, nCtrl, discPx, nHair, litMean: sLit.mean, darkMean: sDark.mean, faceMean: sFaceN.mean, fieldMean: sFieldN.mean, faceSd: sFaceR.sd, litLev: sLit.levels, darkLev: sDark.levels });

    if (WANT_PNG) {
      const K = 10;
      for (const [tag, s] of [['lit', svgLit], ['dark', svgDark]]) {
        const png = await sharp(Buffer.from(s)).resize(w, h, { fit: 'fill' }).flatten({ background: '#ffffff' }).png().toBuffer();
        writeFileSync(join(OUT, `${id}-${S}-${tag}.png`), await sharp(png).resize(w * K, h * K, { kernel: 'nearest' }).png().toBuffer());
      }
    }
  }
}

console.log('\n\nSUMMARY — is the sign doing visible work?');
console.log('');
console.log('  A tone step is a MASS BOUNDARY only if it is louder than the texture it');
console.log('  competes with. `ratio` below is |dL| against the face, divided by the');
console.log('  standard deviation of luma inside the face region at that size.');
console.log('');
console.log('  coin      px    LIT |dL|/sd(face)   DARK |dL|/sd(face)   which branch is louder');
for (const r of rows) {
  const dl = Math.abs(r.litMean - r.faceMean), dd = Math.abs(r.darkMean - r.faceMean);
  const rl = dl / r.faceSd, rd = dd / r.faceSd;
  console.log(`  ${r.id.padEnd(8)} ${String(r.w).padStart(3)}   ${f3(rl)}              ${f3(rd)}          ${rl > rd ? 'LIT' : 'DARK'}  by ${(Math.abs(rl - rd)).toFixed(2)}`);
}
console.log('');
console.log('PALETTE, for reference (Rec.709 luma, gamma-encoded, 0-255):');
console.log('  silver  motif 148.9   cloth 170.9 (1.148x)   hair 125.9 (0.845x)   field 213.4');
console.log('  copper  motif  92.6   cloth 105.9 (1.144x)   hair  74.7 (0.807x)   field 150.4');
if (WANT_PNG) console.log('\nPNGs (10x nearest, gitignored):', OUT);
