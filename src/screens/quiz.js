import { navigate } from '../router.js';
import { buildRound, buildDivisionRound, ROUND_SIZE } from '../engine/selector.js';
import { buildAdditionRound, WAVES } from '../engine/waves.js';
import { recordAnswer, recordDivisionAnswer, recordAdditionAnswer } from '../engine/leitner.js';
import { earnFromAnswer } from '../engine/money.js';
import { checkUnlocks } from '../engine/unlocks.js';
import { checkPetUnlocks } from '../engine/cozy.js';
import { bumpAnswer, bumpRound, checkAchievements } from '../engine/achievements.js';
import { tableTriedCount, divisionTriedCount } from '../engine/leitner.js';
import { dogForTable, dogForDivTable, dogSVG } from '../art/dogs.js';
import { hintFor, divisionHint, additionHint } from '../engine/hints.js';
import { escapeHtml } from '../ui.js';
import { buildNumpad, bindKeyboard, celebrationLine } from '../ui.js';
import { sfx, buzz } from '../sound.js';

const CHEERS = ['Woof! 🎉', 'Good dog-gone job! 🐶', 'Fetch-tastic! 🦴', 'Paw-some! 🐾'];

export function quizScreen(el, params, ctx) {
  const table = params.get('table');
  const dtable = params.get('dtable');
  const wave = params.get('wave');
  const scope = wave
    ? { type: 'add', wave: Number(wave) }
    : dtable
      ? { type: 'division', table: Number(dtable) }
      : table
        ? { type: 'table', table: Number(table) }
        : { type: 'mixed' };
  const questions =
    scope.type === 'add'
      ? buildAdditionRound(ctx.profile, scope.wave)
      : scope.type === 'division'
        ? buildDivisionRound(ctx.profile, scope.table)
        : buildRound(ctx.profile, scope);

  // Sniff-the-map: remember which rows were fully attempted before this
  // round, so finishing one can celebrate "sniffed every ×t fact".
  const sniffedBefore = new Set();
  for (let t = 1; t <= 12; t++) {
    if (tableTriedCount(ctx.profile, t) === 13) sniffedBefore.add(t);
  }

  // Untried table: reframe the round — the table's own dog is the one
  // learning, and the kid is the teacher.
  let teachDog = null;
  if (scope.type === 'table' && tableTriedCount(ctx.profile, scope.table) === 0) {
    teachDog = dogForTable(scope.table);
  } else if (scope.type === 'division' && divisionTriedCount(ctx.profile, scope.table) === 0) {
    teachDog = dogForDivTable(scope.table);
  }
  const results = [];
  const coins = []; // frontier earnings, tallied on the results screen
  let index = 0;
  let input = '';
  let busy = false;
  let awaitingNext = false;
  let startT = 0;
  let finished = false;
  const roundStart = performance.now();

  el.innerHTML = `
    <div class="screen game-screen">
      <div class="topbar">
        <button class="btn ghost small" data-quit>✕ Stop</button>
        <span class="spacer"></span>
        <strong>${
          scope.type === 'add'
            ? `${WAVES[scope.wave].emoji} ${WAVES[scope.wave].name}`
            : scope.type === 'division'
              ? `÷${scope.table} missing number`
              : scope.type === 'table'
                ? `×${scope.table} table`
                : 'Mixed round'
        }</strong>
      </div>
      <div class="quiz-progress" aria-hidden="true">
        ${Array.from({ length: ROUND_SIZE }, () => '<span class="paw">🐾</span>').join('')}
      </div>
      ${
        teachDog
          ? `<div class="teach-banner">${dogSVG(teachDog, 44)}
             <span><b>${escapeHtml(teachDog.name)}</b> is still learning the ${scope.type === 'division' ? '÷' : '×'}${scope.table}s — teach them!</span></div>`
          : ''
      }
      <div class="question"></div>
      <div class="answer-box" aria-live="assertive">&nbsp;</div>
      <div class="feedback"></div>
      <div class="numpad"></div>
    </div>`;

  const qEl = el.querySelector('.question');
  const ansEl = el.querySelector('.answer-box');
  const fbEl = el.querySelector('.feedback');
  const paws = [...el.querySelectorAll('.paw')];
  const pad = el.querySelector('.numpad');

  buildNumpad(pad, press);
  const banner = el.querySelector('.teach-banner');
  if (banner) {
    setTimeout(() => {
      banner.classList.add('leaving');
      setTimeout(() => banner.remove(), 600);
    }, 4500);
  }

  function showQuestion() {
    const q = questions[index];
    qEl.textContent = q.text;
    qEl.classList.toggle('compact', q.text.length > 8);
    ansEl.textContent = ' ';
    ansEl.className = 'answer-box';
    fbEl.textContent = '';
    fbEl.className = 'feedback';
    startT = performance.now();
  }

  function press(k) {
    if (finished) return;
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
    ansEl.textContent = input || ' ';
  }

  function submit() {
    if (!input) return;
    const q = questions[index];
    const ms = performance.now() - startT;
    const given = Number(input);
    const correct = given === q.answer;
    const r =
      q.kind === 'add'
        ? recordAdditionAnswer(ctx.profile, q.a, q.b, correct, ms)
        : q.kind === 'div'
          ? recordDivisionAnswer(ctx.profile, q.a, q.b, correct, ms)
          : recordAnswer(ctx.profile, q.a, q.b, correct, ms);
    coins.push(
      ...earnFromAnswer(
        ctx.profile,
        { a: q.a, b: q.b, division: q.kind === 'div', add: q.kind === 'add' },
        r
      )
    );
    results.push({
      a: q.a,
      b: q.b,
      answer: q.answer,
      given,
      correct,
      ms,
      fast: r.fast,
      leveledUp: r.leveledUp,
      firstCorrect: r.firstCorrect,
      comeback: r.comeback,
    });
    paws[index].classList.add(correct ? 'done' : 'missed');
    busy = true;
    const stats = bumpAnswer(ctx.profile, r);
    if (correct) {
      if (r.fast) sfx.fast();
      else sfx.correct();
      buzz(20);
      ansEl.classList.add('good');
      fbEl.textContent = celebrationLine(
        r,
        stats.currentStreak,
        CHEERS[Math.floor(Math.random() * CHEERS.length)]
      );
      fbEl.classList.add('good');
      setTimeout(next, 700);
    } else {
      sfx.wrong();
      buzz(60);
      ansEl.classList.add('bad');
      const hint =
        q.kind === 'add'
          ? additionHint(q.a, q.b)
          : q.kind === 'div'
            ? divisionHint(q.a, q.b)
            : hintFor(ctx.profile, q.a, q.b);
      const brave = r.firstAttempt
        ? '<span class="hint brave">🦁 Brand-new fact — trying it is the win!</span>'
        : '';
      // Self-paced: the hint stays until the kid says they're ready.
      fbEl.innerHTML = `${q.correction}${brave}<span class="hint">💡 ${hint}</span>
        <button class="btn got-it" data-next>👍 Got it!</button>`;
      fbEl.classList.add('bad');
      awaitingNext = true;
      pad.hidden = true; // the hint + Got it! take the numpad's space
      fbEl.querySelector('[data-next]').addEventListener('click', gotIt);
    }
  }

  function gotIt() {
    if (!awaitingNext) return;
    awaitingNext = false;
    next();
  }

  async function next() {
    pad.hidden = false;
    index += 1;
    input = '';
    busy = false;
    if (index >= questions.length) {
      finished = true;
      const newUnlocks = checkUnlocks(ctx.profile);
      bumpRound(ctx.profile, {
        perfect: results.length === questions.length && results.every((x) => x.correct),
        durationMs: performance.now() - roundStart,
      });
      const newAwards = checkAchievements(ctx.profile);
      const sniffedRows = [];
      for (let t = 1; t <= 12; t++) {
        if (!sniffedBefore.has(t) && tableTriedCount(ctx.profile, t) === 13) sniffedRows.push(t);
      }
      await ctx.save();
      const newPets = scope.type === 'add' ? checkPetUnlocks(ctx.profile) : [];
      ctx.session.lastRound = { scope, results, newUnlocks, newAwards, sniffedRows, coins, newPets };
      navigate('/results');
    } else {
      showQuestion();
    }
  }

  el.querySelector('[data-quit]').addEventListener('click', async () => {
    finished = true;
    await ctx.save();
    navigate('/home');
  });

  bindKeyboard(press);

  showQuestion();
}
