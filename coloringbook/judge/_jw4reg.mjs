// R4 dime jaw — REGISTRATION, and it is checked by drawing before it is used.
//
// Every number in this round is taken off a photograph at a place named in the
// head's LOCAL frame (the frame `OBVERSE.dime`'s `Roosevelt:` paths are written
// in). So the first thing that has to be right is the map between the two, and
// §4.3 says a located feature is drawn on the source and looked at.
//
// The chain, all of it forced by artefacts already frozen:
//   photo px -> disc-normalised   u = (px-cx)/R,  v = (py-cy)/R    (_headmask.json)
//   disc-normalised -> viewBox    X = 50 + 47u,   Y = 50 + 47v     (art disc R=47)
//   viewBox -> head local         x = (50+CX - X)/s,  y = (Y - CY)/s
//                                 with translate(50+CX, CY) scale(-s, s) read
//                                 off the emitted bust transform, not assumed.
//
// The check is the HEAD contour itself: it was fitted to _headmask.json, so if
// the chain is right it must land on the portrait's silhouette in the
// photograph. Drawn in green. The jaw stroke under test is drawn in magenta.
//
// Response test: SHIFT=8 offsets the disc centre by 8 px and re-draws; the
// contour must visibly leave the silhouette (and the printed residual rises).
// Null test: the printed mean |distance from HEAD contour to the mask boundary|
// is bounded below by 0 and above by R; a value at either bound is a failure,
// not an answer.
//
// Run: node coloringbook/judge/_jw4reg.mjs [ref]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const REFDIR = new URL('../ref/', import.meta.url).pathname;
const DISCS = JSON.parse(readFileSync(new URL('./_jd1discs.json', import.meta.url)));
const MASK = JSON.parse(readFileSync(new URL('../_headmask.json', import.meta.url)));

export const ART_R = 47;
export async function busted(id = 'dime') {
  const mod = await import('../../src/art/coins.js');
  const svg = mod.coinSVG(id, 380, { side: 'obverse' });
  const g = svg.match(/transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\)">/);
  const [TX, TY, SX, SY] = g.slice(1).map(Number);
  return { TX, TY, SX, SY, svg, headD: svg.slice(g.index + g[0].length).match(/<path d="([^"]+)"/)[1] };
}

// disc for a reference: dime-obv-2 uses the FROZEN mask disc (that is the disc
// the mask's u,v are in); every other file uses its own _jd1discs.json fit.
export function discFor(ref) {
  if (ref === 'dime-obv-2.jpg') return { cx: MASK.disc.cx, cy: MASK.disc.cy, R: MASK.disc.R };
  const d = DISCS[ref];
  if (!d) throw new Error(`no frozen disc for ${ref}`);
  return { cx: d.cx, cy: d.cy, R: d.R };
}

export function makeMap({ TX, TY, SX, SY }, disc, dx = 0, dy = 0) {
  const cx = disc.cx + dx, cy = disc.cy + dy, R = disc.R;
  return {
    // head local -> photo pixel
    toPx: (x, y) => {
      const X = TX + SX * x, Y = TY + SY * y;
      return { px: cx + ((X - 50) / ART_R) * R, py: cy + ((Y - 50) / ART_R) * R };
    },
    // photo pixel -> head local
    toLocal: (px, py) => {
      const X = 50 + ((px - cx) / R) * ART_R, Y = 50 + ((py - cy) / R) * ART_R;
      return { x: (X - TX) / SX, y: (Y - TY) / SY };
    },
    pxPerUnit: (R / ART_R) * Math.abs(SX),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const ref = process.argv[2] || 'dime-obv-2.jpg';
  const SHIFT = Number(process.env.SHIFT || 0);
  const B = await busted();
  const disc = discFor(ref);
  const M = makeMap(B, disc, SHIFT, SHIFT);
  console.log(`${ref}  disc cx=${disc.cx} cy=${disc.cy} R=${disc.R}  shift=${SHIFT}`);
  console.log(`bust transform translate(${B.TX} ${B.TY}) scale(${B.SX} ${B.SY})`);
  console.log(`scale: ${M.pxPerUnit.toFixed(3)} photo px per head-local unit`);

  // --- the null/response quantity: HEAD contour vs the frozen mask boundary
  const mpts = MASK.points || MASK.contour || MASK.polygon;
  if (!mpts) console.log('mask point array not found; keys = ' + Object.keys(MASK).join(','));
  const { marks } = await import('./_jqgeom.mjs');
  const head = marks(`<svg><path d="${B.headD}"/></svg>`)[0];
  const HP = head.pts.map((p) => M.toPx(p.x, p.y));
  if (mpts) {
    const MP = mpts.map(([u, v]) => ({ px: disc.cx + u * disc.R, py: disc.cy + v * disc.R }));
    let s = 0;
    for (const p of HP) {
      let best = Infinity;
      for (const q of MP) { const d = Math.hypot(p.px - q.px, p.py - q.py); if (d < best) best = d; }
      s += best;
    }
    const mean = s / HP.length;
    console.log(`mean |HEAD contour -> mask boundary| = ${mean.toFixed(2)} px `
      + `(= ${(mean / M.pxPerUnit).toFixed(3)} local units).  BOUNDS: 0 .. R=${disc.R}`);
  }

  // --- the overlay
  const src = REFDIR + ref;
  const md = await sharp(src).metadata();
  const poly = (pts, col, w) => `<polyline points="${pts.map((p) => `${p.px.toFixed(1)},${p.py.toFixed(1)}`).join(' ')}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
  let g = poly(HP, '#00ff66', Math.max(1, disc.R / 200));
  // the jaw stroke under test, straight out of the live source
  const jawD = B.svg.match(/<path d="(M 19\.4 21\.4[^"]*)"/);
  if (jawD) {
    const jm = marks(`<svg><path d="${jawD[1]}"/></svg>`)[0];
    g += poly(jm.pts.map((p) => M.toPx(p.x, p.y)), '#ff00cc', Math.max(1.5, disc.R / 140));
  } else g += '';
  g += `<circle cx="${disc.cx}" cy="${disc.cy}" r="${disc.R}" fill="none" stroke="#ffcc00" stroke-width="${Math.max(1, disc.R / 250)}"/>`;
  const ov = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${md.width}" height="${md.height}">${g}</svg>`)).png().toBuffer();
  const out = new URL(`./_jw4reg-${ref.replace(/\./g, '-')}${SHIFT ? '-shift' + SHIFT : ''}.png`, import.meta.url).pathname;
  await sharp(src).composite([{ input: ov, left: 0, top: 0 }]).png().toFile(out);
  console.log('overlay -> ' + out);
  console.log('green = the emitted HEAD contour, magenta = the jaw stroke under test, yellow = the fitted disc');
}
