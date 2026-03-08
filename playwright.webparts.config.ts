/**
 * Playwright configuration for SPFx webpart E2E tests.
 * Runs against the dev harness (BW-8) with corrected webServer command.
 *
 * @decision D-PH7-BW-10
 * @see docs/architecture/plans/PH7-BW-10-Testing-Infrastructure.md
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/webparts',
  fullyParallel: false, // Dev harness shares one Zustand store instance
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'pnpm --filter @hbc/dev-harness preview',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
