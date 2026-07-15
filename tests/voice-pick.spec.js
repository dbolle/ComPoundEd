// Parent voice override: Automatic (scored) by default, an explicit pick
// wins, persists across reloads, and legacy voices never win Automatic.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { seedProfile, selectProfile, holdGrownupsGate, uniqueName } from './helpers.mjs';

const FAKE_VOICES = `
  const mk = (name, lang = 'en-US') =>
    ({ name, lang, localService: true, voiceURI: name, default: false });
  const fake = [mk('Fred'), mk('Superstar'), mk('Samantha'), mk('Ava (Enhanced)'), mk('Joelle (Premium)')];
  speechSynthesis.getVoices = () => fake;
  window.__spoken = [];
  // the native u.voice setter rejects plain objects, so capture the intent:
  // the app assigns u.voice inside its try — trap it via defineProperty.
  const V = SpeechSynthesisUtterance.prototype;
  Object.defineProperty(V, 'voice', {
    configurable: true,
    set(v) { this.__wanted = v; },
    get() { return this.__wanted ?? null; },
  });
  speechSynthesis.speak = (u) => { window.__spoken.push({ text: u.text, voice: u.__wanted?.name ?? null }); };
`;

test('automatic picks the premium voice, never Fred/Superstar; parent pick overrides and persists', async ({ page }) => {
  await page.addInitScript(FAKE_VOICES);
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Voicy'));
  doc.id = 'voice-kid';
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.hero');
  await page.tap('[data-nav="/grownups"]');
  await holdGrownupsGate(page);

  await page.tap('[data-voice-test]');
  await page.waitForTimeout(600);
  let spoken = await page.evaluate(() => window.__spoken);
  expect(spoken[spoken.length - 1].voice).toBe('Joelle (Premium)');
  await expect(page.locator('[data-voice-line]')).toContainText('Joelle (Premium)');

  // parent overrides with Samantha
  await page.selectOption('[data-voice-pick]', 'Samantha');
  await page.waitForTimeout(600);
  spoken = await page.evaluate(() => window.__spoken);
  expect(spoken[spoken.length - 1].voice).toBe('Samantha');

  // survives a full reload (the app resumes on the grownups route)
  await page.reload({ waitUntil: 'networkidle' });
  await holdGrownupsGate(page);
  await expect(page.locator('[data-voice-pick]')).toHaveValue('Samantha');
  await page.tap('[data-voice-test]');
  await page.waitForTimeout(600);
  spoken = await page.evaluate(() => window.__spoken);
  expect(spoken[spoken.length - 1].voice).toBe('Samantha');

  // back to Automatic → premium wins again
  await page.selectOption('[data-voice-pick]', '');
  await page.waitForTimeout(600);
  spoken = await page.evaluate(() => window.__spoken);
  expect(spoken[spoken.length - 1].voice).toBe('Joelle (Premium)');
});
