/**
 * @design SF18-T09
 * Playwright smoke configuration for package-level bid-readiness validation.
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:6011',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'python3 -m http.server 6011 --bind 127.0.0.1 --directory storybook-static',
    url: 'http://127.0.0.1:6011',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
