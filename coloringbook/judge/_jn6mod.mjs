// _jn6mod — read-only access to coins.js internals that are not exported
// (HEAD, HAIR, TAIL, RELIEF, EDGE). It writes a COPY of the file with one
// extra export appended and imports that; `src/art/coins.js` is never touched.
//
// The copy asserts that the appended text is the ONLY difference, so a run can
// never accidentally measure a modified drawing.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export async function internals(srcPath) {
  const SRC = srcPath || new URL('../../src/art/coins.js', import.meta.url).pathname;
  const MONEY = new URL('../../src/engine/money.js', import.meta.url).pathname;
  const raw = readFileSync(SRC, 'utf8');
  if (raw.split("from '../engine/money.js'").length - 1 !== 1) throw new Error('import rewrite did not match once');
  const TAIL = `\nexport const _JN6_INTERNALS = { HEAD, HAIR, TAIL, RELIEF, EDGE, PALETTE };\n`;
  const body = raw.split("from '../engine/money.js'").join(`from '${MONEY}'`);
  const p = join(mkdtempSync(join(tmpdir(), 'jn6mod-')), 'coins.js');
  writeFileSync(p, body + TAIL);
  const m = await import(p);
  // the assertion: strip the appendix and the import rewrite, and the result
  // must be byte-identical to the source we claim to be reading.
  const back = readFileSync(p, 'utf8').slice(0, -TAIL.length).split(`from '${MONEY}'`).join("from '../engine/money.js'");
  if (back !== raw) throw new Error('the copy differs from the source by more than the appendix — refusing');
  return { mod: m, ...m._JN6_INTERNALS };
}
