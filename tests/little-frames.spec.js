// L1 honing: quantities arranged in rows of five (ten-frame reading),
// pattern rounds vary one dimension at a time, shape-find uses one color.
import { test, expect } from '@playwright/test';
import { uniqueName } from './helpers.mjs';

async function littleProfile(page, base) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.tap('[data-new]');
  await page.fill('.name-input', uniqueName(base));
  await page.tap('form[data-create] [data-kind="little"]');
  await page.waitForSelector('.little-tile');
}

test('counting items lay out as rows of five, not one long line', async ({ page }) => {
  await littleProfile(page, 'Framer');
  await page.evaluate(() => { location.hash = '#/little?game=count&v=frame'; });
  await page.waitForSelector('.little-items');
  const cols = await page.$eval(
    '.little-items',
    (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length
  );
  expect(cols).toBe(5);
});

test('pattern round: shapes-only first, colors mid-round, mixed only at the end', async ({ page }) => {
  await littleProfile(page, 'Stager');
  await page.evaluate(() => { location.hash = '#/little?game=pattern'; });
  await page.waitForSelector('.little-card');

  const fillsAndShapes = async () => ({
    fills: await page.$$eval('.little-card svg [fill]', (els) => [
      ...new Set(els.map((e) => e.getAttribute('fill'))),
    ]),
    labels: await page.$$eval('.little-card svg', (els) => [
      ...new Set(els.map((e) => e.getAttribute('aria-label'))),
    ]),
  });

  // Q1–2 (shape stage): one color, three shapes
  for (let q = 0; q < 2; q++) {
    const { fills, labels } = await fillsAndShapes();
    expect(fills.length).toBe(1);
    expect(labels.length).toBe(3);
    await page.tap('.little-card[data-good="1"]');
    await expect(page.locator('.paw.done')).toHaveCount(q + 1);
    await page.waitForTimeout(1800);
  }
  // Q3 (color stage): one shape, three colors
  const q3 = await fillsAndShapes();
  expect(q3.labels.length).toBe(1);
  expect(q3.fills.length).toBe(3);
  await page.tap('.little-card[data-good="1"]');
  await page.waitForTimeout(1800);
  // Q4 (AAB): the sequence shows five marks
  expect(await page.$$eval('.pattern-row svg', (els) => els.length)).toBe(5);
  await page.tap('.little-card[data-good="1"]');
  await page.waitForTimeout(1800);
  // Q5 (mixed): both dimensions vary across the choices
  const q5 = await fillsAndShapes();
  expect(q5.fills.length).toBeGreaterThan(1);
  expect(q5.labels.length).toBeGreaterThan(1);
});

test('shape-find choices share a single color — shape is the only signal', async ({ page }) => {
  await littleProfile(page, 'Shapely');
  await page.evaluate(() => { location.hash = '#/little?game=shape'; });
  await page.waitForSelector('.little-card');
  const fills = await page.$$eval('.little-card svg [fill]', (els) => [
    ...new Set(els.map((e) => e.getAttribute('fill'))),
  ]);
  expect(fills.length).toBe(1);
});
