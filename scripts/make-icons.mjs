// Generates the PWA PNG icons from public/icons/icon.svg.
// Run after changing the icon: node scripts/make-icons.mjs
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const svg = await readFile(new URL('../public/icons/icon.svg', import.meta.url));

const jobs = [
  { file: 'icon-192.png', size: 192, pad: 0 },
  { file: 'icon-512.png', size: 512, pad: 0 },
  // Maskable: artwork inside the 80% safe zone on a solid background.
  { file: 'icon-maskable-512.png', size: 512, pad: 52 },
];

for (const { file, size, pad } of jobs) {
  const inner = await sharp(svg).resize(size - pad * 2).png().toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: '#f59e0b',
    },
  })
    .composite([{ input: inner, left: pad, top: pad }])
    .png()
    .toFile(new URL(`../public/icons/${file}`, import.meta.url).pathname);
  console.log('wrote', file);
}
