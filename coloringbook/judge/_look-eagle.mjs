import sharp from 'sharp';
const A = await import('/tmp/claude-1000/-home-USER-compounded/50ad3f5d-491c-4745-97b9-38751da704e7/scratchpad/base788/src/art/coins.js');
const B = await import('/home/USER/compounded/.claude/worktrees/agent-adba59a3ff72dddda/src/art/coins.js');
const CELL = 300, PAD = 12, HEAD = 40;
// CONTROL FIRST: the nickel obverse must be identical, so if it differs the
// comparison itself is wrong. Rendered before the subject, per the rule that a
// control read after the fact passes by construction.
const rows = [['nickel', 'reverse', 'CONTROL — must be identical'], ['quarter', 'reverse', 'SUBJECT']];
const layers = [], text = [];
for (let r = 0; r < rows.length; r++) {
  const [id, side, label] = rows[r];
  const top = HEAD + r * (CELL + PAD + 22);
  text.push(`<text x="${PAD}" y="${top + 15}" font-family="monospace" font-size="13" fill="#333">${id} ${side} — ${label}</text>`);
  for (const [k, M] of [[0, A], [1, B]]) {
    const png = await sharp(Buffer.from(M.coinSVG(id, 380, { side }))).png().toBuffer();
    layers.push({ input: await sharp(png).resize(CELL, CELL, { fit: 'contain', background: '#fff' }).png().toBuffer(),
      left: PAD + k * (CELL + PAD), top: top + 22 });
  }
}
text.push(`<text x="${PAD}" y="22" font-family="monospace" font-size="15" fill="#111">BEFORE (v1.66.0)          AFTER (quarter eagle)</text>`);
const W = PAD + 2 * (CELL + PAD), H = HEAD + rows.length * (CELL + PAD + 22);
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${text.join('')}</svg>`))
  .composite(layers).png().toFile('/home/USER/compounded/coloringbook/judge/_look-eagle.png');
console.log('wrote _look-eagle.png');
