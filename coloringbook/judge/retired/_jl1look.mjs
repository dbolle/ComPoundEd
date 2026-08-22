// SPECIALIST INSTRUMENT — round 1, D5. §3 D12: LOOK AT IT, WITH A CONTROL.
//
// Renders every face BEFORE and AFTER at the size a child is actually shown —
// `coinRow(q.coins, 84)`, one coin alone — and at 190, upscaled 6x with
// NEAREST-NEIGHBOUR so what is on screen is exactly the device pixels the app
// draws and not a resampler's opinion of them.
//
// THE CONTROL IS RENDERED FIRST AND IS LABELLED (§3 D12, Appendix Q5): the
// QUARTER OBVERSE is byte-identical between the two revisions at all nine
// sizes, so anything that appears different there is the pipeline, not the
// edit. Verified rather than asserted — the run prints the SHA-256 of both
// revisions' quarter-obverse strings and refuses to write the sheet if they
// differ.
//
// Run: node coloringbook/judge/_jl1look.mjs [size]
//      BEFORE=/abs/coins.js   REQUIRED — the revision to compare against.
//
// ── WHY `BEFORE` IS REQUIRED AND HAS NO DEFAULT ────────────────────────────
// It used to default to `/home/USER/compounded/src/art/coins.js` — an
// absolute path into the SHARED checkout, which was the pre-change revision
// only for as long as nobody had applied the change there. The judge applied
// the round to that path and re-ran this: "before" and "after" were then the
// same file, the sheet showed the new legends in the BEFORE row, and the
// control assertion passed BY CONSTRUCTION because a file is byte-identical
// to itself.
//
// That is §6.1's fault in a new place. A locus may not be a function of the
// artefact under test, and neither may a CONTROL: this one was a function of
// whatever the shared tree happened to hold at run time. The failure is worse
// than a wrong number because it produces a picture, and D12 is the one check
// that is supposed not to be running on a prior (Q5).
//
// So: no default, and the control comparison is only meaningful when the two
// revisions genuinely differ. If they are byte-identical AT EVERY FACE the
// run throws, because that is the signature of comparing a file with itself.
import { statSync } from 'node:fs';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCoins } from './_jq8contain-v2.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const SIZE = Number(process.argv[2] || 84);
const ZOOM = Number(process.env.ZOOM || 6);

if (!process.env.BEFORE) {
  throw new Error(
    'BEFORE=/abs/path/to/the/pre-change/coins.js is REQUIRED. There is no default: ' +
      'a default pointing into the shared checkout silently compares the new art with itself ' +
      'once the round has been applied there. See the note at the head of this file.'
  );
}
statSync(process.env.BEFORE); // fail loudly on a typo rather than fall back to anything
const beforeSrc = readFileSync(process.env.BEFORE, 'utf8');
const afterSrc = readFileSync(join(ROOT, 'src/art/coins.js'), 'utf8');
if (beforeSrc === afterSrc) {
  throw new Error(
    `BEFORE (${process.env.BEFORE}) is byte-identical to src/art/coins.js. ` +
      'That is comparing a revision with itself: every "control" passes and the sheet is not evidence.'
  );
}
const A = await loadCoins(beforeSrc);
const B = await loadCoins(afterSrc);

const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);
const ctlA = A.coinSVG('quarter', SIZE, { side: 'obverse' }), ctlB = B.coinSVG('quarter', SIZE, { side: 'obverse' });
console.log(`CONTROL quarter obverse @${SIZE}: before ${sha(ctlA)}  after ${sha(ctlB)}  ${ctlA === ctlB ? 'BYTE-IDENTICAL' : '*** DIFFERS — not a control ***'}`);
if (ctlA !== ctlB) throw new Error('the control is not a control');

async function tile(mod, id, side) {
  const svg = mod.coinSVG(id, SIZE, { side });
  const w = Math.round(Number(svg.match(/width="([\d.]+)"/)[1]));
  return sharp(await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).resize(w, w, { fit: 'fill' }).png().toBuffer())
    .resize(w * ZOOM, w * ZOOM, { kernel: 'nearest' }).png().toBuffer();
}

const ids = ['penny', 'nickel', 'dime', 'quarter'];
const cell = Math.round(84 * ZOOM * 1.05);
const rows = 4, cols = ids.length;
const layers = [];
for (let c = 0; c < cols; c++) {
  for (let r = 0; r < rows; r++) {
    const mod = r % 2 === 0 ? A : B;
    const side = r < 2 ? 'obverse' : 'reverse';
    layers.push({ input: await tile(mod, ids[c], side), left: c * cell + 8, top: r * cell + 24 });
  }
}
const W = cols * cell + 16, H = rows * cell + 40;
let ov = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`;
ids.forEach((id, c) => { ov += `<text x="${c * cell + 10}" y="16" font-family="monospace" font-size="16" fill="#000">${id}</text>`; });
['obv BEFORE', 'obv AFTER', 'rev BEFORE', 'rev AFTER'].forEach((t, r) => {
  ov += `<text x="4" y="${r * cell + 20}" font-family="monospace" font-size="15" fill="${t.includes('AFTER') ? '#a00' : '#00a'}">${t}${ids[3] && r < 2 ? '   (quarter column = the CONTROL: byte-identical)' : ''}</text>`;
});
ov += '</svg>';
const out = `_jl1look-${SIZE}.png`;
await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } })
  .composite([...layers, { input: Buffer.from(ov) }]).png().toFile(join(HERE, out));
console.log('wrote ' + out + `  (nearest-neighbour x${ZOOM}; each coin at its OWN box for size ${SIZE})`);
