// ROUND 7, QUARTER OBVERSE — D6's measurement: the WIDTH PROFILE of a mark,
// taken off the photograph, in viewBox units.
//
// COIN-ART-METHOD §14.2: "Converting a stroke to a region invents two numbers —
// the width at each end. Take them off the photograph: sample the feature's dark
// run perpendicular to its path at both ends and at the middle, in
// disc-normalised units, and build the region from those three widths. Report
// all three. A taper whose numbers came from taste is the same failure as a
// description from memory."
//
// METHOD. For each station along a mark's own centreline (resampled by arc
// length), take the image profile along the NORMAL out to +-4 viewBox units,
// locate the extremum (dark for a cut, bright for a lit roll) within +-2.0 of
// the centreline, and measure FULL WIDTH AT HALF DEPTH against a local
// background taken from |t| in 2.5..4.0. Report per THIRD of the mark's length.
//
// WHY THE OFFSET IS PRINTED. Our centreline is placed by our own head fit, not
// by the photograph; a normal sample across a centreline that misses the coin's
// cut by two units measures the field and returns a confident number for it
// (spec 4.3). So every station reports the located extremum's offset from our
// line, and a station whose extremum sits at the +-2.0 search bound is DROPPED
// and counted, never used (spec 4.1). The overlay `_jq7over.mjs` draws the same
// centrelines on the same source so the registration can be looked at.
//
// CONTRAST FLOOR. A station whose |extremum - background| is under 8 grey levels
// is not measuring a feature; it is measuring noise. Dropped and counted.
//
// CONTROLS built in, all printed by `node _jq7prof.mjs control`:
//   NULL     — three synthetic centrelines laid across the OPEN CHEEK, which
//              carries no cut on any reference. A profiler that returns widths
//              there is measuring nothing.
//   RESPONSE — every centreline re-run displaced +1.5 units along its own
//              normal. The reported offset must move by -1.5 +- 0.3 and the
//              width must not change materially; if the offset does not track,
//              the extremum finder is not finding the feature.
//   SCALE    — the same marks measured on two references whose discs differ by
//              2.7x in pixels must agree in viewBox units. That is the
//              between-reference spread the brief asks for, and it doubles as a
//              check that the viewBox conversion is right.
//
// Run: node coloringbook/judge/_jq7prof.mjs [control]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { marks } from './_jqgeom.mjs';

const FITS = JSON.parse(readFileSync('coloringbook/judge/_jq7fit.json'));
const DISC = {
  'quarter-obv-2.jpg': { cx: 374.41, cy: 374.36, R: 373.67 },   // frozen, _r3d13.mjs
  'quarter-obv-1932ngc.jpg': FITS['quarter-obv-1932ngc.jpg'],   // _jq7fit.mjs, control-validated
  'quarter-obv-4.jpg': FITS['quarter-obv-4.jpg'],
};
const REFS = ['quarter-obv-1932ngc.jpg', 'quarter-obv-2.jpg', 'quarter-obv-4.jpg'];

// WINDOW SIZES ARE SET BY THE COIN'S OWN PITCH, measured first by
// `_jq7trans.mjs` and not guessed: the wig's roll pitch is 0.95-1.75 viewBox
// units (median over four transects x three references) and its cuts are
// 0.25-0.55 units wide at half prominence. The first version of this file used
// HALF 4.0 / SEARCH 2.0, which spans three to four rolls, and it duly failed its
// own response test - 7 of 25 marks tracked a 1.5-unit displacement, the rest
// jumped to a NEIGHBOURING roll. A search window wider than the pitch cannot
// identify a feature; it can only pick one.
//
// So the search window is half the smallest measured pitch, and the local
// background band sits just outside it.
//
// TWO REGIMES, and the second was forced by the first run's own drop counts.
// The narrow setting below is right for the WIG TRAIN (ranks 1-10), whose
// neighbours are 0.95-1.75 units away. It is WRONG for the isolated marks - the
// jaw, the mouth, the chin crease, the nostril, the brow, the queue folds, the
// ribbon loops - whose nearest neighbour is 2.0-3.0 units away and whose dark
// runs are wider than the whole narrow window: run narrow, they return 6-17
// 'unbounded' or 'atbound' stations of 24 and cap every width at ~1.9 by
// construction. Round 4 measured the dime's jaw at 1.80-2.90 units wide; a
// window that cannot report 2.90 cannot measure a jaw.
//
// So HALF/SEARCH/BGLO are settable, the setting used is printed with every
// value, and the nearest-neighbour distance that justifies it is stated in the
// report. WIDE=1 selects the isolated-mark regime.
const WIDE = !!process.env.WIDE;
const HALF = WIDE ? 1.40 : 0.95;     // profile half-length, viewBox units
const SEARCH = WIDE ? 0.70 : 0.45;   // extremum search half-window (a bound)
const BGLO = WIDE ? 1.00 : 0.65;     // local background band, viewBox units
const FLOOR = 8;       // contrast floor, grey levels
const NUDGE = WIDE ? 0.45 : 0.30;    // response-test displacement, inside the search window

async function load(f) {
  const D = DISC[f];
  const upp = D.R / 47;                       // image px per viewBox unit
  const sigma = Math.max(0.6, 0.10 * upp);    // blur ~0.10 viewBox units
  const { data, info } = await sharp(`coloringbook/ref/${f}`).greyscale().blur(sigma).raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const at = (x, y) => {                      // bilinear
    if (x < 0 || y < 0 || x >= W - 1 || y >= H - 1) return null;
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    const i = y0 * W + x0;
    return data[i] * (1 - fx) * (1 - fy) + data[i + 1] * fx * (1 - fy)
      + data[i + W] * (1 - fx) * fy + data[i + W + 1] * fx * fy;
  };
  return { f, D, upp, sigma, W, H,
    sample: (vx, vy) => at(D.cx + (D.R * (vx - 50)) / 47, D.cy + (D.R * (vy - 50)) / 47) };
}

// resample a polyline to n stations by arc length, with unit tangents
function stations(P, n) {
  const cum = [0];
  for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
  const L = cum[cum.length - 1], out = [];
  for (let k = 0; k < n; k++) {
    const s = (L * (k + 0.5)) / n;
    let i = 1; while (i < cum.length - 1 && cum[i] < s) i++;
    const t = (s - cum[i - 1]) / Math.max(1e-9, cum[i] - cum[i - 1]);
    const p = { x: P[i - 1].x + (P[i].x - P[i - 1].x) * t, y: P[i - 1].y + (P[i].y - P[i - 1].y) * t };
    const dx = P[i].x - P[i - 1].x, dy = P[i].y - P[i - 1].y, m = Math.hypot(dx, dy) || 1;
    out.push({ p, s: s / L, nx: -dy / m, ny: dx / m });
  }
  return { st: out, L };
}

// one station: profile along the normal, locate the extremum, FWHD
function widthAt(img, st, dark, bias = 0) {
  const step = 0.05, prof = [];
  for (let t = -HALF; t <= HALF; t += step) {
    const v = img.sample(st.p.x + st.nx * (t + bias), st.p.y + st.ny * (t + bias));
    if (v === null) return { drop: 'offimage' };
    prof.push({ t, v });
  }
  const bgv = prof.filter((q) => Math.abs(q.t) >= BGLO).map((q) => q.v).sort((a, b) => a - b);
  if (!bgv.length) return { drop: 'nobg' };
  const bg = bgv[bgv.length >> 1];
  let ext = null;
  for (const q of prof) {
    if (Math.abs(q.t) > SEARCH) continue;
    if (!ext || (dark ? q.v < ext.v : q.v > ext.v)) ext = q;
  }
  if (!ext) return { drop: 'noext' };
  if (Math.abs(Math.abs(ext.t) - SEARCH) < step * 1.5) return { drop: 'atbound', off: ext.t };
  const contrast = dark ? bg - ext.v : ext.v - bg;
  if (contrast < FLOOR) return { drop: 'lowcontrast', contrast, off: ext.t };
  const half = dark ? (bg + ext.v) / 2 : (bg + ext.v) / 2;
  const inside = (v) => (dark ? v < half : v > half);
  const i0 = prof.findIndex((q) => q.t === ext.t);
  let a = i0; while (a > 0 && inside(prof[a - 1].v)) a--;
  let b = i0; while (b < prof.length - 1 && inside(prof[b + 1].v)) b++;
  if (a === 0 || b === prof.length - 1) return { drop: 'unbounded', contrast, off: ext.t };
  return { w: prof[b].t - prof[a].t, off: ext.t, contrast, bg, ext: ext.v };
}

const med = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };

// ── the subjects: our own drawn stroke marks, in viewBox units ──────────────
const mod = await import('../../src/art/coins.js');
const isBlankOrField = (m) => m.el === 'circle'
  && Math.abs(m.bbox.x0 + m.bbox.x1 - 100) < 1e-6 && (m.bbox.x1 - m.bbox.x0) / 2 > 35;
const isSpecular = (m) => m.stroke === '#ffffff' && Math.abs(m.opacity - 0.26) < 1e-6;
const plen = (P) => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y); return L; };

const svg = mod.coinSVG('quarter', 84, { side: 'obverse' });
const all = marks(svg).slice(1).filter((m) => !isBlankOrField(m) && !isSpecular(m) && m.isStroke)
  .sort((a, b) => plen(b.pts) - plen(a.pts));
// dark = a CUT (drawn in ink); bright = a LIT ROLL (drawn in field)
const subjects = all.map((m, i) => ({
  rank: i + 1, m, dark: m.stroke !== '#cfd5da', sw: m.sw,
  d: (m.tag.match(/\sd="([^"]*)"/) || [, ''])[1].replace(/\s+/g, ' '),
}));

const N = 24;
async function run(bias = 0, only = null) {
  const imgs = [];
  for (const f of REFS) imgs.push(await load(f));
  const rows = [];
  for (const s of only || subjects) {
    const { st, L } = stations(s.m.pts, N);
    const per = {};
    for (const img of imgs) {
      const thirds = [[], [], []], drops = {};
      for (const q of st) {
        const r = widthAt(img, q, s.dark, bias);
        if (r.drop) { drops[r.drop] = (drops[r.drop] || 0) + 1; continue; }
        thirds[Math.min(2, Math.floor(q.s * 3))].push(r);
      }
      per[img.f] = { raw: thirds.map((t) => t.map((r) => r.w)),
        w: thirds.map((t) => med(t.map((r) => r.w))),
        off: thirds.map((t) => med(t.map((r) => r.off))),
        c: thirds.map((t) => med(t.map((r) => r.contrast))),
        n: thirds.map((t) => t.length), drops,
      };
    }
    rows.push({ s, L, per });
  }
  return rows;
}

const fmt = (v, d = 2) => (v === null || v === undefined ? '  -  ' : v.toFixed(d).padStart(5));

if (process.argv[2] === 'control') {
  console.log('### CONTROLS\n');
  console.log('# NULL TEST — three centrelines across the OPEN CHEEK (viewBox), where no');
  console.log('# reference carries a cut. Widths here would mean the profiler invents features.');
  // The head faces LEFT and its local +x is FORWARD, so screen x = 49.57 -
  // 0.98 * x_local and screen y = 41.8 + 0.98 * y_local (read back off the
  // emitted eye mark, whose local (11.3,-7.3)..(18.1,-7.3) lands at
  // (38.5,34.6)..(31.9,34.6)). The open cheek - the patch this file's own
  // comment calls "the normaliser at 1.000", bounded by the eye above, the
  // mouth in front and the curls behind - is local x 8..16, y 0..8, i.e.
  // screen x 34..42, y 42..50. The FIRST version of this control put its lines
  // at screen x 60-64, which is the WIG, and it duly reported widths at
  // contrast 140 - a null test that was really a positive test.
  const cheek = [
    { rank: 'N1', dark: true, sw: 0, d: 'cheek A dark', m: { pts: [{ x: 36.0, y: 43.5 }, { x: 40.0, y: 46.5 }] } },
    { rank: 'N2', dark: true, sw: 0, d: 'cheek B dark', m: { pts: [{ x: 37.0, y: 46.5 }, { x: 41.0, y: 49.0 }] } },
    { rank: 'N3', dark: false, sw: 0, d: 'cheek C lit', m: { pts: [{ x: 36.0, y: 43.5 }, { x: 40.0, y: 46.5 }] } },
  ];
  for (const r of await run(0, cheek)) {
    for (const f of REFS) {
      const p = r.per[f];
      console.log(`  ${String(r.s.rank).padEnd(3)} ${r.s.d.padEnd(15)} ${f.padEnd(24)} n=${p.n.join('/')} of ${N}  w=${p.w.map((x) => fmt(x)).join(' ')}  contrast=${p.c.map((x) => fmt(x, 1)).join(' ')}  drops=${JSON.stringify(p.drops)}`);
    }
  }
  console.log(`\n# RESPONSE TEST — every subject re-run with the centreline displaced +${NUDGE} units`);
  console.log(`# along its own normal. The located offset must move by -${NUDGE} +- 0.15.`);
  const a = await run(0), b = await run(NUDGE);
  const f = REFS[0];
  let ok = 0, tot = 0;
  for (let i = 0; i < a.length; i++) {
    const o0 = med(a[i].per[f].off.filter((x) => x !== null)), o1 = med(b[i].per[f].off.filter((x) => x !== null));
    if (o0 === null || o1 === null) continue;
    tot++; const d = o1 - o0; if (Math.abs(d + NUDGE) <= 0.15) ok++;
    console.log(`  rank ${String(a[i].s.rank).padStart(2)}  offset ${fmt(o0)} -> ${fmt(o1)}   delta ${fmt(d)}   ${Math.abs(d + NUDGE) <= 0.15 ? 'tracks' : 'DOES NOT TRACK'}   ${a[i].s.d.slice(0, 46)}`);
  }
  console.log(`  RESPONSE: ${ok} of ${tot} track the displacement to within 0.15 units`);
} else {
  console.log(`### _jq7prof — width profile of every stroke-rendered mark on the quarter obverse`);
  console.log(`### ${N} stations per mark, thirds; widths and offsets in viewBox units.`);
  console.log(`### profile half-length ${HALF}, extremum search bound +-${SEARCH}, background band ${BGLO}..${HALF}, contrast floor ${FLOOR}`);
  for (const f of REFS) {
    const D = DISC[f];
    console.log(`### ${f}: disc cx ${D.cx} cy ${D.cy} R ${D.R} -> ${(D.R / 47).toFixed(2)} px per viewBox unit`);
  }
  console.log('');
  console.log('rank kind  sw   len  reference                 n(1/2/3)  width 1st  2nd  3rd   offset 1st 2nd 3rd   contrast');
  for (const r of await run()) {
    for (const f of REFS) {
      const p = r.per[f];
      console.log(`${String(r.s.rank).padStart(4)} ${(r.s.dark ? 'cut ' : 'lit ')} ${String(r.s.sw).padStart(3)} ${r.L.toFixed(1).padStart(5)}  ${f.padEnd(24)} ${p.n.join('/').padEnd(9)} ${p.w.map((x) => fmt(x)).join(' ')}    ${p.off.map((x) => fmt(x)).join(' ')}   ${p.c.map((x) => fmt(x, 1)).join(' ')} ${Object.keys(p.drops).length ? JSON.stringify(p.drops) : ''}`);
    }
    console.log(`     ${r.s.d.slice(0, 100)}`);
  }
}

// ── POOLED SUMMARY ─────────────────────────────────────────────────────────
// Per-third medians on ONE reference rest on 0-8 stations, which is why the
// per-reference table above disagrees with itself. Pooling every kept station
// from all three references into each third is the honest statistic: it states
// the BETWEEN-REFERENCE SPREAD the brief asks for as an interquartile range on
// the pooled sample, and a taper is only supported when the first and third
// thirds are separated by more than that range.
if (process.env.POOL) {
  const q = (a, p) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };
  console.log(`\n### POOLED over ${REFS.length} references — regime ${WIDE ? 'WIDE' : 'NARROW'} (HALF ${HALF}, SEARCH ${SEARCH}, BG ${BGLO}..${HALF})`);
  console.log('rank  n1 n2 n3   w1(q25-med-q75)      w2                   w3                  supported taper?');
  for (const r of await run()) {
    const T = [[], [], []];
    for (const f of REFS) r.per[f].raw.forEach((arr, i) => T[i].push(...arr));
    const cell = (a) => a.length ? `${q(a, 0.25).toFixed(2)}-${q(a, 0.5).toFixed(2)}-${q(a, 0.75).toFixed(2)}` : '   -    ';
    const m1 = q(T[0], 0.5), m3 = q(T[2], 0.5);
    const iqr = (a) => (a.length ? q(a, 0.75) - q(a, 0.25) : Infinity);
    const sep = m1 !== null && m3 !== null && Math.abs(m1 - m3) > Math.max(iqr(T[0]), iqr(T[2]));
    console.log(`${String(r.s.rank).padStart(4)}  ${T.map((a) => String(a.length).padStart(2)).join(' ')}   ${cell(T[0]).padEnd(20)} ${cell(T[1]).padEnd(20)} ${cell(T[2]).padEnd(20)} ${sep ? 'YES  ' + (m1 > m3 ? 'thins along' : 'widens along') : 'no'}`);
  }
}
