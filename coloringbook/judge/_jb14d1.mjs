// BUCK r0 — D1, the obverse principal device: our portrait vignette against
// the note's, both in viewBox units through the PAPER fiducial.
//
// The obverse has no printed-border fiducial (R0: both obverse fits land on
// blank paper), so the registration is the paper box and carries its own
// error: the two obverse photographs' paper ratios are 2.4540 and 2.3145,
// 5.9% apart, against a true 2.3524. Every number below carries that.
//
// The note's vignette was read off `_jb6-portrait-ladder.png` (R3's hand
// annotation, published with its generator `_jb6crop.mjs`) at a 1-unit ladder
// on a 3840px source: cx 50.05  cy 30.30  rx 9.75  ry 14.00, +-0.5 units.
const NOTE = { cx: 50.05, cy: 30.30, rx: 9.75, ry: 14.00 };
const OURS = { cx: 34, cy: 28, rx: 17, ry: 21 };
const iou = (a, b) => {
  const st = 0.02;
  const x0 = Math.min(a.cx - a.rx, b.cx - b.rx), x1 = Math.max(a.cx + a.rx, b.cx + b.rx);
  const y0 = Math.min(a.cy - a.ry, b.cy - b.ry), y1 = Math.max(a.cy + a.ry, b.cy + b.ry);
  let inter = 0, uni = 0;
  for (let y = y0; y <= y1; y += st) for (let x = x0; x <= x1; x += st) {
    const ia = ((x - a.cx) / a.rx) ** 2 + ((y - a.cy) / a.ry) ** 2 <= 1;
    const ib = ((x - b.cx) / b.rx) ** 2 + ((y - b.cy) / b.ry) ** 2 <= 1;
    if (ia && ib) inter++; if (ia || ib) uni++;
  }
  return inter / uni;
};
const v = iou(OURS, NOTE);
console.log('D1 — obverse portrait vignette (gate: region IoU >= 0.95)');
console.log(`  note  cx ${NOTE.cx}  cy ${NOTE.cy}  rx ${NOTE.rx}  ry ${NOTE.ry}   ry/rx ${(NOTE.ry / NOTE.rx).toFixed(3)}  area ${(Math.PI * NOTE.rx * NOTE.ry).toFixed(0)}`);
console.log(`  ours  cx ${OURS.cx}  cy ${OURS.cy}  rx ${OURS.rx}  ry ${OURS.ry}   ry/rx ${(OURS.ry / OURS.rx).toFixed(3)}  area ${(Math.PI * OURS.rx * OURS.ry).toFixed(0)}`);
console.log(`  IoU ${v.toFixed(4)}   ${v >= 0.95 ? 'PASS' : 'FAIL'}`);
console.log(`  dcx ${(OURS.cx - NOTE.cx).toFixed(2)} units (${(100 * (OURS.cx - NOTE.cx) / 97.2).toFixed(1)}% of the note's width)   dcy ${(OURS.cy - NOTE.cy).toFixed(2)}`);
console.log(`  rx x${(OURS.rx / NOTE.rx).toFixed(2)}   ry x${(OURS.ry / NOTE.ry).toFixed(2)}   area x${((OURS.rx * OURS.ry) / (NOTE.rx * NOTE.ry)).toFixed(2)}`);
// sensitivity to the +-0.5-unit read
let lo = 1, hi = 0;
for (const dcx of [-0.5, 0, 0.5]) for (const drx of [-0.5, 0, 0.5]) for (const dry of [-0.5, 0, 0.5]) {
  const w = iou(OURS, { cx: NOTE.cx + dcx, cy: NOTE.cy, rx: NOTE.rx + drx, ry: NOTE.ry + dry });
  lo = Math.min(lo, w); hi = Math.max(hi, w);
}
console.log(`  sensitivity to the ladder's +-0.5-unit read: IoU ${lo.toFixed(4)}..${hi.toFixed(4)} — the verdict does not turn on it`);
