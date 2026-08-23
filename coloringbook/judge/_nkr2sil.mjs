// THE BUILDING AS ONE CONNECTED COMPONENT, and its outline read off that.
//
// Segmenting device from field on a struck coin has defeated about ten
// instruments in this project. This one only claims to work where it provably
// does: on the CAMEO PROOF, where frosted device on a mirror field separates on
// a single threshold with 81.7 grey levels between them. It prints that
// separation first and says so if it is under 25.
//
// Flood-filling from the middle of the left wing wall — rather than thresholding
// the whole frame — is what keeps E PLURIBUS UNUM, MONTICELLO, FIVE CENTS and
// UNITED STATES OF AMERICA out of the roofline. The component's bounding box is
// the null test: if a legend joins it, the bbox says so immediately.
//
// WHAT IT FOUND (2026-08-23, `nickel-rev-proof.png`, component bbox
// x 9.15..91.00, y 28.70..62.10, 653991 cells, so no legend joined):
//
//   x band        top y   what it is                     drawn
//   13.3..18.2    42.85   end pavilion roof (left)       45.40  <- 3.5 too low
//   82.0..86.0    41.75   end pavilion roof (right)
//   18.8..28.5    41.6    wing balustrade / cornice      40.80
//   28.7..32.8    38.30   a SECOND roof-deck step        not drawn
//   33.0..38.8    37.50   roof deck behind the gable     37.40
//   39.3..61.0     ->     drum cornice, then the dome
//   49.5..51.0    28.75   dome apex (27.4 on a raw scan
//                         that does not require 4-connectivity; the crown's
//                         halo and its shadow ring differ by that much, and
//                         the honest reading is 27.4..28.8)
//
// usage: node coloringbook/judge/_nkr2sil.mjs [file|ours] [top|bot|rows]
import { POOL, samplerFor, levels } from './_nkrlib.mjs';

const file = process.argv[2] || POOL[2];
const mode = process.argv[3] || 'top';
const STEP = 0.05, X0 = 5, X1 = 95, Y0 = 20, Y1 = 66;
const NX = Math.round((X1 - X0) / STEP), NY = Math.round((Y1 - Y0) / STEP);

const { at } = await samplerFor(file);
const L = levels(at);
console.log(`# ${file}  field ${L.field.toFixed(1)}  device ${L.device.toFixed(1)}  T ${L.T.toFixed(1)}  separation ${L.sep.toFixed(1)} grey levels`);
if (L.sep < 25) {
  console.log('!! separation under 25 grey levels — this file does not segment on one');
  console.log('   threshold. Nothing published; use _nkr3lad.mjs (ladders) instead.');
  process.exit(1);
}
const on = new Uint8Array(NX * NY);
for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
  const v = at(X0 + i * STEP, Y0 + j * STEP);
  on[j * NX + i] = (L.up ? v > L.T : v < L.T) ? 1 : 0;
}
const si = Math.round((27 - X0) / STEP), sj = Math.round((52.5 - Y0) / STEP);
if (!on[sj * NX + si]) { console.log('!! seed (27, 52.5) is not device — nothing published'); process.exit(1); }
const comp = new Uint8Array(NX * NY);
const st = [sj * NX + si];
comp[st[0]] = 1;
let area = 0;
while (st.length) {
  const k = st.pop(); area++;
  const i = k % NX, j = (k / NX) | 0;
  for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const ni = i + di, nj = j + dj;
    if (ni < 0 || nj < 0 || ni >= NX || nj >= NY) continue;
    const nk = nj * NX + ni;
    if (on[nk] && !comp[nk]) { comp[nk] = 1; st.push(nk); }
  }
}
let bi0 = NX, bi1 = 0, bj0 = NY, bj1 = 0;
for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) if (comp[j * NX + i]) {
  if (i < bi0) bi0 = i; if (i > bi1) bi1 = i; if (j < bj0) bj0 = j; if (j > bj1) bj1 = j;
}
console.log(`# component ${area} cells, bbox x ${(X0 + bi0 * STEP).toFixed(2)}..${(X0 + bi1 * STEP).toFixed(2)}  y ${(Y0 + bj0 * STEP).toFixed(2)}..${(Y0 + bj1 * STEP).toFixed(2)}`);
console.log('# a bbox reaching the legends means the flood escaped — do not believe the rest');

if (mode === 'rows') {
  console.log('#     y      left     right    mid');
  for (let j = 0; j < NY; j++) {
    const y = Y0 + j * STEP;
    if (Math.abs(y * 4 - Math.round(y * 4)) > 1e-6) continue;
    let l = null, r = null;
    for (let i = 0; i < NX; i++) if (comp[j * NX + i]) { l = X0 + i * STEP; break; }
    for (let i = NX - 1; i >= 0; i--) if (comp[j * NX + i]) { r = X0 + i * STEP; break; }
    console.log(y.toFixed(2).padStart(7), l === null ? '     --' : l.toFixed(2).padStart(9),
      r === null ? '     --' : r.toFixed(2).padStart(9), l === null ? '' : ((l + r) / 2).toFixed(2).padStart(7));
  }
} else {
  const fromTop = mode !== 'bot';
  console.log(`#     x      ${fromTop ? 'top' : 'bottom'} y`);
  for (let i = 0; i < NX; i++) {
    const x = X0 + i * STEP;
    if (Math.abs(x * 4 - Math.round(x * 4)) > 1e-6) continue;
    let t = null;
    if (fromTop) { for (let j = 0; j < NY; j++) if (comp[j * NX + i]) { t = Y0 + j * STEP; break; } }
    else { for (let j = NY - 1; j >= 0; j--) if (comp[j * NX + i]) { t = Y0 + j * STEP; break; } }
    console.log(x.toFixed(2).padStart(7), t === null ? '     --' : t.toFixed(2).padStart(8));
  }
}
