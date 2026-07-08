import { navigate } from '../router.js';
import { buildRound, ROUND_SIZE } from '../engine/selector.js';
import { recordAnswer } from '../engine/leitner.js';
import { checkUnlocks } from '../engine/unlocks.js';
import { hintFor } from '../engine/hints.js';
import { buildNumpad, bindKeyboard, celebrationLine } from '../ui.js';
import { sfx, buzz } from '../sound.js';

const CHEERS = ['Woof! 🎉', 'Good dog-gone job! 🐶', 'Fetch-tastic! 🦴', 'Paw-some! 🐾'];

export function quizScreen(el, params, ctx) {
  const table = params.get('table');
  const scope = table ? { type: 'table', table: Number(table) } : { type: 'mixed' };
  const questions = buildRound(ctx.profile, scope);
  const results = [];
  let index = 0;
  let input = '';
  let busy = false;
  let startT = 0;
  let finished = false;
  let streak = 0;

  el.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <button class="btn ghost small" data-quit>✕ Stop</button>
        <span class="spacer"></span>
        <strong>${scope.type === 'table' ? `×${scope.table} table` : 'Mixed round'}</strong>
      </div>
      <div class="quiz-progress" aria-hidden="true">
        ${Array.from({ length: ROUND_SIZE }, () => '<span class="paw">🐾</span>').join('')}
      </div>
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

  function showQuestion() {
    const q = questions[index];
    qEl.textContent = `${q.a} × ${q.b}`;
    ansEl.textContent = ' ';
    ansEl.className = 'answer-box';
    fbEl.textContent = '';
    fbEl.className = 'feedback';
    startT = performance.now();
  }

  function press(k) {
    if (busy || finished) return;
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
    const r = recordAnswer(ctx.profile, q.a, q.b, correct, ms);
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
    streak = correct ? streak + 1 : 0;
    if (correct) {
      if (r.fast) sfx.fast();
      else sfx.correct();
      buzz(20);
      ansEl.classList.add('good');
      fbEl.textContent = celebrationLine(
        r,
        streak,
        CHEERS[Math.floor(Math.random() * CHEERS.length)]
      );
      fbEl.classList.add('good');
    } else {
      sfx.wrong();
      buzz(60);
      ansEl.classList.add('bad');
      fbEl.innerHTML = `${q.a} × ${q.b} = ${q.answer}<span class="hint">💡 ${hintFor(ctx.profile, q.a, q.b)}</span>`;
      fbEl.classList.add('bad');
    }
    // Wrong answers linger longer so there's time to read the hint.
    setTimeout(next, correct ? 700 : 3600);
  }

  async function next() {
    index += 1;
    input = '';
    busy = false;
    if (index >= questions.length) {
      finished = true;
      const newUnlocks = checkUnlocks(ctx.profile);
      await ctx.save();
      ctx.session.lastRound = { scope, results, newUnlocks };
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
