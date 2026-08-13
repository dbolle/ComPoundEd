// D4 REVERSE — §15.1: "count it in the reference, twice, on two different
// photographs, and write both counts down."
//
// Round 1 recorded D4-reverse as BLOCKED and D4-obverse as N/A ("no repeated
// element"). N/A is NOT available on the reverse: the design has three
// candidate repeated elements, and I have looked at all three at 2000px
// (judge/_jq-rev3-grid.png and the wing/wreath zooms):
//
//   1. WING PRIMARIES — long parallel grooves down each wing. The most
//      countable thing on the coin: high contrast, roughly constant pitch.
//   2. WREATH LEAVES — olive leaves in pairs down two branches.
//   3. ARROWHEADS — the tips at the left end of the bundle.
//
// So D4's verdict turns on whether a COUNT is resolvable, not on whether a
// subject exists. This counts (1) on both independent references, at every
// radius in a declared band, and reports the count's stability. §15.1: if the
// two references disagree, that is information about the references.
//
// §22.2's warning is live here — the grooves are flat-bottomed, so a peak
// finder built for a photograph's ridges can return 0. The detector therefore
// counts ZERO CROSSINGS of the detrended signal, which is plateau-safe, and
// its response test is a synthetic comb of known count.
import sharp from 'sharp';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const dir = new URL('./', import.meta.url).pathname;

// count sign changes of a detrended, smoothed signal; each groove contributes
// exactly one down-up pair, so count = (number of negative runs).
export function countRuns(vals, win, minRun) {
  const n = vals.length;
  const dt = new Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0, c = 0;
    for (let k = -win; k <= win; k++) { const j = i + k; if (j >= 0 && j < n) { s += vals[j]; c++; } }
    dt[i] = vals[i] - s / c;
  }
  const sm = dt.map((_, i) => { let s = 0, c = 0; for (let k = -2; k <= 2; k++) if (i + k >= 0 && i + k < n) { s += dt[i + k]; c++; } return s / c; });
  const runs = []; let i = 0;
  while (i < n) {
    if (sm[i] >= 0) { i++; continue; }
    let j = i; while (j < n && sm[j] < 0) j++;
    if (j - i >= minRun) runs.push([i, j, Math.min(...sm.slice(i, j))]);
    i = j;
  }
  return runs;
}

export async function arcSample(file, D, r, a0, a1) {
  const { data, info } = await sharp(P(file)).flatten({ background: '#808080' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const n = Math.max(120, Math.round(2 * Math.PI * r * D.R * (a1 - a0) / 360));
  const v = [];
  for (let k = 0; k < n; k++) {
    const th = (a0 + (a1 - a0) * k / (n - 1)) * Math.PI / 180;
    const x = D.cx + r * D.R * Math.cos(th), y = D.cy + r * D.R * Math.sin(th);
    const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0;
    v.push(data[y0 * W + x0] * (1 - fx) * (1 - fy) + data[y0 * W + x0 + 1] * fx * (1 - fy)
      + data[(y0 + 1) * W + x0] * (1 - fx) * fy + data[(y0 + 1) * W + x0 + 1] * fx * fy);
  }
  return v;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // §4 RESPONSE TEST first: a synthetic comb of 9 grooves must come back as 9.
  const synth = [];
  for (let i = 0; i < 900; i++) synth.push(160 + 60 * Math.sign(Math.cos(2 * Math.PI * 9 * i / 900)));
  const rs = countRuns(synth, 60, 3);
  console.log(`RESPONSE TEST: synthetic comb of 9 flat-bottomed grooves -> counted ${rs.length}  ${rs.length === 9 ? 'PASS' : 'FAIL — instrument UNTRUSTED'}`);
  const synth13 = [];
  for (let i = 0; i < 900; i++) synth13.push(160 + 60 * Math.sign(Math.cos(2 * Math.PI * 13 * i / 900)));
  console.log(`             13 grooves -> counted ${countRuns(synth13, 60, 3).length}`);
  const flat = new Array(900).fill(160);
  console.log(`             flat (no grooves) -> counted ${countRuns(flat, 60, 3).length}  (must be 0)\n`);

  const REFS = [
    ['rev-3', 'quarter-rev-3.jpg', { cx: 999.50, cy: 999.45, R: 999.49 }],
    ['rev-2', 'quarter-rev-2.png', { cx: 374.50, cy: 374.37, R: 374.98 }],
  ];
  // LOCUS, declared before any count exists: the LEFT wing's primaries, crossed
  // by arcs centred on the coin centre. Read off _jq-rev3-grid.png: the left
  // wing occupies X 12..40, Y 28..55, i.e. angles ~150..205 deg at r 0.45..0.80R.
  const A0 = 150, A1 = 205;
  const RADII = [];
  for (let r = 0.45; r <= 0.801; r += 0.025) RADII.push(+r.toFixed(3));
  console.log(`LOCUS (declared): left wing, sector ${A0}..${A1} deg, radius ${RADII[0]}..${RADII[RADII.length - 1]} R.`);
  console.log('SEARCH BOUNDS: count in 0..40. A count of 0 or 40 is a failure report (§4.1).\n');

  const table = {};
  for (const [tag, file, D] of REFS) {
    table[tag] = {};
    for (const r of RADII) {
      const v = await arcSample(file, D, r, A0, A1);
      // detrend window = 3x the expected groove pitch upper bound; minRun 3 samples
      table[tag][r] = countRuns(v, Math.max(6, Math.round(v.length / 6)), 3).length;
    }
  }
  console.log('  r/R  ' + RADII.map((r) => r.toFixed(3).padStart(7)).join(''));
  for (const [tag] of REFS) console.log(tag.padEnd(7) + RADII.map((r) => String(table[tag][r]).padStart(7)).join(''));
  const agree = RADII.filter((r) => table['rev-3'][r] === table['rev-2'][r]);
  console.log(`\nradii where the two INDEPENDENT references return the same count: ${agree.length} of ${RADII.length}` + (agree.length ? ` (${agree.join(', ')})` : ''));
  const c3 = RADII.map((r) => table['rev-3'][r]), c2 = RADII.map((r) => table['rev-2'][r]);
  const mode = (a) => { const m = {}; for (const x of a) m[x] = (m[x] || 0) + 1; return Object.entries(m).sort((p, q) => q[1] - p[1])[0]; };
  console.log(`rev-3 counts: min ${Math.min(...c3)} max ${Math.max(...c3)}, modal ${mode(c3)[0]} appearing ${mode(c3)[1]}/${c3.length} times`);
  console.log(`rev-2 counts: min ${Math.min(...c2)} max ${Math.max(...c2)}, modal ${mode(c2)[0]} appearing ${mode(c2)[1]}/${c2.length} times`);
  console.log('\n§15.1: "The threshold is zero" — a count error of zero is required, so a count');
  console.log('that is not itself stable to zero across radii and references cannot be a gate.');
}
