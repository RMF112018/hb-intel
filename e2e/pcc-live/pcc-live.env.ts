import fs from 'node:fs';
import type { TestType } from '@playwright/test';

export type PccLiveEnvStatus = 'ready' | 'missing-env' | 'missing-storage-state';

export interface PccLiveEnv {
  siteUrl: string;
  pageUrl: string;
  storageStatePath: string;
  evidenceOutputDir: string;
  expectedPackageVersion: string;
  braveExecutablePath?: string;
  editPageUrl?: string;
  unauthorizedStorageStatePath?: string;
  unauthorizedPageUrl?: string;
  conditionalEnabled: boolean;
}

export interface PccLiveEnvCheck {
  status: PccLiveEnvStatus;
  env?: PccLiveEnv;
  missingKeys: string[];
  message: string;
}

const REQUIRED_ENV_KEYS = [
  'PCC_LIVE_SITE_URL',
  'PCC_LIVE_PAGE_URL',
  'PCC_LIVE_STORAGE_STATE',
  'PCC_EVIDENCE_OUTPUT_DIR',
  'PCC_EXPECTED_PACKAGE_VERSION',
] as const;

function getTrimmedEnv(name: string): string | undefined {
  const value = process.env[name];
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseConditionalEnabled(): boolean {
  const value = getTrimmedEnv('PCC_LIVE_ENABLE_CONDITIONAL');
  if (!value) return false;
  return value.toLowerCase() === 'true';
}

export function checkPccLiveEnv(): PccLiveEnvCheck {
  const missingKeys = REQUIRED_ENV_KEYS.filter((name) => !getTrimmedEnv(name));

  if (missingKeys.length > 0) {
    return {
      status: 'missing-env',
      missingKeys,
      message: `PCC live lane missing required env vars: ${missingKeys.join(', ')}`,
    };
  }

  const env: PccLiveEnv = {
    siteUrl: getTrimmedEnv('PCC_LIVE_SITE_URL') as string,
    pageUrl: getTrimmedEnv('PCC_LIVE_PAGE_URL') as string,
    storageStatePath: getTrimmedEnv('PCC_LIVE_STORAGE_STATE') as string,
    evidenceOutputDir: getTrimmedEnv('PCC_EVIDENCE_OUTPUT_DIR') as string,
    expectedPackageVersion: getTrimmedEnv('PCC_EXPECTED_PACKAGE_VERSION') as string,
    braveExecutablePath: getTrimmedEnv('PCC_LIVE_BRAVE_EXECUTABLE_PATH'),
    editPageUrl: getTrimmedEnv('PCC_LIVE_EDIT_PAGE_URL'),
    unauthorizedStorageStatePath: getTrimmedEnv('PCC_LIVE_UNAUTHORIZED_STORAGE_STATE'),
    unauthorizedPageUrl: getTrimmedEnv('PCC_LIVE_UNAUTHORIZED_PAGE_URL'),
    conditionalEnabled: parseConditionalEnabled(),
  };

  if (!fs.existsSync(env.storageStatePath)) {
    return {
      status: 'missing-storage-state',
      missingKeys: [],
      message: `PCC live lane storageState file not found at configured path.`,
      env,
    };
  }

  return {
    status: 'ready',
    env,
    missingKeys: [],
    message: 'PCC live lane env is configured.',
  };
}

export function skipIfMissingPccLiveEnv(test: TestType<unknown, unknown>): PccLiveEnvCheck {
  const check = checkPccLiveEnv();
  if (check.status !== 'ready') {
    test.skip(true, check.message);
  }
  return check;
}
