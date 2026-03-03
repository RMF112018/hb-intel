import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4000' },
      testIgnore: 'dev-harness.spec.ts',
    },
    {
      name: 'dev-harness',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3000' },
      testMatch: 'dev-harness.spec.ts',
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter @hbc/pwa preview',
      url: 'http://localhost:4000',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @hbc/dev-harness preview',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
