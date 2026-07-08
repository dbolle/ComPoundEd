import { navigate } from '../router.js';
import { tableProgress, TABLE_MIN, TABLE_MAX } from '../engine/leitner.js';
import { dogSVG, dogForTable } from '../art/dogs.js';
import { isUnlocked } from '../engine/unlocks.js';
import { confetti, escapeHtml } from '../ui.js';

function headline(score, total) {
  if (score === total) return 'Top dog!! 🏆';
  if (score >= total * 0.7) return 'Great fetch! 🎾';
  if (score >= total * 0.5) return 'Good digging! 🦴';
  return 'Every paw step counts! 🐾';
}

// The next dog worth chasing: the not-yet-unlocked table closest to mastery.
function nextGoal(profile) {
  let best = null;
  for (let t = TABLE_MIN; t <= TABLE_MAX; t++) {
    const dog = dogForTable(t);
    if (isUnlocked(profile, dog.id)) continue;
    const p = tableProgress(profile, t);
    if (!best || p.points > best.points) best = { dog, table: t, ...p };
  }
  return best;
}

export function resultsScreen(el, params, ctx) {
  const round = ctx.session.lastRound;
  if (!round) {
    navigate('/home');
    return;
  }
  const score = round.results.filter((r) => r.correct).length;
  const total = round.results.length;
  const count = (k) => round.results.filter((r) => r[k]).length;
  const badges = [];
  if (score === total) badges.push('🏆 Perfect round!');
  const speedy = count('fast');
  if (speedy >= 3) badges.push(`⚡ ${speedy} speedy answers`);
  const firsts = count('firstCorrect');
  if (firsts) badges.push(`🌟 ${firsts} new fact${firsts > 1 ? 's' : ''} learned`);
  const ups = count('leveledUp');
  if (ups) badges.push(`🐾 ${ups} level up${ups > 1 ? 's' : ''}`);
  const backs = count('comeback');
  if (backs) badges.push(`💪 ${backs} comeback${backs > 1 ? 's' : ''}`);
  const goal = nextGoal(ctx.profile);
  const againHref = round.scope.type === 'table' ? `/quiz?table=${round.scope.table}` : '/quiz';

  el.innerHTML = `
    <div class="screen">
      <h2 class="center">${headline(score, total)}</h2>
      <div class="big-score">${score} / ${total}</div>
      ${badges.length ? `<div class="badge-row">${badges.map((b) => `<span class="badge">${b}</span>`).join('')}</div>` : ''}
      <div class="unlocks"></div>
      ${
        goal
          ? `<div class="card center">
              <strong>Next pup: ${escapeHtml(goal.dog.name)}!</strong>
              <p class="muted" style="margin:6px 0">Get all the ×${goal.table} facts strong to adopt ${escapeHtml(goal.dog.name)} — ${goal.done} of ${goal.total} so far.</p>
              <span class="meter" style="display:inline-block;width:70%"><span style="width:${Math.round((goal.points / goal.maxPoints) * 100)}%"></span></span>
            </div>`
          : `<div class="card center"><strong>You've adopted the whole pack! 🏆</strong></div>`
      }
      <div class="nav-row" style="margin-top:auto">
        <button class="btn" data-again>🔁 Again!</button>
        <button class="btn accent" data-home>🏠 Home</button>
      </div>
    </div>`;

  const unlockBox = el.querySelector('.unlocks');
  for (const dog of round.newUnlocks) {
    const card = document.createElement('div');
    card.className = 'card unlock-card';
    card.innerHTML = `<div class="dog">${dogSVG(dog, 150)}</div>
      <h3>You adopted ${escapeHtml(dog.name)}! 🎉</h3>
      <p class="muted">The ×${dog.table} table is yours.</p>`;
    unlockBox.appendChild(card);
  }

  if (score >= total * 0.7 || round.newUnlocks.length) confetti();

  el.querySelector('[data-again]').addEventListener('click', () => navigate(againHref));
  el.querySelector('[data-home]').addEventListener('click', () => navigate('/home'));
  delete ctx.session.lastRound;
}
