// SPECIALIST INSTRUMENT — round 1, D5 lettering. §4.3 OVERLAY, OUR SIDE.
//
// The same grid `_jl1grid.mjs` draws on a photograph, drawn on OUR render, so
// a legend's baseline, cap extent and angular span can be read off ours in
// exactly the units the frozen targets are stated in — and so ours and the
// reference can be put side by side without either being re-registered.
//
// It also draws, in orange, the glyph boxes `textMarks()` in
// `_jq8contain-v2.mjs` builds — the boxes D8 scores — so "the cap grew and
// containment did not move" is a claim that can be looked at rather than
// asserted. The field circle (`EDGE[id].field[tier]`) is drawn in red.
//
// §4.1 null: no search. §4.2: every glyph box is drawn, not a selection.
//
// Run: node coloringbook/judge/_jl1ours.mjs <coin> <side> [size]
//      ART=/abs/coins.js  TAG=after
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCoins, textMarks } from './_jq8contain-v2.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');

const coin = process.argv[2] || 'nickel';
const side = process.argv[3] || 'reverse';
const size = Number(process.argv[4] || 380);
const artPath = process.env.ART || join(ROOT, 'src/art/coins.js');
const mod = await loadCoins(readFileSync(artPath, 'utf8'));

const svg = mod.coinSVG(coin, size, { side });
const boxW = Math.round(Number(svg.match(/width="([\d.]+)"/)[1]));
const S = 1400, u = S / 100;
const png = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).resize(S, S, { fit: 'fill' }).png().toBuffer();

let ov = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">`;
for (let v = 0; v <= 100; v += 5) {
  ov += `<line x1="${v * u}" y1="0" x2="${v * u}" y2="${S}" stroke="#00a0ff" stroke-width="${v % 10 ? 0.7 : 1.4}" opacity="0.5"/>`
    + `<line x1="0" y1="${v * u}" x2="${S}" y2="${v * u}" stroke="#00a0ff" stroke-width="${v % 10 ? 0.7 : 1.4}" opacity="0.5"/>`;
  if (v % 10 === 0) ov += `<text x="${v * u + 3}" y="14" font-family="monospace" font-size="13" fill="#c60">${v}</text>`
    + `<text x="3" y="${v * u - 3}" font-family="monospace" font-size="13" fill="#c60">${v}</text>`;
}
for (let r = 26; r <= 47; r += 2) {
  ov += `<circle cx="${50 * u}" cy="${50 * u}" r="${r * u}" fill="none" stroke="#0a0" stroke-width="1" opacity="0.55"/>`
    + `<text x="${(50 + r) * u + 2}" y="${50 * u - 2}" font-family="monospace" font-size="12" fill="#0a0">${r}</text>`;
}
for (let a = 0; a < 360; a += 15) {
  const th = (a * Math.PI) / 180;
  ov += `<line x1="${(50 + 26 * Math.cos(th)) * u}" y1="${(50 + 26 * Math.sin(th)) * u}" x2="${(50 + 47 * Math.cos(th)) * u}" y2="${(50 + 47 * Math.sin(th)) * u}" stroke="#c0c" stroke-width="${a % 90 ? 0.8 : 1.8}" opacity="0.45"/>`
    + `<text x="${(50 + 48.5 * Math.cos(th)) * u - 9}" y="${(50 + 48.5 * Math.sin(th)) * u + 4}" font-family="monospace" font-size="11" fill="#c0c">${a}</text>`;
}
const rField = Number(svg.match(/<circle cx="50" cy="50" r="([\d.]+)" fill="none"/)[1]);
ov += `<circle cx="${50 * u}" cy="${50 * u}" r="${rField * u}" fill="none" stroke="#f00" stroke-width="2.2" opacity="0.9"/>`;
let maxR = 0, maxCh = '';
for (const m of textMarks(svg)) {
  ov += `<polygon points="${m.pts.map((p) => `${p.x * u},${p.y * u}`).join(' ')}" fill="none" stroke="#f80" stroke-width="1.3" opacity="0.95"/>`;
  for (const p of m.pts) { const r = Math.hypot(p.x - 50, p.y - 50); if (r > maxR) { maxR = r; maxCh = m.ch; } }
}
ov += `<text x="8" y="${S - 10}" font-family="monospace" font-size="18" fill="#f00">${coin} ${side} size ${size} box ${boxW}  field r ${rField}  max glyph-box r ${maxR.toFixed(3)} ("${maxCh}")</text></svg>`;

const name = `_jl1ours-${coin}-${side}-${size}${process.env.TAG ? '-' + process.env.TAG : ''}.png`;
await sharp(png).composite([{ input: Buffer.from(ov) }]).png().toFile(join(HERE, name));
console.log(`${coin} ${side} ${size}px (box ${boxW})  field circle r ${rField}  MAX GLYPH-BOX RADIUS ${maxR.toFixed(4)} on "${maxCh}"`);
console.log('wrote ' + name + '  — red = field circle, orange = the glyph boxes D8 scores.');
