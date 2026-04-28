import { describe, it, expect } from 'vitest';
import {
  PCC_FORBIDDEN_FIXTURE_KEYS,
  findForbiddenFixtureKeys,
} from './PccFixtureGuards.js';

describe('PccFixtureGuards', () => {
  it('returns no violations for clean fixture-shaped objects', () => {
    const clean = {
      id: 'fixture-1',
      title: 'sample',
      nested: {
        items: [{ id: 'item-1', state: 'pending' }],
      },
    };
    expect(findForbiddenFixtureKeys(clean)).toEqual([]);
  });

  it('returns violations when forbidden credential keys appear', () => {
    const dirty = {
      id: 'x',
      clientSecret: 'leak',
    };
    const violations = findForbiddenFixtureKeys(dirty);
    expect(violations).toEqual(['clientSecret:forbidden-key']);
  });

  it('returns violations when forbidden mutation-intent keys appear', () => {
    const dirty = {
      id: 'x',
      execute: () => 'side-effect',
      apply: 'patch',
    };
    const violations = findForbiddenFixtureKeys(dirty);
    expect(violations).toContain('execute:forbidden-key');
    expect(violations).toContain('apply:forbidden-key');
  });

  it('returns violations for narrow mirror/sync-execution keys', () => {
    const dirty = {
      id: 'x',
      mirrorRecords: [],
      syncToken: 'leak',
      writeBack: true,
    };
    const violations = findForbiddenFixtureKeys(dirty);
    expect(violations).toContain('mirrorRecords:forbidden-key');
    expect(violations).toContain('syncToken:forbidden-key');
    expect(violations).toContain('writeBack:forbidden-key');
  });

  it('does NOT flag read-model health vocabulary like syncHealth/lastSyncStatus', () => {
    const readModelOk = {
      systemId: 'procore',
      syncHealth: 'healthy',
      lastSyncStatus: 'Success',
      procoreSyncEnabled: true,
      lastSyncedAtUtc: '2026-04-26T06:00:00Z',
      syncProfile: 'MVP-mapping-only',
      mySync: 'fine',
    };
    expect(findForbiddenFixtureKeys(readModelOk)).toEqual([]);
  });

  it('flag matching is case-sensitive (substrings of forbidden names are not flagged)', () => {
    const ok = {
      writeBackup: 'unrelated',
      mirrorRecord: 'singular form, not forbidden',
      syncTokenizer: 'unrelated',
    };
    expect(findForbiddenFixtureKeys(ok)).toEqual([]);
  });

  it('walks nested objects and arrays with key paths', () => {
    const dirty = {
      deeply: {
        nested: {
          accessToken: 'leak',
        },
      },
      list: [
        { id: 'a', refreshToken: 'leak' },
        { id: 'b' },
      ],
    };
    const violations = findForbiddenFixtureKeys(dirty);
    expect(violations).toContain('deeply.nested.accessToken:forbidden-key');
    expect(violations).toContain('list[0].refreshToken:forbidden-key');
  });

  it('flags credential-shaped string values via the regex array', () => {
    const dirty = {
      headers: 'authorization: Bearer abcdefghijklmno',
    };
    const violations = findForbiddenFixtureKeys(dirty);
    expect(violations).toContain('headers:forbidden-value-pattern');
  });

  it('skips primitives and unsupported container types', () => {
    expect(findForbiddenFixtureKeys('plain-string')).toEqual([]);
    expect(findForbiddenFixtureKeys(42)).toEqual([]);
    expect(findForbiddenFixtureKeys(null)).toEqual([]);
    expect(findForbiddenFixtureKeys(undefined)).toEqual([]);
    expect(findForbiddenFixtureKeys(new Date('2026-04-26T06:00:00Z'))).toEqual([]);
  });

  it('exported forbidden-key list has no duplicates', () => {
    expect(new Set(PCC_FORBIDDEN_FIXTURE_KEYS).size).toBe(PCC_FORBIDDEN_FIXTURE_KEYS.length);
  });
});
