import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { defineConfig, devices, type Project } from '@playwright/test';

import { PCC_DEFAULT_STORAGE_STATE_RELATIVE_TO_HOME } from './e2e/pcc-live/pcc-live.env';

const explicitStorageState = process.env.PCC_LIVE_STORAGE_STATE?.trim();
const defaultStorageState = path.join(os.homedir(), PCC_DEFAULT_STORAGE_STATE_RELATIVE_TO_HOME);
const resolvedStorageState =
  explicitStorageState && explicitStorageState.length > 0
    ? explicitStorageState
    : defaultStorageState;
const storageStateForRunner = fs.existsSync(resolvedStorageState)
  ? resolvedStorageState
  : undefined;

const braveExecutablePath = process.env.PCC_LIVE_BRAVE_EXECUTABLE_PATH?.trim();

const baseUse = {
  ...devices['Desktop Chrome'],
  storageState: storageStateForRunner,
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
