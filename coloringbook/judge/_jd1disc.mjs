// DIME r0, TASK 1 — THE DISC FIT IS A LOCATED FEATURE, SO IT GETS §4.3.
//
// Every radial locus on a coin — rim seat, legend band, containment circle,
// D13's r<40 interior — is expressed in units of a fitted disc, so a 1 % error
// in the disc is 0.4 viewBox units at r 44, which is comparable with every gate
// in this round. Round 4 on the quarter found a fitter returning a bit-
// identical R = 318.3 on three files because it had fitted the PADDING.
//
// THREE strategies per reference, ALL printed (§4.2), each with its p95
// boundary residual as a % of R, and every one DRAWN ON ITS OWN SOURCE and
// read back with the Read tool before any value derived from it is recorded.
//
//   A flood — `_rvdisc.fit`, imported unedited (alpha-aware background flood,
//             0.1 deg ray cast, Kasa on the TOP 240 DEG only: the bottom sector
//             of a coin photograph carries the visible EDGE THICKNESS, which is
//             not the face of the disc)
//   B edge  — from A's centre, 720 rays, OUTERMOST significant grey step within
//             +-15 % of A's radius. Never thresholds the background.
//   C book  — the value already published for this file, so a disagreement with
//             the published number is visible rather than silently replaced.
//
// §4.1 the ray window is printed; rays landing at a window end are dropped and
//      counted.
// SELECTION RULE, stated before any value (§4.2): freeze B (refined from A)
// unless B's p95 residual as a fraction of R exceeds A's, in which case freeze
// A; and throw if A and B disagree by more than 2 % of R.
//
// RESPONSE TEST (§4): perturb A's seed centre by +5 px and re-run B; the
// refined fit must return to within 0.5 px of the unperturbed answer.
//
// Construction is `_jp3disc.mjs`'s (cent r0), re-pointed at the dime's
// references so this round's outputs and its disc table stay together. Its
// hash is in `_jd0extra.json`.
//
// Run: node coloringbook/judge/_jd1disc.mjs           -> table + overlay
//      node coloringbook/judge/_jd1disc.mjs freeze    -> also writes _jd1discs.json
import sharp from 'sharp';
import { writeFileSync, existsSync } from 'node:fs';
import { fit } from '../_rvdisc.mjs';
import { kasa } from '../_qtdisc.mjs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
export const FILES = ['dime-obv.jpg', 'dime-obv-2.jpg', 'dime-obv-3.jpg', 'dime-obv-4.jpg',
  'dime-rev.jpg', 'dime-rev-2.jpg'];

// C — already published for these files.
const BOOK = {
  'dime-obv.jpg': { cx: null, cy: null, R: null, src: 'not published as a disc; _headmask.json calls it tilted (1.010 axis ratio, 8.1 deg)' },
  'dime-obv-2.jpg': { cx: 475.048, cy: 475.528, R: 470.016, src: '_headmask.json .disc — the disc the FROZEN MASK is expressed in' },
  'dime-obv-3.jpg': { cx: null, cy: null, R: null, src: 'not published' },
  'dime-obv-4.jpg': { cx: null, cy: null, R: null, src: 'not published' },
  'dime-rev.jpg': { cx: null, cy: null, R: null, src: 'see _rvtarget.json discs' },
  'dime-rev-2.jpg': { cx: null, cy: null, R: null, src: 'see _rvtarget.json discs' },
};
try {
  const t = (await import('node:fs')).readFileSync(new URL('../_rvtarget.json', import.meta.url).pathname, 'utf8');
  const j = JSON.parse(t);
  const d = j.discs || (j.dime && j.dime.discs) || {};
  for (const k of Object.keys(d)) if (BOOK[k]) BOOK[k] = { ...d[k], src: '_rvtarget.json .discs' };
} catch { /* published discs may not be keyed by filename */ }

const WIN = 0.15, NRAY = 720;

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
    let pick = null;
    for (let i = prof.length - 1; i >= 0; i--) if (prof[i][1] >= 0.5 * gmax) { pick = prof[i][0]; break; }
    if (pick === null) { dropped++; continue; }
    if (pick <= r0 + 0.5 || pick >= r1 - 0.5) { dropped++; continue; }   // §4.1
    pts.push([th, seed.cx + dx * pick, seed.cy + dy * pick]);
  }
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
  let A = null; try { A = await fit(f); } catch { A = null; }
  const seed = A && Number.isFinite(A.R) ? { cx: A.cx, cy: A.cy, R: A.R } : (BOOK[f].R ? BOOK[f] : null);
  let B = null;
  if (seed) { try { B = await edgeRefine(f, seed); } catch { B = null; } }
  const C = BOOK[f];
  rows.push({ f, A, B, C });
  let pick = null, why = '';
  if (A && B) {
    const dR = Math.abs(A.R - B.R) / A.R, dC = Math.hypot(A.cx - B.cx, A.cy - B.cy) / A.R;
    if (dR > 0.02 || dC > 0.02) why = `A/B DISAGREE by ${(100 * Math.max(dR, dC)).toFixed(1)}% of R — published, not silently resolved`;
    pick = (B.p95 / B.R <= A.p95 / A.R) ? { ...B, via: 'B edge' } : { ...A, via: 'A flood' };
  } else if (A) pick = { ...A, via: 'A flood only' };
  else if (B) pick = { ...B, via: 'B edge from BOOK seed' };
  if (pick) out[f] = { cx: +pick.cx.toFixed(2), cy: +pick.cy.toFixed(2), R: +pick.R.toFixed(2),
    p95pctR: +(100 * (pick.p95 ?? NaN) / pick.R).toFixed(2), via: pick.via, note: why || undefined };
  else out[f] = { cx: null, cy: null, R: null, note: 'no fit' };
}

console.log('=== dime disc fits — THREE strategies, ALL printed (§4.2) ===');
console.log(`ray window +-${100 * WIN}% of seed R, ${NRAY} rays; edges at a window end dropped (§4.1)\n`);
for (const { f, A, B, C } of rows) {
  const row = (tag, r) => r && Number.isFinite(r.R)
    ? `${f.padEnd(16)} ${tag.padEnd(7)} cx ${r.cx.toFixed(2).padStart(8)}  cy ${r.cy.toFixed(2).padStart(8)}  R ${r.R.toFixed(2).padStart(8)}  p95 ${Number.isFinite(r.p95) ? r.p95.toFixed(2).padStart(6) : '     -'}  ${Number.isFinite(r.p95) ? (100 * r.p95 / r.R).toFixed(2).padStart(5) : '    -'}%R  n ${r.n ?? '-'}/drop ${r.dropped ?? '-'}`
    : `${f.padEnd(16)} ${tag.padEnd(7)} —  ${r && r.src ? r.src : 'no fit'}`;
  console.log(row('A flood', A));
  console.log(row('B edge', B));
  console.log(C.R ? `${''.padEnd(16)} ${'C book'.padEnd(7)} cx ${C.cx.toFixed(2).padStart(8)}  cy ${C.cy.toFixed(2).padStart(8)}  R ${C.R.toFixed(2).padStart(8)}   ${C.src}`
    : `${''.padEnd(16)} ${'C book'.padEnd(7)} —  ${C.src}`);
  if (A && B) {
    const dR = 100 * Math.abs(A.R - B.R) / A.R, dC = 100 * Math.hypot(A.cx - B.cx, A.cy - B.cy) / A.R;
    console.log(`${''.padEnd(24)} A vs B: dR ${dR.toFixed(2)}%  dCentre ${dC.toFixed(2)}%${(dR > 2 || dC > 2) ? '   << DISAGREE > 2% of R' : ''}`);
  }
  if (C.R && out[f].R) console.log(`${''.padEnd(24)} FROZEN vs BOOK: dR ${(100 * Math.abs(out[f].R - C.R) / C.R).toFixed(2)}%  dCentre ${(100 * Math.hypot(out[f].cx - C.cx, out[f].cy - C.cy) / C.R).toFixed(2)}%`);
  if (B) console.log(`${''.padEnd(24)} B sector mean resid: ${B.sect.map((v, i) => `${i * 30}:${Number.isFinite(v) ? v.toFixed(1) : '-'}`).join(' ')}`);
  console.log(`${''.padEnd(24)} FROZEN: ${JSON.stringify(out[f])}\n`);
}

// §4 RESPONSE TEST — perturb the seed and require the refinement to come back.
{
  const f = 'dime-obv-2.jpg';
  const A = await fit(f);
  const b0 = await edgeRefine(f, { cx: A.cx, cy: A.cy, R: A.R });
  const b1 = await edgeRefine(f, { cx: A.cx + 5, cy: A.cy + 5, R: A.R });
  const d = Math.hypot(b0.cx - b1.cx, b0.cy - b1.cy);
  console.log(`RESPONSE TEST  ${f}: seed centre +5,+5 px -> refined centre moves ${d.toFixed(3)} px, R ${b0.R.toFixed(3)} -> ${b1.R.toFixed(3)} (${Math.abs(b0.R - b1.R).toFixed(3)} px). Gate: <= 0.5 px. ${d <= 0.5 && Math.abs(b0.R - b1.R) <= 0.5 ? 'PASS' : 'FAIL — disc fit UNTRUSTED'}`);
}

// §4.3 OVERLAY — draw every frozen fit on its own source.
{
  const tiles = [];
  for (const f of FILES) {
    const d = out[f]; if (!d || !d.R) continue;
    const md = await sharp(P(f)).metadata();
    const g = `<circle cx="${d.cx}" cy="${d.cy}" r="${d.R}" fill="none" stroke="#00ff00" stroke-width="${Math.max(2, d.R / 150)}"/>`
      + `<circle cx="${d.cx}" cy="${d.cy}" r="${d.R * 41 / 47}" fill="none" stroke="#ff00ff" stroke-width="${Math.max(1.5, d.R / 250)}"/>`
      + `<circle cx="${d.cx}" cy="${d.cy}" r="${d.R * 44 / 47}" fill="none" stroke="#ffa000" stroke-width="${Math.max(1.5, d.R / 250)}"/>`
      + `<path d="M${d.cx - d.R} ${d.cy}H${d.cx + d.R}M${d.cx} ${d.cy - d.R}V${d.cy + d.R}" stroke="#00ffff" stroke-width="${Math.max(1, d.R / 300)}"/>`
      + `<text x="8" y="${Math.round(md.height * 0.07)}" font-family="monospace" font-size="${Math.round(md.height / 20)}" fill="#ff0">${f} R=${d.R.toFixed(1)} p95 ${d.p95pctR}%R</text>`;
    const base = await sharp(P(f)).flatten({ background: '#606060' }).png().toBuffer();
    const ov = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${md.width}" height="${md.height}" viewBox="0 0 ${md.width} ${md.height}">${g}</svg>`))
      .resize(md.width, md.height, { fit: 'fill' }).png().toBuffer();
    const merged = await sharp(base).composite([{ input: ov, left: 0, top: 0 }]).png().toBuffer();
    tiles.push(await sharp(merged).resize(460, 460, { fit: 'contain', background: '#202020' }).png().toBuffer());
  }
  const cols = 3, rowsN = Math.ceil(tiles.length / cols);
  await sharp({ create: { width: 460 * cols, height: 460 * rowsN, channels: 3, background: '#202020' } })
    .composite(tiles.map((input, i) => ({ input, left: 460 * (i % cols), top: 460 * ((i / cols) | 0) })))
    .png().toFile(new URL('./_jd1disc-overlay.png', import.meta.url).pathname);
  console.log('\n§4.3 overlay -> _jd1disc-overlay.png  green = frozen disc (47), magenta = 41 (ours), orange = 44');
}

if (process.argv[2] === 'freeze') {
  const p = new URL('./_jd1discs.json', import.meta.url).pathname;
  if (existsSync(p)) console.log('_jd1discs.json exists — refusing to overwrite (§6 rule 1)');
  else { writeFileSync(p, JSON.stringify(out, null, 1)); console.log('froze _jd1discs.json'); }
}
