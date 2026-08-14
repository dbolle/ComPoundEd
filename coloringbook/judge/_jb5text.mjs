// BUCK r0 — D5 lettering and D4 rhythm, v2.
//
// v1 (`_jb4read.mjs`) reported EVERY extent at its own window bound and said
// so (§4.1). That is the correct behaviour and the cause is the note's
// defining property: it is engraved edge to edge, so a 10%-ink-density
// criterion is satisfied everywhere. Same failure as `_blseal.mjs`'s radial
// sweep and `_rvcontain.mjs` — a density measure needs a background.
//
// v2 replaces the criterion, not the window. The legends are BOLD relief
// letters, far darker than the lathework, so the discriminating variable is
// DARKNESS, not coverage. Both are swept and the whole table is printed
// (§4.2): a reading is only taken where (a) it is not at a window bound, and
// (b) two independent photographs agree.
//
// SUBJECTS COVERED (PY3): id `buck`, REVERSE only. Obverse has no fiducial.
//
//   node coloringbook/judge/_jb5text.mjs [json]
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { rectify } from '../_blnorm.mjs';

const S = 20, X0 = 5, Y0 = 5, W = Math.round(90 * S), H = Math.round(46 * S);
const FILES = ['bill-rev.jpg', 'bill-rev-2.jpg'];
const WIN = {
  'legend-top':    { x: [18, 82], y: [5.0, 12.5] },
  'motto':         { x: [40, 62], y: [12.5, 19.5] },
  'ONE-centre':    { x: [30, 70], y: [19.0, 41.0] },
  'legend-bottom': { x: [18, 82], y: [41.0, 51.0] },
};
const DARK = [0.72, 0.60, 0.50, 0.42, 0.35];   // ink threshold as a fraction of field
const DENS = [0.02, 0.05, 0.10];               // row/col density to call it "the feature"

const sample = async (f) => {
  const R = await rectify(f, W, H);
  const px = (X, Y) => {
    const x = (X - X0) * S, y = (Y - Y0) * S;
    if (x < 0 || y < 0 || x >= W - 1 || y >= H - 1) return 255;
    const i = x | 0, j = y | 0, fx = x - i, fy = y - j;
    return R.out[j * W + i] * (1 - fx) * (1 - fy) + R.out[j * W + i + 1] * fx * (1 - fy) +
      R.out[(j + 1) * W + i] * (1 - fx) * fy + R.out[(j + 1) * W + i + 1] * fx * fy;
  };
  const all = [];
  for (let Y = 5; Y < 51; Y += 0.25) for (let X = 5; X < 95; X += 0.25) all.push(px(X, Y));
  all.sort((a, b) => a - b);
  return { px, field: all[(all.length * 0.9) | 0], R };
};

const S1 = await sample(FILES[0]), S2 = await sample(FILES[1]);
const G = { [FILES[0]]: S1, [FILES[1]]: S2 };
console.log(`field(p90): ${FILES[0]} ${Math.round(S1.field)}   ${FILES[1]} ${Math.round(S2.field)}`);

const extent = (s, w, dark, dens) => {
  const th = dark * s.field;
  const prof = (along, across, isRow) => {
    const o = [];
    for (let a = along[0]; a <= along[1] + 1e-9; a += 0.05) {
      let n = 0, k = 0;
      for (let b = across[0]; b <= across[1] + 1e-9; b += 0.05) { n++; if ((isRow ? s.px(b, a) : s.px(a, b)) < th) k++; }
      o.push([a, k / n]);
    }
    return o;
  };
  const cut = (p) => { const h = p.filter((q) => q[1] >= dens); return h.length ? [h[0][0], h[h.length - 1][0]] : null; };
  const ry = cut(prof(w.y, w.x, true)), rx = cut(prof(w.x, w.y, false));
  const bound = (e, lim) => e && (Math.abs(e[0] - lim[0]) < 0.06 || Math.abs(e[1] - lim[1]) < 0.06);
  return { y: ry, x: rx, onBound: bound(ry, w.y) || bound(rx, w.x) };
};

const chosen = {};
for (const [name, w] of Object.entries(WIN)) {
  console.log(`\n${name}  window X ${w.x.join('..')}  Y ${w.y.join('..')}   (bounds are the search limits — §4.1)`);
  console.log('  dark dens |            bill-rev.jpg             |            bill-rev-2.jpg           | agree?');
  const rows = [];
  for (const dark of DARK) for (const dens of DENS) {
    const a = extent(S1, w, dark, dens), b = extent(S2, w, dark, dens);
    const ok = a.y && b.y && a.x && b.x && !a.onBound && !b.onBound;
    const dy = ok ? Math.max(Math.abs(a.y[0] - b.y[0]), Math.abs(a.y[1] - b.y[1])) : NaN;
    const dx = ok ? Math.max(Math.abs(a.x[0] - b.x[0]), Math.abs(a.x[1] - b.x[1])) : NaN;
    rows.push({ dark, dens, a, b, ok, dy, dx });
    const fmt = (r) => r.x && r.y ? `X ${r.x[0].toFixed(2)}-${r.x[1].toFixed(2)} Y ${r.y[0].toFixed(2)}-${r.y[1].toFixed(2)}${r.onBound ? ' BOUND' : '      '}` : 'none                       ';
    console.log(`  ${dark.toFixed(2)} ${dens.toFixed(2)} | ${fmt(a)} | ${fmt(b)} | ${ok ? `dY ${dy.toFixed(2)} dX ${dx.toFixed(2)}` : '—'}`);
  }
  // choose the setting with the best two-reference agreement among the sound ones
  const sound = rows.filter((r) => r.ok).sort((p, q) => (p.dy + p.dx) - (q.dy + q.dx));
  if (!sound.length) { console.log('  -> NO SOUND SETTING: every one is at a bound. UNMEASURED by this instrument.'); continue; }
  const c = sound[0];
  chosen[name] = {
    dark: c.dark, dens: c.dens,
    x: [(c.a.x[0] + c.b.x[0]) / 2, (c.a.x[1] + c.b.x[1]) / 2],
    y: [(c.a.y[0] + c.b.y[0]) / 2, (c.a.y[1] + c.b.y[1]) / 2],
    spread: { dy: c.dy, dx: c.dx },
    nSound: sound.length,
    spanOfSound: {
      y0: [Math.min(...sound.map((r) => (r.a.y[0] + r.b.y[0]) / 2)), Math.max(...sound.map((r) => (r.a.y[0] + r.b.y[0]) / 2))],
      y1: [Math.min(...sound.map((r) => (r.a.y[1] + r.b.y[1]) / 2)), Math.max(...sound.map((r) => (r.a.y[1] + r.b.y[1]) / 2))],
    },
  };
  const q = chosen[name];
  console.log(`  -> chosen dark ${q.dark} dens ${q.dens}: X ${q.x[0].toFixed(2)}..${q.x[1].toFixed(2)} (${(q.x[1] - q.x[0]).toFixed(2)} wide)` +
    `  Y ${q.y[0].toFixed(2)}..${q.y[1].toFixed(2)} (${(q.y[1] - q.y[0]).toFixed(2)} tall)   two-ref spread dY ${q.dy ?? q.spread.dy}` +
    `   ${sound.length} of ${rows.length} settings sound; across them Ytop ${q.spanOfSound.y0.map((v) => v.toFixed(2)).join('..')} Ybot ${q.spanOfSound.y1.map((v) => v.toFixed(2)).join('..')}`);
}

// ── D5 against our art. Our legends, restated as literals from noteSVG.
// text y is the BASELINE; cap top for this font at size N is ~0.72*N above it.
console.log('\nD5 — ours vs the note (gate: each extreme within +-1.5 viewBox units; X extent within +-15%)');
const OURS = {
  'ONE-centre': { present: { icon: false, mid: true, full: true }, size: 9, baseline: 32, cx: 50,
    note: 'noteSVG reverse: <text x=50 y=32 font-size=9 letter-spacing=0.6>ONE</text>, suppressed at icon and when the value scaffold is on' },
  'legend-top': { present: { icon: false, mid: false, full: false }, note: 'not drawn on either side' },
  'legend-bottom': { present: { icon: false, mid: false, full: false }, note: 'not drawn on either side' },
  'motto': { present: { icon: false, mid: false, full: false }, note: 'not drawn on either side' },
};
for (const [name, q] of Object.entries(chosen)) {
  const o = OURS[name];
  const drawn = o.present && (o.present.full || o.present.mid);
  console.log(`  ${name.padEnd(14)} note  X ${q.x[0].toFixed(2)}..${q.x[1].toFixed(2)}  Y ${q.y[0].toFixed(2)}..${q.y[1].toFixed(2)}   PRESENCE ours=${drawn}`);
  if (!drawn) { console.log(`      -> ours draws nothing here (${o.note}). One-sided gate NOT EVALUATED (nickel r0 N5).`); continue; }
  const capTop = o.baseline - 0.72 * o.size, base = o.baseline;
  console.log(`      ours  Ytop ${capTop.toFixed(2)} (dY ${(capTop - q.y[0]).toFixed(2)})   Ybase ${base.toFixed(2)} (dY ${(base - q.y[1]).toFixed(2)})` +
    `   cap height ours ${(0.72 * o.size).toFixed(2)} vs note ${(q.y[1] - q.y[0]).toFixed(2)} = x${(0.72 * o.size / (q.y[1] - q.y[0])).toFixed(2)}`);
}

if (process.argv[2] === 'json')
  writeFileSync(new URL('./_jb5text.json', import.meta.url), JSON.stringify({ generated: 'coloringbook/judge/_jb5text.mjs', WIN, DARK, DENS, chosen }, null, 2) + '\n');

// ── overlay + ladder for the eye-read of the pyramid courses (R3)
const R = G[FILES[1]].R;
const buf = Buffer.alloc(W * H);
for (let i = 0; i < W * H; i++) buf[i] = Math.max(0, Math.min(255, Math.round(R.out[i])));
const X = (v) => (v - X0) * S, Y = (v) => (v - Y0) * S;
let g = '';
for (const [name, q] of Object.entries(chosen)) {
  const a = [X(q.x[0]), Y(q.y[0]), X(q.x[1]) - X(q.x[0]), Y(q.y[1]) - Y(q.y[0])];
  if (!a.every(Number.isFinite)) throw new Error(`${name}: non-finite overlay geometry`);
  g += `<rect x="${a[0]}" y="${a[1]}" width="${a[2]}" height="${a[3]}" fill="none" stroke="#ffe000" stroke-width="2"/>` +
    `<text x="${a[0] + 3}" y="${a[1] - 5}" fill="#ffe000" font-size="16" font-family="monospace">${name}</text>`;
}
await sharp(buf, { raw: { width: W, height: H, channels: 1 } }).toColourspace('srgb').png().toBuffer()
  .then((b) => sharp(b).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${g}</svg>`), top: 0, left: 0 }])
    .png().toFile('coloringbook/judge/_jb5-legends.png'));
console.log('\noverlay: coloringbook/judge/_jb5-legends.png');

// pyramid Y-ladder at 3x, every 0.5 viewBox units labelled every 1.0
{
  const x0 = X(15.5), y0 = Y(17), ww = Math.round(15 * S), hh = Math.round(22 * S), Z = 3;
  const crop = await sharp(buf, { raw: { width: W, height: H, channels: 1 } })
    .extract({ left: Math.round(x0), top: Math.round(y0), width: ww, height: hh })
    .resize(ww * Z, hh * Z, { kernel: 'nearest' }).toColourspace('srgb').png().toBuffer();
  let l = '';
  for (let v = 17; v <= 39.01; v += 0.5) {
    const yy = (Y(v) - y0) * Z;
    const major = Math.abs(v - Math.round(v)) < 1e-9;
    l += `<line x1="0" y1="${yy}" x2="${major ? 46 : 26}" y2="${yy}" stroke="#ff3000" stroke-width="${major ? 2 : 1}"/>`;
    if (major) l += `<text x="50" y="${yy + 5}" fill="#ff3000" font-size="15" font-family="monospace">${v.toFixed(0)}</text>`;
  }
  await sharp(crop).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${ww * Z}" height="${hh * Z}">${l}</svg>`), top: 0, left: 0 }])
    .png().toFile('coloringbook/judge/_jb5-pyramid-ladder.png');
  console.log('ladder:  coloringbook/judge/_jb5-pyramid-ladder.png  (X 15.5..30.5, Y 17..39, 3x, red ladder in viewBox units)');
}
