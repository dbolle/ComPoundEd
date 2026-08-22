// SPECIALIST working instrument (dime obverse, D7 round). NOT a judge
// instrument and NOT evidence: it exists so every picture in the round report
// has a generator (§4.3, "an image's reproducible artefact is its GENERATOR").
//
// What it does: takes the dime obverse as the app emits it, maps our own
// viewBox into a reference photograph through that photograph's frozen disc fit
// (`_jd1discs.json`), draws our HEAD/HAIR outline on the photograph, marks the
// four D7 knots under repair, and writes a zoom crop around each one so the
// question "is this corner on the coin?" is asked of the coin.
//
// The mapping is the same one `_p2iou.mjs` uses in the other direction:
//   viewBox = 50 + 47 * (px - cx) / R          (disc-normalised, blank r=47)
//   local   = viewBox through translate/scale pulled out of the emitted SVG
// No literal here is derived from our drawing except the drawing itself.
//
// Run: node coloringbook/judge/_sd7over.mjs [ref.jpg] [outPrefix]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const ROOT = new URL('../../', import.meta.url).pathname;
const REF = process.argv[2] || 'dime-obv-2.jpg';
const OUT = process.argv[3] || '/tmp/sd7';
const discs = JSON.parse(readFileSync(`${ROOT}coloringbook/judge/_jd1discs.json`, 'utf8'));
const disc = discs[REF];
if (!disc) { console.log(`no frozen disc fit for ${REF} — candidates: ${Object.keys(discs).join(', ')}`); process.exit(1); }
const { cx, cy, R } = disc;

const { coinSVG } = await import(`${ROOT}src/art/coins.js`);
const svg = coinSVG('dime', 600, { side: 'obverse' });
const g = svg.match(/transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\)">/);
const [tx, ty, sx, sy] = g.slice(1).map(Number);
// every path inside the bust transform, in emission order, de-duplicated
const inside = svg.slice(g.index + g[0].length);
const ds = [...new Set([...inside.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]))];

// local -> reference pixels
const toPx = (x, y) => {
  const vx = tx + sx * x, vy = ty + sy * y;
  return [cx + (R * (vx - 50)) / 47, cy + (R * (vy - 50)) / 47];
};

// The four knots this round is about, in LOCAL coordinates, read off the
// source constants (not recomputed from a fit).
const KNOTS = JSON.parse(process.env.SD7_KNOTS || JSON.stringify([
  { name: 'HEAD k23 truncation', p: [-2.31, 41.34] },
  { name: 'HAIR k16 nape', p: [-30.93, 6.44] },
  { name: 'HAIR k30 closure-L', p: [10, -28.4] },
  { name: 'HAIR k0 hairline tip', p: [10.37, -28.04] },
]));

const meta = await sharp(`${ROOT}coloringbook/ref/${REF}`).metadata();
const W = meta.width, H = meta.height;
// our outline, transformed into reference pixel space, as one overlay SVG
const xform = `translate(${cx - (R * 50) / 47} ${cy - (R * 50) / 47}) scale(${R / 47}) translate(${tx} ${ty}) scale(${sx} ${sy})`;
const strokeW = (47 / R) * 0.35;
const marks = KNOTS.map(({ name, p }) => {
  const [px, py] = toPx(p[0], p[1]);
  return `<circle cx="${px}" cy="${py}" r="${R * 0.02}" fill="none" stroke="#ff0" stroke-width="${R * 0.006}"/>` +
    `<text x="${px + R * 0.03}" y="${py}" font-family="monospace" font-size="${R * 0.045}" fill="#ff0">${name}</text>`;
}).join('');
const over = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <g transform="${xform}">${ds.map((d) => `<path d="${d}" fill="none" stroke="#f0f" stroke-width="${strokeW}"/>`).join('')}</g>
  ${marks}</svg>`;
await sharp(`${ROOT}coloringbook/ref/${REF}`).composite([{ input: Buffer.from(over) }]).png().toFile(`${OUT}-full.png`);
console.log(`${OUT}-full.png   ${REF}  disc cx ${cx} cy ${cy} R ${R}  (${ds.length} paths drawn)`);

// zoom crops: the photograph alone, and the photograph with our outline, side
// by side, so the eye is not led by the drawing (§3 D12's control logic).
const half = Math.round(R * Number(process.env.SD7_ZOOM || 0.18));
for (const { name, p } of KNOTS) {
  const [px, py] = toPx(p[0], p[1]);
  const left = Math.max(0, Math.round(px) - half), top = Math.max(0, Math.round(py) - half);
  const w = Math.min(2 * half, W - left), h = Math.min(2 * half, H - top);
  const tag = name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const bare = await sharp(`${ROOT}coloringbook/ref/${REF}`).extract({ left, top, width: w, height: h }).resize(560).png().toBuffer();
  // composite THEN extract, in two pipelines. Sharp orders extract before
  // composite inside one pipeline, which makes the full-frame overlay larger
  // than the (already cropped) base and throws.
  const flat = await sharp(`${ROOT}coloringbook/ref/${REF}`).composite([{ input: Buffer.from(over) }]).png().toBuffer();
  const drawn = await sharp(flat).extract({ left, top, width: w, height: h }).resize(560).png().toBuffer();
  const S = 560;
  await sharp({ create: { width: 2 * S + 12, height: S, channels: 3, background: '#fff' } })
    .composite([{ input: bare, left: 0, top: 0 }, { input: drawn, left: S + 12, top: 0 }])
    .png().toFile(`${OUT}-${tag}.png`);
  console.log(`${OUT}-${tag}.png   centre (${px.toFixed(1)}, ${py.toFixed(1)})  crop ${w}x${h}  [left: photograph only, right: + our outline]`);
}
