// Pet-play activities: short question rounds themed as walking, feeding, or
// playing fetch — solo with one dog or together with 2–3 pack dogs. Every
// question comes from the asking dog's times table (mixed facts for the
// starter dog), and answers feed the same Leitner engine as regular quizzes —
// playtime is practice in disguise.

import { navigate } from '../router.js';
import { buildRound, buildDivisionRound, buildSittingRound } from '../engine/selector.js';
import { recordAnswer, recordDivisionAnswer } from '../engine/leitner.js';
import { checkUnlocks, isUnlocked } from '../engine/unlocks.js';
import { bumpAnswer, bumpActivity, checkAchievements } from '../engine/achievements.js';
import { hintFor, divisionHint } from '../engine/hints.js';
import { getDog, isGuest, GUESTS, dogSVG, accessoriesFor, ACCESSORIES } from '../art/dogs.js';
import { buildNumpad, bindKeyboard, celebrationLine, confetti, escapeHtml } from '../ui.js';
import { sfx, buzz } from '../sound.js';

const KINDS = {
  walk: {
    title: 'Walkies!',
    goal: '🏠',
    deco: ['🌳', '🌷', '🌼', '🌳'],
    cheer: 'trots ahead!',
    cheerGroup: 'The pack trots ahead!',
    done: 'had a lovely walk with you! 🦮',
  },
  feed: {
    title: 'Dinner time!',
    goal: '🥣',
    deco: ['🦴', '🦴', '🦴', '🦴'],
    cheer: 'gets closer to the bowl!',
    cheerGroup: 'Everyone gets closer to dinner!',
    done: 'ate a yummy dinner! 🍖',
  },
  fetch: {
    title: 'Fetch!',
    goal: '🎾',
    deco: ['🌿', '🌿', '🌿', '🌿'],
    cheer: 'races after the ball!',
    cheerGroup: 'The whole pack races after the ball!',
    done: 'caught the ball — good dogs! 🎾',
  },
};

function listNames(dogs) {
  const names = dogs.map((d) => d.name);
  return names.length === 1
    ? names[0]
    : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export function activityScreen(el, params, ctx) {
  // Pet sitting: a visiting guest dog whose round is the confidence-first
  // mix (mostly mastered facts, a few firm, a sprinkle of weak).
  const sitting = params.has('sit');
  const sitGuest = GUESTS.find((g) => g.id === params.get('sit')) ??
    GUESTS[Math.floor(Math.random() * GUESTS.length)];
  const ids = (params.get('dogs') ?? params.get('dog') ?? '').split(',').filter(Boolean);
  const dogs = sitting
    ? [sitGuest]
    : [...new Set(ids)].map(getDog).filter((d) => isUnlocked(ctx.profile, d.id)).slice(0, 3);
  const kind = KINDS[params.get('kind')]
    ? params.get('kind')
    : sitting
      ? Object.keys(KINDS)[Math.floor(Math.random() * 3)]
      : 'walk';
  if (!dogs.length) {
    navigate('/pack');
    return;
  }
  const theme = KINDS[kind];
  const group = dogs.length > 1;
  const QUESTIONS = sitting ? 10 : group ? 6 : 5;
  const backTo = sitting ? '/home' : group ? '/pack' : `/dog?id=${dogs[0].id}`;

  let questions;
  if (sitting) {
    questions = buildSittingRound(ctx.profile, QUESTIONS).map((q) => ({ ...q, dog: dogs[0] }));
  } else {
    // Each dog contributes questions from its own table, asked in rotation
    // (division dogs quiz their ÷table; the starter and guests ask mixed).
    const perDog = Math.ceil(QUESTIONS / dogs.length);
    const pools = dogs.map((d) =>
      d.divTable != null
        ? buildDivisionRound(ctx.profile, d.divTable, perDog)
        : buildRound(
            ctx.profile,
            d.table == null ? { type: 'mixed' } : { type: 'table', table: d.table },
            perDog
          )
    );
    questions = [];
    for (let i = 0; i < QUESTIONS; i++) {
      const di = i % dogs.length;
      questions.push({ ...pools[di][Math.floor(i / dogs.length)], dog: dogs[di] });
    }
  }

  let index = 0;
  let input = '';
  let busy = false;
  let awaitingNext = false;
  let startT = 0;
  let steps = 0;

  // Dogs stagger tightly and the asker chip overlays the scene so the whole
  // activity fits a small phone viewport without scrolling.
  const sceneHeight = 92 + (dogs.length - 1) * 10;
  el.innerHTML = `
    <div class="screen game-screen">
      <div class="topbar">
        <button class="btn ghost small" data-quit>✕ Stop</button>
        <span class="spacer"></span>
        <strong>${theme.title}</strong>
      </div>
      <div class="activity-scene" style="height:${sceneHeight}px">
        ${group ? '<span class="asker-overlay"></span>' : ''}
        <span class="goal">${theme.goal}</span>
        ${theme.deco.map((d, i) => `<span class="deco" style="left:${18 + i * 22}%">${d}</span>`).join('')}
        ${dogs
          .map(
            (d, i) =>
              `<span class="mover" style="bottom:${4 + i * 10}px;transition-delay:${i * 90}ms">${dogSVG(d, 56, accessoriesFor(ctx.profile, d.id))}</span>`
          )
          .join('')}
      </div>
      <div class="question${group ? ' compact' : ''}"></div>
      <div class="answer-box" aria-live="assertive">&nbsp;</div>
      <div class="feedback"></div>
      <div class="numpad"></div>
    </div>`;

  const scene = el.querySelector('.activity-scene');
  const movers = [...el.querySelectorAll('.mover')];
  const askerEl = scene.querySelector('.asker-overlay');
  const qEl = el.querySelector('.question');
  const ansEl = el.querySelector('.answer-box');
  const fbEl = el.querySelector('.feedback');
  const padEl = el.querySelector('.numpad');
  buildNumpad(padEl, press);
  bindKeyboard(press);

  function placeDogs() {
    movers.forEach((m, i) => {
      // Stagger the pack horizontally so every dog stays visible.
      const lead = (movers.length - 1 - i) * 16;
      m.style.left = `calc(${(steps / QUESTIONS) * 100}% - ${(steps / QUESTIONS) * 105}px + ${lead}px)`;
    });
  }

  function showQuestion() {
    const q = questions[index];
    if (askerEl) {
      askerEl.innerHTML = `${dogSVG(q.dog, 26)} ${escapeHtml(q.dog.name)} asks…`;
    }
    qEl.textContent = q.text;
    qEl.classList.toggle('compact', group || q.text.length > 8);
    ansEl.textContent = ' ';
    ansEl.className = 'answer-box';
    fbEl.textContent = '';
    fbEl.className = 'feedback';
    startT = performance.now();
  }

  function press(k) {
    if (busy) {
      // Reading a hint: the ✓ key (or Enter) moves on when they're ready.
      if (awaitingNext && k === 'ok') gotIt();
      return;
    }
    if (k === 'ok') {
      submit();
      return;
    }
    if (k === 'del') input = input.slice(0, -1);
    else if (input.length < 3) input += k;
    ansEl.textContent = input || ' ';
  }

  function submit() {
    if (!input) return;
    const q = questions[index];
    const ms = performance.now() - startT;
    const correct = Number(input) === q.answer;
    const r =
      q.kind === 'div'
        ? recordDivisionAnswer(ctx.profile, q.a, q.b, correct, ms)
        : recordAnswer(ctx.profile, q.a, q.b, correct, ms);
    busy = true;
    const stats = bumpAnswer(ctx.profile, r);
    if (correct) {
      if (r.fast) sfx.fast();
      else sfx.correct();
      buzz(20);
      steps += 1;
      placeDogs();
      ansEl.classList.add('good');
      fbEl.textContent = celebrationLine(
        r,
        stats.currentStreak,
        group ? theme.cheerGroup : `${q.dog.name} ${theme.cheer}`
      );
      fbEl.classList.add('good');
      setTimeout(next, 800);
    } else {
      sfx.wrong();
      buzz(60);
      ansEl.classList.add('bad');
      const hint = q.kind === 'div' ? divisionHint(q.a, q.b) : hintFor(ctx.profile, q.a, q.b);
      const brave = r.firstAttempt
        ? '<span class="hint brave">🦁 Brand-new fact — trying it is the win!</span>'
        : '';
      // Self-paced: the hint stays until the kid says they're ready — and the
      // same fact comes right back, so the hint gets used immediately.
      fbEl.innerHTML = `${q.correction}${brave}<span class="hint">💡 ${hint}</span>
        <button class="btn got-it" data-next>👍 Got it!</button>`;
      fbEl.classList.add('bad');
      awaitingNext = true;
      padEl.hidden = true; // the hint + Got it! take the numpad's space
      fbEl.querySelector('[data-next]').addEventListener('click', gotIt);
    }
  }

  function gotIt() {
    if (!awaitingNext) return;
    awaitingNext = false;
    next();
  }

  async function next() {
    padEl.hidden = false;
    input = '';
    busy = false;
    // A wrong answer re-asks the same fact so the activity always ends with
    // the dogs reaching the goal — play never ends in failure.
    if (steps > index) index += 1;
    if (index >= questions.length) {
      await finish();
    } else {
      showQuestion();
    }
  }

  async function finish() {
    const p = ctx.profile;
    const wornBefore = dogs.map((d) => accessoriesFor(p, d.id));
    for (const d of dogs) {
      p.play[d.id] = p.play[d.id] ?? { walk: 0, feed: 0, fetch: 0 };
      p.play[d.id][kind] += 1;
    }
    const newWear = dogs.flatMap((d, i) =>
      accessoriesFor(p, d.id)
        .filter((id) => !wornBefore[i].includes(id))
        .map((id) => ({ dog: d, acc: ACCESSORIES.find((a) => a.id === id) }))
    );
    checkUnlocks(p);
    bumpActivity(p, { sitting });
    const newAwards = checkAchievements(p);
    await ctx.save();
    sfx.celebrate();
    buzz([30, 40, 30]);
    scene.classList.add('celebrate');
    if (askerEl) askerEl.remove();
    qEl.textContent = '';
    fbEl.textContent = '';
    const headline = sitting
      ? `${escapeHtml(dogs[0].name)} had the best day — thanks for pet sitting! 🏡`
      : `${escapeHtml(listNames(dogs))} ${theme.done}`;
    const doneLabel = sitting
      ? '🏠 Home'
      : group
        ? '🐶 Back to the pack'
        : `🐶 Back to ${escapeHtml(dogs[0].name)}`;
    ansEl.outerHTML = `<div class="card center">
      <h2>${headline}</h2>
      ${
        newWear.length
          ? `<div class="badge-row" style="margin-top:8px">${newWear
              .map(
                (w) =>
                  `<span class="badge">${w.acc.emoji} ${escapeHtml(w.dog.name)} earned a ${w.acc.name}!</span>`
              )
              .join('')}</div>`
          : ''
      }
      ${
        newAwards.length
          ? `<div class="badge-row" style="margin-top:8px">${newAwards
              .map((aw) => `<span class="badge">🏆 ${aw.emoji} ${escapeHtml(aw.name)}</span>`)
              .join('')}</div>`
          : ''
      }
      <div class="nav-row" style="margin-top:10px">
        <button class="btn" data-again>🔁 Again!</button>
        <button class="btn accent" data-done>${doneLabel}</button>
      </div>
    </div>`;
    el.querySelector('.numpad').remove();
    confetti(16);
    el.querySelector('[data-again]').addEventListener('click', () => activityScreen(el, params, ctx));
    el.querySelector('[data-done]').addEventListener('click', () => navigate(backTo));
  }

  el.querySelector('[data-quit]').addEventListener('click', async () => {
    await ctx.save();
    navigate(backTo);
  });

  placeDogs();
  showQuestion();
}
