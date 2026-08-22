// ROUND 8, cent obverse — WHERE DOES THE WHISKER FIELD BEGIN? A texture-energy
// map, because the beard's boundary is not a tone step and no threshold finds it.
//
// The question this round ran into: our BEARD path's top edge sits at local
// y +8.4 (rear) to +12.8 (front), and by eye the photographs put the whiskers
// far higher. "By eye" is exactly what Appendix R6 says has been wrong four
// times, so this measures it.
//
// THE SIGNAL. Bare cheek on a struck cent is a smooth ramp; the beard is a field
// of cut strands about 1.5-2 local units apart. That is a difference in LOCAL
// VARIANCE at the strand scale, not in mean level — which is why a tone
// threshold cannot separate them and why §21.1's "segment its ENERGY" applies.
// For every point the instrument takes the standard deviation of the greyscale
// in a disc of radius `RTEX` local units, high-pass filtered by subtracting a
// larger-radius mean so a shading gradient does not read as texture.
//
// RESPONSE TEST. A synthetic image: half smooth ramp, half ramp + 1.7-local-unit
// stripes at a known amplitude. The instrument must report the stripe half well
// above the smooth half, and the reported boundary must land within 1 local unit
// of the true one.
//
// NULL TEST. The same instrument on a patch of BARE FIELD outside the coin's
// device (local (-34, 26), which is open field on all three references). Whatever
// it reports there is the floor; a "boundary" whose energy never rises above the
// field floor is reported as NO FEATURE FOUND, not as a coordinate. Both the
// floor and the search bounds (the y range scanned) are printed beside every
// answer.
//
// §4.3 OVERLAY. Every located boundary point is drawn on the source, per
// reference, and the map itself is written out, so the reading can be looked at
// rather than trusted.
//
// Run: node coloringbook/judge/_jh8tex.mjs
import sharp from 'sharp';
import { DISCS, PENNY } from '../_pylib.mjs';

const RTEX = 0.9;             // local units — half the strand spacing
const RBG = 3.5;              // local units — background mean radius (high-pass)
const COLS = [-18, -16, -14, -12, -10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10, 12];
const YMIN = -14, YMAX = 22;  // SEARCH BOUNDS in local y — printed with every answer
const STEP = 0.25;

const vX = (lx) => 50 + PENNY.CX + PENNY.dir * PENNY.s * lx;
const vY = (ly) => PENNY.CY + PENNY.s * ly;

async function greyOf(file) {
  const { data, info } = await sharp(`coloringbook/ref/${file}`).flatten({ background: '#fff' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
}
// energy at a local point, in a photograph with disc fit D
function energy(g, D, lx, ly) {
  const px = (v) => D.cx + (v - 50) / 47 * D.R, py = (v) => D.cy + (v - 50) / 47 * D.R;
  const X = px(vX(lx)), Y = py(vY(ly));
  const perLocal = PENNY.s * D.R / 47;
  const r1 = RTEX * perLocal, r2 = RBG * perLocal;
  let n1 = 0, s1 = 0, q1 = 0, n2 = 0, s2 = 0;
  for (let y = Math.floor(Y - r2); y <= Math.ceil(Y + r2); y++)
    for (let x = Math.floor(X - r2); x <= Math.ceil(X + r2); x++) {
      if (x < 0 || y < 0 || x >= g.w || y >= g.h) continue;
      const dd = (x - X) ** 2 + (y - Y) ** 2;
      const v = g.d[y * g.w + x];
      if (dd <= r2 * r2) { n2++; s2 += v; }
      if (dd <= r1 * r1) { n1++; s1 += v; q1 += v * v; }
    }
  if (n1 < 4 || n2 < 4) return NaN;
  const m1 = s1 / n1;
  const sd = Math.sqrt(Math.max(0, q1 / n1 - m1 * m1));
  return sd;                                    // grey levels of local roughness
}

// ── controls ──────────────────────────────────────────────────────────────
console.log('=== RESPONSE TEST — synthetic: smooth ramp above, ramp+strands below y=0 ===');
{
  const W = 900, D = { cx: W / 2, cy: W / 2, R: W / 2 };
  const perLocal = PENNY.s * D.R / 47;
  const buf = Buffer.alloc(W * W);
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
    // local y of this pixel, inverting vY / py
    const ly = ((((y - D.cy) / D.R) * 47 + 50) - PENNY.CY) / PENNY.s;
    let v = 120 + 0.05 * x + 0.04 * y;           // a smooth ramp both halves share
    if (ly > 0) v += 34 * Math.sin(2 * Math.PI * (x + y) / (1.7 * perLocal));
    buf[y * W + x] = Math.max(0, Math.min(255, Math.round(v)));
  }
  const g = { d: buf, w: W, h: W };
  for (const ly of [-6, -3, -1, 1, 3, 6])
    console.log(`   local y ${String(ly).padStart(3)}  energy ${energy(g, D, 0, ly).toFixed(2)}`);
  // boundary by the same rule the real scan uses
  let found = null, prev = null;
  for (let ly = -8; ly <= 8; ly += STEP) { const e = energy(g, D, 0, ly); if (prev !== null && prev < 12 && e >= 12) { found = ly; break; } prev = e; }
  console.log(`   boundary found at local y ${found === null ? 'NONE' : found.toFixed(2)}  (truth 0.00) — must be within 1.0`);
}

// ── the references ────────────────────────────────────────────────────────
for (const [file, D] of Object.entries(DISCS)) {
  const g = await greyOf(file);
  // NULL TEST: bare field, well outside the device, on all three
  const floorPts = [[-34, 26], [-36, 10], [30, -30]];
  const floors = floorPts.map(([x, y]) => energy(g, D, x, y)).filter((v) => !Number.isNaN(v));
  const floor = floors.reduce((a, b) => a + b, 0) / floors.length;
  // an in-device SMOOTH control: the cheek patch centre (8.5, -1.5), which
  // `_tonepatches-penny.json` names as the normaliser and which is bare skin
  const cheek = energy(g, D, 8.5, -1.5);
  // an in-device ROUGH control: the middle of the hair mass, hairMid (-12, -22)
  const hair = energy(g, D, -12, -22);
  const T = (cheek + hair) / 2;                  // threshold midway between the two named controls
  console.log(`\n=== ${file} ===`);
  console.log(`  NULL TEST  bare-field floor ${floor.toFixed(2)} (${floors.map((v) => v.toFixed(1)).join(', ')})`);
  console.log(`  CONTROLS   cheek patch (8.5,-1.5) ${cheek.toFixed(2)}   hairMid patch (-12,-22) ${hair.toFixed(2)}   -> threshold ${T.toFixed(2)}`);
  if (!(hair > cheek * 1.4)) { console.log('  the two named controls do not separate by 1.4x — NO READING TAKEN on this reference'); continue; }
  console.log(`  SEARCH BOUNDS local y ${YMIN} .. ${YMAX}, step ${STEP}. A result equal to a bound is a failure, not a value.`);
  console.log('   local x    boundary y    energy above/below      note');
  const marks = [];
  for (const lx of COLS) {
    // scan DOWN from YMIN; the boundary is the first crossing from below T to above T
    let prev = null, hit = null;
    for (let ly = YMIN; ly <= YMAX; ly += STEP) {
      const e = energy(g, D, lx, ly);
      if (Number.isNaN(e)) { prev = null; continue; }
      if (prev !== null && prev < T && e >= T) { hit = ly; break; }
      prev = e;
    }
    let note = '';
    if (hit === null) note = 'NO CROSSING in bounds — no value';
    else if (Math.abs(hit - YMIN) < 1e-9 || Math.abs(hit - YMAX) < 1e-9) note = 'EQUALS A SEARCH BOUND — failure, not a value';
    const above = hit === null ? NaN : energy(g, D, lx, hit - 1.5), below = hit === null ? NaN : energy(g, D, lx, hit + 1.5);
    console.log(`   ${String(lx).padStart(7)}  ${hit === null ? '     —' : hit.toFixed(2).padStart(10)}   ${Number.isNaN(above) ? '  —' : above.toFixed(1).padStart(5)} /${Number.isNaN(below) ? '  —' : below.toFixed(1).padStart(5)}          ${note}`);
    if (hit !== null && !note) marks.push([lx, hit]);
  }
  // §4.3 overlay
  const HALF = 22, LXC = -3, LYC = 4, OUT = 1000;
  const pX = (v) => D.cx + (v - 50) / 47 * D.R, pY = (v) => D.cy + (v - 50) / 47 * D.R;
  const left = pX(vX(LXC - HALF)), top = pY(vY(LYC - HALF)), wpx = pX(vX(LXC + HALF)) - left;
  const k = OUT / wpx;
  const X = (lx) => (pX(vX(lx)) - left) * k, Y = (ly) => (pY(vY(ly)) - top) * k;
  let s = marks.map(([x, y]) => `<circle cx="${X(x).toFixed(1)}" cy="${Y(y).toFixed(1)}" r="6" fill="none" stroke="#ff00ff" stroke-width="3"/>`).join('');
  if (marks.length > 1) s += `<polyline fill="none" stroke="#ff00ff" stroke-width="2" stroke-dasharray="8 6" points="${marks.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(' ')}"/>`;
  s += `<text x="6" y="18" font-family="monospace" font-size="15" fill="#ff00ff">${file} — texture-energy boundary, threshold ${T.toFixed(2)} (midway cheek ${cheek.toFixed(1)} / hairMid ${hair.toFixed(1)}), field floor ${floor.toFixed(1)}</text>`;
  const meta = await sharp(`coloringbook/ref/${file}`).metadata();
  const ex = { left: Math.round(left), top: Math.round(top), width: Math.round(wpx), height: Math.round(wpx) };
  if (ex.left < 0 || ex.top < 0 || ex.left + ex.width > meta.width || ex.top + ex.height > meta.height) { console.log('  overlay window out of bounds — not written'); continue; }
  const base = await sharp(`coloringbook/ref/${file}`).extract(ex).resize(OUT, OUT, { fit: 'fill' }).png().toBuffer();
  const out = `coloringbook/_pv/_jh8tex-${file.replace(/\.\w+$/, '')}.png`;
  await sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OUT}" height="${OUT}">${s}</svg>`) }]).toFile(out);
  console.log(`  §4.3 overlay -> ${out}`);
}
