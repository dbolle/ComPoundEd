// Little Pup mode: preschool counting games for ages 3–5. No reading, no
// number pad — big tap-the-answer cards, error-less retries (a wrong tap
// dims; you can never fail), spoken prompts, and the same dogs throughout.
// Every finished game counts as playing with the buddy dog, so little pups
// earn real accessories too.

import { navigate } from '../router.js';
import { getDog, dogSVG, accessoriesFor, DOGS, GUESTS } from '../art/dogs.js';
import { sfx, buzz, say } from '../sound.js';
import { confetti, escapeHtml } from '../ui.js';

const QUESTIONS = 5;
const ITEMS = ['🦴', '🎾', '🍖'];
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const CHEERS = ['Yes! ⭐', 'Woof! 🐾', 'Great job! 🎉', 'Super! 🌟'];
const KIND_BY_GAME = { count: 'fetch', find: 'walk', more: 'feed' };

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

export function littleHomeScreen(el, params, ctx) {
  const p = ctx.profile;
  const buddy = getDog(p.avatarDogId);
  el.innerHTML = `
    <div class="screen little-screen">
      <div class="hero little-hero">
        <span class="avatar">${dogSVG(buddy, 96, accessoriesFor(p, buddy.id))}</span>
        <div>
          <h1>Hi, ${escapeHtml(p.name)}!</h1>
          <p class="muted">Let's count with ${escapeHtml(buddy.name)}!</p>
        </div>
      </div>
      <button class="btn little-btn" data-game="count">🦴 How many?</button>
      <button class="btn accent little-btn" data-game="find">🔢 Find the number!</button>
      <button class="btn little-btn more-btn" data-game="more">🐶 Who has more?</button>
      <div class="nav-row" style="margin-top:auto">
        <button class="btn ghost small" data-nav="/profiles">🔄 Switch player</button>
        <button class="btn ghost small" data-nav="/grownups">🔒 Grown-ups</button>
      </div>
    </div>`;
  for (const b of el.querySelectorAll('[data-game]')) {
    b.addEventListener('click', () => navigate(`/little?game=${b.dataset.game}`));
  }
  for (const b of el.querySelectorAll('[data-nav]')) {
    b.addEventListener('click', () => navigate(b.dataset.nav));
  }
}

export function littleGameScreen(el, params, ctx) {
  const p = ctx.profile;
  const little = ensureLittle(p);
  const game = ['count', 'find', 'more'].includes(params.get('game'))
    ? params.get('game')
    : 'count';
  const buddy = getDog(p.avatarDogId);
  let index = 0;
  let busy = false;
  let firstTry = true;

  el.innerHTML = `
    <div class="screen little-screen">
      <div class="topbar">
        <button class="btn ghost small" data-quit>✕</button>
        <span class="spacer"></span>
        <span class="quiz-progress">${'<span class="paw">🐾</span>'.repeat(QUESTIONS)}</span>
      </div>
      <div class="little-prompt"></div>
      <div class="little-stage"></div>
      <div class="little-choices"></div>
      <div class="feedback center little-fb"></div>
    </div>`;
  const paws = [...el.querySelectorAll('.paw')];
  const promptEl = el.querySelector('.little-prompt');
  const stageEl = el.querySelector('.little-stage');
  const choicesEl = el.querySelector('.little-choices');
  const fbEl = el.querySelector('.little-fb');

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
      promptEl.textContent = 'How many?';
      say('How many?');
      stageEl.innerHTML = `<div class="little-items${n > 6 ? ' many' : ''}">${itemRow(item, n)}</div>`;
      for (const v of pickCounts(n, range)) {
        choiceButton(`<span class="little-numeral">${v}</span>`, v === n);
      }
      stageEl.dataset.answer = n;
    } else if (game === 'find') {
      const n = 1 + ri(range);
      const item = ITEMS[ri(ITEMS.length)];
      promptEl.textContent = 'Find the number!';
      say(`Find ${WORDS[n]}!`);
      stageEl.innerHTML = `<div class="little-numeral big">${n}</div>`;
      choicesEl.classList.add('stacked');
      for (const v of pickCounts(n, range)) {
        choiceButton(`<span class="little-items small">${itemRow(item, v)}</span>`, v === n);
      }
      stageEl.dataset.answer = n;
    } else {
      // more: two dogs with bone piles — tap the one with more
      const others = [...DOGS, ...GUESTS].filter((d) => d.id !== buddy.id);
      const rival = others[ri(others.length)];
      const range2 = rangeFor(p);
      const a = 1 + ri(range2);
      let b = 1 + ri(range2);
      while (b === a) b = 1 + ri(range2);
      promptEl.textContent = 'Who has more?';
      say('Who has more bones?');
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

  function onChoice(btn, correct) {
    if (busy) return;
    if (correct) {
      busy = true;
      if (firstTry) little.xp += 1;
      paws[index].classList.add('done');
      btn.classList.add('win');
      sfx.correct();
      buzz(20);
      const n = Number(stageEl.dataset.answer);
      fbEl.textContent = CHEERS[ri(CHEERS.length)];
      if (n >= 0 && n <= 10) say(WORDS[n]);
      setTimeout(next, 1000);
    } else {
      // Error-less: the wrong card dims, the question stays. No fail states.
      firstTry = false;
      btn.classList.add('dim');
      sfx.wrong();
      fbEl.textContent = 'Try again! 🐾';
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
    promptEl.textContent = '';
    stageEl.innerHTML = '';
    fbEl.textContent = '';
    choicesEl.className = 'little-choices';
    choicesEl.innerHTML = `
      <div class="card center little-done">
        <div class="dog bounce">${dogSVG(buddy, 104, accessoriesFor(p, buddy.id))}</div>
        <h2>Hooray! 🎉</h2>
        <div class="nav-row" style="margin-top:10px">
          <button class="btn" data-again>🔁 Again!</button>
          <button class="btn accent" data-home>🏠 Home</button>
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
