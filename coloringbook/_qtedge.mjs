// SILVER ON SILVER, AND THE CHANNEL THAT HAS A PLATEAU.
//
// The quarter's references fail §2.2's level test in both polarities
// (_qtseg.mjs), and they fail a homomorphic-flatten + darkness flood as well
// (_qtflat.mjs / _qtbottle.mjs) for a reason worth stating: on a LIT,
// uncirculated coin the boundary is not a dark ridge all the way round. It is
// a dark trough on the shaded side and a BRIGHT rim on the lit side, so any
// flood through "not dark" walks straight in over the lit half of the bust.
// The filled overlay in the run document shows exactly that — the mask comes
// back as the shadow side of the portrait, not the portrait.
//
// What IS closed all the way round is the ENERGY of that step. Both a trough
// and a rim are large |grad I|; the bare field of a struck coin is not. So:
//
//   1. blur to 0.008R (kills JPEG and mint lustre, keeps the boundary),
//   2. Sobel magnitude G,
//   3. flood the field inward from just inside the rim through G <= T,
//   4. bust = the largest component not reached, holes filled.
//
// §2.2's plateau test then decides T, on G instead of on grey. Exports the
// pieces so the freezer and the overlay tool can reuse them.
import sharp from 'sharp';

const P = (f) => new URL('./ref/' + f, import.meta.url).pathname;

export async function energy(file, disc, sig = null) {
  const s = sig ?? 0.008 * disc.R;
  const { data, info } = await sharp(P(file)).flatten({ background: '#808080' })
    .greyscale().blur(s).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const G = new Float32Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x;
    const gx = -data[i - W - 1] - 2 * data[i - 1] - data[i + W - 1] + data[i - W + 1] + 2 * data[i + 1] + data[i + W + 1];
    const gy = -data[i - W - 1] - 2 * data[i - W] - data[i - W + 1] + data[i + W - 1] + 2 * data[i + W] + data[i + W + 1];
    G[i] = Math.hypot(gx, gy) / 8;
  }
  return { G, W, H, grey: data };
}

export function segment(G, W, H, disc, T, rFrac = 0.93) {
  const seen = new Uint8Array(W * H); const st = new Int32Array(W * H); let sp = 0;
  const inD = (x, y) => Math.hypot(x - disc.cx, y - disc.cy) <= rFrac * disc.R;
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const p = y * W + x;
    if (seen[p] || !inD(x, y) || G[p] > T) return;
    seen[p] = 1; st[sp++] = p;
  };
  for (let a = 0; a < 7200; a++) {
    const t = a * Math.PI / 3600;
    push(Math.round(disc.cx + rFrac * disc.R * 0.995 * Math.cos(t)),
      Math.round(disc.cy + rFrac * disc.R * 0.995 * Math.sin(t)));
  }
  while (sp > 0) {
    const p = st[--sp], x = p % W, y = (p - x) / W;
    push(x - 1, y); push(x + 1, y); push(x, y - 1); push(x, y + 1);
  }
  const raw = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = y * W + x; if (!seen[p] && inD(x, y)) raw[p] = 1;
  }
  const lab = new Int32Array(W * H).fill(-1);
  let best = -1, bestN = 0, nl = 0;
  for (let i = 0; i < W * H; i++) {
    if (!raw[i] || lab[i] >= 0) continue;
    let sp2 = 0; st[sp2++] = i; lab[i] = nl; let n = 0;
    while (sp2 > 0) {
      const p = st[--sp2]; n++; const x = p % W, y = (p - x) / W;
      if (x > 0 && raw[p - 1] && lab[p - 1] < 0) { lab[p - 1] = nl; st[sp2++] = p - 1; }
      if (x < W - 1 && raw[p + 1] && lab[p + 1] < 0) { lab[p + 1] = nl; st[sp2++] = p + 1; }
      if (y > 0 && raw[p - W] && lab[p - W] < 0) { lab[p - W] = nl; st[sp2++] = p - W; }
      if (y < H - 1 && raw[p + W] && lab[p + W] < 0) { lab[p + W] = nl; st[sp2++] = p + W; }
    }
    if (n > bestN) { bestN = n; best = nl; } nl++;
  }
  const keep = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) keep[i] = lab[i] === best ? 1 : 0;
  const bg = new Uint8Array(W * H); sp = 0;
  const seed = (p) => { if (!keep[p] && !bg[p]) { bg[p] = 1; st[sp++] = p; } };
  for (let x = 0; x < W; x++) { seed(x); seed((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { seed(y * W); seed(y * W + W - 1); }
  while (sp > 0) {
    const p = st[--sp], x = p % W, y = (p - x) / W;
    if (x > 0) seed(p - 1); if (x < W - 1) seed(p + 1);
    if (y > 0) seed(p - W); if (y < H - 1) seed(p + W);
  }
  const m = new Uint8Array(W * H); let area = 0;
  for (let i = 0; i < W * H; i++) { m[i] = bg[i] ? 0 : 1; area += m[i]; }
  return { m, area, eqR: Math.sqrt(area / Math.PI), blobs: nl };
}

// THE BARRIER MAP, and this is what turns a soft ramp into a real plateau.
//
// A plain flood is decided by the single weakest pixel on the boundary ridge,
// so its threshold sweep drifts. Instead compute, for every pixel,
//
//     Bar(p) = min over paths from the rim of ( max G along the path )
//
// -- the lowest ridge you must cross to reach p from the field. Bar is CONSTANT
// across a region enclosed by a closed ridge, and equal to that ridge's weakest
// point, so { Bar > T } is the same set for every T between the field's own
// noise and that weakest point. §2.2's plateau appears where the threshold
// sweep had none. Min-first Dijkstra, bucketed at 0.05 of G.
export function barrier(G, W, H, disc, rFrac = 0.93) {
  const NB = 4000, K = 20;              // bucket = 1/K units of G
  const Bar = new Float32Array(W * H).fill(Infinity);
  const buckets = Array.from({ length: NB + 1 }, () => []);
  const inD = (x, y) => Math.hypot(x - disc.cx, y - disc.cy) <= rFrac * disc.R;
  const lev = (v) => Math.max(0, Math.min(NB, Math.round(v * K)));
  for (let a = 0; a < 7200; a++) {
    const t = a * Math.PI / 3600;
    const x = Math.round(disc.cx + rFrac * disc.R * 0.995 * Math.cos(t));
    const y = Math.round(disc.cy + rFrac * disc.R * 0.995 * Math.sin(t));
    const p = y * W + x; if (G[p] < Bar[p]) { Bar[p] = G[p]; buckets[lev(G[p])].push(p); }
  }
  for (let L = 0; L <= NB; L++) {
    const bk = buckets[L];
    for (let k = 0; k < bk.length; k++) {
      const p = bk[k]; if (lev(Bar[p]) !== L) continue;
      const x = p % W, y = (p - x) / W;
      const nb = [];
      if (x > 0) nb.push(p - 1); if (x < W - 1) nb.push(p + 1);
      if (y > 0) nb.push(p - W); if (y < H - 1) nb.push(p + W);
      for (const q of nb) {
        const qx = q % W, qy = (q - qx) / W;
        if (!inD(qx, qy)) continue;
        const nv = Math.max(Bar[p], G[q]);
        if (nv < Bar[q]) { Bar[q] = nv; buckets[Math.max(lev(nv), L)].push(q); }
      }
    }
  }
  return Bar;
}

// bust = largest component of { Bar > T }, holes filled
export function segmentBar(Bar, W, H, disc, T, rFrac = 0.93) {
  const raw = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = y * W + x;
    if (Math.hypot(x - disc.cx, y - disc.cy) <= rFrac * disc.R && Bar[p] > T) raw[p] = 1;
  }
  return largestFilled(raw, W, H);
}

export function largestFilled(raw, W, H) {
  const lab = new Int32Array(W * H).fill(-1); const st = new Int32Array(W * H);
  let best = -1, bestN = 0, nl = 0;
  for (let i = 0; i < W * H; i++) {
    if (!raw[i] || lab[i] >= 0) continue;
    let sp = 0; st[sp++] = i; lab[i] = nl; let n = 0;
    while (sp > 0) {
      const p = st[--sp]; n++; const x = p % W, y = (p - x) / W;
      if (x > 0 && raw[p - 1] && lab[p - 1] < 0) { lab[p - 1] = nl; st[sp++] = p - 1; }
      if (x < W - 1 && raw[p + 1] && lab[p + 1] < 0) { lab[p + 1] = nl; st[sp++] = p + 1; }
      if (y > 0 && raw[p - W] && lab[p - W] < 0) { lab[p - W] = nl; st[sp++] = p - W; }
      if (y < H - 1 && raw[p + W] && lab[p + W] < 0) { lab[p + W] = nl; st[sp++] = p + W; }
    }
    if (n > bestN) { bestN = n; best = nl; } nl++;
  }
  const keep = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) keep[i] = lab[i] === best ? 1 : 0;
  const bg = new Uint8Array(W * H); let sp = 0;
  const seed = (p) => { if (!keep[p] && !bg[p]) { bg[p] = 1; st[sp++] = p; } };
  for (let x = 0; x < W; x++) { seed(x); seed((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { seed(y * W); seed(y * W + W - 1); }
  while (sp > 0) {
    const p = st[--sp], x = p % W, y = (p - x) / W;
    if (x > 0) seed(p - 1); if (x < W - 1) seed(p + 1);
    if (y > 0) seed(p - W); if (y < H - 1) seed(p + W);
  }
  const m = new Uint8Array(W * H); let area = 0;
  for (let i = 0; i < W * H; i++) { m[i] = bg[i] ? 0 : 1; area += m[i]; }
  return { m, area, eqR: Math.sqrt(area / Math.PI), blobs: nl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { DISCS } = await import('./_qtseg.mjs');
  for (const f of Object.keys(DISCS)) {
    const disc = DISCS[f];
    const { G, W, H } = await energy(f, disc);
    const row = [];
    for (const T of [2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 17, 20, 25, 30]) {
      const s = segment(G, W, H, disc, T);
      row.push(`${T}:${(s.eqR / disc.R).toFixed(4)}`);
    }
    console.log(`${f.padEnd(18)} eqR/R vs |grad| flood threshold:`);
    console.log('   ' + row.join(' '));
  }
}
