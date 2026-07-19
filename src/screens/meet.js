// Meet the table: an optional, repeatable, unfailable tap-through lesson —
// the table's dog shows you their tricks BEFORE anything asks a question
// (Baroody: counting → deriving → retrieval; this is the first two).
// Three card kinds: skip-count paw path (tap in order), groups builder
// (tap to add another group), anchor tricks (derive from a corner post).

import { navigate } from '../router.js';
import { dogForTable, dogSVG } from '../art/dogs.js';
import { escapeHtml } from '../ui.js';
import { say, cheer, sfx, buzz } from '../sound.js';

const BONE = '🦴';

function pathCard(t) {
  return {
    kind: 'path',
    title: `Count by ${t}s!`,
    speak: `Count by ${t}s — tap the paws in order!`,
    steps: Array.from({ length: 6 }, (_, i) => (i + 1) * t),
  };
}

function groupsCard(t, k) {
  return {
    kind: 'groups',
    title: `${k} groups of ${t}`,
    speak: `Tap to build ${k} groups of ${t}!`,
    t,
    k,
  };
}

function anchorCard(t, from, delta) {
  const base = t * from;
  const target = t * (from + delta);
  return {
    kind: 'anchor',
    title: `The ${t} × ${from + delta} trick`,
    speak:
      delta > 0
        ? `You know ${t} times ${from} is ${base}. One more group of ${t} makes ${target}!`
        : `You know ${t} times ${from} is ${base}. Take one group of ${t} away — ${target}!`,
    t,
    from,
    delta,
  };
}

export function meetScreen(el, params, ctx) {
  const t = Number(params.get('table')) || 2;
  const dog = dogForTable(t);
  const cards = [
    pathCard(t),
    groupsCard(t, 3),
    groupsCard(t, 4),
    anchorCard(t, 5, 1),
    anchorCard(t, 10, -1),
  ];
  let index = 0;

  el.innerHTML = `
    <div class="screen meet-screen">
      <div class="topbar">
        <button class="btn ghost small" data-quit>✕</button>
        <span class="spacer"></span>
        <strong>👋 Meet the ×${t}s</strong>
      </div>
      <div class="teach-banner">${dogSVG(dog, 44)}
        <span><b>${escapeHtml(dog.name)}</b> shows you the ×${t} tricks — no questions, just looking!</span></div>
      <h3 class="meet-title"></h3>
      <div class="meet-stage"></div>
      <div class="nav-row">
        <button class="btn accent" data-next-card>➡️ Next</button>
      </div>
    </div>`;

  const titleEl = el.querySelector('.meet-title');
  const stage = el.querySelector('.meet-stage');
  const nextBtn = el.querySelector('[data-next-card]');

  function showCard() {
    const c = cards[index];
    if (!c) return finish();
    titleEl.textContent = c.title;
    say(c.speak);
    stage.innerHTML = '';
    if (c.kind === 'path') {
      let at = 0;
      stage.innerHTML = `<div class="meet-path">${c.steps
        .map((v, i) => `<button class="path-num meet-step" data-i="${i}">${v}</button>`)
        .join('<span class="path-paw">🐾</span>')}</div>`;
      for (const b of stage.querySelectorAll('.meet-step')) {
        b.addEventListener('click', () => {
          const i = Number(b.dataset.i);
          if (i !== at) {
            b.classList.add('shake');
            setTimeout(() => b.classList.remove('shake'), 400);
            return;
          }
          at += 1;
          b.classList.add('lit');
          say(String(c.steps[i]));
          buzz(15);
          if (at === c.steps.length) cheer(`That's counting by ${t}s!`);
        });
      }
    } else if (c.kind === 'groups') {
      let g = 0;
      stage.innerHTML = `<div class="meet-total little-numeral big">0</div>
        <div class="meet-groups"></div>
        <button class="btn" data-add-group>➕ Add ${c.t} ${BONE}</button>`;
      const groupsEl = stage.querySelector('.meet-groups');
      const totalEl = stage.querySelector('.meet-total');
      stage.querySelector('[data-add-group]').addEventListener('click', () => {
        if (g >= c.k) return;
        g += 1;
        const grp = document.createElement('span');
        grp.className = 'little-items small meet-group';
        grp.innerHTML = Array.from({ length: c.t }, () => `<span class="li">${BONE}</span>`).join('');
        groupsEl.appendChild(grp);
        totalEl.textContent = g * c.t;
        say(`${g} ${g === 1 ? 'group' : 'groups'} of ${c.t} — ${g * c.t}!`);
        buzz(15);
        if (g === c.k) cheer(`${c.k} groups of ${c.t} make ${c.k * c.t}!`);
      });
    } else {
      const known = c.t * c.from;
      const target = c.t * (c.from + c.delta);
      stage.innerHTML = `<div class="meet-anchor">
          <p class="meet-known">${c.t} × ${c.from} = <b>${known}</b> ⭐</p>
          <button class="btn" data-reveal>${c.delta > 0 ? `➕ one more ${c.t}` : `➖ one ${c.t} away`}</button>
          <p class="meet-reveal" hidden>${c.t} × ${c.from + c.delta} = <b>${target}</b> 🎉</p>
        </div>`;
      stage.querySelector('[data-reveal]').addEventListener('click', () => {
        stage.querySelector('.meet-reveal').hidden = false;
        cheer(`${c.t} times ${c.from + c.delta} is ${target}!`);
        buzz(20);
      });
    }
  }

  function finish() {
    titleEl.textContent = `You met the ×${t}s! 🎉`;
    sfx.celebrate();
    cheer(`Now you know ${dog.name}'s tricks!`);
    stage.innerHTML = `<div class="card center">
        <div class="dog bounce">${dogSVG(dog, 104)}</div>
        <div class="nav-row" style="margin-top:10px">
          <button class="btn" data-practice>🐾 Practice!</button>
          <button class="btn ghost" data-again>🔁 Again</button>
        </div>
      </div>`;
    nextBtn.hidden = true;
    stage.querySelector('[data-practice]').addEventListener('click', () => navigate(`/quiz?table=${t}`));
    stage.querySelector('[data-again]').addEventListener('click', () => {
      index = 0;
      nextBtn.hidden = false;
      showCard();
    });
  }

  nextBtn.addEventListener('click', () => {
    index += 1;
    showCard();
  });
  el.querySelector('[data-quit]').addEventListener('click', () => navigate('/home'));
  showCard();
}
