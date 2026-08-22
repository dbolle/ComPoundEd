// SPECIALIST INSTRUMENT — round 3, D5 lettering. GLYPH-BOX CONTAINMENT ONLY.
//
// `_jq8contain-v2.mjs` reports the max radius over EVERY drawn mark, so on
// seven of the eight faces the number it prints belongs to the bust or the
// motif and a legend could grow a long way before it showed. Round 1 left the
// worst glyph-box clearance at 0.5761 units and round 3 adds two legends, so
// the quantity that has to be watched is the max over TEXT marks alone.
//
// It uses `textMarks()` and `loadCoins()` from `_jq8contain-v2.mjs` unchanged —
// imported, never edited (§1.1) — so the glyph box here is the same box the
// containment gate scores: advance 0.62 x size, cap 0.72 x size, descender
// 0.06 x size, through the element's own transform.
//
// The field circle is a LITERAL, 44.07 at full and mid and 42.5 at icon, taken
// from the round-3 brief rather than read out of our own drawing (§6.1). It is
// printed on every row.
//
// §4.2 SELECTION: nothing is selected — every text mark on every id x side x
//   tier is scored and the worst is reported with the string it belongs to.
// §4.1 NULL: no search.
// §4 RESPONSE: `--response` moves one legend's baseline out by 1 unit in a
//   generated copy of the source and the worst radius must move with it.
//
// Run: node coloringbook/judge/_jl3glyph.mjs [path-to-coins.js] [--response]
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCoins, textMarks } from './_jq8contain-v2.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const FIELD = { full: 44.07, mid: 44.07, icon: 42.5 };
const SIZES = [26, 38, 44, 54, 76, 84, 120, 190, 380];

export async function scan(src) {
  const mod = await loadCoins(src);
  const rows = [];
  for (const id of mod.COIN_IDS.filter((i) => i !== 'buck')) {
    for (const side of ['obverse', 'reverse']) {
      for (const size of SIZES) {
        const svg = mod.coinSVG(id, size, { side });
        const tier = /r="42.5"/.test(svg) ? 'icon' : /r="44.07"/.test(svg) ? (size <= 54 ? 'mid' : 'full') : '?';
        let worst = 0, who = '—', n = 0;
        for (const mk of textMarks(svg)) {
          n++;
          for (const p of mk.pts) worst = Math.max(worst, Math.hypot(p.x - 50, p.y - 50));
          if (worst === Math.max(...mk.pts.map((p) => Math.hypot(p.x - 50, p.y - 50)))) who = mk.ch;
        }
        rows.push({ id, side, size, tier, worst, who, n });
      }
    }
  }
  return rows;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : join(ROOT, 'src/art/coins.js');
  const rows = await scan(readFileSync(path, 'utf8'));
  console.log(`glyph-box containment for ${path}`);
  console.log('field circle (LITERAL, from the round-3 brief): full 44.07  mid 44.07  icon 42.5');
  console.log('coin     side     size tier  glyphs  max glyph-box r   field   clearance');
  for (const r of rows) {
    const f = FIELD[r.tier] ?? NaN;
    console.log(`${r.id.padEnd(8)} ${r.side.padEnd(8)} ${String(r.size).padStart(4)} ${r.tier.padEnd(5)} ${String(r.n).padStart(5)}`
      + `   ${r.n ? r.worst.toFixed(4).padStart(9) : '        —'}    ${f.toFixed(2)}   ${r.n ? (f - r.worst).toFixed(4).padStart(8) : '       —'}`
      + `${r.n && r.worst > f ? '   *** OVER ***' : ''}`);
  }
  const inked = rows.filter((r) => r.n);
  const worst = inked.reduce((a, b) => ((FIELD[b.tier] - b.worst) < (FIELD[a.tier] - a.worst) ? b : a));
  console.log(`\nWORST glyph-box clearance: ${(FIELD[worst.tier] - worst.worst).toFixed(4)} units`
    + ` — ${worst.id} ${worst.side} at ${worst.size}px (${worst.tier}), max r ${worst.worst.toFixed(4)} against ${FIELD[worst.tier]}`);

  if (process.argv.includes('--response')) {
    const code = readFileSync(path, 'utf8');
    const anchor = "bOff: 1.17,";
    if (!code.includes(anchor)) console.log('RESPONSE: anchor not found — cannot run');
    else {
      const moved = await scan(code.replace(anchor, 'bOff: 0.17,'));
      const a = worst, b = moved.find((r) => r.id === 'quarter' && r.side === 'reverse' && r.size === 84);
      const a84 = rows.find((r) => r.id === 'quarter' && r.side === 'reverse' && r.size === 84);
      console.log(`RESPONSE: quarter bOff 1.17 -> 0.17 (baseline 1 unit further out):`
        + ` quarter reverse 84px max glyph r ${a84.worst.toFixed(4)} -> ${b.worst.toFixed(4)}`
        + `  (must rise by about 1.0; worst overall was ${a.id} ${a.side})`);
    }
  }
}
