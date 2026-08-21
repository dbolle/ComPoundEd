// ROUND 5, cent obverse — D7 knot-turn on the FITTED contours, re-implemented.
//
// WHY A NEW FILE. `_jp9edge.mjs` is the judge's D7 instrument for this coin and
// on this coin it returns a NULL RESULT: "FITTED none — every path on this side
// is authored". It identifies a fitted contour by matching /d="([^"]+)"/ against
// `mark.tag`, and `_jqgeom.mjs:179` stores `tag: t.slice(0, 200)`. HEAD.Lincoln's
// opening tag is far longer than 200 characters, so the closing quote is never
// in the string and the regex never matches — on ANY of the three paths D7 is
// supposed to score. The cent's round-0 scorecard already records this
// (`D7.obverse.instrument_note`). Neither file is edited (§1.1); this one reads
// the `d=` attributes off the emitted SVG directly, with no truncation.
//
// The geometry is `_jqgeom.mjs`'s own `flattenPath` + `turns`, unmodified, so
// this instrument and the judge's disagree only about WHICH PATHS ARE FOUND.
//
// SELECTION TEST (§4.2): every path on the side is printed with its opening
// coordinates and whether it was selected as fitted, so the choice of three out
// of N is auditable rather than asserted.
//
// Run: node coloringbook/judge/_jc5d7.mjs [id] [srcPath]
import { flattenPath, turns } from './_jqgeom.mjs';

const ID = process.argv[2] || 'penny';
const SRC = process.argv[3] || '../../src/art/coins.js';
const mod = await import(SRC.startsWith('.') ? SRC : `file://${SRC}`);

// Fitted-contour identification, by the opening coordinates `_pybuild.mjs`
// writes. These are literals, not a function of the artefact's current shape:
// if a repair moves a start point the path drops out of the set LOUDLY (the
// selection table below shows it unmatched) rather than silently.
const FITTED = {
  'M -20.39 18': 'HEAD.Lincoln',
  'M 13.5 -27.05': 'HAIR.Lincoln',
  'M 15.15 12.77': 'BEARD',
};

// `_jqgeom.turns()` walks i = 1 .. K.length-2. On a CLOSED path `flattenPath`
// emits the start point twice (once for `M`, once for `Z`), so K[0] === K[last]
// and the knot AT the closure — the join between the last segment and the first
// — is the one knot on every closed path that is never evaluated. That is not a
// judgement call about the art; it is an off-by-one in the walk, and it exempts
// exactly one knot per closed path across the whole file. Measured separately
// here and reported (§1.1: demonstrate, report, do NOT fix).
export function closureTurn(K) {
  const n = K.length;
  if (n < 4) return null;
  const same = Math.abs(K[0].x - K[n - 1].x) < 1e-9 && Math.abs(K[0].y - K[n - 1].y) < 1e-9;
  if (!same) return null;
  const a = K[n - 2], b = K[0], c = K[1];
  let t = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x);
  while (t > Math.PI) t -= 2 * Math.PI; while (t < -Math.PI) t += 2 * Math.PI;
  return { deg: Math.abs(t * 180 / Math.PI), at: b };
}

export function d7(id = ID, side = 'obverse', size = 380) {
  const svg = mod.coinSVG(id, size, { side });
  const ds = [...svg.matchAll(/<path\b[^>]*?\sd="([^"]*)"/g)].map((m) => m[1]);
  const seen = new Set();
  const rows = [];
  for (const d of ds) {
    if (seen.has(d)) continue;
    seen.add(d);
    const { knots } = flattenPath(d);
    const T = turns(knots);
    const hit = Object.entries(FITTED).find(([k]) => d.startsWith(k));
    rows.push({
      d, name: hit ? hit[1] : null, knots: knots.length, K: knots, T,
      worst: T.length ? Math.max(...T.map((t) => t.deg)) : 0,
      over: T.filter((t) => t.deg > 75).length,
      authored: !/[CcSsQqTtAa]/.test(d),
    });
  }
  return rows;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('=== RESPONSE TEST (closed form) ===');
  {
    const sq = turns(flattenPath('M 0 0 L 10 0 L 10 10 L 0 10 Z').knots);
    console.log(`  square corner reads ${sq[0].deg.toFixed(3)} deg   (must be 90.000)`);
    const st = turns(flattenPath('M 0 0 L 10 0 L 20 0').knots);
    console.log(`  straight run reads  ${st[0].deg.toFixed(3)} deg   (must be 0.000)`);
    const c = turns(flattenPath('M 0 0 C 1 3 4 4 6 4 C 8 4 10 2 10 0').knots);
    console.log(`  two-C smooth arc worst ${Math.max(...c.map((t) => t.deg)).toFixed(3)} deg  (C is not dropped: ${c.length} interior knots seen)`);
    // a KNOWN kink: two C segments meeting at a right angle
    const k = turns(flattenPath('M 0 0 C 3 0 7 0 10 0 C 10 3 10 7 10 10').knots);
    console.log(`  deliberate right-angle join between two C segments reads ${Math.max(...k.map((t) => t.deg)).toFixed(3)} deg`);
  }

  for (const side of ['obverse']) {
    const rows = d7(ID, side);
    console.log(`\n=== SELECTION TEST — every path on the ${ID} ${side}, ${rows.length} distinct ===`);
    for (const r of rows)
      console.log(`  ${(r.name || '—').padEnd(13)} knots ${String(r.knots).padStart(3)}  worst ${r.worst.toFixed(1).padStart(6)}  over75 ${r.over}  ${r.authored ? 'authored' : 'curved  '}  ${r.d.slice(0, 34)}`);

    console.log(`\n=== D7 — ${ID} ${side}, FITTED CONTOURS ONLY ===`);
    for (const r of rows.filter((x) => x.name)) {
      console.log(`\n  ${r.name}: ${r.knots} knots, worst ${r.worst.toFixed(1)} deg, ${r.over} over 75`);
      const bad = r.T.filter((t) => t.deg > 60).sort((a, b) => b.deg - a.deg);
      for (const t of bad)
        console.log(`     knot ${String(t.i).padStart(3)}  ${t.deg.toFixed(1).padStart(6)} deg  at local (${t.at.x.toFixed(2)}, ${t.at.y.toFixed(2)})`);
      const cl = closureTurn(r.K);
      if (cl) console.log(`     knot   0  ${cl.deg.toFixed(1).padStart(6)} deg  at local (${cl.at.x.toFixed(2)}, ${cl.at.y.toFixed(2)})  << THE CLOSURE KNOT — _jqgeom.turns() never evaluates it`);
    }
    console.log('\n  closure knot, every closed path on this side (turns() sees none of these):');
    for (const r of rows) {
      const cl = closureTurn(r.K);
      if (cl && cl.deg > 75) console.log(`    ${(r.name || '(unnamed)').padEnd(13)} ${cl.deg.toFixed(1).padStart(6)} deg at (${cl.at.x.toFixed(2)}, ${cl.at.y.toFixed(2)})   ${r.d.slice(0, 30)}`);
    }
  }
}
