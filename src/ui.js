// iOS Safari doesn't reliably apply :active during fast taps (and the default
// tap highlight is disabled), so press feedback is driven by pointer events:
// a .pressed class with a minimum visible duration guarantees every tap
// flashes, no matter how quick. One delegated listener covers all buttons.
export function initPressFeedback(minMs = 150) {
  document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    btn.classList.add('pressed');
    const t0 = performance.now();
    const release = () => {
      for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) {
        btn.removeEventListener(ev, release);
      }
      const remaining = Math.max(0, minMs - (performance.now() - t0));
      setTimeout(() => btn.classList.remove('pressed'), remaining);
    };
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) {
      btn.addEventListener(ev, release);
    }
  });
}

export function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

export function confetti(count = 26) {
  const box = document.createElement('div');
  box.className = 'confetti';
  const bits = ['🐾', '⭐', '🦴', '🎉'];
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.textContent = bits[i % bits.length];
    s.style.left = `${Math.random() * 100}%`;
    s.style.animationDuration = `${2.2 + Math.random() * 1.8}s`;
    s.style.animationDelay = `${Math.random() * 0.8}s`;
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 5000);
}

// One line of celebration for a correct answer, picking the most exciting
// thing that just happened. `r` is the flags object from recordAnswer.
export function celebrationLine(r, streak, fallback) {
  let msg;
  if ([3, 5, 8, 10].includes(streak)) msg = `🔥 ${streak} in a row!`;
  else if (r.firstCorrect) msg = '🌟 First time — nice!';
  else if (r.leveledUp) msg = '🐾 Level up!';
  else if (r.comeback) msg = '💪 You got it this time!';
  else msg = fallback;
  return r.fast ? `⚡ ${msg}` : msg;
}

// Builds the shared 0–9/⌫/✓ number pad into `container`; onKey receives
// '0'..'9', 'del', or 'ok'.
export function buildNumpad(container, onKey) {
  for (const k of ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok']) {
    const btn = document.createElement('button');
    btn.className = `key${k === 'ok' ? ' ok' : ''}${k === 'del' ? ' del' : ''}`;
    btn.textContent = k === 'del' ? '⌫' : k === 'ok' ? '✓' : k;
    btn.setAttribute('aria-label', k === 'del' ? 'Delete' : k === 'ok' ? 'Check answer' : k);
    btn.addEventListener('click', () => onKey(k));
    container.appendChild(btn);
  }
}

// Routes physical-keyboard digits/Enter/Backspace to the same onKey handler,
// cleaning itself up when the screen changes.
export function bindKeyboard(onKey) {
  const handler = (e) => {
    if (/^[0-9]$/.test(e.key)) onKey(e.key);
    else if (e.key === 'Backspace') onKey('del');
    else if (e.key === 'Enter') onKey('ok');
  };
  window.addEventListener('keydown', handler);
  window.addEventListener('hashchange', () => window.removeEventListener('keydown', handler), {
    once: true,
  });
}

export function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
}
