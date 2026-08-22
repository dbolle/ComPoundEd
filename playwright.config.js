import { defineConfig } from '@playwright/test';
import { networkInterfaces, homedir } from 'node:os';
import { existsSync } from 'node:fs';

// Tests target the machine's LAN IP so the app runs in an INSECURE context,
// like the kids' devices on http://<server-ip>:8091 — this keeps regressions
// around secure-context-only APIs (crypto.randomUUID) covered. Set
// TEST_HOST=127.0.0.1 to force a secure-context run instead.
function lanIP() {
  for (const list of Object.values(networkInterfaces())) {
    for (const ni of list ?? []) {
      if (ni.family === 'IPv4' && !ni.internal) return ni.address;
    }
  }
  return '127.0.0.1';
}

const HOST = process.env.TEST_HOST ?? lanIP();
// TEST_PORT lets concurrent checkouts run the suite at the same time. With a
// hard-coded port plus `reuseExistingServer: true`, two runs SHARE one server
// and therefore one sync directory — and the lifecycle and sync specs use
// FIXED profile ids (`del-kid`, `res-kid`, ...), so they collide and fail in
// ways that look like flakiness. Same root cause as the res-kid tombstone.
const PORT = Number(process.env.TEST_PORT ?? 4180);
// Node's fetch() refuses the WHATWG "bad port" list outright, and several specs
// call fetch(baseURL) directly. Picking one of these produces `TypeError: fetch
// failed / cause: bad port` from a line that looks nothing like a port problem —
// it cost a full 10-minute suite run to find. 4190 (ManageSieve) is the one in
// this range and is easy to reach for when handing ports out to parallel runs.
const BAD_PORTS = new Set([
  1719, 1720, 1723, 2049, 3659, 4045, 4190, 5060, 5061, 6000, 6566, 6665, 6666,
  6667, 6668, 6669, 6697, 10080,
]);
if (!Number.isInteger(PORT) || PORT < 1024 || PORT > 65535 || BAD_PORTS.has(PORT)) {
  throw new Error(
    `TEST_PORT=${process.env.TEST_PORT} is unusable: ${BAD_PORTS.has(PORT)
      ? `port ${PORT} is on the WHATWG bad-port list and fetch() will refuse it`
      : 'not an integer in 1024..65535'}. Pick another.`,
  );
}
// @secure-tagged specs (service worker, offline, some privacy checks) need
// a secure context (SWs don't register on a plain LAN-IP origin). The
// default run excludes them; TEST_HOST=127.0.0.1 ONLY_SECURE=1 runs only
// them. CI runs both lanes (see .github/workflows/pages.yml).
const SECURE_CTX = HOST === '127.0.0.1' || HOST === 'localhost';

// Prefer the preinstalled browser build; falls back to Playwright's default
// resolution if it isn't there.
const chromiumPath = `${homedir()}/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`;

export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  grep: process.env.ONLY_SECURE ? /@secure/ : undefined,
  grepInvert: SECURE_CTX && process.env.ONLY_SECURE ? undefined : /@secure/,
  fullyParallel: false,
  workers: 2,
  reporter: [['list']],
  use: {
    baseURL: `http://${HOST}:${PORT}`,
    // iPhone-shaped touch device on Chromium (WebKit needs root-only libs).
    viewport: { width: 390, height: 664 },
    hasTouch: true,
    isMobile: true,
    launchOptions: existsSync(chromiumPath) ? { executablePath: chromiumPath } : {},
  },
  webServer: {
    command: `node tests/server.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: true,
  },
});
