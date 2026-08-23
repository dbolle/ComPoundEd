// WHAT SURVIVES THE PAINT ORDER — every mark on one face, drawn area against
// visible area, measured on the emitted SVG rather than argued from the source.
//
// WHY. Two rounds of this sweep found a mark that was drawn and then covered by
// something painted after it (the cent's bow tie, the nickel's curls over the
// lit ridges). `bust()` emits, in this order: bevel, head fill, iconWig,
// PLANES, SHADE, HAIR, then grooves, then the LIT ridges (`base`/`fine`), then
// `modelling` (`face`/`faceFine`), then the DARK group (`eyeMark`/`earMark`/
// `dark`). Anything in an early group that lies under a later opaque fill
// contributes nothing to the picture, and no gate in this project can see it:
// D1's mask is the silhouette, D6 is blind to stroke width, D3's patches are
// medians over regions.
//
// METHOD, and it needs no geometry. Render the face. Then, for each drawable
// element in document order, render (a) the whole face with that element
// deleted and (b) the face truncated after that element, with and without it.
// (b) is what the element PAINTS; (a) is what it CONTRIBUTES. Their ratio is
// how much of the mark is painted over by what comes later.
//
// A mark that paints 400 px and contributes 400 px is fully visible; one that
// paints 400 and contributes 20 is 95% buried.
//
// usage: node coloringbook/judge/_do3paint.mjs [denom] [side] [px]
import sharp from 'sharp';
import { join } from 'node:path';
import { ROOT } from './_paths.mjs';

const id = process.argv[2] || 'dime';
const side = process.argv[3] || 'obverse';
const PX = Number(process.argv[4] || 1200);

const { coinSVG } = await import(join(ROOT, 'src/art/coins.js'));
const full = coinSVG(id, PX, { side });

// Every drawable leaf, in document order.
const RE = /<(path|ellipse|circle|rect|polygon)\b[^>]*\/>/g;
const els = [];
for (let m; (m = RE.exec(full)); ) els.push({ i: m.index, len: m[0].length, s: m[0] });

async function raw(svg) {
  const { data, info } = await sharp(Buffer.from(svg))
    .flatten({ background: '#ffffff' }).raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height, ch: info.channels };
}
const diff = (a, b) => {
  let n = 0;
  for (let p = 0; p < a.d.length; p += a.ch) {
    if (a.d[p] !== b.d[p] || a.d[p + 1] !== b.d[p + 1] || a.d[p + 2] !== b.d[p + 2]) n++;
  }
  return n;
};

const F = await raw(full);
const rows = [];
for (const e of els) {
  const without = full.slice(0, e.i) + full.slice(e.i + e.len);
  // truncate the document after this element: everything the renderer would
  // draw later is removed, so what is left is exactly what this mark paints on.
  const laterFrom = e.i + e.len;
  const tail = full.slice(laterFrom);
  const closes = tail.replace(/<(path|ellipse|circle|rect|polygon)\b[^>]*\/>/g, '');
  const upto = full.slice(0, laterFrom) + closes;
  const uptoWithout = full.slice(0, e.i) + full.slice(e.i + e.len, laterFrom) + closes;

  const [A, U, UW] = await Promise.all([raw(without), raw(upto), raw(uptoWithout)]);
  const paints = diff(U, UW);
  const contributes = diff(F, A);
  rows.push({ ...e, paints, contributes });
}

const tag = (s) => {
  const d = /\bd="([^"]*)"/.exec(s), c = /<(\w+)/.exec(s);
  const cx = /cx="([-\d.]+)"[^>]*cy="([-\d.]+)"/.exec(s);
  const sw = /stroke-width="([-\d.]+)"/.exec(s);
  const head = d ? d.slice(0, 34) : cx ? `cx ${cx[1]} cy ${cx[2]}` : '';
  return `${c[1].padEnd(7)} ${sw ? `w${sw[1]}`.padEnd(7) : 'fill'.padEnd(7)} ${head}`;
};

console.log(`${id} ${side} at ${PX}px — ${els.length} drawable elements`);
console.log('  #   paints  visible   buried  element');
rows.forEach((r, k) => {
  const pct = r.paints ? (1 - r.contributes / r.paints) * 100 : 0;
  const flag = r.paints > 0 && pct > 40 ? (pct > 90 ? '  <== INVISIBLE' : '  <== mostly buried') : '';
  console.log(
    String(k).padStart(4),
    String(r.paints).padStart(8),
    String(r.contributes).padStart(8),
    `${pct.toFixed(1)}%`.padStart(8),
    ' ', tag(r.s), flag,
  );
});
