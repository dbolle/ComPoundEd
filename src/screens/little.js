// Little Pup mode: preschool games for ages 3–5. Icon-first by design —
// pictorial tiles, spoken prompts with a 🔊 repeat button, and wordless
// feedback (wobbles and stars, never sentences). No reading, no number pad,
// no fail states: a wrong tap dims and the question waits.
// Every finished game counts as playing with the buddy dog, so little pups
// earn real accessories too.

import { navigate } from '../router.js';
import { getDog, dogSVG, accessoriesFor, DOGS, GUESTS } from '../art/dogs.js';
import { sfx, buzz, say } from '../sound.js';
import { confetti, escapeHtml } from '../ui.js';

const ITEMS = ['🦴', '🎾', '🍖'];
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const STARS = ['⭐', '🌟', '🎉', '🐾'];
const KIND_BY_GAME = { count: 'fetch', find: 'walk', more: 'feed', tap: 'fetch', feed: 'feed' };
const QUESTIONS_BY_GAME = { count: 5, find: 5, more: 5, tap: 3, feed: 3 };

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
      caption: 'How many?',
      art: `<span class="tile-art">🦴🦴🦴</span><span class="tile-mark">❓</span>`,
    },
    {
      game: 'tap',
      caption: 'Tap & count',
      art: `<span class="tile-art">👆🦴</span><span class="tile-mark">1·2·3</span>`,
    },
    {
      game: 'find',
      caption: 'Find it!',
      art: `<span class="tile-num">5</span><span class="tile-art small">🦴🦴🦴🦴🦴</span>`,
    },
    {
      game: 'feed',
      caption: 'Feed me!',
      art: `<span class="tile-dogs">${dogSVG(buddy, 38, accessoriesFor(p, buddy.id))}</span><span class="tile-art small">🦴➡️🥣</span>`,
    },
    {
      game: 'more',
      caption: 'Who has more?',
      art: `<span class="tile-dogs">${dogSVG(buddy, 38, accessoriesFor(p, buddy.id))}${dogSVG(GUESTS[0], 38)}</span><span class="tile-art small">🦴🦴 · 🦴</span>`,
    },
  ];
}

export function littleHomeScreen(el, params, ctx) {
  const p = ctx.profile;
  const buddy = getDog(p.avatarDogId);
  el.innerHTML = `
    <div class="screen little-screen">
      <div class="hero little-hero">
        <span class="avatar">${dogSVG(buddy, 96, accessoriesFor(p, buddy.id))}</span>
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

  const grid = el.querySelector('.little-tiles');
  for (const t of tiles(p, buddy)) {
    const btn = document.createElement('button');
    btn.className = 'little-tile';
    btn.dataset.game = t.game;
    btn.setAttribute('aria-label', t.caption);
    btn.innerHTML = `${t.art}<span class="tile-caption">${t.caption}</span>`;
    btn.addEventListener('click', () => navigate(`/little?game=${t.game}`));
    grid.appendChild(btn);
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
    <div class="screen little-screen">
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
      stageEl.innerHTML = `<div class="feed-row">${dogSVG(buddy, 52, accessoriesFor(p, buddy.id))}
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
        `<span class="dog">${dogSVG(buddy, 72, accessoriesFor(p, buddy.id))}</span>
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
    promptEl.textContent = '🎉';
    stageEl.innerHTML = '';
    fbEl.textContent = '';
    choicesEl.className = 'little-choices';
    choicesEl.innerHTML = `
      <div class="card center little-done">
        <div class="dog bounce">${dogSVG(buddy, 104, accessoriesFor(p, buddy.id))}</div>
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
