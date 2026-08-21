// BUCK r9 (specialist) — the eagle against ITS OWN ROUNDEL, measured on the
// SVG the app actually emits (all three `struck()` copies, bevel included),
// and a sweep of the shrink factor that puts every point inside.
//
// B3's rule with a number: the tightest boundary the drawing declares is the
// device's own roundel, and `struck()` is passed `rField = 0` on this subject,
// so nothing in the pipeline enforces it. D8 as the rubric states it asks
// about one boundary per side and is structurally blind to this.
//
// The measure is the NORMALISED ELLIPSE RADIUS, not a circle radius: the
// roundel is an ellipse here, so "outside" means
// ((X-cx)/rx)^2 + ((Y-cy)/ry)^2 > 1.
//
// SUBJECTS COVERED (PY3): id `buck`, REVERSE, tiers icon/mid/full, value
// on and off. The pyramid is reported beside the eagle as the control — it is
// drawn from the same measurement and must come back comfortably inside.
//
//   node coloringbook/judge/_jk9fitseal.mjs [sweep]
import { marks } from './_jqgeom.mjs';
const mod = await import('../../src/art/coins.js');

// the measured roundels (frozen target `_jb4target.json`, mean of two references)
const PYR = { cx: 23.125, cy: 27.875, rx: 8.875, ry: 11.375 };
const EAG = { cx: 76.875, cy: 27.75, rx: 8.875, ry: 12.375 };
const SIZES = { icon: 38, mid: 54, full: 190 };

const rad = (p, E) => Math.hypot((p.x - E.cx) / E.rx, (p.y - E.cy) / E.ry);

// `only`: 'all' | 'mass' (the two identity-placed copies) | 'bevel' (the white
// offset copy `struck()` translates by -o,-o). Separating them matters: the
// bevel is a lighting artefact whose offset is a VIEWBOX constant per box
// width (`reliefOff` clamps at 1.7 units), so on a device 12 units across it
// is a large fraction of the shape at `icon` and a small one at `full` — and
// it cannot be constrained at the call site, because `spendOf()` bounds the
// offset against a CIRCLE CENTRED AT (50,50) and this subject's boundaries are
// two off-centre ellipses. Reported, not fixed (shared helper).
function measure(svg, only = 'all') {
  let M = marks(svg).filter((m) => m.el === 'path' || m.el === 'circle');
  if (only !== 'all') {
    const bev = (m) => m.fill === '#ffffff';
    M = M.filter((m) => (only === 'bevel' ? bev(m) : !bev(m)));
  }
  const out = {};
  for (const [tag, E] of [['pyramid', PYR], ['eagle', EAG]]) {
    let tot = 0, out1 = 0, worst = 0, at = null;
    for (const m of M) {
      const cx = (m.bbox.x0 + m.bbox.x1) / 2;
      if (Math.abs(cx - E.cx) > 26) continue;                 // this half of the note
      for (let i = 1; i < m.pts.length; i++) {
        const a = m.pts[i - 1], b = m.pts[i];
        const seg = Math.hypot(b.x - a.x, b.y - a.y);
        if (!seg) continue;
        for (let k = 0; k < 8; k++) {
          const t = (k + 0.5) / 8, q = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
          const r = rad(q, E);
          tot += seg / 8;
          if (r > 1) out1 += seg / 8;
          if (r > worst) { worst = r; at = { x: +q.x.toFixed(2), y: +q.y.toFixed(2) }; }
        }
      }
    }
    out[tag] = { frac: tot ? out1 / tot : 0, worst, at, tot };
  }
  return out;
}

console.log('EAGLE and PYRAMID against their own MEASURED roundels — the boundary D8 cannot see.');
console.log('Depth is reported in viewBox units AND in device pixels (§3 D8: one number cannot');
console.log('separate severities four hundred times apart).');
console.log('tier val copies | pyramid outside  worst r  depth u / px | eagle outside   worst r  depth u / px  at');
for (const [tier, size] of Object.entries(SIZES)) for (const value of [false, true]) {
  const boxW = mod.coinPx('buck', size).w;
  for (const only of ['all', 'mass', 'bevel']) {
    const r = measure(mod.coinSVG('buck', size, { side: 'reverse', value }), only);
    const f = (q, E) => {
      const du = Math.max(0, (q.worst - 1)) * Math.min(E.rx, E.ry);
      return `${(100 * q.frac).toFixed(3).padStart(8)}%  ${q.worst.toFixed(4)}  ${du.toFixed(3)}u ${(du * boxW / 100).toFixed(3)}px`;
    };
    console.log(`${tier.padEnd(4)} ${value ? 'on ' : 'off'} ${only.padEnd(5)} | ${f(r.pyramid, PYR)} | ${f(r.eagle, EAG)}  (${r.eagle.at.x},${r.eagle.at.y})`);
  }
}

// RESPONSE TEST (§4) — move the eagle's roundel target 3 units left in the
// metric only; the overhang must grow.
{
  const svg = mod.coinSVG('buck', 190, { side: 'reverse', value: false });
  const a = measure(svg).eagle;
  const save = EAG.cx; EAG.cx -= 3;
  const b = measure(svg).eagle;
  EAG.cx = save;
  console.log(`\nRESPONSE TEST — target roundel cx ${save} -> ${save - 3}: eagle outside ${(100 * a.frac).toFixed(3)}% worst ${a.worst.toFixed(4)}` +
    `  ->  ${(100 * b.frac).toFixed(3)}% worst ${b.worst.toFixed(4)}   ${b.frac > a.frac && b.worst > a.worst ? 'MOVED as expected' : '*** DID NOT MOVE — UNTRUSTED ***'}`);
}
// NULL TEST — the same metric run on the QUARTER's reverse against its own
// field circle, where the answer is independently known to be 0%.
{
  const M = marks(mod.coinSVG('quarter', 190, { side: 'reverse' })).filter((m) => m.el === 'path');
  const F = { cx: 50, cy: 50, rx: 47, ry: 47 };
  let tot = 0, out = 0, worst = 0;
  for (const m of M) for (let i = 1; i < m.pts.length; i++) {
    const a = m.pts[i - 1], b = m.pts[i], seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (!seg) continue;
    const q = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, r = rad(q, F);
    tot += seg; if (r > 1) out += seg; worst = Math.max(worst, r);
  }
  console.log(`NULL/CROSS-SUBJECT — quarter reverse against its r-47 blank: ${(100 * out / tot).toFixed(4)}% outside, worst r ${worst.toFixed(4)}` +
    ` — a subject that fits its boundary reads 0, so a non-zero note reading is the note's.`);
}

if (process.argv[2] === 'sweep') {
  // sweep a uniform shrink about the roundel centre, applied to the transform
  // the source now carries, and print where it crosses 1.000
  const ref = mod.coinSVG('buck', 190, { side: 'reverse', value: false });
  const cur = ref.match(/translate\(([\d.]+) ([\d.]+)\) scale\(([\d.]+)(?: ([\d.]+))?\)/);
  if (!cur) throw new Error('no seal transform found in the emitted SVG');
  const [tx, ty, sx] = cur.slice(1, 4).map(Number);
  const sy = cur[4] === undefined ? sx : Number(cur[4]);
  // substitute on the string the SVG actually contains, never on a rebuilt one:
  // a rebuilt `scale(0.5154 0.5154)` does not match an emitted `scale(0.5154)`,
  // `replaceAll` silently does nothing, and every row of the sweep comes back
  // bit-identical — which is §4's "two identical answers from two different
  // inputs is not agreement" showing up as a working instrument.
  const FROM = cur[0];
  console.log(`\nSWEEP over EVERY tier — the bevel offset is a viewBox constant per box width, so the`);
  console.log('smallest box carries the largest overhang and icon is the binding tier, not full.');
  console.log(`current transform translate(${tx} ${ty}) scale(${sx} ${sy})`);
  for (const f of [1.00, 0.96, 0.92, 0.90, 0.88, 0.86, 0.84, 0.82]) {
    const t2 = { sx: +(sx * f).toFixed(4), sy: +(sy * f).toFixed(4),
      tx: +(EAG.cx * (1 - f) + f * tx).toFixed(3), ty: +(EAG.cy * (1 - f) + f * ty).toFixed(3) };
    const row = [];
    for (const [tier, size] of Object.entries(SIZES)) {
      const s2 = mod.coinSVG('buck', size, { side: 'reverse', value: false })
        .replaceAll(FROM, `translate(${t2.tx} ${t2.ty}) scale(${t2.sx} ${t2.sy})`);
      if (!s2.includes(`scale(${t2.sx} ${t2.sy})`)) throw new Error('substitution did not take — the sweep would report the same drawing every row');
      const r = measure(s2).eagle;
      row.push(`${tier} ${(100 * r.frac).toFixed(3)}% r${r.worst.toFixed(4)}`);
    }
    console.log(`  f ${f.toFixed(2)}  translate(${t2.tx} ${t2.ty}) scale(${t2.sx} ${t2.sy})  ->  ${row.join('  |  ')}`);
  }
}
