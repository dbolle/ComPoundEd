// v1.51.0 — seven new wearables. They shipped behind the 🧪 chip first so
// their prices could stay UNLOCKED while the art was judged: a listed price
// is frozen forever (tests/economy-invariants.spec.js), so "provisional
// price" and "reachable by a child" are mutually exclusive states, and beta
// is what separates them. The art was approved, so they are live and their
// prices are now in the lock — which is what going live MEANS here.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { CATALOG, buyGear, isOwned, placeGear, placedOn, toysOn } from '../src/engine/gearshop.js';
import { GEAR_ACCESSORIES } from '../src/art/gear.js';
import { GEAR_SLOT } from '../src/art/dogs.js';
import { PETS, petSVG, PET_FIT } from '../src/art/pets.js';
import { balanceCents, DENOMS } from '../src/engine/money.js';
import { seedProfile, selectProfile, uniqueName, holdGrownupsGate } from './helpers.mjs';

const BETA_IDS = ['diamond', 'flowercrown', 'earmuffs', 'tophat', 'nametag', 'goggles'];

const fund = (p, cents) => {
  let i = 0;
  let left = cents;
  for (const d of DENOMS) {
    while (left >= d.cents) {
      p.pawBucks.txns.push({ id: `t${i++}`, at: 1000 + i, cents: d.cents, denom: d.id, count: 1, reason: 'sitting' });
      left -= d.cents;
    }
  }
};

test('the new wearables are live, priced as agreed, and spread across slots', () => {
  const AGREED = {
    diamond: 1100, flowercrown: 900, flowercollar: 600,
    earmuffs: 450, tophat: 400, nametag: 350, goggles: 300,
  };
  for (const id of BETA_IDS) {
    const item = CATALOG.find((x) => x.id === id);
    expect(item, `${id} exists`).toBeTruthy();
    expect(item.beta, `${id} left beta`).toBeFalsy();
    expect(item.slot, `${id} is wearable`).toBeTruthy();
    expect(item.price, `${id} price as agreed`).toBe(AGREED[id]);
  }
  // Only two are one-of-a-kind treasures; a name tag or goggles read more
  // naturally as something bought FOR one friend.
  const tiers = Object.fromEntries(BETA_IDS.map((id) => [id, CATALOG.find((x) => x.id === id).tier]));
  expect(tiers.diamond).toBe('treasure');
  expect(tiers.flowercrown).toBe('treasure');
  expect(tiers.nametag).toBe('gift');

  // There are now several neck items, and the tag, bow and flower collar
  // all cover the collar disc on purpose — so wearing must be exclusive per
  // slot, or two of them stack. That is asserted properly below.
  expect(GEAR_ACCESSORIES.filter((i) => i.slot === 'neck').length).toBeGreaterThan(2);
});

test('a new item is a real purchase: it charges, and it is owned', () => {
  const p = newProfile('Rich');
  fund(p, 1100);
  expect(balanceCents(p)).toBe(1100);
  const txn = buyGear(p, 'diamond', null, Date.now());
  expect(txn, 'buys like anything else').toBeTruthy();
  expect(isOwned(p, 'diamond')).toBe(true);
  expect(balanceCents(p)).toBe(0);
});

test('e2e: every new wearable is on the shelves for an ordinary profile', async ({ page }) => {
  // The point of leaving beta: a child with no special flags can see and
  // buy them. While they were beta this test asserted the opposite.
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Shopper'));
  doc.id = 'treasure-kid';
  doc.subjects = { ...doc.subjects, tables: true };
  fund(doc, 1500);
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.evaluate(() => {
    location.hash = '#/store';
  });
  await page.waitForSelector('[data-item="crown"]');

  for (const id of BETA_IDS) {
    await expect(page.locator(`[data-item="${id}"]`), `${id} is shelved`).toHaveCount(1);
  }
  // the dear ones sit under Treasures with their agreed prices
  await expect(page.locator('[data-item="diamond"]')).toContainText('$11.00');
  await expect(page.locator('[data-item="flowercollar"]')).toContainText('$6.00');
});

test('putting something on takes off whatever was already in that place', () => {
  // Nothing enforced this before. It only became visible when the name tag,
  // the bow and the flower collar were all made to cover the collar disc:
  // two at once would stack into a mess.
  const p = newProfile('Dresser');
  fund(p, 3000);
  p.unlocks.push({ dogId: 'dog-2', table: 2, at: 1 });
  for (const id of ['diamond', 'flowercollar']) {
    expect(buyGear(p, id, null, Date.now()), `bought ${id}`).toBeTruthy();
  }
  placeGear(p, 'diamond', 'dog-2');
  expect(placedOn(p, 'dog-2')).toEqual(['diamond']);

  placeGear(p, 'flowercollar', 'dog-2');
  expect(placedOn(p, 'dog-2'), 'the diamond came off').toEqual(['flowercollar']);

  // a different SLOT is untouched — this is about the neck, not about
  // wearing one thing in total
  expect(buyGear(p, 'flowercrown', null, Date.now())).toBeTruthy();
  placeGear(p, 'flowercrown', 'dog-2');
  expect(placedOn(p, 'dog-2').sort()).toEqual(['flowercollar', 'flowercrown']);

  // and toys have no slot, so a friend may still have several at once
  expect(buyGear(p, 'ball', null, Date.now())).toBeTruthy();
  expect(buyGear(p, 'bell', null, Date.now())).toBeTruthy();
  placeGear(p, 'ball', 'dog-2');
  placeGear(p, 'bell', 'dog-2');
  expect(toysOn(p, 'dog-2').sort()).toEqual(['ball', 'bell']);
});

// --- accessories fitted per species ---------------------------------------

test('the slot map matches the catalogue, so nothing is fitted as the wrong kind', () => {
  // GEAR_SLOT lives in dogs.js (next to the layers) while the catalogue
  // lives in gear.js; importing one from the other would make a cycle. Two
  // lists that must agree are exactly the drift that caused v1.47.3, so
  // assert it rather than trusting it.
  for (const item of GEAR_ACCESSORIES) {
    expect(GEAR_SLOT[item.id], `${item.id} slot`).toBe(item.slot);
  }
  for (const id of Object.keys(GEAR_SLOT)) {
    expect(GEAR_ACCESSORIES.some((i) => i.id === id), `${id} is a real item`).toBe(true);
  }
});

test('species with different heads get their accessories moved to match', () => {
  // A turtle's head sits 18px lower than a dog's and is a fifth smaller
  // (the shell owns the top of the frame), so hats floated above it and
  // glasses missed its eyes.
  const turtle = PETS.find((p) => p.species === 'turtle');
  const cat = PETS.find((p) => p.species === 'cat');

  // Each slot answers to a DIFFERENT feature, which is why one number per
  // species is not enough. Eyes are derivable — a turtle's really are 8px
  // lower than a dog's. Hats are NOT: the head circle argues +18 (and
  // buries the hat, since that feature hides behind the shell) while the
  // shell dome argues +2 (and balances it on the apex). The value that
  // looks right is between them, because a dome is not a flat head. So
  // this pins the RANGE and the reason, not a formula that would be a lie.
  expect(PET_FIT.turtle.eyes[0], 'glasses follow the eyes, which really moved').toBeGreaterThan(4);
  expect(PET_FIT.turtle.head[0], 'hats sit below the shell apex').toBeGreaterThan(2);
  expect(PET_FIT.turtle.head[0], 'but well above the hidden head circle').toBeLessThan(18);
  expect(PET_FIT.turtle.ear[0], 'no ears — both ear items rest on the head').toBeGreaterThan(8);
  expect(PET_FIT.turtle.flower, 'the bloom takes the earmuffs’ fit, not its own').toBeUndefined();
  expect(PET_FIT.cat, 'a cat shares the dog geometry exactly').toBeUndefined();

  // the fit is applied, not merely declared
  expect(petSVG(turtle, 120, ['glasses'])).toMatch(/<g transform="translate\(0 8\)/);
  expect(petSVG(turtle, 120, ['tophat'])).toMatch(/<g transform="translate\(0 10\)/);
  expect(petSVG(cat, 120, ['tophat']), 'no needless wrapper').not.toMatch(/<g transform="translate\(0 /);
});

test('nothing a friend can wear falls outside the picture', async ({ page }) => {
  // Moving things per species risks pushing them off the 120-unit frame,
  // which is invisible in code and obvious on a tablet.
  await page.goto('about:blank');
  const bad = [];
  for (const species of ['turtle', 'hedgehog', 'cat', 'bird', 'rabbit']) {
    const pet = PETS.find((p) => p.species === species);
    for (const item of GEAR_ACCESSORIES) {
      const box = await page.evaluate(
        ({ svg, id }) => {
          document.body.innerHTML = svg;
          const g = document.querySelector(`[data-acc="${id}"]`);
          if (!g) return null;
          const bb = g.getBBox();
          return { x1: bb.x, y1: bb.y, x2: bb.x + bb.width, y2: bb.y + bb.height };
        },
        { svg: petSVG(pet, 400, [item.id]), id: item.id }
      );
      if (!box) continue;
      if (box.y1 < 0 || box.y2 > 120 || box.x1 < 0 || box.x2 > 120) {
        bad.push(`${species}/${item.id} y ${box.y1.toFixed(1)}..${box.y2.toFixed(1)}`);
      }
    }
  }
  expect(bad, 'accessories outside the 0–120 frame').toEqual([]);
});
