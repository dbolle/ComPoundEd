// BUCK r14 (specialist) — THE EAGLE'S ANATOMY, hand-read and then drawn back
// on the source.
//
// The wings are dark and `_je14bird.mjs` segments them mechanically. The head,
// the shield and the tail are the LIGHT features of this device — the band-pass
// that finds the wings is blind to them by construction — so they are read by
// hand off `_je14zoom.mjs`'s 0.5-unit ladders, which §2.1/R3 permit
// ("a hand annotation is a legitimate frozen target ... draw what you have on
// the source and look at it").
//
// The literals below are the readings. They are drawn back onto both
// photographs so the reading can be checked by eye (§4.3), and every one is
// reported as a pair with its two-reference spread — a hand reading with one
// witness is not a measurement.
//
//   node coloringbook/judge/_je14anat.mjs
import sharp from 'sharp';
import { grid } from './_je14crop.mjs';

const RIM = {
  'bill-rev.jpg': { cx: 77.25, cy: 27.75, rx: 9.5, ry: 12.75 },
  'bill-rev-2.jpg': { cx: 76.5, cy: 27.75, rx: 8.25, ry: 12.0 },
};
// HAND READINGS, viewBox units, off _je14zoom-body-*.png at 60 px/unit
// (X = 71 + i/60, Y = 23 + j/60 on both).
const READ = {
  'bill-rev.jpg': {
    headTopY: 24.75, headBotY: 28.17, headX0: 76.33, headX1: 78.75, beakX: 76.25, beakY: 25.50,
    shieldTopY: 28.42, shieldBotY: 34.92, shieldX0: 75.53, shieldX1: 79.50,
    tailBotY: 38.83, tailX0: 76.00, tailX1: 79.17,
  },
  'bill-rev-2.jpg': {
    headTopY: 24.58, headBotY: 28.17, headX0: 75.83, headX1: 78.17, beakX: 75.75, beakY: 25.50,
    shieldTopY: 28.33, shieldBotY: 34.92, shieldX0: 74.95, shieldX1: 78.67,
    tailBotY: 38.75, tailX0: 75.75, tailX1: 78.50,
  },
};
// the mechanically-measured wing figures `_je14bird.mjs` prints at k -12,
// restated so this file can put them in one table with the hand readings
const WING = {
  'bill-rev.jpg': { tipLX: 69.08, tipLY: 19.98, tipRX: 84.67, tipRY: 22.08, botY: 32.42, angL: 68.0, angR: 70.0 },
  'bill-rev-2.jpg': { tipLX: 69.97, tipLY: 21.68, tipRX: 83.63, tipRY: 21.93, botY: 32.08, angL: 71.0, angR: 71.9 },
};

const FILES = Object.keys(RIM);
const rel = (f) => {
  const E = RIM[f], R = READ[f], W = WING[f];
  const dx = (X) => (X - E.cx) / E.rx, dy = (Y) => (Y - E.cy) / E.ry;
  return {
    'wing tip dx (L/R)': [dx(W.tipLX), dx(W.tipRX)],
    'wing tip dy (L/R)': [dy(W.tipLY), dy(W.tipRY)],
    'wing span / width': [(W.tipRX - W.tipLX) / (2 * E.rx)],
    'wing bottom dy': [dy(W.botY)],
    'wing outer angle': [W.angL, W.angR],
    'head top dy': [dy(R.headTopY)],
    'head bottom dy': [dy(R.headBotY)],
    'head half-w / rx': [(R.headX1 - R.headX0) / 2 / E.rx],
    'beak dx': [dx(R.beakX)],
    'shield top dy': [dy(R.shieldTopY)],
    'shield bottom dy': [dy(R.shieldBotY)],
    'shield half-w / rx': [(R.shieldX1 - R.shieldX0) / 2 / E.rx],
    'shield centre dx': [dx((R.shieldX0 + R.shieldX1) / 2)],
    'tail bottom dy': [dy(R.tailBotY)],
    'tail half-w / rx': [(R.tailX1 - R.tailX0) / 2 / E.rx],
    'BIRD height / height': [(R.tailBotY - Math.min(W.tipLY, W.tipRY)) / (2 * E.ry)],
    'BIRD centre dy': [((R.tailBotY + Math.min(W.tipLY, W.tipRY)) / 2 - E.cy) / E.ry],
  };
};

const A = rel(FILES[0]), B = rel(FILES[1]);
console.log('THE EAGLE, ROUNDEL-RELATIVE. dx is a fraction of rx, dy of ry, from the roundel centre.');
console.log('Wing rows are mechanical (`_je14bird.mjs`, k -12); the rest are hand readings off');
console.log('`_je14zoom-body-*.png`. Both references, then the mean and the spread.');
console.log(`${'quantity'.padEnd(22)} ${'bill-rev.jpg'.padStart(16)} ${'bill-rev-2.jpg'.padStart(16)}   mean      spread`);
const MEAN = {};
for (const k of Object.keys(A)) {
  const a = A[k].reduce((x, y) => x + y, 0) / A[k].length;
  const b = B[k].reduce((x, y) => x + y, 0) / B[k].length;
  MEAN[k] = (a + b) / 2;
  console.log(`${k.padEnd(22)} ${A[k].map((v) => v.toFixed(3)).join('/').padStart(16)} ${B[k].map((v) => v.toFixed(3)).join('/').padStart(16)}` +
    `   ${MEAN[k].toFixed(4).padStart(8)}  ${Math.abs(a - b).toFixed(4)}`);
}

// RESPONSE TEST — a hand reading is still a number in a table; perturb one and
// the derived relative figure must move by the predicted amount.
{
  const save = READ[FILES[1]].tailBotY;
  READ[FILES[1]].tailBotY = save + 1.2;
  const b2 = rel(FILES[1])['tail bottom dy'][0];
  READ[FILES[1]].tailBotY = save;
  const b1 = B['tail bottom dy'][0];
  console.log(`\nRESPONSE TEST — tailBotY +1.2u on bill-rev-2: tail dy ${b1.toFixed(4)} -> ${b2.toFixed(4)}` +
    ` (expected +${(1.2 / RIM[FILES[1]].ry).toFixed(4)})  ${Math.abs((b2 - b1) - 1.2 / RIM[FILES[1]].ry) < 1e-9 ? 'MOVED as expected' : '*** UNTRUSTED ***'}`);
}
// NULL TEST — every hand reading must lie INSIDE the roundel it is read against.
{
  const bad = [];
  for (const f of FILES) {
    const E = RIM[f], R = READ[f];
    for (const [k, X, Y] of [['head', (R.headX0 + R.headX1) / 2, R.headTopY], ['shieldTop', (R.shieldX0 + R.shieldX1) / 2, R.shieldTopY],
      ['shieldBot', (R.shieldX0 + R.shieldX1) / 2, R.shieldBotY], ['tail', (R.tailX0 + R.tailX1) / 2, R.tailBotY],
      ['shieldL', R.shieldX0, (R.shieldTopY + R.shieldBotY) / 2], ['shieldR', R.shieldX1, (R.shieldTopY + R.shieldBotY) / 2]])
      if (((X - E.cx) / E.rx) ** 2 + ((Y - E.cy) / E.ry) ** 2 > 1) bad.push(`${f}:${k}`);
  }
  console.log(`NULL TEST — every hand reading inside its own roundel: ${bad.length ? `*** OUTSIDE: ${bad.join(', ')} ***` : 'all 12 inside'}`);
}

// OVERLAY (§4.3) — draw every read feature back on the photograph.
const Z = 46;
for (const f of FILES) {
  const E = RIM[f], R = READ[f], W = WING[f];
  const X0 = E.cx - E.rx - 1.5, X1 = E.cx + E.rx + 1.5, Y0 = E.cy - E.ry - 1.5, Y1 = E.cy + E.ry + 1.5;
  const px = await grid(f);
  const ow = Math.round((X1 - X0) * Z), oh = Math.round((Y1 - Y0) * Z);
  const raw = new Float64Array(ow * oh);
  let lo = 255, hi = 0;
  for (let j = 0; j < oh; j++) for (let i = 0; i < ow; i++) {
    const v = px(X0 + (i + 0.5) / Z, Y0 + (j + 0.5) / Z);
    raw[j * ow + i] = v; if (v < lo) lo = v; if (v > hi) hi = v;
  }
  const buf = Buffer.alloc(ow * oh * 3);
  for (let k = 0; k < ow * oh; k++) {
    const g = Math.round(255 * (raw[k] - lo) / (hi - lo));
    buf[3 * k] = g; buf[3 * k + 1] = g; buf[3 * k + 2] = g;
  }
  const put = (i, j, c) => { if (i < 0 || j < 0 || i >= ow || j >= oh) return; const k = 3 * (j * ow + i); buf[k] = c[0]; buf[k + 1] = c[1]; buf[k + 2] = c[2]; };
  const hline = (Y, xa, xb, c) => { const j = Math.round((Y - Y0) * Z); for (let X = xa; X <= xb; X += 0.02) { put(Math.round((X - X0) * Z), j, c); put(Math.round((X - X0) * Z), j + 1, c); } };
  const vline = (X, ya, yb, c) => { const i = Math.round((X - X0) * Z); for (let Y = ya; Y <= yb; Y += 0.02) { put(i, Math.round((Y - Y0) * Z), c); put(i + 1, Math.round((Y - Y0) * Z), c); } };
  const cross = (X, Y, c) => { const i = Math.round((X - X0) * Z), j = Math.round((Y - Y0) * Z);
    for (let a = -7; a <= 7; a++) { put(i + a, j, c); put(i, j + a, c); } };
  const RED = [255, 40, 40], GRN = [0, 220, 60], BLU = [60, 120, 255], MAG = [255, 0, 220], YEL = [255, 220, 0];
  hline(R.headTopY, R.headX0, R.headX1, GRN); hline(R.headBotY, R.headX0, R.headX1, GRN);
  vline(R.headX0, R.headTopY, R.headBotY, GRN); vline(R.headX1, R.headTopY, R.headBotY, GRN);
  cross(R.beakX, R.beakY, GRN);
  hline(R.shieldTopY, R.shieldX0, R.shieldX1, RED); hline(R.shieldBotY, R.shieldX0, R.shieldX1, RED);
  vline(R.shieldX0, R.shieldTopY, R.shieldBotY, RED); vline(R.shieldX1, R.shieldTopY, R.shieldBotY, RED);
  hline(R.tailBotY, R.tailX0, R.tailX1, MAG); vline(R.tailX0, R.shieldBotY, R.tailBotY, MAG); vline(R.tailX1, R.shieldBotY, R.tailBotY, MAG);
  cross(W.tipLX, W.tipLY, BLU); cross(W.tipRX, W.tipRY, BLU); hline(W.botY, W.tipLX, W.tipRX, BLU);
  for (let a = 0; a < 3000; a++) { const t = 2 * Math.PI * a / 3000;
    put(Math.round((E.cx + E.rx * Math.cos(t) - X0) * Z), Math.round((E.cy + E.ry * Math.sin(t) - Y0) * Z), YEL); }
  cross(E.cx, E.cy, YEL);
  const name = `coloringbook/judge/_je14anat-${f.replace(/\W/g, '_')}.png`;
  await sharp(buf, { raw: { width: ow, height: oh, channels: 3 } }).png().toFile(name);
  console.log(`\noverlay ${name}  ${ow}x${oh}   GREEN box = head + beak, RED box = shield, MAGENTA = tail bottom,` +
    ` BLUE crosses = the segmented wing tips and the blue line their lower limit, YELLOW = the frozen rim and its centre`);
}

console.log('\nTHE REDRAW TARGET (mean of the two references, roundel-relative):');
for (const k of Object.keys(MEAN)) console.log(`  ${k.padEnd(22)} ${MEAN[k].toFixed(4)}`);
