// SPECIALIST (buck obverse) — the byte-identity partition (§5).
//
// Emits every id x side x size x value-scaffold render from the PRE-ROUND
// tree and from the working tree and reports exactly which strings changed.
// Anything outside `buck.obverse` means a shared helper was touched.
//
// The pre-round copy is materialised from git at the dispatch commit into a
// temp dir, imported from there, and compared. It is NOT a symlink: a
// symlinked .mjs resolves its relative imports against the MAIN checkout and
// would silently measure another tree (the trap this session already hit).
//
//   node coloringbook/judge/_sw9ident.mjs <baseCommit>
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const BASE = process.argv[2] || 'd2353ca';
const SIZES = [26, 38, 44, 54, 84, 190];

// The WHOLE of src/ is copied (coins.js reaches ../engine/money.js which
// reaches ../data/canonical.js), then only the art files are replaced with
// their pre-round revisions. Copying just the two art files leaves the import
// graph broken; copying the tree keeps every other module identical on both
// sides, so any difference is attributable to the art.
const tmp = mkdtempSync(join(tmpdir(), 'sw9-'));
cpSync(join(ROOT, 'src'), join(tmp, 'src'), { recursive: true });
for (const f of ['coins.js', 'pawcoins.js']) {
  writeFileSync(join(tmp, 'src', 'art', f), execFileSync('git', ['show', `${BASE}:src/art/${f}`], { cwd: ROOT, maxBuffer: 1 << 28 }));
}

const before = await import(pathToFileURL(join(tmp, 'src', 'art', 'coins.js')).href);
const after = await import(pathToFileURL(join(ROOT, 'src/art/coins.js')).href);

const rows = [];
for (const id of after.COIN_IDS) {
  for (const side of ['obverse', 'reverse']) {
    for (const size of SIZES) {
      for (const value of [false, true]) {
        const a = before.coinSVG(id, size, { side, value });
        const b = after.coinSVG(id, size, { side, value });
        rows.push({ id, side, size, value, same: a === b });
      }
    }
  }
}
const changed = rows.filter((r) => !r.same);
const faces = [...new Set(changed.map((r) => `${r.id}.${r.side}`))].sort();
console.log(`base ${BASE}   ${rows.length} renders compared, ${changed.length} changed`);
console.log(`faces that moved: ${faces.length ? faces.join(', ') : '(none)'}`);
const ok = faces.length === 1 && faces[0] === 'buck.obverse';
console.log(ok ? 'PARTITION CLEAN — only buck.obverse moved.'
  : '*** PARTITION DIRTY — a face outside this round\'s subject changed. ***');
// per-face counts, so a partial change is visible too
const per = {};
for (const r of rows) {
  const k = `${r.id}.${r.side}`;
  per[k] = per[k] || { n: 0, c: 0 };
  per[k].n++; if (!r.same) per[k].c++;
}
for (const [k, v] of Object.entries(per)) console.log(`  ${k.padEnd(18)} ${String(v.c).padStart(2)} of ${v.n} changed`);
process.exitCode = ok ? 0 : 1;
