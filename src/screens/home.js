import { navigate } from '../router.js';
import {
  tableProgress,
  isTableMastered,
  divisionTableProgress,
  divisionTableUnlocked,
  isDivisionTableMastered,
  TABLE_MIN,
  TABLE_MAX,
} from '../engine/leitner.js';
import { sittingReady } from '../engine/selector.js';
import { suggestNext } from '../engine/suggest.js';
import { getUiPrefs, setUiPrefs } from '../data/store.js';
import { getDog, dogSVG, accessoriesFor, dirtFor, GUESTS } from '../art/dogs.js';
import { littleHomeScreen } from './little.js';
import { escapeHtml } from '../ui.js';

const tables = () => Array.from({ length: TABLE_MAX - TABLE_MIN + 1 }, (_, i) => TABLE_MIN + i);

export async function homeScreen(el, params, ctx) {
  const p = ctx.profile;
  if (p.subjects?.little) return littleHomeScreen(el, params, ctx);
  const prefs = await getUiPrefs(p.id);
  const next = suggestNext(p);
  const masteredM = tables().filter((t) => isTableMastered(p, t)).length;
  const masteredD = tables().filter((t) => isDivisionTableMastered(p, t)).length;
  const anyMastered = masteredM > 0;

  el.innerHTML = `
    <div class="screen">
      <div class="hero">
        <span class="avatar">${dogSVG(getDog(p.avatarDogId), 84, accessoriesFor(p, p.avatarDogId), dirtFor(p, getDog(p.avatarDogId)))}</span>
        <div>
          <h1>Hi, ${escapeHtml(p.name)}!</h1>
          <p class="muted">Ready to fetch some facts?</p>
        </div>
      </div>
      ${
        next
          ? `<button class="btn" data-suggest>${
              next.teach
                ? `🐶 Teach ${escapeHtml(next.teach)}: ${next.label}`
                : `🐾 Practice next: ${next.label}`
            }</button>`
          : ''
      }
      <button class="btn${next ? ' accent' : ''}" data-mixed>🎲 Mixed round!</button>
      <div data-sitting-slot></div>
      <button class="section-toggle${prefs.tablesOpen ? ' open' : ''}" data-toggle="tables" aria-expanded="${!!prefs.tablesOpen}">
        Pick a table <span class="sub">${masteredM}/12 ⭐</span><span class="chev">▸</span>
      </button>
      <div class="table-grid" ${prefs.tablesOpen ? '' : 'hidden'}></div>
      <div data-division-slot></div>
      <div class="nav-row three">
        <button class="btn accent" data-nav="/pack">🐶 Pack</button>
        <button class="btn accent" data-nav="/heatmap">🗺️ Map</button>
        <button class="btn accent" data-nav="/awards">🏆 Awards</button>
      </div>
      <div class="nav-row">
        <button class="btn ghost small" data-nav="/profiles">🔄 Switch player</button>
        <button class="btn ghost small" data-nav="/grownups">🔒 Grown-ups</button>
      </div>
    </div>`;

  const grid = el.querySelector('.table-grid');
  for (const t of tables()) {
    const { done, total, points, maxPoints } = tableProgress(p, t);
    const mastered = isTableMastered(p, t);
    const btn = document.createElement('button');
    btn.className = `table-btn${mastered ? ' mastered' : ''}`;
    btn.setAttribute('aria-label', `Practice the ${t}s table, ${done} of ${total} facts strong`);
    btn.innerHTML = `<span>${mastered ? '⭐ ' : ''}×${t}</span>
      <span class="meter"><span style="width:${Math.round((points / maxPoints) * 100)}%"></span></span>`;
    btn.addEventListener('click', () => navigate(`/quiz?table=${t}`));
    grid.appendChild(btn);
  }

  // Missing number & division: appears once any × table is mastered. Shows
  // only unlocked ÷tables plus the single next locked one — the padlock wall
  // adds nothing.
  if (anyMastered) {
    const slot = el.querySelector('[data-division-slot]');
    slot.innerHTML = `
      <button class="section-toggle${prefs.divisionOpen ? ' open' : ''}" data-toggle="division" aria-expanded="${!!prefs.divisionOpen}">
        Missing number &amp; division 🧩 <span class="sub">${masteredD}/12 ⭐</span><span class="chev">▸</span>
      </button>
      <div class="div-grid" ${prefs.divisionOpen ? '' : 'hidden'}></div>`;
    const dgrid = slot.querySelector('.div-grid');
    let lockedShown = false;
    let lockedRemaining = 0;
    for (const t of tables()) {
      const open = divisionTableUnlocked(p, t);
      if (!open && lockedShown) {
        lockedRemaining += 1;
        continue;
      }
      const mastered = isDivisionTableMastered(p, t);
      const { done, total, points, maxPoints } = divisionTableProgress(p, t);
      const btn = document.createElement('button');
      btn.className = `table-btn${mastered ? ' mastered' : ''}${open ? '' : ' locked'}`;
      if (open) {
        btn.setAttribute(
          'aria-label',
          `Practice missing-number and division for the ${t}s, ${done} of ${total} facts strong`
        );
        btn.innerHTML = `<span>${mastered ? '⭐ ' : ''}÷${t}</span>
          <span class="meter"><span style="width:${Math.round((points / maxPoints) * 100)}%"></span></span>`;
        btn.addEventListener('click', () => navigate(`/quiz?dtable=${t}`));
      } else {
        lockedShown = true;
        btn.disabled = true;
        btn.setAttribute('aria-label', `Master the ×${t} table to unlock division`);
        btn.innerHTML = `<span>🔒 ÷${t}</span><span class="meter"><span style="width:0%"></span></span>`;
      }
      dgrid.appendChild(btn);
    }
    if (lockedRemaining > 0) {
      const note = document.createElement('p');
      note.className = 'muted div-note';
      note.textContent = `${lockedRemaining} more unlock as you master their × tables!`;
      if (!prefs.divisionOpen) note.hidden = true;
      dgrid.after(note);
    }
  }

  // Section toggles remember their state per profile (device-local).
  for (const toggle of el.querySelectorAll('[data-toggle]')) {
    toggle.addEventListener('click', async () => {
      const which = toggle.dataset.toggle;
      const open = !toggle.classList.contains('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      const section = which === 'tables' ? el.querySelector('.table-grid') : el.querySelector('.div-grid');
      section.hidden = !open;
      const note = el.querySelector('.div-note');
      if (which === 'division' && note) note.hidden = !open;
      const key = which === 'tables' ? 'tablesOpen' : 'divisionOpen';
      await setUiPrefs(p.id, { ...(await getUiPrefs(p.id)), [key]: open });
    });
  }

  // Pet sitting appears once there's a baseline of solid facts to draw
  // quick wins from; the guest pup rotates daily.
  if (sittingReady(p)) {
    const guest = GUESTS[Math.floor(Date.now() / 86400000) % GUESTS.length];
    const sitBtn = document.createElement('button');
    sitBtn.className = 'sitting-card';
    sitBtn.innerHTML = `<span class="avatar">${dogSVG(guest, 64, accessoriesFor(p, guest.id))}</span>
      <span class="sitting-text"><strong>🏡 Pet sitting</strong>
      <span class="muted">${escapeHtml(guest.name)} needs a sitter today!</span></span>`;
    sitBtn.addEventListener('click', () => navigate(`/activity?sit=${guest.id}`));
    el.querySelector('[data-sitting-slot]').appendChild(sitBtn);
  }

  if (next) {
    el.querySelector('[data-suggest]').addEventListener('click', () => navigate(next.href));
  }
  el.querySelector('[data-mixed]').addEventListener('click', () => navigate('/quiz'));
  for (const b of el.querySelectorAll('[data-nav]')) {
    b.addEventListener('click', () => navigate(b.dataset.nav));
  }
}
