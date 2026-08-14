// PENNY ROUND 0, TASK 5 — OUR OWN LEGEND GEOMETRY, MEASURED OFF THE SHIPPED SVG.
//
// Not from the source constants and not from arithmetic on them: parsed out of
// the SVG `coinSVG()` actually emits, through `textMarks()` in
// `_jq8contain-v2.mjs`, imported unedited at its published hash. Same glyph
// cap-box model D8 uses, so D5 and D8 cannot disagree about where a letter is.
//
// Reported per legend, per side, per size, in the SAME convention as
// `_jp4band.json`: rInner / rOuter / cap / angular span. Nothing here is
// compared to the target — that happens in the scorecard, against gates that
// were written down first.
//
// Run: node coloringbook/judge/_jp8ours.mjs [id]
import { textMarks } from './_jq8contain-v2.mjs';

const ID = process.argv[2] || 'penny';
const mod = await import('../../src/art/coins.js');
const SIZES = [26, 38, 44, 54, 76, 84, 120, 190, 380];

const norm = (a) => { let d = a; while (d < 0) d += 360; while (d >= 360) d -= 360; return d; };

for (const side of ['obverse', 'reverse']) {
  console.log(`\n=== ${ID} ${side} — legend geometry off the shipped SVG ===`);
  for (const size of SIZES) {
    const svg = mod.coinSVG(ID, size, { side });
    const tm = textMarks(svg);
    if (!tm.length) { console.log(`  ${String(size).padStart(3)}px   NO LETTERING EMITTED`); continue; }
    // group glyphs into legends by their mean radius, 2-unit tolerance
    const glyphs = tm.map((m) => {
      const rs = m.pts.map((p) => Math.hypot(p.x - 50, p.y - 50));
      const as = m.pts.map((p) => norm(Math.atan2(p.y - 50, p.x - 50) * 180 / Math.PI));
      return { ch: m.ch, size: m.size, rIn: Math.min(...rs), rOut: Math.max(...rs), a: as };
    });
    const groups = [];
    for (const g of glyphs) {
      const mid = (g.rIn + g.rOut) / 2;
      let hit = groups.find((G) => Math.abs(G.mid - mid) < 2.0 && Math.abs(G.size - g.size) < 0.01);
      if (!hit) { hit = { mid, size: g.size, gs: [] }; groups.push(hit); }
      hit.gs.push(g);
      hit.mid = hit.gs.reduce((s, x) => s + (x.rIn + x.rOut) / 2, 0) / hit.gs.length;
    }
    for (const G of groups) {
      const rIn = Math.min(...G.gs.map((g) => g.rIn)), rOut = Math.max(...G.gs.map((g) => g.rOut));
      // angular span: unwrap the per-glyph centre angles about the first one
      const cen = G.gs.map((g) => { const s = Math.sin(g.a[0] * Math.PI / 180) + Math.sin(g.a[2] * Math.PI / 180),
        c = Math.cos(g.a[0] * Math.PI / 180) + Math.cos(g.a[2] * Math.PI / 180); return Math.atan2(s, c) * 180 / Math.PI; });
      const base = cen[0];
      const rel = cen.map((a) => { let d = a - base; while (d > 180) d -= 360; while (d < -180) d += 360; return d; });
      const halfAdv = (G.size * 0.62 / 2) / ((rIn + rOut) / 2) * 180 / Math.PI;
      const span = (Math.max(...rel) - Math.min(...rel)) + 2 * halfAdv;
      const word = G.gs.map((g) => g.ch).join('');
      console.log(`  ${String(size).padStart(3)}px   "${word}"  size ${G.size}  rInner ${rIn.toFixed(2)}  rOuter ${rOut.toFixed(2)}  cap ${(rOut - rIn).toFixed(2)}  span ${span.toFixed(1)} deg  (${G.gs.length} glyph boxes)`);
    }
  }
}
