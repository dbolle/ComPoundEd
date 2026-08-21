// SPECIALIST INSTRUMENT — round 1, D5 lettering. §4.3 OVERLAY.
//
// Draws a reference photograph INTO THE COORDINATE SYSTEM THE ART IS AUTHORED
// IN — the 100-unit viewBox, coin blank r = 47, centre (50,50) — with a
// cartesian grid every 5 units and radius rings every 2 units, so a legend's
// baseline, cap top, centre angle and angular extent can be read straight off
// the picture and written down as a literal.
//
// This is the method COIN-JUDGE.md §2.1 calls "a hand annotation is a
// legitimate frozen target", and §4.3's obligation: draw the feature's
// candidate location on the source at full resolution and LOOK. It is used
// here for the five legends that have no frozen target at all —
// MONTICELLO, E PLURIBUS UNUM on the dime and on the quarter, and the spans of
// the nickel's two obverse legends.
//
// The disc fits are the judge's own, read unedited from `_jn1discs.json`,
// `_jd1discs.json`, `_jp1discs.json` and `_jq4discs.json`. Nothing here is
// computed from our drawing (§6.1): the mapping is photograph → viewBox via
// the frozen disc fit, full stop.
//
// §4.1 NULL: this instrument searches for nothing. It resamples. There are no
//   bounds to return. Its failure mode is a bad disc fit, which is visible in
//   the picture as a rim that does not sit on the r=47 ring — so the r=47 ring
//   is drawn in red on every output and is the thing to check first.
// §4 RESPONSE: RESPONSE=1 shifts the disc centre by 5 photograph pixels and
//   confirms the rim visibly leaves the r=47 ring.
//
// Run: node coloringbook/judge/_jl1grid.mjs <ref-file> [outSuffix]
//      e.g. node coloringbook/judge/_jl1grid.mjs nickel-rev-2.png
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const REF = (f) => new URL('../ref/' + f, import.meta.url).pathname;

const DISCS = Object.assign(
  {},
  ...['_jn1discs.json', '_jd1discs.json', '_jp1discs.json', '_jq4discs.json'].map((f) =>
    JSON.parse(readFileSync(HERE(f), 'utf8')))
);

export function discOf(file) {
  const d = DISCS[file];
  if (!d) throw new Error(`no frozen disc fit for ${file} — refuse to guess one`);
  return d;
}

// S = output side in px; the whole 100-unit viewBox maps to S.
export async function grid(file, out, S = 1400, dx = 0, dy = 0) {
  const d = discOf(file);
  const { cx, cy, R } = { cx: d.cx + dx, cy: d.cy + dy, R: d.R };
  // viewBox (X,Y) -> photo px:  photo = c + (V - 50)/47 * R
  const k = R / 47;                       // photo px per viewBox unit
  const left = cx - 50 * k, top = cy - 50 * k;
  // Pad generously on all sides first so the extract window is always inside
  // the image, whatever the fit did (some references crop the coin).
  const PAD = Math.ceil(100 * k);
  const padded = await sharp(REF(file)).flatten({ background: '#808080' })
    .extend({ left: PAD, top: PAD, right: PAD, bottom: PAD, background: '#808080' }).png().toBuffer();
  const buf = await sharp(padded).extract({
    left: Math.round(left) + PAD, top: Math.round(top) + PAD,
    width: Math.round(100 * k), height: Math.round(100 * k),
  }).resize(S, S, { fit: 'fill' }).png().toBuffer();

  const u = S / 100;                       // output px per viewBox unit
  let ov = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">`;
  for (let v = 0; v <= 100; v += 5) {
    const t = v % 10 === 0 ? 1.6 : 0.8;
    ov += `<line x1="${v * u}" y1="0" x2="${v * u}" y2="${S}" stroke="#00d0ff" stroke-width="${t}" opacity="0.55"/>`;
    ov += `<line x1="0" y1="${v * u}" x2="${S}" y2="${v * u}" stroke="#00d0ff" stroke-width="${t}" opacity="0.55"/>`;
    if (v % 10 === 0) {
      ov += `<text x="${v * u + 3}" y="14" font-family="monospace" font-size="13" fill="#ff0">${v}</text>`;
      ov += `<text x="3" y="${v * u - 3}" font-family="monospace" font-size="13" fill="#ff0">${v}</text>`;
    }
  }
  for (let r = 26; r <= 47; r += 2) {
    const red = r === 47;
    ov += `<circle cx="${50 * u}" cy="${50 * u}" r="${r * u}" fill="none" stroke="${red ? '#f00' : '#0f0'}" stroke-width="${red ? 2.4 : 1.1}" opacity="${red ? 0.95 : 0.6}"/>`;
    ov += `<text x="${(50 + r) * u + 2}" y="${50 * u - 2}" font-family="monospace" font-size="13" fill="${red ? '#f00' : '#0f0'}">${r}</text>`;
  }
  for (let a = 0; a < 360; a += 15) {
    const th = (a * Math.PI) / 180;
    ov += `<line x1="${(50 + 26 * Math.cos(th)) * u}" y1="${(50 + 26 * Math.sin(th)) * u}"`
      + ` x2="${(50 + 47 * Math.cos(th)) * u}" y2="${(50 + 47 * Math.sin(th)) * u}" stroke="#f0f" stroke-width="${a % 90 === 0 ? 2 : 0.9}" opacity="0.5"/>`;
    ov += `<text x="${(50 + 48.5 * Math.cos(th)) * u - 9}" y="${(50 + 48.5 * Math.sin(th)) * u + 4}" font-family="monospace" font-size="12" fill="#f0f">${a}</text>`;
  }
  ov += '</svg>';
  let img = sharp(buf).composite([{ input: Buffer.from(ov) }]);
  // CROP=x0,y0,x1,y1 in viewBox units — a zoom on one legend, same grid, so a
  // radius or an angle read on the zoom is the same number as on the whole coin.
  if (process.env.CROP) {
    const [a, b, c, e] = process.env.CROP.split(',').map(Number);
    img = sharp(await img.png().toBuffer()).extract({
      left: Math.round(a * u), top: Math.round(b * u),
      width: Math.round((c - a) * u), height: Math.round((e - b) * u),
    }).resize({ width: 1400, fit: 'inside' });
  }
  await img.png().toFile(HERE(out));
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  const suffix = process.argv[3] || file.replace(/[^a-z0-9]+/gi, '-');
  const d = discOf(file);
  console.log(`${file}  disc fit cx ${d.cx} cy ${d.cy} R ${d.R}  (residual ${d.p95resid_pctR ?? d.p95pctR ?? d.p95pc ?? '?'}% of R)`);
  console.log('§4.1 null: no search, no bounds. The check on this instrument is the RED r=47 ring sitting on the coin edge.');
  console.log('wrote ' + (await grid(file, `_jl1grid-${suffix}.png`, Number(process.env.S || 1400))));
  if (process.env.RESPONSE) {
    console.log('wrote ' + (await grid(file, `_jl1grid-${suffix}-RESPONSE.png`, Number(process.env.S || 1400), 0.05 * d.R, 0)));
    console.log('  RESPONSE: the disc centre was moved 5% of R to the right. Compare the two: the rim must visibly leave the red ring.');
  }
}
