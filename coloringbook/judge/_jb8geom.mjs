// BUCK r0 — D6 (edge quality), D7 (curve quality), D8 (containment), over the
// SVG the app actually ships, both sides, every tier, value scaffold on/off.
//
// SUBJECTS COVERED (PY3): id `buck`, BOTH sides, tiers icon/mid/full, value
// on and off. The D8 comparison row also runs `quarter` so the instrument is
// not one that has only ever been tried where it happens to work (§4.2).
//
// D8 IS RESTATED FOR A RECTANGLE. There is no field circle on this subject.
// The analogous constraint is the PRINTED BORDER RECTANGLE — the note's own
// outermost engraved element and the fiducial §18.1 registers on. Frozen as a
// LITERAL, not as an expression: X in [5,95], Y in [5,51] (`_blnorm.mjs`
// FRAME at its published hash). If a future round moves noteSVG's frame this
// locus does NOT move with it (§6.1).
//
// A second, tighter locus is scored because the note's own source invites it:
// `struck()` documents `rField` as "omitted where there is no field circle to
// respect (the $1 note)", so the note's relief is the only subject in the set
// whose bevel is unconstrained. Each device is therefore also scored against
// ITS OWN ROUNDEL.
//
// ── REPAIR, 2026-08-24 (ledger A7). TWO FAULTS, BOTH THE SAME DISEASE ───────
// This file held two hardcoded copies of our own art, and both had gone stale.
//
//   1. `ROUNDEL` was `{cx 30, cy 28, r 16}` / `{cx 70, cy 28, r 16}` — circles
//      that left `coins.js` with the rest of the r0 note geometry. The emitted
//      reverse draws ELLIPSES at (23.13, 27.88) rx 8.88 ry 11.38 and
//      (76.88, 27.75) rx 8.88 ry 12.38. D8b therefore scored each device
//      against a circle centred 6.9 units away from it, and printed
//      `0.000% outside, depth -3.294 / -1.324` at every tier — a PASS earned
//      because the wrong circle was BIGGER and happened to overlap, not
//      because anything is contained. Those six D8b rows are retracted below.
//
//   2. The RESPONSE test did `svg.replace(/cx="70"/g, 'cx="86"')`. No such
//      substring is emitted any more, so the "moved" SVG was byte-identical to
//      the original and the test printed *** DID NOT MOVE — UNTRUSTED *** on
//      every run. The instrument was self-declaring untrusted and being read
//      anyway.
//
// THE FIX, and why it is not just fresher literals. D8b's locus is now the
// JUDGE'S FROZEN, PHOTOGRAPH-MEASURED roundel (`_jb4target.json` `.mean`,
// produced from `bill-rev.jpg` + `bill-rev-2.jpg`), not our drawing. That
// satisfies R1 — a locus may not be a function of the artefact under test —
// which the old literal only pretended to satisfy by being a COPY of the
// artefact, and stopped satisfying the moment the artefact moved. It is an
// ellipse, so D8b is now scored against an ellipse.
//
// The RESPONSE test no longer substitutes text into the subject at all: it
// reads the eagle roundel out of the SVG it is about to score, shifts THAT
// element, and throws if the shift changed nothing. A response test that can
// silently match zero occurrences is not a test.
//
//   node coloringbook/judge/_jb8geom.mjs [json]
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { marks, polyLen, turns } from './_jqgeom.mjs';
import { JUDGE } from './_paths.mjs';
import { freezeWrite } from './_freeze.mjs';
const { coinSVG, coinPx } = await import('../../src/art/coins.js');

// FROZEN LITERALS — the note's own printed rectangles, from `_blnorm.mjs`
// FRAME at its published hash. These are NOT copies of our art: they are the
// note's structure, and they deliberately do not move if noteSVG's frame does.
const BORDER = { x0: 5, y0: 5, x1: 95, y1: 51 };
const PAPER = { x0: 1.4, y0: 1.4, x1: 98.6, y1: 54.6 };
// FROZEN TARGET, measured on the two reverse photographs, hashed in
// `_jb0hashes.json`. One locus for every tier: the note has no tiers.
const TARGET = JSON.parse(readFileSync(join(JUDGE, '_jb4target.json'), 'utf8'));
const ROUNDEL = { pyr: TARGET.mean.pyramid, eag: TARGET.mean.eagle };
for (const [k, v] of Object.entries(ROUNDEL))
  if (!(v.cx > 0 && v.rx > 0 && v.ry > 0)) throw new Error(`_jb4target.json .mean.${k} is not an ellipse — D8b UNTRUSTED`);
const SIZES = { icon: 38, mid: 54, full: 190 };

// EXCLUDED BY NAME (§3 D6's form), not by argument:
//   the two frame rects  — the note's paper edge and its printed border, the
//                          structural analogue of a coin's blank and rim;
//   the scallop wave     — the note's declared non-copy ornament border;
//   <text>               — lettering, which §3 D6 excludes by name.
const isFrameRect = (m) => m.el === 'rect' &&
  ((Math.abs(m.bbox.x0 - 1.4) < 0.01 && Math.abs(m.bbox.x1 - 98.6) < 0.01) ||
   (Math.abs(m.bbox.x0 - 5) < 0.01 && Math.abs(m.bbox.x1 - 95) < 0.01));
// The scallop wave is identified GEOMETRICALLY, not by its `d` string: the
// tag `marks()` returns is truncated to 200 chars and the wave's `d` is longer
// than that, so a string test silently matched nothing and the wave was scored
// as a device for one run. It is a long, flat, stroke-only path.
const isWave = (m) => m.el === 'path' && (m.bbox.x1 - m.bbox.x0) > 25 && (m.bbox.y1 - m.bbox.y0) < 4;

// depth outside an axis-aligned rect, in viewBox units
const outsideRect = (P, R) => {
  let tot = 0, out = 0, deep = 0, deepAt = null;
  for (let i = 1; i < P.length; i++) {
    const a = P[i - 1], b = P[i];
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (seg === 0) continue;
    const N = 16;
    for (let k = 0; k < N; k++) {
      const t = (k + 0.5) / N, p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      const d = Math.max(R.x0 - p.x, p.x - R.x1, R.y0 - p.y, p.y - R.y1, 0);
      tot += seg / N;
      if (d > 0) out += seg / N;
      if (d > deep) { deep = d; deepAt = p; }
    }
  }
  return { tot, out, frac: tot ? out / tot : 0, deep, deepAt };
};

// Fraction of a polyline's length outside an ELLIPSE, and how far outside.
// `rho` is the normalised radius sqrt(((x-cx)/rx)^2 + ((y-cy)/ry)^2): rho > 1
// is outside. Depth is reported as (rho - 1) scaled by the semi-axis in the
// direction of the offending point, which is the radial excess in viewBox
// units — the same quantity `lenOutside` reports for a circle, so the two
// columns stay comparable.
const outsideEllipse = (P, E) => {
  let tot = 0, out = 0, maxRho = 0, deep = 0;
  for (let i = 1; i < P.length; i++) {
    const a = P[i - 1], b = P[i];
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (seg === 0) continue;
    const N = 16;
    for (let k = 0; k < N; k++) {
      const t = (k + 0.5) / N;
      const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
      const u = (x - E.cx) / E.rx, v = (y - E.cy) / E.ry;
      const rho = Math.hypot(u, v);
      tot += seg / N;
      if (rho > 1) out += seg / N;
      if (rho > maxRho) {
        maxRho = rho;
        // semi-axis along this direction, so the excess is in viewBox units
        const rDir = rho > 0 ? Math.hypot(u * E.rx, v * E.ry) / rho : E.rx;
        deep = (rho - 1) * rDir;
      }
    }
  }
  return { tot, out, frac: tot ? out / tot : 0, maxRho, deep };
};

const rows = [];
const d6rows = [], d7rows = [];
for (const side of ['obverse', 'reverse']) {
  for (const [tier, size] of Object.entries(SIZES)) {
    for (const withValue of [false, true]) {
      const svg = coinSVG('buck', size, { side, value: withValue });
      if (/undefined|NaN|null/.test(svg)) throw new Error(`buck ${side} ${tier} value=${withValue}: undefined/NaN/null`);
      const M = marks(svg);
      const device = M.filter((m) => !isFrameRect(m) && !isWave(m));
      const all = M;
      const acc = (set, R) => {
        let tot = 0, out = 0, deep = 0, worst = null;
        for (const m of set) {
          const r = outsideRect(m.pts, R);
          tot += r.tot; out += r.out;
          if (r.deep > deep) { deep = r.deep; worst = { el: m.el, tag: m.tag.slice(0, 90), at: r.deepAt }; }
        }
        return { tot, out, frac: tot ? out / tot : 0, deep, worst };
      };
      const b = acc(device, BORDER), p = acc(device, PAPER), ba = acc(all, BORDER);
      // per-device roundel containment, reverse only
      let roundel = null;
      if (side === 'reverse') {
        const motif = device.filter((m) => m.el === 'path');
        // Which half of the note a mark belongs to — a partition of the note,
        // not a fact about our drawing, so it cannot go stale with the art.
        const half = (m, c) => (((m.bbox.x0 + m.bbox.x1) / 2 < 50) === (c.cx < 50));
        const sum = (c) => {
          let tot = 0, out = 0, deep = 0, maxRho = 0, n = 0;
          for (const m of motif.filter((q) => half(q, c))) {
            const r = outsideEllipse(m.pts, c);
            tot += r.tot; out += r.out; n++;
            if (r.maxRho > maxRho) { maxRho = r.maxRho; deep = r.deep; }
          }
          return { tot, out, n, frac: tot ? out / tot : 0, maxRho, deep };
        };
        roundel = { pyr: sum(ROUNDEL.pyr), eag: sum(ROUNDEL.eag) };
      }
      rows.push({ side, tier, size, withValue, nMarks: M.length, nDevice: device.length,
        border: b, paper: p, borderAll: ba, roundel });

      // D6 and D7 on the value-off draw only (the value scaffold is a label)
      if (!withValue) {
        const scored = device.filter((m) => m.el !== 'text');
        let uniform = 0, total = 0;
        const per = [];
        for (const m of scored) {
          const L = polyLen(m.pts);
          total += L;
          // a stroke-rendered mark has width-variation ratio exactly 1.000 by
          // construction: SVG strokes one width along the whole path.
          const ratio = m.isStroke ? 1.0 : null;
          if (ratio === 1) uniform += L;
          per.push({ el: m.el, isStroke: m.isStroke, len: +L.toFixed(2), ratio, tag: m.tag.slice(0, 80) });
        }
        per.sort((a, c) => c.len - a.len);
        d6rows.push({ side, tier, uniformLen: uniform, totalLen: total, frac: total ? uniform / total : 0, top: per.filter((q) => q.ratio === 1).slice(0, 6) });

        let worstAll = { deg: 0 }, worstFit = { deg: 0 }, nOver = 0, nOverFit = 0, nKnots = 0;
        for (const m of scored) {
          if (m.el !== 'path' || !m.knots.length) continue;
          const isFitted = /HEAD|TAIL/.test('') || m.knots.length > 20; // a fitted contour has many knots
          for (const t of turns(m.knots)) {
            nKnots++;
            if (t.deg > 75) nOver++;
            if (t.deg > worstAll.deg) worstAll = { ...t, tag: m.tag.slice(0, 70) };
            if (isFitted) { if (t.deg > 75) nOverFit++; if (t.deg > worstFit.deg) worstFit = { ...t, tag: m.tag.slice(0, 70) }; }
          }
        }
        d7rows.push({ side, tier, nKnots, nOver, worstAll: worstAll.deg, nOverFit, worstFit: worstFit.deg, worstTag: worstAll.tag });
      }
    }
  }
}

console.log('D8 — containment. Gate: 0.00% of device path length outside, at EVERY tier, with the depth beside it.');
console.log('LOCUS (frozen literals): printed border X 5..95 Y 5..51 | paper X 1.4..98.6 Y 1.4..54.6');
console.log('side     tier val | marks dev | outside BORDER      depth | outside PAPER       depth | ALL marks incl. frame');
for (const r of rows)
  console.log(`${r.side.padEnd(8)} ${r.tier.padEnd(4)} ${r.withValue ? 'on ' : 'off'} | ${String(r.nMarks).padStart(5)} ${String(r.nDevice).padStart(3)} | ` +
    `${(100 * r.border.frac).toFixed(4).padStart(9)}%  ${r.border.deep.toFixed(4).padStart(8)} | ` +
    `${(100 * r.paper.frac).toFixed(4).padStart(9)}%  ${r.paper.deep.toFixed(4).padStart(8)} | ` +
    `${(100 * r.borderAll.frac).toFixed(4).padStart(9)}%  ${r.borderAll.deep.toFixed(4).padStart(8)}`);

console.log('\nD8b — each reverse device against the roundel MEASURED ON THE NOTE (_jb4target.json .mean, two references)');
console.log(`LOCUS: pyramid (${ROUNDEL.pyr.cx}, ${ROUNDEL.pyr.cy}) rx ${ROUNDEL.pyr.rx} ry ${ROUNDEL.pyr.ry}` +
  ` | eagle (${ROUNDEL.eag.cx}, ${ROUNDEL.eag.cy}) rx ${ROUNDEL.eag.rx} ry ${ROUNDEL.eag.ry}`);
console.log('RETRACTED, 2026-08-24: the six rows this section printed before today read 0.000% outside at depth');
console.log('  -3.294 (pyramid) / -1.324 (eagle) against circles r16 at cx 30/70 that coins.js has not drawn since');
console.log('  v1.83.0. Those PASSes were an artefact of scoring against a larger, differently-centred circle.');
console.log('tier val | n |  pyramid outside      max rho    excess | n |  eagle outside        max rho    excess');
for (const r of rows.filter((q) => q.roundel))
  console.log(`${r.tier.padEnd(4)} ${r.withValue ? 'on ' : 'off'} | ${String(r.roundel.pyr.n).padStart(2)}| ${(100 * r.roundel.pyr.frac).toFixed(3).padStart(8)}%  ${r.roundel.pyr.maxRho.toFixed(4).padStart(8)}  ${r.roundel.pyr.deep.toFixed(3).padStart(8)} | ` +
    `${String(r.roundel.eag.n).padStart(2)}| ${(100 * r.roundel.eag.frac).toFixed(3).padStart(8)}%  ${r.roundel.eag.maxRho.toFixed(4).padStart(8)}  ${r.roundel.eag.deep.toFixed(3).padStart(8)}`);

console.log('\nD6 — fraction of device mark length carried by ratio-1.000 (uniform-width) marks. Gate 0.00%.');
console.log('     Excluded by name: the two frame rects, the scallop wave, <text>.');
for (const r of d6rows) {
  console.log(`${r.side.padEnd(8)} ${r.tier.padEnd(4)}  uniform ${r.uniformLen.toFixed(1).padStart(7)} of ${r.totalLen.toFixed(1).padStart(7)} units = ${(100 * r.frac).toFixed(2).padStart(6)}%`);
  for (const t of r.top) console.log(`            ${t.len.toFixed(1).padStart(7)}  ${t.el}  ${t.tag.replace(/\s+/g, ' ')}`);
}

console.log('\nD7 — max knot turn. Gate <= 75 deg. "fitted" = a contour with > 20 knots (HEAD.Washington).');
for (const r of d7rows)
  console.log(`${r.side.padEnd(8)} ${r.tier.padEnd(4)} knots ${String(r.nKnots).padStart(4)}  over75 ${String(r.nOver).padStart(3)}  worst ${r.worstAll.toFixed(1).padStart(6)} deg` +
    ` | fitted-only over75 ${String(r.nOverFit).padStart(3)} worst ${r.worstFit.toFixed(1).padStart(6)} deg   ${r.worstTag ? r.worstTag.replace(/\s+/g, ' ').slice(0, 60) : ''}`);

// RESPONSE TEST (§4) — shove the reverse device group outward and confirm the
// containment numbers move in the expected direction.
//
// The old version substituted `cx="70"` -> `cx="86"` into the SVG string. That
// substring stopped being emitted at v1.83.0, so `replace` matched nothing,
// the "moved" SVG was byte-identical and the test printed UNTRUSTED on clean
// art for every run since. The lesson is not "use a fresher substring": it is
// that a response test must not encode a fact about the subject at all.
//
// What it does now: it wraps everything after the paper/border rects in a
// translate group, which is valid for ANY emitted content, and it ASSERTS the
// injected defect actually changed the geometry before believing the result.
// If the wrap silently does nothing the run throws.
{
  const svg = coinSVG('buck', 190, { side: 'reverse', value: false });
  const shove = (s, dx, dy) => {
    // insert after the last frame <rect> so the note's own structure stays put
    const rects = [...s.matchAll(/<rect\b[^>]*>/g)];
    if (!rects.length) throw new Error('RESPONSE: no <rect> in the emitted reverse — the shape changed, fix the test');
    const last = rects[rects.length - 1];
    const at = last.index + last[0].length;
    const close = s.lastIndexOf('</svg>');
    if (close < at) throw new Error('RESPONSE: could not find </svg> after the frame rects');
    return s.slice(0, at) + `<g transform="translate(${dx} ${dy})">` + s.slice(at, close) + '</g>' + s.slice(close);
  };
  const f = (s) => {
    const dev = marks(s).filter((m) => !isFrameRect(m) && !isWave(m));
    let tot = 0, out = 0, deep = 0;
    for (const m of dev) { const r = outsideRect(m.pts, BORDER); tot += r.tot; out += r.out; deep = Math.max(deep, r.deep); }
    return { frac: tot ? out / tot : 0, deep, n: dev.length,
      cxs: dev.map((m) => ((m.bbox.x0 + m.bbox.x1) / 2).toFixed(3)).join(',') };
  };
  const a = f(svg), b = f(shove(svg, 16, 0));
  // the injected defect must have MOVED THE GEOMETRY, or the test proved nothing
  if (a.n !== b.n) throw new Error(`RESPONSE: the wrap changed the mark count ${a.n} -> ${b.n}; the injection is not a pure translate`);
  if (a.cxs === b.cxs) throw new Error('RESPONSE: the 16-unit translate did not move a single device mark — the injection is a no-op, fix the test before trusting D8');
  console.log(`\nRESPONSE TEST — translate the whole reverse device +16 units in x (${a.n} device marks, all moved):`);
  console.log(`  outside-border ${(100 * a.frac).toFixed(4)}% depth ${a.deep.toFixed(4)}  ->  ${(100 * b.frac).toFixed(4)}% depth ${b.deep.toFixed(4)}` +
    `   ${b.frac > a.frac && b.deep > a.deep ? 'MOVED as expected — D8 responds' : '*** DID NOT MOVE — instrument UNTRUSTED ***'}`);
  // NULL TEST — a zero translate must not move the number at all
  const z = f(shove(svg, 0, 0));
  console.log(`  NULL: a ZERO translate gives ${(100 * z.frac).toFixed(4)}% depth ${z.deep.toFixed(4)}` +
    `   ${Math.abs(z.frac - a.frac) < 1e-12 && Math.abs(z.deep - a.deep) < 1e-9 ? 'unchanged, as it must be' : '*** THE WRAPPER ITSELF PERTURBS THE MEASUREMENT — UNTRUSTED ***'}`);
}
// SELECTION/COVERAGE — run the same rect metric on a coin, where the answer is known
{
  const svg = coinSVG('quarter', 190, { side: 'reverse' });
  const dev = marks(svg);
  let tot = 0, out = 0;
  for (const m of dev) { const r = outsideRect(m.pts, { x0: 3, y0: 3, x1: 97, y1: 97 }); tot += r.tot; out += r.out; }
  console.log(`CROSS-SUBJECT — quarter reverse against a 3..97 box (a coin's own blank is r47 about 50,50): ${(100 * out / tot).toFixed(4)}% outside` +
    `  — a sanity value, not a gate; it shows the rect metric returns ~0 on a subject that fits its box.`);
}

if (process.argv[2] === 'json')
  freezeWrite(join(JUDGE, '_jb8geom.json'),
    JSON.stringify({ generated: 'coloringbook/judge/_jb8geom.mjs', BORDER, PAPER, ROUNDEL, rows, d6rows, d7rows }, null, 2) + '\n',
    '_jb8geom.json');
