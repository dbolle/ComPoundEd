// Little Pup mode: preschool games for ages 3–5. Icon-first by design —
// pictorial tiles, spoken prompts with a 🔊 repeat button, and wordless
// feedback (wobbles and stars, never sentences). No reading, no number pad,
// no fail states: a wrong tap dims and the question waits.
// Every finished game counts as playing with the buddy dog, so little pups
// earn real accessories too.

import { navigate } from '../router.js';
import { getDog, dogSVG, wornFor, DOGS, GUESTS } from '../art/dogs.js';
import { getPet, petSVG } from '../art/pets.js';
import { sfx, buzz, say, cheer, critterSound, soundWord, numberWord } from '../sound.js';
import { WINDOWS, overviewSVG, placementSVG, placementCorrect } from '../art/numberpath.js';
import { earnSkillKnown, balanceCents, formatPaw } from '../engine/money.js';
import { avatarFor } from '../art/avatar.js';
import { checkPetUnlocks, nextPetGoal, gameGoal } from '../engine/cozy.js';
import { digitGuideSVG, tracePasses, traceCoverage } from '../art/digits.js';
import { isRevealed, ratchetReveals, addingReady, takingAwayReady } from '../engine/readiness.js';
import { WAVES, waveUnlocked, isWaveMastered, subWaveUnlocked, isSubWaveMastered } from '../engine/waves.js';
import { confetti, escapeHtml, buildNumpad, plural, verb } from '../ui.js';
import { toysOn } from '../engine/gearshop.js';
import {
  GROUP_SKILL_KEYS,
  buildGroupQuestion,
  groupStage,
  groupsReady,
  nextGroupIdentity,
} from '../engine/groups.js';
import { toySVG } from '../art/gear.js';

// Daily item themes: the counting objects change with the day — picnic
// bones today, beach shells tomorrow. Same numbers, fresher world.
const THEMES = [
  ['🦴', '🎾', '🍖'], // classic
  ['🍎', '🥪', '🍇'], // picnic day
  ['🐚', '🦀', '⭐'], // beach day
  ['❄️', '⛄', '🧤'], // snow day
  ['🌼', '🍓', '🥕'], // garden day
];
export const THEME_ITEMS = THEMES[Math.floor(Date.now() / 86400000) % THEMES.length];
const ITEMS = THEME_ITEMS;

// What things are called when spoken — number–noun agreement everywhere.
// A bare string goes through plural(), which handles the regular -s/-es/-ies
// spellings; only genuine irregulars need the explicit [one, many] pair.
// Exported so tests/plurals.spec.js can sweep every word at every count.
export const ITEM_WORDS = {
  '🦴': 'bone', '🎾': 'ball', '🍖': 'treat', '🍎': 'apple', '🥪': 'sandwich',
  '🍇': 'grape', '🐚': 'shell', '🦀': 'crab', '⭐': 'star', '❄️': 'snowflake',
  '⛄': ['snowman', 'snowmen'], '🧤': 'mitten', '🌼': 'flower',
  '🍓': ['berry', 'berries'], '🥕': 'carrot', '🐟': ['fish', 'fish'],
  '🌻': 'seed', '🍃': ['leaf', 'leaves'], '🥬': ['leaf', 'leaves'],
  '💧': 'drop', '🐶': 'pup',
};
export const wordFor = (item, n = 2) => {
  const w = ITEM_WORDS[item] ?? 'thing';
  return Array.isArray(w) ? plural(n, w[0], w[1]) : plural(n, w);
};

// The right food for the friend being fed — a turtle doesn't want bones.
export const FOOD_BY_SPECIES = {
  cat: '🐟', rabbit: '🥕', guinea: '🥬', bird: '🌻',
  sloth: '🍃', hedgehog: '🍓', turtle: '🥬',
};
const foodFor = (buddy) => (buddy.kind === 'pet' ? FOOD_BY_SPECIES[buddy.species] ?? '🥕' : '🦴');
import {
  QUESTIONS_BY_GAME,
  KIND_BY_GAME,
  PRAISE_BY_GAME,
  SKILL_GAMES,
  STREAK_NEEDED,
  RANGE_DOMAIN,
  gameHasFrontier,
} from '../engine/trail.js';

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const STARS = ['⭐', '🌟', '🎉', '🐾'];

// New species from the pet pool host the non-counting games — a pre-reader
// navigates by which animal, not by words.
const HOSTS = { shape: 'cat-1', pattern: 'turtle-1', next: 'bird-1', add: 'guinea-1' };
// Adopted friends co-host: the collection pays off in person. Falls back
// to the classic hosts until friends move in.
// A host with their toys beside them — the collection (and the store
// purchase) pays off in person during play.
function hostArt(profile, host, size = 34) {
  const toys = toysOn(profile, host.id)
    .slice(0, 2)
    .map((id) => toySVG(id, Math.max(16, Math.round(size * 0.45))))
    .join('');
  return `${petSVG(host, size)}${toys}`;
}

function hostFor(profile, g) {
  const adopted = profile.petUnlocks ?? [];
  if (!adopted.length) return getPet(HOSTS[g] ?? 'cat-1');
  const day = Math.floor(Date.now() / 86400000);
  const gi = ['shape', 'pattern', 'next', 'add', 'bond', 'teen'].indexOf(g);
  return getPet(adopted[(day + Math.max(0, gi)) % adopted.length].petId);
}

// Okabe–Ito hues: every pair stays distinct under color-vision deficiency
// (validated ΔE ≥ 17.9 adjacent-pair separation); the soft outline keeps the
// lighter fills readable on white cards.
const SHAPE_COLORS = ['#0072B2', '#E69F00', '#009E73', '#CC79A7'];
const OUTLINE = 'stroke="#4a3f35" stroke-opacity="0.35" stroke-width="2.5" stroke-linejoin="round"';
const SHAPE_DEFS = [
  { kind: 'circle', word: 'circle', d: (c) => `<circle cx="30" cy="30" r="22" fill="${c}" ${OUTLINE}/>` },
  { kind: 'square', word: 'square', d: (c) => `<rect x="10" y="10" width="40" height="40" rx="6" fill="${c}" ${OUTLINE}/>` },
  { kind: 'triangle', word: 'triangle', d: (c) => `<path d="M30 8 L54 50 L6 50 Z" fill="${c}" ${OUTLINE}/>` },
  { kind: 'star', word: 'star', d: (c) => `<path d="M30 6 L37 22 L54 24 L41 36 L45 53 L30 44 L15 53 L19 36 L6 24 L23 22 Z" fill="${c}" ${OUTLINE}/>` },
];

function shapeSVG(def, color, size = 52) {
  return `<svg viewBox="0 0 60 60" width="${size}" height="${size}" role="img" aria-label="${def.word}">${def.d(color)}</svg>`;
}

const ri = (n) => Math.floor(Math.random() * n);

function ensureLittle(profile) {
  if (!profile.little) profile.little = { xp: 0, skills: {} };
  profile.little.skills = profile.little.skills ?? {};
  return profile.little;
}

// --- real mastery signal ---------------------------------------------------
// Choice games record per-number skills; a number is "known" after three
// first-try corrects in a row (a guesser fakes that 3.7% of the time, vs 33%
// per question). Tap & feed stay error-less joy — they never feed the signal.

// Does this game still have numbers to learn? Drives the Play-next pick.
// Generic over skill namespaces now (src/engine/trail.js): the bond/teen
// special cases and the paths/taway key mismatches all disappear, because
// each game states the keys it actually writes.
const hasFrontier = (profile, game) => gameHasFrontier(profile, game);
// The one tile most worth playing now: the trail-order first ready game
// with numbers still to learn; falls back to a daily rotation of the
// untracked games so "Play!" always points somewhere.
export function littleSuggestNext(profile, readyTiles) {
  const tracked = readyTiles.filter((t) => hasFrontier(profile, t.game));
  // Rotate through every frontier game (one step per round played) so the
  // hero varies visit to visit instead of camping on one game.
  const totalPlays = Object.values(profile.play ?? {}).reduce(
    (s, kinds) => s + Object.values(kinds).reduce((a, n) => a + (n || 0), 0),
    0
  );
  if (tracked.length) return tracked[totalPlays % tracked.length];
  return readyTiles[Math.floor(Date.now() / 86400000) % readyTiles.length];
}

// Round-finish praise that matches what the child actually did — shape
// games shouldn't hear "great counting". A couple of options each so the
// cheer doesn't wear out.
const KNOWN_STREAK = 3;

const knows = (little, g, n) =>
  (little.skills?.[`${g}:${n}`]?.streak ?? 0) >= (STREAK_NEEDED[g] ?? KNOWN_STREAK);
const knowsRange = (little, g, lo, hi) => {
  for (let n = lo; n <= hi; n++) if (!knows(little, g, n)) return false;
  return true;
};

// Numbers grow 5 → 7 → 10 as the smaller band is genuinely known — not with
// raw xp, which guessing (and the un-missable games) inflates. Existing kids
// re-derive: nothing visible is removed, and real knowledge re-proves in a
// round or two. Exported for the unit tests.
export function rangeFor(profile, g = 'count') {
  const little = profile.little ?? {};
  const [dLo, dHi] = RANGE_DOMAIN[g] ?? [1, 10];
  const band = (lo, hi) => {
    for (let n = Math.max(lo, dLo); n <= Math.min(hi, dHi); n++) {
      if (!knows(little, g, n)) return false;
    }
    return true;
  };
  if (!band(1, 5)) return 5;
  if (!band(6, 7)) return 7;
  return 10;
}

// Serve the learning frontier: mostly numbers not yet known, with familiar
// ones mixed in so rounds stay confident.
function pickN(little, g, range) {
  const unknown = [];
  for (let n = 1; n <= range; n++) if (!knows(little, g, n)) unknown.push(n);
  if (unknown.length && Math.random() < 0.7) return unknown[ri(unknown.length)];
  return 1 + ri(range);
}

// Guided recount on a miss (count & find): the items pulse one-by-one with
// the spoken count before the child answers again — thinking becomes faster
// than tapping through. Flip to false to roll back to the silent wobble.
const GUIDED_RECOUNT = true;

function itemRow(item, n, cls = 'li') {
  return Array.from({ length: n }, () => `<span class="${cls}">${item}</span>`).join('');
}

function pickCounts(correct, range, count = 3) {
  const set = new Set([correct]);
  while (set.size < count) {
    const jitter = correct + (ri(2) ? 1 : -1) * (1 + ri(2));
    if (jitter >= 1 && jitter <= range) set.add(jitter);
    else set.add(1 + ri(range));
  }
  return [...set].sort(() => Math.random() - 0.5);
}

// Pictorial tiles: a pre-reader navigates by pictures; captions are tiny
// hints for grown-ups and older siblings.
function tiles(p, buddy) {
  return [
    {
      game: 'count',
      minXp: 0,
      caption: 'How many?',
      art: `<span class="tile-art">\u{1F9B4}\u{1F9B4}\u{1F9B4}</span><span class="tile-mark">\u2753</span>`,
    },
    {
      game: 'tap',
      minXp: 0,
      caption: 'Tap & count',
      art: `<span class="tile-art">\u{1F446}\u{1F9B4}</span><span class="tile-mark">1\u00b72\u00b73</span>`,
    },
    {
      game: 'find',
      minXp: 8,
      caption: 'Find it!',
      art: `<span class="tile-num">5</span><span class="tile-art small">\u{1F9B4}\u{1F9B4}\u{1F9B4}\u{1F9B4}\u{1F9B4}</span>`,
    },
    {
      game: 'feed',
      minXp: 14,
      caption: 'Feed me!',
      art: `<span class="tile-dogs">${buddy.svg(38)}</span><span class="tile-art small">\u{1F9B4}\u27A1\uFE0F\u{1F963}</span>`,
    },
    {
      game: 'more',
      minXp: 20,
      caption: 'Who has more?',
      art: `<span class="tile-dogs">${buddy.svg(38)}${dogSVG(GUESTS[0], 38)}</span><span class="tile-art small">\u{1F9B4}\u{1F9B4} \u00b7 \u{1F9B4}</span>`,
    },
    {
      game: 'shape',
      minXp: 28,
      caption: 'Shapes',
      art: `<span class="tile-dogs">${petSVG(hostFor(p, 'shape'), 38)}</span><span class="tile-art small">${shapeSVG(SHAPE_DEFS[0], SHAPE_COLORS[0], 18)}${shapeSVG(SHAPE_DEFS[2], SHAPE_COLORS[1], 18)}${shapeSVG(SHAPE_DEFS[1], SHAPE_COLORS[2], 18)}</span>`,
    },
    {
      game: 'pattern',
      minXp: 38,
      caption: 'Patterns',
      art: `<span class="tile-dogs">${petSVG(hostFor(p, 'pattern'), 38)}</span><span class="tile-art small">${shapeSVG(SHAPE_DEFS[0], SHAPE_COLORS[0], 16)}${shapeSVG(SHAPE_DEFS[0], SHAPE_COLORS[1], 16)}${shapeSVG(SHAPE_DEFS[0], SHAPE_COLORS[0], 16)}\u2753</span>`,
    },
    {
      game: 'next',
      minXp: 55,
      caption: 'What comes next?',
      art: `<span class="tile-dogs">${petSVG(hostFor(p, 'next'), 38)}</span><span class="tile-art small"><span class="tile-mark">2\u00b73\u00b7\u2753</span></span>`,
    },
    {
      game: 'add',
      minXp: 70,
      caption: 'Adding',
      art: `<span class="tile-dogs">${petSVG(hostFor(p, 'add'), 38)}</span><span class="tile-art small">\u{1F9B4}\u2795\u{1F9B4}\u{1F9B4}</span>`,
    },
    {
      game: 'taway',
      minXp: 0,
      ready: (p2) => [2, 3, 4, 5].every((n) => knows(p2.little ?? {}, 'add', n)),
      gate: (p2) => ({
        icon: '➕',
        have: [2, 3, 4, 5].filter((n) => knows(p2.little ?? {}, 'add', n)).length,
        need: 4,
      }),
      caption: 'Take away!',
      art: `<span class="tile-art">🥣</span><span class="tile-mark">🦴➡️</span>`,
    },
    // Bridge graduation tiles: gated on demonstrated skill, not xp
    // (docs/PHASE5.md Track 1).
    {
      game: 'look',
      minXp: 0,
      ready: (p) => knowsRange(p.little ?? {}, 'count', 1, 5),
      gate: (p) => ({
        icon: '🔢',
        have: [1, 2, 3, 4, 5].filter((n) => knows(p.little ?? {}, 'count', n)).length,
        need: 5,
      }),
      caption: 'Quick look!',
      art: `<span class="tile-art">\u{1F440}</span><span class="tile-mark">\u26A1</span>`,
    },
    {
      game: 'bond',
      minXp: 0,
      ready: (p) => knowsRange(p.little ?? {}, 'look', 1, 5),
      gate: (p) => ({
        icon: '👀',
        have: [1, 2, 3, 4, 5].filter((n) => knows(p.little ?? {}, 'look', n)).length,
        need: 5,
      }),
      caption: 'Number friends',
      art: `<span class="tile-art">\u{1F91D}</span><span class="tile-mark">5\u00b710</span>`,
    },
    {
      game: 'type',
      minXp: 0,
      ready: (p) => knowsRange(p.little ?? {}, 'find', 1, 5),
      gate: (p) => ({
        icon: '5️⃣',
        have: [1, 2, 3, 4, 5].filter((n) => knows(p.little ?? {}, 'find', n)).length,
        need: 5,
      }),
      caption: 'Type it!',
      art: `<span class="tile-art">⌨️</span><span class="tile-mark">1️⃣4️⃣</span>`,
    },
    {
      game: 'trace',
      minXp: 0,
      ready: (p) => knowsRange(p.little ?? {}, 'count', 1, 5),
      gate: (p) => ({
        icon: '🖐️',
        have: [1, 2, 3, 4, 5].filter((n) => knows(p.little ?? {}, 'count', n)).length,
        need: 5,
      }),
      caption: 'Trace it!',
      art: `<span class="tile-art">✏️</span><span class="tile-mark">1️⃣2️⃣3️⃣</span>`,
    },
    {
      game: 'counton',
      minXp: 0,
      // Open once teen numbers are known — OR for any child with real
      // higher-track history, who has plainly counted past ten already.
      // An experienced profile must be able to REACH this (CLAUDE.md: gates
      // have hidden features twice), and the counting gates below it were
      // never meant to hold a tables kid back.
      ready: (p) =>
        knowsRange(p.little ?? {}, 'teen', 1, 9) ||
        Object.values(p.facts ?? {}).some((s) => (s.attempts ?? 0) > 0) ||
        Object.values(p.division ?? {}).some((s) => (s.attempts ?? 0) > 0),
      gate: (p) => ({
        icon: '🔢',
        have: [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => knows(p.little ?? {}, 'teen', n)).length,
        need: 9,
      }),
      caption: 'Count on!',
      art: `<span class="tile-num">99</span><span class="tile-mark">🔢</span>`,
    },
    {
      game: 'groups',
      minXp: 0,
      // groupsReady() lives in the engine and already carries the mid-trail
      // inference (a child with real ×/÷ history is never held behind the
      // counting gates). Calling it rather than restating it is what keeps
      // the tile and the engine from drifting apart — the exact drift that
      // produced two of the four R0 defects.
      ready: (p2) => groupsReady(p2),
      gate: (p2) => ({
        icon: '🧺',
        have: GROUP_SKILL_KEYS.filter((k) => (p2.little?.skills?.[k]?.streak ?? 0) >= 3).length,
        need: GROUP_SKILL_KEYS.length,
      }),
      caption: 'Groups!',
      art: `<span class="tile-art">🧺</span><span class="tile-mark">3×4</span>`,
    },
    {
      game: 'teen',
      minXp: 0,
      ready: (p) => knowsRange(p.little ?? {}, 'bond10', 0, 10),
      gate: (p) => ({
        icon: '🤝',
        have: Array.from({ length: 11 }, (_, k) => k).filter((k) => knows(p.little ?? {}, 'bond10', k)).length,
        need: 11,
      }),
      caption: 'Teen numbers',
      art: `<span class="tile-art">\u{1F51F}</span><span class="tile-mark">11\u00b712\u00b713</span>`,
    },
    {
      game: 'surprise',
      minXp: 0,
      ready: (p2) =>
        ['count', 'find', 'more', 'next', 'add', 'look', 'bond', 'teen', 'taway'].filter((x) =>
          (p2.little?.revealed ?? []).includes(`tile:${x}`)
        ).length >= 3,
      gate: (p2) => ({
        icon: '🎲',
        have: Math.min(3, ['count', 'find', 'more', 'next', 'add', 'look', 'bond', 'teen', 'taway'].filter((x) => (p2.little?.revealed ?? []).includes(`tile:${x}`)).length),
        need: 3,
      }),
      caption: 'Surprise!',
      art: `<span class="tile-art">🎁</span><span class="tile-mark">❓❓</span>`,
    },
    {
      game: 'paths',
      minXp: 0,
      ready: (p2) => isWaveMastered(p2, 1), // Doubles ↔ ×2, the connector
      gate: (p2) => {
        const facts = 8; // doubles wave size
        return { icon: '👯', have: 0, need: 1 };
      },
      caption: 'Counting paths',
      art: `<span class="tile-art">🐾</span><span class="tile-mark">2·4·6</span>`,
    },
    // The trail continues in place: Adding and Taking Away live here as
    // graduation tiles too — a little pup never needs the big-kid home
    // to keep climbing (docs: readiness trail).
    {
      game: 'adding',
      minXp: 0,
      ready: (p2) => addingReady(p2) && knowsRange(p2.little ?? {}, 'type', 1, 10),
      gate: (p2) => ({
        icon: '⌨️',
        have: Array.from({ length: 10 }, (_, i) => i + 1).filter((n) => knows(p2.little ?? {}, 'type', n)).length,
        need: 10,
      }),
      caption: 'Adding',
      art: `<span class="tile-art">➕</span><span class="tile-mark">${WAVES[0].emoji}</span>`,
      href: (p2) => {
        const i = WAVES.findIndex((w, ix) => waveUnlocked(p2, ix) && !isWaveMastered(p2, ix));
        return `/quiz?wave=${Math.max(0, i)}`;
      },
    },
    {
      game: 'takingaway',
      minXp: 0,
      ready: (p2) => takingAwayReady(p2),
      gate: () => ({ icon: '➕', have: 0, need: 1 }),
      caption: 'Taking away',
      art: `<span class="tile-art">➖</span><span class="tile-mark">${WAVES[0].emoji}</span>`,
      href: (p2) => {
        const i = WAVES.findIndex((w, ix) => subWaveUnlocked(p2, ix) && !isSubWaveMastered(p2, ix));
        return `/quiz?swave=${Math.max(0, i)}`;
      },
    },
  ];
}

// Which game feeds each little milestone (home goal card taps into it).
const GOALS_GAME_BY_MILESTONE = {
  count3: 'count',
  count5: 'count',
  look: 'look',
  bond5: 'bond',
  bond10: 'bond',
  teen: 'teen',
  type: 'type',
  taway: 'taway',
  paths: 'paths',
  trace: 'trace',
  counton: 'counton',
  groups: 'groups',
};

export function littleHomeScreen(el, params, ctx) {
  // A transitioning kid with childCanSwitch can hop to the big-kid home.
  ctx.session.bigView = false;
  const p = ctx.profile;
  const buddy = avatarFor(p);
  el.innerHTML = `
    <div class="screen little-screen">
      <div class="hero little-hero">
        <span class="avatar">${buddy.svg(96)}${
          toysOn(p, buddy.id).length
            ? `<span class="buddy-toys">${toysOn(p, buddy.id)
                .slice(0, 3)
                .map((id) => toySVG(id, 26))
                .join('')}</span>`
            : ''
        }</span>
        <div>
          <h1>Hi, ${escapeHtml(p.name)}!</h1>
        </div>
      </div>
      <div class="little-tiles"></div>
      <div class="nav-row little-nav" style="margin-top:auto">
        <button class="btn ghost small" data-piggy aria-label="Piggy bank">🐷 ${formatPaw(balanceCents(p))}</button>
        ${p.petUnlocks?.length ? '<button class="btn ghost small" data-corner aria-label="Cozy Corner">🏡</button>' : ''}
        ${p.subjects?.childCanSwitch ? '<button class="btn ghost small" data-big-view aria-label="Big kid games">🧮➡️</button>' : ''}
        <button class="btn ghost small" data-nav="/profiles" aria-label="Switch player">👥</button>
        <button class="btn ghost small" data-nav="/grownups" aria-label="Grown-ups">🔒</button>
      </div>
    </div>`;

  el.querySelector('[data-piggy]')?.addEventListener('click', () => {
    sfx.coin();
    const cents = balanceCents(p);
    const bucks = Math.floor(cents / 100);
    const rest = cents % 100;
    // Spoken, so both halves have to agree with their own number AND a zero
    // half has to disappear: "1 paw cent", "1 paw buck" (not "…and 0 paw
    // cents"), "2 paw bucks and 11 paw cents".
    const parts = [];
    if (bucks) parts.push(`${bucks} paw ${plural(bucks, 'buck')}`);
    if (rest) parts.push(`${rest} paw ${plural(rest, 'cent')}`);
    say(cents ? `You saved ${parts.join(' and ')}!` : 'Your piggy bank is ready for coins!');
  });
  el.querySelector('[data-corner]')?.addEventListener('click', () => navigate('/corner'));
  el.querySelector('[data-big-view]')?.addEventListener('click', () => {
    ctx.session.bigView = true;
    navigate('/home');
  });

  // Games appear as the little pup grows; one sparkly mystery tile hints at
  // the next unlock without pressuring.
  const xp = p.little?.xp ?? 0;
  const grid = el.querySelector('.little-tiles');
  const all = tiles(p, buddy);
  // The ratchet: once a tile has EVER been ready it stays on the shelf —
  // tanked streaks (a bored 3-year-old tapping wrong on purpose) can
  // shrink the numbers served, never the games owned.
  const liveReady = (t) => (t.ready ? t.ready(p) : xp >= t.minXp);
  const freshTiles = ratchetReveals(
    p,
    all.filter(liveReady).map((t) => `tile:${t.game}`)
  );
  if (freshTiles.length) {
    ctx.save();
    confetti(12);
    const newest = all.find((t) => `tile:${t.game}` === freshTiles[freshTiles.length - 1]);
    if (newest) cheer(`A new game! ${newest.caption}`);
  }
  const isReady = (t) => isRevealed(p, `tile:${t.game}`);
  const readyTiles = all.filter(isReady);
  // "Play!" hero: the most valuable game right now, front and huge.
  const pick = littleSuggestNext(p, readyTiles);
  if (pick) {
    const hero = document.createElement('button');
    hero.className = 'little-tile play-next';
    hero.dataset.game = pick.game;
    hero.setAttribute('aria-label', `Play ${pick.caption}`);
    hero.innerHTML = `<span class="play-arrow">▶️</span>${pick.art}<span class="tile-caption">${pick.caption}</span>`;
    hero.addEventListener('click', () => navigate(`/little?game=${pick.game}`));
    grid.appendChild(hero);
  }
  for (const t of readyTiles) {
    const btn = document.createElement('button');
    btn.className = `little-tile${pick && t.game === pick.game ? ' picked' : ''}`;
    btn.dataset.game = t.game;
    btn.setAttribute('aria-label', t.caption);
    btn.innerHTML = `${pick && t.game === pick.game ? '<span class="paw-badge">🐾</span>' : ''}${t.art}<span class="tile-caption">${t.caption}</span>`;
    btn.addEventListener('click', () =>
      navigate(t.href ? t.href(p) : `/little?game=${t.game}`)
    );
    grid.appendChild(btn);
  }
  // Next friend: the pet the child is closest to, with a meter that only
  // correct answers move — the home-screen anchor for "why answers matter".
  {
    const goal = nextPetGoal(p);
    if (goal && goal.need != null) {
      const card = document.createElement('button');
      card.className = 'goal-card';
      card.setAttribute('aria-label', `Next friend: ${goal.have} of ${goal.need}`);
      card.innerHTML = `<span class="goal-pet">${petSVG(goal.pet, 44)}</span>
        <span class="goal-text"><span class="tile-caption">New friend! 🐾</span>
        <span class="meter mini goal-meter"><span style="width:${Math.round((goal.have / goal.need) * 100)}%"></span></span>
        <span class="tile-mark">${goal.have}/${goal.need}</span></span>`;
      const target = GOALS_GAME_BY_MILESTONE[goal.id];
      if (target) card.addEventListener('click', () => navigate(`/little?game=${target}`));
      grid.appendChild(card);
    }
  }
  const upcoming = all.find((t) => !isReady(t));
  if (upcoming) {
    // Goal preview instead of a mute sparkle: the locked game's own art,
    // dimmed, with a reward chip showing which game feeds it and how close
    // it is (v1.9.0 pattern — mechanics are shown, never explained).
    const gate = upcoming.gate
      ? upcoming.gate(p)
      : { icon: '⭐', have: Math.min(xp, upcoming.minXp), need: upcoming.minXp };
    const pct = Math.round((gate.have / Math.max(1, gate.need)) * 100);
    const soon = document.createElement('div');
    soon.className = 'little-tile soon';
    soon.setAttribute('aria-label', `${upcoming.caption} unlocks soon — ${gate.have} of ${gate.need}`);
    soon.innerHTML = `<span class="soon-art">${upcoming.art}</span>
      <span class="tile-caption">✨ ···</span>
      <span class="reward-chip">${gate.icon}
        <span class="meter mini"><span style="width:${pct}%"></span></span>
        <span class="tile-mark">${gate.have}/${gate.need}</span></span>`;
    grid.appendChild(soon);
  }
  for (const b of el.querySelectorAll('[data-nav]')) {
    b.addEventListener('click', () => navigate(b.dataset.nav));
  }
}

export function littleGameScreen(el, params, ctx) {
  const p = ctx.profile;
  const little = ensureLittle(p);
  const game = Object.keys(QUESTIONS_BY_GAME).includes(params.get('game'))
    ? params.get('game')
    : 'count';
  const QUESTIONS = QUESTIONS_BY_GAME[game];
  const buddy = avatarFor(p);
  let index = 0;
  let busy = false;
  let firstTry = true;
  let lastSpoken = '';
  let inputReadyAt = 0;
  const roundCoins = [];

  const speak = (text) => {
    lastSpoken = text;
    say(text);
  };

  el.innerHTML = `
    <div class="screen little-screen little-lock">
      <div class="topbar">
        <button class="btn ghost small" data-quit aria-label="Stop">✕</button>
        <span class="spacer"></span>
        <span class="quiz-progress">${'<span class="paw">🐾</span>'.repeat(QUESTIONS)}</span>
      </div>
      <div class="little-prompt-row">
        <button class="say-again" data-say aria-label="Hear it again">🔊</button>
        <span class="little-prompt"></span>
        <span class="pet-goal" data-pet-goal hidden></span>
      </div>
      <div class="little-stage"></div>
      <div class="little-choices"></div>
      <div class="feedback center little-fb"></div>
    </div>`;
  const paws = [...el.querySelectorAll('.paw')];
  const goalEl = el.querySelector('[data-pet-goal]');
  // The next-friend meter: THIS game's own pet when it still has one,
  // else the overall next friend. Correct answers visibly move it —
  // that's the whole point (shown, not explained).
  let goalHave = -1;
  function renderGoal(justCorrect = false) {
    const g = stageEl.dataset.game ?? game;
    const goal = gameGoal(p, g) ?? nextPetGoal(p);
    if (!goal || goal.need == null) {
      goalEl.hidden = true;
      return;
    }
    const grew = goal.have > goalHave && goalHave >= 0;
    goalHave = goal.have;
    goalEl.hidden = false;
    goalEl.innerHTML = `<span class="goal-pet">${petSVG(goal.pet, 34)}</span>
      <span class="meter mini goal-meter"><span style="width:${Math.round((goal.have / goal.need) * 100)}%"></span></span>`;
    if (grew) {
      goalEl.classList.remove('pop');
      void goalEl.offsetWidth;
      goalEl.classList.add('pop'); // a step CLOSER to the friend — big tick
      sfx.correct();
    } else if (justCorrect) {
      goalEl.classList.remove('nudge');
      void goalEl.offsetWidth;
      goalEl.classList.add('nudge'); // the paw stamp: correct = motion
    }
  }
  const promptEl = el.querySelector('.little-prompt');
  const stageEl = el.querySelector('.little-stage');
  const choicesEl = el.querySelector('.little-choices');
  const fbEl = el.querySelector('.little-fb');
  el.querySelector('[data-say]').addEventListener('click', () => say(lastSpoken));

  // `onPick` lets a game handle its own taps: `groups` asks three parts
  // inside ONE item, so its first two parts must advance to the next part
  // instead of finishing the question.
  function choiceButton(html, correct, cls = '', onPick = null) {
    const btn = document.createElement('button');
    btn.className = `little-card ${cls}`;
    btn.dataset.good = correct ? '1' : '0';
    btn.innerHTML = html;
    btn.addEventListener('click', () => (onPick ?? onChoice)(btn, correct));
    choicesEl.appendChild(btn);
  }

  // Surprise rounds sample the child's own revealed games; everything
  // downstream (skills, recounts, praise) follows the EFFECTIVE game via
  // stageEl.dataset.game.
  const SURPRISE_POOL = ['count', 'find', 'more', 'next', 'add', 'look', 'bond', 'teen', 'taway'];

  function newQuestion() {
    const g =
      game === 'surprise'
        ? (() => {
            const pool = SURPRISE_POOL.filter((x) => isRevealed(p, `tile:${x}`));
            return pool[ri(pool.length)] ?? 'count';
          })()
        : game;
    const range = rangeFor(p, SKILL_GAMES.has(g) ? g : 'count');
    fbEl.textContent = '';
    // the settle delay: little hands are still tapping when the next
    // question appears - ignore input for a beat (the round's first
    // question has no previous answer to carry taps over from)
    inputReadyAt = index > 0 ? performance.now() + 600 : 0;
    stageEl.innerHTML = '';
    delete stageEl.dataset.teachOnly;
    choicesEl.innerHTML = '';
    choicesEl.className = 'little-choices';

    stageEl.dataset.game = g;
    renderGoal();
    const forced = params.get('v');
    if (g === 'count') {
      const n = pickN(little, 'count', range);
      const barks = forced ? forced === 'barks' : ri(10) < 3;
      if (barks) {
        // Bark counting: nothing to see — the buddy barks n times and the
        // child counts by EAR (same count:n skill, different sense).
        // the buddy makes ITS OWN sound — a cat buddy meows, and the
        // question says "meows" (number–noun agreement, vocab canon)
        const voice = buddy.kind === 'pet' ? buddy.species : 'dog';
        promptEl.textContent = '👂❓';
        speak(`Listen! How many ${soundWord(voice)}?`);
        stageEl.dataset.answer = n;
        stageEl.dataset.voice = voice;
        stageEl.innerHTML = `<button class="bark-dog" aria-label="Hear the ${soundWord(voice)} again">${buddy.svg(110)}</button>`;
        busy = true; // input stays blocked from render until the barks end
        const playBarks = () => {
          busy = true;
          for (let i = 0; i < n; i++) setTimeout(() => critterSound(voice, buddy.id), 600 + i * 620);
          setTimeout(() => {
            busy = false;
          }, 600 + n * 620);
        };
        stageEl.querySelector('.bark-dog').addEventListener('click', () => {
          if (!busy) playBarks();
        });
        setTimeout(playBarks, 300);
        for (const v of pickCounts(n, range)) {
          choiceButton(`<span class="little-numeral">${v}</span>`, v === n);
        }
        return;
      }
      const item = ITEMS[ri(ITEMS.length)];
      promptEl.textContent = `${item}❓`;
      speak('How many?');
      stageEl.innerHTML = `<div class="little-items${n > 6 ? ' many' : ''}">${itemRow(item, n)}</div>`;
      for (const v of pickCounts(n, range)) {
        choiceButton(`<span class="little-numeral">${v}</span>`, v === n);
      }
      stageEl.dataset.answer = n;
    } else if (g === 'find') {
      const n = pickN(little, 'find', range);
      const item = ITEMS[ri(ITEMS.length)];
      const ears = forced ? forced === 'ears' : ri(10) < 3;
      promptEl.textContent = ears ? '👂🔍' : '🔍❓';
      speak(`Find ${WORDS[n]}!`);
      // ears: no numeral shown — listening alone carries the target
      stageEl.innerHTML = ears
        ? `<div class="little-numeral big">🔊</div>`
        : `<div class="little-numeral big">${n}</div>`;
      choicesEl.classList.add('stacked');
      for (const v of pickCounts(n, range)) {
        choiceButton(`<span class="little-items small">${itemRow(item, v)}</span>`, v === n);
      }
      stageEl.dataset.answer = n;
    } else if (g === 'tap') {
      // Tap-to-count: one-to-one correspondence — tap each item, the count
      // speaks and grows, no choices and no way to be wrong.
      const n = 1 + ri(range);
      const item = ITEMS[ri(ITEMS.length)];
      promptEl.textContent = `👆${item}`;
      speak('Tap and count!');
      stageEl.dataset.answer = n;
      stageEl.innerHTML = `<div class="tap-count">&nbsp;</div>
        <div class="little-items${n > 6 ? ' many' : ''} tap-items">${Array.from(
          { length: n },
          () => `<button class="tap-item">${item}</button>`
        ).join('')}</div>`;
      let tapped = 0;
      for (const b of stageEl.querySelectorAll('.tap-item')) {
        b.addEventListener('click', () => {
          if (busy || b.classList.contains('popped') || performance.now() < inputReadyAt) return;
          b.classList.add('popped');
          tapped += 1;
          stageEl.querySelector('.tap-count').textContent = tapped;
          buzz(15);
          say(WORDS[tapped]);
          if (tapped === n) celebrate(null, { speakWord: false });
        });
      }
    } else if (g === 'feed') {
      // Feed the puppy N: counting OUT a quantity — tap bones into the bowl
      // until the buddy has enough.
      const n = forced === 'one' ? 1 : 1 + ri(range); // v=one: test hook
      const food = foodFor(buddy);
      const RECEIVERS = [
        { icon: '🥣', item: food, line: (w, n2) => `Feed ${buddy.name} ${w} ${wordFor(food, n2)}!` },
        { icon: '🧸', item: '🎾', line: (w, n2) => `Put ${w} ${plural(n2, 'toy')} in the toy box!` },
        { icon: '🌼', item: '💧', line: (w, n2) => `Water ${w} ${plural(n2, 'flower')}!` },
      ];
      const recv = RECEIVERS[forced === 'bowl' || forced === 'one' ? 0 : ri(RECEIVERS.length)];
      promptEl.textContent = `${recv.item}➡️${recv.icon}`;
      speak(recv.line(WORDS[n], n));
      stageEl.dataset.answer = n;
      stageEl.innerHTML = `<div class="feed-row">${buddy.svg(52)}
          <span class="little-numeral">${n}</span><span class="feed-bowl">${recv.icon}</span>
          <span class="tap-count">0</span></div>
        <div class="little-items tap-items feed-items">${Array.from(
          { length: n + 2 },
          () => `<button class="tap-item">${recv.item}</button>`
        ).join('')}</div>
        <button class="btn little-icon-btn feed-done" aria-label="All done">✅</button>`;
      // The child decides when the bowl is right: bones toggle in and out,
      // ✅ serves it. Confirming the wrong count is a real (gentle) miss —
      // before, the game auto-ended at n and could never be wrong.
      let fed = 0;
      for (const b of stageEl.querySelectorAll('.tap-item')) {
        b.addEventListener('click', () => {
          if (busy || performance.now() < inputReadyAt) return;
          const taking = b.classList.contains('popped');
          b.classList.toggle('popped');
          fed += taking ? -1 : 1;
          stageEl.querySelector('.tap-count').textContent = fed;
          buzz(15);
          say(WORDS[fed] ?? String(fed));
        });
      }
      stageEl.querySelector('.feed-done').addEventListener('click', () => {
        if (busy || performance.now() < inputReadyAt) return;
        if (fed === n) {
          celebrate(null, { speakWord: false });
          return;
        }
        firstTry = false;
        sfx.wrong();
        fbEl.textContent = '🐾';
        const btn = stageEl.querySelector('.feed-done');
        btn.classList.add('shake');
        setTimeout(() => btn.classList.remove('shake'), 450);
        say(
          fed < n
            ? `${WORDS[fed] ?? fed} so far — ${buddy.name} needs ${WORDS[n]}!`
            : `That's ${WORDS[fed] ?? fed} — too many! ${buddy.name} needs ${WORDS[n]}.`
        );
      });
    } else if (g === 'shape') {
      // Shapes with Whiskers: wordless geometry — find the spoken shape.
      const host = hostFor(p, 'shape');
      const defs = [...SHAPE_DEFS].sort(() => Math.random() - 0.5).slice(0, 3);
      const target = defs[ri(defs.length)];
      // One color for every choice: shape is the only thing that varies.
      const col = SHAPE_COLORS[ri(SHAPE_COLORS.length)];
      promptEl.innerHTML = `${hostArt(p, host)} 🔍`;
      speak(`Find the ${target.word}!`);
      stageEl.dataset.answer = -1;
      stageEl.innerHTML = `<div class="host-spot">${hostArt(p, host, 60)}</div>`;
      for (const def of defs) {
        choiceButton(shapeSVG(def, col), def === target);
      }
    } else if (g === 'pattern') {
      // Patterns with Sheldon: one dimension at a time. Early questions vary
      // only shape, then only color; two dimensions change together (the
      // hardest discrimination) only at the end of a round.
      const host = hostFor(p, 'pattern');
      const stage = index <= 1 ? 'shape' : index === 2 ? 'color' : index === 3 ? 'aab' : 'mixed';
      const defs = [...SHAPE_DEFS].sort(() => Math.random() - 0.5);
      const cols = [...SHAPE_COLORS].sort(() => Math.random() - 0.5);
      let A, B, options;
      if (stage === 'shape' || stage === 'aab') {
        A = [defs[0], cols[0]];
        B = [defs[1], cols[0]];
        options = [defs[2], cols[0]]; // third shape, same color
      } else if (stage === 'color') {
        A = [defs[0], cols[0]];
        B = [defs[0], cols[1]];
        options = [defs[0], cols[2]]; // same shape, third color
      } else {
        A = [defs[0], cols[0]];
        B = [defs[1], cols[1]];
        options = [defs[0], cols[1]]; // right shape, wrong color
      }
      // AAB shows A A B A A ❓ (answer B); the rest show A B A B ❓ (answer A).
      const seq = stage === 'aab' ? [A, A, B, A, A] : [A, B, A, B];
      const answer = stage === 'aab' ? B : A;
      const wrong = answer === A ? B : A;
      promptEl.innerHTML = `${hostArt(p, host)} ➡️❓`;
      speak('What comes next?');
      stageEl.dataset.answer = -1;
      stageEl.innerHTML = `<div class="pattern-row">${seq
        .map(([d, c]) => shapeSVG(d, c, stage === 'aab' ? 34 : 40))
        .join('')}<span class="pattern-q">❓</span></div>`;
      const choices = [
        { html: shapeSVG(answer[0], answer[1]), good: true },
        { html: shapeSVG(wrong[0], wrong[1]), good: false },
        { html: shapeSVG(options[0], options[1]), good: false },
      ].sort(() => Math.random() - 0.5);
      for (const o of choices) choiceButton(o.html, o.good);
    } else if (g === 'next') {
      // What comes next? — number path with Kiwi the bird.
      const host = hostFor(p, 'next');
      const s0 = 1 + ri(Math.max(1, range - 3));
      const answer = s0 + 3;
      promptEl.innerHTML = `${hostArt(p, host)} ➡️❓`;
      speak('What comes next?');
      stageEl.dataset.answer = answer;
      stageEl.innerHTML = `<div class="pattern-row">${[s0, s0 + 1, s0 + 2]
        .map((v) => `<span class="path-num">${v}</span>`)
        .join('<span class="path-paw">🐾</span>')}<span class="path-paw">🐾</span><span class="pattern-q">❓</span></div>`;
      for (const v of pickCounts(answer, Math.max(range, answer))) {
        choiceButton(`<span class="little-numeral">${v}</span>`, v === answer);
      }
    } else if (g === 'add') {
      // Adding within 5 (10 later) with Peanut the guinea pig — two groups
      // of things, one number.
      const host = hostFor(p, 'add');
      const maxSum = [2, 3, 4, 5].every((v) => knows(little, 'add', v)) ? 10 : 5;
      const a = 1 + ri(maxSum - 1);
      const b = 1 + ri(maxSum - a);
      const story = forced ? forced === 'story' : ri(10) < 3;
      const item = story ? '🐶' : ITEMS[ri(ITEMS.length)];
      promptEl.innerHTML = story ? '🏞️ ➕' : `${hostArt(p, host)} ➕`;
      speak(
        story
          ? `${WORDS[a]} ${plural(a, 'pup')} ${verb(a, 'was', 'were')} playing at the park... ${WORDS[b]} more came! How many now?`
          : `${WORDS[a]} plus ${WORDS[b]}!`
      );
      stageEl.dataset.answer = a + b;
      stageEl.innerHTML = `<div class="pattern-row add-row">
        <span class="little-items small${a > 5 ? ' many' : ''}">${itemRow(item, a)}</span>
        <span class="pattern-q">➕</span>
        <span class="little-items small${b > 5 ? ' many' : ''}">${itemRow(item, b)}</span>
        <span class="pattern-q">=</span><span class="pattern-q">❓</span></div>`;
      for (const v of pickCounts(a + b, Math.max(maxSum, a + b))) {
        choiceButton(`<span class="little-numeral">${v}</span>`, v === a + b);
      }
    } else if (g === 'type') {
      // Type it!: the numpad bridge — a numeral shows and speaks, the child
      // types it (two digits for teens = early place value + keypad
      // fluency, the entry skill every wave round assumes).
      const decades = knows(little, 'path', 10);
      const hi = knowsRange(little, 'type', 1, 10) ? 19 : rangeFor(p, 'type');
      let n = pickN(little, 'type', hi);
      if (decades && Math.random() < 0.3) n = (2 + ri(8)) * 10; // 20..90
      promptEl.textContent = '⌨️';
      speak(`Type ${n <= 10 ? WORDS[n] : n}!`);
      stageEl.dataset.answer = n;
      stageEl.innerHTML = `<div class="little-numeral big type-target">${n}</div>
        <div class="type-entry little-numeral">&nbsp;</div>
        <div class="numpad little-numpad"></div>`;
      const entry = stageEl.querySelector('.type-entry');
      let input = '';
      buildNumpad(stageEl.querySelector('.numpad'), (k) => {
        if (busy || performance.now() < inputReadyAt) return;
        if (k === 'ok') {
          if (!input) return;
          if (Number(input) === n) {
            celebrate(null, { speakWord: false });
          } else {
            firstTry = false;
            input = '';
            entry.textContent = ' ';
            entry.classList.add('shake');
            setTimeout(() => entry.classList.remove('shake'), 400);
            sfx.wrong();
            say(`Type ${n <= 10 ? WORDS[n] : n}!`);
          }
          return;
        }
        if (k === 'del') input = input.slice(0, -1);
        else if (input.length < 2) input += k;
        entry.textContent = input || ' ';
        buzz(10);
      });
    } else if (g === 'trace') {
      // Trace it!: numeral formation. The digit is a thick finger-wide
      // guide with a green GO dot; strokes accumulate until they cover
      // most of the guide (gentle judge — wobbles welcome, no order
      // rules, no wrong answers: an incomplete trace just keeps going).
      const range = rangeFor(p, 'trace');
      const n =
        forced && /^[1-9]$/.test(forced) ? Number(forced) : 1 + ri(Math.min(9, range));
      promptEl.textContent = '✏️';
      speak(`Trace the ${WORDS[n]}!`);
      stageEl.dataset.answer = n;
      stageEl.innerHTML = `<div class="trace-wrap">${digitGuideSVG(n, 260)}</div>`;
      const svg = stageEl.querySelector('.trace-svg');
      const SVGNS = 'http://www.w3.org/2000/svg';
      const pts = [];
      let poly = null;
      let drawing = false;
      const toLocal = (e) => {
        const r = svg.getBoundingClientRect();
        return [((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100];
      };
      const extend = (e) => {
        const pt = toLocal(e);
        pts.push(pt);
        poly.setAttribute('points', `${poly.getAttribute('points')} ${pt[0].toFixed(1)},${pt[1].toFixed(1)}`);
      };
      svg.addEventListener('pointerdown', (e) => {
        if (busy || performance.now() < inputReadyAt) return;
        e.preventDefault();
        drawing = true;
        svg.setPointerCapture(e.pointerId);
        poly = document.createElementNS(SVGNS, 'polyline');
        poly.setAttribute('class', 'trace-line');
        poly.setAttribute('points', '');
        svg.appendChild(poly);
        extend(e);
      });
      svg.addEventListener('pointermove', (e) => {
        if (!drawing || busy) return;
        e.preventDefault();
        extend(e);
      });
      const finishStroke = () => {
        if (!drawing) return;
        drawing = false;
        if (busy) return;
        if (tracePasses(n, pts)) {
          svg.classList.add('trace-done');
          celebrate(null);
        } else if (traceCoverage(n, pts) > 0.25) {
          fbEl.textContent = '🐾';
          say('Keep going!');
        }
      };
      svg.addEventListener('pointerup', finishStroke);
      svg.addEventListener('pointercancel', finishStroke);
    } else if (g === 'taway') {
      // Take away!: the concrete stage of subtraction — n bones, some hop
      // away before their eyes, how many are left?
      const n = 2 + ri(9); // 2..10 start
      const gone = 1 + ri(n - 1); // 1..n-1 leave (0-left needs abstraction)
      const left = n - gone;
      const story = forced ? forced === 'story' : ri(10) < 3;
      const item = story ? '🐶' : ITEMS[ri(ITEMS.length)];
      promptEl.textContent = story ? '🏞️➡️💤' : '🥣➡️';
      speak(
        story
          ? `${WORDS[n]} ${plural(n, 'pup')} at the park... ${WORDS[gone]} went home for a nap! How many are still playing?`
          : `${WORDS[n]} ${wordFor(item, n)}... ${WORDS[gone]} ${gone === 1 ? 'hops' : 'hop'} away! How many are left?`
      );
      stageEl.dataset.answer = left;
      stageEl.dataset.skill = `takeaway:${left}`;
      stageEl.innerHTML = `<div class="little-items">${Array.from(
        { length: n },
        (_, i) => `<span class="li${i >= left ? ' gone' : ''}">${item}</span>`
      ).join('')}</div>`;
      setTimeout(() => {
        for (const li of stageEl.querySelectorAll('.li.gone')) li.classList.add('hopped');
      }, 900);
      for (const v of pickCounts(left === 0 ? 1 : left, Math.max(3, n))) {
        choiceButton(`<span class="little-numeral">${v}</span>`, v === left);
      }
    } else if (g === 'paths') {
      // Counting Paths: skip-count chains for 2s/5s/10s — plus descending
      // paths (counting backward, subtraction's engine). Typed once the
      // child can type; tap-choices before that.
      // v1.51.0: 3s and 4s joined the strides when the tables gate began
      // requiring them — ×3 and ×4 previously had no chain to practise.
      const STRIDES = [2, 3, 4, 5, 10];
      const DESCENDING = STRIDES.length; // the one kind that isn't a stride
      const kind2 = ri(STRIDES.length + 1);
      const stride = STRIDES[Math.min(kind2, STRIDES.length - 1)];
      let seq, answer, skill;
      if (kind2 === DESCENDING) {
        const s0 = 5 + ri(5); // 9..5 start high enough
        seq = [s0 + 3, s0 + 2, s0 + 1];
        answer = s0;
        skill = null; // descending is enrichment, not gated
      } else {
        const k = 1 + ri(3);
        seq = [k * stride, (k + 1) * stride, (k + 2) * stride];
        answer = (k + 3) * stride;
        skill = `path:${stride}`;
      }
      promptEl.textContent = '🐾➡️❓';
      speak(kind2 === DESCENDING ? 'Count backward! What comes next?' : `Count by ${stride}s!`);
      stageEl.dataset.answer = answer;
      if (skill) stageEl.dataset.skill = skill;
      else delete stageEl.dataset.skill;
      stageEl.innerHTML = `<div class="pattern-row">${seq
        .map((v) => `<span class="path-num">${v}</span>`)
        .join('<span class="path-paw">🐾</span>')}<span class="path-paw">🐾</span><span class="pattern-q">❓</span></div>`;
      if (knowsRange(little, 'type', 1, 10)) {
        stageEl.innerHTML += `<div class="type-entry little-numeral">&nbsp;</div><div class="numpad little-numpad"></div>`;
        const entry = stageEl.querySelector('.type-entry');
        let input = '';
        buildNumpad(stageEl.querySelector('.numpad'), (k) => {
          if (busy || performance.now() < inputReadyAt) return;
          if (k === 'ok') {
            if (!input) return;
            if (Number(input) === answer) celebrate(null, { speakWord: false });
            else {
              firstTry = false;
              input = '';
              entry.textContent = ' ';
              sfx.wrong();
            }
            return;
          }
          if (k === 'del') input = input.slice(0, -1);
          else if (input.length < 2) input += k;
          entry.textContent = input || ' ';
        });
      } else {
        const opts = new Set([answer]);
        while (opts.size < 3) opts.add(Math.max(1, answer + (ri(2) ? stride || 1 : -(stride || 1)) * (1 + ri(2))));
        for (const v of [...opts].sort(() => Math.random() - 0.5)) {
          choiceButton(`<span class="little-numeral">${v}</span>`, v === answer);
        }
      }
    } else if (g === 'look') {
      // Quick Look: the frame flashes, then hides — quick eyes, no counting.
      // Representations rotate: ten-frame, dice pattern, paw pads —
      // subitizing across arrangements is the actual skill.
      const n = pickN(little, 'look', rangeFor(p, 'look'));
      const rep = forced ?? (n <= 6 ? ['frame', 'dice', 'paws'][ri(3)] : 'frame');
      const item = rep === 'paws' ? '🐾' : ITEMS[ri(ITEMS.length)];
      promptEl.textContent = '👀⚡';
      speak('Quick look! How many?');
      stageEl.dataset.answer = n;
      const DICE = {
        1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
      };
      const body =
        (rep === 'dice' || rep === 'paws') && DICE[n]
          ? `<div class="dice-grid">${Array.from({ length: 9 }, (_, i) =>
              DICE[n].includes(i) ? `<span class="li">${item}</span>` : '<span class="li empty-cell"></span>'
            ).join('')}</div>`
          : `<div class="little-items">${itemRow(item, n)}</div>`;
      stageEl.innerHTML = `${body}
        <div class="look-veil little-numeral big" hidden>❓</div>`;
      // Quick eyes only: answering is blocked until the frame hides, so
      // counting it item-by-item can't stand in for subitizing.
      busy = true;
      setTimeout(() => {
        const frame = stageEl.querySelector('.little-items, .dice-grid');
        const veil = stageEl.querySelector('.look-veil');
        if (frame && veil) {
          frame.hidden = true;
          veil.hidden = false;
        }
        busy = false;
      }, 1400);
      for (const v of pickCounts(n, rangeFor(p, 'look'))) {
        choiceButton(`<span class="little-numeral">${v}</span>`, v === n);
      }
    } else if (g === 'bond') {
      // Number friends: the missing part of 5, then of 10 once 5 is known.
      // Presentation follows CRA: pictures only at first, numerals as
      // mastery grows — concrete → representational → abstract.
      const whole = knowsRange(little, 'bond5', 0, 5) ? 10 : 5;
      const knownParts = Array.from({ length: whole + 1 }, (_, k) => k).filter((k) =>
        knows(little, `bond${whole}`, k)
      ).length;
      // pictures teach (the empty cells SHOW the answer, so first-tries
      // there prove frame-reading, not recall): attempts move the ladder
      // to the mixed stage, where streaks start counting.
      const bondAttempts = Object.entries(little.skills)
        .filter(([k]) => k.startsWith(`bond${whole}:`))
        .reduce((s, [, v]) => s + v.attempts, 0);
      const stage =
        bondAttempts < 6
          ? 'pictures'
          : knownParts < Math.ceil(((whole + 1) * 2) / 3)
            ? 'mixed'
            : 'numbers';
      if (stage === 'pictures') stageEl.dataset.teachOnly = '1';
      // picture stages skip the empty/full frames (0 needs the abstraction)
      const missing =
        stage === 'numbers' ? ri(whole + 1) : 1 + ri(whole - 1);
      const have = whole - missing;
      const item = ITEMS[ri(ITEMS.length)];
      promptEl.textContent = `🤝${whole}`;
      speak(`${WORDS[have]} and how many more make ${WORDS[whole]}?`);
      stageEl.dataset.answer = missing;
      stageEl.dataset.skill = `bond${whole}:${missing}`;
      if (stage === 'numbers') {
        stageEl.innerHTML = `<div class="pattern-row add-row">
          <span class="little-numeral">${have}</span>
          <span class="pattern-q">➕</span><span class="pattern-q">❓</span>
          <span class="pattern-q">=</span><span class="little-numeral">${whole}</span></div>`;
      } else if (forced ? forced === 'cup' : ri(10) < 4) {
        // The cup game: same missing part, more theater — some bones are
        // HIDING under the bowl. (Doesn't show the answer as empty cells,
        // so it verifies rather than teaches: no teach-only flag.)
        delete stageEl.dataset.teachOnly;
        // Name what is actually on screen: the counting item rotates daily
        // (bones → apples → shells → snowflakes), so a hard-coded "bones"
        // disagreed with the picture — and with its own plural for a theme
        // like 🍓 berries.
        speak(`${WORDS[whole]} ${wordFor(item, whole)}... but some are hiding under the bowl! How many are hiding?`);
        stageEl.innerHTML = `<div class="pattern-row"><span class="little-numeral">${whole}</span><span class="pattern-q">${item}</span></div>
          <div class="little-items">${itemRow(item, have)}<span class="li cup cup-w${Math.min(missing, 3)}">🥣</span></div>`;
      } else {
        // the frame itself shows the story: filled cells + empty cells;
        // the symbolic equation row only joins at the mixed stage
        const cells = Array.from(
          { length: whole },
          (_, i) => `<span class="li${i < have ? '' : ' empty'}">${i < have ? item : ''}</span>`
        ).join('');
        stageEl.innerHTML = `<div class="little-items">${cells}</div>${
          stage === 'mixed'
            ? `<div class="pattern-row"><span class="little-numeral">${have}</span>
          <span class="pattern-q">➕</span><span class="pattern-q">❓</span>
          <span class="pattern-q">=</span><span class="little-numeral">${whole}</span></div>`
            : ''
        }`;
      }
      for (const v of pickCounts(missing === 0 ? 1 : missing, whole)) {
        const good = v === missing;
        if (stage === 'pictures') {
          choiceButton(`<span class="little-items small">${itemRow(item, v)}</span>`, good);
        } else {
          choiceButton(`<span class="little-numeral">${v}</span>`, good);
        }
      }
      if (missing === 0 && ![...choicesEl.children].some((c) => c.dataset.good === '1')) {
        choicesEl.children[ri(choicesEl.children.length)].remove();
        choiceButton('<span class="little-numeral">0</span>', true);
      }
    } else if (g === 'counton') {
      // Count on! The number sequence past nineteen (1.NBT.1). Two
      // fluencies plus one representational bridge, each with its OWN skill
      // namespace so they cannot certify one another:
      //   seq:<d>   what follows 29, 39, … — the crossings where children
      //             actually stall, so questions are aimed AT them rather
      //             than sprinkled uniformly
      //   ten:<r>   counting by tens from an off-decade start (24, 34, 44…),
      //             which is where the tens pattern becomes visible
      //   place:<w> where a number sits (enrichment; added with the number
      //             path in a follow-up — see docs/PEDAGOGY.md §2)
      //
      // Staged so a child meets one idea at a time: crossings first, tens
      // once two crossings are known. Stages advance, never regress.
      const canTens = knows(little, 'seq', 2) && knows(little, 'seq', 3);
      const canPlace = canTens && [1, 2, 3, 4, 5, 6, 7, 8, 9].some((r) => knows(little, 'ten', r));
      const form = canPlace && ri(3) === 0 ? 'place' : canTens && ri(2) ? 'ten' : 'seq';
      let seq;
      let answer;
      let skill;
      if (form === 'seq') {
        // d = the decade being crossed INTO: 2 → 20, 12 → 120
        const unknown = [];
        for (let d = 2; d <= 12; d++) if (!knows(little, 'seq', d)) unknown.push(d);
        const d = unknown.length && Math.random() < 0.7 ? unknown[ri(unknown.length)] : 2 + ri(11);
        const target = d * 10;
        seq = [target - 3, target - 2, target - 1];
        answer = target;
        skill = `seq:${d}`;
        speak(`What comes after ${numberWord(target - 1)}?`);
      } else {
        // r = the ones digit the chain keeps: 24, 34, 44 → 54
        const unknown = [];
        for (let r = 1; r <= 9; r++) if (!knows(little, 'ten', r)) unknown.push(r);
        const r = unknown.length && Math.random() < 0.7 ? unknown[ri(unknown.length)] : 1 + ri(9);
        const start = 10 * (1 + ri(7)) + r; // 11..79, ones digit r
        seq = [start, start + 10, start + 20];
        answer = start + 30;
        skill = `ten:${r}`;
        speak('Count by tens!');
      }
      if (form === 'place') {
        // Where does it SIT? A zoomed four-decade window, graded by decade
        // rather than by exact pixel, so the answer bins are ~90px on a
        // phone instead of 3px. Enrichment: this pays but gates nothing,
        // because the research behind it used a 1–10 board and does not
        // license treating 0–120 placement as a fluency (PEDAGOGY.md §2).
        const unknown = [];
        for (let w = 1; w <= 5; w++) if (!knows(little, 'place', w)) unknown.push(w);
        const w = unknown.length && Math.random() < 0.7 ? unknown[ri(unknown.length)] : 1 + ri(5);
        const [lo, hi] = WINDOWS[w - 1];
        const target = lo + 4 + ri(hi - lo - 7); // inside, never on an end
        promptEl.textContent = '🔢📍❓';
        speak(`Where does ${numberWord(target)} go?`);
        stageEl.dataset.answer = target;
        stageEl.dataset.skill = `place:${w}`;
        stageEl.innerHTML = `<div class="np-wrap">
          ${overviewSVG(lo, hi)}
          ${placementSVG(lo, hi, { target })}
        </div>`;
        const tap = stageEl.querySelector('.np-tap');
        tap.addEventListener('click', (e) => {
          if (busy || performance.now() < inputReadyAt) return;
          const rect = tap.getBoundingClientRect();
          const frac = (e.clientX - rect.left) / rect.width;
          // show where they meant AND where it really goes, either way
          const reveal = (markAt) => {
            stageEl.querySelector('.np-wrap').innerHTML = `${overviewSVG(lo, hi)}
              ${placementSVG(lo, hi, { target, markAt })}`;
          };
          if (placementCorrect(target, frac, lo, hi)) {
            reveal(target);
            celebrate(null, { speakWord: false });
          } else {
            firstTry = false;
            reveal(target);
            sfx.wrong();
            say(`${numberWord(target)} goes here.`);
          }
        });
        return;
      }
      promptEl.textContent = '🔢➡️❓';
      stageEl.dataset.answer = answer;
      stageEl.dataset.skill = skill;
      stageEl.innerHTML = `<div class="pattern-row">${seq
        .map((v) => `<span class="path-num">${v}</span>`)
        .join('<span class="path-paw">🐾</span>')}<span class="path-paw">🐾</span><span class="pattern-q">❓</span></div>`;
      // Typed once the child can type two digits; tap-choices before that.
      if (knowsRange(little, 'type', 1, 10)) {
        stageEl.innerHTML += `<div class="type-entry little-numeral">&nbsp;</div><div class="numpad little-numpad"></div>`;
        const entry = stageEl.querySelector('.type-entry');
        let input = '';
        buildNumpad(stageEl.querySelector('.numpad'), (k) => {
          if (busy || performance.now() < inputReadyAt) return;
          if (k === 'ok') {
            if (!input) return;
            if (Number(input) === answer) celebrate(null, { speakWord: false });
            else {
              firstTry = false;
              input = '';
              entry.textContent = ' ';
              sfx.wrong();
            }
            return;
          }
          if (k === 'del') input = input.slice(0, -1);
          // three digits, because the sequence runs to 120
          else if (input.length < 3) input += k;
          entry.textContent = input || ' ';
        });
      } else {
        // distractors a decade away in each direction — the confusion this
        // game exists to fix is "what comes after 29", so 29+1 vs 29+11
        const opts = new Set([answer]);
        while (opts.size < 3) opts.add(Math.max(1, answer + (ri(2) ? 10 : -10) * (1 + ri(2))));
        for (const v of [...opts].sort(() => Math.random() - 0.5)) {
          choiceButton(`<span class="little-numeral">${v}</span>`, v === answer);
        }
      }
    } else if (g === 'teen') {
      // Teen numbers: ten and some more (K.NBT.1).
      const n = 1 + ri(9);
      const item = ITEMS[ri(ITEMS.length)];
      promptEl.textContent = '🔟➕';
      speak(`Ten and ${WORDS[n]} make what?`);
      stageEl.dataset.answer = 10 + n;
      stageEl.dataset.skill = `teen:${n}`;
      stageEl.innerHTML = `<div class="pattern-row add-row">
        <span class="little-items small many">${itemRow(item, 10)}</span>
        <span class="pattern-q">➕</span>
        <span class="little-items small${n > 5 ? ' many' : ''}">${itemRow(item, n)}</span></div>`;
      const opts = new Set([10 + n]);
      while (opts.size < 3) opts.add(11 + ri(9));
      for (const v of [...opts].sort(() => Math.random() - 0.5)) {
        choiceButton(`<span class="little-numeral">${v}</span>`, v === 10 + n);
      }
    } else if (g === 'groups') {
      // Groups! Equal groups and arrays (2.OA.4). The point is UNITIZING,
      // so one item asks three things about the same picture — how many
      // groups, how many in each, how many altogether — and the identity is
      // the factor pair, not the total. A child who reads "12" off the
      // screen without seeing three fours has not learned this, which is
      // why the total alone can never master an identity.
      //
      // All three parts live inside ONE question so `firstTry` spans them:
      // recordSkill() advances a streak only when firstTry survived, which
      // IS the engine's rule (all three right on the first try). No extra
      // bookkeeping, and the two can't disagree.
      const identity = nextGroupIdentity(p) ?? null;
      const stage = identity ? groupStage(p, identity) : 1;
      const q = buildGroupQuestion(p, identity, stage);
      stageEl.dataset.skill = q.skill;
      stageEl.dataset.answer = q.total;
      // Stage 1 shows the answer sentence, so it can only ever teach —
      // the same dataset flag every errorless stage in this file uses.
      if (q.teachOnly) stageEl.dataset.teachOnly = '1';

      const bowls = Array.from(
        { length: q.groups },
        () => `<span class="group-bowl">${`<span class="li">${q.item}</span>`.repeat(q.size)}</span>`
      ).join('');
      stageEl.innerHTML =
        `<div class="group-array" data-groups="${q.groups}">${bowls}</div>` +
        (q.showSentence ? `<div class="group-sentence">${q.sentence} = ${q.total}</div>` : '');

      let part = 0;
      const askPart = () => {
        const pt = q.parts[part];
        choicesEl.innerHTML = '';
        promptEl.textContent = pt.ask;
        speak(pt.say);
        const last = part === q.parts.length - 1;
        for (const v of pt.choices) {
          choiceButton(
            `<span class="little-numeral">${v}</span>`,
            v === pt.answer,
            '',
            // the LAST part finishes the item through the normal path, so
            // celebrate/recordSkill/next stay exactly as every other game
            last
              ? null
              : (btn, correct) => {
                  if (busy || performance.now() < inputReadyAt) return;
                  if (!correct) return rejectTap(btn);
                  btn.classList.add('win');
                  sfx.correct();
                  buzz(10);
                  part += 1;
                  setTimeout(askPart, 420);
                }
          );
        }
      };
      askPart();
    } else {
      // more: two dogs with bone piles — tap the one with more
      const others = [...DOGS, ...GUESTS].filter((d) => d.id !== buddy.id);
      const rival = others[ri(others.length)];
      const a = 1 + ri(range);
      let b = 1 + ri(range);
      while (b === a) b = 1 + ri(range);
      promptEl.textContent = '🦴🆚🦴';
      speak('Who has more bones?');
      choicesEl.classList.add('duo');
      choiceButton(
        `<span class="dog">${buddy.svg(72)}</span>
         <span class="little-items small">${itemRow('🦴', a)}</span>`,
        a > b
      );
      choiceButton(
        `<span class="dog">${dogSVG(rival, 72)}</span>
         <span class="little-items small">${itemRow('🦴', b)}</span>`,
        b > a
      );
      stageEl.dataset.answer = Math.max(a, b);
    }
  }

  function recordSkill() {
    const g = stageEl.dataset.game ?? game;
    if (!SKILL_GAMES.has(g)) return;
    const n = Number(stageEl.dataset.answer);
    const key = stageEl.dataset.skill ?? (n >= 1 ? `${g}:${n}` : null);
    if (!key) return;
    const sk = (little.skills[key] = little.skills[key] ?? { attempts: 0, streak: 0 });
    sk.attempts += 1;
    if (stageEl.dataset.teachOnly !== '1') {
      sk.streak = firstTry ? sk.streak + 1 : 0;
    }
    // Pay when the skill is genuinely KNOWN, which is not always 3: a
    // two-choice game needs 4 because 3 is guessable. This used to pay at a
    // flat 3, so `more` earned its penny a streak before it counted as
    // learned. The id is deterministic (`skill-<key>`), so a child who was
    // already paid early keeps it — paying later is idempotent, not a claw-back.
    if (sk.streak === (STREAK_NEEDED[key.split(':')[0]] ?? KNOWN_STREAK)) {
      const coin = earnSkillKnown(p, key);
      if (coin) {
        roundCoins.push(coin);
        sfx.coin();
      }
    }
  }

  function celebrate(btn, { speakWord = true } = {}) {
    busy = true;
    if (firstTry) little.xp += 1;
    recordSkill();
    paws[index].classList.add('done');
    if (btn) btn.classList.add('win');
    stageEl.querySelector('.feed-done')?.setAttribute('disabled', '');
    sfx.correct();
    buzz(20);
    fbEl.textContent = `${STARS[ri(STARS.length)]}${STARS[ri(STARS.length)]}`;
    // a hand covers the bottom feedback right after a tap - burst BIG in
    // the middle of the stage where eyes already are
    const burst = document.createElement('div');
    burst.className = 'big-cheer';
    burst.textContent = STARS[ri(STARS.length)];
    stageEl.appendChild(burst);
    const n = Number(stageEl.dataset.answer);
    if (speakWord && n >= 0 && n <= 10) speak(WORDS[n]);
    renderGoal(true);
    setTimeout(next, 1000);
  }

  function guidedRecount(btn) {
    // count: recount the stage items; find: recount the pile the child
    // picked, so they see why it isn't the target.
    const scope = (stageEl.dataset.game ?? game) === 'count' ? stageEl : btn;
    const items = [...scope.querySelectorAll('.li')];
    if (!items.length) {
      say('Try again!');
      return;
    }
    busy = true;
    say("Let's count!");
    items.forEach((item, i) => {
      setTimeout(() => {
        item.classList.add('pulse');
        say(WORDS[i + 1]);
        buzz(10);
        if (i === items.length - 1) {
          setTimeout(() => {
            for (const it of items) it.classList.remove('pulse');
            busy = false;
            const target = Number(stageEl.dataset.answer);
            say((stageEl.dataset.game ?? game) === 'find' ? `Find ${WORDS[target]}!` : 'Now you! How many?');
          }, 800);
        }
      }, 600 + i * 700);
    });
  }

  // Error-less and wordless: the wrong card dims + wobbles, a paw of
  // sympathy appears, and the question waits. Shared, because `groups` asks
  // three parts inside one item and must reject a wrong tap identically —
  // restating these five lines is exactly how two games drift apart.
  function rejectTap(btn, { retry = 'Try again!' } = {}) {
    firstTry = false;
    btn.classList.add('dim');
    btn.classList.add('shake');
    sfx.wrong();
    fbEl.textContent = '🐾';
    if (retry) say(retry);
  }

  function onChoice(btn, correct) {
    if (busy || performance.now() < inputReadyAt) return;
    if (correct) {
      celebrate(btn);
    } else {
      const g2 = stageEl.dataset.game ?? game;
      const recount = GUIDED_RECOUNT && (g2 === 'count' || g2 === 'find');
      rejectTap(btn, { retry: recount ? null : 'Try again!' });
      if (recount) guidedRecount(btn);
    }
  }

  async function next() {
    index += 1;
    busy = false;
    firstTry = true;
    if (index >= QUESTIONS) {
      await finish();
    } else {
      newQuestion();
    }
  }

  async function finish() {
    p.play[buddy.id] = p.play[buddy.id] ?? { walk: 0, feed: 0, fetch: 0 };
    p.play[buddy.id][KIND_BY_GAME[game]] += 1;
    const newPets = checkPetUnlocks(p);
    await ctx.save();
    sfx.celebrate();
    buzz([30, 40, 30]);
    confetti(18);
    if (newPets.length) cheer(`A new friend! ${newPets[0].pet.name} moved into the Cozy Corner!`);
    else cheer(PRAISE_BY_GAME[game]?.[ri(2)] ?? PRAISE_BY_GAME.count[ri(2)]);
    el.querySelector('.little-prompt-row').hidden = true;
    stageEl.hidden = true; // stage would otherwise flex-eat the space above
    fbEl.textContent = '';
    choicesEl.className = 'little-choices finish';
    choicesEl.innerHTML = `
      <div class="card center little-done">
        <div class="dog bounce">${
          newPets.length ? petSVG(newPets[0].pet, 104) : buddy.svg(104)
        }</div>
        ${newPets.length ? '<div class="badge-row" style="justify-content:center"><span class="badge">🏡 New cozy friend!</span></div>' : ''}
        ${roundCoins.length ? `<div class="badge-row" style="justify-content:center"><span class="badge">🐷 ${formatPaw(roundCoins.reduce((s, t) => s + t.cents, 0))} saved!</span></div>` : ''}
        <div class="nav-row" style="margin-top:10px">
          <button class="btn little-icon-btn" data-again aria-label="Play again">🔁</button>
          <button class="btn accent little-icon-btn" data-home aria-label="Home">🏠</button>
        </div>
      </div>`;
    choicesEl.querySelector('[data-again]').addEventListener('click', () =>
      littleGameScreen(el, params, ctx)
    );
    choicesEl.querySelector('[data-home]').addEventListener('click', () => navigate('/home'));
  }

  el.querySelector('[data-quit]').addEventListener('click', async () => {
    await ctx.save();
    navigate('/home');
  });

  newQuestion();
}
