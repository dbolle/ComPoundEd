// SPECIALIST working instrument (dime obverse, D7 round) — the byte-identity
// partition (§5, "the check that makes concurrent rounds safe").
//
// Emits every id x side x size the app can draw from TWO revisions of
// src/art/coins.js and partitions the renders into identical / changed. With
// three specialists holding three faces at once, a change on any face but mine
// means I touched shared machinery and the round is void.
//
// The baseline revision is read out of git (`git show <rev>:src/art/coins.js`)
// into a temp file, so nothing in the worktree is moved to run it. The import
// of `../engine/money.js` is re-pointed at the worktree copy, which is the same
// rewrite `_jd14d1resp.mjs` does for the same reason.
//
// Run: node coloringbook/judge/_sd7ident.mjs [baselineRev]
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = new URL('../../', import.meta.url).pathname;
const REV = process.argv[2] || 'HEAD';
const SIZES = [26, 42, 44, 62, 84, 190, 380, 600];
const SIDES = ['obverse', 'reverse'];

const dir = mkdtempSync(join(tmpdir(), 'sd7-'));
const base = execFileSync('git', ['show', `${REV}:src/art/coins.js`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
writeFileSync(join(dir, 'coins.js'), base.replace("from '../engine/money.js'", `from '${ROOT}src/engine/money.js'`));

const now = await import(`${ROOT}src/art/coins.js`);
const old = await import(`file://${join(dir, 'coins.js')}`);
const IDS = now.COIN_IDS;
const h = (s) => createHash('sha256').update(s).digest('hex').slice(0, 12);

let same = 0;
const changed = [];
for (const id of IDS) for (const side of SIDES) for (const px of SIZES) {
  const a = old.coinSVG(id, px, { side }), b = now.coinSVG(id, px, { side });
  if (a === b) same++; else changed.push({ id, side, px, from: h(a), to: h(b) });
}
const total = same + changed.length;
console.log(`byte-identity partition vs ${REV}:  ${total} renders  (${IDS.length} ids x ${SIDES.length} sides x ${SIZES.length} sizes)`);
console.log(`  identical: ${same}    changed: ${changed.length}`);
const faces = [...new Set(changed.map((c) => `${c.id}.${c.side}`))];
console.log(`  faces that changed: ${faces.length ? faces.join(', ') : '(none)'}`);
for (const c of changed) console.log(`    ${c.id.padEnd(8)} ${c.side.padEnd(8)} ${String(c.px).padStart(4)}px  ${c.from} -> ${c.to}`);

// The stronger form: the set of DISTINCT path-data strings each face emits.
// A face can be render-identical and still have moved a `d` if the difference
// is whitespace, so compare the parsed geometry too.
const ds = (mod, id, side) => [...mod.coinSVG(id, 600, { side }).matchAll(/\sd="([^"]+)"/g)].map((m) => m[1].replace(/\s+/g, ''));
console.log('\n  path-data partition at 600px:');
for (const id of IDS) for (const side of SIDES) {
  const a = ds(old, id, side), b = ds(now, id, side);
  const diff = a.length !== b.length ? `LENGTH ${a.length} -> ${b.length}` : a.filter((x, i) => x !== b[i]).length;
  console.log(`    ${id.padEnd(8)} ${side.padEnd(8)} ${a.length} paths, ${diff === 0 ? 'all byte-identical' : `${diff} differ`}`);
}
