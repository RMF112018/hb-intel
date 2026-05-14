import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { loadEnvFileIntoProcessEnv } from './load-env-file';

const TEMP_KEYS = [
  'LOAD_ENV_TEST_A',
  'LOAD_ENV_TEST_B',
  'LOAD_ENV_TEST_C',
  'LOAD_ENV_TEST_QUOTED',
  'LOAD_ENV_TEST_EQUALS',
  'LOAD_ENV_TEST_EXPLICIT',
];

let tmpDir: string;

function writeEnv(contents: string): string {
  const file = path.join(tmpDir, '.env');
  fs.writeFileSync(file, contents, 'utf8');
  return file;
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'load-env-file-'));
  for (const key of TEMP_KEYS) {
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of TEMP_KEYS) {
    delete process.env[key];
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('loadEnvFileIntoProcessEnv', () => {
  it('parses KEY=VALUE lines into process.env', () => {
    const result = loadEnvFileIntoProcessEnv(
      writeEnv('LOAD_ENV_TEST_A=alpha\nLOAD_ENV_TEST_B=beta\n'),
    );
    expect(process.env.LOAD_ENV_TEST_A).toBe('alpha');
    expect(process.env.LOAD_ENV_TEST_B).toBe('beta');
    expect(result.loaded).toEqual(['LOAD_ENV_TEST_A', 'LOAD_ENV_TEST_B']);
    expect(result.skipped).toEqual([]);
  });

  it('ignores blank lines and # comment lines', () => {
    const result = loadEnvFileIntoProcessEnv(
      writeEnv('# a comment\n\nLOAD_ENV_TEST_A=alpha\n   \n# trailing comment\n'),
    );
    expect(process.env.LOAD_ENV_TEST_A).toBe('alpha');
    expect(result.loaded).toEqual(['LOAD_ENV_TEST_A']);
  });

  it('strips matched surrounding single or double quotes from the value', () => {
    loadEnvFileIntoProcessEnv(
      writeEnv('LOAD_ENV_TEST_A="double quoted"\nLOAD_ENV_TEST_QUOTED=\'single quoted\'\n'),
    );
    expect(process.env.LOAD_ENV_TEST_A).toBe('double quoted');
    expect(process.env.LOAD_ENV_TEST_QUOTED).toBe('single quoted');
  });

  it('preserves values that themselves contain "="', () => {
    loadEnvFileIntoProcessEnv(writeEnv('LOAD_ENV_TEST_EQUALS=api://audience=guid?x=1\n'));
    expect(process.env.LOAD_ENV_TEST_EQUALS).toBe('api://audience=guid?x=1');
  });

  it('lets an explicitly-set process.env value win over the file', () => {
    process.env.LOAD_ENV_TEST_EXPLICIT = 'from-environment';
    const result = loadEnvFileIntoProcessEnv(
      writeEnv('LOAD_ENV_TEST_EXPLICIT=from-file\nLOAD_ENV_TEST_A=alpha\n'),
    );
    expect(process.env.LOAD_ENV_TEST_EXPLICIT).toBe('from-environment');
    expect(process.env.LOAD_ENV_TEST_A).toBe('alpha');
    expect(result.loaded).toEqual(['LOAD_ENV_TEST_A']);
    expect(result.skipped).toEqual(['LOAD_ENV_TEST_EXPLICIT']);
  });

  it('is a silent no-op when the file is missing', () => {
    const result = loadEnvFileIntoProcessEnv(path.join(tmpDir, 'does-not-exist.env'));
    expect(result).toEqual({ loaded: [], skipped: [] });
  });

  it('skips malformed lines without throwing', () => {
    const result = loadEnvFileIntoProcessEnv(
      writeEnv('not-a-pair\n=missing-key\nLOAD_ENV_TEST_A=alpha\n   =also-missing-key\n'),
    );
    expect(process.env.LOAD_ENV_TEST_A).toBe('alpha');
    expect(result.loaded).toEqual(['LOAD_ENV_TEST_A']);
  });
});
