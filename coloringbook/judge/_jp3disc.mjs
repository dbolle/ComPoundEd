// PENNY ROUND 0, TASK 2 — THE DISC FIT IS A LOCATED FEATURE, SO IT GETS §4.3.
//
// Every radial locus on a coin — rim seat, legend band, containment circle,
// D13's r<40 interior — is expressed in units of a fitted disc. Round 4 on the
// quarter found `_jqvalley.mjs` fitting a 600x675 PADDING RECTANGLE on three
// files and returning a bit-identical R = 318.3 for all three, because no fit
// in four rounds had ever been drawn on its own source.
//
// So: THREE strategies per reference, ALL printed (§4.2 — print the whole
// candidate set, never only the chosen one), each with its p95 boundary
// residual as a % of R, and every one of them DRAWN ON ITS OWN SOURCE
// (`_jp3disc-overlay.png`) before any value derived from it is recorded.
//
//   A  flood  — `_rvdisc.fit`, imported unedited: alpha-aware background flood,
//               0.1 deg ray cast, Kasa on the TOP 240 DEG only (the bottom
//               sector of a coin photograph carries the visible EDGE THICKNESS,
//               which is not the face of the disc — `penny-obv.md` §2)
//   B  edge   — from A's centre, walk 720 rays and take the OUTERMOST
//               significant grey step within +-15% of A's radius. Independent
//               of the flood: it never thresholds the background.
//   C  book   — the value already published for this file (`_pylib.DISCS`,
//               `_rvtarget.json` discs). Present so a disagreement with the
//               published number is visible rather than silently replaced.
//
// §4.1: the ray window is printed and rays whose edge lands at the window end
// are dropped and counted.
// Selection rule, stated before any value: the frozen disc is **B**, refined
// from A, unless B's p95 residual exceeds A's, in which case A is frozen and
// the disagreement is published. It throws if A and B disagree by more than 2%
// of R — that is the `_jqvalley` failure signature and it must not be silent.
//
// Run: node coloringbook/judge/_jp3disc.mjs            -> table + overlay
//      node coloringbook/judge/_jp3disc.mjs freeze     -> also writes _jp1discs.json
import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fit } from '../_rvdisc.mjs';
import { kasa } from '../_qtdisc.mjs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
export const FILES = ['penny-obv.jpg', 'penny-obv-2.jpg', 'penny-obv-3.jpg', 'penny-obv-4.png',
  'penny-rev.jpg', 'penny-rev-2.png', 'penny-rev-artwork.jpg'];

// C — what is already published for these files, so a change is visible.
const BOOK = {
  'penny-obv.jpg': { cx: 248.6, cy: 251.7, R: 249.02, src: '_pylib.DISCS' },
  'penny-obv-2.jpg': { cx: 447.7, cy: 449.1, R: 445.83, src: '_pylib.DISCS' },
  'penny-obv-3.jpg': { cx: 999.0, cy: 997.3, R: 984.97, src: '_pylib.DISC (the frame)' },
  'penny-obv-4.png': { cx: null, cy: null, R: null, src: 'never published — rejected for measurement, penny-obv.md §2' },
  'penny-rev.jpg': { cx: 238.51, cy: 251.93, R: 249.28, src: '_rvtarget.discs' },
  'penny-rev-2.png': { cx: 371.75, cy: 372.04, R: 372.61, src: '_rvtarget.discs (the frame)' },
  'penny-rev-artwork.jpg': { cx: null, cy: null, R: null, src: 'plaster model, no fittable disc (19.3% resid)' },
};

const WIN = 0.15;   // ray search window, +-15% of the seed radius  [§4.1 bound]
const NRAY = 720;

export async function edgeRefine(file, seed) {
  const { data, info } = await sharp(P(file)).flatten({ background: '#808080' })
    .greyscale().blur(2).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const at = (x, y) => (x < 0 || y < 0 || x >= W - 1 || y >= H - 1) ? NaN : data[(y | 0) * W + (x | 0)];
  const r0 = seed.R * (1 - WIN), r1 = seed.R * (1 + WIN);
  const pts = []; let dropped = 0;
  for (let a = 0; a < NRAY; a++) {
    const th = a * 2 * Math.PI / NRAY, dx = Math.cos(th), dy = Math.sin(th);
    const prof = [];
    for (let r = r0; r <= r1; r += 0.5) {
      const v0 = at(seed.cx + dx * (r - 2), seed.cy + dy * (r - 2));
      const v1 = at(seed.cx + dx * (r + 2), seed.cy + dy * (r + 2));
      prof.push([r, (Number.isNaN(v0) || Number.isNaN(v1)) ? 0 : Math.abs(v1 - v0)]);
    }
    const gmax = Math.max(...prof.map((p) => p[1]));
    if (gmax < 6) { dropped++; continue; }
    // OUTERMOST edge over half the peak, not the strongest: on a coin the rim's
    // inner step can beat the silhouette step and walks the fit ~7% inboard.
    let pick = null;
    for (let i = prof.length - 1; i >= 0; i--) if (prof[i][1] >= 0.5 * gmax) { pick = prof[i][0]; break; }
    if (pick === null) { dropped++; continue; }
    if (pick <= r0 + 0.5 || pick >= r1 - 0.5) { dropped++; continue; }   // §4.1: at a bound is not a value
    pts.push([th, seed.cx + dx * pick, seed.cy + dy * pick]);
  }
  // Kasa twice, rejecting > 2.5 sigma, on the TOP 240 DEG only (drop 25..155 deg,
  // where the coin's visible edge thickness lives).
  let use = pts.filter(([a]) => !(a > 25 * Math.PI / 180 && a < 155 * Math.PI / 180));
  let f = kasa(use.map(([a, x, y]) => [a * 180 / Math.PI, x, y]));
  for (let it = 0; it < 2; it++) {
    const res = use.map(([, x, y]) => Math.hypot(x - f.cx, y - f.cy) - f.R);
    const sd = Math.sqrt(res.reduce((s, r) => s + r * r, 0) / res.length);
    use = use.filter((p, i) => Math.abs(res[i]) <= 2.5 * sd);
    f = kasa(use.map(([a, x, y]) => [a * 180 / Math.PI, x, y]));
  }
  const res = use.map(([, x, y]) => Math.abs(Math.hypot(x - f.cx, y - f.cy) - f.R)).sort((a, b) => a - b);
  const sect = Array.from({ length: 12 }, (_, b) => {
    const s = use.filter(([a]) => a * 180 / Math.PI >= b * 30 && a * 180 / Math.PI < (b + 1) * 30)
      .map(([, x, y]) => Math.hypot(x - f.cx, y - f.cy) - f.R);
    return s.length ? s.reduce((p, q) => p + q, 0) / s.length : NaN;
  });
  return { cx: f.cx, cy: f.cy, R: f.R, n: use.length, dropped, W, H,
    p95: res[(res.length * 0.95) | 0], med: res[res.length >> 1],
    window: [+r0.toFixed(1), +r1.toFixed(1)], sect };
}

const out = {}, rows = [];
for (const f of FILES) {
  let A = null;
  try { A = await fit(f); } catch (e) { A = null; }
  const seed = A && Number.isFinite(A.R) ? { cx: A.cx, cy: A.cy, R: A.R }
    : (BOOK[f].R ? BOOK[f] : null);
  let B = null;
  if (seed) { try { B = await edgeRefine(f, seed); } catch (e) { B = null; } }
  const C = BOOK[f];
  rows.push({ f, A, B, C });

  let pick = null, why = '';
  if (A && B) {
    const dR = Math.abs(A.R - B.R) / A.R, dC = Math.hypot(A.cx - B.cx, A.cy - B.cy) / A.R;
    if (dR > 0.02 || dC > 0.02) why = `A/B DISAGREE by ${(100 * Math.max(dR, dC)).toFixed(1)}% of R — published, not silently resolved`;
    pick = (B.p95 / B.R <= A.p95 / A.R) ? { ...B, via: 'B edge' } : { ...A, via: 'A flood' };
  } else if (A) pick = { ...A, via: 'A flood only' };
  if (pick) out[f] = { cx: +pick.cx.toFixed(2), cy: +pick.cy.toFixed(2), R: +pick.R.toFixed(2),
    p95pctR: +(100 * pick.p95 / pick.R).toFixed(2), via: pick.via, note: why || undefined };
  else out[f] = { cx: null, cy: null, R: null, note: 'no fit' };
}

console.log('=== penny disc fits — THREE strategies, all printed (§4.2) ===');
console.log(`ray window +-${100 * WIN}% of seed R, ${NRAY} rays; edges at a window end are dropped (§4.1)\n`);
console.log('file                    strat      cx        cy         R      p95 resid   %R    n / dropped');
for (const { f, A, B, C } of rows) {
  const row = (tag, r) => r && Number.isFinite(r.R)
    ? `${f.padEnd(23)} ${tag.padEnd(6)} ${r.cx.toFixed(2).padStart(9)} ${r.cy.toFixed(2).padStart(9)} ${r.R.toFixed(2).padStart(9)} ${(r.p95 ?? NaN).toFixed ? (r.p95).toFixed(2).padStart(9) : '        -'} ${(100 * (r.p95 ?? NaN) / r.R).toFixed(2).padStart(7)}   ${r.n ?? '-'}${r.dropped !== undefined ? ' / ' + r.dropped : ''}`
    : `${f.padEnd(23)} ${tag.padEnd(6)}   —   ${r && r.src ? r.src : 'no fit'}`;
  console.log(row('A flood', A));
  console.log(row('B edge', B));
  console.log(C.R ? `${''.padEnd(23)} ${'C book'.padEnd(6)} ${C.cx.toFixed(2).padStart(9)} ${C.cy.toFixed(2).padStart(9)} ${C.R.toFixed(2).padStart(9)}       —        —   ${C.src}`
    : `${''.padEnd(23)} ${'C book'.padEnd(6)}   —   ${C.src}`);
  if (A && B) {
    const dR = 100 * Math.abs(A.R - B.R) / A.R, dC = 100 * Math.hypot(A.cx - B.cx, A.cy - B.cy) / A.R;
    console.log(`${''.padEnd(30)} A vs B: dR ${dR.toFixed(2)}%  dCentre ${dC.toFixed(2)}%${(dR > 2 || dC > 2) ? '   << DISAGREE > 2% of R' : ''}`);
  }
  if (B) console.log(`${''.padEnd(30)} B sector mean resid: ${B.sect.map((v, i) => `${i * 30}:${Number.isFinite(v) ? v.toFixed(1) : '-'}`).join(' ')}`);
  console.log(`${''.padEnd(30)} FROZEN: ${JSON.stringify(out[f])}`);
  console.log('');
}

// §4.3 — draw every frozen fit on its own source and look at it.
{
  const tiles = [];
  for (const f of FILES) {
    const d = out[f]; if (!d || !d.R) continue;
    const md = await sharp(P(f)).metadata();
    const g = `<circle cx="${d.cx}" cy="${d.cy}" r="${d.R}" fill="none" stroke="#00ff00" stroke-width="${Math.max(2, d.R / 150)}"/>`
      + `<circle cx="${d.cx}" cy="${d.cy}" r="${d.R * 0.862}" fill="none" stroke="#ff00ff" stroke-width="${Math.max(1.5, d.R / 250)}"/>`
      + `<path d="M${d.cx - d.R} ${d.cy}H${d.cx + d.R}M${d.cx} ${d.cy - d.R}V${d.cy + d.R}" stroke="#00ffff" stroke-width="${Math.max(1, d.R / 300)}"/>`
      + `<text x="8" y="${Math.round(md.height * 0.06)}" font-family="monospace" font-size="${Math.round(md.height / 22)}" fill="#ff0">${f}  R=${d.R.toFixed(1)}  p95 ${d.p95pctR}%R  [${d.via}]</text>`;
    const base = await sharp(P(f)).flatten({ background: '#606060' }).png().toBuffer();
    const ov = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${md.width}" height="${md.height}" viewBox="0 0 ${md.width} ${md.height}">${g}</svg>`))
      .resize(md.width, md.height, { fit: 'fill' }).png().toBuffer();
    // NOTE: sharp applies resize BEFORE composite in one pipeline, so the two
    // must be separate calls or the overlay is composited onto the shrunken
    // base and throws. (Cost: one confusing error message.)
    const merged = await sharp(base).composite([{ input: ov, left: 0, top: 0 }]).png().toBuffer();
    const img = await sharp(merged).resize(460, 460, { fit: 'contain', background: '#202020' }).png().toBuffer();
    tiles.push(img);
  }
  const cols = 4, rowsN = Math.ceil(tiles.length / cols);
  const sheet = sharp({ create: { width: 460 * cols, height: 460 * rowsN, channels: 3, background: '#202020' } })
    .composite(tiles.map((input, i) => ({ input, left: 460 * (i % cols), top: 460 * ((i / cols) | 0) })));
  const o = new URL('./_jp3disc-overlay.png', import.meta.url).pathname;
  await sheet.png().toFile(o);
  console.log(`§4.3 overlay -> ${o}   green = frozen disc, magenta = 0.862R (viewBox 40.5), cyan = centre cross`);
}

if (process.argv[2] === 'freeze') {
  const p = new URL('./_jp1discs.json', import.meta.url).pathname;
  if (existsSync(p)) { console.log('_jp1discs.json exists — refusing to overwrite (§6 rule 1)'); }
  else { writeFileSync(p, JSON.stringify(out, null, 1)); console.log('froze _jp1discs.json'); }
}
