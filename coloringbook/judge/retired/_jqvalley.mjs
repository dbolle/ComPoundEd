// D2 ACQUISITION TEST (COIN-JUDGE.md §2.1: BLOCKED names the artefact needed).
//
// A reverse silhouette target can only be frozen if the DEVICE separates from
// the FIELD by reflectance. Round 2 established the discriminating quantity is
// grey-histogram VALLEY DEPTH, and that a circulation strike has none: the
// dime worked example reads 0.8276, both quarter reverses 0.05-0.08.
//
// Acceptance (stated before measuring): valley depth >= 0.5.
// Positive control: ref/dime-obv-2.jpg must reproduce ~0.83, or this
// instrument is not measuring what round 2 measured (§4 response test).
// Selection test (§4.2): every candidate mode pair is printed, not just the
// chosen one, and an ambiguous choice is reported rather than silently taken.
import sharp from 'sharp';
import { readdirSync } from 'node:fs';

const grey = async (p) => {
  const { data, info } = await sharp(p).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
};

// disc fit. The FIRST version of this flooded a LIGHT background in from the
// frame and took the bbox of what remained. On a photograph with a DARK
// background the flood found nothing, the "disc" became the whole frame, and
// the histogram picked up the dark surround as one of its two modes — so
// quarter-rev.jpg scored 0.91 when round 2 had measured it at 0.05, and the
// dime positive control read 0.7774 against a known 0.8276. That is the
// wrong-feature failure of COIN-JUDGE.md 4.3 for the fifth time in this work,
// and the control had already reported it before I looked.
//
// Fixed: take the background level from the four CORNERS (light or dark),
// flood on |v - bg| <= tol, and then sample well inside the fitted radius so
// neither the surround nor the rim can contribute a mode.
function fitDisc(g) {
  const { d, w, h } = g;
  const corner = [];
  for (const [x, y] of [[2, 2], [w - 3, 2], [2, h - 3], [w - 3, h - 3]])
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++)
      corner.push(d[(y + dy) * w + (x + dx)]);
  corner.sort((a, b) => a - b);
  const bg = corner[corner.length >> 1];
  const tol = 26;
  const seen = new Uint8Array(w * h); const st = [];
  const push = (x, y) => { const i = y * w + x;
    if (!seen[i] && Math.abs(d[i] - bg) <= tol) { seen[i] = 1; st.push(i); } };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (st.length) { const i = st.pop(), x = i % w, y = (i / w) | 0;
    if (x > 0) push(x - 1, y); if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1); if (y < h - 1) push(x, y + 1); }
  let x0 = w, x1 = 0, y0 = h, y1 = 0, n = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!seen[y * w + x]) {
    n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const R = ((x1 - x0) + (y1 - y0)) / 4;
  // sanity: a coin fills a sensible share of its frame and is roughly round
  const aspect = (x1 - x0) / Math.max(1, y1 - y0);
  const fill = n / (Math.PI * R * R);
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, R, bg, aspect, fill };
}

function valley(g, disc) {
  const { d, w, h } = g; const hist = new Float64Array(256); let n = 0;
  const rr = (disc.R * 0.80) ** 2; // well inside the rim
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if ((x - disc.cx) ** 2 + (y - disc.cy) ** 2 > rr) continue;
    hist[d[y * w + x]]++; n++;
  }
  for (let i = 0; i < 256; i++) hist[i] /= n;
  // smooth (gaussian-ish, 9 tap) so single-bin spikes are not modes
  const s = new Float64Array(256);
  const k = [1, 8, 28, 56, 70, 56, 28, 8, 1], ks = 256;
  for (let i = 0; i < 256; i++) { let a = 0;
    for (let j = -4; j <= 4; j++) { const t = i + j; if (t >= 0 && t < 256) a += hist[t] * k[j + 4]; }
    s[i] = a / ks; }
  const peaks = [];
  for (let i = 2; i < 254; i++) if (s[i] > s[i - 1] && s[i] > s[i + 1] && s[i] > 0.0008) peaks.push(i);
  // §4.2: print the whole candidate set
  const pairs = [];
  for (let a = 0; a < peaks.length; a++) for (let b = a + 1; b < peaks.length; b++) {
    const lo = peaks[a], hi = peaks[b]; if (hi - lo < 12) continue;
    let vmin = Infinity; for (let i = lo; i <= hi; i++) vmin = Math.min(vmin, s[i]);
    const depth = 1 - vmin / Math.min(s[lo], s[hi]);
    pairs.push({ lo, hi, depth, mass: Math.min(s[lo], s[hi]) });
  }
  pairs.sort((p, q) => q.depth * q.mass - p.depth * p.mass);
  return { peaks, pairs };
}

const files = process.argv.slice(2).length ? process.argv.slice(2)
  : ['ref/dime-obv-2.jpg', ...readdirSync('ref').filter((f) => /^(quarter-rev|qcand)/.test(f)).map((f) => 'ref/' + f)];

console.log('D2 acquisition test — valley depth (accept >= 0.50)');
console.log('positive control: ref/dime-obv-2.jpg should read ~0.83\n');
for (const f of files) {
  try {
    const g = await grey(f); const disc = fitDisc(g);
    // DISC-FIT SANITY. Without this the tool scores a dark VIGNETTE as if it
    // were a mirror field: quarter-rev.jpg (a watermarked, vignetted photo of
    // a circulated coin on wood) read 0.94 where round 2 measured 0.05. A
    // valley depth is only meaningful if the region sampled is actually the
    // coin, so an implausible fit is REPORTED, never scored (4.2/4.3).
    const bad = [];
    if (disc.aspect < 0.85 || disc.aspect > 1.18) bad.push(`aspect ${disc.aspect.toFixed(2)}`);
    if (disc.fill < 0.72 || disc.fill > 1.30) bad.push(`fill ${disc.fill.toFixed(2)}`);
    if (disc.R > Math.min(g.w, g.h) * 0.52) bad.push(`R ${disc.R.toFixed(0)} >= half-frame (background not isolated)`);
    if (bad.length) {
      console.log(`  ${f.replace('ref/', '').padEnd(24)} DISC FIT UNRELIABLE — ${bad.join(', ')}`);
      console.log('     not scored: a valley measured outside the coin is not device-vs-field\n');
      continue;
    }
    const { peaks, pairs } = valley(g, disc);
    const best = pairs[0];
    const amb = pairs.length > 1 && pairs[1] && Math.abs(pairs[1].depth - (best?.depth ?? 0)) < 0.02;
    console.log(`  ${f.replace('ref/', '').padEnd(24)} R=${disc.R.toFixed(0).padStart(4)}  modes=[${peaks.join(',')}]`);
    if (!best) { console.log('     no separable mode pair -> REJECT'); continue; }
    console.log(`     best pair ${String(best.lo).padStart(3)}/${String(best.hi).padStart(3)}  depth ${best.depth.toFixed(4)}` +
      `  ${best.depth >= 0.5 ? 'ACCEPT' : 'reject'}${amb ? '   AMBIGUOUS — reporting, not choosing' : ''}`);
    for (const p of pairs.slice(1, 4)) console.log(`       alt ${String(p.lo).padStart(3)}/${String(p.hi).padStart(3)}  depth ${p.depth.toFixed(4)}`);
  } catch (e) { console.log(`  ${f}: ${e.message.slice(0, 50)}`); }
}
