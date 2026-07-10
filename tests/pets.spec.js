// The wider pet asset pool (future modes): catalog integrity and rendering.
import { test, expect } from '@playwright/test';
import { PETS, petSVG, getPet } from '../src/art/pets.js';
import { DOGS, GUESTS, dogSVG, getDog } from '../src/art/dogs.js';

test('pet catalog: unique ids and names, no clashes with the dog pack', () => {
  const petIds = PETS.map((p) => p.id);
  expect(new Set(petIds).size).toBe(PETS.length);
  const allNames = [...PETS, ...DOGS, ...GUESTS].map((p) => p.name);
  expect(new Set(allNames).size).toBe(allNames.length);
  const species = new Set(PETS.map((p) => p.species));
  for (const s of ['cat', 'rabbit', 'guinea', 'bird', 'sloth', 'hedgehog', 'turtle']) {
    expect(species.has(s)).toBe(true);
  }
});

test('every pet renders valid SVG with the shared accessory layers', () => {
  for (const pet of PETS) {
    const svg = petSVG(pet, 96);
    expect(svg).toContain('<svg');
    expect(svg).toContain(`aria-label="${pet.name}`);
    expect(svg).not.toContain('undefined');
    const dressed = petSVG(pet, 96, ['bandana', 'cap', 'bow', 'star']);
    for (const id of ['bandana', 'cap', 'bow', 'star']) {
      expect(dressed).toContain(`data-acc="${id}"`);
    }
  }
  expect(getPet('cat-1').name).toBe('Whiskers');
});

test('dogs still render identically through the shared layers', () => {
  const svg = dogSVG(getDog('starter'), 96, ['bandana', 'star']);
  expect(svg).toContain('data-acc="bandana"');
  expect(svg).toContain('data-acc="star"');
  expect(dogSVG(getDog('starter'), 96)).not.toContain('data-acc');
});

test('e2e: the whole pool renders in a browser without errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const html = `<!doctype html><body style="display:grid;grid-template-columns:repeat(6,1fr)">${PETS.map(
    (p) => petSVG(p, 90)
  ).join('')}</body>`;
  await page.setContent(html);
  expect(await page.$$eval('svg', (els) => els.length)).toBe(PETS.length);
  expect(errors).toEqual([]);
});
