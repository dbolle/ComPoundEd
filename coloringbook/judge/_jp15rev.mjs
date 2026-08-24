// PENNY REVERSE, face-review sweep (2026-08-23) — the four instruments every
// number in `lincolnMemorial()` was read with. §4.3: an image's reproducible
// artefact is its GENERATOR, the PNGs are gitignored, so this file is the
// record.
//
// It REPORTS (judge/WRITERS.md): it writes only `_jp15-*.png` beside itself,
// which is gitignored, and touches no history, no frozen target and nothing in
// `ref/`.
//
// THE ONE CONVENTION EVERYTHING RESTS ON. A fitted rim of radius R maps to 47
// viewBox units — the radius `outlineOf()` draws the blank at — so
//     px = c + (v - 50) * R/47
// and that is the same convention `_jp5band.mjs:rowR` uses (`* 47`). It is not
// asserted here, it is CHECKED: `blend` lays our art on the photograph at this
// mapping and our three legends land on the coin's three legends. Anything read
// inside them is then read at a registration that has been shown, not assumed.
//
// WHY NOT `discOf()`. COIN-JUDGE's standing warning: the area fit R = √(area/π)
// is off a rim fit by −0.8% to −5.1%, and on a cameo proof it fails in kind.
// `penny-rev-2.png` and `penny-rev.jpg` use the RIM fits already frozen in
// `_jp1discs.json`. The two references that have no frozen fit are fitted here,
// both by rim, and both printed with their p95 residual so a bad one is visible:
//
//   penny-rev-1991d.png    ray-cast to the outermost non-background run, Kasa,
//                          trimmed 3x            -> p95 1.02% of R
//   penny-rev-artwork.jpg  Gasparro's model is a DRAWING on paper: the flood
//                          and edge fits in `_jp3disc.mjs` return p95 13.93%
//                          with 244 of 720 rays at the window end, i.e. no
//                          usable disc. What IS fittable is the drawn rim LINE
//                          — walk in from 1.15R for the first dark pixel — and
//                          that closes at p95 0.33%. It locks onto the INNER
//                          edge of a hand-drawn line of finite width, so its
//                          scale carries roughly a percent of bias; it is used
//                          for RATIOS (feature height / building height) and
//                          never for an absolute viewBox number.
//
// WHAT FAILED, recorded because the next round should not rebuild them: three
// automatic column finders. A brightness-MAXIMUM finder on `penny-rev-2.png`
// returns a colonnade whose own midpoint is 47.2 rather than 50, because the
// light is upper-left and each round shaft's maximum sits on its lit edge; a
// MINIMUM (dark-gap) finder misses gaps and invents others, returning an
// 8.5-unit "pitch" next to a 3.2-unit one. Every column number in
// `lincolnMemorial()` comes from `grid`/`crop` read by eye on BOTH flanks and
// checked for symmetry about x = 50.
//
//   node coloringbook/judge/_jp15rev.mjs discs
//   node coloringbook/judge/_jp15rev.mjs blend  [ref ...]
//   node coloringbook/judge/_jp15rev.mjs grid   <ref> <x0,x1,y0,y1> [step] [zoom]
//   node coloringbook/judge/_jp15rev.mjs crop   <ref> <x0,x1,y0,y1> [pxPerUnit]
//   node coloringbook/judge/_jp15rev.mjs ladder <ref> h|v <a0,a1,b0,b1> [step]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { disc as jpdisc } from './_jpdiscs.mjs';

const HERE = new URL('.', import.meta.url).pathname;
const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const FROZEN = JSON.parse(readFileSync(new URL('./_jp1discs.json', import.meta.url)));

// Fitted this round; `discs` re-derives them and prints any disagreement.
const FITTED = {
  'penny-rev-1991d.png': { cx: 175.81, cy: 173.47, R: 174.13, p95pctR: 1.02, via: 'rim ray-cast + Kasa' },
  'penny-rev-artwork.jpg': { cx: 249.78, cy: 262.62, R: 174.89, p95pctR: 0.33, via: 'drawn-rim line, inner edge' },
};
// ── CORRECTED 2026-08-24 (ledger A15). This line used to read
//       const DISC = (f) => FROZEN[f] ?? FITTED[f] ?? …
//   and FROZEN WON. `_jp1discs.json` does have an entry for
//   `penny-rev-artwork.jpg` — cx 250.52, cy 222.30, R 252.41 — but it is not a
//   fit: p95 13.93% of R with 244 of 720 rays ending on the search-window
//   bound, because Gasparro's model is a DRAWING on paper and there is no
//   struck rim for a flood or edge fit to find. So blend/grid/crop registered
//   that reference at R 44.3% too large and cy 40.32 px off, while the `discs`
//   subcommand ten lines below printed the good drawn-rim fit and gave the
//   reader the impression it was the one in use. The precedence is now
//   explicit and goes through `_jpdiscs.mjs`, which refuses an entry the
//   correction sheet flags unusable rather than silently preferring it.
const DISC = (f) => (FITTED[f] ? { ...FITTED[f], source: 'fitted here' } : jpdisc(f));
const REFS = ['penny-rev-2.png', 'penny-rev.jpg', 'penny-rev-1991d.png', 'penny-rev-artwork.jpg'];

const grey = async (f) => {
  const { data, info } = await sharp(P(f)).removeAlpha().greyscale().raw().toBuffer({ resolveWithObject: true });
  return { data, W: info.width, H: info.height };
};
const mapper = (d) => {
  const s = d.R / 47;
  return { s, X: (v) => d.cx + (v - 50) * s, Y: (v) => d.cy + (v - 50) * s };
};
const layer = async (svg, W, H) =>
  sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svg}</svg>`),
    { density: 96 }).resize(W, H, { fit: 'fill' }).png().toBuffer();

function kasa(pts) {
  let Sx = 0, Sy = 0, Sxx = 0, Syy = 0, Sxy = 0, Sxz = 0, Syz = 0, Sz = 0;
  const N = pts.length;
  for (const [x, y] of pts) { const z = x * x + y * y; Sx += x; Sy += y; Sxx += x * x; Syy += y * y; Sxy += x * y; Sxz += x * z; Syz += y * z; Sz += z; }
  const A = [[Sxx, Sxy, Sx], [Sxy, Syy, Sy], [Sx, Sy, N]], b = [Sxz, Syz, Sz];
  for (let i = 0; i < 3; i++) {
    let p = i;
    for (let j = i + 1; j < 3; j++) if (Math.abs(A[j][i]) > Math.abs(A[p][i])) p = j;
    [A[i], A[p]] = [A[p], A[i]]; [b[i], b[p]] = [b[p], b[i]];
    for (let j = i + 1; j < 3; j++) { const f = A[j][i] / A[i][i]; for (let k = i; k < 3; k++) A[j][k] -= f * A[i][k]; b[j] -= f * b[i]; }
  }
  const t = [0, 0, 0];
  for (let i = 2; i >= 0; i--) { let v = b[i]; for (let j = i + 1; j < 3; j++) v -= A[i][j] * t[j]; t[i] = v / A[i][i]; }
  const cx = t[0] / 2, cy = t[1] / 2;
  return { cx, cy, R: Math.sqrt(t[2] + cx * cx + cy * cy) };
}
const trim = (pts) => {
  let f = kasa(pts);
  for (let i = 0; i < 3; i++) {
    const res = pts.map(([x, y]) => Math.abs(Math.hypot(x - f.cx, y - f.cy) - f.R));
    const cut = [...res].sort((a, b) => a - b)[Math.floor(res.length * 0.85)];
    f = kasa(pts.filter((_, j) => res[j] <= cut));
  }
  const res = pts.map(([x, y]) => Math.abs(Math.hypot(x - f.cx, y - f.cy) - f.R)).sort((a, b) => a - b);
  return { ...f, p95: res[Math.floor(res.length * 0.95)] };
};

// A — a photograph on a light sweep: outermost run of non-background per ray.
async function fitSweep(file, THR = 235) {
  const { data, W, H } = await grey(file);
  const fg = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) fg[i] = data[i] >= THR ? 0 : 1;
  let sx = 0, sy = 0, n = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (fg[y * W + x]) { sx += x; sy += y; n++; }
  const cx = sx / n, cy = sy / n, RMAX = Math.min(W, H) * 0.62;
  const pts = []; let ended = 0;
  for (let k = 0; k < 720; k++) {
    const a = k * Math.PI / 360, ca = Math.cos(a), sa = Math.sin(a);
    let hit = -1;
    for (let r = RMAX; r > 4; r -= 0.5) {
      const x = Math.round(cx + ca * r), y = Math.round(cy + sa * r);
      if (x < 0 || y < 0 || x >= W || y >= H || !fg[y * W + x]) continue;
      let ok = true;
      for (let dd = 1; dd <= 5; dd++) {
        const x2 = Math.round(cx + ca * (r - dd)), y2 = Math.round(cy + sa * (r - dd));
        if (x2 < 0 || y2 < 0 || x2 >= W || y2 >= H || !fg[y2 * W + x2]) { ok = false; break; }
      }
      if (ok) { hit = r; break; }
    }
    if (hit < 0) continue;
    if (hit >= RMAX - 0.6) { ended++; continue; }
    pts.push([cx + ca * hit, cy + sa * hit]);
  }
  return { ...trim(pts), n: pts.length, windowEnd: ended };
}
// B — a pencil drawing: the drawn rim LINE, walked inward from 1.15R.
async function fitRing(file, seed = [250, 262], R0 = 175, THR = 140) {
  const { data, W, H } = await grey(file);
  const g = (x, y) => { const xi = Math.round(x), yi = Math.round(y); return (xi < 0 || yi < 0 || xi >= W || yi >= H) ? 255 : data[yi * W + xi]; };
  let f = { cx: seed[0], cy: seed[1], R: R0 }, pts = [];
  for (let pass = 0; pass < 4; pass++) {
    pts = [];
    for (let k = 0; k < 720; k++) {
      const a = k * Math.PI / 360, ca = Math.cos(a), sa = Math.sin(a);
      for (let r = f.R * 1.15; r > f.R * 0.85; r -= 0.25) {
        if (g(f.cx + ca * r, f.cy + sa * r) < THR) { pts.push([f.cx + ca * r, f.cy + sa * r]); break; }
      }
    }
    f = trim(pts);
  }
  return { ...f, n: pts.length, windowEnd: 0 };
}

const cmd = process.argv[2] ?? 'discs';
const args = process.argv.slice(3);

if (cmd === 'discs') {
  const rows = [
    ['penny-rev-1991d.png', await fitSweep('penny-rev-1991d.png')],
    ['penny-rev-artwork.jpg', await fitRing('penny-rev-artwork.jpg')],
  ];
  console.log('file                    cx        cy         R    p95%R  rays  windowEnd   vs the literal above');
  for (const [f, r] of rows) {
    const lit = FITTED[f];
    const d = Math.abs(r.R - lit.R) / lit.R * 100;
    console.log(`${f.padEnd(22)} ${r.cx.toFixed(2).padStart(8)} ${r.cy.toFixed(2).padStart(9)} ${r.R.toFixed(2).padStart(9)} ` +
      `${(100 * r.p95 / r.R).toFixed(2).padStart(7)} ${String(r.n).padStart(5)} ${String(r.windowEnd).padStart(10)}   dR ${d.toFixed(3)}%`);
    if (d > 0.5) console.log('   >> DISAGREES with the frozen literal by more than 0.5% of R — do not use until resolved');
  }
} else if (cmd === 'blend') {
  const { coinSVG } = await import('../../src/art/coins.js');
  for (const file of args.length ? args : REFS) {
    const d = DISC(file), { s } = mapper(d);
    const md = await sharp(P(file)).metadata();
    const side = Math.round(100 * s);
    let svg = coinSVG('penny', 380, { side: 'reverse' })
      .replace(/^(<svg[^>]*?)width="[\d.]+" height="[\d.]+"/, `$1width="${side}" height="${side}"`);
    const flat = await sharp(Buffer.from(svg), { density: 600 }).resize(side, side, { fit: 'fill' })
      .removeAlpha().greyscale().raw().toBuffer({ resolveWithObject: true });
    const { data, info } = flat;
    const out = Buffer.alloc(info.width * info.height * 4, 0);
    for (let y = 1; y < info.height - 1; y++) for (let x = 1; x < info.width - 1; x++) {
      const i = y * info.width + x;
      if (Math.hypot(data[i + 1] - data[i - 1], data[i + info.width] - data[i - info.width]) > 22) {
        const o = i * 4; out[o] = 255; out[o + 2] = 255; out[o + 3] = 200;
      }
    }
    const edges = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
    const left = Math.round(d.cx - side / 2), top = Math.round(d.cy - side / 2);
    const PAD = Math.max(0, -left, -top, left + side - md.width, top + side - md.height) + 4;
    const base = await sharp(P(file)).removeAlpha()
      .extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: '#000' }).png().toBuffer();
    const dst = HERE + '_jp15-blend-' + file.replace(/\.\w+$/, '') + '.png';
    await sharp(base).composite([{ input: edges, left: left + PAD, top: top + PAD }]).png().toFile(dst);
    console.log(dst, ' 1 viewBox unit =', s.toFixed(3), 'px');
  }
} else if (cmd === 'grid' || cmd === 'crop') {
  const file = args[0];
  const [x0, x1, y0, y1] = args[1].split(',').map(Number);
  const d = DISC(file), { s, X, Y } = mapper(d);
  const md = await sharp(P(file)).metadata();
  let g = '';
  if (cmd === 'grid') {
    const STEP = +(args[2] || 5);
    for (let v = x0; v <= x1 + 1e-9; v += STEP) {
      const maj = Math.abs(v % (STEP * 2)) < 1e-6;
      g += `<path d="M${X(v)} ${Y(y0)}V${Y(y1)}" stroke="${maj ? '#f0f' : '#0ff'}" stroke-width="${maj ? 1.4 : 0.8}" opacity="0.85"/>`
        + `<text x="${X(v) + 1}" y="${Y(y0) - 2}" font-family="monospace" font-size="${2.3 * s}" fill="#ff0">${v}</text>`;
    }
    for (let v = y0; v <= y1 + 1e-9; v += STEP) {
      g += `<path d="M${X(x0)} ${Y(v)}H${X(x1)}" stroke="#0ff" stroke-width="0.8" opacity="0.85"/>`
        + `<text x="${X(x0) - 3 * s}" y="${Y(v) - 1}" font-family="monospace" font-size="${2.3 * s}" fill="#ff0">${v}</text>`;
    }
  }
  const l = Math.max(0, Math.round(X(x0) - 20)), t = Math.max(0, Math.round(Y(y0) - 20));
  const w = Math.min(md.width - l, Math.round(X(x1) - X(x0) + 40)), h = Math.min(md.height - t, Math.round(Y(y1) - Y(y0) + 40));
  const zoom = cmd === 'crop' ? (+(args[2] || 50)) / s : +(args[3] || 2);
  const comp = g
    ? await sharp(P(file)).composite([{ input: await layer(g, md.width, md.height) }]).png().toBuffer()
    : await sharp(P(file)).png().toBuffer();
  const dst = HERE + '_jp15-' + cmd + '-' + file.replace(/\.\w+$/, '') + '.png';
  await sharp(comp).extract({ left: l, top: t, width: w, height: h }).resize(Math.round(w * zoom)).png().toFile(dst);
  console.log(dst, ' 1 viewBox unit =', (s * zoom).toFixed(1), 'px in the output');
} else if (cmd === 'ladder') {
  const file = args[0], mode = args[1];
  const [a0, a1, b0, b1] = args[2].split(',').map(Number);
  const STEP = +(args[3] || 0.25);
  const d = DISC(file), { s, X, Y } = mapper(d);
  const { data, W, H } = await grey(file);
  const at = (x, y) => { const xi = Math.round(x), yi = Math.round(y); return (xi < 0 || yi < 0 || xi >= W || yi >= H) ? NaN : data[yi * W + xi]; };
  console.log(`# ${file}  ${mode === 'v' ? 'down y' : 'across x'} ${a0}..${a1}, averaged over ${b0}..${b1}   1 unit = ${s.toFixed(3)} px`);
  for (let v = a0; v <= a1 + 1e-9; v += STEP) {
    let sum = 0, n = 0;
    for (let u = b0; u <= b1; u += 0.05) {
      const g = mode === 'v' ? at(X(u), Y(v)) : at(X(v), Y(u));
      if (!Number.isNaN(g)) { sum += g; n++; }
    }
    const m = sum / n;
    console.log(v.toFixed(2).padStart(6), String(Math.round(m)).padStart(4), '#'.repeat(Math.max(0, Math.round(m / 4))));
  }
} else {
  console.log('unknown command: ' + cmd);
}
