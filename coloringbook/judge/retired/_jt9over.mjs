// R5 dime throat — §4.3 overlay. Draws, ON THE SOURCE PHOTOGRAPH at full
// resolution: the frozen jaw axis (yellow), the drawn jaw region (magenta),
// the drawn throat region `shade` (cyan), and — the located feature this round
// turns on — the half-depth TOP EDGE of the photograph's own dark run below the
// jaw (red ticks), one per axis sample, taken by _jt9prof.
//
// A located feature that is not drawn on the source is not evidence (§4.3).
//
// Run: node coloringbook/judge/_jt9over.mjs [ref] [tag] [coins.js]
import sharp from 'sharp';
import { busted, discFor, makeMap } from './_jw4reg.mjs';
import { greyImg } from './_jw4width.mjs';
import { marks } from './_jqgeom.mjs';
import { axisWalk, profileAt, runs } from './_jt9prof.mjs';
import { relief, pathsOf } from './_jt9as.mjs';

const REFDIR = new URL('../ref/', import.meta.url).pathname;
const ref = process.argv[2] || 'dime-obv-2.jpg';
const tag = process.argv[3] || 'now';
const SRC = process.argv[4] || new URL('../../src/art/coins.js', import.meta.url).pathname;

const B = await busted();
const head = marks(`<svg><path d="${B.headD}"/></svg>`)[0].pts;
const disc = discFor(ref);
const M = makeMap(B, disc);
const g = await greyImg(REFDIR + ref);
const P = axisWalk(1);
const px = (p) => M.toPx(p.x, p.y);
const poly = (pts, col, w, close = false) =>
  `<poly${close ? 'gon' : 'line'} points="${pts.map((q) => `${q.px.toFixed(1)},${q.py.toFixed(1)}`).join(' ')}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
const LW = Math.max(1, disc.R / 260);

let s = poly(P.map(px), '#ffdd00', LW);
s += poly(marks(`<svg>${relief('dark', SRC)}</svg>`)[0].pts.map(px), '#ff00cc', LW * 1.3, true);
for (const d of pathsOf(relief('shade', SRC)))
  s += poly(marks(`<svg><path d="${d}"/></svg>`)[0].pts.map(px), '#00e5ff', LW * 1.3, true);

// the photograph's own throat run: half-depth top edge, as a tick
const found = [];
for (let i = 0; i < P.length; i += 2) {
  const pr = profileAt(g, M, P, i, 9, 1.5, head);
  const rs = runs(pr, Number(process.env.MINDEPTH || 10)).filter((r) => r.t < -0.5 && !r.bound);
  if (!rs.length) continue;
  const r = rs.sort((a, b) => b.depth - a.depth)[0];
  const p = P[i], nx = -p.ty, ny = p.tx;
  found.push({ s: p.s, tTop: r.tTop, t: r.t, tBot: r.tBot, d: r.depth });
  const A = px({ x: p.x + nx * r.tTop - p.tx * 0.5, y: p.y + ny * r.tTop - p.ty * 0.5 });
  const C = px({ x: p.x + nx * r.tTop + p.tx * 0.5, y: p.y + ny * r.tTop + p.ty * 0.5 });
  s += `<line x1="${A.px.toFixed(1)}" y1="${A.py.toFixed(1)}" x2="${C.px.toFixed(1)}" y2="${C.py.toFixed(1)}" stroke="#ff2200" stroke-width="${LW * 1.4}"/>`;
}
console.log(`${ref}: throat-run top edge at ${found.length} of ${P.length / 2 | 0} samples`);
console.log('  s / tTop / centre / tBot / depth');
for (const f of found) console.log(`  ${f.s.toFixed(0).padStart(3)}  ${f.tTop.toFixed(2).padStart(6)}  ${f.t.toFixed(2).padStart(6)}  ${f.tBot.toFixed(2).padStart(6)}  ${f.d.toFixed(0).padStart(4)}`);
if (found.length) {
  const a = found.map((f) => f.tTop);
  console.log(`  tTop mean ${(a.reduce((u, v) => u + v, 0) / a.length).toFixed(3)}  min ${Math.min(...a).toFixed(2)}  max ${Math.max(...a).toFixed(2)}`);
}

// dims from the RAW pipeline, not from metadata: metadata reports the stored
// size before EXIF rotation and the composite then refuses.
const md = { width: g.w, height: g.h };
const ov = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${md.width}" height="${md.height}">${s}</svg>`)).png().toBuffer();
const out = new URL(`./_jt9over-${ref.replace(/\./g, '-')}-${tag}.png`, import.meta.url).pathname;
// crop to the jaw/neck, 3x, so the eye can actually resolve it
const box = P.map(px);
const x0 = Math.max(0, Math.min(...box.map((q) => q.px)) - 6 * M.pxPerUnit);
const x1 = Math.min(md.width, Math.max(...box.map((q) => q.px)) + 6 * M.pxPerUnit);
const y0 = Math.max(0, Math.min(...box.map((q) => q.py)) - 6 * M.pxPerUnit);
const y1 = Math.min(md.height, Math.max(...box.map((q) => q.py)) + 12 * M.pxPerUnit);
// composite in its OWN pipeline: sharp applies extract-before-resize ahead of
// composite, so chaining them crops first and then refuses the full-size layer.
const flat = await sharp(REFDIR + ref).composite([{ input: ov, left: 0, top: 0 }]).png().toBuffer();
await sharp(flat)
  .extract({ left: Math.round(x0), top: Math.round(y0), width: Math.round(x1 - x0), height: Math.round(y1 - y0) })
  .resize({ width: Math.round((x1 - x0) * 3), kernel: 'nearest' }).png().toFile(out);
console.log('overlay -> ' + out);
console.log('yellow = frozen jaw axis, magenta = drawn jaw region, cyan = drawn `shade`, red ticks = photograph\'s throat-run top edge');
