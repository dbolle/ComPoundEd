// SPECIALIST INSTRUMENT — round 3, D5 lettering. TARGET -> CONSTANT, written
// down, for the two legends this round adds.
//
// Same direction and same conventions as `_jl1derive.mjs` (round 1), which is
// hashed and which this does not touch: inputs are measurements off a
// reference, outputs are the literals `coins.js` needs, and nothing here reads
// our drawing (§6.1).
//
// TWO conventions inherited from `_jl1derive.mjs`, not re-litigated:
//   CAP_FIT 0.75   size = cap / 0.75. The face's measured ink cap is 0.730 em,
//                  so the ink lands at 0.973x the coin's — 2.7% under, inside
//                  the +-15% D5-cap gate whichever cap model the judge uses.
//   baseline       a TOP legend's baseline is its band's INNER edge; a BOTTOM
//                  legend's is its OUTER edge. A FLAT legend's baseline is the
//                  bottom of its capitals, full stop — there is no radius in it.
//
// HOW THE INSTRUMENT COMPARES WITH THE FROZEN NUMBERS, and why the answer is
// to use it RAW. `_jl3ink.mjs` measures the ink FOOTPRINT of relief lettering —
// both lit flanks of every stroke — so it could in principle read wider than
// the hand-read bands the round-0 and round-1 targets were taken from. Checked
// against five frozen numbers on two coins:
//
//   nickel MONTICELLO     cap         3.88 measured / 3.89 frozen    -0.01
//   nickel MONTICELLO     right edge 78.60 measured / 78.7 frozen    -0.10
//   nickel top legend     inner edge 36.813 measured / 36.8 frozen   +0.01
//   cent   top legend     inner edge 35.498 measured / 35.6 frozen   -0.10
//   nickel bottom legend  inner edge 36.094 measured / 36.72 frozen  -0.63
//
// The first three are the informative ones, and they agree to a hundredth of a
// unit. MONTICELLO is the strongest: round 1 read its cap and its ink extent by
// hand off a grid overlay, and the machine reproduces both. So where a frozen
// number came from a hand read on the grid, this instrument reproduces it, and
// the numbers below are used as measured.
//
// The exceptions are recorded rather than averaged in. The cent's top legend
// reads cap 7.24 against a frozen 6.6, and the nickel's bottom legend's inner
// edge is 0.63 low; both of those frozen values came from a round-0 band
// finder rather than a hand read, and both of the corresponding OUTER edges are
// confounded with the coin's edge relief, which the instrument cannot separate.
// A cap taken as a RATIO to the cent's top legend instead of raw would be 3.76
// rather than 4.11 — 8.5% smaller, inside the +-15% gate either way, and the
// judge can re-derive whichever it prefers. It is stated here because the first
// pass took that ratio, and applied it to the WIDTH as well, which is wrong on
// its own terms: a relief flank adds a roughly CONSTANT amount to an edge, so
// it is 9.7% of a 6.6-unit cap and 2.2% of a 29.3-unit word. Scaling the width
// by the cap's ratio made the drawn word 8.9% narrower than the coin for no
// reason anyone could state.
//
// THE TRADE THAT IS ACTUALLY FORCED, and it is not the flank. `flatText` cannot
// condense — `arcText` squeezes with `scale(cond 1)` and there is no equivalent
// on a straight line — and our face's glyph ink is 0.85 of its cap where the
// cent's E PLURIBUS is 0.74 of its. At the coin's cap our word is therefore
// about 15% too wide, and cap and extent cannot both be held. Holding the cap
// and letting the extent run costs +21% of span, outside the +-15% gate;
// holding the extent costs 9% of cap, inside it. So the extent is held, by
// letter-spacing, and the size is the largest that does not run the glyphs into
// each other — checked by rendering it, not by arithmetic.
//
// §4 RESPONSE: `--response` perturbs each measured input by +1 unit and prints
//   the constants again; every constant that depends on it must move.
// §4.1 NULL: nothing is searched. Arithmetic only.
//
// Run: node coloringbook/judge/_jl3derive.mjs [--response]
export const CAP_FIT = 0.75, CAP_INK = 0.730, NAT_ADV = 0.7706, FIELD = 44.07;
const DESC = 0.06, ADVBOX = 0.62, CAPBOX = 0.72;   // _jq8contain-v2 textMarks

// Natural ink widths of the exact strings, in em, rendered through the SAME
// pipeline the coin is drawn with (`_jl3ls.mjs`, font-size 100, ink box at
// grey < 128). These are NOT computed from NAT_ADV: `flatText` uses the face's
// own PROPORTIONAL advances, and the first arithmetic this round did assumed a
// uniform 0.7706 em and produced a letter-spacing 0.6 units too negative.
export const NAT_INK = { 'E PLURIBUS': 6.45, UNUM: 3.274 };

export const MEAS = {
  // ── the cent's E PLURIBUS UNUM, FLAT (see _jl3fit.mjs and the overlay) ──
  pennyEPU: {
    ref: 'penny-rev-2.png',
    anchorMeasured: 7.24, anchorFrozen: 6.6,   // its own top legend, same instrument
    lines: [
      { text: 'E PLURIBUS', inkTop: 19.42, inkBot: 23.55, inkL: 35.05, inkR: 64.35 },
      { text: 'UNUM', inkTop: 24.50, inkBot: 28.60, inkL: 41.75, inkR: 57.80 },
    ],
  },
  // ── the nickel's FIVE CENTS, a CONCENTRIC ARC at the bottom ────────────
  nickelFive: {
    ref: 'nickel-rev-2.png',
    text: 'FIVE CENTS',
    bandInner: 26.13, bandOuter: 31.67,        // per-glyph rHi spread 0.053 units
    inkDegLo: 46.79, inkDegHi: 133.20,         // full ink extent, both flanks
  },
};

export function derivePenny(m = MEAS.pennyEPU) {
  // ONE size for both lines: the coin sets them at one size, and the two
  // measured caps agree to 0.03 units, so a per-line size would be fitting
  // noise. size = mean cap / CAP_FIT.
  const caps = m.lines.map((l) => l.inkBot - l.inkTop);
  const cap = caps.reduce((a, b) => a + b) / caps.length;
  const size = Math.round((cap / CAP_FIT) * 100) / 100;
  return m.lines.map((l) => {
    const capRaw = l.inkBot - l.inkTop, w = l.inkR - l.inkL;
    const natW = NAT_INK[l.text] * size;
    return { ...l, capRaw, cap, w, size, baseline: l.inkBot, x: (l.inkL + l.inkR) / 2,
      natW, ls: (w - natW) / (l.text.length - 1),
      ratioAlt: (capRaw * m.anchorFrozen) / m.anchorMeasured };
  });
}

export function deriveNickel(m = MEAS.nickelFive) {
  const cap = m.bandOuter - m.bandInner;
  const size = cap / CAP_FIT;
  const baseline = m.bandOuter;                       // BOTTOM legend: outer edge
  const bOff = FIELD - baseline;
  const inkSpan = m.inkDegHi - m.inkDegLo;
  const centre = (m.inkDegHi + m.inkDegLo) / 2;
  const adv = m.text.length - 1;
  // ink span = centre-to-centre span + one glyph box, and the glyph box depends
  // on cond, which depends on the span. Two iterations of the fixed point are
  // enough at this precision; the residual is printed.
  let span = inkSpan, cond = 1, advF = 0.82, prev = 0;
  for (let i = 0; i < 60; i++) {
    prev = span;
    advF = (((span / adv) * Math.PI) / 180) * baseline / size;
    cond = Math.min(1, advF / NAT_ADV);
    span = inkSpan - ((ADVBOX * size * cond) / baseline) * (180 / Math.PI);
  }
  const inkCap = CAP_INK * size;
  const halfB = (ADVBOX * size * cond) / 2;
  const maxR = Math.hypot(baseline + DESC * size, halfB);
  return { ...m, cap, size, baseline, bOff, inkSpan, centre, adv, advF, cond, inkCap, maxR,
    residual: Math.abs(span - prev), span };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`CAP_FIT ${CAP_FIT}  CAP_INK ${CAP_INK}  NAT_ADV ${NAT_ADV}  FIELD ${FIELD}`);
  const m = MEAS.pennyEPU;
  console.log(`\n=== cent reverse, E PLURIBUS UNUM — FLAT (measured on ${m.ref}) ===`);
  console.log(`cross-check only, NOT applied: this coin's top legend reads ${m.anchorMeasured} where the frozen target is ${m.anchorFrozen}`
    + `  -> a ratio-anchored cap would be ${derivePenny()[0].ratioAlt.toFixed(2)} instead of ${derivePenny()[0].capRaw.toFixed(2)}`);
  console.log('line          cap    width   size   baseline    x       natW    ls');
  for (const d of derivePenny()) console.log(
    `${d.text.padEnd(12)}  ${d.capRaw.toFixed(2)}   ${d.w.toFixed(2)}   ${d.size.toFixed(2)}   `
    + `${d.baseline.toFixed(2)}      ${d.x.toFixed(2)}   ${d.natW.toFixed(2)}   ${d.ls.toFixed(4)}`);

  const n = deriveNickel();
  console.log(`\n=== nickel reverse, FIVE CENTS — CONCENTRIC ARC (measured on ${n.ref}) ===`);
  console.log(`band r ${n.bandInner}..${n.bandOuter}  cap ${n.cap.toFixed(2)}  size ${n.size.toFixed(2)}  inkCap ${n.inkCap.toFixed(2)}`);
  console.log(`baseline (bottom legend = band OUTER edge) ${n.baseline.toFixed(2)}  ->  bOff = ${FIELD} - ${n.baseline.toFixed(2)} = ${n.bOff.toFixed(2)}`);
  console.log(`ink extent ${n.inkDegLo}..${n.inkDegHi} = ${n.inkSpan.toFixed(2)} deg, centred ${n.centre.toFixed(2)} deg`);
  console.log(`centre-to-centre span ${n.span.toFixed(2)} deg over ${n.adv} advances  ->  advF ${n.advF.toFixed(4)}  cond ${n.cond.toFixed(3)}  (fixed-point residual ${n.residual.toExponential(1)})`);
  console.log(`max glyph-box radius ${n.maxR.toFixed(3)}  against the field circle 44.07${n.maxR > 44.07 ? '  *** OVER ***' : '  clear'}`);

  if (process.argv.includes('--response')) {
    console.log('\n§4 RESPONSE — +1 unit on each measured input; every dependent constant must move');
    const a = derivePenny({ ...MEAS.pennyEPU, lines: MEAS.pennyEPU.lines.map((l) => ({ ...l, inkBot: l.inkBot + 1 })) });
    console.log(`  cent inkBot +1: size ${derivePenny()[0].size.toFixed(3)} -> ${a[0].size.toFixed(3)}, baseline ${derivePenny()[0].baseline.toFixed(3)} -> ${a[0].baseline.toFixed(3)}, ls ${derivePenny()[0].ls.toFixed(3)} -> ${a[0].ls.toFixed(3)}`);
    const b = deriveNickel({ ...MEAS.nickelFive, bandOuter: MEAS.nickelFive.bandOuter + 1 });
    console.log(`  nickel bandOuter +1: cap ${n.cap.toFixed(3)} -> ${b.cap.toFixed(3)}, bOff ${n.bOff.toFixed(3)} -> ${b.bOff.toFixed(3)}, advF ${n.advF.toFixed(4)} -> ${b.advF.toFixed(4)}, maxR ${n.maxR.toFixed(3)} -> ${b.maxR.toFixed(3)}`);
    const c = deriveNickel({ ...MEAS.nickelFive, inkDegHi: MEAS.nickelFive.inkDegHi + 1 });
    console.log(`  nickel inkDegHi +1: span ${n.span.toFixed(2)} -> ${c.span.toFixed(2)}, centre ${n.centre.toFixed(2)} -> ${c.centre.toFixed(2)}, advF ${n.advF.toFixed(4)} -> ${c.advF.toFixed(4)}`);
  }
}
