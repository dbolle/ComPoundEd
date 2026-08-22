// SPECIALIST INSTRUMENT — round 3, D5 lettering. §4.3 OVERLAY, the deliverable.
//
// COIN-JUDGE.md §4.3: "whenever an instrument identifies a FEATURE rather than
// computing a quantity, it must also emit WHAT IT FOUND — the coordinates, the
// extent, enough to draw it — and the judge overlays that on the source and
// looks." The wrong-feature failure has happened five times in this loop and
// every single one was caught by exactly this picture, so `_jl3ink.mjs` does
// not get to publish a number without one.
//
// Draws, on the reference, in the 100-unit authoring viewBox:
//   white dashed  the analysis window (`_jl3ink.mjs`'s rect)
//   cyan dashed   the letter-free rect the threshold's sigma came from
//   yellow        the per-column ink envelope, top and bottom — THE measurement
//   magenta       every run the glyph splitter found, boxed, ACCEPTED or NOT
//   green         model curves the caller asks for: `arc:r` a circle of radius
//                 r, `line:y` a horizontal cartesian line. This is how the
//                 "is this legend a concentric arc or a straight line?" question
//                 gets answered by looking rather than by assertion.
//
// Run: node coloringbook/judge/_jl3over.mjs <ref> <x0,y0,x1,y1> <free> <out> [models...]
import sharp from 'sharp';
import { inkSampler, grab, sigmaOf, envelope, floored } from './_jl3ink.mjs';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const REF = (f) => new URL('../ref/' + f, import.meta.url).pathname;

export async function overlay(file, rect, free, out, models = [], opts = {}) {
  const s = await inkSampler(file);
  const sgRaw = sigmaOf(grab(s, free));
  const sg = { ...sgRaw, ...floored(sgRaw.sigma) };
  const e = envelope(s, rect, sg.sigma, opts);
  const S = opts.S ?? 2400;
  const u = S / 100;                       // output px per viewBox unit
  const k = s.k;
  const PAD = Math.ceil(100 * k);
  const padded = await sharp(REF(file)).flatten({ background: '#808080' })
    .extend({ left: PAD, top: PAD, right: PAD, bottom: PAD, background: '#808080' }).png().toBuffer();
  const base = await sharp(padded).extract({
    left: Math.round(s.cx - 50 * k) + PAD, top: Math.round(s.cy - 50 * k) + PAD,
    width: Math.round(100 * k), height: Math.round(100 * k),
  }).resize(S, S, { fit: 'fill' }).png().toBuffer();

  let g = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">`;
  const box = (r, col, w, dash) => `<rect x="${r[0] * u}" y="${r[1] * u}" width="${(r[2] - r[0]) * u}" height="${(r[3] - r[1]) * u}"`
    + ` fill="none" stroke="${col}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
  g += box(rect, '#fff', 2.2, '10 6');
  g += box(free, '#0ff', 2.2, '6 5');
  for (const r of [opts.rMin, opts.rMax]) if (r && r < 100)
    g += `<circle cx="${50 * u}" cy="${50 * u}" r="${r * u}" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="10 6" opacity="0.85"/>`;
  for (const m of models) {
    const [kind, val] = m.split(':');
    if (kind === 'arc') g += `<circle cx="${50 * u}" cy="${50 * u}" r="${Number(val) * u}" fill="none" stroke="#0f0" stroke-width="1.8" opacity="0.9"/>`;
    if (kind === 'line') g += `<line x1="0" y1="${Number(val) * u}" x2="${S}" y2="${Number(val) * u}" stroke="#0f0" stroke-width="1.8" opacity="0.9"/>`;
  }
  // The envelope is drawn as polylines that BREAK at every letter gap, so a gap
  // stays visible as a gap instead of being bridged by a straight segment that
  // no ink supports.
  const poly = (pick) => {
    let d = '', open = false;
    for (const c of e.cols) {
      if (Number.isNaN(c.top)) { open = false; continue; }
      d += `${open ? 'L' : 'M'}${(c.x * u).toFixed(1)} ${(pick(c) * u).toFixed(1)} `;
      open = true;
    }
    return d;
  };
  g += `<path d="${poly((c) => c.top)}" fill="none" stroke="#ff0" stroke-width="2"/>`;
  g += `<path d="${poly((c) => c.bot)}" fill="none" stroke="#ff0" stroke-width="2"/>`;
  for (const r of e.runs) g += box([r.i0, r.top, r.i1, r.bot], '#f0f', 1.6);
  g += '</svg>';
  let img = sharp(base).composite([{ input: Buffer.from(g) }]);
  if (opts.crop) {
    const [a, b, c, d] = opts.crop;
    img = sharp(await img.png().toBuffer()).extract({
      left: Math.round(a * u), top: Math.round(b * u),
      width: Math.round((c - a) * u), height: Math.round((d - b) * u),
    }).resize({ width: 1500, fit: 'inside' });
  }
  await img.png().toFile(HERE(out));
  return { out, e, sg };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [file, rectS, freeS, out, ...models] = process.argv.slice(2);
  const rect = rectS.split(',').map(Number), free = freeS.split(',').map(Number);
  const opts = {};
  if (process.env.CROP) opts.crop = process.env.CROP.split(',').map(Number);
  if (process.env.K) opts.k = Number(process.env.K);
  if (process.env.RMIN) opts.rMin = Number(process.env.RMIN);
  if (process.env.SEEDY) opts.seedY = Number(process.env.SEEDY);
  if (process.env.SEEDR) opts.seedR = Number(process.env.SEEDR);
  if (process.env.OPEN) opts.open = Number(process.env.OPEN);
  if (process.env.CLOSEY) opts.closeY = Number(process.env.CLOSEY);
  if (process.env.SEEDTOL) opts.seedTol = Number(process.env.SEEDTOL);
  if (process.env.RMAX) opts.rMax = Number(process.env.RMAX);
  if (process.env.S) opts.S = Number(process.env.S);
  const { e, sg } = await overlay(file, rect, free, out, models.filter((m) => m.includes(':')), opts);
  console.log(`${file}  window ${rect.join(',')}  sigma-rect ${free.join(',')} sigma ${sg.sigma.toFixed(3)}  T ${e.T.toFixed(2)}`);
  console.log(`envelope y ${e.yTop.toFixed(3)}..${e.yBot.toFixed(3)}  ink ${e.inkFrac.toFixed(4)}  runs ${e.runs.length}`
    + `  ${e.clip.length ? `*** CLIPPED ${e.clip.join('+')} ***` : 'clear of window edges'}`);
  console.log('wrote ' + out);
}
