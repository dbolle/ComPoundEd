import { navigate } from '../router.js';
import { buildRound, buildDivisionRound, ROUND_SIZE } from '../engine/selector.js';
import { buildAdditionRound, buildSubtractionRound, WAVES } from '../engine/waves.js';
import {
  recordAnswer,
  recordDivisionAnswer,
  recordAdditionAnswer,
  recordSubtractionAnswer,
  recordEcho,
  getStat,
  getDivStat,
  getAddStat,
  getSubStat,
} from '../engine/leitner.js';
import { earnFromAnswer } from '../engine/money.js';
import { checkUnlocks } from '../engine/unlocks.js';
import { checkPetUnlocks } from '../engine/cozy.js';
import { bumpAnswer, bumpRound, checkAchievements } from '../engine/achievements.js';
import { tableTriedCount, divisionTriedCount } from '../engine/leitner.js';
import { dogForTable, dogForDivTable, dogSVG } from '../art/dogs.js';
import { hintFor, divisionHint, additionHint, subtractionHint } from '../engine/hints.js';
import { escapeHtml } from '../ui.js';
import { buildNumpad, bindKeyboard, celebrationLine } from '../ui.js';
import { sfx, buzz } from '../sound.js';

const CHEERS = ['Woof! 🎉', 'Good dog-gone job! 🐶', 'Fetch-tastic! 🦴', 'Paw-some! 🐾'];

export function quizScreen(el, params, ctx) {
  const table = params.get('table');
  const dtable = params.get('dtable');
  const wave = params.get('wave');
  const swave = params.get('swave');
  const scope = swave
    ? { type: 'sub', wave: Number(swave) }
    : wave
      ? { type: 'add', wave: Number(wave) }
      : dtable
      ? { type: 'division', table: Number(dtable) }
      : table
        ? { type: 'table', table: Number(table) }
        : { type: 'mixed' };
  const questions =
    scope.type === 'sub'
      ? buildSubtractionRound(ctx.profile, scope.wave)
      : scope.type === 'add'
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

  // Counting Path warm-up (research: skip counting is the counting→tables
  // connector): a barely-tried table starts with three unscored chain
  // questions before the round. Set to false to roll the feature back.
  const COUNTING_PATH = true;
  let chains =
    COUNTING_PATH && scope.type === 'table' && tableTriedCount(ctx.profile, scope.table) <= 3
      ? Array.from({ length: 3 }, (_, i) => {
          const t = scope.table;
          const k = i + 1;
          return {
            text: `${k * t}, ${(k + 1) * t}, ${(k + 2) * t}, _`,
            answer: (k + 3) * t,
            correction: `${k * t}, ${(k + 1) * t}, ${(k + 2) * t}, ${(k + 3) * t}`,
          };
        })
      : [];

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
        ${scope.type === 'table' ? `<button class="btn ghost small" data-meet-top aria-label="Meet the ×${scope.table}s">👋</button>` : ''}
        <strong>${
          scope.type === 'add' || scope.type === 'sub'
            ? `${scope.type === 'sub' ? '➖' : '➕'} ${WAVES[scope.wave].emoji} ${WAVES[scope.wave].name}`
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
             <span><b>${escapeHtml(teachDog.name)}</b> is still learning the ${scope.type === 'division' ? '÷' : '×'}${scope.table}s — teach them!</span>
             ${scope.type === 'table' ? `<button class="btn ghost small" data-meet>👋 Meet first</button>` : ''}</div>`
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
  banner?.querySelector('[data-meet]')?.addEventListener('click', () => navigate(`/meet?table=${scope.table}`));
  if (banner) {
    setTimeout(() => {
      banner.classList.add('leaving');
      setTimeout(() => banner.remove(), 600);
    }, 4500);
  }

  function showQuestion() {
    if (chains.length) {
      const c = chains[0];
      qEl.textContent = c.text;
      qEl.classList.add('compact');
      ansEl.textContent = ' ';
      ansEl.className = 'answer-box';
      fbEl.textContent = '🐾 Counting path — warm up!';
      fbEl.className = 'feedback';
      startT = performance.now();
      return;
    }
    const q = questions[index];
    // Echo-first: a fact's very first appearance in this kid's life is
    // SHOWN, not asked — the full equation with a "type it!" invitation.
    // The next appearance is a real question (recordEcho marks exposure).
    const statOf =
      q.kind === 'add' ? getAddStat : q.kind === 'sub' ? getSubStat : q.kind === 'div' ? getDivStat : getStat;
    const st = statOf(ctx.profile, q.a, q.b);
    q.echo = st.attempts === 0 && !st.seen;
    qEl.textContent = q.echo ? q.correction : q.text;
    qEl.classList.toggle('echo', !!q.echo);
    qEl.classList.toggle('compact', (q.echo ? q.correction : q.text).length > 8);
    ansEl.textContent = ' ';
    ansEl.className = 'answer-box';
    fbEl.textContent = q.echo ? '📣 New one! Type it in!' : '';
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
    const cur = questions[index];
    if (!chains.length && cur?.echo) {
      // errorless: right → gentle win; typo → wiggle and try again
      if (Number(input) === cur.answer) {
        recordEcho(ctx.profile, cur);
        results.push({ a: cur.a, b: cur.b, answer: cur.answer, given: cur.answer, correct: true, ms: 0, fast: false, leveledUp: false, echo: true });
        busy = true;
        sfx.correct();
        buzz(20);
        paws[index].classList.add('done');
        fbEl.textContent = '⭐ Now you know one more!';
        input = '';
        setTimeout(next, 900);
      } else {
        input = '';
        ansEl.textContent = ' ';
        ansEl.classList.add('shake');
        setTimeout(() => ansEl.classList.remove('shake'), 450);
        sfx.wrong();
      }
      return;
    }
    if (chains.length) {
      const c = chains[0];
      const good = Number(input) === c.answer;
      input = '';
      busy = true;
      if (good) {
        sfx.correct();
        fbEl.textContent = `⭐ ${c.correction}`;
      } else {
        sfx.wrong();
        fbEl.textContent = `${c.correction} — keep hopping!`;
      }
      setTimeout(() => {
        busy = false;
        chains = chains.slice(1);
        showQuestion();
      }, 1300);
      return;
    }
    const q = questions[index];
    const ms = performance.now() - startT;
    const given = Number(input);
    const correct = given === q.answer;
    const r =
      q.kind === 'sub'
        ? recordSubtractionAnswer(ctx.profile, q.a, q.b, correct, ms)
        : q.kind === 'add'
          ? recordAdditionAnswer(ctx.profile, q.a, q.b, correct, ms)
          : q.kind === 'div'
          ? recordDivisionAnswer(ctx.profile, q.a, q.b, correct, ms)
          : recordAnswer(ctx.profile, q.a, q.b, correct, ms);
    coins.push(
      ...earnFromAnswer(
        ctx.profile,
        { a: q.a, b: q.b, division: q.kind === 'div', add: q.kind === 'add', sub: q.kind === 'sub' },
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
        q.kind === 'sub'
          ? subtractionHint(q)
          : q.kind === 'add'
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
      const newPets = scope.type === 'add' || scope.type === 'sub' ? checkPetUnlocks(ctx.profile) : [];
      ctx.session.lastRound = { scope, results, newUnlocks, newAwards, sniffedRows, coins, newPets };
      navigate('/results');
    } else {
      showQuestion();
    }
  }

  el.querySelector('[data-meet-top]')?.addEventListener('click', () => navigate(`/meet?table=${scope.table}`));
  el.querySelector('[data-quit]').addEventListener('click', async () => {
    finished = true;
    await ctx.save();
    navigate('/home');
  });

  bindKeyboard(press);

  showQuestion();
}
