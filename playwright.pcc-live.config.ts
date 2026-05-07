import { defineConfig, devices, type Project } from '@playwright/test';

const storageState = process.env.PCC_LIVE_STORAGE_STATE?.trim();
const braveExecutablePath = process.env.PCC_LIVE_BRAVE_EXECUTABLE_PATH?.trim();

const baseUse = {
  ...devices['Desktop Chrome'],
  storageState: storageState && storageState.length > 0 ? storageState : undefined,
  trace: 'retain-on-failure' as const,
};

const projects: Project[] = [
  {
    name: 'chromium',
    use: baseUse,
  },
];

if (braveExecutablePath && braveExecutablePath.length > 0) {
  projects.push({
    name: 'brave-optional',
    use: {
      ...baseUse,
      launchOptions: {
        executablePath: braveExecutablePath,
      },
    },
  });
}

export default defineConfig({
  testDir: './e2e/pcc-live',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    trace: 'retain-on-failure',
  },
  projects,
});
