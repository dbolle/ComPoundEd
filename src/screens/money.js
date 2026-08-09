// Money Math — the track that turns Paw Bucks into curriculum (2.MD.8).
// Seven waves: know the coins, count one kind, mixed collections, equal
// value, make an amount, count the change, notation.
//
// Its own screen rather than a branch of quiz.js: that file already carries
// four tracks of branching plus hints and the speed bar, and coin building
// is a different interaction shape (a tray you add to and take from, not a
// single tap or a typed number). It borrows the pieces that already exist —
// the coin art, the numpad, the reversible coin tray the checkout uses.
//
// UNTIMED, by construction: `recordMoneyAnswer` passes an infinite speed
// bar. There is no ⚡, no countdown, and nothing here reads the clock.

import { navigate } from '../router.js';
import { say } from '../sound.js';
import { escapeHtml, buildNumpad, plural } from '../ui.js';
import { coinSVG, coinPx } from '../art/coins.js';
import { coinTray } from '../ui/cointray.js';
import { recordMoneyAnswer } from '../engine/leitner.js';
import { buildMoneyQuestion, centForm } from '../engine/moneyq.js';
import { checkPetUnlocks } from '../engine/cozy.js';
import { petSVG } from '../art/pets.js';
import { formatPaw } from '../engine/money.js';
import {
  MONEY_WAVES,
  currentWave,
  isWaveMastered,
  isWaveUnlocked,
  moneyProgress,
  nextSkills,
  payMastered,
  payMilestones,
  waveProgress,
} from '../engine/moneytrack.js';

const ROUND = 5;

// The kid-facing name of each wave. The grown-up names in moneywaves.js
// ("Mixed Collections", "Notation") are for docs and code; these follow
// docs/VOCABULARY.md's kid register — short, concrete, no jargon.
const KID_WAVE = [
  'Meet the coins',
  'Count one kind',
  'Count a handful',
  'Same as?',
  'Make it',
  'Count the change',
  'Two ways to write it',
];

const coinRow = (ids, size = 54) =>
  `<div class="coin-row">${ids.map((id) => coinSVG(id, size)).join('')}</div>`;

export function moneyScreen(el, params, ctx) {
  const p = ctx.profile;
  const asked = params.get('wave');
  const wave = asked != null && isWaveUnlocked(p, Number(asked)) ? Number(asked) : currentWave(p);

  let queue = nextSkills(p, wave, ROUND);
  let index = 0;
  let firstTry = true;
  let busy = false;
  const earned = [];
  const mastered = [];

  el.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <button class="btn ghost small" data-back>← Back</button>
        <span class="spacer"></span>
        <h2 style="margin:0">🪙 ${escapeHtml(KID_WAVE[wave] ?? 'Money Math')}</h2>
      </div>
      <div class="quiz-progress" data-pips></div>
      <div class="card center money-prompt" data-ask></div>
      <div class="money-stage" data-stage></div>
      <div class="little-fb center" data-fb></div>
    </div>`;

  const pipsEl = el.querySelector('[data-pips]');
  const askEl = el.querySelector('[data-ask]');
  const stageEl = el.querySelector('[data-stage]');
  const fbEl = el.querySelector('[data-fb]');
  el.querySelector('[data-back]').addEventListener('click', () => navigate('/'));

  pipsEl.innerHTML = '<span class="paw">🐾</span>'.repeat(ROUND);
  const pips = [...pipsEl.querySelectorAll('.paw')];

  function ask() {
    if (index >= queue.length) return finish();
    busy = false;
    firstTry = true;
    fbEl.textContent = '';
    stageEl.innerHTML = '';
    const skill = queue[index];
    const q = buildMoneyQuestion(skill, (p.money?.[skill]?.attempts ?? 0) + index);
    if (!q) {
      index += 1;
      return ask();
    }
    askEl.innerHTML = `<div class="money-ask">${escapeHtml(q.ask)}</div>`;
    say(q.say);
    render(q);
  }

  function render(q) {
    if (q.kind === 'choice') {
      if (q.coins?.length) stageEl.insertAdjacentHTML('beforeend', coinRow(q.coins, 84));
      const row = document.createElement('div');
      row.className = 'money-choices';
      for (const c of q.choices) {
        const b = document.createElement('button');
        b.className = 'btn money-choice';
        b.textContent = c;
        b.addEventListener('click', () => judge(q, c === q.answer, b));
        row.appendChild(b);
      }
      stageEl.appendChild(row);
      return;
    }

    if (q.kind === 'total') {
      stageEl.insertAdjacentHTML('beforeend', coinRow(q.coins));
      typedAnswer(q);
      return;
    }

    if (q.kind === 'pile') {
      stageEl.insertAdjacentHTML(
        'beforeend',
        `<div class="money-target">${coinRow(q.coins, 48)}</div>`
      );
      const row = document.createElement('div');
      row.className = 'money-piles';
      for (const opt of q.options) {
        const b = document.createElement('button');
        b.className = 'btn money-pile';
        b.innerHTML = coinRow(opt.coins, 38);
        b.setAttribute('aria-label', `A pile worth ${opt.cents} ${plural(opt.cents, 'cent')}`);
        b.addEventListener('click', () => judge(q, opt.cents === q.answer, b));
        row.appendChild(b);
      }
      stageEl.appendChild(row);
      return;
    }

    // build / change — the reversible tray, so nothing is ever a fail state
    const host = document.createElement('div');
    stageEl.appendChild(host);
    const done = document.createElement('button');
    done.className = 'btn accent';
    done.disabled = true;
    done.textContent = q.kind === 'change' ? '💰 Take the change!' : "✓ That's it!";
    coinTray(host, {
      target: q.target,
      start: q.kind === 'change' ? q.price : 0,
      countUp: q.kind === 'change',
      say,
      onChange: (_picked, got) => {
        done.disabled = got !== q.target;
      },
    });
    done.addEventListener('click', () => judge(q, true, done));
    stageEl.appendChild(done);
  }

  function typedAnswer(q) {
    const box = document.createElement('div');
    box.className = 'money-typed';
    box.innerHTML = `<div class="little-numeral" data-typed>–</div><div class="numpad" data-pad></div>`;
    stageEl.appendChild(box);
    const out = box.querySelector('[data-typed]');
    let typed = '';
    buildNumpad(box.querySelector('[data-pad]'), (k) => {
      if (busy) return;
      if (k === 'del') typed = typed.slice(0, -1);
      else if (k === 'ok') {
        if (!typed) return;
        return judge(q, Number(typed) === q.answer, null, () => {
          typed = '';
          out.textContent = '–';
        });
      } else if (typed.length < 4) typed += k;
      out.textContent = typed ? `${typed}¢` : '–';
    });
  }

  function judge(q, correct, btn, onRetry) {
    if (busy) return;
    if (!correct) {
      firstTry = false;
      btn?.classList.add('dim', 'shake');
      fbEl.textContent = '🐾';
      say('Try again!');
      onRetry?.();
      return;
    }
    busy = true;
    btn?.classList.add('win');
    fbEl.textContent = '⭐';
    pips[index]?.classList.add('done');

    // Untimed: the ms argument is ignored by recordMoneyAnswer's infinite
    // bar. Only a FIRST-TRY answer counts as knowing it — a retry still
    // records the attempt, so the box can fall, which is what keeps a
    // guessed-through identity from mastering.
    const before = p.money?.[q.skill]?.box ?? 0;
    recordMoneyAnswer(p, q.skill, firstTry, 0);
    const after = p.money?.[q.skill]?.box ?? 0;
    if (before < 3 && after >= 3) {
      mastered.push(q.skill);
      const txn = payMastered(p, q.skill);
      if (txn) earned.push(txn);
    }
    setTimeout(() => {
      index += 1;
      ask();
    }, 700);
  }

  async function finish() {
    const wasMastered = isWaveMastered(p, wave);
    const coins = [...earned, ...payMilestones(p)];
    const pets = checkPetUnlocks(p);
    await ctx.save();

    const { done, total } = waveProgress(p, wave);
    const all = moneyProgress(p);
    const cents = coins.reduce((s, t) => s + t.cents, 0);
    askEl.innerHTML = '';
    stageEl.innerHTML = `
      <div class="card center">
        <div class="big-cheer">${wasMastered ? '🏆' : '⭐'}</div>
        <h3 style="margin:.2em 0">${wasMastered ? 'Wave finished!' : 'Nice counting!'}</h3>
        <p class="muted">${escapeHtml(KID_WAVE[wave])}: ${done} of ${total}</p>
        ${cents ? `<div class="badge-row" style="justify-content:center"><span class="badge">🐷 ${formatPaw(cents)} saved!</span></div>` : ''}
        ${
          pets.length
            ? `<div class="new-pet">${pets
                .map((u) => `${petSVG(u.pet, 96)}<div class="name">${escapeHtml(u.pet.name)} joined you!</div>`)
                .join('')}</div>`
            : ''
        }
        <p class="muted" style="font-size:.85rem">Money Math: ${all.done} of ${all.total}</p>
        <div class="nav-row" style="margin-top:10px">
          <button class="btn accent" data-again>🔁 Again</button>
          <button class="btn ghost" data-home>🏠 Home</button>
        </div>
      </div>`;
    if (pets.length) say(`${pets[0].pet.name} joined you!`);
    stageEl.querySelector('[data-again]').addEventListener('click', () => {
      queue = nextSkills(p, currentWave(p), ROUND);
      index = 0;
      earned.length = 0;
      pips.forEach((x) => x.classList.remove('done'));
      ask();
    });
    stageEl.querySelector('[data-home]').addEventListener('click', () => navigate('/'));
  }

  ask();
}

// The track card both homes show. Kept here so the two homes cannot
// describe the track differently.
export function moneyCard(profile) {
  const w = currentWave(profile);
  const { done, total } = waveProgress(profile, w);
  const all = moneyProgress(profile);
  return `
    <button class="btn track-card" data-money>
      <span class="track-icon">🪙</span>
      <span class="track-body">
        <strong>Money Math</strong>
        <span class="muted">${escapeHtml(KID_WAVE[w])} · ${done}/${total}</span>
      </span>
      <span class="track-meter"><span style="width:${all.total ? (all.done / all.total) * 100 : 0}%"></span></span>
    </button>`;
}

export { KID_WAVE, MONEY_WAVES };
