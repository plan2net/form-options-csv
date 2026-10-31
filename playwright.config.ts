import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'Tests/E2E',
  workers: 1,
  // The first request after a TYPO3 cache flush is slow.
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost',
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
