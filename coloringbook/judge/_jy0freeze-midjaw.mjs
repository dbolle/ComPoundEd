// FREEZE the cent obverse's MID-JAW tone patch — the one the frozen set is
// missing. Refuses to overwrite, exactly as `_pyfreezetone.mjs` does.
//
// WHY A SEPARATE FILE. `_tonepatches-penny.json` is a frozen target and is
// hashed for this round (COIN-JUDGE §1). A specialist that edits a hashed
// artefact voids the round, so this patch is written to its own file and the
// judge folds it in and re-hashes. `_tonepatches-penny.json` is not touched.
//
// WHY THIS LOCUS, AND WHY IT CANNOT HAVE BEEN FITTED TO THE CHANGE (§6.1).
// `src/art/coins.js` already records that the frozen set "has none between
// `cheek` (8.5, -1.5) and `beardJaw` (-4, 17.5), which is exactly the region in
// dispute". The patch is therefore placed at **the exact midpoint of those two
// frozen centres** — local (2.25, 8.0) — with the same radius they carry, 2.6.
// That is a literal computed from the TARGET's own frozen loci and from nothing
// else: `src/art/coins.js` is never imported here, and the number would be the
// same whatever our drawing does. It is written and hashed BEFORE anything that
// scores it is written or run, and its first value is published as a BASELINE
// on unmodified art.
//
// WHAT IT IS ANATOMICALLY. On `ref/penny-obv-2.jpg` (the 2002-S cameo proof,
// §20.3's best SHAPE reference) local (2.25, 8.0) is whisker field: this
// round's `_jy3cheek.mjs` puts the bottom of the bare cheek at local y ≈ -2.5
// at x = 2, ten units above the patch centre, and the overlay
// `_pv/_jy1lad-flood-penny-obv-2.png` shows the located boundary drawn on the
// photograph (§4.3). The patch is more than three radii from every other
// patch in the set, so it adds a locus rather than moving one.
//
// Run: node coloringbook/judge/_jy0freeze-midjaw.mjs
import { existsSync, writeFileSync } from 'node:fs';
import { localToDisc, loadJSON, PENNY } from '../_pylib.mjs';

const OUT = new URL('./_jy0tonepatch-midjaw.json', import.meta.url).pathname;
if (existsSync(OUT)) { console.log('REFUSING: the cent mid-jaw patch is frozen'); process.exit(1); }

const FROZEN = loadJSON(new URL('../_tonepatches-penny.json', import.meta.url).pathname).patches;
const cheek = FROZEN.find((p) => p.name === 'cheek').local;
const beardJaw = FROZEN.find((p) => p.name === 'beardJaw').local;
const LX = (cheek.x + beardJaw.x) / 2, LY = (cheek.y + beardJaw.y) / 2, LR = 2.6;
console.log(`midpoint of the frozen cheek (${cheek.x}, ${cheek.y}) and beardJaw (${beardJaw.x}, ${beardJaw.y}) = (${LX}, ${LY}); r = ${LR}`);

const { u, v } = localToDisc(LX, LY);
const patch = {
  name: 'jawMid', u: +u.toFixed(5), v: +v.toFixed(5), r: +(LR * PENNY.s / 47).toFixed(5),
  local: { x: LX, y: LY, r: LR },
  what: 'the mid-jaw whisker field — the midpoint of the frozen cheek and beardJaw centres, which is the hole in the frozen set',
};

// ── separation from every existing patch, in local units
let clash = 0;
for (const p of FROZEN) {
  const d = Math.hypot(p.local.x - LX, p.local.y - LY);
  const touch = d < p.local.r + LR;
  if (touch) clash++;
  console.log(`  vs ${p.name.padEnd(12)} centre distance ${d.toFixed(2)}  (radii ${p.local.r} + ${LR} = ${(p.local.r + LR).toFixed(1)})  ${touch ? '*** OVERLAPS ***' : 'clear'}`);
}
if (clash) { console.log(`\n${clash} overlap(s) — a patch that overlaps another is not a new locus. Refusing.`); process.exit(2); }

// ── wholly inside the traced bust, same test `_pyfreezetone.mjs` applies
const mask = loadJSON(new URL('../_headmask-penny.json', import.meta.url).pathname).poly;
const inside = (uu, vv) => {
  let c = false;
  for (let i = 0, j = mask.length - 1; i < mask.length; j = i++) {
    const [xi, yi] = mask[i], [xj, yj] = mask[j];
    if ((yi > vv) !== (yj > vv) && uu < ((xj - xi) * (vv - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
let ok = inside(patch.u, patch.v);
for (let a = 0; a < 48; a++) {
  const t = (a / 48) * 2 * Math.PI;
  if (!inside(patch.u + patch.r * Math.cos(t), patch.v + patch.r * Math.sin(t))) ok = false;
}
patch.insideCoinMask = ok;
console.log(`\njawMid  u ${patch.u.toFixed(4)}  v ${patch.v.toFixed(4)}  r ${patch.r.toFixed(4)}  ${ok ? 'wholly inside the traced bust' : '*** NOT WHOLLY INSIDE THE HEAD MASK ***'}`);
if (!ok) { console.log('Refusing to freeze a patch that is not wholly inside the mask.'); process.exit(3); }

writeFileSync(OUT, JSON.stringify({
  _comment: 'ADDITIVE mid-jaw tone patch for the Lincoln cent obverse, in the same disc-normalised (u,v,r) frame as _tonepatches-penny.json. Written once; the writer refuses to overwrite. NOT merged into _tonepatches-penny.json by the specialist that placed it — that file is hashed for the round and only the judge may fold this in and re-hash.',
  metric: 'same as _tonepatches-penny.json: median luminance divided by the cheek patch.',
  reference: 'coloringbook/ref/penny-obv-3.jpg, disc cx=999.0 cy=997.3 R=984.97 — the same frame the frozen set is expressed in.',
  localFrame: 'penny OBVERSE: CX=3.88 CY=40.0 s=0.78 dir=+1; screen=(50+CX+dir*s*lx, CY+s*ly); u=(screen-50)/47',
  derivation: 'local (x,y) = the exact midpoint of the frozen cheek (8.5,-1.5) and beardJaw (-4,17.5) centres; r = 2.6, the radius both of them carry. Derived from the TARGET only (COIN-JUDGE 6.1); src/art/coins.js is not read by the writer.',
  placed: 'before any instrument that scores it was written or run; first value published as a BASELINE on unmodified art.',
  patches: [patch],
}, null, 1) + '\n');
console.log('frozen ->', OUT);
