// Finger-traceable digits 1–9. Each digit is one or two stroke polylines
// in a 0–100 box; the guide renders thick and round so a small finger has
// a generous path, and the judge is GENTLE by design (docs: v1.35.0):
// cover most of the guide, wobbles welcome, no stroke-order rules.

export const DIGIT_STROKES = {
  1: [[[50, 15], [50, 85]]],
  2: [[[31, 32], [35, 20], [50, 14], [65, 20], [69, 32], [63, 46], [45, 63], [31, 85], [70, 85]]],
  3: [[[33, 24], [45, 14], [60, 16], [68, 28], [62, 42], [49, 48], [62, 54], [70, 68], [60, 82], [44, 86], [32, 76]]],
  // The 4's two strokes must NOT share a vertex: with a shared apex the
  // start dot sat on top of the stem and read as "trace the tall line",
  // hiding which stroke comes first. Standard school form instead —
  // down-left, across; then the stem beside it.
  4: [
    [[42, 14], [26, 60], [76, 60]],
    [[64, 14], [64, 86]],
  ],
  5: [[[68, 16], [36, 16], [33, 44], [50, 40], [64, 46], [69, 62], [62, 78], [46, 86], [33, 78]]],
  6: [[[62, 16], [46, 26], [36, 44], [33, 62], [38, 78], [52, 86], [64, 78], [67, 64], [58, 52], [44, 52], [35, 60]]],
  7: [[[30, 16], [70, 16], [46, 85]]],
  8: [
    [[50, 15], [36, 23], [38, 40], [50, 48], [63, 40], [64, 23], [50, 15]],
    [[50, 48], [34, 58], [36, 77], [50, 85], [64, 77], [66, 58], [50, 48]],
  ],
  9: [
    [[64, 34], [56, 19], [42, 17], [33, 30], [36, 45], [48, 51], [61, 45], [64, 34]],
    [[64, 34], [62, 85]],
  ],
};

// Evenly-spaced points along the digit's strokes, for judging coverage.
export function samplePoints(digit, step = 4) {
  const out = [];
  for (const stroke of DIGIT_STROKES[digit] ?? []) {
    for (let i = 0; i < stroke.length - 1; i++) {
      const [x1, y1] = stroke[i];
      const [x2, y2] = stroke[i + 1];
      const len = Math.hypot(x2 - x1, y2 - y1);
      const n = Math.max(1, Math.round(len / step));
      for (let k = 0; k < n; k++) {
        out.push([x1 + ((x2 - x1) * k) / n, y1 + ((y2 - y1) * k) / n]);
      }
    }
    out.push(stroke[stroke.length - 1]);
  }
  return out;
}

// Gentle judge: what fraction of the guide has a trace point nearby?
export function traceCoverage(digit, tracePts, radius = 14) {
  const samples = samplePoints(digit);
  if (!samples.length || !tracePts.length) return 0;
  const r2 = radius * radius;
  let hit = 0;
  for (const [sx, sy] of samples) {
    for (const [tx, ty] of tracePts) {
      const dx = tx - sx;
      const dy = ty - sy;
      if (dx * dx + dy * dy <= r2) {
        hit += 1;
        break;
      }
    }
  }
  return hit / samples.length;
}

export function tracePasses(digit, tracePts, { radius = 14, coverage = 0.8 } = {}) {
  return traceCoverage(digit, tracePts, radius) >= coverage;
}

// The stage art: thick guide strokes, a green GO dot at the first
// stroke's start (mechanics shown, not explained).
export function digitGuideSVG(digit, size = 260) {
  const strokes = DIGIT_STROKES[digit] ?? [];
  const paths = strokes
    .map(
      (stroke) =>
        `<polyline class="trace-guide" points="${stroke.map(([x, y]) => `${x},${y}`).join(' ')}"
           fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    )
    .join('');
  const [sx, sy] = strokes[0]?.[0] ?? [50, 15];
  return `<svg class="trace-svg" viewBox="0 0 100 100" width="${size}" height="${size}"
      role="img" aria-label="Trace the ${digit}" data-digit="${digit}" xmlns="http://www.w3.org/2000/svg">
    ${paths}
    <circle class="trace-start" cx="${sx}" cy="${sy}" r="5.5"/>
  </svg>`;
}
