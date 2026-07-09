// Shared drivers for the Compounded UI. All timings track the app's feedback
// windows (correct ≈ 700-800ms, wrong ≈ 3600ms incl. the teaching hint).

export const norm = (a, b) => (a <= b ? `${a}x${b}` : `${b}x${a}`);

export function stat(box, { attempts = 6, correct = 6, avgMs = 3000, ageMs = 86400e3 } = {}) {
  return { attempts, correct, avgMs, box, lastSeen: Date.now() - ageMs };
}

// Writes a profile doc straight into IndexedDB (page must already be on the
// app origin), then reloads so the app picks it up.
export async function seedProfile(page, doc) {
  await page.evaluate(
    (d) =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open('compounded', 1);
        req.onsuccess = () => {
          const t = req.result.transaction('profiles', 'readwrite');
          t.objectStore('profiles').put(d);
          t.oncomplete = resolve;
          t.onerror = () => reject(t.error);
        };
        req.onerror = () => reject(req.error);
      }),
    doc
  );
  await page.reload({ waitUntil: 'networkidle' });
}

export function readProfile(page, id) {
  return page.evaluate(
    (pid) =>
      new Promise((resolve) => {
        const req = indexedDB.open('compounded', 1);
        req.onsuccess = () => {
          const g = req.result.transaction('profiles').objectStore('profiles').get(pid);
          g.onsuccess = () => resolve(g.result ?? null);
        };
      }),
    id
  );
}

export async function createProfileUI(page, name) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.tap('[data-new]');
  await page.fill('.name-input', name);
  await page.tap('form[data-create] button[type=submit]');
  await page.waitForSelector('.hero');
}

export async function selectProfile(page, name) {
  await page.tap(`.profile-card:has-text("${name}")`);
  await page.waitForSelector('.hero');
}

async function answer(page, value) {
  for (const d of String(value)) await page.tap(`.numpad .key:text-is("${d}")`);
  await page.tap('.numpad .key.ok');
}

// Derives the correct answer from any question format the app shows:
// "7 × 8", "5 × _ = 20", or "20 ÷ 5".
export function answerFromText(text) {
  if (text.includes('÷')) {
    const [q, d] = text.split('÷').map((s) => parseInt(s.trim(), 10));
    return q / d;
  }
  const missing = text.match(/(\d+)\s*×\s*_\s*=\s*(\d+)/);
  if (missing) return Number(missing[2]) / Number(missing[1]);
  const [a, b] = text.split('×').map((s) => parseInt(s.trim(), 10));
  return a * b;
}

// Plays until the quiz/activity finishes or maxQuestions is hit. Returns the
// questions seen. options.answerFn(q, i) → value to type (default: correct).
// options.delayFn(q, i) → ms to wait before answering (for slow-answer tests).
export async function playQuestions(page, maxQuestions, options = {}) {
  const seen = [];
  for (let i = 0; i < maxQuestions; i++) {
    await page.waitForFunction(() =>
      /[×÷]/.test(document.querySelector('.question')?.textContent ?? '')
    );
    const text = (await page.textContent('.question')).trim();
    const right = answerFromText(text);
    // a/b populated for plain multiplication questions (what most specs use)
    const plain = text.match(/^(\d+)\s*×\s*(\d+)$/);
    const q = {
      a: plain ? Number(plain[1]) : undefined,
      b: plain ? Number(plain[2]) : undefined,
      text,
      right,
      i,
    };
    seen.push(q);
    if (options.delayFn) await page.waitForTimeout(options.delayFn(q, i));
    const value = options.answerFn ? options.answerFn(q, i) : right;
    await answer(page, value);
    if (options.afterAnswer) await options.afterAnswer(q, i);
    const wrong = value !== right;
    if (wrong) {
      // Wrong answers are self-paced: tap "Got it!" to move on.
      await page.waitForSelector('.feedback [data-next]');
      await page.tap('.feedback [data-next]');
      await page.waitForTimeout(200);
    } else {
      await page.waitForTimeout(1000);
    }
    if (await page.$('.big-score, [data-again]')) break;
  }
  return seen;
}

export async function holdGrownupsGate(page) {
  await page.waitForSelector('[data-hold]');
  const box = await (await page.$('[data-hold]')).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(2300);
  await page.mouse.up();
  await page.waitForSelector('.stat-row');
}

// The home grids are collapsed by default; expand before tapping into them.
export async function openTableGrid(page) {
  if (await page.locator('.table-grid').isHidden()) {
    await page.tap('[data-toggle="tables"]');
  }
  await page.waitForSelector('.table-grid:not([hidden]) .table-btn');
}

export async function openDivisionGrid(page) {
  if (await page.locator('.div-grid').isHidden()) {
    await page.tap('[data-toggle="division"]');
  }
  await page.waitForSelector('.div-grid:not([hidden]) .table-btn');
}

let uid = 0;
export function uniqueName(prefix) {
  return `${prefix}${Date.now() % 100000}${uid++}`;
}
