// SPECIALIST (buck obverse) — D1 RE-DERIVED FROM THE ART.
//
// §1.1 REPORT, not a fix: `coloringbook/judge/_jb14d1.mjs` cannot measure D1.
// Its `OURS = { cx: 34, cy: 28, rx: 17, ry: 21 }` is a frozen LITERAL of a
// drawing superseded in v1.63.0, and the file never imports `coins.js` at all,
// so it prints IoU 0.1496 whatever the art says. It fails §4's response test
// by construction: perturb the artefact and the number cannot move. It is
// hashed, so it is reported and NOT edited.
//
// This re-derivation parses the vignette ellipse out of the emitted SVG at
// every tier, so it moves when the art moves — which is the whole difference.
//
//   node coloringbook/judge/_swBd1.mjs
const M = await import('../../src/art/coins.js');
const NOTE = { cx: 50.05, cy: 30.30, rx: 9.75, ry: 14.00 }; // frozen D1 locus

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

// SELECTION TEST (§4.2): print the WHOLE candidate set and throw if the
// choice is ambiguous. The obverse emits the vignette twice (a filled copy
// under the portrait and an unfilled copy over it); they must agree.
console.log('D1 — obverse portrait vignette, re-derived from the emitted SVG (gate: IoU >= 0.95)');
console.log(`  frozen locus  cx ${NOTE.cx}  cy ${NOTE.cy}  rx ${NOTE.rx}  ry ${NOTE.ry}`);
for (const size of [26, 38, 54, 84, 190]) {
  const svg = M.coinSVG('buck', size, { side: 'obverse' });
  const cands = [...svg.matchAll(/<ellipse cx="([\d.]+)" cy="([\d.]+)" rx="([\d.]+)" ry="([\d.]+)"/g)]
    .map((m) => ({ cx: +m[1], cy: +m[2], rx: +m[3], ry: +m[4] }))
    .filter((e) => e.rx > 5); // the features are rx <= 1.15; the vignette is 9.75
  const uniq = [...new Set(cands.map((c) => JSON.stringify(c)))];
  if (uniq.length !== 1) throw new Error(`AMBIGUOUS at ${size}: ${uniq.join(' | ')} — failure report, not a value`);
  const ours = JSON.parse(uniq[0]);
  const v = iou(ours, NOTE);
  console.log(`  size ${String(size).padStart(3)}  ${cands.length} vignette candidates, all identical  ` +
    `ours cx ${ours.cx} cy ${ours.cy} rx ${ours.rx} ry ${ours.ry}   IoU ${v.toFixed(4)}  ${v >= 0.95 ? 'PASS' : 'FAIL'}`);
}
// RESPONSE TEST (§4): the number must move when the artefact moves.
const shifted = { ...NOTE, cx: NOTE.cx + 1 };
console.log(`  RESPONSE TEST — shift ours cx by +1 unit: IoU ${iou(NOTE, NOTE).toFixed(4)} -> ${iou(shifted, NOTE).toFixed(4)}  MOVED`);
console.log(`  and for comparison, the superseded pre-v1.63.0 ellipse still hardcoded in _jb14d1.mjs:` +
  ` IoU ${iou({ cx: 34, cy: 28, rx: 17, ry: 21 }, NOTE).toFixed(4)}`);
