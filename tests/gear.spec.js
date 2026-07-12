// Store gear assets (Phase 4 inventory): wearables render as overlays on any
// dog; toys are standalone art. No store, no prices, no wear changes yet.
import { test, expect } from '@playwright/test';
import { GEAR_ACCESSORIES, TOYS, toySVG } from '../src/art/gear.js';
import { ACCESSORIES, getDog, dogSVG, wornFor } from '../src/art/dogs.js';
import { newProfile } from '../src/data/schema.js';

test('gear catalog: unique ids, no clashes with counter accessories, slots set', () => {
  const ids = [...GEAR_ACCESSORIES, ...TOYS].map((g) => g.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const g of GEAR_ACCESSORIES) {
    expect(ACCESSORIES.some((a) => a.id === g.id)).toBe(false);
    expect(['head', 'eyes', 'neck', 'ear']).toContain(g.slot);
  }
  expect(GEAR_ACCESSORIES.map((g) => g.id)).toEqual(
    expect.arrayContaining(['crown', 'tiara'])
  );
});

test('every wearable renders on a dog; toys render standalone', () => {
  const dog = getDog('dog-5');
  for (const g of GEAR_ACCESSORIES) {
    const svg = dogSVG(dog, 96, [g.id]);
    expect(svg).toContain(`data-acc="${g.id}"`);
    expect(svg).not.toContain('undefined');
  }
  // Gear stacks with counter accessories
  const dressed = dogSVG(dog, 96, ['crown', { id: 'bandana', color: 'green' }]);
  expect(dressed).toContain('data-acc="crown"');
  expect(dressed).toContain('data-color="green"');

  for (const t of TOYS) {
    const svg = toySVG(t.id, 56);
    expect(svg).toContain(`data-toy="${t.id}"`);
    expect(svg).not.toContain('undefined');
  }
});

test('gear is never auto-worn: wornFor only returns counter-earned items', () => {
  const p = newProfile('NoGear');
  p.play.d = { walk: 200, feed: 200, fetch: 200 };
  const worn = wornFor(p, 'd');
  for (const g of GEAR_ACCESSORIES) {
    expect(worn.some((e) => e === g.id || e?.id === g.id)).toBe(false);
  }
});

test('e2e: the whole gear pool renders in a browser without errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const dog = getDog('dog-2');
  const html = `<!doctype html><body style="display:grid;grid-template-columns:repeat(4,1fr)">
    ${GEAR_ACCESSORIES.map((g) => dogSVG(dog, 90, [g.id])).join('')}
    ${TOYS.map((t) => toySVG(t.id, 90)).join('')}
  </body>`;
  await page.setContent(html);
  expect(await page.$$eval('svg', (els) => els.length)).toBe(
    GEAR_ACCESSORIES.length + TOYS.length
  );
  expect(errors).toEqual([]);
});
