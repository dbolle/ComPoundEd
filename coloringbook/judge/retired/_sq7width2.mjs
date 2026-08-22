// SPECIALIST, quarter reverse — the eagle's half-width, WITH THE LEGEND LEAK
// REMOVED. _sq6width.mjs measured it and its own §4.3 overlay showed the
// centre-connected component running out into UNITED STATES OF AMERICA: on the
// cameo proofs the wingtip and the letters bridge at every threshold in the
// sweep, so those numbers are the DEVICE-PLUS-LEGEND width and are not quoted.
//
// Two independent de-leaks, both printed, never one "best" one (§4.2):
//   (A) OPENING — erode the binary by k cells, take the centre component, then
//       dilate back and intersect with the original. k is swept and printed; a
//       profile that only stops moving at the top of the k sweep is riding a
//       bound (§4.1).
//   (B) RADIAL CUT at viewBox r <= 36.0, from `_jq4band.json`'s FROZEN top
//       legend baseline of 36.5 (§6.1: derived from the TARGET, never from our
//       drawing). A row that reads exactly 36.0 is riding the cut and is
//       reported as such, not as a value.
//
// If (A) and (B) agree the number is the eagle's. Where they disagree, both
// are printed and neither is quoted.
//
// Generator for: _sq7-width.png and the half-width table in the round report.
import sharp from 'sharp';
import { gridOf, inField, motif, valleyFloor, NG, SPANG } from './_jq43seg.mjs';
import { coinSVG } from '../../src/art/coins.js';

const PROOFS = ['qp1963-rev-pad.png', 'qp1964-rev-pad.png'];
const X2i = (X) => ((X - 50) / 47 + SPANG) * (NG - 1) / (2 * SPANG);
const i2X = (i) => 50 + 47 * (-SPANG + 2 * SPANG * i / (NG - 1));
const CELL = 47 * 2 * SPANG / (NG - 1);            // viewBox units per grid cell
const RCUT = 36.0;                                  // viewBox; see header
const KS = [0, 2, 4, 6, 8, 10];                     // erosion radii, cells
const ROWS = []; for (let Y = 20; Y <= 72; Y += 2) ROWS.push(Y);

const fld = inField();
const rcutMask = (() => {
  const m = new Uint8Array(NG * NG);
  for (let j = 0; j < NG; j++) for (let i = 0; i < NG; i++)
    m[j * NG + i] = Math.hypot(i2X(i) - 50, i2X(j) - 50) <= RCUT ? 1 : 0;
  return m;
})();

// square-kernel erode / dilate, separable
function morph(src, k, grow) {
  if (k === 0) return src;
  const t = new Uint8Array(NG * NG), o = new Uint8Array(NG * NG);
  const pick = grow ? Math.max : Math.min;
  for (let j = 0; j < NG; j++) for (let i = 0; i < NG; i++) {
    let v = grow ? 0 : 1;
    for (let d = -k; d <= k; d++) { const ii = i + d; if (ii < 0 || ii >= NG) { if (!grow) v = 0; continue; } v = pick(v, src[j * NG + ii]); }
    t[j * NG + i] = v;
  }
  for (let j = 0; j < NG; j++) for (let i = 0; i < NG; i++) {
    let v = grow ? 0 : 1;
    for (let d = -k; d <= k; d++) { const jj = j + d; if (jj < 0 || jj >= NG) { if (!grow) v = 0; continue; } v = pick(v, t[jj * NG + i]); }
    o[j * NG + i] = v;
  }
  return o;
}
const profile = (m) => ROWS.map((Y) => {
  const j = Math.round(X2i(Y));
  let lo = null, hi = null;
  for (let i = 0; i < NG; i++) if (m[j * NG + i]) { if (lo === null) lo = i; hi = i; }
  return lo === null ? NaN : Math.max(50 - i2X(lo), i2X(hi) - 50);
});

async function proof(f) {
  const g = await gridOf(f);
  const vf = valleyFloor(g, fld);
  const Tv = vf.best.arg;
  const bin = new Uint8Array(NG * NG);
  for (let p = 0; p < bin.length; p++) bin[p] = (fld[p] && g[p] >= Tv) ? 1 : 0;
  // component on the eroded binary, then dilate back, then AND with bin
  const comp = (b) => {
    const c = ((NG >> 1) * NG) + (NG >> 1);
    let seed = b[c] ? c : -1;
    for (let rad = 1; rad < NG / 2 && seed < 0; rad++)
      for (let a = 0; a < 360 && seed < 0; a += 3) {
        const i = (NG >> 1) + Math.round(rad * Math.cos(a * Math.PI / 180));
        const j = (NG >> 1) + Math.round(rad * Math.sin(a * Math.PI / 180));
        if (i >= 0 && j >= 0 && i < NG && j < NG && b[j * NG + i]) seed = j * NG + i;
      }
    const out = new Uint8Array(NG * NG); if (seed < 0) return out;
    const st = [seed]; out[seed] = 1;
    while (st.length) { const p = st.pop(), x = p % NG, y = (p - x) / NG;
      const nb = []; if (x > 0) nb.push(p - 1); if (x < NG - 1) nb.push(p + 1);
      if (y > 0) nb.push(p - NG); if (y < NG - 1) nb.push(p + NG);
      for (const q of nb) if (!out[q] && b[q]) { out[q] = 1; st.push(q); } }
    return out;
  };
  const A = {};
  for (const k of KS) {
    const er = morph(bin, k, false);
    const c = comp(er);
    const back = morph(c, k, true);
    const m = new Uint8Array(NG * NG);
    for (let p = 0; p < m.length; p++) m[p] = (back[p] && bin[p]) ? 1 : 0;
    A[k] = { m, prof: profile(m) };
  }
  // (B) radial cut
  const cut = new Uint8Array(NG * NG);
  for (let p = 0; p < cut.length; p++) cut[p] = (bin[p] && rcutMask[p]) ? 1 : 0;
  const B = comp(cut);
  return { f, Tv, A, B: { m: B, prof: profile(B) } };
}

// ours, same rows, same frame
function ourSolid() {
  const s = coinSVG('quarter', 380, { side: 'reverse', decorative: true });
  const m = s.match(/<g fill="#6b737b">([\s\S]*?)<\/g>/);
  if (!m) throw new Error('EMPTY SELECTION — no solid motif group found; failure report, not a value');
  return m[1];
}
async function ourProf() {
  const lo = i2X(0), hi = i2X(NG - 1);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${lo} ${lo} ${hi - lo} ${hi - lo}" width="${NG}" height="${NG}">` +
    `<rect x="${lo}" y="${lo}" width="${hi - lo}" height="${hi - lo}" fill="#fff"/><g fill="#000">${ourSolid()}</g></svg>`;
  const { data } = await sharp(Buffer.from(svg)).greyscale().raw().toBuffer({ resolveWithObject: true });
  const m = new Uint8Array(NG * NG);
  for (let p = 0; p < m.length; p++) m[p] = data[p] < 128 ? 1 : 0;
  return { m, prof: profile(m) };
}

const P = []; for (const f of PROOFS) P.push(await proof(f));
const O = await ourProf();

console.log('=== eagle half-width, legend leak removed ===');
console.log(`grid cell = ${CELL.toFixed(4)} viewBox units; erosion sweep k = ${KS.join(',')} cells (${(KS.at(-1) * CELL).toFixed(2)} units max)`);
console.log(`radial cut r <= ${RCUT} (from _jq4band.json frozen top-legend baseline 36.5) — a row reading ${RCUT.toFixed(1)} is riding the cut\n`);

for (const p of P) {
  console.log(`--- ${p.f}  Tv=${p.Tv} ---`);
  console.log('  Y   ' + KS.map((k) => `k=${k}`.padStart(7)).join('') + '   rcut');
  for (let i = 0; i < ROWS.length; i++)
    console.log(`  ${String(ROWS[i]).padStart(2)}  ` +
      KS.map((k) => (Number.isFinite(A_(p, k, i)) ? A_(p, k, i).toFixed(1) : ' - ').padStart(7)).join('') +
      (Number.isFinite(p.B.prof[i]) ? p.B.prof[i].toFixed(1) : ' - ').padStart(7));
}
function A_(p, k, i) { return p.A[k].prof[i]; }

const KUSE = 6;
console.log(`\n=== the comparison. coin = mean of the two proofs at k=${KUSE} (${(KUSE * CELL).toFixed(2)} units of opening) ===`);
console.log(' Y   1963  1964   coin  |  OURS  | ours-coin | proofs disagree by');
for (let i = 0; i < ROWS.length; i++) {
  const a = P[0].A[KUSE].prof[i], b = P[1].A[KUSE].prof[i], o = O.prof[i];
  const c = (a + b) / 2;
  const f = (v) => (Number.isFinite(v) ? v.toFixed(1) : ' -').padStart(6);
  console.log(`${String(ROWS[i]).padStart(3)}${f(a)}${f(b)}${f(c)}  |${f(o)}  |${f(o - c)}     |${f(Math.abs(a - b))}`);
}

// §4.3 overlay
const PXO = 760, g2p = (i) => i * PXO / (NG - 1);
let ov = `<svg xmlns="http://www.w3.org/2000/svg" width="${PXO}" height="${PXO}">`;
for (let i = 0; i < ROWS.length; i++) {
  const j = g2p(Math.round(X2i(ROWS[i])));
  const c = P[0].A[KUSE].prof[i], o = O.prof[i];
  if (Number.isFinite(c)) ov += `<line x1="${g2p(X2i(50 - c))}" y1="${j}" x2="${g2p(X2i(50 + c))}" y2="${j}" stroke="#00e676" stroke-width="1.8" opacity="0.9"/>`;
  if (Number.isFinite(o)) ov += `<line x1="${g2p(X2i(50 - o))}" y1="${j + 2}" x2="${g2p(X2i(50 + o))}" y2="${j + 2}" stroke="#ff1744" stroke-width="1.4" opacity="0.9"/>`;
}
ov += `<circle cx="${g2p(X2i(50))}" cy="${g2p(X2i(50))}" r="${g2p(X2i(50 + RCUT)) - g2p(X2i(50))}" fill="none" stroke="#ffe600" stroke-width="1" opacity="0.6"/>`;
ov += `<text x="6" y="16" font-family="monospace" font-size="13" fill="#fff">green = qp1963 device (opened k=${KUSE}), red = ours, yellow = r ${RCUT} cut</text></svg>`;
const gg = await gridOf(PROOFS[0]);
const bb = Buffer.alloc(NG * NG);
for (let p = 0; p < NG * NG; p++) bb[p] = Math.max(0, Math.min(255, Math.round(gg[p] || 0)));
await sharp(bb, { raw: { width: NG, height: NG, channels: 1 } }).resize(PXO, PXO)
  .toColourspace('srgb').composite([{ input: Buffer.from(ov) }]).png()
  .toFile(new URL('./_sq7-width.png', import.meta.url).pathname);
console.log('\nwrote _sq7-width.png');
