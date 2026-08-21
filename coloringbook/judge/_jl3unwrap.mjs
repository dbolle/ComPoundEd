// SPECIALIST INSTRUMENT — round 3, D5 lettering. §4.3 OVERLAY, polar form.
//
// Why another unwrap: `_jd3unwrap.mjs` (dime r0) is the picture that has worked
// where five band finders failed, but it is pinned to the dime — RA 0.60, RB
// 1.06 of R, and `_jd1discs.json` only. Round 3's two new legends live at
// r 26..32 on the CENT (E PLURIBUS UNUM, above the memorial) and r 25..31 on
// the NICKEL (FIVE CENTS, under Monticello), i.e. INSIDE the dime instrument's
// inner bound. Rather than edit a hashed instrument (§1.1 forbids it), this is
// the same construction with the radius window and the disc table as arguments.
//
// x = angle 0..360 deg, angle = atan2(dy, dx) with dy DOWNWARD, so 0 = 3
//   o'clock, 90 = 6 o'clock, 180 = 9 o'clock, 270 = 12 o'clock — `arcText`'s
//   own convention, so an angle read here is the number that goes in `centre`.
// y = radius in viewBox units, RHI at the top, RLO at the bottom.
// Rows are exact bilinear samples of the source through the FROZEN disc fit.
// Out-of-frame is marked invalid, never 0 — `_jd3unwrap.mjs`'s note explains
// why (a 255-level step at the frame edge captured an edge finder once).
//
// §4.1 NULL: this instrument searches for nothing, it resamples. There are no
//   bounds to return and no candidate set to print. Its one failure mode is a
//   bad disc fit, which shows as the coin rim not sitting on the r=47 line —
//   so r=47 is drawn in red whenever it is inside the window.
// §4 RESPONSE: RESPONSE=1 re-renders with the disc centre moved 5% of R and
//   the two pictures must differ visibly (the legend shears into a sine).
//
// Run: node coloringbook/judge/_jl3unwrap.mjs <ref-file> <rLo> <rHi> [suffix]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const REF = (f) => new URL('../ref/' + f, import.meta.url).pathname;

export const DISCS = Object.assign(
  {},
  ...['_jn1discs.json', '_jd1discs.json', '_jp1discs.json', '_jq4discs.json'].map((f) =>
    JSON.parse(readFileSync(HERE(f), 'utf8')))
);
// DISC=cx,cy,R supplies a registration for a reference that is not in the four
// frozen tables. It exists for exactly one file: `quarter-obv-2.jpg`, which
// round 4 never fitted (it fitted reverses) and which `_jq5letter-v2.mjs` and
// `_jq12look.mjs` both carry inline as { 374.41, 374.36, 373.67 }. Passing that
// same triple in is quoting the live D5 instrument's own registration, not
// inventing one — and it is printed on every run so the quotation is visible.
// It is NOT a licence to guess: a file with no fit anywhere still throws.
export function discOf(file) {
  if (process.env.DISC) {
    const [cx, cy, R] = process.env.DISC.split(',').map(Number);
    if (![cx, cy, R].every(Number.isFinite)) throw new Error('DISC must be cx,cy,R');
    return { cx, cy, R, via: 'DISC env — quoted from another instrument, see the run log' };
  }
  const d = DISCS[file];
  if (!d) throw new Error(`no frozen disc fit for ${file} — refuse to guess one`);
  return d;
}

// Returns a greyscale sampler in VIEWBOX polar coordinates for one reference.
export async function sampler(file, dx = 0, dy = 0) {
  const d = discOf(file);
  const cx = d.cx + dx, cy = d.cy + dy, R = d.R;
  const { data, info } = await sharp(REF(file)).flatten({ background: '#808080' })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  const IW = info.width, IH = info.height;
  const at = (x, y) => {
    if (x < 0 || y < 0 || x >= IW - 1 || y >= IH - 1) return NaN;
    const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0;
    return data[y0 * IW + x0] * (1 - fx) * (1 - fy) + data[y0 * IW + x0 + 1] * fx * (1 - fy)
      + data[(y0 + 1) * IW + x0] * (1 - fx) * fy + data[(y0 + 1) * IW + x0 + 1] * fx * fy;
  };
  // viewBox unit -> photo px is R/47: the blank is r=47 in the authoring frame.
  const k = R / 47;
  return {
    file, cx, cy, R, k, IW, IH,
    // r in viewBox units, deg in arcText degrees
    polar: (r, deg) => {
      const th = (deg * Math.PI) / 180;
      return at(cx + r * k * Math.cos(th), cy + r * k * Math.sin(th));
    },
  };
}

export async function unwrap(file, rLo, rHi, W = 2160, H = 720, dx = 0, dy = 0) {
  const s = await sampler(file, dx, dy);
  const buf = Buffer.alloc(W * H);
  const ok = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) {
    const r = rHi - ((rHi - rLo) * j) / (H - 1);
    for (let i = 0; i < W; i++) {
      const deg = (360 * i) / W;
      const v = s.polar(r, deg);
      if (Number.isNaN(v)) { buf[j * W + i] = 0; ok[j * W + i] = 0; }
      else { buf[j * W + i] = Math.max(0, Math.min(255, Math.round(v))); ok[j * W + i] = 1; }
    }
  }
  return { buf, ok, W, H, rLo, rHi, s };
}

// Draws the labelled ladder over an unwrap and writes it.
export async function write(u, out, aLo = 0, aHi = 360) {
  const { W, H, rLo, rHi } = u;
  const yOf = (r) => ((rHi - r) / (rHi - rLo)) * (H - 1);
  const xOf = (a) => (a / 360) * W;
  let g = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`;
  const step = rHi - rLo <= 10 ? 0.5 : 1;
  for (let r = Math.ceil(rLo / step) * step; r <= rHi + 1e-9; r += step) {
    const red = Math.abs(r - 47) < 1e-9;
    const major = Math.abs(r / 5 - Math.round(r / 5)) < 1e-9;
    g += `<line x1="0" y1="${yOf(r)}" x2="${W}" y2="${yOf(r)}" stroke="${red ? '#f00' : major ? '#ff0' : '#0f0'}"`
      + ` stroke-width="${red ? 2.4 : major ? 1.5 : 0.7}" opacity="${major || red ? 0.95 : 0.5}"/>`;
    g += `<text x="4" y="${yOf(r) - 3}" font-family="monospace" font-size="15" fill="${red ? '#f00' : major ? '#ff0' : '#0f0'}">${r.toFixed(1)}</text>`;
  }
  for (let a = 0; a <= 360; a += 2) {
    const major = a % 10 === 0;
    g += `<line x1="${xOf(a)}" y1="0" x2="${xOf(a)}" y2="${H}" stroke="#00d0ff" stroke-width="${major ? 1.4 : 0.6}" opacity="${major ? 0.8 : 0.35}"/>`;
    if (major) g += `<text x="${xOf(a) + 3}" y="16" font-family="monospace" font-size="14" fill="#00d0ff">${a}</text>`;
  }
  g += '</svg>';
  let img = sharp(u.buf, { raw: { width: W, height: H, channels: 1 } }).png();
  img = sharp(await img.toBuffer()).composite([{ input: Buffer.from(g) }]);
  if (aLo > 0 || aHi < 360) {
    img = sharp(await img.png().toBuffer()).extract({
      left: Math.round(xOf(aLo)), top: 0,
      width: Math.round(xOf(aHi) - xOf(aLo)), height: H,
    });
  }
  await img.png().toFile(HERE(out));
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [file, rLo, rHi, suffix] = process.argv.slice(2);
  const d = discOf(file);
  const sfx = suffix || file.replace(/[^a-z0-9]+/gi, '-');
  console.log(`${file}  disc cx ${d.cx} cy ${d.cy} R ${d.R}  window r ${rLo}..${rHi}`);
  console.log('§4.1 null: no search, no bounds, no candidate set — this resamples. Check the disc, not the answer.');
  const aLo = Number(process.env.ALO ?? 0), aHi = Number(process.env.AHI ?? 360);
  const u = await unwrap(file, Number(rLo), Number(rHi));
  console.log('wrote ' + (await write(u, `_jl3unwrap-${sfx}.png`, aLo, aHi)));
  if (process.env.RESPONSE) {
    const v = await unwrap(file, Number(rLo), Number(rHi), 2160, 720, 0.05 * d.R, 0);
    console.log('wrote ' + (await write(v, `_jl3unwrap-${sfx}-RESPONSE.png`, aLo, aHi)));
    let diff = 0;
    for (let i = 0; i < u.buf.length; i++) diff += Math.abs(u.buf[i] - v.buf[i]);
    console.log(`  RESPONSE: centre moved 5% of R. mean |Δgrey| = ${(diff / u.buf.length).toFixed(2)} (0 would mean the instrument ignores the disc)`);
  }
}
