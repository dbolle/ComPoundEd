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
const PORT = 4180;

// Prefer the preinstalled browser build; falls back to Playwright's default
// resolution if it isn't there.
const chromiumPath = `${homedir()}/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`;

export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
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
