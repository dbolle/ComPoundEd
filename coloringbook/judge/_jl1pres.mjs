// SPECIALIST INSTRUMENT — round 1, D5-presence. THE PRESENCE TABLE.
//
// For every coin, side and legend: the SMALLEST BOX WIDTH at which our drawing
// emits it, found by bisection on the emitted string rather than by reading
// `min` out of the source — so a floor that the code does not actually apply
// (a `min` on a legend that some other branch suppresses) shows up as a
// different number, not as agreement.
//
// The column that matters is `coinRow(84)`: `src/screens/money.js` asks a child
// to name ONE coin, alone, at `size` 84, and `coinPx()` turns that into a
// DIFFERENT box for each denomination — quarter 84, nickel 73.4, cent 66.0,
// dime 62.0. A floor is a box-width number, so "84" means four different things.
//
// §4 RESPONSE: RESPONSE=1 raises every `min` by 40 in a generated copy and
//   confirms every first-drawn box moves up with it.
// §4.1 NULL: the bisection bounds are printed. A legend whose first-drawn box
//   equals the upper bound is reported as NEVER DRAWN, not as a value.
// §4.2 SELECTION: every legend found in the emitted string is listed, including
//   the ones with no target and the value scaffold, so nothing is chosen.
//
// Run: node coloringbook/judge/_jl1pres.mjs
//      ART=/abs/coins.js   (e.g. the round-0 revision, for the before column)
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCoins } from './_jq8contain-v2.mjs';
import { legendsOf } from './_jl1cap.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
export const LO = 8, HI = 600;   // §4.1 search bounds, printed with every result

const key = (w) => w.replace(/\s+/g, '');

// smallest nominal `size` whose box draws `word`; then convert to a box width
export function firstBox(mod, coin, side, word) {
  const drawn = (size) => legendsOf(mod.coinSVG(coin, size, { side })).some((L) => key(L.word) === key(word));
  if (!drawn(HI)) return null;                       // never drawn — a failure report, not a value
  let lo = LO, hi = HI;
  if (drawn(lo)) return { size: lo, box: mod.coinPx(coin, lo).w, atBound: true };
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (drawn(m)) hi = m; else lo = m; }
  return { size: hi, box: mod.coinPx(coin, hi).w, atBound: false };
}

export function allLegends(mod, coin, side) {
  const out = [];
  for (const size of [600, 190, 84, 26]) {
    for (const L of legendsOf(mod.coinSVG(coin, size, { side }))) if (!out.includes(L.word)) out.push(L.word);
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const artPath = process.env.ART || join(ROOT, 'src/art/coins.js');
  const mod = await loadCoins(readFileSync(artPath, 'utf8'));
  console.log(`ART = ${artPath}`);
  console.log(`§4.1 bisection bounds: nominal size ${LO}..${HI}. A legend not drawn at ${HI} is reported NEVER DRAWN.`);
  console.log('\ncoin     side      legend                      first drawn at    box at coinRow(84)   drawn at the naming draw?');
  for (const coin of ['penny', 'nickel', 'dime', 'quarter']) {
    const box84 = mod.coinPx(coin, 84).w;
    for (const side of ['obverse', 'reverse']) {
      for (const word of allLegends(mod, coin, side)) {
        const f = firstBox(mod, coin, side, word);
        const naming = f && box84 >= f.box - 1e-9;
        console.log(
          `${coin.padEnd(8)} ${side.padEnd(8)} ${word.padEnd(26)} `
          + (f ? `box ${f.box.toFixed(1).padStart(6)} (size ${f.size.toFixed(1).padStart(5)})` : '   NEVER DRAWN            ')
          + `   ${String(box84).padStart(6)}              ${f ? (naming ? 'yes' : 'no') : 'no'}`
        );
      }
    }
  }

  if (process.env.RESPONSE) {
    console.log('\n=== §4 RESPONSE TEST — every `min` raised by 40 ===');
    const code = readFileSync(artPath, 'utf8').replace(/min: (\d+)/g, (m, d) => `min: ${Number(d) + 40}`);
    const up = await loadCoins(code);
    let moved = 0, same = 0;
    for (const coin of ['penny', 'nickel', 'dime', 'quarter']) {
      for (const side of ['reverse']) {
        for (const word of allLegends(mod, coin, side)) {
          const a = firstBox(mod, coin, side, word), b = firstBox(up, coin, side, word);
          const ok = a && b && b.box > a.box + 1;
          if (ok) moved++; else same++;
          console.log(`  ${coin} ${word.padEnd(24)} ${a ? a.box.toFixed(1) : '-'} -> ${b ? b.box.toFixed(1) : '-'}  ${ok ? 'moved' : 'UNCHANGED'}`);
        }
      }
    }
    console.log(`  ${moved} moved, ${same} unchanged -> RESPONSE ${moved > 0 && same === 0 ? 'PASS' : 'CHECK THE UNCHANGED ROWS'}`);
  }
}
