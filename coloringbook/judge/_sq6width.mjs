// SPECIALIST, quarter reverse — THE MEASUREMENT THIS ROUND RESTS ON.
//
// The eagle's HALF-WIDTH at each height, in viewBox units, on the coin and on
// our drawing, over the same rows. Commensurable by construction: both are
// "distance from x=50 to the outermost device pixel in row Y", both in viewBox
// units, both on a disc-normalised frame (brief-common rule 1).
//
// The coin side comes from the two cameo proofs, where the frosted device
// separates from the black mirror field — the acquisition round 4 made for
// exactly this. Segmentation is `_jq43seg.mjs`'s, imported UNEDITED at its
// published hash: same grid, same connected-component rule, same field mask.
//
// §4.1 null test  : the threshold sweep prints its bounds and the per-threshold
//                   half-width, so a result riding a bound is visible.
// §4.2 selection  : both proofs are printed, never one "best" one.
// §4.3            : _sq6-width.png draws the measured boundary ON the source.
// §6.1            : the locus (rows, region, threshold rule) comes from the
//                   TARGET only. Nothing here is computed from our art.
import sharp from 'sharp';
import { gridOf, inField, motif, valleyFloor, NG, SPANG } from './_jq43seg.mjs';
import { coinSVG } from '../../src/art/coins.js';

const PROOFS = ['qp1963-rev-pad.png', 'qp1964-rev-pad.png'];
// viewBox <-> grid. u = (X-50)/47 ; i = (u + SPANG) * (NG-1) / (2*SPANG)
const X2i = (X) => ((X - 50) / 47 + SPANG) * (NG - 1) / (2 * SPANG);
const i2X = (i) => 50 + 47 * (-SPANG + 2 * SPANG * i / (NG - 1));
const ROWS = [];
for (let Y = 20; Y <= 70; Y += 2) ROWS.push(Y);

// ---- coin side -------------------------------------------------------------
const fld = inField();
async function proofProfile(f) {
  const g = await gridOf(f);
  // threshold comes from the PHOTOGRAPH, exactly as _jq43seg.mjs derives it:
  // the histogram valley floor between the two dominant modes, swept +-15.
  const vf = valleyFloor(g, fld);
  if (!vf.best) throw new Error(`${f}: no separable mode pair — FAILURE REPORT, not a value`);
  const Tv = vf.best.arg;
  const TS = [-15, -10, -5, 0, 5, 10, 15].map((d) => Tv + d);
  const per = [];
  for (const T of TS) {
    const { m } = motif(g, T, fld);
    if (!m.some((v) => v)) throw new Error(`${f} T=${T}: EMPTY SELECTION — failure report, not a value`);
    const prof = ROWS.map((Y) => {
      const j = Math.round(X2i(Y));            // same mapping on both axes
      let lo = null, hi = null;
      for (let i = 0; i < NG; i++) if (m[j * NG + i]) { if (lo === null) lo = i; hi = i; }
      return lo === null ? [NaN, NaN] : [i2X(lo), i2X(hi)];
    });
    let area = 0; for (let p = 0; p < m.length; p++) area += m[p];
    per.push({ T, prof, area: area / (NG * NG) });
  }
  return { file: f, TS, Tv, depth: vf.best.depth, per };
}

// ---- our side --------------------------------------------------------------
// Rasterise ONLY the motif's solid mass, at the same grid, by re-emitting the
// coin SVG with everything but the motif suppressed. Simpler and safer: render
// the whole reverse and take the DEVICE mask as "not the field colour" inside
// r<40.5 — but the legends would join it. So: cut the emitted SVG down to the
// first struck() copy of `solid` and fill it black on white.
function ourSolidSVG() {
  const s = coinSVG('quarter', 380, { side: 'reverse', decorative: true });
  const re = /<g fill="#6b737b">([\s\S]*?)<\/g>/;      // the struck copies; take one
  const m = s.match(re);
  if (!m) throw new Error('SELECTION FAILED — no <g fill="#6b737b"> in the emitted reverse. ' +
    'This is a failure report, not a value (brief: an empty selection is never a value).');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${NG}" height="${NG}">` +
    `<rect width="100" height="100" fill="#fff"/><g fill="#000">${m[1]}</g></svg>`;
}
async function ourProfile() {
  // our SVG viewBox 0..100 must land on the SAME grid as the proof, where
  // viewBox X maps to i = X2i(X). Draw into a viewBox that spans the grid.
  const lo = i2X(0), hi = i2X(NG - 1);
  const s = ourSolidSVG().replace('viewBox="0 0 100 100"',
    `viewBox="${lo} ${lo} ${hi - lo} ${hi - lo}"`);
  const { data } = await sharp(Buffer.from(s)).greyscale().raw().toBuffer({ resolveWithObject: true });
  return ROWS.map((Y) => {
    const j = Math.round(X2i(Y));
    let a = null, b = null;
    for (let i = 0; i < NG; i++) if (data[j * NG + i] < 128) { if (a === null) a = i; b = i; }
    return a === null ? [NaN, NaN] : [i2X(a), i2X(b)];
  });
}

// ---- report ----------------------------------------------------------------
const results = [];
for (const f of PROOFS) results.push(await proofProfile(f));
const ours = await ourProfile();

console.log('=== eagle HALF-WIDTH from the vertical axis, viewBox units ===');
console.log('locus: rows Y=20..70 step 2; region r <= 0.862R; motif = centre-connected component of {grey >= T}');
for (const r of results) console.log(`${r.file}: valley floor Tv=${r.Tv} (depth ${r.depth.toFixed(4)}), sweep bounds ${r.TS[0]}..${r.TS.at(-1)} — a value riding a bound is a failure report (S4.1)`);
console.log('');

for (const r of results) {
  console.log(`--- ${r.file}: motif area fraction per threshold ---`);
  console.log('  T     ' + r.TS.map((t) => String(t).padStart(7)).join(''));
  console.log('  area  ' + r.per.map((p) => p.area.toFixed(4).padStart(7)).join(''));
}

// mid threshold (index 3 = 115) is the working value; the spread across the
// sweep is printed as the target's own ambiguity.
const MID = 3;
console.log('\n Y  |  1963 L  R  half | 1964 L  R  half | OURS L  R  half | ours-coin(half) | 1963 half spread over the sweep');
for (let k = 0; k < ROWS.length; k++) {
  const Y = ROWS[k];
  const h = (p) => Number.isFinite(p[0]) ? Math.max(50 - p[0], p[1] - 50) : NaN;
  const a = results[0].per[MID].prof[k], b = results[1].per[MID].prof[k], o = ours[k];
  const ha = h(a), hb = h(b), ho = h(o);
  const coin = (ha + hb) / 2;
  const spread = results[0].per.map((p) => h(p.prof[k])).filter(Number.isFinite);
  const sp = spread.length ? (Math.max(...spread) - Math.min(...spread)) : NaN;
  const f2 = (v) => (Number.isFinite(v) ? v.toFixed(1) : '  - ').padStart(6);
  console.log(`${String(Y).padStart(3)} |${f2(a[0])}${f2(a[1])}${f2(ha)} |${f2(b[0])}${f2(b[1])}${f2(hb)} |${f2(o[0])}${f2(o[1])}${f2(ho)} | ${f2(ho - coin)}          | ${f2(sp)}`);
}

// overlay (§4.3)
const PXO = 700;
const d = results[0];
let ov = `<svg xmlns="http://www.w3.org/2000/svg" width="${PXO}" height="${PXO}">`;
const g2p = (i) => i * PXO / (NG - 1);
for (let k = 0; k < ROWS.length; k++) {
  const a = d.per[MID].prof[k], o = ours[k];
  const j = g2p(Math.round(X2i(ROWS[k])));
  if (Number.isFinite(a[0])) ov += `<line x1="${g2p(X2i(a[0]))}" y1="${j}" x2="${g2p(X2i(a[1]))}" y2="${j}" stroke="#00e676" stroke-width="1.6" opacity="0.85"/>`;
  if (Number.isFinite(o[0])) ov += `<line x1="${g2p(X2i(o[0]))}" y1="${j}" x2="${g2p(X2i(o[1]))}" y2="${j}" stroke="#ff1744" stroke-width="1.2" opacity="0.9"/>`;
}
ov += `<text x="6" y="16" font-family="monospace" font-size="13" fill="#fff">green = ${d.file} device extent (T=${d.TS[MID]}), red = ours</text></svg>`;
const gg = await gridOf(d.file);
const bb = Buffer.alloc(NG * NG);
for (let p = 0; p < NG * NG; p++) bb[p] = Math.max(0, Math.min(255, Math.round(gg[p] || 0)));
await sharp(bb, { raw: { width: NG, height: NG, channels: 1 } }).resize(PXO, PXO)
  .toColourspace('srgb').composite([{ input: Buffer.from(ov) }]).png()
  .toFile(new URL('./_sq6-width.png', import.meta.url).pathname);
console.log('\nwrote _sq6-width.png');
