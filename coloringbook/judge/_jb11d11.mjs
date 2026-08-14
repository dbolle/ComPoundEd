// BUCK r0 — D11 discriminability, and the reason the note needed its own run:
//
//   `_x6lib.mjs:17`  export const IDS = ['penny', 'nickel', 'dime', 'quarter'];
//
// The frozen phase-6 instrument DOES NOT CONTAIN THE NOTE. Every §17 number
// ever published — the 0.0534 obverse minimum, the 0.0808 reverse minimum, the
// 1.49x-1.51x ratio against a 3.0x gate, method-doc §23's headline block —
// is an 8-cell matrix over four denominations, in an app that ships five.
// This is PY3's failure ("a subject an instrument does not cover is a blank
// nobody can see") applied to the one dimension that scores the product goal.
//
// SUBJECTS COVERED (PY3): all FIVE ids x both sides = 10 cells, 45 pairs.
// Reproduces the 4-coin sub-matrix bit-for-bit so the new numbers can be
// checked against the published ones (PY6 equivalence).
//
// Construction is `_x6lib.mjs`'s, imported at its published hash and not
// re-implemented: rasterise at the real device pixel count, then nearest
// resample to 64x64. §17.2's "same width" is honoured — a note tile is
// 64 wide and 36 tall inside the 64x64 grid, so nothing leans on size.
//
//   node coloringbook/judge/_jb11d11.mjs [json]
import { writeFileSync } from 'node:fs';
import { rasterise, upN, mad, ncc, N, ICON_SIZE, SIDES, key } from '../_x6lib.mjs';
const mod = await import('../../src/art/coins.js');

const IDS5 = ['penny', 'nickel', 'dime', 'quarter', 'buck'];
const IDS4 = ['penny', 'nickel', 'dime', 'quarter'];

// iconCell, but tolerant of a non-square subject: a note is rasterised at its
// own device pixel count (w x h) and then nearest-resampled to N x N exactly
// as a disc is. That is §17.2's construction applied without special-casing.
async function cell(id, side) {
  const box = mod.coinPx(id, ICON_SIZE);
  const w = Math.round(box.w), h = Math.round(box.h);
  const svg = mod.coinSVG(id, ICON_SIZE, { side, decorative: true });
  if (/undefined|NaN/.test(svg)) throw new Error(`undefined/NaN in ${id}/${side}`);
  const r = await rasterise(svg, w, h);
  return { grey: upN(r.g, w, h, 1), rgb: upN(r.rgb, w, h, 3), w, h };
}

const cells = {};
for (const id of IDS5) for (const side of SIDES) cells[key(id, side)] = await cell(id, side);
console.log('device pixel counts at the icon tier (quarter diameter 26):');
for (const id of IDS5) console.log(`  ${id.padEnd(8)} ${cells[key(id, 'obverse')].w} x ${cells[key(id, 'obverse')].h}`);

const ks5 = IDS5.flatMap((id) => SIDES.map((s) => key(id, s)));
const ks4 = IDS4.flatMap((id) => SIDES.map((s) => key(id, s)));
const pairs = [];
for (let i = 0; i < ks5.length; i++) for (let j = i + 1; j < ks5.length; j++)
  pairs.push({ a: ks5[i], b: ks5[j], mad: mad(cells[ks5[i]].grey, cells[ks5[j]].grey),
    madRGB: mad(cells[ks5[i]].rgb, cells[ks5[j]].rgb), ncc: ncc(cells[ks5[i]].grey, cells[ks5[j]].grey) });

const min = (sel) => pairs.filter(sel).reduce((m, p) => (!m || p.mad < m.mad ? p : m), null);
const isBuck = (p) => p.a.startsWith('buck') || p.b.startsWith('buck');
const obv = (p) => p.a.endsWith('.o') && p.b.endsWith('.o');
const rev = (p) => p.a.endsWith('.r') && p.b.endsWith('.r');
const in4 = (p) => ks4.includes(p.a) && ks4.includes(p.b);

console.log('\nFULL 5-denomination matrix (grey MAD, the frozen metric), 45 pairs. Ten smallest:');
for (const p of [...pairs].sort((x, y) => x.mad - y.mad).slice(0, 10))
  console.log(`  ${p.a.padEnd(10)} ${p.b.padEnd(10)} MAD ${p.mad.toFixed(4)}   rgbMAD ${p.madRGB.toFixed(4)}   NCC ${p.ncc.toFixed(3)}`);

const m5 = min(() => true), m5o = min(obv), m5r = min(rev);
const m4 = min(in4), m4o = min((p) => in4(p) && obv(p)), m4r = min((p) => in4(p) && rev(p));
const mb = min(isBuck);
console.log('\n                              overall min           obverse min          reverse min      rev/obv');
console.log(`  4 coins (the published set) ${m4.mad.toFixed(4)} ${(m4.a + '/' + m4.b).padEnd(20)} ${m4o.mad.toFixed(4)} ${(m4o.a + '/' + m4o.b).padEnd(18)} ${m4r.mad.toFixed(4)} ${(m4r.a + '/' + m4r.b).padEnd(18)} ${(m4r.mad / m4o.mad).toFixed(2)}x`);
console.log(`  5 denominations (the app)   ${m5.mad.toFixed(4)} ${(m5.a + '/' + m5.b).padEnd(20)} ${m5o.mad.toFixed(4)} ${(m5o.a + '/' + m5o.b).padEnd(18)} ${m5r.mad.toFixed(4)} ${(m5r.a + '/' + m5r.b).padEnd(18)} ${(m5r.mad / m5o.mad).toFixed(2)}x`);
console.log(`\nD11, the NOTE's own contribution: its worst pair is ${mb.a}/${mb.b} at MAD ${mb.mad.toFixed(4)}`);
console.log(`  set minimum without the note ${m4.mad.toFixed(4)}; with it ${m5.mad.toFixed(4)}  ->  the note ${mb.mad > m4.mad ? 'does NOT set the minimum; it is the most separable subject in the set' : 'SETS the minimum'}`);
console.log(`  the note's closest pair is ${(mb.mad / m4.mad).toFixed(2)}x the set minimum, and ${(mb.mad / m4o.mad).toFixed(2)}x the obverse minimum §17 calls "expected poor"`);
console.log('\n§17 SET GATE: reverse minimum >= 3.0x obverse minimum — ESCALATE on every scorecard until met (§6.2)');
console.log(`  4-coin  ${(m4r.mad / m4o.mad).toFixed(2)}x   5-denomination ${(m5r.mad / m5o.mad).toFixed(2)}x   GATE 3.0x   FAIL`);

// PY6 equivalence — the 4-coin sub-matrix must reproduce discriminability.md
console.log('\nEQUIVALENCE (PY6) — discriminability.md / method §23 published, on the same construction:');
console.log('  obverse-only minimum 0.0534 nickel/dime ; reverse-only minimum 0.0794 dime/quarter (after the dime fix) ; ratio 1.49x');
console.log(`  this run:            ${m4o.mad.toFixed(4)} ${m4o.a}/${m4o.b} ; ${m4r.mad.toFixed(4)} ${m4r.a}/${m4r.b} ; ${(m4r.mad / m4o.mad).toFixed(2)}x`);

// RESPONSE TEST (§4) — make the note squarer and confirm only its own pairs move
{
  const orig = mod.NOTE_SCALE.w;
  const before = pairs.filter(isBuck).map((p) => p.mad);
  const beforeOther = pairs.filter((p) => !isBuck(p)).map((p) => p.mad);
  mod.NOTE_SCALE.w = 0.8; // a much squarer note
  const c2 = {};
  for (const id of IDS5) for (const side of SIDES) c2[key(id, side)] = await cell(id, side);
  const after = [], afterOther = [];
  for (let i = 0; i < ks5.length; i++) for (let j = i + 1; j < ks5.length; j++) {
    const v = mad(c2[ks5[i]].grey, c2[ks5[j]].grey);
    (ks5[i].startsWith('buck') || ks5[j].startsWith('buck') ? after : afterOther).push(v);
  }
  mod.NOTE_SCALE.w = orig;
  const movedBuck = before.filter((v, i) => v !== after[i]).length;
  const movedOther = beforeOther.filter((v, i) => v !== afterOther[i]).length;
  console.log(`\nRESPONSE TEST — NOTE_SCALE.w 1.24 -> 0.80: ${movedBuck} of ${before.length} note pairs moved, ${movedOther} of ${beforeOther.length} others moved` +
    `  ${movedBuck === before.length && movedOther === 0 ? 'EXACTLY as required' : '*** unexpected — UNTRUSTED ***'}`);
  console.log(`  note's worst pair ${Math.min(...before).toFixed(4)} -> ${Math.min(...after).toFixed(4)}`);
}

if (process.argv[2] === 'json')
  writeFileSync(new URL('./_jb11d11.json', import.meta.url), JSON.stringify({ generated: 'coloringbook/judge/_jb11d11.mjs', N, ICON_SIZE, pairs, m4, m4o, m4r, m5, m5o, m5r, mb }, null, 2) + '\n');
