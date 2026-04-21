/**
 * Playwright config for visual proof capture.
 * Serves the pre-built Storybook static output and captures screenshots.
 */
import { defineConfig } from '@playwright/test';
import { join } from 'path';

export default defineConfig({
  testDir: join(__dirname),
  testMatch: [
    'capture-visual-proof.ts',
    'verify-safety-accessibility.spec.ts',
  ],
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',

  use: {
    baseURL: 'http://localhost:6007',
    screenshot: 'off',
  },

  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],

  webServer: {
    command: 'npx serve packages/ui-kit/storybook-static -l 6007',
    url: 'http://localhost:6007',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
