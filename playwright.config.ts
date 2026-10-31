import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'Tests/E2E',
  workers: 1,
  use: {
    baseURL: 'http://localhost',
    viewport: { width: 1440, height: 900 },
  },
});
