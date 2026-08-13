// D8 — containment. % of drawn path length outside the field circle, every
// tier, both sides, from the SVG the app actually ships.
//
// What is EXCLUDED, and why (stated so a reader can audit the decision, per
// method doc 24.2 — a clip that protects a score also hides the drawing):
//   · the blank itself (fill = PALETTE[id].body) — it IS the coin's edge
//   · the two field circles at r = EDGE[id].field[tier]
//   · the specular highlight arc (white, opacity 0.26, r 43.4) — a lighting
//     effect drawn ON the blank, like the rim, not a design element
// Everything else — motif, relief, inscription glyphs, value scaffold — is
// scored. Glyphs are modelled as their cap box (approximate, and said so).
//
// Run: node coloringbook/judge/_jq8contain.mjs [srcModule]
//      RESPONSE=1 ... -> response test on a generated copy with one mark
//      translated 20 units outward.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { marks, polyLen, lenOutside, apply, parseTransform, mul } from './_jqgeom.mjs';

const SIZES = [26, 38, 44, 54, 76, 84, 120, 190, 380];
const tierOf = (s) => (s >= 76 ? 'full' : s >= 44 ? 'mid' : 'icon');

// glyph boxes for <text transform="translate(x y) rotate(d)">C</text>
export function textMarks(svg) {
  const out = [];
  // font-size / fill are on the wrapping <g>; track the last one seen
  let size = null;
  for (const m of svg.matchAll(/<g[^>]*font-size="([\d.]+)"[^>]*>|<text([^>]*)>([^<]*)<\/text>/g)) {
    if (m[1]) { size = Number(m[1]); continue; }
    const at = m[2] || '';
    const fs = at.match(/font-size="([\d.]+)"/);
    const s = fs ? Number(fs[1]) : size;
    if (!s) continue;
    const tr = at.match(/transform="([^"]*)"/);
    const xa = at.match(/\sx="([-\d.]+)"/), ya = at.match(/\sy="([-\d.]+)"/);
    let M = tr ? parseTransform(tr[1]) : [1, 0, 0, 1, 0, 0];
    if (xa) M = mul(M, [1, 0, 0, 1, Number(xa[1]), Number(ya ? ya[1] : 0)]);
    const adv = s * 0.62, cap = s * 0.72, desc = s * 0.06;
    const box = [{ x: -adv / 2, y: -cap }, { x: adv / 2, y: -cap }, { x: adv / 2, y: desc }, { x: -adv / 2, y: desc }, { x: -adv / 2, y: -cap }];
    out.push({ el: 'text', ch: m[3], size: s, pts: box.map((p) => apply(M, p)), isRegion: true, isStroke: false, fill: 'text' });
  }
  return out;
}

// Structural classification — PALETTE/EDGE are not exported by coins.js and
// the judge does not edit it, so the coin's furniture is identified by what it
// IS in the emitted document rather than by a colour constant.
function classify(mk, i) {
  if (i === 0) return 'blank';                                    // the milled/plain blank
  if (mk.el === 'circle' && Math.abs(mk.bbox.x0 + mk.bbox.x1 - 100) < 1e-6
      && Math.abs(mk.bbox.y0 + mk.bbox.y1 - 100) < 1e-6
      && (mk.bbox.x1 - mk.bbox.x0) / 2 > 35) return mk.isStroke ? 'field-ring' : 'field';
  if (mk.stroke === '#ffffff' && Math.abs(mk.opacity - 0.26) < 1e-6) return 'specular';
  return 'drawn';
}
// rField, read off the emitted field circle itself
function fieldRadius(all) {
  for (const mk of all) {
    if (mk.el === 'circle' && Math.abs(mk.bbox.x0 + mk.bbox.x1 - 100) < 1e-6 && (mk.bbox.x1 - mk.bbox.x0) / 2 > 35) {
      return (mk.bbox.x1 - mk.bbox.x0) / 2;
    }
  }
  throw new Error('no field circle found — the parse is wrong, D8 is UNTRUSTED');
}

export async function measure(mod, id) {
  const rows = [];
  for (const side of ['obverse', 'reverse']) {
    for (const size of SIZES) {
      const tier = tierOf(size);
      const svg = mod.coinSVG(id, size, { side });
      const geo = marks(svg);
      const rField = fieldRadius(geo);
      const all = [...geo, ...textMarks(svg)];
      let tot = 0, out41 = 0, out47 = 0, maxr = 0, worst = null;
      const excluded = [];
      for (let i = 0; i < all.length; i++) {
        const mk = all[i];
        const cls = mk.fill === 'text' ? 'drawn' : classify(mk, i);
        if (cls !== 'drawn') { excluded.push({ cls, maxr: lenOutside(mk.pts, 1e9).maxr }); continue; }
        const a = lenOutside(mk.pts, rField);
        const b = lenOutside(mk.pts, 47);
        tot += a.tot; out41 += a.out; out47 += b.out;
        const half = mk.isStroke && mk.sw ? mk.sw / 2 : 0;
        if (a.maxr + half > maxr) { maxr = a.maxr + half; worst = mk.tag ? mk.tag.slice(0, 70) : 'text ' + mk.ch; }
      }
      rows.push({ side, size, tier, rField, len: tot, pctOutField: tot ? (100 * out41) / tot : 0, pctOutDisc: tot ? (100 * out47) / tot : 0, maxr, worst, excluded });
    }
  }
  return rows;
}

const SRC = process.argv[2] || '../../src/art/coins.js';
const mod = await import(SRC);
const rows = await measure(mod, 'quarter');
console.log('side      size tier  rField   drawn len   % outside field   % outside disc   max radius (incl stroke half-width)');
for (const r of rows) {
  console.log(`${r.side.padEnd(8)} ${String(r.size).padStart(4)} ${r.tier.padEnd(5)} ${r.rField.toFixed(1)}  ${r.len.toFixed(1).padStart(9)}   ${r.pctOutField.toFixed(4).padStart(9)}%   ${r.pctOutDisc.toFixed(4).padStart(9)}%   ${r.maxr.toFixed(2)}`);
}
const worstRow = rows.reduce((a, b) => (b.pctOutField > a.pctOutField ? b : a));
console.log(`\nWORST: ${worstRow.pctOutField.toFixed(4)}% outside the field circle (${worstRow.side} ${worstRow.size}px), max radius ${worstRow.maxr.toFixed(2)} from ${worstRow.worst}`);
console.log('excluded elements at ' + rows[0].side + ' ' + rows[0].size + 'px:', JSON.stringify(rows[0].excluded.map((e) => `${e.cls} r<=${e.maxr.toFixed(1)}`)));

// the other four coins, as context (D8's owner is "last toucher", so a
// pre-existing failure elsewhere must not be attributed to the quarter)
for (const other of mod.COIN_IDS.filter((i) => i !== 'quarter' && i !== 'buck')) {
  const r = await measure(mod, other);
  const w = r.reduce((a, b) => (b.pctOutField > a.pctOutField ? b : a));
  console.log(`context ${other}: worst ${w.pctOutField.toFixed(4)}% outside field (${w.side} ${w.size}px), max r ${w.maxr.toFixed(2)}`);
}

if (process.env.RESPONSE) {
  const srcPath = new URL('../../src/art/coins.js', import.meta.url).pathname;
  let code = readFileSync(srcPath, 'utf8');
  const anchor = '<circle cx="50" cy="27.8" r="${rHead}"/>';   // the eagle's head
  if (!code.includes(anchor)) throw new Error('RESPONSE anchor missing — fix the test before trusting D8');
  code = code.replace(anchor, '<circle cx="50" cy="7.8" r="${rHead}"/>');
  const money = new URL('../../src/engine/money.js', import.meta.url).pathname;
  code = code.replace(/from '\.\.\/engine\/money\.js'/, `from '${money}'`);
  const dir = mkdtempSync(join(tmpdir(), 'jq8-'));
  const pth = join(dir, 'coins-moved.js');
  writeFileSync(pth, code);
  const moved = await import('file://' + pth);
  const r2 = await measure(moved, 'quarter');
  const w2 = r2.filter((x) => x.side === 'reverse').reduce((a, b) => (b.pctOutField > a.pctOutField ? b : a));
  const base = rows.filter((x) => x.side === 'reverse').reduce((a, b) => (b.pctOutField > a.pctOutField ? b : a));
  console.log(`\nRESPONSE TEST: eagle head moved 30 units up (outside the field circle).`);
  console.log(`  reverse worst %% outside field: ${base.pctOutField.toFixed(4)} -> ${w2.pctOutField.toFixed(4)}`);
  console.log(w2.pctOutField > base.pctOutField + 0.1 ? '  RESPONSE TEST PASS' : '  RESPONSE TEST FAIL — D8 is UNTRUSTED');
}
