import path from 'node:path';

import { expect, test } from '@playwright/test';

import {
  PCC_DEFAULT_EVIDENCE_OUTPUT_RELATIVE_TO_REPO,
  PCC_DEFAULT_LIVE_PAGE_URL,
  PCC_DEFAULT_LIVE_SITE_URL,
  PCC_DEFAULT_STORAGE_STATE_RELATIVE_TO_HOME,
  PCC_PACKAGE_SOLUTION_RELATIVE_PATH,
  resolvePccLiveEnv,
} from './pcc-live.env';

const SYNTHETIC_REPO_ROOT = path.resolve('/synthetic/repo');
const SYNTHETIC_HOME_DIR = path.resolve('/synthetic/home');
const PACKAGE_SOLUTION_ABS = path.join(SYNTHETIC_REPO_ROOT, PCC_PACKAGE_SOLUTION_RELATIVE_PATH);
const PACKAGE_JSON_ABS = path.join(SYNTHETIC_REPO_ROOT, 'package.json');
const DEFAULT_STORAGE_STATE_ABS = path.join(
  SYNTHETIC_HOME_DIR,
  PCC_DEFAULT_STORAGE_STATE_RELATIVE_TO_HOME,
);
const DEFAULT_EVIDENCE_DIR_ABS = path.normalize(
  path.join(SYNTHETIC_REPO_ROOT, PCC_DEFAULT_EVIDENCE_OUTPUT_RELATIVE_TO_REPO),
);

const VALID_PACKAGE_SOLUTION = JSON.stringify({
  solution: {
    version: '1.0.0.17',
    features: [{ title: 'Project Control Center', version: '1.0.0.17' }],
  },
});

interface FakeFsOptions {
  readonly storageStateExists?: boolean;
  readonly packageSolutionContents?: string | null;
  readonly extraFiles?: ReadonlyArray<string>;
  readonly missingPackageJson?: boolean;
}

interface FakeFs {
  readonly fileExists: (candidate: string) => boolean;
  readonly readFile: (candidate: string) => string;
  readonly readPaths: string[];
}

function makeFakeFs(options: FakeFsOptions = {}): FakeFs {
  const {
    storageStateExists = true,
    packageSolutionContents = VALID_PACKAGE_SOLUTION,
    extraFiles = [],
    missingPackageJson = false,
  } = options;

  const existsSet = new Set<string>();
  const readMap = new Map<string, string>();

  if (!missingPackageJson) {
    existsSet.add(PACKAGE_JSON_ABS);
  }
  if (packageSolutionContents !== null) {
    existsSet.add(PACKAGE_SOLUTION_ABS);
    readMap.set(PACKAGE_SOLUTION_ABS, packageSolutionContents);
  }
  if (storageStateExists) {
    existsSet.add(DEFAULT_STORAGE_STATE_ABS);
  }
  for (const extra of extraFiles) {
    existsSet.add(extra);
  }

  const readPaths: string[] = [];

  return {
    fileExists: (candidate) => existsSet.has(path.normalize(candidate)),
    readFile: (candidate) => {
      const normalized = path.normalize(candidate);
      readPaths.push(normalized);
      const got = readMap.get(normalized);
      if (got === undefined) {
        throw new Error(`fake readFile miss: ${normalized}`);
      }
      return got;
    },
    readPaths,
  };
}

test.describe('resolvePccLiveEnv', () => {
  test('defaults all five primary values when env is empty and storageState exists', () => {
    const fakeFs = makeFakeFs({ storageStateExists: true });
    const result = resolvePccLiveEnv({
      env: {},
      cwd: SYNTHETIC_REPO_ROOT,
      homeDir: SYNTHETIC_HOME_DIR,
      fileExists: fakeFs.fileExists,
      readFile: fakeFs.readFile,
    });
    expect(result.status).toBe('ready');
    expect(result.env).toBeDefined();
    expect(result.env?.siteUrl).toBe(PCC_DEFAULT_LIVE_SITE_URL);
    expect(result.env?.pageUrl).toBe(PCC_DEFAULT_LIVE_PAGE_URL);
    expect(result.env?.storageStatePath).toBe(DEFAULT_STORAGE_STATE_ABS);
    expect(result.env?.evidenceOutputDir).toBe(DEFAULT_EVIDENCE_DIR_ABS);
    expect(result.env?.expectedPackageVersion).toBe('1.0.0.17');
  });

  test('explicit env vars override every default', () => {
    const fakeFs = makeFakeFs({
      storageStateExists: true,
      extraFiles: ['/custom/auth/state.json'],
    });
    const result = resolvePccLiveEnv({
      env: {
        PCC_LIVE_SITE_URL: 'https://example.test/sites/explicit',
        PCC_LIVE_PAGE_URL: 'https://example.test/sites/explicit/SitePages/Page.aspx',
        PCC_LIVE_STORAGE_STATE: '/custom/auth/state.json',
        PCC_EVIDENCE_OUTPUT_DIR: '/custom/evidence',
        PCC_EXPECTED_PACKAGE_VERSION: '9.9.9.9',
      },
      cwd: SYNTHETIC_REPO_ROOT,
      homeDir: SYNTHETIC_HOME_DIR,
      fileExists: fakeFs.fileExists,
      readFile: fakeFs.readFile,
    });
    expect(result.status).toBe('ready');
    expect(result.env?.siteUrl).toBe('https://example.test/sites/explicit');
    expect(result.env?.pageUrl).toBe('https://example.test/sites/explicit/SitePages/Page.aspx');
    expect(result.env?.storageStatePath).toBe('/custom/auth/state.json');
    expect(result.env?.evidenceOutputDir).toBe('/custom/evidence');
    expect(result.env?.expectedPackageVersion).toBe('9.9.9.9');
  });

  test('absent default storageState returns missing-storage-state, not missing-env', () => {
    const fakeFs = makeFakeFs({ storageStateExists: false });
    const result = resolvePccLiveEnv({
      env: {},
      cwd: SYNTHETIC_REPO_ROOT,
      homeDir: SYNTHETIC_HOME_DIR,
      fileExists: fakeFs.fileExists,
      readFile: fakeFs.readFile,
    });
    expect(result.status).toBe('missing-storage-state');
    expect(result.env?.storageStatePath).toBe(DEFAULT_STORAGE_STATE_ABS);
    expect(result.message).not.toContain('missing-env');
    expect(result.message).not.toContain('cookie');
    expect(result.message).not.toContain('token');
  });

  test('expected package version derives from solution.version literal', () => {
    const fakeFs = makeFakeFs({
      packageSolutionContents: JSON.stringify({
        solution: { version: '1.0.0.42', features: [] },
      }),
    });
    const result = resolvePccLiveEnv({
      env: {},
      cwd: SYNTHETIC_REPO_ROOT,
      homeDir: SYNTHETIC_HOME_DIR,
      fileExists: fakeFs.fileExists,
      readFile: fakeFs.readFile,
    });
    expect(result.status).toBe('ready');
    expect(result.env?.expectedPackageVersion).toBe('1.0.0.42');
  });

  test('feature version mismatch returns package-version-mismatch', () => {
    const fakeFs = makeFakeFs({
      packageSolutionContents: JSON.stringify({
        solution: {
          version: '1.0.0.17',
          features: [{ title: 'PCC', version: '1.0.0.18' }],
        },
      }),
    });
    const result = resolvePccLiveEnv({
      env: {},
      cwd: SYNTHETIC_REPO_ROOT,
      homeDir: SYNTHETIC_HOME_DIR,
      fileExists: fakeFs.fileExists,
      readFile: fakeFs.readFile,
    });
    expect(result.status).toBe('package-version-mismatch');
    expect(result.message).toContain('1.0.0.18');
    expect(result.message).toContain('1.0.0.17');
  });

  test('malformed package-solution returns invalid-config without echoing raw body', () => {
    const malformed = '{ "solution": { "version": "1.0.0.17"';
    const fakeFs = makeFakeFs({ packageSolutionContents: malformed });
    const result = resolvePccLiveEnv({
      env: {},
      cwd: SYNTHETIC_REPO_ROOT,
      homeDir: SYNTHETIC_HOME_DIR,
      fileExists: fakeFs.fileExists,
      readFile: fakeFs.readFile,
    });
    expect(result.status).toBe('invalid-config');
    expect(result.message).not.toContain(malformed);
  });

  test('missing package-solution file returns invalid-config', () => {
    const fakeFs = makeFakeFs({ packageSolutionContents: null });
    const result = resolvePccLiveEnv({
      env: {},
      cwd: SYNTHETIC_REPO_ROOT,
      homeDir: SYNTHETIC_HOME_DIR,
      fileExists: fakeFs.fileExists,
      readFile: fakeFs.readFile,
    });
    expect(result.status).toBe('invalid-config');
  });

  test('PCC_LIVE_ENABLE_CONDITIONAL only enables on case-insensitive "true"', () => {
    const buildResult = (rawValue: string | undefined) => {
      const fakeFs = makeFakeFs();
      const env: NodeJS.ProcessEnv =
        rawValue === undefined ? {} : { PCC_LIVE_ENABLE_CONDITIONAL: rawValue };
      return resolvePccLiveEnv({
        env,
        cwd: SYNTHETIC_REPO_ROOT,
        homeDir: SYNTHETIC_HOME_DIR,
        fileExists: fakeFs.fileExists,
        readFile: fakeFs.readFile,
      });
    };
    expect(buildResult(undefined).env?.conditionalEnabled).toBe(false);
    expect(buildResult('').env?.conditionalEnabled).toBe(false);
    expect(buildResult('false').env?.conditionalEnabled).toBe(false);
    expect(buildResult('0').env?.conditionalEnabled).toBe(false);
    expect(buildResult('yes').env?.conditionalEnabled).toBe(false);
    expect(buildResult('true').env?.conditionalEnabled).toBe(true);
    expect(buildResult('TRUE').env?.conditionalEnabled).toBe(true);
    expect(buildResult('  True  ').env?.conditionalEnabled).toBe(true);
  });

  test('storageState file is never read when missing — message contains no file contents', () => {
    const fakeFs = makeFakeFs({ storageStateExists: false });
    const result = resolvePccLiveEnv({
      env: {},
      cwd: SYNTHETIC_REPO_ROOT,
      homeDir: SYNTHETIC_HOME_DIR,
      fileExists: fakeFs.fileExists,
      readFile: fakeFs.readFile,
    });
    expect(result.status).toBe('missing-storage-state');
    expect(fakeFs.readPaths).not.toContain(path.normalize(DEFAULT_STORAGE_STATE_ABS));
    expect(result.message).not.toMatch(/cookie|token|session|auth=|secret/i);
  });

  test('invalid-config message does not include cookies/tokens/auth/session contents', () => {
    const sensitive = JSON.stringify({
      cookies: [{ name: 'sessionToken', value: 'eyJSECRET' }],
      origins: [],
    });
    const fakeFs = makeFakeFs({ packageSolutionContents: sensitive });
    const result = resolvePccLiveEnv({
      env: {},
      cwd: SYNTHETIC_REPO_ROOT,
      homeDir: SYNTHETIC_HOME_DIR,
      fileExists: fakeFs.fileExists,
      readFile: fakeFs.readFile,
    });
    expect(result.status).toBe('invalid-config');
    expect(result.message).not.toContain('eyJSECRET');
    expect(result.message).not.toContain('sessionToken');
  });

  test('repo-root resolution walks upward from a nested cwd', () => {
    const nestedCwd = path.join(SYNTHETIC_REPO_ROOT, 'apps/project-control-center/src/foo');
    const fakeFs = makeFakeFs();
    const result = resolvePccLiveEnv({
      env: {},
      cwd: nestedCwd,
      homeDir: SYNTHETIC_HOME_DIR,
      fileExists: fakeFs.fileExists,
      readFile: fakeFs.readFile,
    });
    expect(result.status).toBe('ready');
    expect(result.env?.evidenceOutputDir).toBe(DEFAULT_EVIDENCE_DIR_ABS);
  });

  test('explicit expected version overrides default but internal mismatch still surfaces', () => {
    const fakeFs = makeFakeFs({
      packageSolutionContents: JSON.stringify({
        solution: {
          version: '1.0.0.17',
          features: [{ title: 'PCC', version: '1.0.0.18' }],
        },
      }),
    });
    const result = resolvePccLiveEnv({
      env: { PCC_EXPECTED_PACKAGE_VERSION: '9.9.9.9' },
      cwd: SYNTHETIC_REPO_ROOT,
      homeDir: SYNTHETIC_HOME_DIR,
      fileExists: fakeFs.fileExists,
      readFile: fakeFs.readFile,
    });
    expect(result.status).toBe('package-version-mismatch');
    expect(result.message).toContain('1.0.0.18');
  });

  test('repo-root unresolvable returns invalid-config', () => {
    const fakeFs = makeFakeFs({
      missingPackageJson: true,
      packageSolutionContents: null,
    });
    const result = resolvePccLiveEnv({
      env: {},
      cwd: '/totally/unrelated/dir',
      homeDir: SYNTHETIC_HOME_DIR,
      fileExists: fakeFs.fileExists,
      readFile: fakeFs.readFile,
    });
    expect(result.status).toBe('invalid-config');
    expect(result.message).toContain('repo root');
  });
});
