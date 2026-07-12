// Little Pup mode: preschool games for ages 3–5. Icon-first by design —
// pictorial tiles, spoken prompts with a 🔊 repeat button, and wordless
// feedback (wobbles and stars, never sentences). No reading, no number pad,
// no fail states: a wrong tap dims and the question waits.
// Every finished game counts as playing with the buddy dog, so little pups
// earn real accessories too.

import { navigate } from '../router.js';
import { getDog, dogSVG, wornFor, DOGS, GUESTS } from '../art/dogs.js';
import { getPet, petSVG } from '../art/pets.js';
import { sfx, buzz, say } from '../sound.js';
import { confetti, escapeHtml } from '../ui.js';

const ITEMS = ['🦴', '🎾', '🍖'];
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const STARS = ['⭐', '🌟', '🎉', '🐾'];
const KIND_BY_GAME = { count: 'fetch', find: 'walk', more: 'feed', tap: 'fetch', feed: 'feed', shape: 'walk', pattern: 'feed', next: 'walk', add: 'fetch' };
const QUESTIONS_BY_GAME = { count: 5, find: 5, more: 5, tap: 3, feed: 3, shape: 5, pattern: 5, next: 5, add: 5 };

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
  if (!profile.little) profile.little = { xp: 0 };
  return profile.little;
}

// Numbers start small and grow with success.
const rangeFor = (profile) => ((profile.little?.xp ?? 0) >= 30 ? 10 : 5);

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
  ];
}

export function littleHomeScreen(el, params, ctx) {
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
        <button class="btn ghost small" data-nav="/profiles" aria-label="Switch player">👥</button>
        <button class="btn ghost small" data-nav="/grownups" aria-label="Grown-ups">🔒</button>
      </div>
    </div>`;

  // Games appear as the little pup grows; one sparkly mystery tile hints at
  // the next unlock without pressuring.
  const xp = p.little?.xp ?? 0;
  const grid = el.querySelector('.little-tiles');
  const all = tiles(p, buddy);
  for (const t of all.filter((t) => xp >= t.minXp)) {
    const btn = document.createElement('button');
    btn.className = 'little-tile';
    btn.dataset.game = t.game;
    btn.setAttribute('aria-label', t.caption);
    btn.innerHTML = `${t.art}<span class="tile-caption">${t.caption}</span>`;
    btn.addEventListener('click', () => navigate(`/little?game=${t.game}`));
    grid.appendChild(btn);
  }
  const upcoming = all.find((t) => xp < t.minXp);
  if (upcoming) {
    const soon = document.createElement('div');
    soon.className = 'little-tile soon';
    soon.setAttribute('aria-label', 'More games soon!');
    soon.innerHTML = `<span class="tile-art">✨</span><span class="tile-caption">···</span>`;
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
    const range = rangeFor(p);
    fbEl.textContent = '';
    stageEl.innerHTML = '';
    choicesEl.innerHTML = '';
    choicesEl.className = 'little-choices';

    if (game === 'count') {
      const n = 1 + ri(range);
      const item = ITEMS[ri(ITEMS.length)];
      promptEl.textContent = `${item}❓`;
      speak('How many?');
      stageEl.innerHTML = `<div class="little-items${n > 6 ? ' many' : ''}">${itemRow(item, n)}</div>`;
      for (const v of pickCounts(n, range)) {
        choiceButton(`<span class="little-numeral">${v}</span>`, v === n);
      }
      stageEl.dataset.answer = n;
    } else if (game === 'find') {
      const n = 1 + ri(range);
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
        <div class="little-items tap-items">${Array.from(
          { length: n + 2 },
          () => `<button class="tap-item">🦴</button>`
        ).join('')}</div>`;
      let fed = 0;
      for (const b of stageEl.querySelectorAll('.tap-item')) {
        b.addEventListener('click', () => {
          if (busy || b.classList.contains('popped')) return;
          b.classList.add('popped');
          fed += 1;
          stageEl.querySelector('.tap-count').textContent = fed;
          buzz(15);
          say(WORDS[fed]);
          if (fed === n) celebrate(null, { speakWord: false });
        });
      }
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
      const maxSum = (p.little?.xp ?? 0) >= 100 ? 10 : 5;
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

  function celebrate(btn, { speakWord = true } = {}) {
    busy = true;
    if (firstTry) little.xp += 1;
    paws[index].classList.add('done');
    if (btn) btn.classList.add('win');
    sfx.correct();
    buzz(20);
    fbEl.textContent = `${STARS[ri(STARS.length)]}${STARS[ri(STARS.length)]}`;
    const n = Number(stageEl.dataset.answer);
    if (speakWord && n >= 0 && n <= 10) speak(WORDS[n]);
    setTimeout(next, 1000);
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
      say('Try again!');
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
    await ctx.save();
    sfx.celebrate();
    buzz([30, 40, 30]);
    confetti(18);
    say('Hooray! Great counting!');
    el.querySelector('.little-prompt-row').hidden = true;
    stageEl.hidden = true; // stage would otherwise flex-eat the space above
    fbEl.textContent = '';
    choicesEl.className = 'little-choices finish';
    choicesEl.innerHTML = `
      <div class="card center little-done">
        <div class="dog bounce">${dogSVG(buddy, 104, wornFor(p, buddy.id))}</div>
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
