// PAW BUCKS coin art — the app's own fictional currency (src/art/pawcoins.js).
// Split from the real-US-currency art in v1.55.0: Money Math teaches real
// money, the wallet and store spend Paw Bucks, and the two must keep their
// own art. THIS file is the fictional one, so a paw print, "Paw Dime" and a
// printed face value are all CORRECT here — a made-up coin has no real
// design a child could otherwise read.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { DENOMS } from '../src/engine/money.js';
import {
  coinSVG,
  coinPx,
  coinLabel,
  COIN_IDS,
  COIN_MM,
  COIN_SCALE,
  FACE_VALUE,
} from '../src/art/pawcoins.js';

const SRC = readFileSync('src/art/pawcoins.js', 'utf8');
const COINS = ['penny', 'nickel', 'dime', 'quarter']; // the discs; buck is a note

// Minimal tag walker: catches truncated art, stray "</g>" and unclosed tags
// without needing a DOM.
function wellFormed(svg) {
  const stack = [];
  const tag = /<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|[^>"])*?)(\/?)>/g;
  let m;
  while ((m = tag.exec(svg))) {
    const [, close, name, , selfClose] = m;
    if (close) {
      if (stack.pop() !== name) return `mismatched </${name}>`;
    } else if (!selfClose) {
      stack.push(name);
    }
  }
  if (stack.length) return `unclosed <${stack.join('>, <')}>`;
  // Everything left between tags must be plain text (the face values).
  if (svg.replace(tag, '').includes('<')) return 'stray "<" outside a tag';
  return '';
}

test('every DENOMS id has art, and no id is missing', () => {
  expect(COIN_IDS).toEqual(DENOMS.map((d) => d.id));
  expect(Object.keys(FACE_VALUE).sort()).toEqual(DENOMS.map((d) => d.id).sort());
  for (const d of DENOMS) {
    const svg = coinSVG(d.id, 40);
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain(`data-denom="${d.id}"`);
    expect(svg).not.toContain('undefined');
    expect(svg).not.toContain('NaN');
  }
  // An unknown denomination never crashes a screen — it draws nothing.
  expect(coinSVG('doubloon', 40)).toBe('');
  expect(coinPx('doubloon', 40)).toBe(null);
});

test('the face value is drawn on every coin — the whole point of the art', () => {
  const faces = { penny: '1¢', nickel: '5¢', dime: '10¢', quarter: '25¢', buck: '$1' };
  for (const [id, face] of Object.entries(faces)) {
    expect(FACE_VALUE[id]).toBe(face);
    const svg = coinSVG(id, 40);
    expect(svg).toContain(`data-value="${face}"`);
    // Present as real text inside exactly one <text data-face> element — not
    // baked into a path, not split across tspans (a recognition activity
    // needs one element it can target, and the string must survive a copy).
    expect(svg).toContain(`<text data-face="${face}"`);
    expect(svg).toContain(`>${face}</text>`);
    expect(svg.match(/data-face=/g).length).toBe(1);
  }
});

test('diameters keep the real US ordering: dime < penny < nickel < quarter', () => {
  // The mint millimetres are the source of truth; the scales derive from them.
  expect(COIN_MM.dime).toBeLessThan(COIN_MM.penny);
  expect(COIN_MM.penny).toBeLessThan(COIN_MM.nickel);
  expect(COIN_MM.nickel).toBeLessThan(COIN_MM.quarter);
  expect(COIN_SCALE.quarter).toBe(1);

  for (const size of [26, 40, 90]) {
    const w = (id) => coinPx(id, size).w;
    expect(w('dime')).toBeLessThan(w('penny'));
    expect(w('penny')).toBeLessThan(w('nickel'));
    expect(w('nickel')).toBeLessThan(w('quarter'));
    expect(w('quarter')).toBe(size); // `size` IS the paw quarter's diameter
    // The dime being worth more than the bigger nickel is the teachable
    // conflict — if this ever inverts, the pedagogy is gone.
    expect(w('dime')).toBeLessThan(w('nickel'));
    // The note is a wide rectangle, not a disc: shape alone identifies it.
    const note = coinPx('buck', size);
    expect(note.w).toBeGreaterThan(note.h * 1.5);
    expect(note.w).toBeGreaterThan(w('quarter'));
  }

  // Rendered box matches the declared box at both ends of the range.
  for (const size of [26, 90]) {
    for (const id of COIN_IDS) {
      const { w, h } = coinPx(id, size);
      expect(coinSVG(id, size)).toContain(`width="${w}" height="${h}"`);
    }
  }
});

test('no title= anywhere: tooltips do not exist on a tablet', () => {
  expect(SRC).not.toContain('title=');
  expect(SRC).not.toContain('<title');
  for (const id of COIN_IDS) {
    for (const size of [26, 90]) {
      expect(coinSVG(id, size)).not.toContain('title');
    }
  }
});

test('renders well-formed at 26px and at 90px', () => {
  for (const size of [26, 46, 90, 200]) {
    for (const id of COIN_IDS) {
      const svg = coinSVG(id, size);
      expect(wellFormed(svg)).toBe('');
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('viewBox="0 0 100 ');
      const [, w, h] = svg.match(/width="([\d.]+)" height="([\d.]+)"/);
      expect(Number(w)).toBeGreaterThan(0);
      expect(Number(h)).toBeGreaterThan(0);
    }
  }
  // No <defs> and no id= attributes: a wallet inlines a dozen coins at once
  // and duplicate gradient ids would make them bleed into each other.
  for (const id of COIN_IDS) {
    expect(coinSVG(id, 40)).not.toContain('<defs');
    expect(coinSVG(id, 40)).not.toMatch(/\sid="/);
    expect(coinSVG(id, 40)).not.toContain('url(#');
  }
});

test('accessibility: role + aria-label by default, overridable, opt-out for decoration', () => {
  expect(coinLabel('dime')).toBe('Paw Dime, 10 cents');
  expect(coinLabel('penny')).toBe('Paw Penny, 1 cent'); // singular
  expect(coinLabel('buck')).toBe('Paw Buck, 100 cents'); // states the equivalence
  for (const id of COIN_IDS) {
    const svg = coinSVG(id, 40);
    expect(svg).toContain('role="img"');
    expect(svg).toContain(`aria-label="${coinLabel(id)}"`);
  }
  // Caller-supplied label (the store's "take a coin back" buttons want their
  // own wording), and a decorative mode for coins inside an already-named
  // control so a screen reader does not say it twice.
  expect(coinSVG('dime', 40, { label: 'Take a Paw Dime back' })).toContain(
    'aria-label="Take a Paw Dime back"'
  );
  const deco = coinSVG('dime', 40, { decorative: true });
  expect(deco).toContain('aria-hidden="true"');
  expect(deco).not.toContain('role="img"');
  expect(deco).not.toContain('aria-label');
  // Labels are escaped, so a stray quote can never break out of the attribute.
  expect(coinSVG('dime', 40, { label: 'a "big" <coin>' })).toContain(
    'aria-label="a &quot;big&quot; &lt;coin&gt;"'
  );
  // Callers can hang layout classes off it without losing the base hook.
  expect(coinSVG('dime', 40, { className: 'pile-coin' })).toContain(
    'class="coin-art pile-coin"'
  );
});

test('told apart without colour: every coin has its own rim treatment', () => {
  // Strip every colour and the face value, leaving only geometry. If the five
  // are still pairwise different, then a colour-blind or greyscale rendering
  // still distinguishes them by shape alone.
  const shapeOnly = (id) =>
    coinSVG(id, 100)
      .replace(/(fill|stroke)="[^"]*"/g, '')
      .replace(/opacity="[^"]*"/g, '')
      .replace(/data-(value|face)="[^"]*"/g, '')
      .replace(/aria-label="[^"]*"/g, '')
      .replace(/data-denom="[^"]*"/g, '')
      .replace(/>[^<>]+</g, '><')
      .replace(/\s+/g, ' ');
  const shapes = COIN_IDS.map(shapeOnly);
  expect(new Set(shapes).size).toBe(COIN_IDS.length);

  // And the treatments are the intended ones: plain penny, double-ringed
  // nickel, finely reeded dime, boldly reeded quarter, framed note.
  const lines = (id) => (coinSVG(id, 100).match(/<line /g) ?? []).length;
  expect(lines('penny')).toBe(0);
  expect(lines('nickel')).toBe(0);
  expect(lines('dime')).toBeGreaterThan(lines('quarter')); // fine vs bold reeding
  expect(lines('quarter')).toBeGreaterThan(0);
  expect(coinSVG('nickel', 100)).toContain('r="44"'); // the second rim ring
  expect(coinSVG('penny', 100)).not.toContain('r="44"');
  expect(coinSVG('buck', 100)).toContain('<rect'); // a note, not a disc
  expect(coinSVG('buck', 100)).not.toMatch(/<circle[^>]*r="4[0-9]"/);
});

test('dog-themed: a paw rides on every denomination, never over the value', () => {
  for (const id of COIN_IDS) {
    const svg = coinSVG(id, 90);
    expect(svg).toContain('<ellipse'); // the paw pad
    expect((svg.match(/<circle/g) ?? []).length).toBeGreaterThanOrEqual(4); // four toes
  }
  for (const id of COINS) {
    // On the discs the paw is a watermark drawn BEFORE the value, so it can
    // never sit on top of the digits, and faint enough not to compete.
    const svg = coinSVG(id, 90);
    expect(svg.indexOf('<ellipse')).toBeLessThan(svg.indexOf('data-face'));
    expect(svg).toMatch(/opacity="0\.1[0-9]?"/);
  }
  // The note carries its paw as a seal on the left, clear of the "$1" panel.
  expect(coinSVG('buck', 90)).toContain('<circle cx="18"');
});

test('e2e: the face value fits inside the coin and stays readable at 26px', async ({ page }) => {
  for (const size of [26, 90]) {
    await page.setContent(
      `<body style="margin:0">${COIN_IDS.map(
        (id) => `<div style="display:inline-block">${coinSVG(id, size)}</div>`
      ).join('')}</body>`
    );
    const seen = await page.$$eval('svg[data-denom]', (svgs) =>
      svgs.map((s) => {
        const t = s.querySelector('[data-face]');
        const sb = s.getBoundingClientRect();
        const tb = t.getBoundingClientRect();
        const cx = sb.x + sb.width / 2;
        const cy = sb.y + sb.height / 2;
        const corner = Math.max(
          ...[
            [tb.left, tb.top],
            [tb.right, tb.top],
            [tb.left, tb.bottom],
            [tb.right, tb.bottom],
          ].map(([x, y]) => Math.hypot(x - cx, y - cy))
        );
        return {
          id: s.dataset.denom,
          text: t.textContent,
          inkHeight: tb.height,
          widthRatio: tb.width / sb.width,
          cornerRatio: corner / sb.width,
        };
      })
    );
    expect(seen.map((c) => c.id)).toEqual(COIN_IDS);
    for (const c of seen) {
      expect(c.text).toBe(FACE_VALUE[c.id]);
      // The value never overflows its coin. The disc's outer edge is at
      // r = 0.47w; textLength locks the run's width, so this holds whichever
      // font the device resolves (measured max 0.442 in Chromium).
      expect(c.cornerRatio).toBeLessThan(0.46);
      expect(c.widthRatio).toBeLessThan(0.75);
      // ...and it is still big enough to read when the wallet is at its
      // smallest. Worst case is the dime: smallest coin, longest string —
      // 19px across at size 26, with ~10px of value type in it.
      expect(c.inkHeight).toBeGreaterThanOrEqual(size === 26 ? 8 : 30);
    }
  }
});
