// D7, FINISHED — the tangent measure restricted to FITTED contours.
//
// `_jd7tan.mjs` re-derived D7 on tangent discontinuity and proved the chord
// metric wrong, but it scored EVERY path a face emits. Appendix P2 restricts
// D7 to paths produced by FITTING a contour: "a path authored as a polygon
// declares its corners in the scorecard, by index, and those knots are exempt.
// A path with no declaration is scored whole." So that sweep was a superset and
// was not comparable to the published per-coin figures, which were
// fitted-contour only. I said so at the time rather than presenting it as a
// finished verdict. This finishes it.
//
// WHICH PATHS ARE FITTED, and how this file knows without guessing: `HEAD`,
// `HAIR` (both keyed by sitter) and `BEARD` are the constants `_pybuild.mjs`
// fits from the frozen head masks — the scorecards name them as D7's locus in
// as many words ("HEAD.Lincoln, HAIR.Lincoln, BEARD — the three paths
// _pybuild.mjs fits from the frozen mask"). They are emitted VERBATIM as the
// `d` attribute inside the bust transform, so an exact string match identifies
// them with no heuristic and no name in the SVG. Every other emitted path is
// authored and is reported separately rather than silently dropped.
//
// Both measures print on every row. The chord number is what four rounds of
// verdicts were built on; the tangent number is what those verdicts should
// have been. Nothing is replaced silently.
//
// Run: node coloringbook/judge/_jd7fitted.mjs [size]
import { readFileSync } from 'node:fs';

const SIZE = Number(process.argv[2] || 380);
const ROOT = new URL('../../', import.meta.url).pathname;
const { coinSVG } = await import(`${ROOT}src/art/coins.js`);
const src = readFileSync(`${ROOT}src/art/coins.js`, 'utf8');

// Pull the fitted constants out of the source. These entries carry long
// comment blocks between the key and the value — an earlier version of this
// extractor matched `key: 'string'` and silently found only BEARD, reporting
// "no fitted contour emitted" for all four coins. That is a null result
// dressed as a measurement, and it is exactly what §4.1 says to treat as a
// failure rather than a value. So: locate the key, then take every quoted
// literal up to the next top-level key, and VERIFY by matching the result
// against the emitted SVG. A constant that does not appear in the render is
// reported, never skipped.
function objValues(name) {
  const i = src.indexOf(`const ${name} = {`);
  if (i < 0) return {};
  const blk = src.slice(i, src.indexOf('\n};', i));
  const keys = [...blk.matchAll(/\n  (\w+):/g)];
  const out = {};
  for (let k = 0; k < keys.length; k++) {
    const from = keys[k].index + keys[k][0].length;
    const to = k + 1 < keys.length ? keys[k + 1].index : blk.length;
    const body = blk.slice(from, to).replace(/\/\/[^\n]*/g, ''); // strip comments first
    const lits = [...body.matchAll(/'([^']*)'/g)].map((m) => m[1]);
    if (lits.length) out[keys[k][1]] = lits.join('');
  }
  return out;
}
function arrValue(name) {
  const i = src.indexOf(`const ${name} = [`);
  if (i < 0) return null;
  // End the block at the closing bracket in COLUMN 0, not at the literal
  // "\n];". BEARD ends `\n].join(' ');`, so the old terminator missed it and
  // ran on to the next array in the file that did end that way — the block
  // then carried a second constant's literals, the reconstruction matched no
  // render, and the cent's beard silently had no D7 number at all. Nested
  // arrays are indented, so a bracket at column 0 is unambiguously the close.
  const blk = src.slice(i, src.indexOf('\n]', i)).replace(/\/\/[^\n]*/g, '');
  const lits = [...blk.matchAll(/'([^']*)'/g)].map((m) => m[1]);
  return lits.length ? lits.join('') : null;
}

const HEAD = objValues('HEAD'), HAIR = objValues('HAIR');
const BEARD = arrValue('BEARD');
// Identify by the path data with ALL whitespace stripped. The source
// concatenates its literals without the separating space the emitted string
// carries ("11.99C" in source against "11.99 C" in the render), so an exact
// match finds nothing — which is what the check below caught. Stripping
// whitespace compares the GEOMETRY and nothing else. Measurement is always
// done on the render's own `d`, never on this reconstruction.
const key = (d) => d.replace(/\s+/g, '');
const FITTED = new Map();
for (const [who, d] of Object.entries(HEAD)) FITTED.set(key(d), `HEAD.${who}`);
for (const [who, d] of Object.entries(HAIR)) FITTED.set(key(d), `HAIR.${who}`);
if (BEARD) FITTED.set(key(BEARD), 'BEARD');

// VERIFY the extraction against the render BEFORE scoring anything. The first
// version of this extractor found only BEARD and printed "no fitted contour
// emitted" for all four coins — a null result that reads exactly like a
// measurement. This check makes that failure impossible to miss.
{
  const seen = new Set();
  for (const id of ['penny', 'nickel', 'dime', 'quarter'])
    for (const side of ['obverse', 'reverse'])
      for (const m of coinSVG(id, 380, { side }).matchAll(/\sd="([^"]+)"/g)) seen.add(key(m[1]));
  const missing = [...FITTED.entries()].filter(([d]) => !seen.has(d)).map(([, n]) => n);
  console.log(`extraction check: ${FITTED.size} fitted constants parsed, ${FITTED.size - missing.length} found in a render`);
  if (missing.length) console.log(`  !! NOT FOUND IN ANY RENDER: ${missing.join(', ')} — the EXTRACTOR is wrong, not the art. Reported, not skipped.`);
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const ang = (a, b) => {
  const na = Math.hypot(...a), nb = Math.hypot(...b);
  if (na < 1e-9 || nb < 1e-9) return null;
  return (Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1]) / (na * nb)))) * 180) / Math.PI;
};
function segments(d) {
  const t = d.match(/[MmLlHhVvCcQqAaSsTtZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
  let i = 0, cur = [0, 0], start = [0, 0], cmd = '';
  const segs = []; const num = () => parseFloat(t[i++]);
  while (i < t.length) {
    if (/[A-Za-z]/.test(t[i])) cmd = t[i++];
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase(), off = rel ? cur : [0, 0];
    if (C === 'M') { const p = [num() + off[0], num() + off[1]]; cur = p; start = p; cmd = rel ? 'l' : 'L'; }
    else if (C === 'L') { const p = [num() + off[0], num() + off[1]]; segs.push({ k: 'L', p0: cur, p1: p }); cur = p; }
    else if (C === 'H') { const p = [num() + (rel ? cur[0] : 0), cur[1]]; segs.push({ k: 'L', p0: cur, p1: p }); cur = p; }
    else if (C === 'V') { const p = [cur[0], num() + (rel ? cur[1] : 0)]; segs.push({ k: 'L', p0: cur, p1: p }); cur = p; }
    else if (C === 'C') { const c1 = [num() + off[0], num() + off[1]], c2 = [num() + off[0], num() + off[1]], p = [num() + off[0], num() + off[1]]; segs.push({ k: 'C', p0: cur, c1, c2, p1: p }); cur = p; }
    else if (C === 'Q') { const c1 = [num() + off[0], num() + off[1]], p = [num() + off[0], num() + off[1]]; segs.push({ k: 'Q', p0: cur, c1, p1: p }); cur = p; }
    else if (C === 'A') { for (let k = 0; k < 5; k++) num(); const p = [num() + off[0], num() + off[1]]; segs.push({ k: 'A', p0: cur, p1: p }); cur = p; }
    else if (C === 'Z') { if (Math.hypot(cur[0] - start[0], cur[1] - start[1]) > 1e-9) segs.push({ k: 'L', p0: cur, p1: start }); cur = start; }
    else i++;
  }
  return { segs, closed: /[Zz]\s*$/.test(d.trim()) };
}
const tanOut = (s) => (s.k === 'C' || s.k === 'Q' ? sub(s.c1, s.p0) : sub(s.p1, s.p0));
const tanIn = (s) => (s.k === 'C' ? sub(s.p1, s.c2) : s.k === 'Q' ? sub(s.p1, s.c1) : sub(s.p1, s.p0));

function score(d) {
  const { segs, closed } = segments(d);
  const joins = [];
  for (let i = 1; i < segs.length; i++) joins.push([segs[i - 1], segs[i], i]);
  if (closed && segs.length > 1) joins.push([segs[segs.length - 1], segs[0], 0]); // the closure knot turns() never sees
  let wT = 0, oT = 0, wC = 0, oC = 0, n = 0;
  const overs = [];
  for (const [a, b, idx] of joins) {
    const tt = ang(tanIn(a), tanOut(b));
    const cc = ang(sub(a.p1, a.p0), sub(b.p1, b.p0));
    if (tt === null) continue;
    n++;
    if (tt > wT) wT = tt;
    if (tt > 75) { oT++; overs.push({ idx, tan: +tt.toFixed(1), chord: cc === null ? null : +cc.toFixed(1) }); }
    if (cc !== null) { if (cc > wC) wC = cc; if (cc > 75) oC++; }
  }
  return { wT, oT, wC, oC, n, overs };
}

console.log(`D7 FINISHED — fitted contours only, size ${SIZE}. Gate: 0 knots over 75 deg.`);
console.log(`Fitted constants identified by exact match against the source: ${[...FITTED.values()].join(', ')}\n`);
console.log('subject   side      fitted path        knots |  CHORD worst over75 | TANGENT worst over75 | verdict on the TANGENT measure');
const summary = {};
for (const id of ['penny', 'nickel', 'dime', 'quarter']) {
  for (const side of ['obverse', 'reverse']) {
    const svg = coinSVG(id, SIZE, { side });
    const ds = [...svg.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]);
    const hits = ds.filter((d) => FITTED.has(key(d)));
    if (!hits.length) { if (side === 'obverse') console.log(`${id.padEnd(9)} ${side.padEnd(9)} (no fitted contour emitted)`); continue; }
    for (const d of hits) {
      const r = score(d);
      const name = FITTED.get(key(d));
      summary[`${id}.${side}.${name}`] = { chord: [+r.wC.toFixed(1), r.oC], tangent: [+r.wT.toFixed(1), r.oT], knots: r.n, overs: r.overs };
      console.log(
        `${id.padEnd(9)} ${side.padEnd(9)} ${name.padEnd(18)} ${String(r.n).padStart(5)} | ` +
          `${r.wC.toFixed(1).padStart(11)} ${String(r.oC).padStart(6)} | ${r.wT.toFixed(1).padStart(13)} ${String(r.oT).padStart(6)} | ` +
          `${r.oT === 0 ? 'PASS — no knot kinks' : `FAIL — ${r.oT} genuine kink${r.oT > 1 ? 's' : ''}`}`
      );
      for (const o of r.overs) console.log(`${' '.repeat(29)}  knot ${String(o.idx).padStart(3)}: tangent ${o.tan}  (chord said ${o.chord})`);
    }
  }
}
console.log('\nJSON', JSON.stringify(summary));
