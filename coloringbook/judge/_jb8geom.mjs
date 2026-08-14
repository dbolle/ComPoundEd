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
//   node coloringbook/judge/_jb8geom.mjs [json]
import { writeFileSync } from 'node:fs';
import { marks, polyLen, turns, lenOutside } from './_jqgeom.mjs';
const { coinSVG, coinPx } = await import('../../src/art/coins.js');

// FROZEN LITERALS
const BORDER = { x0: 5, y0: 5, x1: 95, y1: 51 };
const PAPER = { x0: 1.4, y0: 1.4, x1: 98.6, y1: 54.6 };
const ROUNDEL = { full: { pyr: { cx: 30, cy: 28, r: 16 }, eag: { cx: 70, cy: 28, r: 16 } },
  mid: { pyr: { cx: 30, cy: 28, r: 16 }, eag: { cx: 70, cy: 28, r: 16 } },
  icon: { pyr: { cx: 30, cy: 28, r: 15 }, eag: { cx: 70, cy: 28, r: 15 } } };
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
        const R = ROUNDEL[tier];
        const motif = device.filter((m) => m.el === 'path');
        const near = (m, c) => Math.abs((m.bbox.x0 + m.bbox.x1) / 2 - c.cx) < 26;
        const sum = (c) => {
          let tot = 0, out = 0, maxr = 0;
          for (const m of motif.filter((q) => near(q, c))) {
            const r = lenOutside(m.pts, c.r, c.cx, c.cy);
            tot += r.tot; out += r.out; maxr = Math.max(maxr, r.maxr);
          }
          return { tot, out, frac: tot ? out / tot : 0, deep: maxr - c.r };
        };
        roundel = { pyr: sum(R.pyr), eag: sum(R.eag) };
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

console.log('\nD8b — each reverse device against ITS OWN ROUNDEL (struck() omits rField for the note, so the relief is unconstrained)');
console.log('tier val |  pyramid outside r         depth |  eagle outside r           depth');
for (const r of rows.filter((q) => q.roundel))
  console.log(`${r.tier.padEnd(4)} ${r.withValue ? 'on ' : 'off'} | ${(100 * r.roundel.pyr.frac).toFixed(3).padStart(8)}%  ${r.roundel.pyr.deep.toFixed(3).padStart(8)} | ` +
    `${(100 * r.roundel.eag.frac).toFixed(3).padStart(8)}%  ${r.roundel.eag.deep.toFixed(3).padStart(8)}`);

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

// RESPONSE TEST (§4) — move a device 8 units right in a copy of the SVG string
// and confirm the containment number moves in the expected direction.
{
  const svg = coinSVG('buck', 190, { side: 'reverse', value: false });
  const moved = svg.replace(/cx="70"/g, 'cx="86"');
  const f = (s) => {
    const dev = marks(s).filter((m) => !isFrameRect(m) && !isWave(m));
    let tot = 0, out = 0, deep = 0;
    for (const m of dev) { const r = outsideRect(m.pts, BORDER); tot += r.tot; out += r.out; deep = Math.max(deep, r.deep); }
    return { frac: tot ? out / tot : 0, deep };
  };
  const a = f(svg), b = f(moved);
  console.log(`\nRESPONSE TEST — move the eagle roundel cx 70 -> 86: outside-border ${(100 * a.frac).toFixed(4)}% depth ${a.deep.toFixed(4)}` +
    `  ->  ${(100 * b.frac).toFixed(4)}% depth ${b.deep.toFixed(4)}   ${b.frac > a.frac && b.deep > a.deep ? 'MOVED as expected' : '*** DID NOT MOVE — instrument UNTRUSTED ***'}`);
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
  writeFileSync(new URL('./_jb8geom.json', import.meta.url), JSON.stringify({ generated: 'coloringbook/judge/_jb8geom.mjs', BORDER, PAPER, ROUNDEL, rows, d6rows, d7rows }, null, 2) + '\n');
