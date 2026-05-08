import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { TestType } from '@playwright/test';

import { sanitizePccLiveArtifactPath } from './pcc-live.sanitization';

export type PccLiveEnvStatus =
  | 'ready'
  | 'missing-env'
  | 'missing-storage-state'
  | 'invalid-config'
  | 'package-version-mismatch';

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

export interface PccLiveEnvResolverInput {
  readonly env?: NodeJS.ProcessEnv;
  readonly cwd?: string;
  readonly homeDir?: string;
  readonly fileExists?: (path: string) => boolean;
  readonly readFile?: (path: string) => string;
}

export const PCC_DEFAULT_LIVE_SITE_URL =
  'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject';

export const PCC_DEFAULT_LIVE_PAGE_URL =
  'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/CollabHome.aspx';

export const PCC_DEFAULT_STORAGE_STATE_RELATIVE_TO_HOME =
  '.pcc-live-auth/pcc-live-storage-state.json';

export const PCC_DEFAULT_EVIDENCE_OUTPUT_RELATIVE_TO_REPO = 'docs/architecture/evidence/pcc-live';

export const PCC_PACKAGE_SOLUTION_RELATIVE_PATH =
  'apps/project-control-center/config/package-solution.json';

const REPO_ROOT_ANCHORS = ['package.json', PCC_PACKAGE_SOLUTION_RELATIVE_PATH] as const;
const MAX_REPO_ROOT_WALK_DEPTH = 32;

function trimEnvValue(envBag: NodeJS.ProcessEnv, name: string): string | undefined {
  const value = envBag[name];
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseConditionalEnabled(envBag: NodeJS.ProcessEnv): boolean {
  const value = trimEnvValue(envBag, 'PCC_LIVE_ENABLE_CONDITIONAL');
  if (!value) return false;
  return value.toLowerCase() === 'true';
}

function findRepoRoot(
  startCwd: string,
  fileExists: (candidate: string) => boolean,
): string | undefined {
  let dir = path.resolve(startCwd);
  for (let depth = 0; depth < MAX_REPO_ROOT_WALK_DEPTH; depth += 1) {
    const allAnchorsPresent = REPO_ROOT_ANCHORS.every((anchor) =>
      fileExists(path.join(dir, anchor)),
    );
    if (allAnchorsPresent) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
  return undefined;
}

interface PackageSolutionDerivation {
  readonly status: 'ok' | 'invalid-config' | 'package-version-mismatch';
  readonly version?: string;
  readonly message: string;
}

function derivePackageSolutionVersion(
  packageSolutionPath: string,
  readFile: (candidate: string) => string,
): PackageSolutionDerivation {
  const safePath = sanitizePccLiveArtifactPath(PCC_PACKAGE_SOLUTION_RELATIVE_PATH);
  let raw: string;
  try {
    raw = readFile(packageSolutionPath);
  } catch {
    return {
      status: 'invalid-config',
      message: `PCC live lane could not read package-solution at ${safePath}.`,
    };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      status: 'invalid-config',
      message: `PCC live lane package-solution at ${safePath} is malformed JSON.`,
    };
  }
  const solution =
    parsed && typeof parsed === 'object' ? (parsed as { solution?: unknown }).solution : undefined;
  if (!solution || typeof solution !== 'object') {
    return {
      status: 'invalid-config',
      message: `PCC live lane package-solution at ${safePath} is missing solution object.`,
    };
  }
  const versionField = (solution as { version?: unknown }).version;
  if (typeof versionField !== 'string' || versionField.trim().length === 0) {
    return {
      status: 'invalid-config',
      message: `PCC live lane package-solution at ${safePath} is missing solution.version.`,
    };
  }
  const solutionVersion = versionField.trim();
  const featuresField = (solution as { features?: unknown }).features;
  if (Array.isArray(featuresField)) {
    for (const feature of featuresField) {
      if (!feature || typeof feature !== 'object') continue;
      const featureVersion = (feature as { version?: unknown }).version;
      if (typeof featureVersion !== 'string') continue;
      if (featureVersion.trim() !== solutionVersion) {
        return {
          status: 'package-version-mismatch',
          version: solutionVersion,
          message: `PCC live lane package-solution at ${safePath} has feature version ${featureVersion.trim()} that does not match solution version ${solutionVersion}.`,
        };
      }
    }
  }
  return {
    status: 'ok',
    version: solutionVersion,
    message: `PCC live lane package-solution version resolved to ${solutionVersion}.`,
  };
}

export function resolvePccLiveEnv(input: PccLiveEnvResolverInput = {}): PccLiveEnvCheck {
  const envBag = input.env ?? process.env;
  const cwd = input.cwd ?? process.cwd();
  const homeDir = input.homeDir ?? os.homedir();
  const fileExists = input.fileExists ?? fs.existsSync;
  const readFile = input.readFile ?? ((p: string) => fs.readFileSync(p, 'utf8'));

  const repoRoot = findRepoRoot(cwd, fileExists);
  if (!repoRoot) {
    return {
      status: 'invalid-config',
      missingKeys: [],
      message:
        'PCC live lane could not resolve repo root from cwd; package.json and package-solution.json anchors not found.',
    };
  }

  const packageSolutionPath = path.join(repoRoot, PCC_PACKAGE_SOLUTION_RELATIVE_PATH);
  const derivation = derivePackageSolutionVersion(packageSolutionPath, readFile);
  if (derivation.status === 'invalid-config') {
    return {
      status: 'invalid-config',
      missingKeys: [],
      message: derivation.message,
    };
  }
  if (derivation.status === 'package-version-mismatch') {
    return {
      status: 'package-version-mismatch',
      missingKeys: [],
      message: derivation.message,
    };
  }

  const defaultStorageStatePath = path.join(homeDir, PCC_DEFAULT_STORAGE_STATE_RELATIVE_TO_HOME);
  const defaultEvidenceOutputDir = path.normalize(
    path.join(repoRoot, PCC_DEFAULT_EVIDENCE_OUTPUT_RELATIVE_TO_REPO),
  );

  const env: PccLiveEnv = {
    siteUrl: trimEnvValue(envBag, 'PCC_LIVE_SITE_URL') ?? PCC_DEFAULT_LIVE_SITE_URL,
    pageUrl: trimEnvValue(envBag, 'PCC_LIVE_PAGE_URL') ?? PCC_DEFAULT_LIVE_PAGE_URL,
    storageStatePath: trimEnvValue(envBag, 'PCC_LIVE_STORAGE_STATE') ?? defaultStorageStatePath,
    evidenceOutputDir: trimEnvValue(envBag, 'PCC_EVIDENCE_OUTPUT_DIR') ?? defaultEvidenceOutputDir,
    expectedPackageVersion:
      trimEnvValue(envBag, 'PCC_EXPECTED_PACKAGE_VERSION') ?? (derivation.version as string),
    braveExecutablePath: trimEnvValue(envBag, 'PCC_LIVE_BRAVE_EXECUTABLE_PATH'),
    editPageUrl: trimEnvValue(envBag, 'PCC_LIVE_EDIT_PAGE_URL'),
    unauthorizedStorageStatePath: trimEnvValue(envBag, 'PCC_LIVE_UNAUTHORIZED_STORAGE_STATE'),
    unauthorizedPageUrl: trimEnvValue(envBag, 'PCC_LIVE_UNAUTHORIZED_PAGE_URL'),
    conditionalEnabled: parseConditionalEnabled(envBag),
  };

  if (!fileExists(env.storageStatePath)) {
    return {
      status: 'missing-storage-state',
      missingKeys: [],
      message: 'PCC live lane storageState file not found at configured or default path.',
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

export function checkPccLiveEnv(): PccLiveEnvCheck {
  return resolvePccLiveEnv();
}

export function skipIfMissingPccLiveEnv(test: TestType<unknown, unknown>): PccLiveEnvCheck {
  const check = checkPccLiveEnv();
  if (check.status !== 'ready') {
    test.skip(true, check.message);
  }
  return check;
}
