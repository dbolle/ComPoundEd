// THE BYTE-IDENTITY RENDER PARTITION (§0.2). Every face of every denomination,
// at every size this round looked at plus the naming and teaching sizes,
// hashed from the emitted SVG string, a CONTROL tree against the working tree.
// Exactly one face may differ.
//
// The control is a checkout, not a copy of one file — coins.js imports
// src/engine/money.js, so a single-file copy will not load:
//
//   mkdir -p /tmp/ctl && git archive <commit> src | tar -x -C /tmp/ctl
//   node coloringbook/judge/_nk17part.mjs /tmp/ctl/src/art/coins.js
//
// It writes nothing.
import crypto from 'crypto';
const CONTROL = process.argv[2];
if (!CONTROL) { console.log('usage: _nk17part.mjs <path to the control coins.js>  (see the header)'); process.exit(1); }
const SIZES = [26, 38, 40, 48, 54, 62, 84, 120, 190, 380];
const IDS = ['penny', 'nickel', 'dime', 'quarter', 'buck'];
const ctl = await import(CONTROL.startsWith('/') ? CONTROL : '../../' + CONTROL);
const cand = await import('../../src/art/coins.js');
const h = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 12);
let same = 0; const diff = [];
for (const id of IDS) for (const side of ['obverse', 'reverse']) for (const px of SIZES) {
  if (h(ctl.coinSVG(id, px, { side })) === h(cand.coinSVG(id, px, { side }))) same++;
  else diff.push(`${id}.${side} @${px}`);
}
console.log(`control ${CONTROL}`);
console.log(`identical cells: ${same} / ${same + diff.length}`);
const faces = [...new Set(diff.map((d) => d.split(' ')[0]))];
console.log(`faces that moved (${faces.length}):`);
for (const f of faces) console.log(`  ${f}  at ${diff.filter((d) => d.startsWith(f + ' ')).map((d) => d.split('@')[1]).join(', ')}`);
let same2 = 0; const diff2 = [];
for (const id of IDS) for (const side of ['obverse', 'reverse']) {
  if (h(ctl.coinSVG(id, 84, { side, value: true })) === h(cand.coinSVG(id, 84, { side, value: true }))) same2++;
  else diff2.push(`${id}.${side}`);
}
console.log(`value-scaffold variant at 84px: ${same2} identical, moved: ${diff2.join(', ') || 'none'}`);
