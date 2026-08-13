// ROUND 4 — THE CANONICAL DISC FIT FOR THE PROOF REFERENCES.
//
// Round 4's overlay found that BOTH existing fitters fail on a cameo proof
// photographed against a coloured ground:
//
//   file                _rvdisc.fit (grey flood)   _jqvalley.fitDisc
//   qp1964-obv-pad.png  R 183, centred on LIBERTY  R 318.3
//   qp1964-rev-pad.png  R 318, well outside coin   R 318.3
//   qp1963-obv-pad.png  R 290 (correct)            R 318.3
//
// _jqvalley returned **318.3 for three different files**. §4's rule: two
// bit-identical answers from two different inputs is not agreement. 318.3 is
// ((600-1) + (675-1)) / 4 + eps — the half-mean side of the ORIGINAL 600x675
// crop that `qp*-pad.png` was padded from. It fitted the PADDING RECTANGLE.
//
// The physical reason the grey flood fails: on a cameo proof the field is a
// black mirror, so "dark" is the coin, not the surround.
//
// What separates them reliably is CHROMA. The coin is silver: black mirror and
// white frost are both near-neutral. The plates' grounds are dark teal and tan
// marble, both strongly coloured. So:
//
//   strategy `chroma` — background = |chroma - cornerChroma| <= tol, flooded in
//                       from the frame; used when corner chroma >= 15.
//   strategy `grey`   — _rvdisc's flood/alpha, used otherwise.
//
// Both then ray-cast from the centroid and Kasa-fit, dropping the bottom
// sector (visible edge thickness, §2.1) and re-weighting once against the
// residual so a chipped mask cannot drag the circle.
//
// §4.2 selection test: EVERY strategy's answer is printed for EVERY file, plus
// the Hough outer-edge fit from `_jq40disc.mjs` as an independent third, and a
// file whose chosen fit disagrees with both others by > 2% of R is flagged
// AMBIGUOUS and is not used until the overlay has been looked at.
// §4.3: `_jq41disc-overlay.png` draws every accepted fit on its source.
import sharp from 'sharp';
import { rayCast, kasa } from '../_qtdisc.mjs';
import { fit as greyFit } from '../_rvdisc.mjs';
import { houghDisc } from './_jq40disc.mjs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;

export async function chromaMask(file, tol = 12) {
  const { data, info } = await sharp(P(file)).flatten({ background: '#808080' })
    .raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, C = info.channels;
  const ch = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const r = data[i * C], g = data[i * C + 1], b = data[i * C + 2];
    ch[i] = Math.max(r, g, b) - Math.min(r, g, b);
  }
  const border = [];
  for (let x = 0; x < W; x++) border.push(ch[x], ch[(H - 1) * W + x]);
  for (let y = 0; y < H; y++) border.push(ch[y * W], ch[y * W + W - 1]);
  border.sort((a, b) => a - b);
  const bc = border[border.length >> 1];
  const bg = new Uint8Array(W * H); const st = new Int32Array(W * H); let sp = 0;
  const push = (p) => { if (!bg[p] && Math.abs(ch[p] - bc) <= tol) { bg[p] = 1; st[sp++] = p; } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (sp > 0) { const p = st[--sp], x = p % W, y = (p - x) / W;
    if (x > 0) push(p - 1); if (x < W - 1) push(p + 1);
    if (y > 0) push(p - W); if (y < H - 1) push(p + W); }
  const m = new Uint8Array(W * H); let n = 0;
  for (let i = 0; i < W * H; i++) { m[i] = bg[i] ? 0 : 1; n += m[i]; }
  return { m, W, H, area: n, bc, via: `chroma(${bc}+-${tol})` };
}

function fitFromMask({ m, W, H, area, via }) {
  const pts = rayCast(m, W, H, area);
  let use = pts.filter(([a]) => !(a > 25 && a < 155));   // drop bottom: edge thickness
  let f = kasa(use);
  for (let it = 0; it < 2; it++) {                        // one robust re-weight
    const r = use.map(([, x, y]) => Math.hypot(x - f.cx, y - f.cy) - f.R);
    const s = r.map(Math.abs).sort((a, b) => a - b)[(r.length * 0.7) | 0] || 1;
    use = use.filter((p, i) => Math.abs(r[i]) <= Math.max(3 * s, 2));
    f = kasa(use);
  }
  const res = pts.filter(([a]) => !(a > 25 && a < 155))
    .map(([, x, y]) => Math.abs(Math.hypot(x - f.cx, y - f.cy) - f.R)).sort((a, b) => a - b);
  return { cx: f.cx, cy: f.cy, R: f.R, W, H, via, p95: res[(res.length * 0.95) | 0], med: res[res.length >> 1] };
}

export async function chromaDisc(file, tol = 12) { return fitFromMask(await chromaMask(file, tol)); }

// choose per file, print everything
export async function best(file) {
  const g = await greyFit(file).then((r) => ({ cx: r.cx, cy: r.cy, R: r.R, p95: r.p95, via: r.via })).catch(() => null);
  const hb = await houghDisc(file);
  const h = { cx: hb.cx, cy: hb.cy, R: hb.R, via: 'hough' };
  const cm = await chromaMask(file);
  const c = cm.bc >= 15 ? fitFromMask(cm) : null;
  const chosen = c ?? g ?? h;
  const others = [g, h, c].filter((x) => x && x !== chosen);
  const agree = others.map((o) => 100 * Math.abs(o.R - chosen.R) / chosen.R);
  return { file, grey: g, hough: h, chroma: c, chosen,
    agreePc: agree.map((v) => +v.toFixed(2)), ambiguous: !agree.some((v) => v <= 2.0) };
}

export const FILES = ['dime-obv-2.jpg', 'qp1963-obv-pad.png', 'qp1963-rev-pad.png',
  'qp1964-obv-pad.png', 'qp1964-rev-pad.png', 'quarter-proof-ebay.jpg',
  'q1995d-rev.png', 'quarter-rev-2.png', 'quarter-rev-3.jpg'];

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = process.argv.slice(2).length ? process.argv.slice(2) : FILES;
  const out = {}, tiles = [], tile = 460;
  const S = (d) => d ? `cx${d.cx.toFixed(0)} cy${d.cy.toFixed(0)} R${d.R.toFixed(1)}` : '—';
  console.log('§4.2 — every candidate fit for every file. chosen = chroma where the ground is coloured, else grey flood/alpha.\n');
  console.log('file                      grey flood/alpha      hough outer edge      chroma flood          chosen  agree%');
  for (const f of files) {
    const b = await best(f);
    out[f] = { cx: +b.chosen.cx.toFixed(2), cy: +b.chosen.cy.toFixed(2), R: +b.chosen.R.toFixed(2) };
    console.log(`${f.padEnd(24)} ${S(b.grey).padEnd(22)}${S(b.hough).padEnd(22)}${S(b.chroma).padEnd(22)}` +
      `${(b.chroma ? 'chroma' : b.grey ? 'grey' : 'hough').padEnd(8)}${b.agreePc.join('/')}` +
      (b.ambiguous ? '   <-- AMBIGUOUS (§4.2): no other strategy within 2% — LOOK before using' : ''));
    const d = b.chosen, W = b.hough.W, H = b.hough.H;
    const s = tile / Math.max(W, H), ox = (tile - W * s) / 2, oy = (tile - H * s) / 2;
    const cc = (r, col, w) => `<circle cx="${ox + d.cx * s}" cy="${oy + d.cy * s}" r="${d.R * s * r}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
    const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}">` +
      cc(1, '#00ff6a', 2) + cc(0.90, '#00e5ff', 1.2) + cc(0.862, '#ff2d55', 1.2) +
      `<text x="4" y="14" font-family="monospace" font-size="13" fill="#fff">${f}  R=${d.R.toFixed(1)}</text></svg>`);
    tiles.push(await sharp(P(f)).flatten({ background: '#808080' })
      .resize(tile, tile, { fit: 'contain', background: '#202020' }).composite([{ input: svg }]).png().toBuffer());
  }
  const cols = 3, rows = Math.ceil(tiles.length / cols);
  const png = new URL('./_jq41disc-overlay.png', import.meta.url).pathname;
  await sharp({ create: { width: cols * tile, height: rows * tile, channels: 3, background: '#404040' } })
    .composite(tiles.map((b, i) => ({ input: b, left: (i % cols) * tile, top: ((i / cols) | 0) * tile })))
    .png().toFile(png);
  console.log(`\noverlay: ${png}   green = fitted R, cyan = 0.90R, red = 0.862R (= viewBox r 40.5, the field circle)`);
  console.log('\nDISCS:'); console.log(JSON.stringify(out, null, 1));
}
