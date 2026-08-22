// _jn15over — OUR LIT RIDGES DRAWN ON THE PHOTOGRAPH (§4.3's obligation).
//
// The round placed ridges from a measured direction field. That is a number;
// this is the picture that says whether the number found the right feature. If
// the red curves do not lie along the strands in the photograph, no residual in
// degrees is worth anything.
//
// New courses are RED, the ridges the round did not touch are BLUE, and the
// dark curls are YELLOW, so the reader can see which family is which without
// being told.
//
// Run: node coloringbook/judge/_jn15over.mjs <coins.js> [ref] [tag]
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { localToPx, pxPerLocal, REFP } from './_jn14map.mjs';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const [, , SRC = new URL('../../src/art/coins.js', import.meta.url).pathname,
  FILE = 'nickel-obv-unc2004.jpg', TAG = 'r4'] = process.argv;
const raw = readFileSync(SRC, 'utf8');

const i = raw.indexOf('const RELIEF = {');
const j = raw.indexOf('\n  Jefferson: {', i);
const k = raw.indexOf('\n  // ROOSEVELT', j);
const ridges = [...raw.slice(j, k).matchAll(/<path d="([^"]+)" fill="none" stroke-width="([0-9.]+)"\/>/g)]
  .map((m) => ({ d: m[1], w: +m[2] }));
const curls = [...raw.slice(raw.indexOf('const CURLS_JEFFERSON ='), raw.indexOf('// Which obverse each coin carries'))
  .matchAll(/<path d="([^"]+)"/g)].map((m) => ({ d: m[1], w: 1.4 }));

function flat(d) {
  const tok = d.trim().split(/[\s,]+/);
  let i = 0, cur = [0, 0]; const out = [];
  const num = () => +tok[i++];
  const push = (fn) => { for (let n = 1; n <= 40; n++) out.push(fn(n / 40)); };
  while (i < tok.length) {
    const c = tok[i++];
    if (c === 'M') { cur = [num(), num()]; out.push(cur.slice()); }
    else if (c === 'L') { const e = [num(), num()], s = cur.slice(); push((u) => [s[0] + u * (e[0] - s[0]), s[1] + u * (e[1] - s[1])]); cur = e; }
    else if (c === 'q') { const c1 = [cur[0] + num(), cur[1] + num()], e = [cur[0] + num(), cur[1] + num()], s = cur.slice(); push((u) => [(1 - u) ** 2 * s[0] + 2 * u * (1 - u) * c1[0] + u * u * e[0], (1 - u) ** 2 * s[1] + 2 * u * (1 - u) * c1[1] + u * u * e[1]]); cur = e; }
    else if (c === 'C') { const c1 = [num(), num()], c2 = [num(), num()], e = [num(), num()], s = cur.slice(); push((u) => [(1 - u) ** 3 * s[0] + 3 * u * (1 - u) ** 2 * c1[0] + 3 * u * u * (1 - u) * c2[0] + u ** 3 * e[0], (1 - u) ** 3 * s[1] + 3 * u * (1 - u) ** 2 * c1[1] + 3 * u * u * (1 - u) * c2[1] + u ** 3 * e[1]]); cur = e; }
    else throw new Error('unsupported ' + c);
  }
  return out;
}
// A ridge counts as NEW if it is a cubic (`C`) — every mark this file had
// before round 4 is a quadratic `q` or a straight `L`. Stated as a rule rather
// than a hand-kept list so it cannot drift out of date silently.
const isNew = (r) => / C /.test(r.d);
const ppl = pxPerLocal(FILE);
const draw = (r, colour) => {
  const P = flat(r.d).map(([x, y]) => localToPx(FILE, x, y));
  return `<polyline points="${P.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')}" fill="none" stroke="${colour}" stroke-width="${(r.w * ppl).toFixed(1)}" stroke-linecap="round" opacity="0.62"/>`;
};
const g = ridges.map((r) => draw(r, isNew(r) ? '#ff2d55' : '#2d7bff')).concat(curls.map((c) => draw(c, '#ffd400')));
console.log(`${SRC} sha256:${createHash('sha256').update(readFileSync(SRC)).digest('hex').slice(0, 16)}`);
console.log(`${ridges.filter(isNew).length} NEW ridges (red), ${ridges.filter((r) => !isNew(r)).length} untouched ridges (blue), ${curls.length} dark curls (yellow), on ${FILE}`);

const m = await sharp(REFP(FILE)).metadata();
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${m.width}" height="${m.height}">${g.join('')}</svg>`;
const buf = await sharp(REFP(FILE)).composite([{ input: Buffer.from(svg) }]).png().toBuffer();
const a = localToPx(FILE, 12, -34), b = localToPx(FILE, -38, 16);
const L = Math.max(0, Math.round(Math.min(a[0], b[0]))), T = Math.max(0, Math.round(Math.min(a[1], b[1])));
const out = HERE(`_jn15over-${TAG}-${FILE.replace(/[^a-z0-9]/gi, '_')}.png`);
await sharp(buf).extract({ left: L, top: T, width: Math.min(m.width - L, Math.round(Math.abs(b[0] - a[0]))), height: Math.min(m.height - T, Math.round(Math.abs(b[1] - a[1]))) })
  .resize({ width: 1000 }).png().toFile(out);
console.log(`-> ${out.split('/').pop()}`);
