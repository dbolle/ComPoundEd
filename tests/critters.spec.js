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
        // A phone/tablet speaker radiates almost nothing below ~400Hz, so
        // measure through a highpass: a "deep" voice whose body sits under
        // that arrives as a thin whistle on the kids' actual devices.
        const spk = off.createBiquadFilter();
        spk.type = 'highpass';
        spk.frequency.value = 400;
        spk.connect(off.destination);
        const realDest = Object.getOwnPropertyDescriptor(
          Object.getPrototypeOf(Object.getPrototypeOf(off)),
          'destination'
        );
        Object.defineProperty(off, 'destination', { get: () => spk, configurable: true });
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
        if (realDest) Object.defineProperty(off, 'destination', realDest);
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
    // measured THROUGH a 400Hz highpass — i.e. what a tablet can actually
    // reproduce, not what the raw waveform contains
    expect(stats[s].peak, `${s} is audible on a tablet speaker`).toBeGreaterThan(0.012);
    expect(stats[s].peak, `${s} stays gentle (charter)`).toBeLessThan(0.35);
    expect(stats[s].seconds, `${s} lasts a moment`).toBeGreaterThan(0.02);
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

test('every option is ONE event where it claims to be (counting integrity)', async ({ page }) => {
  // The listen-and-count game counts these by ear: a "single" voice that
  // fires twice would make "how many?" unanswerable.
  await page.goto('/', { waitUntil: 'networkidle' });
  const bursts = await page.evaluate(
    async ({ src }) => {
      const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      const out = {};
      const banks = { dog: 6, rabbit: 6, bird: 3 };
      for (const [species, n] of Object.entries(banks)) {
        out[species] = [];
        for (let i = 0; i < n; i++) {
          const off = new OfflineAudioContext(1, 44100 * 2, 44100);
          const realAC = window.AudioContext;
          const realWk = window.webkitAudioContext;
          window.AudioContext = function () {
            return off;
          };
          window.webkitAudioContext = undefined;
          const mod = await import(/* @vite-ignore */ `${url}#${species}${i}`);
          mod.playVoiceOption(species, i);
          window.AudioContext = realAC;
          window.webkitAudioContext = realWk;
          const data = (await off.startRendering()).getChannelData(0);
          // count runs of audible signal separated by >60ms of silence
          const win = Math.round(44100 * 0.06);
          let runs = 0;
          let quiet = win;
          for (let s = 0; s < data.length; s += 64) {
            let peak = 0;
            for (let k = s; k < Math.min(s + 64, data.length); k++) peak = Math.max(peak, Math.abs(data[k]));
            if (peak > 0.004) {
              if (quiet >= win) runs += 1;
              quiet = 0;
            } else {
              quiet += 64;
            }
          }
          out[species].push(runs);
        }
      }
      URL.revokeObjectURL(url);
      return out;
    },
    { src: SOUND_SRC }
  );

  // every dog option must be a SINGLE woof (the counting bug that started this)
  for (const [i, runs] of bursts.dog.entries()) {
    expect(runs, `dog option ${i + 1} is one event`).toBe(1);
  }
  // round 3: every rabbit option is a single event (the multi-event
  // "two thumps + squeak" left the bank when the squeak/click family won)
  for (const [i, runs] of bursts.rabbit.entries()) {
    expect(runs, `rabbit option ${i + 1} is one event`).toBe(1);
  }
  // bird 2–3 single; 1 is the three-chirp original
  for (const i of [1, 2]) expect(bursts.bird[i], `bird option ${i + 1}`).toBe(1);
  expect(bursts.bird[0]).toBeGreaterThan(1);
});
