// Little Pup mode: preschool games for ages 3–5. Icon-first by design —
// pictorial tiles, spoken prompts with a 🔊 repeat button, and wordless
// feedback (wobbles and stars, never sentences). No reading, no number pad,
// no fail states: a wrong tap dims and the question waits.
// Every finished game counts as playing with the buddy dog, so little pups
// earn real accessories too.

import { navigate } from '../router.js';
import { getDog, dogSVG, wornFor, DOGS, GUESTS } from '../art/dogs.js';
import { getPet, petSVG } from '../art/pets.js';
import { sfx, buzz, say, cheer } from '../sound.js';
import { earnSkillKnown, balanceCents, formatPaw } from '../engine/money.js';
import { checkPetUnlocks } from '../engine/cozy.js';
import { confetti, escapeHtml } from '../ui.js';

const ITEMS = ['🦴', '🎾', '🍖'];
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const STARS = ['⭐', '🌟', '🎉', '🐾'];
const KIND_BY_GAME = { count: 'fetch', find: 'walk', more: 'feed', tap: 'fetch', feed: 'feed', shape: 'walk', pattern: 'feed', next: 'walk', add: 'fetch', look: 'walk', bond: 'feed', teen: 'fetch' };
const QUESTIONS_BY_GAME = { count: 5, find: 5, more: 5, tap: 3, feed: 3, shape: 5, pattern: 5, next: 5, add: 5, look: 5, bond: 5, teen: 5 };

// New species from the pet pool host the non-counting games — a pre-reader
// navigates by which animal, not by words.
const HOSTS = { shape: 'cat-1', pattern: 'turtle-1', next: 'bird-1', add: 'guinea-1' };

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
const SKILL_GAMES = new Set(['count', 'find', 'more', 'next', 'add', 'look', 'bond', 'teen', 'feed']);
// Two-choice games are guessable 50/50 — they need a longer streak to
// count as knowing (12.5% → 6% fake odds).
const STREAK_NEEDED = { more: 4 };
// Which numbers each game can actually ask (more can never ask "1", next
// starts at 4…) — bands only wait on reachable keys.
const SKILL_DOMAIN = {
  count: [1, 10], find: [1, 10], look: [1, 10], feed: [1, 10],
  more: [2, 10], next: [4, 10], add: [2, 10],
};

// Does this game still have numbers to learn? Drives the Play-next pick.
function hasFrontier(profile, game) {
  const little = profile.little ?? {};
  if (game === 'bond') {
    for (let k = 0; k <= 5; k++) if (!knows(little, 'bond5', k)) return true;
    for (let k = 0; k <= 10; k++) if (!knows(little, 'bond10', k)) return true;
    return false;
  }
  if (game === 'teen') {
    for (let n = 1; n <= 9; n++) if (!knows(little, 'teen', n)) return true;
    return false;
  }
  const dom = SKILL_DOMAIN[game];
  if (!dom) return false; // tap/shape/pattern: joyful, untracked
  for (let n = dom[0]; n <= dom[1]; n++) if (!knows(little, game, n)) return true;
  return false;
}

// The one tile most worth playing now: the trail-order first ready game
// with numbers still to learn; falls back to a daily rotation of the
// untracked games so "Play!" always points somewhere.
export function littleSuggestNext(profile, readyTiles) {
  const tracked = readyTiles.filter((t) => hasFrontier(profile, t.game));
  if (tracked.length) return tracked[0];
  return readyTiles[Math.floor(Date.now() / 86400000) % readyTiles.length];
}

// Round-finish praise that matches what the child actually did — shape
// games shouldn't hear "great counting". A couple of options each so the
// cheer doesn't wear out.
const PRAISE_BY_GAME = {
  look: ['Quick eyes! Amazing!', 'You saw it in a flash!'],
  bond: ['Number friends forever!', 'You know the number friends!'],
  teen: ['Teen numbers, no problem!', 'Ten and more — you got it!'],
  count: ['Hooray! Great counting!', 'Wow! You counted them all!'],
  tap: ['Hooray! Great counting!', 'You counted every single one!'],
  find: ['You found all the numbers!', 'Hooray! Super number finding!'],
  feed: ['Yum yum! Perfectly fed!', 'Hooray! What a good helper!'],
  more: ['Great comparing!', 'You always knew who had more!'],
  shape: ['Hooray! You know your shapes!', 'Super shape spotting!'],
  pattern: ['Pattern power! Amazing!', 'You cracked every pattern!'],
  next: ['You know what comes next!', 'Hooray! Number detective!'],
  add: ['Hooray! Great adding!', 'Wow! You put them all together!'],
};
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
  const [dLo, dHi] = SKILL_DOMAIN[g] ?? [1, 10];
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
      art: `<span class="tile-dogs">${dogSVG(buddy, 38, wornFor(p, buddy.id))}</span><span class="tile-art small">\u{1F9B4}\u27A1\uFE0F\u{1F963}</span>`,
    },
    {
      game: 'more',
      minXp: 20,
      caption: 'Who has more?',
      art: `<span class="tile-dogs">${dogSVG(buddy, 38, wornFor(p, buddy.id))}${dogSVG(GUESTS[0], 38)}</span><span class="tile-art small">\u{1F9B4}\u{1F9B4} \u00b7 \u{1F9B4}</span>`,
    },
    {
      game: 'shape',
      minXp: 28,
      caption: 'Shapes',
      art: `<span class="tile-dogs">${petSVG(getPet(HOSTS.shape), 38)}</span><span class="tile-art small">${shapeSVG(SHAPE_DEFS[0], SHAPE_COLORS[0], 18)}${shapeSVG(SHAPE_DEFS[2], SHAPE_COLORS[1], 18)}${shapeSVG(SHAPE_DEFS[1], SHAPE_COLORS[2], 18)}</span>`,
    },
    {
      game: 'pattern',
      minXp: 38,
      caption: 'Patterns',
      art: `<span class="tile-dogs">${petSVG(getPet(HOSTS.pattern), 38)}</span><span class="tile-art small">${shapeSVG(SHAPE_DEFS[0], SHAPE_COLORS[0], 16)}${shapeSVG(SHAPE_DEFS[0], SHAPE_COLORS[1], 16)}${shapeSVG(SHAPE_DEFS[0], SHAPE_COLORS[0], 16)}\u2753</span>`,
    },
    {
      game: 'next',
      minXp: 55,
      caption: 'What comes next?',
      art: `<span class="tile-dogs">${petSVG(getPet(HOSTS.next), 38)}</span><span class="tile-art small"><span class="tile-mark">2\u00b73\u00b7\u2753</span></span>`,
    },
    {
      game: 'add',
      minXp: 70,
      caption: 'Adding',
      art: `<span class="tile-dogs">${petSVG(getPet(HOSTS.add), 38)}</span><span class="tile-art small">\u{1F9B4}\u2795\u{1F9B4}\u{1F9B4}</span>`,
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
  ];
}

export function littleHomeScreen(el, params, ctx) {
  // A transitioning kid with childCanSwitch can hop to the big-kid home.
  ctx.session.bigView = false;
  const p = ctx.profile;
  const buddy = getDog(p.avatarDogId);
  el.innerHTML = `
    <div class="screen little-screen">
      <div class="hero little-hero">
        <span class="avatar">${dogSVG(buddy, 96, wornFor(p, buddy.id))}</span>
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
    say(
      cents
        ? `You saved ${bucks ? `${bucks} paw buck${bucks > 1 ? 's' : ''} and ` : ''}${rest} paw cents!`
        : 'Your piggy bank is ready for coins!'
    );
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
  const isReady = (t) => (t.ready ? t.ready(p) : xp >= t.minXp);
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
    btn.addEventListener('click', () => navigate(`/little?game=${t.game}`));
    grid.appendChild(btn);
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
  const buddy = getDog(p.avatarDogId);
  let index = 0;
  let busy = false;
  let firstTry = true;
  let lastSpoken = '';
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
      </div>
      <div class="little-stage"></div>
      <div class="little-choices"></div>
      <div class="feedback center little-fb"></div>
    </div>`;
  const paws = [...el.querySelectorAll('.paw')];
  const promptEl = el.querySelector('.little-prompt');
  const stageEl = el.querySelector('.little-stage');
  const choicesEl = el.querySelector('.little-choices');
  const fbEl = el.querySelector('.little-fb');
  el.querySelector('[data-say]').addEventListener('click', () => say(lastSpoken));

  function choiceButton(html, correct, cls = '') {
    const btn = document.createElement('button');
    btn.className = `little-card ${cls}`;
    btn.dataset.good = correct ? '1' : '0';
    btn.innerHTML = html;
    btn.addEventListener('click', () => onChoice(btn, correct));
    choicesEl.appendChild(btn);
  }

  function newQuestion() {
    const range = rangeFor(p, SKILL_GAMES.has(game) ? game : 'count');
    fbEl.textContent = '';
    stageEl.innerHTML = '';
    delete stageEl.dataset.teachOnly;
    choicesEl.innerHTML = '';
    choicesEl.className = 'little-choices';

    if (game === 'count') {
      const n = pickN(little, 'count', range);
      const item = ITEMS[ri(ITEMS.length)];
      promptEl.textContent = `${item}❓`;
      speak('How many?');
      stageEl.innerHTML = `<div class="little-items${n > 6 ? ' many' : ''}">${itemRow(item, n)}</div>`;
      for (const v of pickCounts(n, range)) {
        choiceButton(`<span class="little-numeral">${v}</span>`, v === n);
      }
      stageEl.dataset.answer = n;
    } else if (game === 'find') {
      const n = pickN(little, 'find', range);
      const item = ITEMS[ri(ITEMS.length)];
      promptEl.textContent = '🔍❓';
      speak(`Find ${WORDS[n]}!`);
      stageEl.innerHTML = `<div class="little-numeral big">${n}</div>`;
      choicesEl.classList.add('stacked');
      for (const v of pickCounts(n, range)) {
        choiceButton(`<span class="little-items small">${itemRow(item, v)}</span>`, v === n);
      }
      stageEl.dataset.answer = n;
    } else if (game === 'tap') {
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
          if (busy || b.classList.contains('popped')) return;
          b.classList.add('popped');
          tapped += 1;
          stageEl.querySelector('.tap-count').textContent = tapped;
          buzz(15);
          say(WORDS[tapped]);
          if (tapped === n) celebrate(null, { speakWord: false });
        });
      }
    } else if (game === 'feed') {
      // Feed the puppy N: counting OUT a quantity — tap bones into the bowl
      // until the buddy has enough.
      const n = 1 + ri(range);
      promptEl.textContent = `🦴➡️🥣`;
      speak(`Feed ${buddy.name} ${WORDS[n]} bones!`);
      stageEl.dataset.answer = n;
      stageEl.innerHTML = `<div class="feed-row">${dogSVG(buddy, 52, wornFor(p, buddy.id))}
          <span class="little-numeral">${n}</span><span class="feed-bowl">🥣</span>
          <span class="tap-count">0</span></div>
        <div class="little-items tap-items feed-items">${Array.from(
          { length: n + 2 },
          () => `<button class="tap-item">🦴</button>`
        ).join('')}</div>
        <button class="btn little-icon-btn feed-done" aria-label="All done">✅</button>`;
      // The child decides when the bowl is right: bones toggle in and out,
      // ✅ serves it. Confirming the wrong count is a real (gentle) miss —
      // before, the game auto-ended at n and could never be wrong.
      let fed = 0;
      for (const b of stageEl.querySelectorAll('.tap-item')) {
        b.addEventListener('click', () => {
          if (busy) return;
          const taking = b.classList.contains('popped');
          b.classList.toggle('popped');
          fed += taking ? -1 : 1;
          stageEl.querySelector('.tap-count').textContent = fed;
          buzz(15);
          say(WORDS[fed] ?? String(fed));
        });
      }
      stageEl.querySelector('.feed-done').addEventListener('click', () => {
        if (busy) return;
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
    } else if (game === 'shape') {
      // Shapes with Whiskers: wordless geometry — find the spoken shape.
      const host = getPet(HOSTS.shape);
      const defs = [...SHAPE_DEFS].sort(() => Math.random() - 0.5).slice(0, 3);
      const target = defs[ri(defs.length)];
      // One color for every choice: shape is the only thing that varies.
      const col = SHAPE_COLORS[ri(SHAPE_COLORS.length)];
      promptEl.innerHTML = `${petSVG(host, 34)} 🔍`;
      speak(`Find the ${target.word}!`);
      stageEl.dataset.answer = -1;
      stageEl.innerHTML = `<div class="host-spot">${petSVG(host, 60)}</div>`;
      for (const def of defs) {
        choiceButton(shapeSVG(def, col), def === target);
      }
    } else if (game === 'pattern') {
      // Patterns with Sheldon: one dimension at a time. Early questions vary
      // only shape, then only color; two dimensions change together (the
      // hardest discrimination) only at the end of a round.
      const host = getPet(HOSTS.pattern);
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
      promptEl.innerHTML = `${petSVG(host, 34)} ➡️❓`;
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
    } else if (game === 'next') {
      // What comes next? — number path with Kiwi the bird.
      const host = getPet(HOSTS.next);
      const s0 = 1 + ri(Math.max(1, range - 3));
      const answer = s0 + 3;
      promptEl.innerHTML = `${petSVG(host, 34)} ➡️❓`;
      speak('What comes next?');
      stageEl.dataset.answer = answer;
      stageEl.innerHTML = `<div class="pattern-row">${[s0, s0 + 1, s0 + 2]
        .map((v) => `<span class="path-num">${v}</span>`)
        .join('<span class="path-paw">🐾</span>')}<span class="path-paw">🐾</span><span class="pattern-q">❓</span></div>`;
      for (const v of pickCounts(answer, Math.max(range, answer))) {
        choiceButton(`<span class="little-numeral">${v}</span>`, v === answer);
      }
    } else if (game === 'add') {
      // Adding within 5 (10 later) with Peanut the guinea pig — two groups
      // of things, one number.
      const host = getPet(HOSTS.add);
      const maxSum = [2, 3, 4, 5].every((v) => knows(little, 'add', v)) ? 10 : 5;
      const a = 1 + ri(maxSum - 1);
      const b = 1 + ri(maxSum - a);
      const item = ITEMS[ri(ITEMS.length)];
      promptEl.innerHTML = `${petSVG(host, 34)} ➕`;
      speak(`${WORDS[a]} plus ${WORDS[b]}!`);
      stageEl.dataset.answer = a + b;
      stageEl.innerHTML = `<div class="pattern-row add-row">
        <span class="little-items small">${itemRow(item, a)}</span>
        <span class="pattern-q">➕</span>
        <span class="little-items small">${itemRow(item, b)}</span>
        <span class="pattern-q">=</span><span class="pattern-q">❓</span></div>`;
      for (const v of pickCounts(a + b, Math.max(maxSum, a + b))) {
        choiceButton(`<span class="little-numeral">${v}</span>`, v === a + b);
      }
    } else if (game === 'look') {
      // Quick Look: the frame flashes, then hides — quick eyes, no counting.
      const n = pickN(little, 'look', rangeFor(p, 'look'));
      const item = ITEMS[ri(ITEMS.length)];
      promptEl.textContent = '👀⚡';
      speak('Quick look! How many?');
      stageEl.dataset.answer = n;
      stageEl.innerHTML = `<div class="little-items">${itemRow(item, n)}</div>
        <div class="look-veil little-numeral big" hidden>❓</div>`;
      // Quick eyes only: answering is blocked until the frame hides, so
      // counting it item-by-item can't stand in for subitizing.
      busy = true;
      setTimeout(() => {
        const frame = stageEl.querySelector('.little-items');
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
    } else if (game === 'bond') {
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
    } else if (game === 'teen') {
      // Teen numbers: ten and some more (K.NBT.1).
      const n = 1 + ri(9);
      const item = ITEMS[ri(ITEMS.length)];
      promptEl.textContent = '🔟➕';
      speak(`Ten and ${WORDS[n]} make what?`);
      stageEl.dataset.answer = 10 + n;
      stageEl.dataset.skill = `teen:${n}`;
      stageEl.innerHTML = `<div class="pattern-row add-row">
        <span class="little-items small">${itemRow(item, 10)}</span>
        <span class="pattern-q">➕</span>
        <span class="little-items small">${itemRow(item, n)}</span></div>`;
      const opts = new Set([10 + n]);
      while (opts.size < 3) opts.add(11 + ri(9));
      for (const v of [...opts].sort(() => Math.random() - 0.5)) {
        choiceButton(`<span class="little-numeral">${v}</span>`, v === 10 + n);
      }
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
        `<span class="dog">${dogSVG(buddy, 72, wornFor(p, buddy.id))}</span>
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
    if (!SKILL_GAMES.has(game)) return;
    const n = Number(stageEl.dataset.answer);
    const key = stageEl.dataset.skill ?? (n >= 1 ? `${game}:${n}` : null);
    if (!key) return;
    const sk = (little.skills[key] = little.skills[key] ?? { attempts: 0, streak: 0 });
    sk.attempts += 1;
    if (stageEl.dataset.teachOnly !== '1') {
      sk.streak = firstTry ? sk.streak + 1 : 0;
    }
    if (sk.streak === KNOWN_STREAK) {
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
    sfx.correct();
    buzz(20);
    fbEl.textContent = `${STARS[ri(STARS.length)]}${STARS[ri(STARS.length)]}`;
    const n = Number(stageEl.dataset.answer);
    if (speakWord && n >= 0 && n <= 10) speak(WORDS[n]);
    setTimeout(next, 1000);
  }

  function guidedRecount(btn) {
    // count: recount the stage items; find: recount the pile the child
    // picked, so they see why it isn't the target.
    const scope = game === 'count' ? stageEl : btn;
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
            say(game === 'find' ? `Find ${WORDS[target]}!` : 'Now you! How many?');
          }, 800);
        }
      }, 600 + i * 700);
    });
  }

  function onChoice(btn, correct) {
    if (busy) return;
    if (correct) {
      celebrate(btn);
    } else {
      // Error-less and wordless: the wrong card dims + wobbles, a paw of
      // sympathy appears, and the question waits.
      firstTry = false;
      btn.classList.add('dim');
      btn.classList.add('shake');
      sfx.wrong();
      fbEl.textContent = '🐾';
      if (GUIDED_RECOUNT && (game === 'count' || game === 'find')) {
        guidedRecount(btn);
      } else {
        say('Try again!');
      }
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
          newPets.length ? petSVG(newPets[0].pet, 104) : dogSVG(buddy, 104, wornFor(p, buddy.id))
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
