import { navigate } from '../router.js';
import {
  profileTotals,
  fastThresholdMs,
  isCalibrated,
  dueCount,
  divisionMasteredCount,
} from '../engine/leitner.js';
import {
  deleteProfile,
  listProfiles,
  importProfiles,
  isSyncEnabled,
  setSyncEnabled,
  isSoundEnabled,
  setSoundEnabled,
  syncNow,
} from '../data/store.js';
import { sfx, setSoundOn, currentVoiceName } from '../sound.js';
import { totalTiers } from '../engine/achievements.js';
import { balanceCents, formatPaw, ensureBucks, REASON_LABELS } from '../engine/money.js';
import { DOGS } from '../art/dogs.js';
import { PETS } from '../art/pets.js';
import { toast, escapeHtml } from '../ui.js';
import { SCHEMA_VERSION } from '../data/schema.js';

// 90 distinct normalized facts across tables 1–12 with factors 0–12.
const TOTAL_FACTS = 90;

// Little Pup progress: shown once the profile has any little activity.
// 81 = every skill key a little pup can make "known" (streak of 3).
const LITTLE_SKILL_TOTAL = 81;

function littleStatsCard(p) {
  const skills = p.little?.skills ?? {};
  const xp = p.little?.xp ?? 0;
  if (!p.subjects?.little && !xp && !Object.keys(skills).length) return '';
  const known = (prefix) =>
    Object.entries(skills).filter(([k, v]) => k.startsWith(prefix) && v.streak >= 3).length;
  const knownAll = Object.values(skills).filter((v) => v.streak >= 3).length;
  const pets = (p.petUnlocks ?? []).length;
  return `
      <div style="height:12px"></div>
      <div class="card">
        <h3>Little pup progress 🐣</h3>
        <div class="stat-row"><span>Stars collected (xp)</span><span>${xp}</span></div>
        <div class="stat-row"><span>Numbers known (all games)</span><span>${knownAll} / ${LITTLE_SKILL_TOTAL}</span></div>
        <div class="stat-row"><span>Counting 1–10</span><span>${known('count:')} / 10</span></div>
        <div class="stat-row"><span>Quick Look</span><span>${known('look:')} / 10</span></div>
        <div class="stat-row"><span>Number friends (5 & 10)</span><span>${known('bond')} / 17</span></div>
        <div class="stat-row"><span>Teen numbers</span><span>${known('teen:')} / 9</span></div>
        <div class="stat-row"><span>Cozy Corner friends</span><span>${pets} / ${PETS.length}</span></div>
      </div>`;
}

export function grownupsScreen(el, params, ctx) {
  el.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <button class="btn ghost small" data-back>← Back</button>
        <span class="spacer"></span>
        <h2 style="margin:0">Grown-ups 🔒</h2>
      </div>
      <div class="card center" data-gate>
        <p><strong>Grown-ups only!</strong></p>
        <p class="muted">Press and hold the bone for 2 seconds.</p>
        <button class="btn hold-btn" data-hold>🦴 Hold me<span class="fill"></span></button>
      </div>
      <div data-panel hidden></div>
    </div>`;

  const gate = el.querySelector('[data-gate]');
  const panel = el.querySelector('[data-panel]');
  const holdBtn = el.querySelector('[data-hold]');
  const fill = holdBtn.querySelector('.fill');

  let timer = null;
  const startHold = () => {
    fill.style.transition = 'width 2s linear';
    fill.style.width = '100%';
    timer = setTimeout(openPanel, 2000);
  };
  const cancelHold = () => {
    clearTimeout(timer);
    fill.style.transition = 'none';
    fill.style.width = '0%';
  };
  holdBtn.addEventListener('pointerdown', startHold);
  holdBtn.addEventListener('pointerup', cancelHold);
  holdBtn.addEventListener('pointerleave', cancelHold);
  holdBtn.addEventListener('contextmenu', (e) => e.preventDefault());

  function openPanel() {
    const p = ctx.profile;
    const { attempts, correct, mastered } = profileTotals(p);
    const accuracy = attempts ? Math.round((correct / attempts) * 100) : 0;
    const dogsEarned = p.unlocks.length;
    gate.hidden = true;
    panel.hidden = false;
    panel.innerHTML = `
      <div class="card">
        <h3>${escapeHtml(p.name)}'s progress</h3>
        <div class="stat-row"><span>Facts mastered</span><span>${mastered} / ${TOTAL_FACTS}</span></div>
        <div class="stat-row"><span>Questions answered</span><span>${attempts}</span></div>
        <div class="stat-row"><span>Accuracy</span><span>${accuracy}%</span></div>
        <div class="stat-row"><span>Dogs adopted</span><span>${dogsEarned} / ${DOGS.length}</span></div>
        <div class="stat-row"><span>Fast-answer bar</span><span>${(fastThresholdMs(p) / 1000).toFixed(1)}s${isCalibrated(p) ? '' : ' (calibrating)'}</span></div>
        <div class="stat-row"><span>Facts needing a refresh</span><span>${dueCount(p)}</span></div>
        <div class="stat-row"><span>Division facts mastered</span><span>${divisionMasteredCount(p)}</span></div>
        <div class="stat-row"><span>Award tiers earned</span><span>${totalTiers(p)}</span></div>
        <div class="stat-row"><span>Paw Bucks</span><span>${formatPaw(balanceCents(p))}</span></div>
      </div>
      ${littleStatsCard(p)}
      <div style="height:12px"></div>
      <div class="card">
        <h3>Paw Bucks ledger</h3>
        <p class="muted" style="font-size:.85rem">Coins follow the learning: a paw nickel when a fact is first mastered, a
        whole Paw Buck for a whole table, a penny for polishing a rusty fact (up to 5¢ a day), and a paw dime per
        pet-sitting visit (first two a day). Fully-mastered facts don't pay — practice there earns praise and awards
        instead. Game money only — never real currency.</p>
        <div data-ledger></div>
      </div>
      <div style="height:12px"></div>
      <div class="card">
        <h3>About Compounded</h3>
        <p class="muted">Each fact climbs levels: careful answers (like skip counting) build the
        first levels, and quick recall builds the rest — so a fact is only "mastered" once it's
        truly memorized, but working it out still earns visible progress. Mastering a whole
        table earns a new dog for the pack. The "fast" bar tunes itself to each kid's own
        reading and tapping speed, so quick counts as quick <em>for them</em>. Mastered facts
        get "rusty" after a while without practice and quietly come back around in rounds —
        levels and adopted dogs are never taken away.</p>
        <p class="muted"><strong>Privacy:</strong> everything is stored only on this device.
        No accounts, no ads, no tracking — ever.</p>
      </div>
      <div style="height:12px"></div>
      <div class="card">
        <h3>Settings</h3>
        <div class="nav-row">
          <button class="btn ghost small" data-sound-toggle></button>
        </div>
        <p class="muted" style="font-size:.8rem;margin:10px 0 0">🗣️ Speech voice: ${escapeHtml(currentVoiceName())}.
        On iPhone/iPad, downloading a nicer voice (Settings → Accessibility → Spoken Content →
        Voices, look for "Enhanced") makes the app pick it up automatically.</p>
      </div>
      <div style="height:12px"></div>
      <div class="card">
        <h3>What ${escapeHtml(p.name)} sees</h3>
        <p class="muted" style="font-size:.85rem">Choose the parts of the app this player uses. Progress is always kept, even for hidden parts.</p>
        <div class="nav-row">
          <button class="btn ghost small" data-subj="little"></button>
          <button class="btn ghost small" data-subj="bridge"></button>
        </div>
        <div style="height:8px"></div>
        <div class="nav-row">
          <button class="btn ghost small" data-subj="tables"></button>
          <button class="btn ghost small" data-subj="childCanSwitch"></button>
        </div>
        <div style="height:8px"></div>
        <div class="nav-row">
          <button class="btn ghost small" data-subj="hideSitting"></button>
        </div>
        <p class="muted" style="font-size:.85rem;margin:12px 0 6px">Times tables shown (none picked = all):</p>
        <div class="limit-grid" data-limit></div>
      </div>
      <div style="height:12px"></div>
      <div class="card">
        <h3>Family backup</h3>
        <p class="muted">Keeps every player's progress safe on your home server — this
        network only, never the internet. Also works as a restore point for new devices.</p>
        <div class="nav-row">
          <button class="btn ghost small" data-sync-toggle></button>
          <button class="btn ghost small" data-sync-now>💾 Back up now</button>
        </div>
        <div style="height:8px"></div>
        <div class="nav-row">
          <button class="btn ghost small" data-export>⬇️ Export all players</button>
          <button class="btn ghost small" data-export-one>⬇️ Just ${escapeHtml(p.name)}</button>
        </div>
        <div style="height:8px"></div>
        <div class="nav-row">
          <button class="btn ghost small" data-import>⬆️ Import from file</button>
        </div>
        <input type="file" accept=".json,application/json" hidden />
      </div>
      <div style="height:12px"></div>
      <div class="nav-row">
        <button class="btn ghost small" data-switch>🔄 Switch player</button>
        <button class="btn danger small" data-delete>🗑️ Delete this player</button>
      </div>
      <p class="muted center" style="font-size:.75rem;margin:14px 0 0">Compounded v${typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'} · saves v${SCHEMA_VERSION}</p>`;

    const soundBtn = panel.querySelector('[data-sound-toggle]');
    const renderSound = () => {
      soundBtn.textContent = isSoundEnabled() ? '🔊 Sounds & buzz: on' : '🔇 Sounds & buzz: off';
    };
    renderSound();
    soundBtn.addEventListener('click', async () => {
      await setSoundEnabled(!isSoundEnabled());
      setSoundOn(isSoundEnabled());
      renderSound();
      if (isSoundEnabled()) sfx.correct(); // audible sample of the new state
    });

    // Subject visibility switches. Each is a plain boolean on subjects;
    // the little toggle keeps its friendly toast.
    const SUBJ_LABELS = {
      little: (v) => (v ? '🐣 Little pup: on' : '🧒 Little pup: off'),
      bridge: (v) => (v ? '➕ Adding games: on' : '➕ Adding games: off'),
      tables: (v) => (v ? '✖️ Times tables: on' : '✖️ Times tables: off'),
      childCanSwitch: (v) => (v ? '🔀 Child can switch: yes' : '🔀 Child can switch: no'),
      hideSitting: (v) => (v ? '🏡 Pet sitting: hidden' : '🏡 Pet sitting: shown'),
    };
    for (const btn of panel.querySelectorAll('[data-subj]')) {
      const key = btn.dataset.subj;
      const render = () => {
        btn.textContent = SUBJ_LABELS[key](!!p.subjects?.[key]);
      };
      render();
      btn.addEventListener('click', async () => {
        p.subjects = { ...(p.subjects ?? {}), [key]: !p.subjects?.[key] };
        await ctx.save();
        render();
        if (key === 'little') {
          toast(
            p.subjects.little
              ? `${p.name} now sees the counting games 🐣`
              : `${p.name} now sees the full app 🧒`
          );
        }
      });
    }

    const limitGrid = panel.querySelector('[data-limit]');
    const renderLimit = () => {
      limitGrid.innerHTML = '';
      const limit = p.subjects?.limitTables ?? [];
      for (let t = 1; t <= 12; t++) {
        const chip = document.createElement('button');
        chip.className = `limit-chip${!limit.length || limit.includes(t) ? ' on' : ''}`;
        chip.textContent = `×${t}`;
        chip.addEventListener('click', async () => {
          let next = limit.length ? [...limit] : [];
          if (next.includes(t)) next = next.filter((x) => x !== t);
          else next.push(t);
          if (next.length === 12) next = []; // all picked = no limit
          p.subjects = { ...(p.subjects ?? {}), limitTables: next.sort((x, y) => x - y) };
          await ctx.save();
          renderLimit();
        });
        limitGrid.appendChild(chip);
      }
    };
    renderLimit();

    const toggleBtn = panel.querySelector('[data-sync-toggle]');
    const renderToggle = () => {
      toggleBtn.textContent = isSyncEnabled() ? '🟢 Backup: on' : '⚪ Backup: off';
    };
    renderToggle();
    toggleBtn.addEventListener('click', async () => {
      await setSyncEnabled(!isSyncEnabled());
      renderToggle();
      if (isSyncEnabled()) {
        await syncNow();
        toast('Family backup is on 🏡');
      } else {
        toast('Family backup turned off');
      }
    });
    panel.querySelector('[data-sync-now]').addEventListener('click', async () => {
      if (!isSyncEnabled()) {
        toast('Turn backup on first');
        return;
      }
      await syncNow();
      toast('Backed up to the home server 💾');
    });

    // Same file format for both — import handles either, anywhere.
    const exportProfiles = (profiles, label) => {
      const data = {
        app: 'compounded',
        exportedAt: new Date().toISOString(),
        profiles,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `compounded-backup-${label}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    };
    panel.querySelector('[data-export]').addEventListener('click', async () => {
      exportProfiles(await listProfiles(), 'all');
    });
    panel.querySelector('[data-export-one]').addEventListener('click', () => {
      exportProfiles([p], p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'player');
    });
    const fileInput = panel.querySelector('input[type=file]');
    panel.querySelector('[data-import]').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        const docs = Array.isArray(data.profiles) ? data.profiles : [];
        const n = await importProfiles(docs);
        toast(n ? `Imported ${n} player${n > 1 ? 's' : ''} 🐾` : 'No players found in that file');
      } catch {
        toast("That file doesn't look like a Compounded backup");
      }
      fileInput.value = '';
    });

    const ledger = panel.querySelector('[data-ledger]');
    const txns = [...ensureBucks(p).txns].sort((a, b) => b.at - a.at).slice(0, 8);
    ledger.innerHTML = txns.length
      ? txns
          .map(
            (t) =>
              `<div class="stat-row"><span>${new Date(t.at).toLocaleDateString()} · ${REASON_LABELS[t.reason] ?? t.reason}</span><span>${t.cents > 0 ? '+' : ''}${formatPaw(t.cents)}</span></div>`
          )
          .join('')
      : '<p class="muted" style="margin:0">No transactions yet.</p>';

    panel.querySelector('[data-switch]').addEventListener('click', () => navigate('/profiles'));
    panel.querySelector('[data-delete]').addEventListener('click', async () => {
      const sure = window.confirm(
        `Delete ${p.name} and all their progress? This cannot be undone.`
      );
      if (!sure) return;
      await deleteProfile(p.id);
      await ctx.switchProfile(null);
      navigate('/profiles');
    });
  }

  el.querySelector('[data-back]').addEventListener('click', () => navigate('/home'));
}
