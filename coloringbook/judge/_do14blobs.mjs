// THE LEGENDS, FOUND RATHER THAN WINDOWED.
//
// `_do12band.mjs` reported the window's own bound on five of nine files for the
// motto's band top and on seven for the date's ink left, twice, under two
// different masks. The reason is geometric and not fixable by a better
// rectangle: WE TRUST's right end sits 0.2 viewBox units from the throat on our
// own drawing, and the bust's truncation runs diagonally through any rectangle
// that holds the date. Both runs are recorded there.
//
// So the words are FOUND. Everything outside the bust and inside r <= 41 is
// bare field on all four obverses; a legend is the only relief there. Threshold
// |grad I| in that region, take connected components, and each word comes back
// as a blob with its own bounding box. Nothing has to be told where to look,
// and a blob that is a scratch or a mintmark shows up as an extra row rather
// than as a silent contribution to a mean.
//
// CONTROL: run on our own render the blobs must be exactly LIBERTY, IN GOD,
// WE TRUST and the date, at the boxes `INSCRIPTION.dime` sets. Printed first.
//
// usage: node coloringbook/judge/_do14blobs.mjs [minArea]
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { ROOT } from './_paths.mjs';
import { POOL, samplerFor, samplerOurs } from './_dolib.mjs';
import { boundary, icp } from './_do6sil.mjs';

const MINA = Number(process.argv[2] || 1.2);   // square viewBox units
const STEP = 0.15;
const { OBVERSE } = await import(join(ROOT, 'src/art/coins.js'));
const o = OBVERSE.dime;
const src = readFileSync(join(ROOT, 'src/art/coins.js'), 'utf8');
const dimeBlock = src.slice(src.indexOf('  dime: {', src.indexOf('const INSCRIPTION = {')));
const spec = [...dimeBlock.slice(0, dimeBlock.indexOf('  quarter: {')).matchAll(
  /\{ kind: 'flat', text: ([^,]+), x: ([-\d.]+), y: ([-\d.]+), size: ([-\d.]+) \}/g,
)].map((m) => ({ text: m[1].replace(/'/g, ''), x: +m[2], y: +m[3], size: +m[4] }));

function bustTester(B, dilate) {
  const pts = B.pts;
  let cx = 0, cy = 0;
  for (const [x, y] of pts) { cx += x; cy += y; }
  cx /= pts.length; cy /= pts.length;
  const R = new Float64Array(720);
  for (const [x, y] of pts) {
    const a = Math.round((((Math.atan2(y - cy, x - cx) * 180) / Math.PI + 360) % 360) * 2) % 720;
    const r = Math.hypot(x - cx, y - cy);
    if (r > R[a]) R[a] = r;
  }
  for (let k = 0; k < 720; k++) if (!R[k]) R[k] = Math.max(R[(k + 719) % 720], R[(k + 1) % 720]);
  return (x, y) => {
    const a = Math.round((((Math.atan2(y - cy, x - cx) * 180) / Math.PI + 360) % 360) * 2) % 720;
    return Math.hypot(x - cx, y - cy) <= R[a] + dilate;
  };
}

function blobs(at, isBust) {
  const N = Math.round(100 / STEP);
  const E = new Float64Array(N * N).fill(-1);
  const H = 0.15;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = (i + 0.5) * STEP, y = (j + 0.5) * STEP;
    const r = Math.hypot(x - 50, y - 50);
    if (r > 41 || r < 12 || isBust(x, y)) continue;
    const a = at(x + H, y), b = at(x - H, y), c = at(x, y + H), d = at(x, y - H);
    if (a == null || b == null || c == null || d == null) continue;
    E[j * N + i] = Math.hypot(a - b, c - d);
  }
  const v = [...E].filter((q) => q >= 0).sort((a, b) => a - b);
  if (v.length < 100) return null;
  // the field is featureless, so its own 60th percentile is the floor and the
  // threshold is set well above it — the letters are the top few percent
  const floor = v[Math.floor(v.length * 0.6)], top = v[Math.floor(v.length * 0.995)];
  const T = floor + (top - floor) * 0.30;
  const lab = new Int32Array(N * N).fill(-1);
  const out = [];
  for (let k = 0; k < E.length; k++) {
    if (E[k] < T || E[k] < 0 || lab[k] >= 0) continue;
    const st = [k]; lab[k] = k;
    let n = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, sx = 0, sy = 0;
    while (st.length) {
      const p = st.pop(); n++;
      const i = p % N, j = (p / N) | 0;
      const x = (i + 0.5) * STEP, y = (j + 0.5) * STEP;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      sx += x; sy += y;
      for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) {
        const q = i + a, r = j + b;
        if (q < 0 || r < 0 || q >= N || r >= N) continue;
        const z = r * N + q;
        if (E[z] >= T && lab[z] < 0) { lab[z] = k; st.push(z); }
      }
    }
    const area = n * STEP * STEP;
    if (area >= MINA) out.push({ area, x0, x1, y0, y1, cx: sx / n, cy: sy / n });
  }
  return out.sort((a, b) => b.area - a.area);
}

const ourS = await samplerOurs('dime', 'obverse', 1600);
const ourB = boundary(ourS);
const ourBust = bustTester(ourB, 1.2);
console.log('INSCRIPTION.dime.rest declares:');
for (const l of spec) console.log(`   ${String(l.text).padEnd(9)} x ${String(l.x).padStart(5)}  baseline y ${String(l.y).padStart(5)}  size ${l.size}`);
console.log('\nCONTROL — blobs found on OUR OWN render (area, box, centre):');
const ob = blobs((x, y) => ourS.at(x, y), ourBust);
for (const b of ob) {
  console.log(`   area ${b.area.toFixed(1).padStart(6)}   x ${b.x0.toFixed(2)}..${b.x1.toFixed(2)} (w ${(b.x1 - b.x0).toFixed(2)})   y ${b.y0.toFixed(2)}..${b.y1.toFixed(2)} (h ${(b.y1 - b.y0).toFixed(2)})   centre ${b.cx.toFixed(2)},${b.cy.toFixed(2)}`);
}

// EVERY BLOB IS ONE GLYPH, not one word — checked on our own render, where the
// four digits of 1985 come back as four blobs. So a word is the UNION of the
// blobs in its quadrant, and its CAP HEIGHT is the MEDIAN of their heights,
// which is far steadier than any single blob and is the statistic D5-cap wants.
const pick = (bs, f) => {
  const g = bs.filter(f);
  if (!g.length) return null;
  const hs = g.map((b) => b.y1 - b.y0).sort((a, b) => a - b);
  return {
    n: g.length,
    x0: Math.min(...g.map((b) => b.x0)), x1: Math.max(...g.map((b) => b.x1)),
    y0: Math.min(...g.map((b) => b.y0)), y1: Math.max(...g.map((b) => b.y1)),
    cx: g.reduce((a, b) => a + b.cx * b.area, 0) / g.reduce((a, b) => a + b.area, 0),
    cy: g.reduce((a, b) => a + b.cy * b.area, 0) / g.reduce((a, b) => a + b.area, 0),
    cap: hs[hs.length >> 1],
    area: g.reduce((a, b) => a + b.area, 0),
  };
};
// LIBERTY IS THE REGISTRATION CONTROL. It is the one legend on this face that
// HAS been measured (round 0 fitted its band to r 34.33..42.25 and its cap to
// 7.92 over three references, and `rOff`/`size` were set to it). If our LIBERTY
// lands on the coin's LIBERTY through this pipeline, the pipeline's frame is
// sound and the motto's and the date's offsets are the coin's, not the
// instrument's. If it does not, nothing here is evidence.
const LIB = (b) => b.cy <= 70 && Math.hypot(b.cx - 50, b.cy - 50) > 30 && b.cx < 50;
const MOTTO = (b) => b.cx < 48 && b.cy > 70;
const DATE = (b) => b.cx >= 55 && b.cy > 72;
const om = pick(ob, MOTTO), od = pick(ob, DATE), ol = pick(ob, LIB);
console.log(`\n   OURS  motto blob: ${om ? `x ${om.x0.toFixed(2)}..${om.x1.toFixed(2)}  y ${om.y0.toFixed(2)}..${om.y1.toFixed(2)}  centre ${om.cx.toFixed(2)},${om.cy.toFixed(2)}` : 'none'}`);
console.log(`   OURS  date  blob: ${od ? `x ${od.x0.toFixed(2)}..${od.x1.toFixed(2)}  y ${od.y0.toFixed(2)}..${od.y1.toFixed(2)}  centre ${od.cx.toFixed(2)},${od.cy.toFixed(2)}` : 'none'}`);

console.log('\nTHE COIN — largest blob in each quadrant, per reference');
console.log('  file                     motto  x0..x1        y0..y1       centre        | date  x0..x1        y0..y1       centre');
const rows = [];
for (const f of POOL) {
  const s = await samplerFor(f);
  const B = boundary(s);
  if (!B) continue;
  const fit = icp(ourB.pts, B.pts);
  const c = Math.cos(fit.th), si = Math.sin(fit.th);
  const at = (x, y) => {
    const dx = x - 50, dy = y - 50;
    return s.at(50 + c * dx - si * dy, 50 + si * dx + c * dy);
  };
  const bt = bustTester(B, 1.2);
  const rotBust = (x, y) => { const dx = x - 50, dy = y - 50; return bt(50 + c * dx - si * dy, 50 + si * dx + c * dy); };
  const bs = blobs(at, rotBust);
  if (!bs) { console.log('  ', f.padEnd(24), 'no field'); continue; }
  const m = pick(bs, MOTTO), d = pick(bs, DATE), l = pick(bs, LIB);
  rows.push({ f, m, d, l });
  const fmt = (b) => (b ? `n${String(b.n).padStart(2)} ${b.x0.toFixed(1)}..${b.x1.toFixed(1)} ${b.y0.toFixed(1)}..${b.y1.toFixed(1)} c${b.cx.toFixed(1)},${b.cy.toFixed(1)} cap${b.cap.toFixed(2)}`.padEnd(46) : 'none'.padEnd(46));
  console.log('  ', f.padEnd(24), fmt(m), '| ', fmt(d));
}
const st = (get, name, ourV) => {
  const v = rows.map(get).filter((x) => x != null && Number.isFinite(x)).sort((a, b) => a - b);
  if (v.length < 5) { console.log(`     ${name}: only ${v.length} reads — UNMEASURED`); return; }
  const m = v[v.length >> 1];
  console.log(`     ${name.padEnd(22)} median ${m.toFixed(2).padStart(6)}   IQR ${v[Math.floor(v.length * 0.25)].toFixed(2)} .. ${v[Math.floor(v.length * 0.75)].toFixed(2)}   range ${v[0].toFixed(2)} .. ${v[v.length - 1].toFixed(2)}   OURS ${ourV.toFixed(2)}   delta ${(m - ourV).toFixed(2)}`);
};
console.log('');
if (ol) {
  console.log(`  CONTROL — LIBERTY.  OURS n${ol.n}  x ${ol.x0.toFixed(1)}..${ol.x1.toFixed(1)}  y ${ol.y0.toFixed(1)}..${ol.y1.toFixed(1)}  centre ${ol.cx.toFixed(2)},${ol.cy.toFixed(2)}  cap ${ol.cap.toFixed(2)}  band r ${(Math.hypot(ol.cx - 50, ol.cy - 50)).toFixed(2)}`);
  const rad = (b) => (b ? Math.hypot(b.cx - 50, b.cy - 50) : null);
  st((r) => rad(r.l), 'LIBERTY centre r', rad(ol));
  st((r) => r.l && r.l.cx, 'LIBERTY centre x', ol.cx);
  st((r) => r.l && r.l.cy, 'LIBERTY centre y', ol.cy);
  st((r) => r.l && r.l.cap, 'LIBERTY CAP', ol.cap);
  console.log('');
}
if (om) {
  st((r) => r.m && r.m.x0, 'motto left x', om.x0);
  st((r) => r.m && r.m.x1, 'motto right x', om.x1);
  st((r) => r.m && (r.m.x1 - r.m.x0), 'motto width', om.x1 - om.x0);
  st((r) => r.m && r.m.y0, 'motto top y', om.y0);
  st((r) => r.m && r.m.y1, 'motto bottom y', om.y1);
  st((r) => r.m && (r.m.y1 - r.m.y0), 'motto block height', om.y1 - om.y0);
  st((r) => r.m && r.m.cap, 'motto CAP (median)', om.cap);
  st((r) => r.m && r.m.n, 'motto blob count', om.n);
  st((r) => r.m && r.m.cx, 'motto centre x', om.cx);
  st((r) => r.m && r.m.cy, 'motto centre y', om.cy);
}
// THE RATIO IS THE NUMBER THAT SURVIVES THE BEVEL. `_py3band.mjs` established
// that a photographed raised letter's band includes a skirt our flat fill does
// not have, and refused a size change on the cent for exactly that reason. A
// RATIO of two legends on the SAME photograph under the SAME light divides the
// skirt out, so date-cap / motto-cap is comparable between the coin and us.
console.log('');
const rat = rows.map((r) => (r.m && r.d && r.m.cap ? r.d.cap / r.m.cap : null)).filter((x) => x != null).sort((a, b) => a - b);
if (rat.length >= 5 && om && od) {
  console.log(`  date cap / motto cap:  coin median ${rat[rat.length >> 1].toFixed(3)}  IQR ${rat[Math.floor(rat.length * 0.25)].toFixed(3)} .. ${rat[Math.floor(rat.length * 0.75)].toFixed(3)}  range ${rat[0].toFixed(3)} .. ${rat[rat.length - 1].toFixed(3)}   n=${rat.length}`);
  console.log(`                         OURS ${(od.cap / om.cap).toFixed(3)}   (declared sizes ${spec[2].size} / ${spec[0].size} = ${(spec[2].size / spec[0].size).toFixed(3)})`);
}
console.log('');
if (od) {
  st((r) => r.d && r.d.x0, 'date left x', od.x0);
  st((r) => r.d && r.d.x1, 'date right x', od.x1);
  st((r) => r.d && (r.d.x1 - r.d.x0), 'date width', od.x1 - od.x0);
  st((r) => r.d && r.d.y0, 'date top y', od.y0);
  st((r) => r.d && r.d.y1, 'date bottom y', od.y1);
  st((r) => r.d && (r.d.y1 - r.d.y0), 'date block height', od.y1 - od.y0);
  st((r) => r.d && r.d.cap, 'date CAP (median)', od.cap);
  st((r) => r.d && r.d.n, 'date blob count', od.n);
  st((r) => r.d && r.d.cx, 'date centre x', od.cx);
  st((r) => r.d && r.d.cy, 'date centre y', od.cy);
}
