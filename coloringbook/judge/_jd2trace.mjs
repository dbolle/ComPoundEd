// D2 — TRACING the dime reverse motif, one trace per proof, then their average.
//
// The owner cannot hand-trace, so the judge traces instead and presents the
// candidates for selection. This is the path §2.1 already allows: "a hand
// annotation is a legitimate frozen target", and R3 adds "try the overlay
// before you block". What blocked D2 was never the absence of a rule — it was
// that no single automatic threshold reproduces across references (the four
// available agree at only IoU 0.36–0.53 against a 0.95 gate).
//
// So this does not try to find one threshold that works everywhere. It traces
// EACH proof on its own terms, publishes each trace on its own coin, and then
// combines them by majority vote. A pixel in the average is motif when at
// least two of three independent photographs say it is — which is exactly the
// corroboration rule §5 applies to every other measurement in this project.
//
// WHY THESE THREE. Cameo proofs only: frosted device on a mirror field is the
// highest device/field contrast a coin photograph can have, and §20.3 says a
// frosted proof is the best SHAPE reference (and the worst tone one — this
// trace is never to be used for tone). The 2015 PCGS plate is excluded here
// despite its resolution because its contrast is INVERTED, which would need a
// second code path and a second chance to be wrong.
//
// Run: node coloringbook/judge/_jd2trace.mjs
import sharp from 'sharp';

const N = 700;            // disc-normalised grid, D2's own
const LOCUS = 0.70;       // inside the legend ring — legends are D5's subject
const AREA_MIN = 0.002;   // of the locus, to drop speckle
const REFS = [
  { file: 'dime-proof2010-pair.png', win: [0.0, 0.5, 0.0, 1.0], label: '2010-S' },
  { file: 'dime-proof1960-pair.png', win: [0.0, 1.0, 0.5, 1.0], label: '1960' },
  { file: 'dime-proof1968-pair.jpg', win: [0.5, 1.0, 0.0, 1.0], label: '1968' },
];
const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const OUT = (f) => new URL('./' + f, import.meta.url).pathname;

const greyOf = async (p) => {
  const { data, info } = await sharp(p).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
};

// disc by background differencing — polarity-agnostic, verified by overlay
function fitDisc(g, win) {
  const { d, w, h } = g;
  const [fx0, fx1, fy0, fy1] = win;
  const X0 = Math.round(fx0 * w), X1 = Math.round(fx1 * w);
  const Y0 = Math.round(fy0 * h), Y1 = Math.round(fy1 * h);
  const W = X1 - X0, H = Y1 - Y0;
  const px = (x, y) => d[(Y0 + y) * w + (X0 + x)];
  const border = [];
  for (let x = 0; x < W; x++) border.push(px(x, 0), px(x, H - 1));
  for (let y = 0; y < H; y++) border.push(px(0, y), px(W - 1, y));
  border.sort((a, b) => a - b);
  const bg = border[(border.length / 2) | 0];
  const on = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (Math.abs(px(x, y) - bg) > 25) on[y * W + x] = 1;
  const lab = new Int32Array(W * H).fill(-1);
  let best = null;
  for (let s = 0; s < W * H; s++) {
    if (!on[s] || lab[s] >= 0) continue;
    const st = [s]; lab[s] = s;
    let a = 0, sx = 0, sy = 0;
    while (st.length) {
      const p = st.pop(); a++;
      const x = p % W, y = (p / W) | 0; sx += x; sy += y;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const q = ny * W + nx;
        if (on[q] && lab[q] < 0) { lab[q] = s; st.push(q); }
      }
    }
    if (!best || a > best.a) best = { a, cx: sx / a, cy: sy / a };
  }
  return { cx: X0 + best.cx, cy: Y0 + best.cy, R: Math.sqrt(best.a / Math.PI) };
}

function valley(g, D) {
  const hist = new Array(256).fill(0);
  const { d, w, h } = g;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (Math.hypot((x - D.cx) / D.R, (y - D.cy) / D.R) <= LOCUS) hist[d[y * w + x]]++;
  }
  const sm = hist.map((_, i) => {
    let s = 0, n = 0;
    for (let k = Math.max(0, i - 5); k <= Math.min(255, i + 5); k++) { s += hist[k]; n++; }
    return s / n;
  });
  let m1 = 0;
  for (let i = 0; i < 256; i++) if (sm[i] > sm[m1]) m1 = i;
  let m2 = -1;
  for (let i = 0; i < 256; i++) if (Math.abs(i - m1) >= 40 && (m2 < 0 || sm[i] > sm[m2])) m2 = i;
  const lo = Math.min(m1, m2), hi = Math.max(m1, m2);
  let v = lo;
  for (let i = lo; i <= hi; i++) if (sm[i] < sm[v]) v = i;
  return v;
}

// the trace: motif = union of components above the area floor, inside the locus
function trace(g, D, T) {
  const { d, w, h } = g;
  const on = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const u = (2 * (i + 0.5)) / N - 1, v = (2 * (j + 0.5)) / N - 1;
    if (Math.hypot(u, v) > LOCUS) continue;
    const x = Math.round(D.cx + u * D.R), y = Math.round(D.cy + v * D.R);
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    if (d[y * w + x] >= T) on[j * N + i] = 1;
  }
  const lab = new Int32Array(N * N).fill(-1);
  const comps = [];
  for (let s = 0; s < N * N; s++) {
    if (!on[s] || lab[s] >= 0) continue;
    const id = comps.length;
    const st = [s]; lab[s] = id;
    let a = 0;
    while (st.length) {
      const p = st.pop(); a++;
      const x = p % N, y = (p / N) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
        const q = ny * N + nx;
        if (on[q] && lab[q] < 0) { lab[q] = id; st.push(q); }
      }
    }
    comps.push({ id, a });
  }
  const locusPx = Math.PI * ((N / 2) * LOCUS) ** 2;
  const keep = new Set(comps.filter((c) => c.a >= AREA_MIN * locusPx).map((c) => c.id));
  const mask = new Uint8Array(N * N);
  let area = 0;
  for (let k = 0; k < N * N; k++) if (keep.has(lab[k])) { mask[k] = 1; area++; }
  return { mask, frac: area / locusPx, kept: keep.size, comps: comps.length };
}

// mask -> outline pixels, for drawing
const outline = (m) => {
  const o = new Uint8Array(N * N);
  for (let j = 1; j < N - 1; j++) for (let i = 1; i < N - 1; i++) {
    if (!m[j * N + i]) continue;
    if (!m[(j - 1) * N + i] || !m[(j + 1) * N + i] || !m[j * N + i - 1] || !m[j * N + i + 1]) o[j * N + i] = 1;
  }
  return o;
};

// draw a set of outlines, each in its own colour, onto a source
async function draw(file, D, layers, out, title) {
  const meta = await sharp(P(file)).metadata();
  const s = (2 * D.R) / N; // grid px -> source px
  const parts = [];
  for (const { m, o, colour } of layers) {
    // translucent FILL first so the traced area reads at a glance, then a
    // solid OUTLINE on top so its boundary can be judged against the coin.
    // A 1px outline alone was unreadable at source resolution, which made the
    // first version of this sheet impossible to choose between.
    const fill = [];
    if (m) for (let j = 0; j < N; j += 2) for (let i = 0; i < N; i += 2) {
      if (!m[j * N + i]) continue;
      const u = (2 * (i + 0.5)) / N - 1, v = (2 * (j + 0.5)) / N - 1;
      fill.push(`<rect x="${(D.cx + u * D.R).toFixed(1)}" y="${(D.cy + v * D.R).toFixed(1)}" width="${Math.max(2, s * 2).toFixed(1)}" height="${Math.max(2, s * 2).toFixed(1)}" fill="${colour}" opacity="0.30"/>`);
    }
    const pts = [];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      if (!o[j * N + i]) continue;
      const u = (2 * (i + 0.5)) / N - 1, v = (2 * (j + 0.5)) / N - 1;
      pts.push(`<rect x="${(D.cx + u * D.R).toFixed(1)}" y="${(D.cy + v * D.R).toFixed(1)}" width="${Math.max(2, s * 1.6).toFixed(1)}" height="${Math.max(2, s * 1.6).toFixed(1)}" fill="${colour}"/>`);
    }
    parts.push(fill.join('') + pts.join(''));
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${meta.width}" height="${meta.height}">${parts.join('')}
    <text x="12" y="30" font-family="monospace" font-size="24" fill="#ff0">${title}</text></svg>`;
  await sharp(P(file)).composite([{ input: Buffer.from(svg) }]).png().toFile(OUT(out));
  return out;
}

const iou = (a, b) => {
  let i = 0, u = 0;
  for (let k = 0; k < a.length; k++) { const x = a[k], y = b[k]; if (x || y) u++; if (x && y) i++; }
  return u ? i / u : 0;
};

console.log('tracing the dime reverse motif on three cameo proofs, locus r <= 0.70 R\n');
const traces = [];
for (const R of REFS) {
  const g = await greyOf(P(R.file));
  const D = fitDisc(g, R.win);
  const T = valley(g, D);
  const t = trace(g, D, T);
  traces.push({ ...R, g, D, T, ...t });
  console.log(`${R.label.padEnd(8)} disc R ${D.R.toFixed(1).padStart(6)}  threshold ${String(T).padStart(3)}  motif ${(t.frac * 100).toFixed(1)}% of locus  ${t.kept}/${t.comps} components kept`);
}

// pairwise agreement, then the majority-vote average
console.log('\npairwise agreement between the three traces:');
for (let i = 0; i < traces.length; i++)
  for (let j = i + 1; j < traces.length; j++)
    console.log(`  ${traces[i].label} vs ${traces[j].label}   IoU ${iou(traces[i].mask, traces[j].mask).toFixed(4)}`);

const avg = new Uint8Array(N * N);
let avgArea = 0;
for (let k = 0; k < N * N; k++) {
  const votes = traces[0].mask[k] + traces[1].mask[k] + traces[2].mask[k];
  if (votes >= 2) { avg[k] = 1; avgArea++; }
}
const locusPx = Math.PI * ((N / 2) * LOCUS) ** 2;
console.log(`\nAVERAGE (a pixel is motif when at least 2 of 3 photographs say so): ${(avgArea / locusPx * 100).toFixed(1)}% of locus`);
for (const t of traces) console.log(`  average vs ${t.label.padEnd(8)} IoU ${iou(avg, t.mask).toFixed(4)}`);

// publish: each trace on its own coin, then the average on all three
const files = [];
for (const t of traces) files.push(await draw(t.file, t.D, [{ m: t.mask, o: outline(t.mask), colour: '#ff2020' }], `_jd2trace-own-${t.label}.png`, `${t.label} — its OWN trace`));
for (const t of traces) files.push(await draw(t.file, t.D, [{ m: avg, o: outline(avg), colour: '#00e0ff' }], `_jd2trace-avg-${t.label}.png`, `${t.label} — the AVERAGE of all three`));
console.log('\nwrote: ' + files.join(', '));
