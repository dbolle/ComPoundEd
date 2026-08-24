// §2.2's plateau test on the quarter references. Silver on silver: report the
// histogram inside 0.9R first, then sweep the threshold and print the
// equivalent radius of the largest hole-filled component, for BOTH polarities.
// A usable reference has a PLATEAU.
import { greyOf, segIn } from './_pyseg.mjs';

export const DISCS = {
  'quarter-obv.jpg': { cx: 249.45, cy: 249.43, R: 249.21 },
  'quarter-obv-2.jpg': { cx: 374.41, cy: 374.36, R: 373.67 },
  'quarter-obv-3.png': { cx: 374.50, cy: 375.18, R: 375.20 },
  'quarter-obv-4.jpg': { cx: 999.93, cy: 994.44, R: 981.44 },
};

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const f of Object.keys(DISCS)) {
    const disc = DISCS[f];
    const g = await greyOf(f);
    const h = new Array(26).fill(0); let n = 0;
    for (let y = 0; y < g.H; y++) for (let x = 0; x < g.W; x++) {
      if (Math.hypot(x - disc.cx, y - disc.cy) > 0.9 * disc.R) continue;
      h[Math.min(25, g.d[y * g.W + x] >> 3)]++; n++;
    }
    console.log(`\n=== ${f}  R ${disc.R.toFixed(1)}`);
    console.log('  hist inside 0.9R (bucket=8 grey levels, % of pixels):');
    console.log('   ' + h.map((c, i) => `${i * 8}:${(100 * c / n).toFixed(1)}`).join(' '));
    for (const above of [true, false]) {
      const row = [];
      for (let T = 60; T <= 230; T += 10) {
        const s = segIn(g, disc, T, 0.93, above);
        row.push(`${T}:${(s.eqR / disc.R).toFixed(4)}`);
      }
      console.log(`  eqR/R, keep ${above ? '>=T (bright bust)' : '<=T (dark bust)'}:`);
      console.log('   ' + row.join(' '));
    }
  }
}
