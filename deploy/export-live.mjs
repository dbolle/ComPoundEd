// Emergency export: writes validated raw LIVE profile docs from lifecycle
// envelopes to a separate directory WITHOUT touching the envelopes.
// For rollback/inspection only — never point a raw DAV server at the
// envelope files themselves.
//   node deploy/export-live.mjs <sync-profiles-dir> <output-dir>
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

const [src, out] = process.argv.slice(2);
if (!src || !out) {
  console.error('usage: node deploy/export-live.mjs <sync-profiles-dir> <output-dir>');
  process.exit(1);
}
await fs.mkdir(out, { recursive: true });
let exported = 0;
for (const name of await fs.readdir(src)) {
  if (!name.endsWith('.json')) continue;
  try {
    const parsed = JSON.parse(await fs.readFile(join(src, name), 'utf8'));
    const doc = parsed.state === 'live' ? parsed.doc : parsed.gen === undefined ? parsed : null;
    if (doc && typeof doc.id === 'string' && typeof doc.name === 'string') {
      await fs.writeFile(join(out, `${doc.id}.json`), JSON.stringify(doc));
      exported += 1;
    }
  } catch {
    console.error(`skipped unreadable ${name}`);
  }
}
console.log(`exported ${exported} live profile(s) to ${out}`);
