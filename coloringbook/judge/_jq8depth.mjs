// D8 — THE DEPTH TERM. GATE RE-DERIVATION, WRITTEN BEFORE RE-MEASURING (§8).
//
// This file contains the derivation, the classification, and the PREDICTIONS
// it makes. It performs no measurement. It is hashed before `_jq8depthrun.mjs`
// is run, so that the order "derivation, then value" is provable and not
// merely claimed. §8: "Gates may be re-derived — with the derivation written
// down, before re-measuring — but never relaxed to fit a result that already
// exists."
//
// ── THE PROBLEM ────────────────────────────────────────────────────────────
// D8 as stated is "% of drawn path length outside the field circle", gate
// 0.00%, every tier. Round 1 measured, with the corrected instrument:
//
//     nickel obverse @44px   8.0928% outside,  deepest breach 1.4698 units
//     penny  obverse @76px   7.9333% outside,  deepest breach 0.0038 units
//
// Two percentages within 0.16 of each other; two depths a factor of 387 apart.
// The penny's entire figure is one arc whose endpoints are authored to two
// decimal places and land at r 41.00285 against a circle of 41. The metric is
// resolving the file's own coordinate representation and calling it a defect.
// It cannot rank, so it cannot route — Appendix P1's complaint about D6, in a
// dimension P1 passed as healthy.
//
// ── WHAT IS NOT CHANGING ───────────────────────────────────────────────────
// The gate stays **0.00% of drawn length outside the field circle, every
// tier**. It is not relaxed, not widened, and no exemption is folded into the
// fraction. The penny obverse and the nickel obverse both FAIL it, before this
// derivation and after it. Nothing below can move a verdict from FAIL to PASS.
// What is added is a SECOND, ORDERED number that decides which failure a
// reader is sent at first.
//
// ── THE DERIVATION ─────────────────────────────────────────────────────────
// A containment breach matters because a viewer can see ink outside the field
// circle. The quantity a viewer sees is not viewBox units — it is DEVICE
// PIXELS OF OVERHANG, at the size the drawing is actually shown. So the
// severity term is stated in device pixels.
//
// For a drawn mark m rendered in a box of width B device pixels (the viewBox is
// 100 units wide, so one viewBox unit is B/100 device pixels):
//
//     depth(m)      = maxRadius(m, including half its stroke width) - rField
//                     [viewBox units, the number v2 already computes]
//     depth_px(m,B) = depth(m) * B / 100                    [device pixels]
//     D8depth(coin, side) = max over drawn marks and over ALL TIERS of depth_px
//
// Two floors, both derived rather than chosen:
//
//   1. REPRESENTATION FLOOR = 0.01 viewBox units.
//      Every coordinate in the drawing is written to two decimal places, so a
//      point intended to lie exactly ON the field circle can be displaced by
//      up to 0.005 per coordinate, i.e. up to 0.005*sqrt(2) = 0.00707 radially.
//      Rounded up to the coordinate quantum: 0.01. A breach at or below this is
//      the file's arithmetic, not the drawing. (This is v2's AUTHOR_TOL, and it
//      is reused rather than re-invented.)
//
//   2. PERCEPTUAL FLOOR = 0.5 device pixels.
//      Ink that does not cover half a pixel is blended by the rasteriser into
//      the field-ring stroke drawn over it and cannot be resolved. Half a pixel
//      is the conventional sub-sample limit and is the same floor §22.4 uses
//      when it insists a tier claim is "a fact about PIXELS, not about a tier
//      name". At the largest box the app draws (380px) one viewBox unit is 3.80
//      device pixels, so 0.5 px = 0.1316 viewBox units; at the 84px naming draw
//      one unit is 0.84 px, so 0.5 px = 0.5952 units.
//
// ── THE CLASSIFICATION (three bands, ordered) ──────────────────────────────
//
//   R  representational : depth <= 0.01 units.
//                         The metric is reading the file's own 2-dp quantum.
//                         Record it. Do NOT dispatch a specialist at it.
//   S  sub-pixel        : depth > 0.01 units, but D8depth < 0.5 device px at
//                         every tier. Real, invisible at every size drawn.
//                         Lowest priority.
//   V  visible          : D8depth >= 0.5 device px at some tier.
//                         Ink lands outside the field circle where it can be
//                         seen. Dispatch, ordered by D8depth descending.
//
// The routing rule: among D8 failures, dispatch V first, ordered by D8depth;
// then S; never R. The 0.00% fraction is printed unrounded beside every band so
// the exemption is visible rather than folded in (Q3's requirement).
//
// ── PREDICTIONS, MADE NOW, BEFORE THE MEASUREMENT ──────────────────────────
// These are what make this a derivation and not a fit. If the run contradicts
// them, the derivation is wrong and is reported as wrong.
//
//   penny  obverse : depth 0.0038 units  -> band R; D8depth ~ 0.0038*3.80
//                    = 0.014 device px at the 380 box. FAIL on the fraction.
//   nickel obverse : depth 1.4698 units  -> band V; D8depth ~ 1.4698*3.80
//                    = 5.585 device px at the 380 box. FAIL on the fraction.
//   ratio between the two routing numbers ~ 387x, where the fractions differ
//   by 1.02x. That factor is the whole point of the term.
//   every other coin/side measured at 0.0000% in round 1 -> depth 0, band R,
//   D8depth 0.000 px, and PASS, unchanged.
//
// ── RESPONSE TEST (§4), declared here, run in _jq8depthrun.mjs ─────────────
//   Move the quarter's eagle head 20 units up, as round 1 did. D8depth must
//   rise from 0.000 px into band V, and by roughly (20 units minus the slack)
//   * 3.80 px/unit — i.e. tens of device pixels, not tenths.
//
// ── NULL / SELECTION (§4.1, §4.2) ──────────────────────────────────────────
//   D8depth is a MAXIMUM over a finite enumerated set, not a search: it has no
//   bounds to return. The set it maximises over is printed. The one selection
//   in the pipeline is fieldRadius(), which v2 already audits by printing its
//   whole candidate set and throwing on disagreement; this file does not
//   re-select anything.
export const REPRESENTATION_FLOOR = 0.01;   // viewBox units
export const PERCEPTUAL_FLOOR_PX = 0.5;     // device pixels
export const PREDICTIONS = {
  penny_obverse: { depth_units: 0.0038, band: 'R', d8depth_px_380: 0.014 },
  nickel_obverse: { depth_units: 1.4698, band: 'V', d8depth_px_380: 5.585 },
  others: { depth_units: 0, band: 'R', d8depth_px_380: 0 },
};

// box width in device pixels for a given requested draw size. Read from the
// emitted SVG's own width attribute at run time — never assumed.
export const boxWidthOf = (svg) => {
  const m = /\bwidth="(\d+(?:\.\d+)?)"/.exec(svg);
  if (!m) throw new Error('no width attribute on the emitted SVG — cannot convert units to device pixels');
  return parseFloat(m[1]);
};

export function band(depthUnits, d8depthPx) {
  if (depthUnits <= REPRESENTATION_FLOOR) return 'R';
  return d8depthPx >= PERCEPTUAL_FLOOR_PX ? 'V' : 'S';
}
export const BANDS = { R: 'representational — the file\'s 2-dp quantum; do not dispatch',
  S: 'sub-pixel — real, invisible at every drawn size; lowest priority',
  V: 'VISIBLE — ink outside the field circle where a viewer can see it; dispatch first' };
