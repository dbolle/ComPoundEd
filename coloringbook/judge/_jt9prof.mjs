// R5 dime throat — the FULL perpendicular profile across the jaw AND the neck
// below it, so the throat's own dark run can be located rather than assumed.
//
// Round 4's `_jw4width.mjs` answers "how wide is the dark run AT the jaw line":
// its trough search is clamped to +-3 units of the drawn path, which is exactly
// right for the jaw and blind to anything further down the neck. This one keeps
// the same registration chain and the same tangential-average blur, and instead
// returns the WHOLE profile so every dark run in the window can be listed.
//
// FRAME. s runs along a FROZEN LITERAL centreline — the jaw axis as authored
// before round 4 turned the mark into a region, copied here as a literal so it
// cannot move when the art moves (§6.1: a locus may not be a function of the
// artefact under test):
//
//   M 19.4 21.4 C 17.6 21.4 14.2 21.4 11 21.2 C 7 21 3.4 19.4 0.4 18.2
//   C -3.2 16.8 -7.4 15 -10.4 13.6 C -11.4 13 -12.2 12.4 -12.6 11.6
//
// t is the perpendicular, n = (-ty, tx), so +t is toward the FACE and -t is
// down the neck. s = 0 at the chin end.
//
// §4.1 NULL TEST: HALF is printed on every line; a run whose half-depth
// crossing reaches +-HALF, or a trough sitting at +-HALF, is reported BOUND.
// §4 RESPONSE TEST: SELFTEST=1 paints TWO synthetic bands of known width at
// known offsets and requires both to be recovered.
//
// Run: node coloringbook/judge/_jt9prof.mjs [ref]
//      SELFTEST=1 node coloringbook/judge/_jt9prof.mjs
import sharp from 'sharp';
import { busted, discFor, makeMap } from './_jw4reg.mjs';
import { greyImg, walk, inside } from './_jw4width.mjs';
import { marks } from './_jqgeom.mjs';

const REFDIR = new URL('../ref/', import.meta.url).pathname;
export const AXIS = 'M 19.4 21.4 C 17.6 21.4 14.2 21.4 11 21.2 C 7 21 3.4 19.4 0.4 18.2'
  + ' C -3.2 16.8 -7.4 15 -10.4 13.6 C -11.4 13 -12.2 12.4 -12.6 11.6';
export const HALF = Number(process.env.HALF || 9);   // perpendicular half-window
const TANG = Number(process.env.TANG || 1.5);
export const SIGMA = Number(process.env.SIGMA ?? 0.5);   // perpendicular blur, local units
const DT = 0.05;
const STEP = Number(process.env.STEP || 2);

export function axisWalk(step = STEP) {
  return walk(marks(`<svg><path d="${AXIS}"/></svg>`)[0].pts, step);
}

// the averaged perpendicular profile at sample i; index k -> t = (k-N)*DT
export function profileAt(g, M, P, i, half = HALF, tang = TANG, poly = null) {
  const p = P[i];
  const nx = -p.ty, ny = p.tx;
  const N = Math.round(half / DT);
  const sum = new Float64Array(2 * N + 1), cnt = new Float64Array(2 * N + 1);
  const jmax = Math.round(tang / 0.25);
  for (let j = -jmax; j <= jmax; j++) {
    const q = { x: p.x + p.tx * j * 0.25, y: p.y + p.ty * j * 0.25 };
    for (let k = -N; k <= N; k++) {
      const t = k * DT;
      const lx = q.x + nx * t, ly = q.y + ny * t;
      if (poly && !inside(poly, lx, ly)) continue;
      const px = M.toPx(lx, ly);
      const v = bilin(g, px.px, px.py);
      if (!Number.isNaN(v)) { sum[k + N] += v; cnt[k + N]++; }
    }
  }
  let prof = new Float64Array(2 * N + 1);
  for (let k = 0; k < prof.length; k++) prof[k] = cnt[k] ? sum[k] / cnt[k] : NaN;
  // BLUR PAST THE FROST (§13.2). A cameo proof's bust is high-frequency
  // texture: raw, dime-obv-2 returns twenty-odd "runs" per profile, all
  // 0.10-0.55 units wide, which is the grain and not the relief. SIGMA is in
  // local units and is swept, not chosen — see the sweep in the report.
  if (SIGMA > 0) {
    const r = Math.ceil(3 * SIGMA / DT), ker = [];
    for (let k = -r; k <= r; k++) ker.push(Math.exp(-((k * DT) ** 2) / (2 * SIGMA * SIGMA)));
    const out = new Float64Array(prof.length);
    for (let k = 0; k < prof.length; k++) {
      let s = 0, w = 0;
      for (let j = -r; j <= r; j++) {
        const m = k + j; if (m < 0 || m >= prof.length || Number.isNaN(prof[m])) continue;
        s += prof[m] * ker[j + r]; w += ker[j + r];
      }
      out[k] = w ? s / w : NaN;
      if (Number.isNaN(prof[k])) out[k] = NaN;
    }
    prof = out;
  }
  return { prof, N, cnt, tOf: (k) => (k - N) * DT };
}
const bilin = (g, x, y) => {
  if (x < 0 || y < 0 || x > g.w - 2 || y > g.h - 2) return NaN;
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  const i = y0 * g.w + x0;
  return (1 - fx) * (1 - fy) * g.d[i] + fx * (1 - fy) * g.d[i + 1]
    + (1 - fx) * fy * g.d[i + g.w] + fx * fy * g.d[i + g.w + 1];
};

// every local minimum in the profile that is at least MINDEPTH grey levels deep
// measured against its own two shoulders, with its full width at half depth.
export function runs(pr, minDepth = 4) {
  const { prof, N } = pr;
  const ok = []; for (let k = 0; k < prof.length; k++) if (!Number.isNaN(prof[k])) ok.push(k);
  if (ok.length < 5) return [];
  const lo = ok[0], hi = ok[ok.length - 1];
  const out = [];
  for (let k = lo + 1; k < hi; k++) {
    if (Number.isNaN(prof[k - 1]) || Number.isNaN(prof[k + 1])) continue;
    if (!(prof[k] <= prof[k - 1] && prof[k] < prof[k + 1])) continue;
    // walk out to the first local max on each side
    let a = k; while (a > lo && prof[a - 1] >= prof[a]) a--;
    let b = k; while (b < hi && prof[b + 1] >= prof[b]) b++;
    const sl = prof[a], sr = prof[b];
    const depth = (sl + sr) / 2 - prof[k];
    if (!(depth >= minDepth)) continue;
    const cut = prof[k] + depth / 2;
    let ta = k; while (ta > lo && prof[ta] < cut) ta--;
    let tb = k; while (tb < hi && prof[tb] < cut) tb++;
    // t is the CENTRE of the half-depth span, not the argmin. A flat-bottomed
    // run (a band wider than the blur) has a plateau, and the argmin lands on
    // whichever end of the plateau the scan leaves last: the SELFTEST recovered
    // a band centred at t=-4 with an argmin at -2.65 and a span centred at
    // -3.93. The span centre is the measurement.
    out.push({ t: (pr.tOf(ta) + pr.tOf(tb)) / 2, argmin: pr.tOf(k),
      tTop: pr.tOf(tb), tBot: pr.tOf(ta), width: (tb - ta) * DT,
      depth, trough: prof[k], bound: ta === lo || tb === hi });
  }
  // merge duplicates that share a half-depth span (frost noise inside one run)
  out.sort((u, v) => v.depth - u.depth);
  const keep = [];
  for (const r of out) if (!keep.some((q) => r.t <= q.tTop && r.t >= q.tBot)) keep.push(r);
  return keep.sort((u, v) => v.t - u.t);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const B = await busted();
  const P = axisWalk();
  console.log(`axis: ${P[P.length - 1].s.toFixed(2)} local units, ${P.length} samples at ${STEP}`);
  console.log(`WINDOW (null test): t in [${-HALF}, ${+HALF}]; tangential average +-${TANG};`
    + ` a crossing at +-${HALF} is the BOUND. +t = toward the face, -t = down the neck.`);

  if (process.env.SELFTEST) {
    const disc = discFor('dime-obv-2.jpg');
    const M = makeMap(B, disc);
    const mk = marks(`<svg><path d="${AXIS}"/></svg>`)[0];
    for (const [W1, O1, W2, O2] of [[2.0, 0, 3.0, -4], [1.5, 1, 2.5, -5.5]]) {
      const off = (o, w) => {
        const pts = mk.pts.map((p, i, arr) => {
          const a = arr[Math.max(0, i - 1)], b = arr[Math.min(arr.length - 1, i + 1)];
          const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
          return { x: p.x + (-dy / L) * o, y: p.y + (dx / L) * o };
        }).map((p) => M.toPx(p.x, p.y));
        return `<polyline points="${pts.map((q) => `${q.px.toFixed(2)},${q.py.toFixed(2)}`).join(' ')}"`
          + ` fill="none" stroke="#303030" stroke-width="${(w * M.pxPerUnit).toFixed(2)}"/>`;
      };
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="951" height="951">`
        + `<rect width="951" height="951" fill="#c8c8c8"/>${off(O1, W1)}${off(O2, W2)}</svg>`;
      const g = await greyImg(await sharp(Buffer.from(svg)).png().toBuffer());
      const pr = profileAt(g, M, P, Math.round(P.length / 2), HALF, TANG, null);
      const rs = runs(pr, 4);
      console.log(`SELFTEST bands  w${W1}@t${O1} and w${W2}@t${O2}  ->  `
        + rs.map((r) => `w${r.width.toFixed(2)}@t${r.t.toFixed(2)} [${r.tBot.toFixed(2)}..${r.tTop.toFixed(2)}]`).join('  |  ')
        + (rs.some((r) => r.bound) ? '  BOUND' : ''));
    }
    process.exit(0);
  }

  const head = marks(`<svg><path d="${B.headD}"/></svg>`)[0].pts;
  const refs = process.argv[2] ? [process.argv[2]] : ['dime-obv-2.jpg', 'dime-obv-3.jpg', 'dime-obv.jpg'];
  const table = {};
  for (const ref of refs) {
    const disc = discFor(ref);
    const M = makeMap(B, disc);
    const g = await greyImg(REFDIR + ref);
    console.log(`\n=== ${ref}   ${M.pxPerUnit.toFixed(2)} px per local unit`);
    console.log('   s   local(x,y)         dark runs, deepest first:  t [tBot..tTop] w depth');
    const rows = [];
    for (let i = 0; i < P.length; i++) {
      const pr = profileAt(g, M, P, i, HALF, TANG, head);
      const rs = runs(pr, Number(process.env.MINDEPTH || 4));
      rows.push({ s: +P[i].s.toFixed(1), x: +P[i].x.toFixed(1), y: +P[i].y.toFixed(1), runs: rs.map((r) => ({ t: +r.t.toFixed(2), tBot: +r.tBot.toFixed(2), tTop: +r.tTop.toFixed(2), w: +r.width.toFixed(2), d: +r.depth.toFixed(1), bound: r.bound })) });
      console.log(`${P[i].s.toFixed(1).padStart(5)} (${P[i].x.toFixed(1)},${P[i].y.toFixed(1)})`.padEnd(22)
        + rs.map((r) => `${r.t.toFixed(2).padStart(6)} [${r.tBot.toFixed(2)}..${r.tTop.toFixed(2)}] w${r.width.toFixed(2)} d${r.depth.toFixed(0)}${r.bound ? ' BOUND' : ''}`).join(' | '));
    }
    table[ref] = rows;
  }
  console.log('\nJSON ' + JSON.stringify(table));
}
