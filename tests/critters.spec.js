// v1.43.0 per-species voices. Verified by RENDERING the audio offline
// (OfflineAudioContext) and measuring it — a sound test that only checks
// "nothing threw" would pass with silence.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { seedProfile, selectProfile, uniqueName } from './helpers.mjs';

const SPECIES = ['dog', 'cat', 'rabbit', 'guinea', 'bird', 'sloth', 'hedgehog', 'turtle'];

// sound.js is self-contained (no imports), so the REAL shipped source can
// be loaded as a module in the page with AudioContext pointed at an
// OfflineAudioContext — measuring actual samples, with no test seam in
// production code.
import { readFileSync } from 'node:fs';
const SOUND_SRC = readFileSync(new URL('../src/sound.js', import.meta.url), 'utf8');

test('every species has a voice, no two sound alike, and all stay gentle', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const stats = await page.evaluate(
    async ({ src, species }) => {
      const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      const results = {};
      for (const s of species) {
        const off = new OfflineAudioContext(1, 44100, 44100);
        const realAC = window.AudioContext;
        const realWebkit = window.webkitAudioContext;
        window.AudioContext = function () {
          return off;
        };
        window.webkitAudioContext = undefined;
        const mod = await import(/* @vite-ignore */ `${url}#${s}`); // fresh module per species
        mod.critterSound(s); // the context is created LAZILY — patch must still be in place
        window.AudioContext = realAC;
        window.webkitAudioContext = realWebkit;
        const buf = await off.startRendering();
        const data = buf.getChannelData(0);
        let peak = 0;
        let voiced = 0;
        let crossings = 0;
        for (let i = 0; i < data.length; i++) {
          const v = Math.abs(data[i]);
          if (v > peak) peak = v;
          if (v > 0.005) voiced += 1;
          if (i && data[i - 1] < 0 !== data[i] < 0) crossings += 1;
        }
        results[s] = {
          peak: Number(peak.toFixed(4)),
          seconds: Number((voiced / 44100).toFixed(3)),
          brightness: crossings,
        };
      }
      URL.revokeObjectURL(url);
      return results;
    },
    { src: SOUND_SRC, species: SPECIES }
  );

  for (const s of SPECIES) {
    expect(stats[s].peak, `${s} is audible on a tablet`).toBeGreaterThan(0.015);
    expect(stats[s].peak, `${s} stays gentle (charter)`).toBeLessThan(0.35);
    expect(stats[s].seconds, `${s} lasts a moment`).toBeGreaterThan(0.03);
    expect(stats[s].seconds, `${s} is not a drone`).toBeLessThan(1.2);
  }
  // distinctness: these must not measure alike
  expect(stats.bird.brightness).toBeGreaterThan(stats.rabbit.brightness * 2);
  expect(stats.sloth.seconds).toBeGreaterThan(stats.dog.seconds);
  expect(stats.guinea.brightness).toBeGreaterThan(stats.turtle.brightness);
});

test('e2e: tapping a Cozy Corner pet plays without errors, and the bark game speaks the buddy sound', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    window.__spoken = [];
    const orig = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = (u) => {
      window.__spoken.push(u.text);
      orig(u);
    };
  });
  const doc = newProfile(uniqueName('Critter'));
  doc.id = 'critter-kid';
  doc.subjects = { ...doc.subjects, little: true };
  doc.petUnlocks.push({ petId: 'cat-1', milestone: 'count3', at: 1 });
  doc.avatarPetId = 'cat-1'; // a CAT buddy
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-hero');

  // say hi in the corner
  await page.evaluate(() => { location.hash = '#/corner'; });
  await page.waitForSelector('.pet-hello');
  await page.tap('.pet-hello');
  await page.waitForTimeout(400);

  // the listen-and-count game must ask for MEOWS, not barks
  await page.evaluate(() => { location.hash = '#/little?game=count&v=barks'; });
  await page.waitForSelector('.bark-dog');
  await page.waitForTimeout(600);
  const spoken = await page.evaluate(() => window.__spoken ?? []);
  expect(spoken.join(' ')).toContain('meows');
  expect(spoken.join(' ')).not.toContain('barks');
  expect(await page.getAttribute('.bark-dog', 'aria-label')).toContain('meows');
  expect(errors).toEqual([]);
});
