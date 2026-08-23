// THE DIME'S THREE FLAT LEGENDS — the lines on this face that carry no
// measurement at all.
//
// `INSCRIPTION.dime.main` (LIBERTY) carries four paragraphs: a fitted cap, a
// frozen band, a span in degrees, a per-advance. The three `rest` lines carry
// ONE sentence — "the three small lines were each a few units out once the two
// faces could be laid over one another: the motto sits further left and a
// little higher ... and the date rides up to meet it" — and no number. That is
// the cent's LIBERTY exactly: a placement someone liked, in the channel §0.1
// calls "how a child actually reads a coin".
//
// METHOD is `_py3band.mjs`'s and the reasoning is unchanged: on a struck coin a
// raised letter is an EDGE, not a tone — the field beside it and the top of the
// letter are the same reflectance — so |grad I| integrated along each row of a
// window holding one legend and nothing else gives the INK BAND, which is what
// `flatText`'s `y` and `size` set. The column profile over the same window
// gives the ink's horizontal extent, which is what `x` and `size` set.
//
// TWO THINGS THIS ADDS TO `_py3band.mjs`, both forced by this face:
//
//   ROTATION. The dime references are rotated in their crops by up to 9.4 deg
//   (`_do6sil.mjs`'s ICP). A row profile on a rotated coin smears its own band,
//   and the legends here are 3 units tall. Each file is de-rotated about the
//   disc centre by the angle that registers OUR bust onto it, and the angle is
//   printed beside every read.
//
//   THE MIDPOINT IS THE STATISTIC. `_py3band.mjs` established why: a raised
//   letter's bevel skirt widens the photographed band symmetrically and our
//   flat fill has none, so edges move with the threshold and midpoints do not.
//   Re-run with FRAC=0.15 / 0.25 / 0.40 to see it.
//
// CONTROL: our own render goes through the identical code path, and its read
// must land on the literal in `INSCRIPTION.dime` or nothing here is a letter.
//
// usage: node coloringbook/judge/_do12band.mjs [line]
//        FRAC=0.4 node coloringbook/judge/_do12band.mjs
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { ROOT } from './_paths.mjs';
import { POOL, samplerFor, samplerOurs } from './_dolib.mjs';
import { boundary, icp } from './_do6sil.mjs';

const FRAC = Number(process.env.FRAC || 0.25);

// Windows in the VIEWBOX frame — the legend's frame, not the head's. Each is
// stated with what it must exclude.
const LINES = [
  // the two motto lines are 5 units apart with a ~3.2-unit cap, so they are
  // read as ONE BLOCK (top = IN GOD's cap, bottom = WE TRUST's baseline) and
  // then each line's columns are read on its own row band.
  { name: 'IN GOD / WE TRUST', x0: 16, x1: 44, y0: 68, y1: 88,
    note: 'excludes the rim (x<12 at this height), the bust front (x>46) and the JS monogram (x~52)' },
  { name: 'the date', x0: 60, x1: 84, y0: 73, y1: 88,
    note: 'excludes the JS monogram to its left and the mint mark, which sits high right at y<72' },
];

// INSCRIPTION is module-private, so the declared literals are read out of the
// SOURCE rather than retyped here — a number quoted in an instrument that has
// drifted from the file it measures is the fault §6.1.1 exists to stop.
const src = readFileSync(join(ROOT, 'src/art/coins.js'), 'utf8');
const dimeBlock = src.slice(src.indexOf('  dime: {', src.indexOf('const INSCRIPTION = {')));
const spec = [...dimeBlock.slice(0, dimeBlock.indexOf('  quarter: {')).matchAll(
  /\{ kind: 'flat', text: ([^,]+), x: ([-\d.]+), y: ([-\d.]+), size: ([-\d.]+) \}/g,
)].map((m) => ({ text: m[1].replace(/'/g, ''), x: +m[2], y: +m[3], size: +m[4] }));
if (spec.length !== 3) throw new Error('_do12band: expected 3 flat lines on the dime, parsed ' + spec.length);

// THE BUST IS EXCLUDED TOO, and by the file's OWN bust rather than by a
// rectangle. WE TRUST's right end sits 0.2 viewBox units from the throat on
// our own drawing — the truncation runs diagonally straight through any
// rectangle that holds the date — so a rect window cannot isolate either
// legend. The first two runs of this instrument reported the window's own
// bound (68.00 on five files, 60.00 on seven) and are recorded here rather
// than quietly fixed.
function bandOf(at, L, isBust) {
  const H = 0.15;
  const rows = [], cols = [];
  const NY = Math.round((L.y1 - L.y0) / 0.1), NX = Math.round((L.x1 - L.x0) / 0.1);
  const E = new Float64Array(NX * NY);
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const x = L.x0 + (i + 0.5) * 0.1, y = L.y0 + (j + 0.5) * 0.1;
    // THE RIM IS EXCLUDED BY RADIUS, and it has to be: the first run of this
    // instrument put the motto's band bottom at 87.9 on five of nine files,
    // which is the window's own corner sitting on the rim (at x 22, y 87 the
    // radius is 46.4 and the rim seat is 43.75). r <= 41 is inside the seat on
    // every reference by more than its own spread.
    if (Math.hypot(x - 50, y - 50) > 41 || (isBust && isBust(x, y))) { E[j * NX + i] = -1; continue; }
    const a = at(x + H, y), b = at(x - H, y), c = at(x, y + H), d = at(x, y - H);
    E[j * NX + i] = (a == null || b == null || c == null || d == null) ? -1 : Math.hypot(a - b, c - d);
  }
  // Rows and columns are means over the USABLE cells only, and a row with
  // fewer than a third of its cells usable reports nothing at all rather than
  // a mean over a sliver.
  const rowN = [], colN = [];
  for (let j = 0; j < NY; j++) { let s = 0, n = 0; for (let i = 0; i < NX; i++) if (E[j * NX + i] >= 0) { s += E[j * NX + i]; n++; } rowN.push(n); rows.push(n > NX / 3 ? s / n : null); }
  for (let i = 0; i < NX; i++) { let s = 0, n = 0; for (let j = 0; j < NY; j++) if (E[j * NX + i] >= 0) { s += E[j * NX + i]; n++; } colN.push(n); cols.push(n > NY / 3 ? s / n : null); }
  const edges = (p0, o) => {
    const p = p0.map((v) => (v == null ? -1 : v));
    const srt = p.filter((v) => v >= 0).sort((a, b) => a - b);
    if (srt.length < 8) return { lo: null, hi: null, mid: null };
    const floor = srt[Math.floor(srt.length * 0.15)], max = srt[srt.length - 1];
    const T = floor + (max - floor) * FRAC;
    let lo = null, hi = null;
    for (let k = 0; k < p.length; k++) if (p[k] >= T) { lo = o + k * 0.1; break; }
    for (let k = p.length - 1; k >= 0; k--) if (p[k] >= T) { hi = o + k * 0.1; break; }
    return { lo, hi, mid: lo == null ? null : (lo + hi) / 2, T, floor, max };
  };
  return { row: edges(rows, L.y0), col: edges(cols, L.x0), rows, cols, rowN, colN };
}

const ourS = await samplerOurs('dime', 'obverse', 1600);
const ourB = boundary(ourS);
const atOurs = (x, y) => ourS.at(x, y);

/** a point-in-dilated-bust test built from a file's OWN device component */
function bustTester(B, dilate = 2) {
  const pts = B.pts;
  const G = 1.0, grid = new Map();
  for (const [x, y] of pts) {
    const k = `${Math.round(x / G)},${Math.round(y / G)}`;
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push([x, y]);
  }
  // centroid + per-angle max radius: the bust is star-shaped about its centroid
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
const ourBust = bustTester(ourB);

console.log(`band threshold FRAC=${FRAC}\n`);
console.log('CONTROL — our own render through the identical path.');
console.log('  INSCRIPTION.dime.rest declares:');
for (const l of spec) console.log(`     ${String(l.text).padEnd(9)} x ${String(l.x).padStart(5)}  baseline y ${String(l.y).padStart(5)}  size ${l.size}`);
console.log('');

const table = [];
for (const L of LINES) {
  console.log(`── ${L.name} ──  window x ${L.x0}..${L.x1}, y ${L.y0}..${L.y1}`);
  console.log(`   ${L.note}`);
  const oc = bandOf(atOurs, L, ourBust);
  console.log(`   OURS            band y ${oc.row.lo.toFixed(2)} .. ${oc.row.hi.toFixed(2)}  mid ${oc.row.mid.toFixed(2)}  height ${(oc.row.hi - oc.row.lo).toFixed(2)}   ink x ${oc.col.lo.toFixed(2)} .. ${oc.col.hi.toFixed(2)}  centre ${oc.col.mid.toFixed(2)}  width ${(oc.col.hi - oc.col.lo).toFixed(2)}`);
  const rows = [];
  for (const f of POOL) {
    const s = await samplerFor(f);
    const B = boundary(s);
    if (!B) continue;
    const fit = icp(ourB.pts, B.pts);
    const c = Math.cos(fit.th), si = Math.sin(fit.th);
    // de-rotate about the disc centre only; the rim fit already sets scale
    const at = (x, y) => {
      const dx = x - 50, dy = y - 50;
      return s.at(50 + c * dx - si * dy, 50 + si * dx + c * dy);
    };
    // the reference's own bust, expressed in the DE-ROTATED frame
    const bt = bustTester(B);
    const rotBust = (x, y) => {
      const dx = x - 50, dy = y - 50;
      return bt(50 + c * dx - si * dy, 50 + si * dx + c * dy);
    };
    const r = bandOf(at, L, rotBust);
    rows.push({ f, r, th: (fit.th * 180) / Math.PI });
    console.log(
      '  ', f.padEnd(24),
      r.row.lo == null || r.col.lo == null ? '  no band' :
        `band y ${r.row.lo.toFixed(2)} .. ${r.row.hi.toFixed(2)}  mid ${r.row.mid.toFixed(2)}  height ${(r.row.hi - r.row.lo).toFixed(2)}   ink x ${r.col.lo.toFixed(2)} .. ${r.col.hi.toFixed(2)}  centre ${r.col.mid.toFixed(2)}  width ${(r.col.hi - r.col.lo).toFixed(2)}   rot ${((fit.th * 180) / Math.PI).toFixed(1)}`,
    );
  }
  const st = (get, name, ourV) => {
    const v = rows.map(get).filter((x) => x != null).sort((a, b) => a - b);
    if (v.length < 4) { console.log(`     ${name}: only ${v.length} reads — UNMEASURED`); return; }
    const m = v[v.length >> 1];
    console.log(`     ${name.padEnd(16)} median ${m.toFixed(2).padStart(6)}   IQR ${v[Math.floor(v.length * 0.25)].toFixed(2)} .. ${v[Math.floor(v.length * 0.75)].toFixed(2)}   range ${v[0].toFixed(2)} .. ${v[v.length - 1].toFixed(2)}    OURS ${ourV.toFixed(2)}   delta ${(m - ourV).toFixed(2)}`);
  };
  st((r) => r.r.row.mid, 'band midpoint y', oc.row.mid);
  st((r) => r.r.row.lo, 'band top y', oc.row.lo);
  st((r) => r.r.row.hi, 'band bottom y', oc.row.hi);
  st((r) => r.r.row.hi - r.r.row.lo, 'band height', oc.row.hi - oc.row.lo);
  st((r) => r.r.col.mid, 'ink centre x', oc.col.mid);
  st((r) => r.r.col.lo, 'ink left x', oc.col.lo);
  st((r) => r.r.col.hi, 'ink right x', oc.col.hi);
  st((r) => r.r.col.hi - r.r.col.lo, 'ink width', oc.col.hi - oc.col.lo);
  console.log('');
  table.push({ L, oc, rows });
}
