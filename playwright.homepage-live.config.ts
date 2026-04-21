import { defineConfig } from '@playwright/test';

const storageState =
  process.env.HB_HOMEPAGE_LIVE_STORAGE_STATE || process.env.HB_KUDOS_LIVE_STORAGE_STATE;

export default defineConfig({
  testDir: './e2e/live-sharepoint',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    storageState: storageState && storageState.length > 0 ? storageState : undefined,
    trace: 'retain-on-failure',
  },
});
