// ROUND 10 (specialist), QUARTER OBVERSE — THE SELECTION TEST for the ridge
// locus. §4.2: "any instrument that picks one item out of a candidate set
// prints the WHOLE set."
//
// `_jw14cross.mjs` reports a RIDGE duty for our art as a median over the lines
// that produced a finite value — three of seven. Before any width is changed on
// the strength of that number, this prints what those three lines actually
// cross: every drawn mark, by authored group, with the arc length along the
// line at which it crosses. A ridge-duty number taken on a line that crosses no
// lit roll is not a measurement of the lit rolls.
//
// It uses `marks()` from the frozen `_jqgeom.mjs` (a library, not a report) and
// the frozen transect literals from `_jw14cross.mjs`. It computes nothing from
// our drawing that is then used as a locus.
//
// §4   RESPONSE: this enumerates rather than measures, so its response test is
//      an identity, not a perturbation — the crossing list it prints for each
//      line must contain every mark that `_wr3roll.mjs` sums over on that line,
//      with the same arc lengths. Run both and compare; they share no code.
// §4.1 NULL: crossings within 0.2u of either endpoint are end effects, dropped
//      and counted, exactly as `_jw14gen.mjs` does.
//
// Run: node coloringbook/judge/_wr2where.mjs [size]
import { marks } from './_jqgeom.mjs';

const SIZE = Number(process.argv[2] || 2126);
const TRANSECTS = [
  { name: 'T1 front of wig', a: { x: 55.0, y: 46.0 }, b: { x: 45.6, y: 21.6 } },
  { name: 'T2 mid wig', a: { x: 62.0, y: 49.5 }, b: { x: 52.6, y: 25.1 } },
  { name: 'T3 back of wig', a: { x: 69.0, y: 51.0 }, b: { x: 59.6, y: 26.6 } },
  { name: 'T4 occiput', a: { x: 75.0, y: 50.0 }, b: { x: 65.6, y: 25.6 } },
  { name: 'C1 our normal lo', a: { x: 57.0, y: 46.0 }, b: { x: 61.7, y: 18.4 } },
  { name: 'C2 our normal mid', a: { x: 62.0, y: 48.0 }, b: { x: 66.7, y: 20.4 } },
  { name: 'C3 our normal hi', a: { x: 66.5, y: 49.0 }, b: { x: 71.2, y: 21.4 } },
];

function group(m) {
  const near = (a, b) => Math.abs(a - b) < 1e-6;
  if (m.stroke === '#242c33' && near(m.opacity, 0.33)) return 'CUT   groove';
  if (m.stroke === '#cfd5da' && near(m.opacity, 0.85)) return 'ROLL  base/fine';
  if (m.stroke === '#242c33' && near(m.opacity, 0.28)) return '      face';
  if (m.stroke === '#242c33' && near(m.opacity, 0.42)) return '      dark';
  return `      ${m.fill}/${m.stroke}@${m.opacity}`;
}

// the `d` attribute of a mark, from the tag `marks()` kept
const dOf = (m) => (m.tag.match(/\sd="([^"]*)"/) || [null, m.el])[1];

function crossings(pts, t) {
  const L = Math.hypot(t.b.x - t.a.x, t.b.y - t.a.y);
  const ux = (t.b.x - t.a.x) / L, uy = (t.b.y - t.a.y) / L;
  const nx = -uy, ny = ux;
  const sideOf = (p) => (p.x - t.a.x) * nx + (p.y - t.a.y) * ny;
  const out = []; let dropped = 0;
  for (let i = 1; i < pts.length; i++) {
    const s0 = sideOf(pts[i - 1]), s1 = sideOf(pts[i]);
    if (s0 === 0 || (s0 > 0) !== (s1 > 0)) {
      const f = s0 / (s0 - s1);
      const p = { x: pts[i - 1].x + f * (pts[i].x - pts[i - 1].x), y: pts[i - 1].y + f * (pts[i].y - pts[i - 1].y) };
      const s = (p.x - t.a.x) * ux + (p.y - t.a.y) * uy;
      if (s > 0.2 && s < L - 0.2) out.push(s); else dropped++;
    }
  }
  return { out, dropped, L };
}

const mod = await import('../../src/art/coins.js');
const svg = mod.coinSVG('quarter', SIZE, { side: 'obverse' });
const all = marks(svg).filter((m) => m.isStroke && m.pts && m.pts.length > 1
  && (group(m).startsWith('CUT') || group(m).startsWith('ROLL')));

console.log(`### _wr2where — what each ridge/cut line actually crosses, quarter obverse @${SIZE}px`);
console.log(`### ${all.length} wig-relevant stroke marks in the render (cuts + lit rolls)\n`);

for (const t of TRANSECTS) {
  const hits = [];
  for (const m of all) {
    const { out, dropped } = crossings(m.pts, t);
    for (const s of out) hits.push({ s, g: group(m), d: dOf(m).slice(0, 34), sw: m.sw });
    if (dropped) hits.push({ s: NaN, g: group(m), d: dOf(m).slice(0, 34), sw: m.sw, drop: dropped });
  }
  const good = hits.filter((h) => Number.isFinite(h.s)).sort((a, b) => a.s - b.s);
  const nRoll = good.filter((h) => h.g.startsWith('ROLL')).length;
  const nCut = good.filter((h) => h.g.startsWith('CUT')).length;
  console.log(`## ${t.name}   ${nCut} cut crossings, ${nRoll} LIT-ROLL crossings`
    + `${nRoll === 0 ? '   <-- crosses NO lit roll' : ''}`);
  for (const h of good) console.log(`     s ${h.s.toFixed(2).padStart(6)}u  ${h.g}  sw ${String(h.sw).padStart(4)}  ${h.d}`);
  const drops = hits.filter((h) => h.drop);
  if (drops.length) console.log(`     (${drops.reduce((a, h) => a + h.drop, 0)} crossings dropped within 0.2u of an endpoint)`);
  console.log('');
}

console.log('The perturbation response for the duty NUMBERS lives in _wr1duty.mjs (a width');
console.log('sweep) and _wr3roll.mjs (a projection self-test at a known angle). This file is');
console.log('the selection test: it names the candidate set those two are choosing from.');
