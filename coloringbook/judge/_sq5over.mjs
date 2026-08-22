// SPECIALIST, quarter reverse — §4.3 overlay, cleanly separated.
//   left  panel: the reference alone, gridded (so a landmark can be read off)
//   right panel: the reference with OUR SOLID silhouette outlined on it
// Detail marks (primaries/coverts/breast) are drawn in a second colour and can
// be switched off, because the first overlay attempt was unreadable with both.
//
// Usage: node _sq5over.mjs <ref> [out]
// Generator for: coloringbook/judge/_sq5-over-*.png
import sharp from 'sharp';
import { normalise, N, SPAN } from '../_rvnorm.mjs';
import { discOf } from './_jq42indep.mjs';
import { coinSVG } from '../../src/art/coins.js';

const REF = process.argv[2] || 'quarter-rev-3.jpg';
const PX = 880;
const u2px = (u) => (u + SPAN) * PX / (2 * SPAN);
const X2px = (X) => u2px((X - 50) / 47);
const k = (X2px(100) - X2px(0)) / 100, off = X2px(0);

const svgTxt = coinSVG('quarter', 380, { side: 'reverse', decorative: true });
// the motif groups: coins.js emits the solid mass in one <g fill=...> and the
// detail in a <g fill="none" stroke=...>. Split on that rather than guessing.
// NESTING-AWARE: the detail group contains nested <g>s, so a non-greedy regex
// closes on the wrong tag. Walk the tags and cut at depth 0.
function topGroups(s) {
  const out = []; let depth = 0, start = -1;
  const re = /<(\/?)g\b[^>]*?(\/?)>/g; let m;
  while ((m = re.exec(s))) {
    if (m[2] === '/') continue;                       // self-closing <g/>
    if (m[1] === '') { if (depth === 0) start = m.index; depth++; }
    else { depth--; if (depth === 0) out.push(s.slice(start, m.index + m[0].length)); }
  }
  return out;
}
// coins.js wraps the whole motif in one bare <g>; descend into it. Inside:
//   [0] the white relief-off copy, [1][2] the two struck() copies of `solid`,
//   the eye <circle>, the detail <g fill="none">, the arrow bindings.
// Only ONE copy of `solid` is drawn here — three coincident outlines are not
// three pieces of evidence.
const outer = topGroups(svgTxt);
const motif = outer.find((g) => /^<g>/.test(g)) || outer[0];
const groups = topGroups(motif.replace(/^<g>/, '').replace(/<\/g>$/, ''));
const solidG = groups.filter((g) => /fill="#6b737b"/.test(g) && !/opacity/.test(g)).slice(0, 1);
const detailG = groups.filter((g) => /fill="none"/.test(g));
const eye = (motif.match(/<circle cx="46\.6"[^>]*>/) || [''])[0];
console.log(`emitted groups: ${groups.length}  solid-ish ${solidG.length}  detail ${detailG.length}`);

function grid() {
  let s = '';
  for (let X = 0; X <= 100; X += 5) {
    const p = X2px(X), maj = X % 25 === 0;
    s += `<line x1="${p}" y1="0" x2="${p}" y2="${PX}" stroke="#00c8ff" stroke-width="${maj ? 1 : 0.4}" opacity="${maj ? 0.7 : 0.3}"/>`;
    s += `<line x1="0" y1="${p}" x2="${PX}" y2="${p}" stroke="#00c8ff" stroke-width="${maj ? 1 : 0.4}" opacity="${maj ? 0.7 : 0.3}"/>`;
    s += `<text x="${p + 2}" y="13" font-family="monospace" font-size="12" fill="#00c8ff">${X}</text>`;
    s += `<text x="3" y="${p - 3}" font-family="monospace" font-size="12" fill="#00c8ff">${X}</text>`;
  }
  return s;
}

const d = await discOf(REF);
const g = await normalise(REF, d);
const buf = Buffer.alloc(N * N);
for (let p = 0; p < N * N; p++) buf[p] = Math.max(0, Math.min(255, Math.round(g[p])));
const base = await sharp(buf, { raw: { width: N, height: N, channels: 1 } })
  .resize(PX, PX).toColourspace('srgb').png().toBuffer();

// A group that was FILLED has no stroke attribute at all, so a blind
// s/stroke="…"/ leaves it invisible. Wrap instead of substitute.
const strip = (s, col, w) => `<g fill="none" stroke="${col}" stroke-width="${w}" opacity="1">` +
  s.replace(/fill="[^"]*"/g, 'fill="none"')
   .replace(/stroke="[^"]*"/g, `stroke="${col}"`)
   .replace(/stroke-width="[^"]*"/g, `stroke-width="${w}"`)
   .replace(/opacity="[^"]*"/g, 'opacity="1"') + '</g>';

const layer = (body) => Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${PX}" height="${PX}">
     <g transform="translate(${off} ${off}) scale(${k})" stroke-width="${0.45}">${body}</g>${grid()}</svg>`);

const left = await sharp(base).composite([{ input: layer('') }]).png().toBuffer();
const right = await sharp(base).composite([{ input: layer(
  solidG.map((s) => strip(s, '#ff1744', 0.45)).join('') +
  detailG.map((s) => strip(s, '#00e676', 0.35)).join('')) }]).png().toBuffer();

const out = process.argv[3] || `_sq5-over-${REF.replace(/\W+/g, '_')}.png`;
await sharp({ create: { width: PX * 2 + 8, height: PX, channels: 3, background: '#ffffff' } })
  .composite([{ input: left, left: 0, top: 0 }, { input: right, left: PX + 8, top: 0 }])
  .png().toFile(new URL('./' + out, import.meta.url).pathname);
console.log(`wrote ${out}   ref ${REF} disc R ${d.R}   red = our solid mass, green = our detail strokes`);
